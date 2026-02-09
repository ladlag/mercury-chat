# 组件使用指南

## 概述

Mercury Chat 提供了丰富的组件库，包括通用组件、能力组件和视图组件。本文档详细说明各组件的使用方法。

## 目录结构

```
src/
├── components/               # 通用组件
│   ├── Collapse.vue         # 折叠面板
│   ├── CollapseArrow.vue    # 折叠箭头
│   ├── svg-icons.tsx        # SVG 图标
│   └── index.ts             # 组件导出
├── capabilities/common/ui/  # 能力相关组件
│   ├── CapabilityViewLayout.vue     # 能力视图布局
│   ├── CapabilitySideDrawer.vue     # 侧边栏抽屉
│   ├── IsolatedChatView.vue         # 隔离聊天视图
│   └── IsolatedHistoryList.vue      # 隔离历史列表
└── view/                    # 页面视图组件
    ├── chat-view/          # 聊天视图
    ├── input/              # 输入组件
    ├── history/            # 历史记录
    ├── navbar/             # 导航栏
    ├── chat-model/         # 模型选择
    ├── chat-setting/       # 聊天设置
    ├── knowledge/          # 知识库
    ├── welcome/            # 欢迎页
    └── ...
```

## 通用组件

### 1. Collapse (折叠面板)

可折叠的内容容器，支持展开/收起动画。

#### 基本用法

```vue
<template>
  <Collapse v-model="isOpen" title="标题">
    <div>可折叠的内容</div>
  </Collapse>
</template>

<script setup lang="ts">
import { Collapse } from "@/components";
import { ref } from "vue";

const isOpen = ref(true);
</script>
```

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | boolean | false | 是否展开 |
| title | string | - | 标题文本 |

#### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| update:modelValue | boolean | 展开状态变化 |

### 2. CollapseArrow (折叠箭头)

折叠面板的箭头图标，会根据展开状态旋转。

#### 基本用法

```vue
<template>
  <div @click="toggle">
    <CollapseArrow :is-open="isOpen" />
  </div>
</template>

<script setup lang="ts">
import { CollapseArrow } from "@/components";
import { ref } from "vue";

const isOpen = ref(false);
const toggle = () => isOpen.value = !isOpen.value;
</script>
```

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| isOpen | boolean | false | 是否展开 |

### 3. SVG Icons

提供了一组 SVG 图标组件。

#### 可用图标

- `ExpandIcon`: 展开/收起图标
- `CloseIcon`: 关闭图标
- 更多图标请查看 `src/components/svg-icons.tsx`

#### 使用方法

```vue
<template>
  <ExpandIcon />
</template>

<script setup lang="ts">
import { ExpandIcon } from "@/components";
</script>
```

## 能力相关组件

### 1. CapabilityViewLayout

能力视图的标准布局容器。

#### 基本用法

```vue
<template>
  <CapabilityViewLayout>
    <d-card>
      <template #header>标题</template>
      <!-- 内容 -->
    </d-card>
  </CapabilityViewLayout>
</template>

<script setup lang="ts">
import CapabilityViewLayout from "@/capabilities/common/ui/CapabilityViewLayout.vue";
</script>
```

#### 特点

- 提供统一的内边距和居中布局
- 响应式设计
- 最大宽度限制（1200px）

### 2. CapabilitySideDrawer

统一的侧边栏抽屉组件，由 App.vue 自动管理。

#### 使用场景

不需要手动使用此组件，只需在 Capability 配置中声明：

```typescript
export const MyCapability: Capability = {
    // ...
    ui: {
        main: MyMain,
        side: MySideComponent,      // 侧边栏组件
        sideTitle: "工具面板",       // 标题
        sideWidth: 420,             // 宽度
    },
};
```

#### 触发侧边栏

在能力的主视图中触发：

```vue
<template>
  <d-button @click="openSide">打开工具面板</d-button>
</template>

<script setup lang="ts">
// 通过父组件传递的方法打开
const emit = defineEmits(['open-side']);
const openSide = () => emit('open-side');
</script>
```

### 3. IsolatedChatView

独立的聊天视图，支持会话隔离。

#### 基本用法

```vue
<template>
  <IsolatedChatView chat-id="my-chat" />
</template>

<script setup lang="ts">
import IsolatedChatView from "@/capabilities/common/ui/IsolatedChatView.vue";
</script>
```

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| chatId | string | 必需 | 聊天 ID，用于区分不同的聊天实例 |

#### 特点

- 完全独立的会话管理
- 自动保存到 localStorage
- 支持多个会话切换
- 复用默认 ChatView 的样式

### 4. IsolatedHistoryList

独立的历史记录列表组件。

#### 基本用法

```vue
<template>
  <IsolatedHistoryList
    :chat-id="chatId"
    :sessions="sessions"
    :active-session-id="activeSessionId"
    :on-select-session="selectSession"
  />
</template>

<script setup lang="ts">
import IsolatedHistoryList from "@/capabilities/common/ui/IsolatedHistoryList.vue";
import { useIsolatedChat } from "@/capabilities/common/useIsolatedChat";

const chatId = "my-chat";
const { sessions, activeSessionId, selectSession } = useIsolatedChat(chatId);
</script>
```

#### Props

| 属性 | 类型 | 说明 |
|------|------|------|
| chatId | string | 聊天 ID |
| sessions | Session[] | 会话列表 |
| activeSessionId | string | 当前激活的会话 ID |
| onSelectSession | (id: string) => void | 选择会话的回调 |

## 视图组件

### 1. ChatView (聊天视图)

主聊天界面，包含消息流、输入框等。

#### 组件结构

```
ChatView
├── NavbarTop          # 顶部导航栏
├── ChatProcess        # 消息流区域
│   └── MessageList    # 消息列表
├── Welcome            # 欢迎页（无消息时显示）
├── ChatModel          # 模型选择
├── ChatSetting        # 聊天设置
├── Knowledge          # 知识库
└── Input              # 输入框
```

#### 基本用法

```vue
<template>
  <ChatView />
</template>

<script setup lang="ts">
import { ChatView } from "@view/chat-view";
</script>
```

### 2. Input (输入组件)

消息输入框，支持多行输入、附件、语音等。

#### 特点

- 自动调整高度
- 支持快捷键（Enter 发送，Shift+Enter 换行）
- 支持附件上传
- 支持语音输入
- 支持 @ 模型

#### 使用方法

```vue
<template>
  <Input />
</template>

<script setup lang="ts">
import { Input } from "@view/input";
</script>
```

### 3. History (历史记录)

历史对话列表，支持选择、删除等操作。

#### 基本用法

```vue
<template>
  <History />
</template>

<script setup lang="ts">
import { History } from "@view/history";
</script>
```

#### 功能

- 显示历史对话列表
- 点击切换到对应对话
- 删除对话
- 按日期分组

### 4. NavBar (导航栏)

应用左侧导航栏，显示能力列表。

#### 基本用法

```vue
<template>
  <NavBar />
</template>

<script setup lang="ts">
import { NavBar } from "@view/navbar";
</script>
```

#### 特点

- 自动从能力注册中心读取
- 支持排序
- 支持主题切换
- 支持语言切换

### 5. ChatModel (模型选择)

AI 模型选择组件。

#### 基本用法

```vue
<template>
  <ChatModel />
</template>

<script setup lang="ts">
import { ChatModel } from "@view/chat-model";
</script>
```

#### 功能

- 显示可用模型列表
- 切换当前使用的模型
- 显示模型图标和名称

### 6. ChatSetting (聊天设置)

聊天相关设置面板。

#### 基本用法

```vue
<template>
  <ChatSetting />
</template>

<script setup lang="ts">
import { ChatSetting } from "@view/chat-setting";
</script>
```

#### 功能

- 配置聊天参数（温度、最大 token 等）
- 配置流式输出
- 其他聊天相关设置

### 7. Knowledge (知识库)

知识库选择组件。

#### 基本用法

```vue
<template>
  <Knowledge />
</template>

<script setup lang="ts">
import { Knowledge } from "@view/knowledge";
</script>
```

#### 功能

- 显示可用知识库
- 切换当前使用的知识库
- 管理知识库

### 8. Welcome (欢迎页)

首次进入或无消息时显示的欢迎页面。

#### 基本用法

```vue
<template>
  <Welcome />
</template>

<script setup lang="ts">
import { Welcome } from "@view/welcome";
</script>
```

#### 特点

- 显示欢迎信息
- 显示快速开始提示
- 显示推荐问题

### 9. ChatProcess (消息流)

显示对话消息的组件。

#### 基本用法

```vue
<template>
  <ChatProcess />
</template>

<script setup lang="ts">
import { ChatProcess } from "@view/chat-process";
</script>
```

#### 功能

- 显示消息列表
- 支持流式更新
- 显示加载状态
- 显示头像
- 支持消息复制
- 支持 Markdown 渲染

## 布局组件

### Layout

应用主布局组件。

#### 基本用法

```vue
<template>
  <Layout>
    <template #header>
      <NavBar />
    </template>
    
    <template #content>
      <!-- 主内容 -->
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { Layout } from "@view/layout";
</script>
```

#### Slots

| 插槽 | 说明 |
|------|------|
| header | 顶部区域（导航栏） |
| content | 主内容区域 |

## 组合式函数 (Composables)

### useIsolatedChat

用于创建隔离的聊天实例。

#### 基本用法

```typescript
import { useIsolatedChat } from "@/capabilities/common/useIsolatedChat";

const chatId = "my-chat";
const {
    sessions,              // 会话列表
    activeSessionId,       // 当前会话 ID
    messages,              // 当前会话的消息
    selectSession,         // 选择会话
    newSession,            // 创建新会话
    sendUser,              // 发送用户消息
    sendAssistant,         // 发送 AI 消息
} = useIsolatedChat(chatId);

// 使用
sendUser("你好");
sendAssistant("你好！有什么可以帮助你的？");
```

### useAgentSession

用于管理 Agent 的状态。

#### 基本用法

```typescript
import { useAgentSession } from "@/capabilities/common/agent-session";

const agentId = "my-agent";
const session = useAgentSession(agentId);

// 访问和修改状态
session.input = "用户输入";
session.output = "Agent 输出";
session.tools = ["tool1", "tool2"];
session.status = "running";

// 状态会自动保存到 localStorage
```

### useTheme

主题管理。

#### 基本用法

```typescript
import { useTheme } from "@/hooks";

const { initTheme, applyTheme, createCustomThemeFromConfig } = useTheme();

// 初始化主题
initTheme();

// 应用主题
applyTheme();

// 创建自定义主题
const customTheme = createCustomThemeFromConfig(themeConfig);
```

### useLang

语言管理。

#### 基本用法

```typescript
import { useLang } from "@/hooks";

// 初始化语言设置
useLang();

// 获取当前语言
import { useLangStore } from "@/store";
const langStore = useLangStore();
console.log(langStore.currentLang);  // "cn" 或 "en"
```

## UI 组件库 (Vue DevUI)

项目集成了 Vue DevUI 组件库，提供了丰富的 UI 组件：

### 常用组件

- `d-button`: 按钮
- `d-input`: 输入框
- `d-textarea`: 多行文本框
- `d-select`: 选择器
- `d-checkbox`: 复选框
- `d-radio`: 单选框
- `d-card`: 卡片
- `d-drawer`: 抽屉
- `d-popover`: 气泡提示
- `d-form`: 表单
- `d-form-item`: 表单项

### 使用示例

```vue
<template>
  <d-card>
    <template #header>标题</template>
    
    <d-form layout="vertical">
      <d-form-item label="姓名">
        <d-input v-model="name" />
      </d-form-item>
      
      <d-form-item label="描述">
        <d-textarea v-model="description" :rows="4" />
      </d-form-item>
      
      <d-button type="primary" @click="submit">提交</d-button>
    </d-form>
  </d-card>
</template>
```

## 样式约定

### CSS 变量

项目使用 CSS 变量管理主题：

```scss
// 颜色变量
$devui-brand         // 品牌色
$devui-base-bg       // 基础背景色
$devui-global-bg     // 全局背景色
$devui-text          // 文本颜色
$devui-line          // 线条颜色

// 圆角
$devui-border-radius
$devui-border-radius-full

// 阴影
--mc-float-block-shadow
```

### SCSS 混入

```scss
// 响应式断点
@media screen and (max-width: 940px) {
    // 移动端样式
}

@media screen and (max-width: 860px) {
    // 小屏设备
}
```

## 最佳实践

### 1. 组件封装

```vue
<!-- ✅ 推荐：单一职责 -->
<template>
  <div class="message-item">
    <Avatar :config="avatarConfig" />
    <MessageContent :content="content" />
  </div>
</template>

<!-- ❌ 避免：职责混杂 -->
<template>
  <div class="complex-component">
    <!-- 太多功能混在一起 -->
  </div>
</template>
```

### 2. Props 定义

```typescript
// ✅ 推荐：明确类型
interface Props {
    title: string;
    count?: number;
}
const props = defineProps<Props>();

// ❌ 避免：any 类型
const props = defineProps<any>();
```

### 3. 事件命名

```typescript
// ✅ 推荐：语义化命名
const emit = defineEmits<{
    'update:modelValue': [value: string];
    'submit': [data: FormData];
}>();

// ❌ 避免：不明确的命名
const emit = defineEmits(['change', 'click']);
```

### 4. 组件复用

```vue
<!-- ✅ 推荐：复用已有组件 -->
<template>
  <CapabilityViewLayout>
    <IsolatedChatView chat-id="my-chat" />
  </CapabilityViewLayout>
</template>

<!-- ❌ 避免：重复实现 -->
<template>
  <div>
    <!-- 复制粘贴已有组件的代码 -->
  </div>
</template>
```

## 总结

Mercury Chat 提供了完整的组件体系，包括：

1. **通用组件**：可在任何地方使用的基础组件
2. **能力组件**：支持能力扩展的专用组件
3. **视图组件**：构成页面的功能组件
4. **布局组件**：控制页面结构的容器组件
5. **组合式函数**：可复用的逻辑封装

合理使用这些组件，可以快速构建功能丰富、体验优秀的 AI 聊天应用。
