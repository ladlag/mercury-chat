<!-- src/capabilities/chat/ui/MateChatDefaultView.vue -->
<template>
  <template v-if="displayShape === DisplayShape.Immersive">
    <HistoryList />
  </template>
  <ChatView />
</template>

<script setup lang="ts">
import GlobalConfig from "@/global-config";
import { DisplayShape } from "@/global-config-types";
import { ChatView } from "@view/chat-view";
import { HistoryList } from "@view/history";

const displayShape = GlobalConfig.displayShape;
</script>