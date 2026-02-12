<template>
  <div class="verification-code-login">
    <d-form ref="formRef" :data="formData" labelSize="lg" labelAlign="top">
      <d-form-item :label="$t('auth.phoneNumber')">
        <d-input
          v-model="formData.phone"
          :placeholder="$t('auth.phonePlaceholder')"
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
          type="primary"
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
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/store/auth-store';
import { AuthAdapter } from '@/adapters/auth-adapter';
import { LoginMethod } from '@/types/auth-types';

const { t } = useI18n();
const authStore = useAuthStore();

const formData = ref({
  phone: '',
  code: '',
});

const loading = ref(false);
const countdown = ref(0);
let countdownTimer: NodeJS.Timeout | null = null;

const canSendCode = computed(() => {
  return AuthAdapter.validatePhone(formData.value.phone);
});

const canLogin = computed(() => {
  return (
    AuthAdapter.validatePhone(formData.value.phone) &&
    AuthAdapter.validateVerificationCode(formData.value.code)
  );
});

const handleSendCode = async () => {
  if (!canSendCode.value) {
    return;
  }

  loading.value = true;
  try {
    const success = await authStore.sendVerificationCode(formData.value.phone);
    if (success) {
      // Start countdown
      countdown.value = AuthAdapter.getResendCountdown();
      countdownTimer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0 && countdownTimer) {
          clearInterval(countdownTimer);
          countdownTimer = null;
        }
      }, 1000);
    }
  } finally {
    loading.value = false;
  }
};

const emit = defineEmits<{
  success: [];
  error: [message: string];
}>();

const handleLogin = async () => {
  if (!canLogin.value) {
    return;
  }

  loading.value = true;
  try {
    const success = await authStore.login({
      method: LoginMethod.VerificationCode,
      phone: formData.value.phone,
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

// Cleanup on unmount
import { onBeforeUnmount } from 'vue';
onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>

<style scoped lang="scss">
.verification-code-login {
  width: 100%;
}

.code-input-group {
  display: flex;
  gap: 12px;
  align-items: stretch;
  
  :deep(.devui-input) {
    flex: 1;
  }
}

.send-code-btn {
  white-space: nowrap;
  min-width: 120px;
  height: auto;
}

.login-btn {
  width: 100%;
  margin-top: 8px;
}
</style>
