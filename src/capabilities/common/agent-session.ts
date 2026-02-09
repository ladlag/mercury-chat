import { reactive } from "vue";

export interface AgentSession {
    input: string;
    output?: any;
    tools: Record<string, any>;
}

const sessions = new Map<string, AgentSession>();

export function useAgentSession(agentId: string): AgentSession {
    if (!sessions.has(agentId)) {
        sessions.set(
            agentId,
            reactive<AgentSession>({
                input: "",
                tools: {},
            }),
        );
    }
    return sessions.get(agentId)!;
}