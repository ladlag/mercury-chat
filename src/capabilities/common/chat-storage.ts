export interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    ts: number;
}

export interface ChatSession {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
}

function now() {
    return Date.now();
}

function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export function buildKeys(chatId: string) {
    const base = `mc_custom_chat:${chatId}`;
    return {
        sessions: `${base}:sessions`,
        messages: (sessionId: string) => `${base}:messages:${sessionId}`,
        active: `${base}:active_session`,
    };
}

export function loadSessions(chatId: string): ChatSession[] {
    const k = buildKeys(chatId).sessions;
    const raw = localStorage.getItem(k);
    if (!raw) return [];
    try {
        return JSON.parse(raw) as ChatSession[];
    } catch {
        return [];
    }
}

export function saveSessions(chatId: string, sessions: ChatSession[]) {
    const k = buildKeys(chatId).sessions;
    localStorage.setItem(k, JSON.stringify(sessions));
}

export function loadMessages(chatId: string, sessionId: string): ChatMessage[] {
    const k = buildKeys(chatId).messages(sessionId);
    const raw = localStorage.getItem(k);
    if (!raw) return [];
    try {
        return JSON.parse(raw) as ChatMessage[];
    } catch {
        return [];
    }
}

export function saveMessages(chatId: string, sessionId: string, msgs: ChatMessage[]) {
    const k = buildKeys(chatId).messages(sessionId);
    localStorage.setItem(k, JSON.stringify(msgs));
}

export function getActiveSessionId(chatId: string): string | null {
    const k = buildKeys(chatId).active;
    return localStorage.getItem(k);
}

export function setActiveSessionId(chatId: string, sessionId: string) {
    const k = buildKeys(chatId).active;
    localStorage.setItem(k, sessionId);
}

export function createSession(chatId: string, title = "新会话"): ChatSession {
    const sessions = loadSessions(chatId);
    const s: ChatSession = {
        id: uid("sess"),
        title,
        createdAt: now(),
        updatedAt: now(),
    };
    sessions.unshift(s);
    saveSessions(chatId, sessions);
    setActiveSessionId(chatId, s.id);
    return s;
}

export function appendMessage(
    chatId: string,
    sessionId: string,
    msg: Omit<ChatMessage, "id" | "ts">,
) {
    const msgs = loadMessages(chatId, sessionId);
    msgs.push({
        id: uid("msg"),
        ts: now(),
        ...msg,
    });
    saveMessages(chatId, sessionId, msgs);

    const sessions = loadSessions(chatId);
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx >= 0) {
        sessions[idx] = { ...sessions[idx], updatedAt: now() };
        saveSessions(chatId, sessions);
    }
}