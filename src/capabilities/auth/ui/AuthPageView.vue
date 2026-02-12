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
  width: 100%;
  max-width: 460px;
  padding: 16px;
  box-sizing: border-box;
}
</style>
