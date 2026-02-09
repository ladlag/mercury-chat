<!-- src/capabilities/chat-custom/ui/IsolatedChatView.vue -->
<template>
  <!-- 结构对齐默认 App.vue：HistoryList + ChatView 并排 -->
  <div class="iso-root">
    <!-- Left: history (isolated data, but复用默认HistoryList样式结构) -->
    <IsolatedHistoryList
        :chat-id="chatId"
        :sessions="sessions"
        :active-session-id="activeSessionId"
        :on-select-session="selectSession"
    />

    <!-- Right: chat view（复用默认ChatView wrapper/container/toggle） -->
    <div class="chat-view-wrapper">
      <div class="chat-view-container">
        <NavbarTop />

        <div class="iso-chat-area">
          <div class="iso-messages">
            <div v-for="m in messages" :key="m.id" class="msg" :class="m.role">
              <div class="bubble">{{ m.content }}</div>
            </div>
          </div>

          <div class="iso-input">
            <d-textarea v-model="input" :rows="3" />
            <div class="actions">
              <d-button type="primary" @click="send">发送</d-button>
              <d-button @click="onNewConvo">新对话</d-button>
            </div>
          </div>
        </div>

        <!-- 复用默认 ChatView 的 new-convo-button 位置/节奏 -->
        <div class="new-convo-button">
          <div class="agent-knowledge">
            <span class="agent-knowledge-dividing-line"></span>
          </div>

          <d-popover
              :content="$t('newChat')"
              trigger="hover"
              :position="['top']"
              style="color: var(--devui-text)"
          >
            <div class="new-chat-setting" @click="onNewConvo">
              <i class="icon-add"></i>
            </div>
          </d-popover>
        </div>
      </div>

      <!-- toggle：严格贴着 chat-view-wrapper 左边缘（不会压到左侧navbar） -->
      <div
          v-if="GlobalConfig.displayShape === DisplayShape.Immersive"
          :class="['toggle-wrapper', !commonStore.isExpand && 'not-expand']"
          @click="onToggle"
      >
        <ExpandIcon />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useCommonStore } from "@/store";
import { ExpandIcon } from "@/components";
import GlobalConfig from "@/global-config";
import { DisplayShape } from "@/global-config-types";

import NavbarTop from "@/view/chat-view/navbar-top.vue";
import IsolatedHistoryList from "@/capabilities/common/ui/IsolatedHistoryList.vue";
import { useIsolatedChat } from "@/capabilities/common/useIsolatedChat";

const props = defineProps<{
  chatId: string;
}>();

const commonStore = useCommonStore();

const { sessions, activeSessionId, messages, selectSession, newSession, sendUser, sendAssistant } =
    useIsolatedChat(props.chatId);

const input = ref("");

const send = () => {
  const text = input.value.trim();
  if (!text) return;

  sendUser(text);

  // TODO: replace with backend/Dify/SSE
  sendAssistant(`Echo(${props.chatId}): ${text}`);

  input.value = "";
};

const onNewConvo = () => {
  newSession();
};

const onToggle = () => {
  commonStore.isExpand = !commonStore.isExpand;
};
</script>

<style scoped lang="scss">
/* ============ 关键修复点 ============ */
/* 1) 不再把 HistoryList 放在“居中容器”里，避免展开后与左侧导航之间出现空白 */
/* 2) toggle-wrapper 归属 chat-view-wrapper，左边缘只会贴到 history-list-container 的边，不会压到 navbar */

/* app 同级结构：history + chat */
.iso-root {
  display: flex;
  flex: 1;
  width: 100%;
  height: 100%;
  min-width: 0;
}

/* 默认 ChatView wrapper/container（保持同名 class） */
.chat-view-wrapper {
  position: relative;
  display: flex;
  flex: 1;
  width: 0;
  height: 100%;
  min-width: 0;
}

.chat-view-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  .new-convo-button {
    padding: 0 12px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    width: 100%;
    max-width: 1200px;
    height: 39px;
    gap: 4px;
  }

  .agent-knowledge {
    flex: 1;
    display: flex;
    align-items: center;

    .agent-knowledge-dividing-line {
      width: 1px;
      height: 14px;
      margin: 0 12px;
      background-color: $devui-line;
    }
  }

  .new-chat-setting {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    height: 24px;
    border-radius: $devui-border-radius-full;
    background-color: $devui-base-bg;
    box-shadow: 0px 1px 8px 0px rgba(25, 25, 25, 0.06);
    cursor: pointer;

    &:hover {
      color: $devui-brand;
    }
  }
}

/* chat 主体区：保持跟默认一致的“居中宽度”节奏（不影响左侧history贴边） */
.iso-chat-area {
  width: 100%;
  max-width: 1200px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 12px;
  box-sizing: border-box;
}

.iso-messages {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 0;
}

.msg {
  display: flex;

  &.user {
    justify-content: flex-end;
  }
  &.assistant {
    justify-content: flex-start;
  }
}

.bubble {
  max-width: 78%;
  padding: 10px 12px;
  border-radius: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  background: rgba(0, 0, 0, 0.04);
}

.msg.user .bubble {
  background: rgba(0, 0, 0, 0.08);
}

.iso-input {
  padding-bottom: 8px;
}

.actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* toggle：保持默认样式，但不再压到左侧navbar */
.toggle-wrapper {
  position: absolute;
  z-index: 10;
  top: calc(50% - 20px);
  left: -8px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 16px;
  height: 40px;
  border-radius: 6px;
  box-shadow: 2px 0px 4px 0px var(--mc-float-block-shadow);
  background: $devui-base-bg;
  transition: all 0.3s ease-in-out;
  cursor: pointer;

  svg {
    transition: transform 0.3s ease-in-out;
  }

  &.not-expand {
    left: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;

    svg {
      transform: rotate(180deg);
    }
  }
}

body[ui-theme-type="light"] {
  .chat-view-wrapper {
    background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.95),
            rgba(248, 250, 255, 0.95) 99%
    );
  }
}

body[ui-theme-type="dark"] {
  .chat-view-wrapper {
    background-color: $devui-global-bg;
  }
}

@media screen and (max-width: 860px) {
  .toggle-wrapper {
    display: none;
  }
}
</style>