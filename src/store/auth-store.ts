// Authentication state management
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User, LoginMethod, LoginRequest } from '@/types/auth-types';
import { AuthAdapter } from '@/adapters/auth-adapter';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isAuthenticated = ref(false);
  const loginMethod = ref<LoginMethod | null>(null);
  const showLoginModal = ref(false); // Control login modal visibility

  // Initialize from localStorage
  const init = () => {
    const savedToken = localStorage.getItem('auth-token');
    const savedUser = localStorage.getItem('auth-user');
    const savedMethod = localStorage.getItem('auth-method');

    if (savedToken && savedUser) {
      token.value = savedToken;
      user.value = JSON.parse(savedUser);
      loginMethod.value = savedMethod as LoginMethod;
      isAuthenticated.value = true;
    }
  };

  // Show login modal
  const openLoginModal = () => {
    showLoginModal.value = true;
  };

  // Hide login modal
  const closeLoginModal = () => {
    showLoginModal.value = false;
  };

  // Login
  const login = async (request: LoginRequest): Promise<boolean> => {
    try {
      // Call real API through adapter
      const result = await AuthAdapter.loginAPI(request);
      
      if (!result.success || !result.token || !result.user) {
        console.error('Login failed:', result.message);
        return false;
      }

      // Update state with real data from API
      user.value = result.user;
      token.value = result.token;
      loginMethod.value = request.method;
      isAuthenticated.value = true;

      // Persist to localStorage
      localStorage.setItem('auth-token', result.token);
      localStorage.setItem('auth-user', JSON.stringify(result.user));
      localStorage.setItem('auth-method', request.method);

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Call logout API to invalidate token on server
      await AuthAdapter.logoutAPI();
    } catch (error) {
      console.error('Logout API failed:', error);
      // Continue with local logout even if API fails
    }

    // Clear local state
    user.value = null;
    token.value = null;
    loginMethod.value = null;
    isAuthenticated.value = false;

    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    localStorage.removeItem('auth-method');
  };

  // Send verification code
  const sendVerificationCode = async (phone: string): Promise<boolean> => {
    try {
      const result = await AuthAdapter.sendVerificationCodeAPI(phone);
      return result.success;
    } catch (error) {
      console.error('Failed to send verification code:', error);
      return false;
    }
  };

  // Get WeChat QR code
  const getWeChatQRCode = async (type: 'official' | 'scan'): Promise<string | null> => {
    try {
      const result = await AuthAdapter.getWeChatQRCodeAPI(type);
      return result.success ? result.qrUrl || null : null;
    } catch (error) {
      console.error('Failed to get WeChat QR code:', error);
      return null;
    }
  };

  // Refresh authentication token
  const refreshToken = async (): Promise<boolean> => {
    try {
      if (!token.value) {
        return false;
      }

      const result = await AuthAdapter.refreshTokenAPI(token.value);
      
      if (result.success && result.token) {
        token.value = result.token;
        localStorage.setItem('auth-token', result.token);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  };

  // Get current user info from server
  const fetchUserInfo = async (): Promise<boolean> => {
    try {
      const result = await AuthAdapter.getUserInfoAPI();
      
      if (result.success && result.user) {
        user.value = result.user;
        localStorage.setItem('auth-user', JSON.stringify(result.user));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      return false;
    }
  };

  // Initialize on store creation
  init();

  return {
    // State
    user,
    token,
    isAuthenticated,
    loginMethod,
    showLoginModal,
    
    // Actions
    login,
    logout,
    sendVerificationCode,
    getWeChatQRCode,
    refreshToken,
    fetchUserInfo,
    init,
    openLoginModal,
    closeLoginModal,
  };
});
