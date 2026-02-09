import type {Capability} from "@/capabilities/registry";
import RequirementMain from "./ui/RequirementMain.vue";
import RequirementTools from "./ui/RequirementTools.vue";

export const RequirementAgentCapability: Capability = {
    id: "agent-requirement",
    kind: "agent",
    navbar: {titleKey: "agent.requirement", icon: "/agent-requirement.svg", order: 100},
    ui: {
        main: RequirementMain,
        side: RequirementTools,

        // ✅ 可选：布局参数
        sideTitleKey: "agent.requirement.tools",
        sideWidth: 420,
        sideProps: { /* 比如：agentId / permissions / env */},
    },
};