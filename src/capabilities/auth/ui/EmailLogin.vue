<template>
  <div class="email-login">
    <d-form ref="formRef" :data="formData" labelSize="lg" labelAlign="top">
      <d-form-item :label="$t('auth.emailAddress')">
        <d-input
          v-model="formData.email"
          :placeholder="$t('auth.emailPlaceholder')"
          size="lg"
          :disabled="loading"
        />
      </d-form-item>

      <d-form-item :label="$t('auth.verificationCode')">
        <div class="code-input-group">
          <d-input
            v-model="formData.code"
            :placeholder="$t('auth.verificationCodePlaceholder')"
            size="lg"
            :disabled="loading"
            maxlength="6"
          />
          <d-button
            :disabled="!canSendCode || countdown > 0"
            @click="handleSendCode"
            class="send-code-btn"
          >
            {{ countdown > 0 ? $t('auth.resendIn', { seconds: countdown }) : $t('auth.sendCode') }}
          </d-button>
        </div>
      </d-form-item>

      <d-form-item>
        <d-button
          variant="solid"
          size="lg"
          :loading="loading"
          :disabled="!canLogin"
          @click="handleLogin"
          class="login-btn"
        >
          {{ $t('auth.loginButton') }}
        </d-button>
      </d-form-item>
    </d-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/store/auth-store';
import { AuthAdapter } from '@/adapters/auth-adapter';
import { LoginMethod } from '@/types/auth-types';

const { t } = useI18n();
const authStore = useAuthStore();

const formData = ref({
  email: '',
  code: '',
});

const loading = ref(false);
const countdown = ref(0);
let countdownTimer: NodeJS.Timeout | null = null;

const canSendCode = computed(() => {
  return AuthAdapter.validateEmail(formData.value.email);
});

const canLogin = computed(() => {
  return (
    AuthAdapter.validateEmail(formData.value.email) &&
    AuthAdapter.validateVerificationCode(formData.value.code)
  );
});

const emit = defineEmits<{
  success: [];
  error: [message: string];
}>();

const handleSendCode = async () => {
  if (!canSendCode.value) {
    return;
  }

  loading.value = true;
  try {
    // TODO: Add email verification code API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Start countdown
    countdown.value = AuthAdapter.getResendCountdown();
    countdownTimer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0 && countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
    }, 1000);
  } finally {
    loading.value = false;
  }
};

const handleLogin = async () => {
  if (!canLogin.value) {
    return;
  }

  loading.value = true;
  try {
    const success = await authStore.login({
      method: LoginMethod.Email,
      email: formData.value.email,
      code: formData.value.code,
    });

    if (success) {
      emit('success');
    } else {
      emit('error', t('auth.loginFailed'));
    }
  } catch (error) {
    emit('error', t('auth.loginFailed'));
  } finally {
    loading.value = false;
  }
};

onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>

<style scoped lang="scss">
.email-login {
  width: 100%;

  :deep(.devui-form-label) {
    font-size: 13px;
    font-weight: 500;
    color: var(--devui-text, #252b3a);
    margin-bottom: 6px;
  }

  :deep(.devui-input__wrapper) {
    border-radius: 8px;
    border: 1px solid var(--devui-line, #dfe1e6);
    transition: border-color 0.2s, box-shadow 0.2s;

    &:hover {
      border-color: var(--devui-brand, #5e7ce0);
    }

    &.devui-input--focus,
    &:focus-within {
      border-color: var(--devui-brand, #5e7ce0);
      box-shadow: 0 0 0 3px rgba(94, 124, 224, 0.12);
    }
  }

  :deep(.devui-button) {
    border-radius: 8px;
  }
}

.code-input-group {
  display: flex;
  gap: 12px;
  align-items: stretch;
  
  :deep(.devui-input) {
    flex: 1;
    min-width: 0;
  }
}

.send-code-btn {
  white-space: nowrap;
  min-width: 120px;
  font-size: 13px;
  flex-shrink: 0;
  height: auto;
}

.login-btn {
  width: 100%;
  margin-top: 12px;
  height: 40px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

@media screen and (max-width: 480px) {
  .code-input-group {
    flex-direction: column;
    gap: 8px;
  }

  .send-code-btn {
    min-width: unset;
    width: 100%;
  }
}
</style>
