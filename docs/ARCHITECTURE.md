# Mercury Chat 架构文档

## 项目概述

Mercury Chat (MateChat) 是一个基于 Vue 3 + TypeScript 的 AI 聊天应用，采用了创新的能力插件化架构（Capability-driven UI Host Architecture），支持多种 Chat 和 Agent 能力的灵活扩展。

### 技术栈

- **前端框架**: Vue 3.5.13 + TypeScript 5.7.2
- **构建工具**: Vite 6.2.0
- **状态管理**: Pinia 3.0.2
- **路由**: Vue Router 4.5.0
- **UI 组件库**: Vue DevUI 1.6.32
- **国际化**: Vue I18n 11.1.2
- **AI 集成**: OpenAI SDK 5.3.0
- **核心库**: @matechat/core 1.5.2

### 项目结构

```
mercury-chat/
├── src/
│   ├── App.vue                 # 应用主入口
│   ├── main.ts                 # 应用启动文件
│   ├── capabilities/           # 能力扩展系统（核心）
│   │   ├── registry.ts        # 能力注册中心
│   │   ├── index.ts           # 能力统一导入
│   │   ├── chat/              # Chat 能力
│   │   │   ├── chat.capability.ts
│   │   │   └── ui/
│   │   ├── requirement/       # Agent 能力示例
│   │   │   ├── requirement.capability.ts
│   │   │   └── ui/
│   │   └── common/            # 公共组件和工具
│   │       ├── chat-storage.ts
│   │       ├── useIsolatedChat.ts
│   │       └── agent-session.ts
│   ├── components/            # 通用组件
│   ├── config/                # 配置文件
│   ├── hooks/                 # 组合式函数
│   ├── i18n/                  # 国际化配置
│   ├── models/                # AI 模型集成
│   ├── router/                # 路由配置
│   ├── store/                 # 状态管理
│   │   ├── message-store.ts  # 消息状态
│   │   ├── history-store.ts  # 历史记录
│   │   ├── model-store.ts    # 模型管理
│   │   └── ...
│   ├── types/                 # 类型定义
│   ├── utils/                 # 工具函数
│   └── view/                  # 页面模块
│       ├── chat-view/        # 聊天视图
│       ├── input/            # 输入组件
│       ├── history/          # 历史记录
│       ├── navbar/           # 导航栏
│       └── ...
├── public/                    # 静态资源
├── vite.config.ts            # Vite 配置
├── tsconfig.json             # TypeScript 配置
└── package.json              # 项目依赖

总计代码行数：约 4,700+ 行
```

## 核心架构设计

### 1. 能力插件化系统 (Capability System)

这是本项目的核心创新点，实现了灵活的能力扩展机制。

#### 能力定义

```typescript
export interface Capability {
    id: string;                    // 唯一标识
    kind: "chat" | "agent";        // 能力类型
    navbar: {                      // 导航栏配置
        titleKey: string;          // i18n 键
        icon: string;              // 图标路径
        order?: number;            // 排序权重
        visible?: boolean;         // 是否可见
    };
    ui: {
        main: Component;           // 主视图组件
        side?: Component;          // 侧边栏组件
        sideTitle?: string;        // 侧边栏标题
        sideWidth?: number;        // 侧边栏宽度
        sideProps?: Record<string, any>;  // 侧边栏属性
    };
    onActivate?: () => void;       // 激活时的回调
}
```

#### 注册机制

所有能力通过 `registerCapability()` 统一注册：

```typescript
// src/capabilities/index.ts
import { registerCapability } from "@/capabilities/registry";
import { ChatDefaultCapability } from "@/capabilities/chat/chat.capability";
import { RequirementAgentCapability } from "@/capabilities/requirement/requirement.capability";

registerCapability(ChatDefaultCapability);
registerCapability(RequirementAgentCapability);
```

#### 能力注册中心

使用 Map 数据结构保证能力 ID 唯一性：

```typescript
const capMap = new Map<string, Capability>();
const capabilities = shallowRef<Capability[]>([]);

export function registerCapability(cap: Capability) {
    capMap.set(cap.id, cap);  // 重复 ID 会被覆盖
    rebuildList();            // 重建排序后的列表
}
```

### 2. 应用主入口 (App.vue)

主应用采用动态组件渲染机制：

```vue
<template>
  <Layout>
    <template #header>
      <NavBar />
    </template>
    
    <template #content>
      <!-- 动态渲染当前激活能力的主视图 -->
      <component
        v-if="activeCapability"
        :is="activeCapability.ui.main"
        class="capability-main"
      />
      
      <!-- 侧边栏抽屉 -->
      <CapabilitySideDrawer
        v-if="activeSide"
        v-model:visible="sideVisible"
        :side="activeSide"
        :title="sideTitle"
      />
    </template>
  </Layout>
</template>
```

关键点：
- 使用 Vue 3 的 `<component :is>` 动态渲染不同能力的视图
- 自动切换能力时关闭侧边栏
- 保持 MateChat 原有的初始化逻辑

### 3. 状态管理架构

采用 Pinia 进行状态管理，按功能域划分：

```
store/
├── message-store.ts      # 消息管理（核心）
├── history-store.ts      # 历史对话
├── model-store.ts        # AI 模型配置
├── status-store.ts       # 聊天状态
├── theme-store.ts        # 主题管理
├── lang-store.ts         # 语言设置
├── layout.ts             # 布局状态
└── common-store.ts       # 通用状态
```

#### 消息流程 (message-store.ts)

```typescript
export const useChatMessageStore = defineStore("chat-message", () => {
  const messages = ref<IMessage[]>([]);
  
  // 发送问题
  function ask(question: string, answer?: string) {
    // 1. 添加用户消息
    messages.value.push({
      from: "user",
      content: question,
      // ...
    });
    
    // 2. 获取 AI 回答
    getAIAnswer(answer ?? question);
  }
  
  // 获取 AI 回答（支持流式和非流式）
  const getAIAnswer = (content: string) => {
    // 支持 Mock 模式或真实 API
    if (MODEL_CONFIGS.enableMock) {
      // 模拟流式数据
    } else {
      // 调用真实 OpenAI API
      client.chat(request);
    }
  };
  
  return { messages, messageChangeCount, ask };
});
```

### 4. 能力类型详解

#### Chat 能力

**场景 1：默认 Chat**
```typescript
export const ChatDefaultCapability: Capability = {
    id: "chat-default",
    kind: "chat",
    navbar: { titleKey: "navbar.chat", icon: "/logo.svg", order: 10 },
    ui: { main: MateChatDefaultView },
};
```

特点：
- 使用 MateChat 原生 ChatView
- 共享全局 store (message-store, history-store)
- 历史记录、模型、知识库全部沿用原有机制

**场景 2：隔离的 Chat**
```typescript
export const ChatSecondCapability: Capability = {
    id: "chat-second",
    kind: "chat",
    navbar: { titleKey: "navbar.chat2", icon: "/logo.svg", order: 20 },
    ui: { main: ChatSecondMain },
};
```

特点：
- 使用自定义 ChatView
- 独立的会话管理（useIsolatedChat）
- 独立的消息存储（chat-storage.ts）
- 不影响默认 Chat

#### Agent 能力

```typescript
export const RequirementAgentCapability: Capability = {
    id: "agent-requirement",
    kind: "agent",
    navbar: { titleKey: "agent.requirement", icon: "/agent-requirement.svg", order: 100 },
    ui: {
        main: RequirementMain,
        side: RequirementTools,
        sideTitle: "工具面板",
        sideWidth: 420,
    },
};
```

特点：
- Agent 不使用 ChatView，完全自定义 UI
- 有独立的工具面板（side）
- 使用 agent-session 管理状态
- 执行逻辑完全自定义

### 5. 路由与导航

项目使用动态能力切换而非传统路由：

```typescript
// config/navbar-top.config.ts
export const activeCapabilityId = ref<string>("chat-default");

// 切换能力
function switchCapability(id: string) {
    activeCapabilityId.value = id;
    const cap = capabilities.value.find(c => c.id === id);
    cap?.onActivate?.();
}
```

优势：
- 比路由更灵活
- 状态保持更简单
- 能力间切换无需路由配置

### 6. 数据隔离机制

#### 默认 Chat 的共享存储

```typescript
// 使用全局 store
const chatMessageStore = useChatMessageStore();
const chatHistoryStore = useChatHistoryStore();
```

#### 隔离 Chat 的独立存储

```typescript
// useIsolatedChat.ts
export function useIsolatedChat(chatId: string) {
    const storage = useChatStorage(chatId);
    
    const sessions = computed(() => storage.getSessions());
    const messages = computed(() => storage.getMessages(activeSessionId.value));
    
    function sendUser(content: string) {
        storage.addMessage(activeSessionId.value, {
            id: uuid(),
            role: "user",
            content,
            timestamp: Date.now(),
        });
    }
    
    return { sessions, messages, sendUser, sendAssistant, newSession };
}
```

### 7. AI 模型集成

支持多种 AI 模型提供商：

```typescript
// models/openai.ts
export class OpenAIService implements LLMService {
    async chat(request: ChatRequest): Promise<string> {
        const stream = await this.client.chat.completions.create({
            model: this.model,
            messages: convertMessages(request.messages),
            stream: true,
        });
        
        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content || "";
            request.streamOptions?.onMessage?.({ content: delta });
        }
        
        return fullContent;
    }
}
```

支持的功能：
- 流式响应
- 模型切换
- Mock 模式（开发调试）
- 可扩展其他提供商

## 设计模式与最佳实践

### 1. 组合式 API (Composition API)

全面采用 Vue 3 组合式 API：

```typescript
// hooks/use-theme.ts
export function useTheme() {
    const themeStore = useThemeStore();
    
    const initTheme = () => {
        // 初始化主题
    };
    
    const applyTheme = () => {
        // 应用主题
    };
    
    return { initTheme, applyTheme };
}
```

### 2. 关注点分离

- **UI 组件**：纯展示逻辑
- **Store**：业务状态管理
- **Hooks**：可复用逻辑
- **Models**：外部服务集成

### 3. 类型安全

完整的 TypeScript 类型定义：

```typescript
// types/type-chat-view.ts
export interface IMessage {
    from: "user" | "assistant";
    content: string;
    reasoning_content?: string;
    loading?: boolean;
    complete?: boolean;
    avatarPosition: "side-left" | "side-right";
    avatarConfig: IAvatarConfig;
    startTime?: number;
    endTime?: number;
}
```

### 4. 国际化支持

完整的中英文支持：

```typescript
// i18n/index.ts
const messages = {
    cn: { /* 中文 */ },
    en: { /* English */ }
};

export default createI18n({
    locale: "cn",
    messages,
});
```

## 扩展指南

### 添加新的 Chat 能力

1. 创建能力定义文件：
```typescript
// src/capabilities/chat/my-chat.capability.ts
export const MyCustomChat: Capability = {
    id: "chat-custom",
    kind: "chat",
    navbar: { titleKey: "navbar.custom", icon: "/custom.svg", order: 30 },
    ui: { main: MyCustomChatView },
};
```

2. 注册能力：
```typescript
// src/capabilities/index.ts
import { MyCustomChat } from "@/capabilities/chat/my-chat.capability";
registerCapability(MyCustomChat);
```

### 添加新的 Agent 能力

1. 创建 Agent 组件：
```typescript
// src/capabilities/my-agent/my-agent.capability.ts
export const MyAgent: Capability = {
    id: "agent-myagent",
    kind: "agent",
    navbar: { titleKey: "agent.myagent", icon: "/agent.svg", order: 200 },
    ui: {
        main: MyAgentMain,
        side: MyAgentTools,
        sideWidth: 400,
    },
};
```

2. 实现 Agent 逻辑：
```typescript
// src/capabilities/my-agent/runner.ts
export class MyAgentRunner {
    async run(input: string, tools: any) {
        // Agent 执行逻辑
    }
}
```

## 性能优化

1. **使用 shallowRef 优化大列表**：
```typescript
const capabilities = shallowRef<Capability[]>([]);
```

2. **懒加载能力组件**：
```typescript
const main = defineAsyncComponent(() => import('./MyView.vue'));
```

3. **Vite 自动导入**：
```typescript
// vite.config.ts
AutoImport({
    imports: ['vue', 'vue-router', 'pinia'],
});
```

## 总结

Mercury Chat 采用了创新的能力插件化架构，具有以下优势：

1. **高度可扩展**：轻松添加新的 Chat 或 Agent 能力
2. **灵活组合**：能力之间可以共享或隔离数据
3. **类型安全**：完整的 TypeScript 支持
4. **性能优秀**：Vue 3 + Vite 带来极致性能
5. **易于维护**：清晰的代码组织和关注点分离

这是一个工业级的 AI 聊天应用架构，可以作为构建复杂 AI 应用的参考。
