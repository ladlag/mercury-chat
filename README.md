# Mercury Chat (MateChat)

一个基于 Vue 3 + TypeScript 的现代化 AI 聊天应用，采用创新的能力插件化架构。

## 项目简介

Mercury Chat 是一个可扩展的 AI 聊天平台，支持：
- ✅ 多种 Chat 能力（共享或隔离会话）
- ✅ 自定义 Agent 能力
- ✅ 流式 AI 响应
- ✅ 完整的历史记录管理
- ✅ 主题和国际化支持
- ✅ 模块化的组件体系

### 技术栈

- **前端框架**: Vue 3.5 + TypeScript 5.7
- **构建工具**: Vite 6.2
- **状态管理**: Pinia 3.0
- **UI 组件**: Vue DevUI
- **AI 集成**: OpenAI SDK

### 项目信息

- 子项目包名规则: @matechat/\*
- 包名: @matechat/vue-starter
- 代码行数: 约 4,700+ 行

## 依赖安装

可以在本子项目根目录(packages/vue-starter)下执行：

```bash
pnpm install
```

也可以在 MateChat 根目录下执行：

```bash
// 推荐执行一次, 可能本地项目之前用npm安装的依赖, 该指令会为根项目和所有子项目安装依赖
pnpm install
// 只会对vue-starter子项目安装依赖
pnpm install --filter vue-starter
// 为子项目安装指定包
pnpm add "package-name" --filter vue-starter
```

## 启动

在根项目根目录下执行：

```bash
pnpm run dev:vue-starter
```

或者在子项目 vue-starter 目录下执行：

```bash
pnpm run dev
```

## 快速开始

### 添加新的 Chat 能力

1. 创建能力定义：

```typescript
// src/capabilities/chat/my-chat.capability.ts
export const MyChat: Capability = {
    id: "chat-custom",
    kind: "chat",
    navbar: { titleKey: "navbar.custom", icon: "/custom.svg", order: 30 },
    ui: { main: MyCustomView },
};
```

2. 注册能力：

```typescript
// src/capabilities/index.ts
import { MyChat } from "./chat/my-chat.capability";
registerCapability(MyChat);
```

### 添加新的 Agent 能力

1. 创建 Agent：

```typescript
// src/capabilities/my-agent/my-agent.capability.ts
export const MyAgent: Capability = {
    id: "agent-myagent",
    kind: "agent",
    navbar: { titleKey: "agent.myagent", icon: "/agent.svg", order: 100 },
    ui: {
        main: MyAgentMain,
        side: MyAgentTools,
        sideWidth: 420,
    },
};
```

2. 实现 Agent 视图：

```vue
<!-- MyAgentMain.vue -->
<template>
  <CapabilityViewLayout>
    <d-card>
      <d-form>
        <!-- Agent UI -->
      </d-form>
    </d-card>
  </CapabilityViewLayout>
</template>
```

## 文档

完整的文档位于 `docs/` 目录：

- **[架构文档](./docs/ARCHITECTURE.md)** - 了解项目整体架构和设计理念
- **[能力扩展系统](./docs/CAPABILITY_SYSTEM.md)** - 详细的能力插件化系统说明
- **[状态管理](./docs/STATE_MANAGEMENT.md)** - Pinia Store 使用指南
- **[组件使用指南](./docs/COMPONENTS_GUIDE.md)** - 所有组件的使用方法
- **[扩展说明](./extend.readme.md)** - 能力扩展的完整工程实践

## 架构亮点

### 1. 能力插件化架构

- **比路由更灵活**：无需配置路由即可添加新能力
- **比微前端更轻**：无需复杂的微前端框架
- **比 slot 注入更可控**：统一的能力模型和生命周期
- **Map 去重机制**：保证能力 ID 唯一性

### 2. 模块化状态管理

- 按功能域划分的 Pinia Store
- 支持全局共享和局部隔离
- 完整的 TypeScript 类型支持

### 3. 组件化设计

- 清晰的职责划分
- 高度可复用的组件
- 统一的样式规范

### 4. 类型安全

- 完整的 TypeScript 类型定义
- 严格的类型检查
- 良好的 IDE 支持

## 开发指南

### 项目结构说明

```
.
├── src/
│   ├── capabilities/      # ⭐ 核心：能力扩展系统
│   ├── store/             # ⭐ 核心：状态管理
│   ├── view/              # 页面视图组件
│   ├── components/        # 通用组件
│   ├── hooks/             # 组合式函数
│   └── models/            # AI 模型集成
├── docs/                  # 📚 完整文档
├── public/                # 静态资源
└── vite.config.ts         # Vite 配置
```

### 开发流程

1. **添加能力**：在 `capabilities/` 目录创建新能力
2. **状态管理**：在 `store/` 目录添加相应的 store
3. **UI 组件**：在 `view/` 或 `components/` 实现 UI
4. **注册能力**：在 `capabilities/index.ts` 注册
5. **测试验证**：运行 `pnpm dev` 查看效果

### 代码规范

- 使用 TypeScript 编写代码
- 遵循 Vue 3 组合式 API 风格
- 保持组件单一职责
- 添加必要的注释和类型定义

## 扩展性

### 已支持的扩展

- ✅ 多 Chat 能力（共享或隔离）
- ✅ 多 Agent 能力
- ✅ 自定义 UI 布局
- ✅ 独立的工具面板
- ✅ 流式响应
- ✅ 主题定制
- ✅ 国际化

### 未来可扩展

- 🚀 SSE 流式 Agent
- 🚀 多 Agent 协作
- 🚀 Agent 调用 Chat
- 🚀 Chat 调用 Agent
- 🚀 Agent 任务队列
- 🚀 Agent Tool 插件
- 🚀 Capability 市场
- 🚀 动态加载能力

## License

查看 [LICENSE.txt](./LICENSE.txt)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 了解更多

- 查看 [架构文档](./docs/ARCHITECTURE.md) 了解整体设计
- 查看 [能力扩展系统](./docs/CAPABILITY_SYSTEM.md) 学习如何添加新能力
- 查看 [组件使用指南](./docs/COMPONENTS_GUIDE.md) 了解所有可用组件

---

**Mercury Chat** - 一个工业级的可扩展 AI 聊天平台

## 核心特性

### 能力插件化架构

Mercury Chat 的核心创新是**能力插件化系统**（Capability-driven UI Host Architecture）：

```typescript
// 定义一个新的 Chat 或 Agent 能力
export const MyCapability: Capability = {
    id: "my-capability",
    kind: "chat",  // 或 "agent"
    navbar: { titleKey: "my.title", icon: "/icon.svg", order: 10 },
    ui: { main: MyMainView, side: MySidePanel },
};

// 注册能力
registerCapability(MyCapability);
```

**支持的场景**：
- 0-N 个 Chat 能力（共享或隔离数据）
- 0-N 个 Agent 能力（独立执行逻辑）
- Chat 和 Agent 灵活混排
- 统一的侧边栏系统

### 灵活的数据管理

- **共享存储**：多个能力共用全局 store（适用于标准聊天）
- **隔离存储**：独立的会话管理（适用于特殊场景）
- **持久化**：支持 localStorage 和 Pinia 持久化

### 流式 AI 响应

```typescript
// 支持流式输出
client.chat({
    content: "你好",
    streamOptions: {
        onMessage: (chunk) => {
            // 实时更新消息
        },
        onComplete: () => {
            // 完成回调
        },
    },
});
```

## 目录结构

```
src/
├── App.vue                 # 应用主入口
├── main.ts                 # 应用启动
├── capabilities/           # 能力扩展系统 ⭐ 核心
│   ├── registry.ts        # 能力注册中心
│   ├── index.ts           # 能力统一导入
│   ├── chat/              # Chat 能力
│   ├── requirement/       # Agent 能力示例
│   └── common/            # 公共组件和工具
├── components/            # 通用组件
├── hooks/                 # 逻辑复用（组合式函数）
├── i18n/                  # 国际化配置
├── mock-data/             # 模拟数据
├── models/                # AI 模型集成
├── router/                # 路由配置
├── store/                 # 全局状态管理
│   ├── message-store.ts  # 消息管理 ⭐ 核心
│   ├── history-store.ts  # 历史记录
│   ├── model-store.ts    # 模型配置
│   └── ...
├── types/                 # TypeScript 类型定义
├── utils/                 # 工具方法
└── view/                  # 页面模块
    ├── chat-view/        # 聊天视图
    ├── input/            # 输入组件
    ├── history/          # 对话历史
    ├── navbar/           # 导航栏
    ├── chat-model/       # 对话模型
    ├── chat-setting/     # 聊天设置
    ├── knowledge/        # 知识库
    ├── welcome/          # 欢迎页
    └── ...
```
