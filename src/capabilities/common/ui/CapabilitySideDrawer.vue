<template>
  <div>
    <!-- 触发按钮：只在有 side 时展示 -->
    <div v-if="side" class="drawer-trigger">
      <d-popover :position="['left']" trigger="hover">
        <template #content>
          <span class="devui-text">{{ title }}</span>
        </template>
        <d-button class="trigger-btn" @click="open = true">
          <i class="icon-setting" />
        </d-button>
      </d-popover>
    </div>

    <!-- 抽屉 -->
    <d-drawer
        v-model="open"
        :title="title"
        :width="width"
        :mask-closable="true"
        :esc-key-closeable="true"
        :show-overlay="true"
        :z-index="1200"
        placement="right"
    >
      <component v-if="side" :is="side" />
    </d-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

const props = withDefaults(
    defineProps<{
      side: any | null | undefined;
      title?: string;
      width?: number | string;
      autoCloseOnSwitch?: boolean; // 切换 capability 时是否自动收起
      activeId?: string;           // 用于监听切换
    }>(),
    {
      title: "Tools",
      width: 360,
      autoCloseOnSwitch: true,
    },
);

const open = ref(false);

watch(
    () => props.activeId,
    () => {
      if (props.autoCloseOnSwitch) open.value = false;
    },
);

const title = computed(() => props.title || "Tools");
const width = computed(() => props.width || 360);
</script>

<style scoped lang="scss">
.drawer-trigger {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 50;
}

.trigger-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 10px;
}

.devui-text {
  color: $devui-text;
}
</style>