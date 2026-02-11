<template>
  <div class="wechat-qr-login">
    <div class="qr-container">
      <div v-if="loading" class="qr-loading">
        <span class="loading-spinner">{{ $t('auth.loading') }}</span>
      </div>
      <div v-else-if="qrCodeUrl && !expired" class="qr-code">
        <img :src="qrCodeUrl" :alt="$t('auth.scanQRCode')" />
      </div>
      <div v-else-if="expired" class="qr-expired">
        <p>{{ $t('auth.qrCodeExpired') }}</p>
        <d-button @click="refreshQRCode">{{ $t('auth.refreshQRCode') }}</d-button>
      </div>
    </div>

    <div class="qr-tips">
      <p class="tip-text">
        {{ type === 'official' ? $t('auth.followAndLogin') : $t('auth.scanToLogin') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/store/auth-store';
import { LoginMethod } from '@/types/auth-types';

interface Props {
  type: 'official' | 'scan';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'official',
});

const { t } = useI18n();
const authStore = useAuthStore();

const qrCodeUrl = ref<string | null>(null);
const loading = ref(false);
const expired = ref(false);
const polling = ref(false);
let pollingTimer: NodeJS.Timeout | null = null;

const emit = defineEmits<{
  success: [];
  error: [message: string];
}>();

const loadQRCode = async () => {
  loading.value = true;
  expired.value = false;

  try {
    const url = await authStore.getWeChatQRCode(props.type);
    if (url) {
      qrCodeUrl.value = url;
      startPolling();
      // Set expiration timer (2 minutes)
      setTimeout(() => {
        expired.value = true;
        stopPolling();
      }, 120000);
    } else {
      emit('error', t('auth.loginFailed'));
    }
  } finally {
    loading.value = false;
  }
};

const refreshQRCode = () => {
  loadQRCode();
};

const startPolling = () => {
  if (polling.value) return;
  
  polling.value = true;
  pollingTimer = setInterval(async () => {
    // TODO: Poll backend for scan status
    // If scanned and confirmed, call emit('success')
  }, 2000);
};

const stopPolling = () => {
  polling.value = false;
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
};

onMounted(() => {
  loadQRCode();
});

onBeforeUnmount(() => {
  stopPolling();
});
</script>

<style scoped lang="scss">
.wechat-qr-login {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.qr-container {
  width: 240px;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--devui-dividing-line, #dfe1e6);
  border-radius: 12px;
  background: var(--devui-base-bg, #ffffff);
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.qr-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  
  .loading-spinner {
    color: var(--devui-text-weak, #575d6c);
    font-size: 14px;
  }
}

.qr-code {
  width: 220px;
  height: 220px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.qr-expired {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  
  p {
    color: var(--devui-text-weak, #575d6c);
    margin: 0;
    font-size: 14px;
  }

  :deep(.devui-btn) {
    border-radius: 8px;
  }
}

.qr-tips {
  text-align: center;
  
  .tip-text {
    color: var(--devui-text-weak, #575d6c);
    font-size: 13px;
    margin: 0;
    line-height: 1.6;
  }
}
</style>
