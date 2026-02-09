// src/store/chat-mode.store.ts  （新增）
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export type ChatRunMode = "llm" | "agent" | "mixed";

type ChatModeConfig = {
    mode: ChatRunMode;
    agentId?: string;
};

const STORAGE_KEY = "matechat.chat.mode.v1";

function loadAll(): Record<string, ChatModeConfig> {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
        return {};
    }
}
function persistAll(v: Record<string, ChatModeConfig>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
}

export const useChatModeStore = defineStore("chat-mode", () => {
    const byChatCapId = ref<Record<string, ChatModeConfig>>(loadAll());

    // 当前激活的 chat capability id（由 capability.onActivate 写入）
    const activeChatCapId = ref<string>("chat-default");

    const current = computed<ChatModeConfig>(() => {
        return byChatCapId.value[activeChatCapId.value] || { mode: "llm" };
    });

    function setActiveChatCapId(chatCapId: string) {
        activeChatCapId.value = chatCapId;
        if (!byChatCapId.value[chatCapId]) {
            byChatCapId.value[chatCapId] = { mode: "llm" };
            persistAll(byChatCapId.value);
        }
    }

    function setModeForChat(chatCapId: string, mode: ChatRunMode, agentId?: string) {
        byChatCapId.value[chatCapId] = { mode, agentId };
        persistAll(byChatCapId.value);
    }

    function resetToDefault(chatCapId: string) {
        byChatCapId.value[chatCapId] = { mode: "llm" };
        persistAll(byChatCapId.value);
    }

    return {
        byChatCapId,
        activeChatCapId,
        current,
        setActiveChatCapId,
        setModeForChat,
        resetToDefault,
    };
});