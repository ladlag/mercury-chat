<template>
  <CapabilityViewLayout mode="center">
    <LoginMain @close="handleClose" />
  </CapabilityViewLayout>
</template>

<script setup lang="ts">
import CapabilityViewLayout from '@/capabilities/common/ui/CapabilityViewLayout.vue';
import LoginMain from './LoginMain.vue';
import { activeCapabilityId } from '@/config/navbar-top.config';

const handleClose = () => {
  // Navigate to default chat when closing from standalone page
  activeCapabilityId.value = 'chat-default';
};
</script>
