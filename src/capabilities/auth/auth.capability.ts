import type { Capability } from '@/capabilities/registry';
import LoginMain from './ui/LoginMain.vue';

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
    main: LoginMain,
  },
};
