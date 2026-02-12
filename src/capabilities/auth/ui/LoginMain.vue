<template>
  <div class="login-main">
    <d-card class="login-card">
      <div class="login-header">
        <h1 class="login-title">{{ $t('auth.loginTitle') }}</h1>
        <p class="login-subtitle">{{ $t('auth.loginSubtitle') }}</p>
      </div>

      <div class="login-methods">
        <!-- Primary login methods -->
        <template v-if="!showSecondary">
          <div class="primary-methods">
            <d-tabs v-model="primaryMethod" type="card">
              <d-tab id="phone" :title="$t('auth.phoneLogin')">
                <div class="tab-content">
                  <VerificationCodeLogin
                    @success="handleLoginSuccess"
                    @error="handleLoginError"
                  />
                </div>
              </d-tab>
              <d-tab id="wechat-official" :title="$t('auth.wechatOfficialLogin')">
                <div class="tab-content">
                  <WeChatQRLogin
                    type="official"
                    @success="handleLoginSuccess"
                    @error="handleLoginError"
                  />
                </div>
              </d-tab>
            </d-tabs>
          </div>
          <div class="switch-method">
            <a class="switch-link" @click="showSecondary = true">
              {{ $t('auth.otherLoginMethods') }}
            </a>
          </div>
        </template>

        <!-- Secondary login methods -->
        <template v-else>
          <div class="secondary-methods">
            <d-tabs v-model="secondaryMethod" type="card">
              <d-tab id="email" :title="$t('auth.emailLogin')">
                <div class="tab-content">
                  <EmailLogin
                    @success="handleLoginSuccess"
                    @error="handleLoginError"
                  />
                </div>
              </d-tab>
              <d-tab id="wechat-scan" :title="$t('auth.wechatScanLogin')">
                <div class="tab-content">
                  <WeChatQRLogin
                    type="scan"
                    @success="handleLoginSuccess"
                    @error="handleLoginError"
                  />
                </div>
              </d-tab>
            </d-tabs>
          </div>
          <div class="switch-method">
            <a class="switch-link" @click="showSecondary = false">
              {{ $t('auth.backToMainMethods') }}
            </a>
          </div>
        </template>
      </div>
    </d-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import VerificationCodeLogin from './VerificationCodeLogin.vue';
import WeChatQRLogin from './WeChatQRLogin.vue';
import EmailLogin from './EmailLogin.vue';
import { activeCapabilityId } from '@/config/navbar-top.config';
import { useAuthStore } from '@/store/auth-store';

const { t } = useI18n();
const authStore = useAuthStore();

const showSecondary = ref(false);
const primaryMethod = ref('phone');
const secondaryMethod = ref('email');

const emit = defineEmits<{
  close: [];
}>();

const handleLoginSuccess = () => {
  console.log(t('auth.loginSuccess'));
  
  // Close the login modal
  authStore.closeLoginModal();
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
  max-width: 480px;
  box-shadow: none;
  border: none;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--devui-text, #252b3a);
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: var(--devui-text-weak, #575d6c);
  margin: 0;
}

.login-methods {
  margin-top: 24px;
  
  :deep(.devui-tabs) {
    .devui-tab-list {
      justify-content: center;
      margin-bottom: 24px;
    }
  }
}

.tab-content {
  padding: 20px 0;
  min-height: 300px;
}

.switch-method {
  text-align: center;
  margin-top: 16px;
}

.switch-link {
  color: var(--devui-brand, #5e7ce0);
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
