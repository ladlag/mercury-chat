<template>
  <div class="auth-page">
    <div class="auth-container">
      <LoginMain @close="handleClose" />
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginMain from './LoginMain.vue';
import { activeCapabilityId } from '@/config/navbar-top.config';

const handleClose = () => {
  activeCapabilityId.value = 'chat-default';
};
</script>

<style scoped lang="scss">
.auth-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--devui-global-bg, #f3f6f8);
}

.auth-container {
  width: 60vw;
  max-width: 720px;
  min-width: 340px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.04);
  background: var(--devui-base-bg, #ffffff);
  box-sizing: border-box;
}

@media screen and (max-width: 768px) {
  .auth-container {
    width: 92vw;
    min-width: 0;
    max-width: none;
  }
}
</style>
