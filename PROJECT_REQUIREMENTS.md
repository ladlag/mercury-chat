# 项目需求与开发规范

## 项目定位

基于 **DevUI 的 MateChat** (@matechat/core) 核心框架，构建**多 Agent 大模型交互系统**。

## 核心功能需求

### 1. 多 Agent 系统

- **多个 Agent 能力/入口**：用户可以通过不同的 Agent 完成不同的任务
- **左侧导航栏**：点击进入不同的能力或 Agent
- **Agent 选择器**：在流式对话输入框上选择 Agent 进行对话
- **Agent 切换**：可以进入相应的 Agent 页面

### 2. 大模型交互

- **流式对话**：与大模型进行流式对话
- **实时响应**：支持 SSE（Server-Sent Events）或 WebSocket
- **上下文管理**：保持对话上下文

### 3. 工作流系统

- **工作流形式交互**：支持多步骤的工作流程
- **结论输出**：生成工作流执行结论
- **报告生成**：输出格式化的报告

### 4. 认证系统

#### 主要登录方式
- **手机验证码登录**（主要）
- **微信扫码关注公众号登录**（主要）

#### 辅助登录方式
- 邮箱登录
- 微信扫码登录

---

## 开发设计原则（必须遵循）

### 原则 1: 能力插件化系统 ⭐⭐⭐

**所有功能都应该通过能力插件化系统实现**

```typescript
// ✅ 正确做法：通过能力注册
export const MyAgentCapability: Capability = {
    id: "agent-my-agent",
    kind: "agent",
    navbar: { titleKey: "agent.myAgent", icon: "/icon.svg", order: 100 },
    ui: { main: MyAgentMain, side: MyAgentTools },
};

registerCapability(MyAgentCapability);

// ❌ 错误做法：直接修改路由或硬编码组件
```

**要求**：
- 每个 Agent 都是一个独立的 Capability
- 使用 `registerCapability()` 注册
- 通过 `kind: "agent"` 标识为 Agent
- 不直接修改核心路由或导航系统

### 原则 2: 在 MateChat 基础上扩展 ⭐⭐⭐

**不破坏 MateChat 原有机制，只做扩展**

```typescript
// ✅ 正确做法：扩展现有功能
import MateChat from '@matechat/core';
import McI18n from '@matechat/core/Locale';

// 使用 MateChat 的组件和工具
const langStore = useLangStore();
langStore.updateCurrentLang(LangType.CN); // 使用 McI18n

// ❌ 错误做法：替换或修改 MateChat 核心
// 不要修改 @matechat/core 的内部实现
// 不要替换 MateChat 的核心组件
```

**要求**：
- 保持 MateChat 的初始化流程
- 使用 MateChat 的国际化系统（McI18n）
- 使用 MateChat 的主题系统（devui-theme）
- 不修改 MateChat 核心代码

### 原则 3: 不破坏原有机制 ⭐⭐⭐

**新功能不应影响现有功能的正常运行**

```typescript
// ✅ 正确做法：添加新的 store，不修改现有 store
export const useAuthStore = defineStore('auth', () => {
    // 新的认证状态
    const user = ref(null);
    return { user };
});

// ❌ 错误做法：修改现有 store 的核心逻辑
// 不要修改 message-store.ts 的核心 ask() 方法
// 不要修改 history-store.ts 的数据结构
```

**要求**：
- 向后兼容：现有能力必须继续正常工作
- 数据隔离：新功能使用独立的 store
- 不修改现有 store 的核心方法
- 不改变现有组件的 Props/Events 接口

### 原则 4: 组件优先级 ⭐⭐

**组件使用优先级顺序**

```
1. MateChat 已有能力（最优先）
   ↓
2. vue-devui 组件库（次优先）
   ↓
3. 自定义组件（最后选择）
```

```vue
<!-- ✅ 正确做法：优先使用 MateChat 和 vue-devui -->
<template>
  <!-- 1. 优先使用 MateChat 组件 -->
  <ChatView />
  <HistoryList />
  
  <!-- 2. 其次使用 vue-devui -->
  <d-button type="primary">提交</d-button>
  <d-card>
    <d-form>
      <d-form-item label="用户名">
        <d-input v-model="username" />
      </d-form-item>
    </d-form>
  </d-card>
  
  <!-- 3. 最后才自定义组件（仅在必要时） -->
  <CustomAgentSelector v-if="reallyNeeded" />
</template>

<!-- ❌ 错误做法：优先自定义组件 -->
<template>
  <MyCustomButton />  <!-- 应该用 d-button -->
  <MyCustomCard />    <!-- 应该用 d-card -->
</template>
```

**要求**：
- 优先查找 MateChat 是否有对应组件
- 其次使用 vue-devui 的丰富组件
- 仅在前两者都无法满足时才自定义
- 自定义组件也应遵循 DevUI 设计风格

### 原则 5: 不改变框架机制 ⭐⭐⭐

**不修改核心框架的工作方式**

```typescript
// ✅ 正确做法：使用现有机制
const capabilities = useCapabilities();
const activeCapabilityId = ref("my-agent");

// ❌ 错误做法：修改核心机制
// 不要修改 registry.ts 的注册逻辑
// 不要修改 App.vue 的渲染机制
// 不要改变能力系统的生命周期
```

**禁止操作**：
- 不修改 `src/capabilities/registry.ts` 的核心逻辑
- 不修改 `src/App.vue` 的组件渲染机制
- 不修改 `src/main.ts` 的初始化顺序
- 不改变能力插件化的工作流程

### 原则 6: 避免过多自定义代码 ⭐⭐

**复用胜于重写**

```typescript
// ✅ 正确做法：复用现有功能
import { useIsolatedChat } from "@/capabilities/common/useIsolatedChat";
const { messages, sendUser, sendAssistant } = useIsolatedChat("my-agent");

// ❌ 错误做法：重新实现已有功能
function myOwnChatImplementation() {
    // 不要重新实现聊天逻辑
}
```

**要求**：
- 优先使用 `capabilities/common` 中的公共工具
- 复用 `useIsolatedChat`、`useAgentSession` 等组合式函数
- 复用 `CapabilityViewLayout`、`IsolatedChatView` 等组件
- 参考现有 Agent（requirement）的实现模式

---

## 技术架构约束

### 技术栈（不可变更）

```typescript
核心框架（主体）：
- @matechat/core (1.5.2) - DevUI MateChat 核心
- @devui-design/icons (1.4.0)
- devui-theme (0.1.0)

前端技术：
- Vue 3.5.13
- TypeScript 5.7.2
- Vite 6.2.0
- Pinia 3.0.2

UI 组件库（辅助）：
- vue-devui (1.6.32)

AI 集成：
- OpenAI SDK (5.3.0)
```

### 目录结构规范

```
src/
├── capabilities/           # 能力系统（核心）
│   ├── registry.ts        # 能力注册中心（不可修改核心逻辑）
│   ├── index.ts           # 能力统一导入
│   ├── chat/              # Chat 能力
│   ├── requirement/       # Agent 示例
│   ├── [new-agent]/       # 新增 Agent（推荐）
│   └── common/            # 公共组件和工具（可扩展）
│       ├── useIsolatedChat.ts
│       ├── useAgentSession.ts
│       └── ui/
├── store/                 # 状态管理
│   ├── message-store.ts   # 消息管理（不可修改核心）
│   ├── history-store.ts   # 历史记录（不可修改核心）
│   ├── [new-store].ts     # 新增 store（推荐）
│   └── ...
├── view/                  # MateChat 视图组件（不建议修改）
├── components/            # 通用组件（可扩展）
└── models/                # AI 模型集成（可扩展）
```

### 新增功能建议位置

#### 认证系统
```
src/
├── capabilities/
│   └── auth/                          # 认证能力
│       ├── auth.capability.ts         # 能力定义
│       ├── ui/
│       │   ├── LoginMain.vue         # 登录主页面
│       │   └── LoginMethods.vue      # 登录方式组件
│       └── auth-service.ts           # 认证服务
├── store/
│   └── auth-store.ts                 # 认证状态管理
└── types/
    └── auth-types.ts                 # 认证类型定义
```

#### 多 Agent 系统
```
src/
├── capabilities/
│   ├── agents/                       # Agent 能力集合
│   │   ├── text-analysis/           # 文本分析 Agent
│   │   ├── code-review/             # 代码审查 Agent
│   │   ├── report-generator/        # 报告生成 Agent
│   │   └── workflow-executor/       # 工作流执行 Agent
│   └── common/
│       ├── ui/
│       │   └── AgentSelector.vue    # Agent 选择器组件
│       └── useAgentManager.ts       # Agent 管理工具
```

#### 工作流系统
```
src/
├── capabilities/
│   └── workflow/                     # 工作流能力
│       ├── workflow.capability.ts
│       ├── ui/
│       │   ├── WorkflowEditor.vue   # 工作流编辑器
│       │   └── WorkflowRunner.vue   # 工作流执行器
│       └── workflow-engine.ts       # 工作流引擎
└── store/
    └── workflow-store.ts            # 工作流状态管理
```

---

## 开发流程规范

### 1. 开发新 Agent

```typescript
// 步骤 1: 创建目录结构
src/capabilities/[agent-name]/
├── [agent-name].capability.ts
├── runner.ts
└── ui/
    ├── [AgentName]Main.vue
    └── [AgentName]Tools.vue

// 步骤 2: 定义能力
export const MyAgentCapability: Capability = {
    id: "agent-my-agent",
    kind: "agent",
    navbar: {
        titleKey: "agent.myAgent",
        icon: "/agent-my-agent.svg",
        order: 110,
    },
    ui: {
        main: MyAgentMain,
        side: MyAgentTools,
        sideWidth: 400,
    },
};

// 步骤 3: 注册能力
// src/capabilities/index.ts
import { MyAgentCapability } from "./my-agent/my-agent.capability";
registerCapability(MyAgentCapability);

// 步骤 4: 添加国际化
// src/i18n/cn.ts
{
    agent: {
        myAgent: "我的 Agent",
    },
}
```

### 2. 开发新功能模块

1. **规划阶段**：
   - 确认功能是否可以通过能力插件化实现
   - 检查 MateChat 和 vue-devui 是否有可复用组件
   - 设计数据流和状态管理

2. **实现阶段**：
   - 创建能力定义
   - 实现 UI 组件（优先使用现有组件）
   - 实现业务逻辑（复用公共工具）
   - 添加状态管理（独立 store）

3. **集成阶段**：
   - 注册能力
   - 添加国际化
   - 测试功能
   - 验证不影响现有功能

### 3. 代码审查检查清单

开发完成后，自检以下项：

- [ ] 是否通过能力插件化系统实现？
- [ ] 是否使用了 MateChat 已有组件？
- [ ] 是否优先使用了 vue-devui？
- [ ] 是否破坏了现有功能？
- [ ] 是否修改了核心框架机制？
- [ ] 是否添加了过多自定义代码？
- [ ] 是否遵循了目录结构规范？
- [ ] 是否添加了必要的国际化？
- [ ] 是否保持了 DevUI 设计风格？

---

## 示例参考

### 参考实现

#### 1. 现有 Agent 示例
```
src/capabilities/requirement/
```
这是一个完整的 Agent 实现示例，包含：
- 能力定义
- 主视图和工具面板
- 执行逻辑（runner）
- 会话状态管理

#### 2. Chat 能力示例
```
src/capabilities/chat/
```
展示了如何创建 Chat 能力，包括：
- 共享数据模式（ChatDefaultCapability）
- 隔离数据模式（ChatSecondCapability）

#### 3. 公共组件和工具
```
src/capabilities/common/
```
包含可复用的：
- `useIsolatedChat.ts` - 隔离聊天管理
- `useAgentSession.ts` - Agent 会话管理
- `IsolatedChatView.vue` - 隔离聊天视图
- `CapabilityViewLayout.vue` - 标准布局

---

## 禁止事项清单

### ❌ 绝对禁止

1. **修改核心文件的基础逻辑**
   - `src/capabilities/registry.ts` 的注册机制
   - `src/App.vue` 的渲染逻辑
   - `src/main.ts` 的初始化流程
   - `@matechat/core` 的任何内容

2. **破坏现有功能**
   - 修改现有 Capability 的接口
   - 改变现有 store 的数据结构
   - 移除或重命名现有组件

3. **绕过能力系统**
   - 直接在 App.vue 中硬编码组件
   - 不通过 registry 添加导航项
   - 直接修改路由配置

### ⚠️ 需谨慎

1. **修改现有组件**
   - 仅在必要时扩展，不修改核心逻辑
   - 保持接口向后兼容
   - 添加充分的注释说明

2. **添加新的依赖包**
   - 优先使用已有依赖
   - 新增依赖需评估必要性
   - 避免版本冲突

3. **自定义样式**
   - 优先使用 DevUI 的样式变量
   - 遵循 MateChat 的设计风格
   - 避免全局样式污染

---

## 后续开发指引

### 认证系统实施

参考 `docs/AUTH_SYSTEM_PLAN.md`（待创建）

### 多 Agent 系统实施

参考 `docs/MULTI_AGENT_PLAN.md`（待创建）

### 工作流系统实施

参考 `docs/WORKFLOW_SYSTEM_PLAN.md`（待创建）

---

## 联系和支持

如有疑问或需要澄清，请参考：
- [架构文档](./docs/ARCHITECTURE.md)
- [能力扩展系统](./docs/CAPABILITY_SYSTEM.md)
- [技术栈说明](./docs/TECH_STACK.md)

---

**最后更新**: 2026-02-10  
**版本**: 1.0.0  
**状态**: 活跃维护中
