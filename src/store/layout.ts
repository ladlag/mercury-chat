import { defineStore } from "pinia";

export const useLayoutStore = defineStore("layout", {
    state: () => ({
        activeView: "chat", // 默认视图
    }),
    actions: {
        setActiveView(viewKey: string) {
            this.activeView = viewKey;
        },
    },
});