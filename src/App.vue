<!-- src/App.vue -->
<template>
  <Layout :class="[displayShape]">
    <template #header>
      <NavBar v-if="displayShape === DisplayShape.Immersive" />
    </template>

    <template #content>
      <component
          v-if="activeCapability"
          :is="activeCapability.ui.main"
          class="capability-main"
      />
      <component v-else :is="fallbackMain" class="capability-main" />

      <!-- Side Drawer -->
      <CapabilitySideDrawer
          v-if="activeSide"
          v-model:visible="sideVisible"
          :side="activeSide"
          :title="sideTitle"
          :width="380"
      />
    </template>
  </Layout>

  <!-- Global Login Modal -->
  <d-modal
    v-model="authStore.showLoginModal"
    :show-close="!requireLogin || authStore.isAuthenticated"
    :close-on-click-modal="!requireLogin || authStore.isAuthenticated"
    :esc-key-closeable="!requireLogin || authStore.isAuthenticated"
    :show-overlay="true"
    @close="authStore.closeLoginModal"
  >
    <LoginMain @close="authStore.closeLoginModal" />
  </d-modal>
</template>

<script setup lang="ts">
import GlobalConfig from "@/global-config";
import { DisplayShape, ThemeEnum } from "@/global-config-types";
import { useLang, useTheme } from "@/hooks";
import { useLangStore, useThemeStore, useAuthStore } from "@/store";
import { LangType } from "@/types";

import { Layout } from "@view/layout";
import { NavBar } from "@view/navbar";

import { computed, ref, watch } from "vue";
import { useCapabilities } from "@/capabilities/registry";
import { activeCapabilityId } from "@/config/navbar-top.config";

import "@/capabilities/index";

import MateChatDefaultView from "@/capabilities/chat/ui/MateChatDefaultView.vue";
import CapabilitySideDrawer from "@/capabilities/common/ui/CapabilitySideDrawer.vue";
import LoginMain from "@/capabilities/auth/ui/LoginMain.vue";

const displayShape = GlobalConfig.displayShape;
const requireLogin = computed(() => GlobalConfig.requireLogin ?? false);

const capabilities = useCapabilities();
const activeCapability = computed(() =>
    capabilities.value.find((c) => c.id === activeCapabilityId.value),
);

const fallbackMain = MateChatDefaultView;

const activeSide = computed(() => activeCapability.value?.ui?.side || null);
const sideTitle = computed(() => "Tools");

const sideVisible = ref(false);
const authStore = useAuthStore();

watch(
    () => activeCapabilityId.value,
    () => {
      sideVisible.value = false;
    },
);

/** Keep MateChat init logic */
useLang();
const { initTheme, applyTheme, createCustomThemeFromConfig } = useTheme();
const themeStore = useThemeStore();
const langStore = useLangStore();

init();
function init() {
  if (GlobalConfig.theme) {
    themeStore.theme = ThemeEnum.Custom;
    themeStore.currentCustomTheme = createCustomThemeFromConfig(GlobalConfig.theme);
  }
  initTheme();
  applyTheme();

  if (GlobalConfig.language) {
    langStore.updateCurrentLang(
        GlobalConfig.language === LangType.EN ? LangType.EN : LangType.CN,
    );
  }
}
</script>

<style scoped lang="scss">
.capability-main {
  width: 100%;
  height: 100%;
  min-width: 0;
}
</style>

<style lang="scss">
.devui-modal:has(.login-main) {
  width: 60vw;
  max-width: 720px;
  min-width: 340px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.04);

  .btn-close {
    top: 16px;
    right: 16px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--devui-list-item-hover-bg, #f2f2f3);
    }
  }

  .devui-modal__body {
    padding: 24px 32px 32px;
  }
}

@media screen and (max-width: 768px) {
  .devui-modal:has(.login-main) {
    width: 92vw;
    min-width: 0;
    max-width: none;

    .devui-modal__body {
      padding: 12px 12px 20px;
    }
  }
}
</style>