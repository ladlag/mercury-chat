<template>
  <div class="auth-page-wrapper">
    <LoginMain @close="handleClose" />
  </div>
</template>

<script setup lang="ts">
import LoginMain from './LoginMain.vue';
import { activeCapabilityId } from '@/config/navbar-top.config';

const handleClose = () => {
  // Navigate to default chat when closing from standalone page
  activeCapabilityId.value = 'chat-default';
};
</script>

<style scoped lang="scss">
.auth-page-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: var(--devui-global-bg, #f3f6f8);
}
</style>
