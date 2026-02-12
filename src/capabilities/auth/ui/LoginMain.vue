<template>
  <div class="login-main">
    <d-card class="login-card">
      <div class="login-header">
        <h1 class="login-title">{{ $t('auth.loginTitle') }}</h1>
        <p class="login-subtitle">{{ $t('auth.loginSubtitle') }}</p>
      </div>

      <div class="login-body">
        <!-- Primary: Phone Verification Code (default) -->
        <div v-if="activeMethod === 'phone'" class="login-form-area">
          <VerificationCodeLogin
            @success="handleLoginSuccess"
            @error="handleLoginError"
          />
        </div>

        <!-- Secondary: WeChat Official Account -->
        <div v-else-if="activeMethod === 'wechat-official'" class="login-form-area">
          <WeChatQRLogin
            type="official"
            @success="handleLoginSuccess"
            @error="handleLoginError"
          />
        </div>

        <!-- Secondary: Email -->
        <div v-else-if="activeMethod === 'email'" class="login-form-area">
          <EmailLogin
            @success="handleLoginSuccess"
            @error="handleLoginError"
          />
        </div>

        <!-- Secondary: WeChat Scan -->
        <div v-else-if="activeMethod === 'wechat-scan'" class="login-form-area">
          <WeChatQRLogin
            type="scan"
            @success="handleLoginSuccess"
            @error="handleLoginError"
          />
        </div>
      </div>

      <div class="login-footer">
        <div class="divider">
          <span class="divider-text">{{ $t('auth.otherLoginMethods') }}</span>
        </div>
        <div class="other-methods">
          <button
            v-for="method in otherMethods"
            :key="method.id"
            type="button"
            class="method-btn"
            :title="$t(method.labelKey)"
            @click="activeMethod = method.id"
          >
            {{ $t(method.labelKey) }}
          </button>
        </div>
      </div>
    </d-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import VerificationCodeLogin from './VerificationCodeLogin.vue';
import WeChatQRLogin from './WeChatQRLogin.vue';
import EmailLogin from './EmailLogin.vue';
import { activeCapabilityId } from '@/config/navbar-top.config';

const { t } = useI18n();

const activeMethod = ref('phone');

const allMethods = [
  { id: 'phone', labelKey: 'auth.phoneLogin' },
  { id: 'wechat-official', labelKey: 'auth.wechatOfficialLogin' },
  { id: 'email', labelKey: 'auth.emailLogin' },
  { id: 'wechat-scan', labelKey: 'auth.wechatScanLogin' },
];

const otherMethods = computed(() =>
  allMethods.filter((m) => m.id !== activeMethod.value)
);

const emit = defineEmits<{
  close: [];
}>();

const handleLoginSuccess = () => {
  console.log(t('auth.loginSuccess'));
  emit('close');

  // Navigate to default chat after successful login
  setTimeout(() => {
    activeCapabilityId.value = 'chat-default';
  }, 500);
};

const handleLoginError = (message: string) => {
  console.error(message);
};
</script>

<style scoped lang="scss">
.login-main {
  padding: 0;
  background: transparent;
}

.login-card {
  width: 100%;
  padding: 40px 32px;
  box-sizing: border-box;
  border-radius: 12px;
  background: var(--devui-base-bg, #ffffff);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--devui-dividing-line, #dfe1e6);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--devui-text, #252b3a);
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: var(--devui-text-weak, #575d6c);
  margin: 0;
}

.login-body {
  min-height: 220px;
}

.login-footer {
  margin-top: 24px;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 16px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--devui-dividing-line, #dfe1e6);
  }
}

.divider-text {
  padding: 0 12px;
  font-size: 12px;
  color: var(--devui-text-weak, #575d6c);
  white-space: nowrap;
}

.other-methods {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}

.method-btn {
  padding: 8px 16px;
  border: 1px solid var(--devui-dividing-line, #dfe1e6);
  border-radius: 6px;
  background: var(--devui-base-bg, #ffffff);
  color: var(--devui-text, #252b3a);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--devui-brand, #5e7ce0);
    color: var(--devui-brand, #5e7ce0);
  }
}
</style>
