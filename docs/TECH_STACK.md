# 技术栈说明

## 核心架构

Mercury Chat (MateChat) 是基于 **DevUI 的 MateChat** (@matechat/core) 核心框架构建的 AI 聊天应用。

### 架构层次

```
┌──────────────────────────────────────────────┐
│   DevUI MateChat 核心框架                     │  ⭐⭐⭐ 主体
│   @matechat/core (1.5.2)                     │
│                                              │
│   提供：                                      │
│   - 聊天应用基础架构                          │
│   - 国际化支持 (McI18n)                      │
│   - 主题系统集成 (devui-theme)               │
│   - DevUI 风格的基础组件                     │
│   - 全局配置管理                             │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│   能力插件化扩展系统                          │  ⭐⭐ 扩展层
│                                              │
│   - 能力注册中心 (registry.ts)               │
│   - 动态组件渲染                             │
│   - Chat/Agent 能力管理                      │
│   - 数据隔离机制                             │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│   Vue DevUI 组件库                           │  ⭐ 辅助层
│   vue-devui (1.6.32)                         │
│                                              │
│   部分引入：                                  │
│   - d-button, d-card, d-form                │
│   - d-input, d-textarea, d-select           │
│   - d-checkbox, d-radio, d-drawer           │
│   - d-popover 等                            │
└──────────────────────────────────────────────┘
```

## 完整技术栈

### 核心框架层（主体）⭐⭐⭐

| 包名 | 版本 | 作用 |
|------|------|------|
| @matechat/core | 1.5.2 | **DevUI MateChat 核心框架**（主体） |
| @devui-design/icons | 1.4.0 | DevUI 图标库 |
| devui-theme | 0.1.0 | DevUI 主题系统 |

### 前端技术层 ⭐⭐

| 技术 | 版本 | 作用 |
|------|------|------|
| Vue | 3.5.13 | 渐进式前端框架 |
| TypeScript | 5.7.2 | 类型安全的 JavaScript 超集 |
| Vite | 6.2.0 | 快速的构建工具 |
| Pinia | 3.0.2 | Vue 3 的状态管理库 |
| Vue Router | 4.5.0 | 官方路由库 |

### UI 组件库层（辅助）⭐

| 包名 | 版本 | 作用 |
|------|------|------|
| vue-devui | 1.6.32 | **部分引入**作为辅助 UI 组件库 |
| Vue I18n | 11.1.2 | 国际化插件 |

### AI 集成层

| 包名 | 版本 | 作用 |
|------|------|------|
| OpenAI SDK | 5.3.0 | AI 模型集成 |

### 开发工具层

| 工具 | 版本 | 作用 |
|------|------|------|
| sass | 1.89.2 | CSS 预处理器 |
| dayjs | 1.11.13 | 日期处理库 |
| uuid | 11.1.0 | 唯一标识符生成 |
| unplugin-auto-import | 19.1.2 | 自动导入 API |

## 核心依赖集成

### MateChat 核心集成

```typescript
// main.ts
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import MateChat from '@matechat/core';        // ⭐ MateChat 核心框架（主体）
import VueDevui from 'vue-devui';             // 辅助 UI 组件库
import App from './App.vue';
import i18n from './i18n';

const pinia = createPinia();

createApp(App)
  .use(pinia)
  .use(MateChat)      // ⭐ 注册 MateChat 核心
  .use(VueDevui)      // 注册 Vue DevUI 组件（辅助）
  .use(i18n)
  .mount('#app');
```

### MateChat 国际化集成

```typescript
// store/lang-store.ts
import McI18n from '@matechat/core/Locale';   // ⭐ MateChat 国际化

export const useLangStore = defineStore('lang', () => {
  const updateCurrentLang = (val: LangType) => {
    currentLang.value = val;
    McI18n.use(val);                          // ⭐ 使用 MateChat 国际化
    locale.value = val;
    localStorage.setItem('matechat-lang', val);
  };
  
  return { currentLang, updateCurrentLang };
});
```

### MateChat 全局配置

```typescript
// global-config.ts
import type { IGlobalConfig } from "@/global-config-types";

export default {
  displayShape: "Immersive",
  title: "MateChat",                          // ⭐ MateChat 标题
} as IGlobalConfig;
```

## 组件使用统计

### MateChat 核心组件使用

- `ChatView` - MateChat 原生聊天视图（核心）
- `Layout` - MateChat 布局系统（核心）
- `McI18n` - MateChat 国际化（核心）
- 全局配置系统（核心）
- 主题系统（devui-theme）（核心）

### Vue DevUI 组件使用（辅助）

项目中约有 **122** 处使用 Vue DevUI 组件（以 `d-` 开头）：
- `d-card` - 卡片组件
- `d-button` - 按钮组件
- `d-form`, `d-form-item` - 表单组件
- `d-input`, `d-textarea` - 输入组件
- `d-select`, `d-checkbox`, `d-radio` - 选择组件
- `d-drawer` - 抽屉组件
- `d-popover` - 气泡提示
- 等等...

**使用方式**：作为辅助 UI 组件库，补充 MateChat 核心组件

## 设计原则

### 1. 基于成熟框架

- 项目核心基于 **DevUI 的 MateChat** (@matechat/core)
- 不重新发明轮子，复用成熟的聊天应用架构
- 保持 MateChat 的原生体验和 DevUI 设计风格

### 2. 能力扩展而非替换

- 在 MateChat 基础上**扩展**，而非替换
- 通过能力插件化系统添加新功能
- 不破坏 MateChat 原有机制

### 3. 保持风格一致

- 遵循 DevUI 设计规范
- 使用 DevUI 主题系统（devui-theme）
- 使用 DevUI 图标库（@devui-design/icons）
- 保持 MateChat 的 UI/UX 体验

### 4. 灵活集成

- MateChat 核心提供基础
- vue-devui 提供辅助 UI 组件
- 两者配合使用，发挥各自优势

## 项目定位

**Mercury Chat = DevUI MateChat 核心框架 + 能力插件化扩展系统 + vue-devui 辅助组件**

```
核心层：DevUI MateChat (@matechat/core)    ← 主体 ⭐⭐⭐
扩展层：能力插件化系统                      ← 创新点 ⭐⭐
辅助层：vue-devui 组件库                    ← 辅助 ⭐
```

## 总结

1. **项目主体**：基于 DevUI 的 MateChat (@matechat/core) 核心框架
2. **UI 组件**：vue-devui 作为辅助 UI 组件库，部分引入使用
3. **核心创新**：在 MateChat 基础上的能力插件化扩展系统
4. **设计风格**：遵循 DevUI 设计规范，保持 MateChat 原生体验

**这是一个基于成熟框架（DevUI MateChat）构建的工业级可扩展 AI 聊天平台！**
