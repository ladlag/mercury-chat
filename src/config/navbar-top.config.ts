import { computed, ref } from "vue";
import { useCapabilities } from "@/capabilities/registry";

export const activeCapabilityId = ref<string>("chat-default");

/**
 * Navbar 专用的 UI 结构输出
 * registry 只负责能力注册与唯一性
 * navbar 负责排序、过滤、激活行为
 */
export function useNavbarItems() {
    const caps = useCapabilities();

    return computed(() => {
        return (
            caps.value
                // 1️⃣ 过滤不可见
                .filter((c) => c.navbar?.visible !== false)

                // 2️⃣ 排序（order 越小越靠前，未定义排最后）
                .slice()
                .sort((a, b) => {
                    const oa = a.navbar.order ?? Number.MAX_SAFE_INTEGER;
                    const ob = b.navbar.order ?? Number.MAX_SAFE_INTEGER;
                    return oa - ob;
                })

                // 3️⃣ 转为 navbar UI item
                .map((c) => ({
                    id: c.id,
                    labelKey: c.navbar.titleKey,
                    icon: c.navbar.icon,
                    kind: c.kind,

                    onSelect() {
                        // Call onActivate first if it exists
                        c.onActivate?.();
                        
                        // Only navigate if capability has UI to display
                        // Auth capability opens modal, so don't navigate
                        if (c.id !== 'auth-login') {
                            activeCapabilityId.value = c.id;
                        }
                    },
                }))
        );
    });
}