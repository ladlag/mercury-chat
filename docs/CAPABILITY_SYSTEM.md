# 能力扩展系统完整说明

## 概述

Mercury Chat 的核心创新是**能力插件化架构**（Capability-driven UI Host Architecture），这是一个工业级的扩展系统，允许灵活地添加和管理不同类型的 Chat 和 Agent 能力。

## 能力模型

### Capability 接口定义

```typescript
export interface Capability {
    id: string;                    // 唯一标识符
    kind: "chat" | "agent";        // 能力类型
    navbar: CapabilityNavbar;      // 导航栏配置
    ui: CapabilityUI;              // UI 组件配置
    onActivate?: () => void;       // 激活回调
}

export interface CapabilityNavbar {
    titleKey: string;              // i18n 国际化键
    icon: string;                  // 图标路径（推荐使用 public/ 下的路径）
    order?: number;                // 排序权重（数字越小越靠前）
    visible?: boolean;             // 是否在导航栏显示（默认 true）
}

export interface CapabilityUI {
    main: Component;               // 主视图组件（必需）
    side?: Component;              // 侧边栏组件（可选）
    sideTitle?: string;            // 侧边栏标题
    sideWidth?: number;            // 侧边栏宽度（默认 380px）
    sideProps?: Record<string, any>; // 传递给侧边栏的属性
}
```

## 注册机制

### 1. 能力注册中心 (registry.ts)

使用 Map 数据结构保证能力 ID 的唯一性：

```typescript
const capMap = new Map<string, Capability>();
const capabilities = shallowRef<Capability[]>([]);

export function registerCapability(cap: Capability) {
    capMap.set(cap.id, cap);  // 重复 ID 会自动覆盖
    rebuildList();            // 重建排序后的列表
}

function rebuildList() {
    const list = Array.from(capMap.values())
        .filter((c) => c.navbar.visible !== false)
        .sort((a, b) => (a.navbar.order ?? 0) - (b.navbar.order ?? 0));
    
    capabilities.value = list;
}
```

### 2. 统一注册入口 (capabilities/index.ts)

所有能力在此文件统一注册：

```typescript
import { registerCapability } from "@/capabilities/registry";
import { ChatDefaultCapability, ChatSecondCapability } from "./chat/chat.capability";
import { ChatThirdCapability } from "./chat/chat-third.capability";
import { RequirementAgentCapability } from "./requirement/requirement.capability";

// 注册所有能力
registerCapability(ChatDefaultCapability);
registerCapability(ChatSecondCapability);
registerCapability(ChatThirdCapability);
registerCapability(RequirementAgentCapability);
```

### 3. 主应用集成 (App.vue)

主应用通过 `useCapabilities()` 获取已注册的能力：

```vue
<script setup lang="ts">
import { useCapabilities } from "@/capabilities/registry";
import { activeCapabilityId } from "@/config/navbar-top.config";

const capabilities = useCapabilities();
const activeCapability = computed(() =>
    capabilities.value.find((c) => c.id === activeCapabilityId.value)
);
</script>

<template>
  <component
    v-if="activeCapability"
    :is="activeCapability.ui.main"
  />
</template>
```

## 能力类型详解

### Chat 能力

Chat 能力专注于对话交互，可以共享或隔离数据。

#### 场景 1：默认 Chat（共享数据）

```typescript
export const ChatDefaultCapability: Capability = {
    id: "chat-default",
    kind: "chat",
    navbar: {
        titleKey: "navbar.chat",      // 对应 i18n 的键
        icon: "/logo.svg",             // 使用 public 下的图标
        order: 10,                     // 排序靠前
    },
    ui: {
        main: MateChatDefaultView,     // 使用原生 ChatView
    },
    onActivate: () => {
        // 可选：切换上下文
        console.log("Activated default chat");
    },
};
```

**特点**：
- ✅ 使用 MateChat 原生 ChatView
- ✅ 共享全局 store（message-store, history-store）
- ✅ 历史记录、模型、知识库全部沿用
- ✅ 最简单的集成方式

#### 场景 2：自定义 Chat（隔离数据）

```typescript
export const ChatSecondCapability: Capability = {
    id: "chat-second",
    kind: "chat",
    navbar: {
        titleKey: "navbar.chat2",
        icon: "/logo.svg",
        order: 20,
    },
    ui: {
        main: ChatSecondMain,          // 自定义 ChatView
    },
};
```

**特点**：
- ✅ 完全自定义的 UI
- ✅ 独立的会话管理（useIsolatedChat）
- ✅ 独立的消息存储（localStorage）
- ✅ 不影响默认 Chat 的状态

**实现示例**：

```vue
<!-- ChatSecondMain.vue -->
<template>
  <IsolatedChatView chat-id="chat-second" />
</template>

<script setup lang="ts">
import IsolatedChatView from "@/capabilities/common/ui/IsolatedChatView.vue";
</script>
```

#### 场景 3：多 Chat 共用默认 View

```typescript
export const ChatPresetCapability: Capability = {
    id: "chat-preset",
    kind: "chat",
    navbar: {
        titleKey: "navbar.preset",
        icon: "/preset.svg",
        order: 30,
    },
    ui: {
        main: MateChatDefaultView,     // 复用默认视图
    },
    onActivate: () => {
        // 修改 store 即可影响默认 ChatView
        const modelStore = useChatModelStore();
        modelStore.currentModel = presetModel;
    },
};
```

**适用场景**：
- 不同的模型预设
- 不同的知识库上下文
- 不同的对话模式
- 不同的入口逻辑

### Agent 能力

Agent 能力用于执行特定任务，具有更强的自主性和工具集成。

#### 基础 Agent

```typescript
export const RequirementAgentCapability: Capability = {
    id: "agent-requirement",
    kind: "agent",
    navbar: {
        titleKey: "agent.requirement",
        icon: "/agent-requirement.svg",
        order: 100,
    },
    ui: {
        main: RequirementMain,         // Agent 主视图
        side: RequirementTools,        // 工具面板
        sideTitle: "工具面板",
        sideWidth: 420,
        sideProps: {
            agentId: "requirement",
            permissions: ["read", "write"],
        },
    },
};
```

**特点**：
- ✅ Agent 不使用 ChatView
- ✅ 完全自定义执行逻辑
- ✅ 独立的工具面板（side）
- ✅ 使用 agent-session 管理状态
- ✅ 支持 SSE 流式执行

**Agent 主视图示例**：

```vue
<!-- RequirementMain.vue -->
<template>
  <CapabilityViewLayout>
    <d-card>
      <template #header>{{ $t("agent.requirement.title") }}</template>
      
      <d-form layout="vertical">
        <d-form-item :label="$t('agent.requirement.inputLabel')">
          <d-textarea v-model="session.input" :rows="6" />
        </d-form-item>
        
        <d-button type="primary" @click="run">
          {{ $t("agent.requirement.run") }}
        </d-button>
        
        <d-card v-if="session.output" style="margin-top: 12px;">
          <pre class="output">{{ session.output }}</pre>
        </d-card>
      </d-form>
    </d-card>
  </CapabilityViewLayout>
</template>

<script setup lang="ts">
import CapabilityViewLayout from "@/capabilities/common/ui/CapabilityViewLayout.vue";
import { useAgentSession } from "@/capabilities/common/agent-session";
import { RequirementAgentRunner } from "../runner";

const session = useAgentSession("agent-requirement");
const runner = new RequirementAgentRunner();

const run = async () => {
    session.output = await runner.run(session.input, session.tools);
};
</script>
```

**Agent 工具面板示例**：

```vue
<!-- RequirementTools.vue -->
<template>
  <div class="tools-panel">
    <h3>可用工具</h3>
    <d-checkbox-group v-model="session.tools">
      <d-checkbox value="search">搜索</d-checkbox>
      <d-checkbox value="analyze">分析</d-checkbox>
      <d-checkbox value="generate">生成</d-checkbox>
    </d-checkbox-group>
  </div>
</template>

<script setup lang="ts">
import { useAgentSession } from "@/capabilities/common/agent-session";

const session = useAgentSession("agent-requirement");
</script>
```

## 导航栏行为

### 支持的场景

| 场景 | 支持 |
|------|------|
| 0-N 个 Chat | ✅ |
| 0-N 个 Agent | ✅ |
| Chat 和 Agent 混排 | ✅ |
| 自定义排序 | ✅ (navbar.order) |
| 动态显示/隐藏 | ✅ (navbar.visible) |
| ID 去重 | ✅ (Map 保证) |

### 切换逻辑

```typescript
// config/navbar-top.config.ts
export const activeCapabilityId = ref<string>("chat-default");

function switchCapability(id: string) {
    // 1. 更新激活 ID
    activeCapabilityId.value = id;
    
    // 2. 查找能力
    const cap = capabilities.value.find(c => c.id === id);
    
    // 3. 调用激活回调
    cap?.onActivate?.();
    
    // 4. 自动关闭侧边栏（App.vue 中处理）
}
```

## 侧边栏系统 (Side Drawer)

### 统一的侧边栏组件

所有能力的侧边栏由 `CapabilitySideDrawer.vue` 统一管理：

```vue
<!-- CapabilitySideDrawer.vue -->
<template>
  <d-drawer
    v-model="visible"
    :width="width"
    position="rtl"
  >
    <template #header>{{ title }}</template>
    <component :is="side" v-bind="props" />
  </d-drawer>
</template>

<script setup lang="ts">
defineProps<{
    side: Component;
    title: string;
    width: number;
}>();

const visible = defineModel<boolean>('visible');
</script>
```

### 职责划分

| 职责 | 由谁负责 |
|------|----------|
| 抽屉外壳 | CapabilitySideDrawer ✅ |
| 触发按钮 | 各能力的 UI ✅ |
| 宽度控制 | Capability 配置 ✅ |
| 标题 | Capability 配置 ✅ |
| 内容组件 | Capability 提供 ✅ |
| 自动收起 | App.vue（切换能力时）✅ |

### Agent/Chat 只需声明

```typescript
ui: {
    side: RequirementTools,
    sideTitle: "工具面板",
    sideWidth: 420,
    sideProps: { /* 传递给侧边栏的参数 */ }
}
```

**不允许**：
- ❌ 自己创建 Drawer
- ❌ 自己管理右侧弹出逻辑
- ❌ 自己处理切换时的关闭

## 会话隔离策略

### 隔离级别对照表

| 类型 | 是否隔离 | 存储方式 | 适用场景 |
|------|----------|----------|----------|
| 默认 Chat | ❌ 共用 | 全局 store | 标准聊天 |
| 多 Chat + 默认 View | ❌ 共用 | 全局 store | 不同入口/预设 |
| 自定义 Chat View | ✅ 可隔离 | localStorage | 独立会话 |
| Agent | ✅ 独立 | agent-session | 任务执行 |

### 隔离 Chat 的实现

使用 `useIsolatedChat` 实现独立的会话管理：

```typescript
// useIsolatedChat.ts
export function useIsolatedChat(chatId: string) {
    const storage = useChatStorage(chatId);
    const activeSessionId = ref<string>("");
    
    const sessions = computed(() => storage.getSessions());
    const messages = computed(() => 
        storage.getMessages(activeSessionId.value)
    );
    
    function newSession() {
        const id = `session-${Date.now()}`;
        storage.createSession(id);
        activeSessionId.value = id;
    }
    
    function sendUser(content: string) {
        storage.addMessage(activeSessionId.value, {
            id: uuid(),
            role: "user",
            content,
            timestamp: Date.now(),
        });
    }
    
    function sendAssistant(content: string) {
        storage.addMessage(activeSessionId.value, {
            id: uuid(),
            role: "assistant",
            content,
            timestamp: Date.now(),
        });
    }
    
    return { 
        sessions, 
        activeSessionId, 
        messages, 
        selectSession, 
        newSession, 
        sendUser, 
        sendAssistant 
    };
}
```

### Agent Session 管理

```typescript
// agent-session.ts
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

## 扩展实战

### 扩展 1：新增一个独立的 Agent

**需求**：添加一个风险分析 Agent

```typescript
// src/capabilities/risk/risk.capability.ts
import type { Capability } from "@/capabilities/registry";
import RiskMain from "./ui/RiskMain.vue";
import RiskTools from "./ui/RiskTools.vue";

export const RiskAgentCapability: Capability = {
    id: "agent-risk",
    kind: "agent",
    navbar: {
        titleKey: "agent.risk",
        icon: "/agent-risk.svg",
        order: 110,
    },
    ui: {
        main: RiskMain,
        side: RiskTools,
        sideTitle: "风险工具",
        sideWidth: 400,
    },
};
```

注册能力：

```typescript
// src/capabilities/index.ts
import { RiskAgentCapability } from "./risk/risk.capability";
registerCapability(RiskAgentCapability);
```

添加国际化：

```typescript
// src/i18n/cn.ts
export default {
    agent: {
        risk: "风险分析",
    },
};
```

### 扩展 2：新增一个独立 Chat

**需求**：添加一个报告生成专用 Chat

```typescript
// src/capabilities/chat/chat-report.capability.ts
export const ChatReportCapability: Capability = {
    id: "chat-report",
    kind: "chat",
    navbar: {
        titleKey: "navbar.report",
        icon: "/report.svg",
        order: 40,
    },
    ui: {
        main: ChatReportMain,  // 自定义视图
    },
};
```

实现自定义视图：

```vue
<!-- ChatReportMain.vue -->
<template>
  <IsolatedChatView chat-id="chat-report" />
</template>
```

### 扩展 3：共用默认 Chat 但预设模型

**需求**：添加一个编程助手入口

```typescript
// src/capabilities/chat/chat-coding.capability.ts
export const ChatCodingCapability: Capability = {
    id: "chat-coding",
    kind: "chat",
    navbar: {
        titleKey: "navbar.coding",
        icon: "/coding.svg",
        order: 50,
    },
    ui: {
        main: MateChatDefaultView,  // 复用默认视图
    },
    onActivate: () => {
        const modelStore = useChatModelStore();
        // 切换到编程模型
        modelStore.currentModel = codingModel;
    },
};
```

## 需求满足对照表

| 需求 | 是否满足 |
|------|----------|
| 1 个默认 Chat 存在 | ✅ |
| 支持 0-N 个 Chat | ✅ |
| 支持 0-N 个 Agent | ✅ |
| Chat 可共用 View | ✅ |
| Chat 可自定义 View | ✅ |
| 会话可隔离 | ✅ |
| Agent Tool 解耦 | ✅ |
| Side 抽屉式 | ✅ |
| 不破坏 MateChat | ✅ |
| Layout 可复用 | ✅ |
| 样式统一 | ✅ |
| 插件化注册 | ✅ |
| Map 去重 | ✅ |
| 自定义排序 | ✅ |

## 后续扩展方向

### 可扩展能力

| 扩展 | 可行性 |
|------|--------|
| SSE 流式 Agent | ✅ |
| 多 Agent 协作 | ✅ |
| Agent 调用 Chat | ✅ |
| Chat 调用 Agent | ✅ |
| Agent 任务队列 | ✅ |
| Agent Tool 插件 | ✅ |
| Capability 市场 | ✅ |
| 动态加载能力 | ✅ |

## 总结

Mercury Chat 的能力扩展系统是一个**工业级的插件化架构**，具有以下特点：

1. **比路由更灵活**：无需配置路由即可添加新能力
2. **比微前端更轻**：无需复杂的微前端框架
3. **比 slot 注入更可控**：统一的能力模型和生命周期
4. **比多 Layout 更工程化**：清晰的职责划分和扩展点

这套体系不仅支持当前的需求，还具备良好的扩展性，可以支持未来更复杂的 AI 应用场景。
