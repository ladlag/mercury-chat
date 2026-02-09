// src/capabilities/chat/chat-third.capability.ts
import type { Capability } from "@/capabilities/registry";
import MateChatDefaultView from "@/capabilities/chat/ui/MateChatDefaultView.vue";
import ChatIcon from "/chat-icon.svg";

import { useChatStatusStore, useChatHistoryStore, useChatMessageStore } from "@/store";

export const ChatThirdCapability: Capability = {
    id: "chat-third",
    kind: "chat",
    navbar: {
        titleKey: "navbar.chat3",
        icon: ChatIcon,
        order: 30,
    },
    ui: {
        // ✅ 关键：仍然用 MateChatDefaultView（完全复用默认布局/层级，避免 toggle 被遮挡）
        main: MateChatDefaultView,
    },
    onActivate() {
        const chatHistoryStore = useChatHistoryStore();
        const chatStatusStore = useChatStatusStore();
        const chatMessageStore = useChatMessageStore();

        chatHistoryStore.setActiveHistoryId("");
        chatStatusStore.startChat = false;
        chatStatusStore.currentChatId = "";
        chatMessageStore.messages = [];
    },
};