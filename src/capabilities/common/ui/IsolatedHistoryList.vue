<!-- src/capabilities/chat-custom/ui/IsolatedHistoryList.vue -->
<template>
  <div :class="['history-list-container', !commonStore.isExpand && 'not-expand']">
    <div class="history-header">
      <div class="history-header-left">
        <span class="history-title">{{ $t("history.chatHistory") }}</span>
      </div>
    </div>

    <d-search
        v-model="searchKey"
        is-keyup-search
        icon-position="left"
        :placeholder="$t('history.searchChat')"
        :show-glow-style="false"
        class="history-search"
        @search="onSearch"
    />

    <div :class="['history-list-box', !renderList.length && 'empty']">
      <template v-for="(item, index) in renderList" :key="index">
        <Collapse v-model="item.expand" :title="t(item.title)">
          <div
              v-for="(val, i) in item.list"
              :key="i"
              class="history-item"
              :class="{ active: val.id === activeSessionId }"
              @click="() => onHistoryClick(val)"
          >
            <div class="history-item-title">{{ val.title }}</div>
            <div class="history-item-sub">{{ formatTime(val.updatedAt) }}</div>
          </div>
        </Collapse>
      </template>

      <div v-if="!renderList.length" class="history-list-empty">
        <img :src="themeStore.theme === 'dark' ? NoDataDarkPng : NoDataPng" />
        <span>{{ $t("noData") }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Collapse } from "@/components";
import { useThemeStore, useCommonStore } from "@/store";
import { useI18n } from "vue-i18n";
import { ref, watch } from "vue";

import NoDataPng from "/no-data.png";
import NoDataDarkPng from "/no-data-dark.png";

type CategorizedItem = {
  title: string;
  updateDate: string;
  updateTime: number;
  expand: boolean;
  list: {
    id: string;
    title: string;
    updatedAt: number;
    updateDate: string;
    updateTime: number;
  }[];
};

const props = defineProps<{
  chatId: string;
  sessions: { id: string; title: string; updatedAt: number }[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
}>();

const { t } = useI18n();
const themeStore = useThemeStore();
const commonStore = useCommonStore();

const searchKey = ref("");
const renderList = ref<CategorizedItem[]>([]);
let categorizedList: CategorizedItem[] = [];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function dateKey(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function dateTitle(key: string) {
  // 复用 i18n 逻辑的话需要 getHistoryTitle；这里保持简化且不引入额外依赖
  return key;
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function updateCategorizedList() {
  const map: Record<string, CategorizedItem> = {};
  for (let i = 0; i < props.sessions.length; i++) {
    const s = props.sessions[i];
    const key = dateKey(s.updatedAt);
    const updateTime = s.updatedAt;

    if (!map[key]) {
      map[key] = {
        title: dateTitle(key),
        updateDate: key,
        updateTime,
        expand: true,
        list: [],
      };
    }
    map[key].list.push({
      id: s.id,
      title: s.title,
      updatedAt: s.updatedAt,
      updateDate: key,
      updateTime,
    });
  }

  categorizedList = Object.values(map).sort((a, b) => b.updateTime - a.updateTime);
  // 组内按更新时间倒序
  categorizedList.forEach(group => group.list.sort((a, b) => b.updatedAt - a.updatedAt));
}

function onSearch(e: string) {
  if (!e) {
    renderList.value = categorizedList;
    return;
  }
  const res: CategorizedItem[] = [];
  for (let i = 0; i < categorizedList.length; i++) {
    const item = { ...categorizedList[i] };
    item.list = item.list.filter(x => x.title.includes(e));
    if (item.list.length) res.push(item);
  }
  renderList.value = res;
}

function onHistoryClick(val: { id: string }) {
  props.onSelectSession(val.id);
}

watch(
    () => props.sessions,
    () => {
      searchKey.value = "";
      updateCategorizedList();
      onSearch("");
    },
    { immediate: true, deep: true },
);
</script>

<style scoped lang="scss">
/* 直接复用 MateChat 原 history-list.vue 的结构与尺寸 */
.history-list-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 240px;
  max-width: 380px;
  width: 25%;
  height: 100%;
  padding: 12px;
  color: $devui-text;
  transition: all 0.3s ease-in-out;

  &.not-expand {
    width: 0;
    min-width: 0;
    padding: 0;
    opacity: 0;
  }

  .history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .history-header-left,
    .history-header-right {
      display: flex;
      align-items: center;
    }
  }

  .history-title {
    font-size: $devui-font-size-lg;
    font-weight: bold;
    margin-bottom: 8px;
    white-space: nowrap;
  }

  .history-search :deep() {
    .devui-input {
      border: none;
      border-radius: 100px;
    }
  }

  .history-list-box {
    flex: 1;
    margin-top: 8px;
    overflow: auto;

    &.empty {
      display: flex;
      justify-content: center;
      align-items: center;

      .history-list-empty {
        display: flex;
        flex-flow: column;
        justify-content: center;
        align-items: center;

        span {
          margin-top: 20px;
        }
      }
    }
  }
}

/* 用最小样式实现 HistoryItem 的“同风格 list item”，不引入 HistoryItem 组件以避免依赖默认 store */
.history-item {
  padding: 10px 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  &.active {
    background: rgba(0, 0, 0, 0.06);
    outline: 1px solid rgba(0, 0, 0, 0.08);
  }

  .history-item-title {
    font-weight: 600;
    font-size: 13px;
    line-height: 18px;
    word-break: break-word;
  }

  .history-item-sub {
    margin-top: 4px;
    font-size: 12px;
    opacity: 0.7;
  }
}

body[ui-theme-type="light"] {
  .history-list-container {
    backdrop-filter: blur(50px);
    background-color: rgba(249, 249, 249, 0.8);
  }
}

body[ui-theme-type="dark"] {
  .history-list-container {
    background-color: $devui-global-bg;
  }
}
</style>