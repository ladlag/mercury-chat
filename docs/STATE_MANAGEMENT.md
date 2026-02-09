# 状态管理文档

## 概述

Mercury Chat 使用 [Pinia](https://pinia.vuejs.org/) 作为状态管理库，采用模块化设计，按功能域划分不同的 store。

## Store 架构

### Store 目录结构

```
src/store/
├── index.ts              # Store 统一导出
├── message-store.ts      # 消息管理（核心）
├── history-store.ts      # 历史对话管理
├── model-store.ts        # AI 模型配置
├── status-store.ts       # 聊天状态管理
├── theme-store.ts        # 主题管理
├── lang-store.ts         # 语言设置
├── layout.ts             # 布局状态
├── chat-mode.store.ts    # 聊天模式
└── common-store.ts       # 通用状态
```

### 各 Store 职责

| Store | 职责 | 主要状态 |
|-------|------|----------|
| message-store | 管理当前会话的消息流 | messages, messageChangeCount |
| history-store | 管理历史对话列表 | historyList, activeHistoryId |
| model-store | 管理 AI 模型配置 | currentModel, modelList |
| status-store | 管理聊天状态 | startChat, currentChatId |
| theme-store | 管理主题设置 | theme, currentCustomTheme |
| lang-store | 管理语言设置 | currentLang |
| layout | 管理布局状态 | sidebarCollapsed |
| common-store | 通用状态 | isExpand |

## 核心 Store 详解

### 1. Message Store (消息管理)

**文件**: `src/store/message-store.ts`

这是整个应用的核心 store，负责管理当前会话的消息流和 AI 交互。

#### 状态定义

```typescript
export const useChatMessageStore = defineStore("chat-message", () => {
  const messages = ref<IMessage[]>([]);           // 当前会话的消息列表
  const messageChangeCount = ref(0);              // 消息变更计数（触发视图更新）
  let client: LLMService;                         // AI 服务客户端
  
  // ... 方法
});
```

#### 消息类型

```typescript
interface IMessage {
    from: "user" | "assistant";                   // 消息来源
    content: string;                               // 消息内容
    reasoning_content?: string;                    // 推理内容（如 o1 模型）
    loading?: boolean;                             // 是否正在加载
    complete?: boolean;                            // 是否完成
    avatarPosition: "side-left" | "side-right";   // 头像位置
    avatarConfig: IAvatarConfig;                   // 头像配置
    startTime?: number;                            // 开始时间
    endTime?: number;                              // 结束时间
}
```

#### 核心方法：ask()

发送用户问题并获取 AI 回答：

```typescript
function ask(question: string, answer?: string) {
    if (question === "") {
        return;
    }
    
    // 1. 如果是新对话，初始化状态
    if (!messages.value.length) {
        chatStatusStore.startChat = true;
        chatStatusStore.newChatId();
    }
    
    // 2. 保存到历史记录
    chatHistoryStore.addHistory(
        chatStatusStore.currentChatId,
        dayjs().format("YYYY-MM-DD HH:mm"),
        messages.value,
        chatModelStore.currentModel
    );
    
    // 3. 添加用户消息
    messages.value.push({
        from: "user",
        content: question,
        avatarPosition: "side-right",
        avatarConfig: { ...customerAvatar },
    });
    
    messageChangeCount.value++;
    
    // 4. 获取 AI 回答
    getAIAnswer(answer ?? question);
}
```

#### 核心方法：getAIAnswer()

处理 AI 回答的逻辑，支持 Mock 模式和真实 API：

```typescript
const getAIAnswer = (content: string) => {
    // 1. 添加 AI 消息占位符
    messages.value.push({
        from: "assistant",
        content: "",
        reasoning_content: "",
        avatarPosition: "side-left",
        avatarConfig: { ...aiModelAvatar },
        loading: true,
        complete: false,
    });
    
    // 2. Mock 模式：模拟流式返回
    if (MODEL_CONFIGS.enableMock) {
        setTimeout(async () => {
            messages.value.at(-1).loading = false;
            
            // 模拟打字效果
            for (let i = 0; i < content.length; ) {
                await new Promise((r) => setTimeout(r, 300 * Math.random()));
                const step = Math.max(5, Math.floor(content.length / 20) * Math.random());
                i += step;
                messages.value[messages.value.length - 1].content = content.slice(0, i);
                messageChangeCount.value++;
            }
            
            // 保存到历史
            chatHistoryStore.addHistory(...);
        }, 1000);
    } 
    // 3. 真实 API 模式
    else {
        const request = {
            content,
            streamOptions: {
                onMessage: onMessageChange,      // 流式更新回调
                onComplete: onMessageComplete,    // 完成回调
            },
            messages: messages.value,
        };
        
        // 创建 AI 客户端
        client = new Client(
            chatModelStore.currentModel.clientKey,
            chatModelStore.currentModel.providerKey
        ).client;
        
        // 发起聊天请求
        client.chat(request).then((res) => {
            messages.value.at(-1).loading = false;
            messages.value[messages.value.length - 1].content = res;
            chatHistoryStore.addHistory(...);
        });
    }
};
```

#### 流式响应处理

```typescript
// 消息更新回调（流式）
const onMessageChange = (msg: ChunkResponse) => {
    messages.value.at(-1).loading = false;
    const currentMessage = messages.value[messages.value.length - 1];
    
    // 记录开始时间
    if (!currentMessage.startTime) {
        currentMessage.startTime = Date.now();
    }
    
    // 记录结束时间
    if (!currentMessage.endTime && msg.content) {
        currentMessage.endTime = Date.now();
    }
    
    // 累加内容
    currentMessage.reasoning_content += msg.reasoning_content || '';
    currentMessage.content += msg.content || '';
    messageChangeCount.value++;
};

// 消息完成回调
const onMessageComplete = () => {
    messages.value.at(-1).loading = false;
    messages.value.at(-1).complete = true;
};
```

### 2. History Store (历史记录)

**文件**: `src/store/history-store.ts`

管理历史对话列表，支持对话的增删查改。

#### 状态定义

```typescript
export const useChatHistoryStore = defineStore("chat-history", () => {
    const historyList = ref<HistoryList>([]);     // 历史对话列表
    const activeHistoryId = ref<string>("");      // 当前激活的对话 ID
    
    // ... 方法
});
```

#### 历史记录类型

```typescript
interface HistoryItem {
    chatId: string;              // 对话 ID
    chatModel?: ModelOption;     // 使用的模型
    updateDate: string;          // 更新日期
    updateTime: string;          // 更新时间
    messages: IMessage[];        // 消息列表
}

type HistoryList = HistoryItem[];
```

#### 添加或更新历史记录

```typescript
const addHistory = (
    chatId: string,
    date: string,
    messages: IMessage[],
    chatModel?: ModelOption
) => {
    const index = historyList.value.findIndex((item) => item.chatId === chatId);
    const [d, time] = date.split(" ");
    
    setActiveHistoryId(chatId);
    
    // 更新已存在的记录
    if (index !== -1) {
        historyList.value[index].messages = messages;
        historyList.value[index].updateDate = d;
        historyList.value[index].updateTime = time;
        historyList.value[index].chatModel = chatModel;
    } 
    // 添加新记录（插入到列表开头）
    else {
        historyList.value.unshift({
            chatId,
            chatModel,
            updateDate: d,
            updateTime: time,
            messages,
        });
    }
};
```

#### 删除历史记录

```typescript
const deleteHistory = (chatId: string) => {
    const index = historyList.value.findIndex((item) => item.chatId === chatId);
    historyList.value.splice(index, 1);
};
```

### 3. Model Store (模型管理)

**文件**: `src/store/model-store.ts`

管理 AI 模型的配置和选择。

```typescript
export const useChatModelStore = defineStore("chat-model", () => {
    const currentModel = ref<ModelOption | null>(null);    // 当前使用的模型
    const modelList = ref<ModelOption[]>([]);              // 可用模型列表
    
    const setCurrentModel = (model: ModelOption) => {
        currentModel.value = model;
    };
    
    const addModel = (model: ModelOption) => {
        modelList.value.push(model);
    };
    
    return { currentModel, modelList, setCurrentModel, addModel };
});
```

#### 模型选项类型

```typescript
interface ModelOption {
    id: string;                  // 模型 ID
    name: string;                // 模型名称
    clientKey: string;           // 客户端标识
    providerKey: string;         // 提供商标识
    icon?: string;               // 图标
    description?: string;        // 描述
}
```

### 4. Status Store (状态管理)

**文件**: `src/store/status-store.ts`

管理聊天的全局状态。

```typescript
export const useChatStatusStore = defineStore("chat-status", () => {
    const startChat = ref(false);                  // 是否开始对话
    const currentChatId = ref<string>("");         // 当前对话 ID
    
    const newChatId = () => {
        currentChatId.value = `chat-${Date.now()}`;
    };
    
    const resetChat = () => {
        startChat.value = false;
        currentChatId.value = "";
    };
    
    return { startChat, currentChatId, newChatId, resetChat };
});
```

### 5. Theme Store (主题管理)

**文件**: `src/store/theme-store.ts`

管理应用主题（浅色/深色/自定义）。

```typescript
export const useThemeStore = defineStore("theme", () => {
    const theme = ref<ThemeEnum>(ThemeEnum.Light);           // 当前主题
    const currentCustomTheme = ref<CustomTheme | null>(null); // 自定义主题配置
    
    const setTheme = (newTheme: ThemeEnum) => {
        theme.value = newTheme;
    };
    
    const setCustomTheme = (customTheme: CustomTheme) => {
        currentCustomTheme.value = customTheme;
    };
    
    return { theme, currentCustomTheme, setTheme, setCustomTheme };
});
```

#### 主题类型

```typescript
enum ThemeEnum {
    Light = "light",
    Dark = "dark",
    Custom = "custom",
}

interface CustomTheme {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    // ... 更多自定义属性
}
```

### 6. Lang Store (语言管理)

**文件**: `src/store/lang-store.ts`

管理应用语言（中文/英文）。

```typescript
export const useLangStore = defineStore("lang", () => {
    const currentLang = ref<LangType>(LangType.CN);
    
    const updateCurrentLang = (lang: LangType) => {
        currentLang.value = lang;
    };
    
    return { currentLang, updateCurrentLang };
});
```

#### 语言类型

```typescript
enum LangType {
    CN = "cn",
    EN = "en",
}
```

### 7. Common Store (通用状态)

**文件**: `src/store/common-store.ts`

存储一些通用的 UI 状态。

```typescript
export const useCommonStore = defineStore("common", () => {
    const isExpand = ref(true);   // 侧边栏是否展开
    
    return { isExpand };
});
```

## Store 使用模式

### 在组件中使用 Store

```vue
<script setup lang="ts">
import { useChatMessageStore, useChatHistoryStore } from "@/store";

// 获取 store 实例
const messageStore = useChatMessageStore();
const historyStore = useChatHistoryStore();

// 使用状态
const messages = computed(() => messageStore.messages);
const historyList = computed(() => historyStore.historyList);

// 调用方法
const sendMessage = (content: string) => {
    messageStore.ask(content);
};
</script>
```

### Store 之间的协作

Store 之间可以相互引用和调用：

```typescript
export const useChatMessageStore = defineStore("chat-message", () => {
    // 引用其他 store
    const chatStatusStore = useChatStatusStore();
    const chatHistoryStore = useChatHistoryStore();
    const chatModelStore = useChatModelStore();
    
    function ask(question: string) {
        // 使用其他 store 的状态
        if (!messages.value.length) {
            chatStatusStore.startChat = true;
            chatStatusStore.newChatId();
        }
        
        // 调用其他 store 的方法
        chatHistoryStore.addHistory(
            chatStatusStore.currentChatId,
            // ...
        );
    }
    
    return { ask };
});
```

## 隔离存储机制

对于需要独立会话的场景（如自定义 Chat 能力），提供了隔离存储机制。

### Chat Storage (chat-storage.ts)

基于 localStorage 的独立存储：

```typescript
export function useChatStorage(chatId: string) {
    const storageKey = `chat-storage:${chatId}`;
    
    // 获取所有会话
    const getSessions = (): Session[] => {
        const data = localStorage.getItem(storageKey);
        return data ? JSON.parse(data).sessions : [];
    };
    
    // 创建新会话
    const createSession = (sessionId: string) => {
        const sessions = getSessions();
        sessions.push({
            id: sessionId,
            createdAt: Date.now(),
            messages: [],
        });
        saveSessions(sessions);
    };
    
    // 添加消息
    const addMessage = (sessionId: string, message: Message) => {
        const sessions = getSessions();
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            session.messages.push(message);
            saveSessions(sessions);
        }
    };
    
    // 获取消息列表
    const getMessages = (sessionId: string): Message[] => {
        const sessions = getSessions();
        const session = sessions.find(s => s.id === sessionId);
        return session?.messages || [];
    };
    
    return {
        getSessions,
        createSession,
        addMessage,
        getMessages,
    };
}
```

### Agent Session (agent-session.ts)

Agent 的状态管理：

```typescript
export function useAgentSession(agentId: string) {
    const key = `agent-session:${agentId}`;
    
    const data = reactive({
        input: "",
        output: "",
        tools: [] as string[],
        status: "idle" as "idle" | "running" | "done",
    });
    
    // 从 localStorage 恢复
    const saved = localStorage.getItem(key);
    if (saved) {
        Object.assign(data, JSON.parse(saved));
    }
    
    // 自动保存
    watch(data, () => {
        localStorage.setItem(key, JSON.stringify(data));
    }, { deep: true });
    
    return data;
}
```

## 持久化策略

### 全局 Store 持久化

全局 store（如 message-store, history-store）的数据在页面刷新后会丢失。如需持久化，可以：

1. 使用 Pinia 持久化插件
2. 手动保存到 localStorage
3. 与后端 API 同步

### 隔离存储持久化

隔离存储（chat-storage, agent-session）自动持久化到 localStorage：

```typescript
// 自动保存
watch(data, () => {
    localStorage.setItem(key, JSON.stringify(data));
}, { deep: true });

// 自动恢复
const saved = localStorage.getItem(key);
if (saved) {
    Object.assign(data, JSON.parse(saved));
}
```

## 最佳实践

### 1. Store 命名规范

- Store 文件名：`xxx-store.ts`
- Store ID：与功能相关的简短名称
- 导出函数：`useXxxStore`

### 2. 状态设计原则

- **单一职责**：每个 store 只管理一个功能域
- **最小化**：只存储必要的状态
- **可计算**：使用 computed 派生状态

### 3. 避免循环依赖

```typescript
// ❌ 避免
// store-a.ts
import { useStoreB } from './store-b';

// store-b.ts
import { useStoreA } from './store-a';

// ✅ 推荐
// store-a.ts
export const useStoreA = defineStore("a", () => {
    function methodA() {
        const storeB = useStoreB();  // 在方法内部引用
        // ...
    }
});
```

### 4. 类型安全

```typescript
// 为 store 定义明确的返回类型
export const useMyStore = defineStore("my-store", () => {
    const state = ref<MyState>({ /* ... */ });
    
    return {
        state,
        // ...
    } as const;  // 使用 as const 获得更好的类型推断
});
```

## 总结

Mercury Chat 的状态管理设计具有以下特点：

1. **模块化**：按功能域划分，职责清晰
2. **灵活性**：支持全局共享和局部隔离
3. **类型安全**：完整的 TypeScript 类型支持
4. **可扩展**：易于添加新的 store
5. **持久化**：支持多种持久化策略

这套状态管理架构既满足了当前的需求，又具备良好的扩展性，可以支持未来更复杂的状态管理场景。
