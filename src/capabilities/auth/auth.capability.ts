import type { Capability } from '@/capabilities/registry';
import AuthPageView from './ui/AuthPageView.vue';

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
};
