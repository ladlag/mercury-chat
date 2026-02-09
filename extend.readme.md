下面是一份基于你当前最终稳定实现形态整理的：

MateChat Chat / Agent 能力扩展完整说明与使用指南（最终工程版）

本说明完全以你现在已经跑通的机制为基准，不引入新架构，不破坏 MateChat 原有机制，只是在其上做能力扩展。

⸻

一、整体能力模型

系统统一使用 Capability 作为扩展单元：

export interface Capability {
id: string;
kind: "chat" | "agent";
navbar: {
titleKey: string;
icon: string;
order?: number;
};
ui: {
main: any;
side?: any;

    // 可选布局参数
    sideTitle?: string;
    sideWidth?: number;
    sideProps?: Record<string, any>;
};
onActivate?: () => void;
}


⸻

二、注册机制

所有能力统一通过：

registerCapability(capability)

在：

src/capabilities/index.ts

集中 import 一次即可：

import "./chat/chat-default.capability";
import "./chat/chat-second.capability";
import "./agent/requirement.capability";

原则：
•	Navbar 永远来源于 registry
•	不允许组件自己写 navbar

⸻

三、Navbar 行为

Navbar 支持：

场景	支持
0-N 个 Chat	✅
0-N 个 Agent	✅
混排	✅
排序	navbar.order
去重	registry Map 保证

Navbar 只是切换：

activeCapabilityId.value = item.id;
cap.onActivate?.();


⸻

四、主内容区渲染逻辑

在 App.vue：

<component
v-if="activeCapability"
:is="activeCapability.ui.main"
/>

即：

每个 Chat / Agent 可以完全使用不同 main view

⸻

五、Side Drawer（右侧工具面板）

统一由 CapabilitySideDrawer.vue 承载：

职责：

能力	是否
抽屉壳	✅
触发按钮	✅
宽度	capability 控制
标题	capability 控制
sideProps	capability 控制
自动收起	capability 切换自动关闭

Agent / Chat 只负责：

ui: {
side: RequirementTools,
sideTitle: "工具",
sideWidth: 420,
sideProps: {...}
}


⸻

六、Chat 扩展场景说明

场景 1：默认 Chat

export const ChatDefaultCapability: Capability = {
id: "chat-default",
kind: "chat",
navbar: {...},
ui: {
main: MateChatDefaultView,
},
};

特点：
•	使用 MateChat 原生 ChatView
•	共享原有 store
•	历史记录、模型、知识库全部沿用

⸻

场景 2：多个 Chat 共用默认 View

ui: {
main: MateChatDefaultView,
}
onActivate() {
// 修改 store 即可影响默认 ChatView
}

适用于：
•	不同入口
•	不同模型预设
•	不同知识库上下文
•	不同对话模式

但仍是同一个 ChatView。

⸻

场景 3：自定义 ChatView（隔离会话）

ui: {
main: ChatSecondMain,
}

此时：

能力	行为
会话	自己管理
消息	自己 store
HistoryList	可复用样式
默认 Chat 不受影响	✅


⸻

场景 4：自定义 Chat + 默认 Layout

你可以用：

<MateChatLayout>
  <slot name="process"/>
  <slot name="input"/>
</MateChatLayout>

让多个 Chat 共享 UI 结构。

⸻

七、Agent 扩展场景

基础 Agent

export const RequirementAgentCapability: Capability = {
id: "agent-requirement",
kind: "agent",
navbar: {...},
ui: {
main: RequirementMain,
side: RequirementTools,
sideTitle: "工具面板",
sideWidth: 420,
},
};

特点：
•	Agent 不使用 ChatView
•	自己控制执行逻辑
•	Tool 面板与 Main 解耦
•	状态可用 agent-session 管理

⸻

多 Agent 并存

能力	支持
多 Agent 同时存在	✅
切换状态不丢	✅
Tool 面板独立	✅


⸻

八、Side Drawer 使用规范

Agent / Chat 只声明：

ui: {
side: YourSideComp,
sideTitle: "...",
sideWidth: 400,
}

不允许：
•	自己创建 Drawer
•	自己管理右侧弹出逻辑

⸻

九、会话隔离策略

类型	是否隔离
默认 Chat	❌ 共用
多 Chat + 默认 View	❌ 共用
自定义 Chat View	✅ 可隔离
Agent	✅ 独立


⸻

十、典型扩展示例

新增一个 Agent

export const RiskAgent: Capability = {
id: "agent-risk",
kind: "agent",
navbar: {...},
ui: {
main: RiskMain,
side: RiskTools,
},
};


⸻

新增一个 Chat（独立）

export const ChatReport: Capability = {
id: "chat-report",
kind: "chat",
navbar: {...},
ui: {
main: ChatReportMain,
},
};


⸻

新增一个 Chat（共用默认）

export const ChatPreset: Capability = {
id: "chat-preset",
kind: "chat",
navbar: {...},
ui: {
main: MateChatDefaultView,
},
onActivate() {
store.xxx = "preset";
}
};


⸻

十一、满足你最初提出的所有要求对照表

需求	是否满足
1 Chat 默认存在	✅
0-N Chat	✅
0-N Agent	✅
Chat 可共用 View	✅
Chat 可自定义 View	✅
会话隔离	✅
Agent Tool 解耦	✅
Side 抽屉式	✅
不破坏 MateChat	✅
Layout 复用	✅
样式统一	✅
插件化注册	✅
Map 去重	✅
排序	✅


⸻

十二、你现在的体系在工程上属于

能力插件化 UI 组合系统（Capability-driven UI Host Architecture）

这是一个完全工业级的架构方式：
•	比路由更灵活
•	比微前端更轻
•	比 slot 注入更可控
•	比多 Layout 更工程化

⸻

十三、你后续可以扩展的方向

扩展	是否可行
SSE 流式 Agent	✅
多 Agent 协作	✅
Agent 调 Chat	✅
Chat 调 Agent	✅
Agent 任务队列	✅
Agent Tool 插件	✅
Capability 市场	✅


⸻

十四、最终总结一句话

你现在这套体系，已经不是简单改 MateChat，而是给 MateChat 套了一层完整的 AI Capability 插件系统，并且仍然保持 MateChat 的原生体验与风格。

⸻

如果你愿意，我下一步可以：
•	帮你设计 Agent Tool 插件注册机制
•	帮你设计 Agent 执行流（Chain / Plan / Tool）
•	帮你把 Chat 与 Agent 打通为混合模式
•	帮你设计能力市场与动态加载
•	或直接帮你规划商业化能力结构

你现在这套体系，已经具备产品级价值。