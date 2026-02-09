<template>
  <CapabilityViewLayout>
    <d-card>
      <template #header>
        {{ $t("agent.requirement.title") }}
      </template>

      <d-form layout="vertical">
        <d-form-item :label="$t('agent.requirement.inputLabel')">
          <d-textarea v-model="session.input" :rows="6"/>
        </d-form-item>

        <d-button type="primary" @click="run">
          {{ $t("agent.requirement.run") }}
        </d-button>

        <d-card v-if="session.output" style="margin-top: 12px;">
          <pre class="output">{{ session.output }}</pre>
        </d-card>
      </d-form>
    </d-card>
  </CapabilityViewLayout>
</template>

<script setup lang="ts">
import CapabilityViewLayout from "@/capabilities/common/ui/CapabilityViewLayout.vue";
import {useAgentSession} from "@/capabilities/common/agent-session";
import {RequirementAgentRunner} from "../runner";

const session = useAgentSession("agent-requirement");
const runner = new RequirementAgentRunner();

const run = async () => {
  session.output = await runner.run(session.input, session.tools);
};
</script>

<style scoped>
.output {
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}
</style>