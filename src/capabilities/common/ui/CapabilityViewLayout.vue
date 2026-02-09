<template>
  <div class="capability-page" :class="modeClass">
    <div class="capability-shell" :class="{ 'with-tools': !!$slots.tools }">
      <div class="capability-main">
        <slot />
      </div>

      <div v-if="$slots.tools" class="capability-tools">
        <slot name="tools" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
    defineProps<{
      mode?: "center" | "fill"; // center: 默认居中卡片风格；fill: 填满右侧区域（更像默认Chat）
    }>(),
    { mode: "center" },
);

const modeClass = computed(() => `mode-${props.mode}`);
</script>

<style scoped lang="scss">
.capability-page {
  width: 100%;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
  display: flex;
}

/* ---------- center：用于 Agent/普通页面 ---------- */
.mode-center .capability-shell {
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 16px;
  gap: 12px;
}

.mode-center .capability-main {
  width: 100%;
  max-width: 980px;
  min-width: 0;

  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ---------- fill：用于自定义 Chat（更接近默认 ChatView） ---------- */
.mode-fill .capability-shell {
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  padding: 0;
  gap: 0;
}

.mode-fill .capability-main {
  width: 100%;
  height: 100%;
  min-width: 0;
  display: flex;
}

/* side slot（如果以后你要并排工具区） */
.capability-tools {
  width: 320px;
  flex: 0 0 320px;
  min-width: 0;
}

@media screen and (max-width: 1200px) {
  .capability-shell.with-tools {
    flex-direction: column;
    align-items: stretch;
  }

  .capability-tools {
    width: 100%;
    flex: 0 0 auto;
  }
}
</style>