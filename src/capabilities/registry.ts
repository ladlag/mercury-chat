// src/capabilities/registry.ts  （修改）
import { shallowRef } from "vue";

export type CapabilityKind = "chat" | "agent";

export interface CapabilityNavbar {
    titleKey: string;
    icon: string;
    order?: number;
    visible?: boolean;
}

export interface CapabilityUI {
    main: any;
    side?: any;

    // ✅ 可选：给右侧抽屉用（不影响已有能力）
    sideTitle?: string;
    sideWidth?: number;
    sideProps?: Record<string, any>;
}

export interface Capability {
    id: string;
    kind: CapabilityKind;
    navbar: CapabilityNavbar;
    ui: CapabilityUI;
    onActivate?: () => void;
    preventNavigation?: boolean; // Set to true for modal-only capabilities
}

/**
 * Map：id 唯一；重复注册覆盖更新
 */
const capMap = new Map<string, Capability>();
const capabilities = shallowRef<Capability[]>([]);

function rebuildList() {
    const list = Array.from(capMap.values())
        .filter((c) => c.navbar.visible !== false)
        .sort((a, b) => (a.navbar.order ?? 0) - (b.navbar.order ?? 0));

    capabilities.value = list;
}

export function registerCapability(cap: Capability) {
    capMap.set(cap.id, cap);
    rebuildList();
}

export function useCapabilities() {
    return capabilities;
}

export function __clearCapabilitiesForDevOnly() {
    capMap.clear();
    rebuildList();
}