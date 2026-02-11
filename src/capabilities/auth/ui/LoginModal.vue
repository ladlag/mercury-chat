<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="login-modal-wrapper" @click.self="handleOverlayClick">
        <div class="login-modal-overlay"></div>
        <div class="login-modal-content">
          <button 
            v-if="closable" 
            class="login-modal-close" 
            @click="handleClose"
            :aria-label="$t('cancel')"
          >
            ×
          </button>
          <slot></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean;
  closable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  closable: true,
});

const emit = defineEmits<{
  close: [];
  'update:visible': [value: boolean];
}>();

const handleClose = () => {
  emit('close');
  emit('update:visible', false);
};

const handleOverlayClick = () => {
  if (props.closable) {
    handleClose();
  }
};
</script>

<style scoped lang="scss">
.login-modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.login-modal-content {
  position: relative;
  z-index: 10000;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  animation: modal-slide-in 0.3s ease-out;
}

.login-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10001;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--devui-base-bg, #ffffff);
  color: var(--devui-text, #252b3a);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;

  &:hover {
    background: var(--devui-list-item-hover-bg, #f2f5fc);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
}

// Animation
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .login-modal-content,
.modal-fade-leave-active .login-modal-content {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from .login-modal-content {
  transform: scale(0.9) translateY(-20px);
}

.modal-fade-leave-to .login-modal-content {
  transform: scale(0.9) translateY(20px);
}

@keyframes modal-slide-in {
  from {
    transform: scale(0.9) translateY(-20px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
</style>
