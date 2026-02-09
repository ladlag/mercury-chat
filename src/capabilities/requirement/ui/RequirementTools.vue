<template>
  <d-card>
    <template #header>{{ $t("agent.requirement.tools") }}</template>

    <d-form layout="vertical">
      <d-form-item :label="$t('agent.requirement.risk')">
        <d-slider v-model="session.tools.risk" :min="0" :max="100"/>
      </d-form-item>

      <d-form-item :label="$t('agent.requirement.enableRule')">
        <d-switch v-model="session.tools.enableRule"/>
      </d-form-item>
    </d-form>
  </d-card>
</template>

<script setup lang="ts">
import {useAgentSession} from "@/capabilities/common/agent-session";

const session = useAgentSession("agent-requirement");
if (session.tools.risk === undefined) session.tools.risk = 30;
if (session.tools.enableRule === undefined) session.tools.enableRule = true;
</script>