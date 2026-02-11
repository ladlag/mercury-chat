/**
 * Authentication Guard Composable
 * 
 * Provides authentication checking functionality based on global configuration.
 * When requireLogin is enabled, this composable helps enforce authentication
 * before allowing user interactions.
 */

import { computed } from 'vue';
import { useAuthStore } from '@/store/auth-store';
import GlobalConfig from '@/global-config';

export function useAuthGuard() {
  const authStore = useAuthStore();

  // Check if login is required based on global config
  const requireLogin = computed(() => GlobalConfig.requireLogin ?? false);

  // Check if user is authenticated
  const isAuthenticated = computed(() => authStore.isAuthenticated);

  /**
   * Check if authentication is required for an action
   * Returns true if the action can proceed, false if auth is needed
   */
  const checkAuth = (): boolean => {
    if (!requireLogin.value) {
      // Login not required, always allow action
      return true;
    }

    if (isAuthenticated.value) {
      // User is authenticated, allow action
      return true;
    }

    // User needs to authenticate
    authStore.openLoginModal();
    return false;
  };

  /**
   * Guard a function with authentication check
   * If auth is required and user is not authenticated, shows login modal
   * and does not execute the function
   */
  const guardAction = <T extends (...args: any[]) => any>(
    action: T
  ): ((...args: Parameters<T>) => ReturnType<T> | void) => {
    return (...args: Parameters<T>) => {
      if (checkAuth()) {
        return action(...args);
      }
    };
  };

  return {
    requireLogin,
    isAuthenticated,
    checkAuth,
    guardAction,
  };
}
