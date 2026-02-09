# 开发者快速上手指南

## 欢迎

欢迎使用 Mercury Chat！本指南将帮助你在 10 分钟内了解项目并开始开发。

## 前置要求

- Node.js 18+
- pnpm 8+
- 基本的 Vue 3 和 TypeScript 知识

## 快速开始

### 1. 安装依赖

```bash
# 克隆项目
git clone https://github.com/ladlag/mercury-chat.git
cd mercury-chat

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 http://localhost:5173 查看应用。

### 2. 项目结构一览

```
mercury-chat/
├── src/
│   ├── capabilities/      # 🔥 核心：添加新功能从这里开始
│   ├── store/             # 状态管理
│   ├── view/              # 页面组件
│   ├── components/        # 通用组件
│   └── models/            # AI 模型集成
└── docs/                  # 完整文档
```

### 3. 核心概念

Mercury Chat 的核心是**能力系统**（Capability System）：

- **Capability**: 一个独立的功能单元（Chat 或 Agent）
- **Registry**: 能力注册中心，管理所有能力
- **Dynamic Rendering**: App.vue 动态渲染当前激活的能力

## 第一个示例：添加一个简单的 Chat

### 步骤 1：创建能力定义

创建文件 `src/capabilities/chat/my-first-chat.capability.ts`：

```typescript
import type { Capability } from "@/capabilities/registry";
import MateChatDefaultView from "@/capabilities/chat/ui/MateChatDefaultView.vue";

export const MyFirstChatCapability: Capability = {
    // 唯一 ID，不能与其他能力重复
    id: "chat-my-first",
    
    // 类型：chat 或 agent
    kind: "chat",
    
    // 导航栏配置
    navbar: {
        titleKey: "navbar.myFirst",  // 国际化键
        icon: "/logo.svg",            // 图标路径
        order: 15,                    // 排序（数字越小越靠前）
    },
    
    // UI 配置
    ui: {
        main: MateChatDefaultView,    // 使用默认聊天视图
    },
    
    // 可选：激活时的回调
    onActivate: () => {
        console.log("My first chat activated!");
    },
};
```

### 步骤 2：添加国际化文本

编辑 `src/i18n/cn.ts`：

```typescript
export default {
    navbar: {
        // ... 其他翻译
        myFirst: "我的第一个聊天",
    },
};
```

编辑 `src/i18n/en.ts`：

```typescript
export default {
    navbar: {
        // ... 其他翻译
        myFirst: "My First Chat",
    },
};
```

### 步骤 3：注册能力

编辑 `src/capabilities/index.ts`：

```typescript
import { registerCapability } from "@/capabilities/registry";
import { ChatDefaultCapability, ChatSecondCapability } from "./chat/chat.capability";
import { MyFirstChatCapability } from "./chat/my-first-chat.capability";  // 导入

registerCapability(ChatDefaultCapability);
registerCapability(ChatSecondCapability);
registerCapability(MyFirstChatCapability);  // 注册
```

### 步骤 4：查看效果

刷新浏览器，你会在导航栏看到"我的第一个聊天"！

## 第二个示例：创建独立的 Agent

### 步骤 1：创建目录结构

```bash
src/capabilities/my-agent/
├── my-agent.capability.ts    # 能力定义
├── runner.ts                 # Agent 执行逻辑
└── ui/
    ├── MyAgentMain.vue      # 主视图
    └── MyAgentTools.vue     # 工具面板
```

### 步骤 2：定义 Agent 能力

`src/capabilities/my-agent/my-agent.capability.ts`：

```typescript
import type { Capability } from "@/capabilities/registry";
import MyAgentMain from "./ui/MyAgentMain.vue";
import MyAgentTools from "./ui/MyAgentTools.vue";

export const MyAgentCapability: Capability = {
    id: "agent-my-agent",
    kind: "agent",
    navbar: {
        titleKey: "agent.myAgent",
        icon: "/agent-icon.svg",
        order: 110,
    },
    ui: {
        main: MyAgentMain,
        side: MyAgentTools,
        sideTitle: "Agent 工具",
        sideWidth: 400,
    },
};
```

### 步骤 3：实现主视图

`src/capabilities/my-agent/ui/MyAgentMain.vue`：

```vue
<template>
  <CapabilityViewLayout>
    <d-card>
      <template #header>{{ $t("agent.myAgent") }}</template>
      
      <d-form layout="vertical">
        <d-form-item label="输入任务">
          <d-textarea v-model="session.input" :rows="6" />
        </d-form-item>
        
        <d-button type="primary" @click="run" :loading="loading">
          执行
        </d-button>
        
        <d-card v-if="session.output" style="margin-top: 12px;">
          <pre class="output">{{ session.output }}</pre>
        </d-card>
      </d-form>
    </d-card>
  </CapabilityViewLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import CapabilityViewLayout from "@/capabilities/common/ui/CapabilityViewLayout.vue";
import { useAgentSession } from "@/capabilities/common/agent-session";
import { MyAgentRunner } from "../runner";

const session = useAgentSession("agent-my-agent");
const runner = new MyAgentRunner();
const loading = ref(false);

const run = async () => {
    loading.value = true;
    try {
        session.output = await runner.run(session.input, session.tools);
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.output {
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
}
</style>
```

### 步骤 4：实现工具面板

`src/capabilities/my-agent/ui/MyAgentTools.vue`：

```vue
<template>
  <div class="tools-panel">
    <h3>可用工具</h3>
    
    <d-checkbox-group v-model="session.tools">
      <d-checkbox value="search">搜索工具</d-checkbox>
      <d-checkbox value="analyze">分析工具</d-checkbox>
      <d-checkbox value="generate">生成工具</d-checkbox>
    </d-checkbox-group>
    
    <d-divider />
    
    <div class="info">
      <p>已选择 {{ session.tools.length }} 个工具</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAgentSession } from "@/capabilities/common/agent-session";

const session = useAgentSession("agent-my-agent");
</script>

<style scoped lang="scss">
.tools-panel {
    padding: 16px;
}

.info {
    color: $devui-text;
    font-size: 14px;
}
</style>
```

### 步骤 5：实现执行逻辑

`src/capabilities/my-agent/runner.ts`：

```typescript
export class MyAgentRunner {
    async run(input: string, tools: string[]): Promise<string> {
        // 模拟 Agent 执行
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return `执行结果：
输入：${input}
使用的工具：${tools.join(", ")}
状态：成功
时间：${new Date().toLocaleString()}`;
    }
}
```

### 步骤 6：注册 Agent

`src/capabilities/index.ts`：

```typescript
import { MyAgentCapability } from "./my-agent/my-agent.capability";
registerCapability(MyAgentCapability);
```

### 步骤 7：添加国际化

在 `src/i18n/cn.ts` 和 `src/i18n/en.ts` 中添加：

```typescript
{
    agent: {
        myAgent: "我的 Agent",
    },
}
```

## 常见场景

### 场景 1：共享默认 ChatView 但切换模型

```typescript
export const CodingChatCapability: Capability = {
    id: "chat-coding",
    kind: "chat",
    navbar: {
        titleKey: "navbar.coding",
        icon: "/coding.svg",
        order: 20,
    },
    ui: {
        main: MateChatDefaultView,  // 复用默认视图
    },
    onActivate: () => {
        // 切换到编程模型
        const modelStore = useChatModelStore();
        modelStore.currentModel = {
            id: "gpt-4",
            name: "GPT-4",
            clientKey: "openai",
            providerKey: "openai",
        };
    },
};
```

### 场景 2：创建完全独立的 Chat

```typescript
export const IsolatedChatCapability: Capability = {
    id: "chat-isolated",
    kind: "chat",
    navbar: {
        titleKey: "navbar.isolated",
        icon: "/isolated.svg",
        order: 30,
    },
    ui: {
        main: IsolatedChatMain,  // 自定义视图
    },
};
```

`IsolatedChatMain.vue`：

```vue
<template>
  <IsolatedChatView chat-id="chat-isolated" />
</template>

<script setup lang="ts">
import IsolatedChatView from "@/capabilities/common/ui/IsolatedChatView.vue";
</script>
```

### 场景 3：Agent 调用 AI 模型

```typescript
import { Client } from "@/models";

export class AIAgentRunner {
    async run(input: string): Promise<string> {
        const client = new Client("openai", "openai").client;
        
        const result = await client.chat({
            content: input,
            messages: [],
            streamOptions: {
                onMessage: (chunk) => {
                    console.log("Streaming:", chunk.content);
                },
            },
        });
        
        return result;
    }
}
```

## 调试技巧

### 1. 查看注册的能力

在浏览器控制台：

```javascript
import { useCapabilities } from "@/capabilities/registry";
const capabilities = useCapabilities();
console.log(capabilities.value);
```

### 2. 查看 Store 状态

```javascript
import { useChatMessageStore } from "@/store";
const store = useChatMessageStore();
console.log(store.messages);
```

### 3. 启用 Mock 模式

编辑 `src/models/config.ts`：

```typescript
export const MODEL_CONFIGS = {
    enableMock: true,  // 开启 Mock 模式，不调用真实 API
};
```

## 常见问题

### Q: 如何添加新的图标？

A: 将 SVG 图标放到 `public/` 目录，然后在能力配置中使用：

```typescript
navbar: {
    icon: "/my-icon.svg",  // public/my-icon.svg
}
```

### Q: 如何持久化 Agent 状态？

A: 使用 `useAgentSession`，它会自动保存到 localStorage：

```typescript
const session = useAgentSession("my-agent-id");
// session 的任何改变都会自动持久化
```

### Q: 如何在能力之间共享数据？

A: 使用全局 Store：

```typescript
import { useChatMessageStore } from "@/store";

const messageStore = useChatMessageStore();
// 在任何能力中访问相同的 store
```

### Q: 如何隐藏某个能力？

A: 在能力配置中设置 `visible: false`：

```typescript
navbar: {
    titleKey: "navbar.hidden",
    icon: "/icon.svg",
    visible: false,  // 不在导航栏显示
}
```

## 下一步

### 深入学习

- 📚 [架构文档](./ARCHITECTURE.md) - 了解整体架构
- 📚 [能力扩展系统](./CAPABILITY_SYSTEM.md) - 能力系统详解
- 📚 [状态管理](./STATE_MANAGEMENT.md) - Store 使用指南
- 📚 [组件使用指南](./COMPONENTS_GUIDE.md) - 所有组件的使用

### 实战练习

1. **练习 1**：创建一个天气查询 Agent
2. **练习 2**：创建一个代码审查 Chat
3. **练习 3**：创建一个多步骤任务 Agent
4. **练习 4**：实现 Chat 和 Agent 之间的数据传递

### 参与开发

- 查看 Issues 寻找想要解决的问题
- 提交 Pull Request 贡献代码
- 完善文档和示例

## 获取帮助

- 查看 [完整文档](../docs/)
- 阅读现有代码示例
- 在 Issues 中提问

## 小结

你已经学会了：
- ✅ 如何添加新的 Chat 能力
- ✅ 如何创建自定义 Agent
- ✅ 如何使用状态管理
- ✅ 如何添加国际化
- ✅ 常见开发场景的处理

现在开始你的 Mercury Chat 开发之旅吧！🚀
