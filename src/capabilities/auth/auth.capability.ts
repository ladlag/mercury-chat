import type { Capability } from '@/capabilities/registry';
import AuthPageView from './ui/AuthPageView.vue';
import { useAuthStore } from '@/store/auth-store';

export const AuthCapability: Capability = {
  id: 'auth-login',
  kind: 'agent',
  navbar: {
    titleKey: 'auth.login',
    icon: '/auth-login.svg',
    order: 5,
    visible: true,
  },
  ui: {
    main: AuthPageView,
  },
  preventNavigation: true, // This capability opens a modal instead of navigating
  onActivate: () => {
    // Open login modal instead of navigating to page
    const authStore = useAuthStore();
    authStore.openLoginModal();
  },
};
