export class RequirementAgentRunner {
    async run(input: string, tools: any) {
        // TODO: replace with real backend/dify call
        return {
            summary: "需求分析完成",
            input,
            tools,
            ts: Date.now(),
        };
    }
}