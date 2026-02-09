# 最佳实践与代码规范

## 概述

本文档总结了 Mercury Chat 项目的最佳实践和代码规范，帮助开发者编写高质量、可维护的代码。

## 目录

- [代码风格](#代码风格)
- [组件设计](#组件设计)
- [状态管理](#状态管理)
- [能力开发](#能力开发)
- [类型系统](#类型系统)
- [性能优化](#性能优化)
- [测试](#测试)
- [安全性](#安全性)

## 代码风格

### 命名规范

#### 文件命名

```
✅ 推荐
components/UserProfile.vue       # 组件：PascalCase
store/user-store.ts             # Store：kebab-case + store 后缀
hooks/use-auth.ts               # Hook：kebab-case + use 前缀
utils/format-date.ts            # 工具：kebab-case
types/user-types.ts             # 类型：kebab-case + types 后缀

❌ 避免
components/userprofile.vue
store/userStore.ts
hooks/Auth.ts
```

#### 变量命名

```typescript
// ✅ 推荐：语义化命名
const userName = "John";
const isLoading = false;
const messageList = [];
const MAX_RETRY_COUNT = 3;

// ❌ 避免：无意义命名
const x = "John";
const flag = false;
const arr = [];
const n = 3;
```

#### 函数命名

```typescript
// ✅ 推荐：动词开头，清晰描述功能
function fetchUserData() {}
function handleSubmit() {}
function validateEmail() {}
function shouldShowModal() {}

// ❌ 避免：名词或不清晰
function user() {}
function submit() {}
function email() {}
function modal() {}
```

### 代码格式

#### 缩进和空格

```typescript
// ✅ 推荐：一致的缩进（2 或 4 空格）
export const MyCapability: Capability = {
  id: "my-capability",
  kind: "chat",
  navbar: {
    titleKey: "navbar.my",
    icon: "/icon.svg",
  },
  ui: {
    main: MyMain,
  },
};

// ❌ 避免：不一致的缩进
export const MyCapability: Capability = {
id: "my-capability",
  kind: "chat",
    navbar: {
  titleKey: "navbar.my",
  },
};
```

#### 引号使用

```typescript
// ✅ 推荐：统一使用双引号
const message = "Hello World";
import { Component } from "vue";

// ❌ 避免：混用单双引号
const message = 'Hello World';
import { Component } from 'vue';
```

## 组件设计

### 单一职责原则

```vue
<!-- ✅ 推荐：职责明确的小组件 -->
<template>
  <div class="user-avatar">
    <img :src="avatar" :alt="name" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  avatar: string;
  name: string;
}
defineProps<Props>();
</script>

<!-- ❌ 避免：职责过多的大组件 -->
<template>
  <div class="user-profile">
    <!-- 头像、信息、设置、消息列表全在一个组件 -->
  </div>
</template>
```

### Props 定义

```typescript
// ✅ 推荐：明确的类型定义和默认值
interface Props {
  title: string;
  count?: number;
  isVisible?: boolean;
  items?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  isVisible: false,
  items: () => [],
});

// ❌ 避免：any 类型或缺少默认值
const props = defineProps<any>();
```

### 事件定义

```typescript
// ✅ 推荐：明确的事件类型
interface Emits {
  (e: "update:modelValue", value: string): void;
  (e: "submit", data: FormData): void;
  (e: "error", error: Error): void;
}

const emit = defineEmits<Emits>();

// 使用
emit("update:modelValue", "new value");
emit("submit", formData);

// ❌ 避免：不明确的事件
const emit = defineEmits(["change", "click"]);
```

### 组件组合

```vue
<!-- ✅ 推荐：通过组合实现复杂功能 -->
<template>
  <UserCard>
    <UserAvatar :user="user" />
    <UserInfo :user="user" />
    <UserActions :user="user" />
  </UserCard>
</template>

<!-- ❌ 避免：所有功能写在一个组件 -->
<template>
  <div class="user-card">
    <!-- 所有 HTML 都写在这里 -->
  </div>
</template>
```

## 状态管理

### Store 设计原则

```typescript
// ✅ 推荐：按功能域划分 Store
export const useUserStore = defineStore("user", () => {
  const currentUser = ref<User | null>(null);
  const isLoggedIn = computed(() => currentUser.value !== null);
  
  function login(user: User) {
    currentUser.value = user;
  }
  
  function logout() {
    currentUser.value = null;
  }
  
  return { currentUser, isLoggedIn, login, logout };
});

// ❌ 避免：所有状态都放在一个 Store
export const useGlobalStore = defineStore("global", () => {
  const user = ref(null);
  const messages = ref([]);
  const theme = ref("light");
  // ... 太多不相关的状态
});
```

### 避免直接修改状态

```typescript
// ✅ 推荐：通过方法修改状态
const store = useUserStore();
store.login(user);

// ❌ 避免：直接修改
const store = useUserStore();
store.currentUser = user;  // 绕过了封装
```

### Store 组合

```typescript
// ✅ 推荐：在方法内部引用其他 Store
export const useChatStore = defineStore("chat", () => {
  function sendMessage(content: string) {
    const userStore = useUserStore();
    const user = userStore.currentUser;
    
    // 使用 user 发送消息
  }
});

// ❌ 避免：在顶层引用造成循环依赖
import { useUserStore } from "./user-store";
const userStore = useUserStore();  // 可能导致问题

export const useChatStore = defineStore("chat", () => {
  // ...
});
```

## 能力开发

### 能力 ID 命名

```typescript
// ✅ 推荐：清晰的前缀 + 描述性名称
id: "chat-default"
id: "chat-coding-assistant"
id: "agent-requirement-analyzer"
id: "agent-code-reviewer"

// ❌ 避免：不清晰或重复
id: "default"
id: "chat1"
id: "my-agent"
```

### 能力注册顺序

```typescript
// ✅ 推荐：使用 order 控制顺序
export const ChatDefault: Capability = {
  navbar: { order: 10 },  // 最前面
};

export const ChatCoding: Capability = {
  navbar: { order: 20 },  // 第二
};

export const AgentRequirement: Capability = {
  navbar: { order: 100 },  // Agent 放后面
};

// ❌ 避免：依赖注册顺序
// 顺序应该通过 order 明确，而不是依赖代码书写顺序
```

### 能力隔离

```typescript
// ✅ 推荐：使用隔离存储避免冲突
export const IsolatedChatCapability: Capability = {
  id: "chat-isolated",
  ui: {
    main: defineComponent({
      setup() {
        // 使用独立的存储
        const { messages, sendMessage } = useIsolatedChat("chat-isolated");
        return { messages, sendMessage };
      },
    }),
  },
};

// ❌ 避免：多个能力共享状态导致冲突
// 除非明确需要共享，否则应该隔离
```

## 类型系统

### 定义清晰的类型

```typescript
// ✅ 推荐：完整的类型定义
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

interface Message {
  id: string;
  content: string;
  from: "user" | "assistant";
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// ❌ 避免：any 或不完整的类型
interface User {
  id: any;
  name: string;
  data: any;
}
```

### 使用联合类型

```typescript
// ✅ 推荐：使用联合类型限制值
type Status = "idle" | "loading" | "success" | "error";
type Role = "user" | "assistant" | "system";

const status: Status = "loading";  // 类型安全

// ❌ 避免：使用 string
const status: string = "loading";  // 可能输入错误的值
```

### 泛型使用

```typescript
// ✅ 推荐：使用泛型提高复用性
interface ApiResponse<T> {
  data: T;
  code: number;
  message: string;
}

function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  return fetch(url).then(r => r.json());
}

// 使用
const userResponse = await fetchData<User>("/api/user");
const messageResponse = await fetchData<Message[]>("/api/messages");

// ❌ 避免：为每种数据定义单独的类型
interface UserResponse {
  data: User;
  code: number;
  message: string;
}
```

## 性能优化

### 使用 computed 而非方法

```typescript
// ✅ 推荐：使用 computed 缓存计算结果
const filteredMessages = computed(() => {
  return messages.value.filter(m => m.from === "user");
});

// ❌ 避免：使用方法导致重复计算
function getFilteredMessages() {
  return messages.value.filter(m => m.from === "user");
}
```

### 使用 shallowRef 优化大对象

```typescript
// ✅ 推荐：大列表使用 shallowRef
const capabilities = shallowRef<Capability[]>([]);

// ❌ 避免：大对象使用 ref 导致深度响应
const capabilities = ref<Capability[]>([]);
```

### 组件懒加载

```typescript
// ✅ 推荐：大组件使用懒加载
const HeavyComponent = defineAsyncComponent(() => 
  import("./HeavyComponent.vue")
);

// ❌ 避免：同步导入所有组件
import HeavyComponent from "./HeavyComponent.vue";
```

### 避免不必要的响应式

```typescript
// ✅ 推荐：常量不需要响应式
const CONFIG = {
  MAX_SIZE: 1000,
  TIMEOUT: 5000,
};

// ❌ 避免：常量使用 ref
const CONFIG = ref({
  MAX_SIZE: 1000,
  TIMEOUT: 5000,
});
```

## 测试

### 单元测试

```typescript
// ✅ 推荐：测试核心逻辑
describe("useIsolatedChat", () => {
  it("should create new session", () => {
    const { sessions, newSession } = useIsolatedChat("test");
    
    expect(sessions.value).toHaveLength(0);
    newSession();
    expect(sessions.value).toHaveLength(1);
  });
  
  it("should add message to session", () => {
    const { messages, sendUser } = useIsolatedChat("test");
    
    sendUser("Hello");
    expect(messages.value).toHaveLength(1);
    expect(messages.value[0].content).toBe("Hello");
  });
});

// ❌ 避免：测试实现细节
it("should call localStorage.setItem", () => {
  // 不要测试内部实现
});
```

## 安全性

### 输入验证

```typescript
// ✅ 推荐：验证用户输入
function sendMessage(content: string) {
  if (!content.trim()) {
    throw new Error("Message cannot be empty");
  }
  
  if (content.length > MAX_LENGTH) {
    throw new Error("Message too long");
  }
  
  // 发送消息
}

// ❌ 避免：直接使用用户输入
function sendMessage(content: string) {
  api.send(content);  // 没有验证
}
```

### XSS 防护

```vue
<!-- ✅ 推荐：使用 Vue 的自动转义 -->
<template>
  <div>{{ userInput }}</div>
</template>

<!-- ❌ 避免：使用 v-html 显示用户输入 -->
<template>
  <div v-html="userInput"></div>
</template>
```

### 敏感数据

```typescript
// ✅ 推荐：不要在代码中硬编码密钥
const API_KEY = import.meta.env.VITE_API_KEY;

// ❌ 避免：硬编码敏感信息
const API_KEY = "sk-1234567890abcdef";
```

## 文档注释

### 函数注释

```typescript
/**
 * 发送消息到 AI 模型
 * 
 * @param content - 消息内容
 * @param options - 可选配置
 * @returns Promise<string> - AI 的回复
 * 
 * @example
 * ```typescript
 * const reply = await sendMessage("Hello", { model: "gpt-4" });
 * console.log(reply);
 * ```
 */
async function sendMessage(
  content: string, 
  options?: SendOptions
): Promise<string> {
  // 实现
}
```

### 组件注释

```vue
<!--
  UserAvatar 组件
  
  显示用户头像，支持圆形和方形两种样式
  
  Props:
  - user: User 对象，必需
  - size: 头像大小，可选，默认 40px
  - shape: 形状，'circle' | 'square'，默认 'circle'
  
  Example:
  ```vue
  <UserAvatar :user="currentUser" :size="60" shape="square" />
  ```
-->
<template>
  <div class="user-avatar">
    <!-- ... -->
  </div>
</template>
```

## Git 提交规范

### 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型（type）

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
perf: 性能优化
test: 测试
chore: 构建/工具更新
```

### 示例

```
feat(capability): add weather query agent

- Add WeatherAgentCapability
- Implement weather API integration
- Add weather tools panel

Closes #123
```

## 总结

遵循这些最佳实践可以帮助你：

1. ✅ 编写清晰、可维护的代码
2. ✅ 避免常见的错误和陷阱
3. ✅ 提高代码质量和性能
4. ✅ 更好地协作和代码审查
5. ✅ 构建健壮的应用

记住：**好的代码是写给人看的，顺便能被机器执行。**
