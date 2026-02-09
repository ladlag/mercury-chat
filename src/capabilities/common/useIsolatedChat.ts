import { computed, ref, watchEffect } from "vue";
import type { ChatMessage, ChatSession } from "./chat-storage.ts";
import {
    appendMessage,
    createSession,
    getActiveSessionId,
    loadMessages,
    loadSessions,
    setActiveSessionId,
} from "./chat-storage.ts";

export function useIsolatedChat(chatId: string) {
    const sessions = ref<ChatSession[]>([]);
    const activeSessionId = ref<string>("");
    const messages = ref<ChatMessage[]>([]);

    const activeSession = computed(() =>
        sessions.value.find(s => s.id === activeSessionId.value),
    );

    function refreshSessions() {
        sessions.value = loadSessions(chatId).sort((a, b) => b.updatedAt - a.updatedAt);
    }

    function refreshMessages() {
        if (!activeSessionId.value) {
            messages.value = [];
            return;
        }
        messages.value = loadMessages(chatId, activeSessionId.value);
    }

    function ensureSession() {
        refreshSessions();
        const storedActive = getActiveSessionId(chatId);

        if (storedActive && loadSessions(chatId).some(s => s.id === storedActive)) {
            activeSessionId.value = storedActive;
        } else if (sessions.value.length > 0) {
            activeSessionId.value = sessions.value[0].id;
            setActiveSessionId(chatId, activeSessionId.value);
        } else {
            const s = createSession(chatId, "新会话");
            activeSessionId.value = s.id;
        }

        refreshMessages();
    }

    function selectSession(id: string) {
        activeSessionId.value = id;
        setActiveSessionId(chatId, id);
        refreshMessages();
    }

    function newSession() {
        const s = createSession(chatId, "新会话");
        refreshSessions();
        activeSessionId.value = s.id;
        refreshMessages();
    }

    function sendUser(content: string) {
        if (!activeSessionId.value) ensureSession();
        appendMessage(chatId, activeSessionId.value, { role: "user", content });
        refreshMessages();
        refreshSessions();
    }

    function sendAssistant(content: string) {
        if (!activeSessionId.value) ensureSession();
        appendMessage(chatId, activeSessionId.value, { role: "assistant", content });
        refreshMessages();
        refreshSessions();
    }

    watchEffect(() => {
        ensureSession();
    });

    return {
        sessions,
        activeSessionId,
        activeSession,
        messages,

        selectSession,
        newSession,
        sendUser,
        sendAssistant,

        refreshSessions,
        refreshMessages,
    };
}