import { computed } from "vue";
import { useCapabilities } from "@/capabilities/registry";
import { activeCapabilityId } from "@/config/navbar-top.config";

export function useActiveSideComponent() {
    const caps = useCapabilities();
    return computed(() => {
        const cap = caps.value.find(c => c.id === activeCapabilityId.value);
        return cap?.ui?.side;
    });
}