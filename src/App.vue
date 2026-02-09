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
</template>

<script setup lang="ts">
import GlobalConfig from "@/global-config";
import { DisplayShape, ThemeEnum } from "@/global-config-types";
import { useLang, useTheme } from "@/hooks";
import { useLangStore, useThemeStore } from "@/store";
import { LangType } from "@/types";

import { Layout } from "@view/layout";
import { NavBar } from "@view/navbar";

import { computed, ref, watch } from "vue";
import { useCapabilities } from "@/capabilities/registry";
import { activeCapabilityId } from "@/config/navbar-top.config";

import "@/capabilities/index";

import MateChatDefaultView from "@/capabilities/chat/ui/MateChatDefaultView.vue";
import CapabilitySideDrawer from "@/capabilities/common/ui/CapabilitySideDrawer.vue";

const displayShape = GlobalConfig.displayShape;

const capabilities = useCapabilities();
const activeCapability = computed(() =>
    capabilities.value.find((c) => c.id === activeCapabilityId.value),
);

const fallbackMain = MateChatDefaultView;

const activeSide = computed(() => activeCapability.value?.ui?.side || null);
const sideTitle = computed(() => "Tools");

const sideVisible = ref(false);

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