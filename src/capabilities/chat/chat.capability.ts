import type {Capability} from "@/capabilities/registry";
import MateChatDefaultView from "@/capabilities/chat/ui/MateChatDefaultView.vue";
import ChatSecondMain from "@/capabilities/chat/ui/ChatSecondMain.vue";

// Recommend using URL from public directly (no import warnings)
const DefaultChatIcon = "/logo.svg";

export const ChatDefaultCapability: Capability = {
    id: "chat-default",
    kind: "chat",
    navbar: {
        titleKey: "navbar.chat",
        icon: DefaultChatIcon,
        order: 10,
    },
    ui: {
        main: MateChatDefaultView,
    },
    onActivate: () => {
        // Optional: switch context for default chat mechanism
        // sessionStorage.setItem("matechat.chat.active", "chat-default");
    },
};

export const ChatSecondCapability: Capability = {
    id: "chat-second",
    kind: "chat",
    navbar: {
        titleKey: "navbar.chat2",
        icon: DefaultChatIcon,
        order: 20,
    },
    ui: {
        // Custom chat view with isolated sessions/messages
        main: ChatSecondMain,
    },
    onActivate: () => {
        // Optional: mark current chat
        // sessionStorage.setItem("matechat.chat.active", "chat-second");
    },
};