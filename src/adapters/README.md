# 框架适配器目录

## 目的

此目录包含 MateChat 框架的适配器（Adapter），用于实现**业务代码与框架解耦**。

## 核心理念

### 为什么需要适配器？

1. **框架独立性**：业务代码不直接依赖 `@matechat/core`
2. **升级兼容性**：MateChat 升级时，只需修改适配器
3. **清晰边界**：明确哪些是框架代码，哪些是业务代码
4. **便于测试**：可以轻松 mock 适配器进行单元测试

### 架构分层

```
业务代码层 (src/capabilities, src/store, src/components)
      ↓ 通过适配器访问
适配器层 (src/adapters) ← 你在这里
      ↓
框架层 (@matechat/core)
```

## 现有适配器

### i18n-adapter.ts

国际化适配器，封装 MateChat 的 `McI18n` API。

**使用示例**：

```typescript
import { I18nAdapter } from '@/adapters/i18n-adapter';

// 切换语言
I18nAdapter.use('cn');

// 获取当前语言
const currentLang = I18nAdapter.getCurrentLanguage();
```

**优势**：
- 业务代码不需要 `import McI18n from '@matechat/core/Locale'`
- 框架升级只需修改适配器
- 支持版本兼容处理
- 便于单元测试

## 创建新适配器

### 步骤 1: 确定需要封装的框架功能

确认是否真的需要适配器：
- ✅ 需要：业务代码频繁使用的框架 API
- ✅ 需要：可能在框架升级时改变的 API
- ❌ 不需要：仅在 main.ts 中使用一次的初始化代码

### 步骤 2: 创建适配器文件

```typescript
// src/adapters/[功能]-adapter.ts

/**
 * [功能] 适配器
 * 
 * 目的：封装 MateChat 的 [功能] API
 */

import SomeAPI from '@matechat/core/SomeModule';

export interface I[功能]Adapter {
    // 定义接口
    someMethod(): void;
}

class MateChat[功能]Adapter implements I[功能]Adapter {
    private readonly mateChatVersion = '1.5.2';
    
    someMethod(): void {
        try {
            // 调用框架 API
            SomeAPI.doSomething();
        } catch (error) {
            console.error('[功能Adapter] Error:', error);
            // 降级处理
        }
    }
}

// 导出单例
export const [功能]Adapter = new MateChat[功能]Adapter();
```

### 步骤 3: 更新业务代码

```typescript
// 修改前
import SomeAPI from '@matechat/core/SomeModule';
SomeAPI.doSomething();

// 修改后
import { [功能]Adapter } from '@/adapters/[功能]-adapter';
[功能]Adapter.someMethod();
```

## 适配器设计原则

### 1. 单一职责

每个适配器只封装一个框架模块的功能。

```typescript
// ✅ 正确：单一职责
// i18n-adapter.ts - 只负责国际化
export const I18nAdapter = { use, getCurrentLanguage };

// ❌ 错误：职责混乱
export const AllInOneAdapter = { 
    switchLanguage,    // 国际化
    changeTheme,       // 主题
    saveConfig,        // 配置
};
```

### 2. 简单接口

提供简洁、易用的 API。

```typescript
// ✅ 正确：简单明了
I18nAdapter.use('cn');

// ❌ 错误：过于复杂
I18nAdapter.switchLanguageWithOptions({ lang: 'cn', persist: true, reload: false });
```

### 3. 错误处理

所有适配器方法都应有错误处理。

```typescript
someMethod(): void {
    try {
        FrameworkAPI.call();
    } catch (error) {
        console.error('[Adapter] Error:', error);
        // 降级处理或默认行为
    }
}
```

### 4. 版本兼容

为未来的框架升级预留兼容处理。

```typescript
someMethod(): void {
    if (this.hasNewAPI()) {
        // 新版本 API
        NewAPI.call();
    } else {
        // 旧版本 API
        OldAPI.call();
    }
}

private hasNewAPI(): boolean {
    return typeof NewAPI !== 'undefined';
}
```

## 不需要适配器的情况

以下情况**不需要**创建适配器：

### 1. 框架初始化

`src/main.ts` 中的框架初始化代码：

```typescript
// main.ts - 不需要适配器
import MateChat from '@matechat/core';
createApp(App).use(MateChat);
```

### 2. 全局配置

`src/global-config.ts` 中的配置：

```typescript
// global-config.ts - 不需要适配器
export default {
    displayShape: "Immersive",
    title: "MateChat",
};
```

### 3. 一次性使用

如果某个框架 API 只在一个地方使用一次，不需要适配器。

## 测试适配器

### 单元测试示例

```typescript
// i18n-adapter.spec.ts
import { I18nAdapter } from '@/adapters/i18n-adapter';

describe('I18nAdapter', () => {
    it('should switch language', () => {
        I18nAdapter.use('en');
        expect(I18nAdapter.getCurrentLanguage()).toBe('en');
    });
});
```

### Mock 适配器

```typescript
// 测试业务代码时 mock 适配器
jest.mock('@/adapters/i18n-adapter', () => ({
    I18nAdapter: {
        use: jest.fn(),
        getCurrentLanguage: jest.fn(() => 'cn'),
    },
}));
```

## 升级指南

当 MateChat 框架升级时：

1. **检查变更日志**：查看 MateChat 的 Breaking Changes
2. **更新适配器**：在适配器中添加版本兼容代码
3. **测试功能**：确保所有功能正常
4. **移除旧代码**：如果不再支持旧版本，可以移除兼容代码

## 常见问题

### Q: 所有框架 API 都需要适配器吗？

A: 不需要。只有业务代码频繁使用的 API 才需要适配器。

### Q: 适配器会影响性能吗？

A: 几乎没有影响。适配器只是一层薄薄的封装，主要开销在框架 API 本身。

### Q: 可以不用适配器吗？

A: 可以，但不推荐。使用适配器是最佳实践，能显著提高代码的可维护性。

## 参考资料

- [PROJECT_REQUIREMENTS.md](../../PROJECT_REQUIREMENTS.md) - 项目开发规范
- [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) - 架构文档
- [docs/TECH_STACK.md](../../docs/TECH_STACK.md) - 技术栈说明

---

**维护者**: 开发团队  
**最后更新**: 2026-02-10
