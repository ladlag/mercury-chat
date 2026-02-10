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

### 原则 7: 代码独立性和框架升级兼容性 ⭐⭐⭐

**保证业务代码独立，便于 MateChat 框架升级时不影响业务逻辑**

#### 核心目标

1. **业务代码与框架解耦**：业务逻辑不直接依赖框架内部实现
2. **框架升级零影响**：MateChat 版本升级不需要修改业务代码
3. **清晰的依赖边界**：明确哪些是框架代码，哪些是业务代码

#### 分层架构

```
┌─────────────────────────────────────────┐
│   业务代码层 (Business Layer)            │  ← 你的代码
│   - capabilities/ (Agent 实现)           │
│   - store/ (业务状态)                    │
│   - components/ (业务组件)               │
└─────────────────────────────────────────┘
              ↓ (最小化依赖)
┌─────────────────────────────────────────┐
│   适配器层 (Adapter Layer) - 可选        │  ← 隔离层
│   - adapters/matechat-adapter.ts       │
│   - adapters/i18n-adapter.ts           │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   框架层 (Framework Layer)               │  ← MateChat
│   - @matechat/core                     │
│   - @matechat/core/Locale              │
└─────────────────────────────────────────┘
```

#### 最小化框架依赖

**规则 1: 限制框架导入位置**

```typescript
// ✅ 正确做法：仅在必要位置导入框架
// src/main.ts - 框架初始化（必需）
import MateChat from '@matechat/core';
createApp(App).use(MateChat);

// src/adapters/i18n-adapter.ts - 适配器封装（推荐）
import McI18n from '@matechat/core/Locale';
export const I18nAdapter = {
    use: (lang: string) => McI18n.use(lang)
};

// ❌ 错误做法：业务代码直接导入框架
// src/capabilities/my-agent/my-agent.ts
import McI18n from '@matechat/core/Locale';  // 不要这样做
McI18n.use('cn');
```

**允许导入的位置**：
- `src/main.ts` - 框架初始化
- `src/adapters/` - 适配器封装
- `src/global-config.ts` - 全局配置

**禁止导入的位置**：
- `src/capabilities/` - 业务能力
- `src/store/` - 业务状态（除特殊情况）
- `src/components/` - 业务组件

**规则 2: 使用适配器模式（推荐）**

```typescript
// ✅ 正确做法：创建适配器
// src/adapters/i18n-adapter.ts
import McI18n from '@matechat/core/Locale';

export const I18nAdapter = {
    use(lang: string) {
        try {
            // MateChat v1.x API
            McI18n.use(lang);
        } catch (error) {
            console.error('i18n adapter error:', error);
            // 可以添加降级处理
        }
    },
    
    getCurrentLanguage(): string {
        // 封装获取当前语言的逻辑
        return localStorage.getItem('matechat-lang') || 'cn';
    }
};

// 业务代码使用适配器
// src/store/lang-store.ts
import { I18nAdapter } from '@/adapters/i18n-adapter';

export const useLangStore = defineStore('lang', () => {
    const updateCurrentLang = (val: LangType) => {
        // 通过适配器访问框架
        I18nAdapter.use(val);
        localStorage.setItem('matechat-lang', val);
    };
    return { updateCurrentLang };
});

// ❌ 错误做法：直接依赖框架
import McI18n from '@matechat/core/Locale';
McI18n.use('cn');  // 直接调用，框架升级可能破坏
```

**规则 3: 版本兼容处理**

```typescript
// ✅ 正确做法：适配器中处理版本兼容
// src/adapters/matechat-adapter.ts
export const MateChatAdapter = {
    version: '1.5.2',  // 记录当前使用的版本
    
    // 检测 API 可用性
    checkAPIAvailability() {
        const hasNewAPI = typeof McI18n.setLanguage !== 'undefined';
        return {
            v1: !hasNewAPI,  // 旧版 API
            v2: hasNewAPI,   // 新版 API
        };
    },
    
    // 兼容不同版本
    setLanguage(lang: string) {
        const api = this.checkAPIAvailability();
        
        if (api.v2) {
            // MateChat v2.x 新 API
            McI18n.setLanguage(lang);
        } else {
            // MateChat v1.x 旧 API
            McI18n.use(lang);
        }
    }
};
```

**规则 4: 依赖隔离检查清单**

开发新功能时，检查：
- [ ] 是否需要直接导入 `@matechat/core`？
- [ ] 能否通过适配器访问框架功能？
- [ ] 能否使用 Vue 生态的替代方案？
- [ ] 是否创建了清晰的依赖边界？

#### 框架升级策略

**升级准备清单**：

1. **升级前检查**
   ```bash
   # 1. 检查所有框架导入
   grep -r "@matechat/core" src/
   
   # 2. 确认导入位置是否合理
   # 应该只在 main.ts 和 adapters/ 中
   
   # 3. 检查适配器是否完整
   ls -la src/adapters/
   ```

2. **升级中测试**
   ```bash
   # 1. 更新依赖
   pnpm update @matechat/core
   
   # 2. 运行项目
   pnpm dev
   
   # 3. 测试核心功能
   - 能力切换
   - 国际化
   - 主题系统
   - 业务功能
   ```

3. **升级后验证**
   - 所有能力正常加载
   - 国际化正常工作
   - 主题正常切换
   - 业务功能无异常
   - 无控制台错误

**降级和回滚**：

如果升级导致问题，可以快速回滚：

```bash
# 回滚到指定版本
pnpm add @matechat/core@1.5.2 -E

# 重新运行
pnpm dev
```

由于业务代码独立，回滚框架不会影响业务逻辑。

#### 实施建议

**立即执行（强烈推荐）**：

1. **创建适配器目录**
   ```bash
   mkdir -p src/adapters
   ```

2. **创建国际化适配器**
   ```typescript
   // src/adapters/i18n-adapter.ts
   import McI18n from '@matechat/core/Locale';
   
   export const I18nAdapter = {
       use: (lang: string) => McI18n.use(lang),
       getCurrentLanguage: () => localStorage.getItem('matechat-lang') || 'cn',
   };
   ```

3. **更新业务代码**
   ```typescript
   // src/store/lang-store.ts
   - import McI18n from '@matechat/core/Locale';
   + import { I18nAdapter } from '@/adapters/i18n-adapter';
   
   - McI18n.use(val);
   + I18nAdapter.use(val);
   ```

**渐进改进（推荐）**：

1. 新功能开发时使用适配器
2. 逐步重构现有代码
3. 建立框架升级测试流程
4. 完善适配器功能

**长期维护**：

1. 定期检查框架依赖
2. 保持适配器更新
3. 监控 MateChat 版本更新
4. 测试框架兼容性

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
- [ ] **是否最小化了框架依赖？** ⭐ 新增
- [ ] **是否通过适配器访问框架？** ⭐ 新增
- [ ] **业务代码是否独立于框架？** ⭐ 新增

### 4. 框架依赖检查（新增）⭐

**检查框架导入位置**：

```bash
# 检查所有 @matechat/core 导入
cd /home/runner/work/mercury-chat/mercury-chat
grep -r "import.*@matechat/core" src/ --include="*.ts" --include="*.vue"

# 应该只在以下位置：
# ✅ src/main.ts - 框架初始化
# ✅ src/adapters/*.ts - 适配器封装
# ❌ 其他位置 - 需要重构
```

**检查适配器覆盖**：

```bash
# 检查是否有适配器
ls -la src/adapters/

# 推荐的适配器：
# - i18n-adapter.ts (国际化)
# - theme-adapter.ts (主题，如需要)
# - config-adapter.ts (配置，如需要)
```

**验证业务代码独立性**：

```bash
# 业务代码不应直接导入框架
grep -r "@matechat/core" src/capabilities/ src/store/ src/components/

# 如果有结果，需要重构使用适配器
```

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

### MateChat 框架升级指南（新增）⭐

#### 升级前准备

1. **检查当前框架依赖**
   ```bash
   # 查看当前版本
   cat package.json | grep "@matechat/core"
   
   # 检查所有框架导入
   grep -r "@matechat/core" src/ --include="*.ts" --include="*.vue"
   
   # 确认导入位置是否符合规范
   # ✅ 应该只在 main.ts 和 adapters/ 中
   ```

2. **备份当前状态**
   ```bash
   # 创建备份分支
   git checkout -b backup-before-matechat-upgrade
   git push origin backup-before-matechat-upgrade
   
   # 或创建 tag
   git tag matechat-v1.5.2
   git push origin matechat-v1.5.2
   ```

3. **阅读升级日志**
   - 查看 MateChat 的 CHANGELOG
   - 确认 Breaking Changes
   - 了解新 API 和废弃的 API

#### 升级步骤

1. **更新依赖**
   ```bash
   # 更新到指定版本
   pnpm add @matechat/core@2.0.0
   
   # 或更新到最新版本
   pnpm update @matechat/core
   ```

2. **更新适配器**
   ```typescript
   // src/adapters/i18n-adapter.ts
   // 添加版本兼容逻辑
   export const I18nAdapter = {
       use(lang: string) {
           // 检测 API 版本
           if (typeof McI18n.setLanguage !== 'undefined') {
               // v2.x 新 API
               McI18n.setLanguage(lang);
           } else {
               // v1.x 旧 API
               McI18n.use(lang);
           }
       }
   };
   ```

3. **本地测试**
   ```bash
   # 启动开发服务器
   pnpm dev
   
   # 测试核心功能
   # - 能力切换
   # - 国际化
   # - 主题系统
   # - 所有 Agent 功能
   ```

4. **检查控制台错误**
   - 打开浏览器控制台
   - 查看是否有错误或警告
   - 测试所有功能路径

5. **运行构建测试**
   ```bash
   # 构建生产版本
   pnpm build
   
   # 预览生产版本
   pnpm preview
   ```

#### 升级验证清单

- [ ] 项目正常启动（`pnpm dev`）
- [ ] 所有能力正常加载
- [ ] 导航栏切换正常
- [ ] 国际化切换正常
- [ ] 主题系统正常
- [ ] 所有 Agent 功能正常
- [ ] 聊天功能正常
- [ ] 历史记录正常
- [ ] 无控制台错误
- [ ] 生产构建成功

#### 升级失败回滚

如果升级导致问题，立即回滚：

```bash
# 方法 1: 回滚到指定版本
pnpm add @matechat/core@1.5.2 -E

# 方法 2: 恢复 package.json
git checkout package.json package-lock.json
pnpm install

# 方法 3: 切换到备份分支
git checkout backup-before-matechat-upgrade
```

#### 升级后优化

1. **移除兼容代码**
   - 如果完全升级到新版本
   - 可以移除适配器中的旧版本兼容代码

2. **更新文档**
   - 更新 PROJECT_REQUIREMENTS.md 中的版本号
   - 更新 docs/TECH_STACK.md

3. **提交变更**
   ```bash
   git add .
   git commit -m "chore: upgrade @matechat/core to v2.0.0"
   git push
   ```

#### 版本兼容性记录

| MateChat 版本 | 兼容性 | 变更说明 | 升级指南 |
|--------------|--------|----------|----------|
| 1.5.2 | ✅ 当前版本 | - | - |
| 2.0.0 | 🚧 待测试 | API 变更 | 需要更新适配器 |

---

## 联系和支持

如有疑问或需要澄清，请参考：
- [架构文档](./docs/ARCHITECTURE.md)
- [能力扩展系统](./docs/CAPABILITY_SYSTEM.md)
- [技术栈说明](./docs/TECH_STACK.md)

## 核心原则总结

### 7 大开发原则（必须遵循）

1. ⭐⭐⭐ **能力插件化系统** - 所有功能通过 Capability 实现
2. ⭐⭐⭐ **在 MateChat 基础上扩展** - 不破坏核心机制
3. ⭐⭐⭐ **不破坏原有机制** - 向后兼容、数据隔离
4. ⭐⭐ **组件优先级** - MateChat > vue-devui > 自定义
5. ⭐⭐⭐ **不改变框架机制** - 不修改核心文件
6. ⭐⭐ **避免过多自定义代码** - 复用胜于重写
7. ⭐⭐⭐ **代码独立性和框架升级兼容性** - 业务代码与框架解耦 ⭐ 新增

### 关键要点

✅ **必须做的**：
- 通过能力插件化系统添加功能
- 优先使用 MateChat 和 vue-devui 组件
- 业务代码独立，最小化框架依赖
- 使用适配器模式访问框架 API
- 保持清晰的依赖边界

❌ **禁止做的**：
- 修改核心框架文件（registry.ts, App.vue, main.ts）
- 业务代码直接导入 `@matechat/core`
- 破坏现有功能
- 重复实现已有功能
- 绕过能力系统

⚠️ **需要注意的**：
- 框架升级时通过适配器实现兼容
- 定期检查框架依赖位置
- 保持业务代码与框架解耦
- 遵循目录结构规范

---

**最后更新**: 2026-02-10  
**版本**: 1.1.0 (新增原则 7: 代码独立性和框架升级兼容性)  
**状态**: 活跃维护中

**变更日志**：
- 2026-02-10 v1.1.0: 新增原则 7 - 代码独立性和框架升级兼容性
- 2026-02-10 v1.1.0: 新增适配器模式指南
- 2026-02-10 v1.1.0: 新增 MateChat 框架升级指南
- 2026-02-10 v1.1.0: 新增框架依赖检查清单
- 2026-02-10 v1.0.0: 初始版本，定义 6 大开发原则
