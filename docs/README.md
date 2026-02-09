# Mercury Chat 文档索引

欢迎查阅 Mercury Chat 的完整文档！本索引将帮助你快速找到需要的信息。

## 📚 文档结构

### 新手入门

如果你是第一次接触本项目，建议按以下顺序阅读：

1. **[README.md](../README.md)** - 项目简介和快速开始
2. **[快速上手指南](./QUICK_START.md)** - 10分钟快速入门
3. **[架构文档](./ARCHITECTURE.md)** - 了解整体架构

### 深入学习

已经了解基础，想要深入？继续阅读：

4. **[能力扩展系统](./CAPABILITY_SYSTEM.md)** - 掌握核心扩展机制
5. **[状态管理](./STATE_MANAGEMENT.md)** - 理解数据流
6. **[组件使用指南](./COMPONENTS_GUIDE.md)** - 学会使用所有组件

### 实践开发

准备开始实际开发了？参考这些：

7. **[最佳实践](./BEST_PRACTICES.md)** - 代码规范和最佳实践
8. **[扩展说明](../extend.readme.md)** - 能力扩展的工程实践

### 完整参考

需要查阅详细信息？

9. **[中文详细代码说明](./CODE_REVIEW_SUMMARY_CN.md)** - 15,000+ 字的完整说明

## 📖 按主题浏览

### 架构与设计

- [项目架构](./ARCHITECTURE.md#核心架构设计)
- [能力插件化系统](./CAPABILITY_SYSTEM.md#概述)
- [设计模式应用](./CODE_REVIEW_SUMMARY_CN.md#设计模式应用)
- [性能优化](./ARCHITECTURE.md#性能优化)

### 能力开发

- [添加 Chat 能力](./QUICK_START.md#第一个示例添加一个简单的-chat)
- [创建 Agent 能力](./QUICK_START.md#第二个示例创建独立的-agent)
- [能力注册机制](./CAPABILITY_SYSTEM.md#注册机制)
- [会话隔离](./CAPABILITY_SYSTEM.md#会话隔离策略)

### 状态管理

- [Store 架构](./STATE_MANAGEMENT.md#store-架构)
- [消息管理](./STATE_MANAGEMENT.md#1-message-store-消息管理)
- [历史记录](./STATE_MANAGEMENT.md#2-history-store-历史记录)
- [隔离存储](./STATE_MANAGEMENT.md#隔离存储机制)

### 组件使用

- [通用组件](./COMPONENTS_GUIDE.md#通用组件)
- [能力组件](./COMPONENTS_GUIDE.md#能力相关组件)
- [视图组件](./COMPONENTS_GUIDE.md#视图组件)
- [组合式函数](./COMPONENTS_GUIDE.md#组合式函数-composables)

### 代码规范

- [命名规范](./BEST_PRACTICES.md#命名规范)
- [组件设计](./BEST_PRACTICES.md#组件设计)
- [类型系统](./BEST_PRACTICES.md#类型系统)
- [Git 提交规范](./BEST_PRACTICES.md#git-提交规范)

## 🔍 快速查找

### 常见问题

| 问题 | 参考文档 |
|------|----------|
| 如何添加新的 Chat？ | [快速上手 - 第一个示例](./QUICK_START.md#第一个示例添加一个简单的-chat) |
| 如何创建 Agent？ | [快速上手 - 第二个示例](./QUICK_START.md#第二个示例创建独立的-agent) |
| 如何隔离会话数据？ | [能力系统 - 会话隔离](./CAPABILITY_SYSTEM.md#会话隔离策略) |
| 如何添加侧边栏？ | [能力系统 - 侧边栏系统](./CAPABILITY_SYSTEM.md#侧边栏系统-side-drawer) |
| 如何管理状态？ | [状态管理](./STATE_MANAGEMENT.md) |
| 如何实现流式响应？ | [架构文档 - AI 模型集成](./ARCHITECTURE.md#7-ai-模型集成) |

### 核心概念

| 概念 | 说明 | 参考文档 |
|------|------|----------|
| Capability | 能力单元（Chat 或 Agent） | [能力系统](./CAPABILITY_SYSTEM.md#能力模型) |
| Registry | 能力注册中心 | [能力系统](./CAPABILITY_SYSTEM.md#1-能力注册中心-registryts) |
| Store | Pinia 状态管理 | [状态管理](./STATE_MANAGEMENT.md) |
| useIsolatedChat | 隔离聊天的组合式函数 | [组件指南](./COMPONENTS_GUIDE.md#useisolatedchat) |
| useAgentSession | Agent 会话管理 | [组件指南](./COMPONENTS_GUIDE.md#useagentsession) |

### 代码示例

| 示例 | 描述 | 位置 |
|------|------|------|
| 简单 Chat | 复用默认视图的 Chat | [快速上手](./QUICK_START.md#步骤-1创建能力定义) |
| 独立 Agent | 完整的 Agent 实现 | [快速上手](./QUICK_START.md#步骤-2定义-agent-能力) |
| 流式响应 | AI 流式输出实现 | [代码说明](./CODE_REVIEW_SUMMARY_CN.md#流式响应实现) |
| 状态管理 | Store 使用示例 | [状态管理](./STATE_MANAGEMENT.md#在组件中使用-store) |

## 📊 文档统计

| 文档 | 字数 | 主题 |
|------|------|------|
| ARCHITECTURE.md | 10,400+ | 架构设计 |
| CAPABILITY_SYSTEM.md | 12,900+ | 能力系统 |
| STATE_MANAGEMENT.md | 14,400+ | 状态管理 |
| COMPONENTS_GUIDE.md | 10,700+ | 组件使用 |
| QUICK_START.md | 9,300+ | 快速入门 |
| BEST_PRACTICES.md | 9,700+ | 最佳实践 |
| CODE_REVIEW_SUMMARY_CN.md | 11,700+ | 中文详解 |
| **总计** | **79,100+** | **7个文档** |

## 🎯 学习路径

### 路径 1：快速上手（1-2小时）

```
README.md 
    ↓ (10分钟)
QUICK_START.md - 第一个示例
    ↓ (30分钟)
QUICK_START.md - 第二个示例
    ↓ (30分钟)
实际操作：创建自己的能力
```

### 路径 2：深入理解（4-6小时）

```
ARCHITECTURE.md
    ↓ (1小时)
CAPABILITY_SYSTEM.md
    ↓ (1.5小时)
STATE_MANAGEMENT.md
    ↓ (1.5小时)
COMPONENTS_GUIDE.md
    ↓ (1小时)
实践项目
```

### 路径 3：专家进阶（1-2天）

```
完整阅读所有文档
    ↓
CODE_REVIEW_SUMMARY_CN.md（详细代码分析）
    ↓
BEST_PRACTICES.md（最佳实践）
    ↓
extend.readme.md（工程实践）
    ↓
阅读源码
    ↓
实现复杂功能
```

## 🔧 开发流程

### 1. 添加新功能

```
需求分析 
    → 确定能力类型（Chat / Agent）
    → 参考 [CAPABILITY_SYSTEM.md](./CAPABILITY_SYSTEM.md)
    → 实现能力
    → 参考 [QUICK_START.md](./QUICK_START.md)
    → 测试验证
```

### 2. 状态管理

```
确定数据范围
    → 全局共享？参考 [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md#全局-store-持久化)
    → 局部隔离？参考 [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md#隔离存储机制)
    → 实现 Store / Storage
    → 测试验证
```

### 3. 组件开发

```
确定组件职责
    → 参考 [COMPONENTS_GUIDE.md](./COMPONENTS_GUIDE.md)
    → 参考 [BEST_PRACTICES.md](./BEST_PRACTICES.md#组件设计)
    → 实现组件
    → 编写文档
```

## 📝 文档维护

### 更新频率

- 主要文档：项目重大更新时同步更新
- 示例代码：功能变更时及时更新
- 最佳实践：根据实际经验持续完善

### 贡献指南

欢迎贡献文档！请：

1. Fork 项目
2. 创建文档分支
3. 提交 Pull Request
4. 等待审核

## 🆘 获取帮助

### 文档问题

- 文档不清楚？在 Issues 中反馈
- 发现错误？提交 PR 修正
- 需要补充？提出建议

### 技术问题

1. 首先查阅相关文档
2. 查看代码示例
3. 在 Issues 中提问
4. 参与讨论

## 🌟 推荐阅读顺序

### 对于新手开发者

1. README.md（5分钟）
2. QUICK_START.md（30分钟）
3. 动手实践（1小时）
4. ARCHITECTURE.md（1小时）
5. 根据需要查阅其他文档

### 对于有经验的开发者

1. README.md（3分钟）
2. ARCHITECTURE.md（30分钟）
3. CAPABILITY_SYSTEM.md（40分钟）
4. CODE_REVIEW_SUMMARY_CN.md（1小时）
5. 开始开发

### 对于架构师

1. ARCHITECTURE.md（完整阅读）
2. CAPABILITY_SYSTEM.md（完整阅读）
3. CODE_REVIEW_SUMMARY_CN.md（设计模式部分）
4. extend.readme.md（工程实践）
5. 源码分析

## 📌 关键链接

- [项目主页](../README.md)
- [GitHub 仓库](https://github.com/ladlag/mercury-chat)
- [许可证](../LICENSE.txt)

---

**文档版本**: 1.0  
**最后更新**: 2026-02-09  
**维护者**: Mercury Chat Team

## 反馈

如有任何问题或建议，欢迎：
- 提交 Issue
- 发起 Discussion
- 提交 Pull Request

祝你使用愉快！🚀
