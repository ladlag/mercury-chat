// Authentication state management
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User, LoginMethod, LoginRequest } from '@/types/auth-types';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isAuthenticated = ref(false);
  const loginMethod = ref<LoginMethod | null>(null);

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

  // Login
  const login = async (request: LoginRequest): Promise<boolean> => {
    try {
      // TODO: Replace with actual API call
      // Simulate API call for now
      const mockUser: User = {
        id: 'mock-user-id',
        username: request.phone || request.email || 'User',
        email: request.email,
        phone: request.phone,
        avatar: '',
        createdAt: new Date(),
      };

      const mockToken = 'mock-jwt-token-' + Date.now();

      // Update state
      user.value = mockUser;
      token.value = mockToken;
      loginMethod.value = request.method;
      isAuthenticated.value = true;

      // Persist to localStorage
      localStorage.setItem('auth-token', mockToken);
      localStorage.setItem('auth-user', JSON.stringify(mockUser));
      localStorage.setItem('auth-method', request.method);

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  // Logout
  const logout = () => {
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
      // TODO: Replace with actual API call
      console.log('Sending verification code to:', phone);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Failed to send verification code:', error);
      return false;
    }
  };

  // Get WeChat QR code
  const getWeChatQRCode = async (type: 'official' | 'scan'): Promise<string | null> => {
    try {
      // TODO: Replace with actual API call
      console.log('Getting WeChat QR code for:', type);
      // Return a mock QR code URL
      return `https://api.example.com/wechat/qr?type=${type}&t=${Date.now()}`;
    } catch (error) {
      console.error('Failed to get WeChat QR code:', error);
      return null;
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
    
    // Actions
    login,
    logout,
    sendVerificationCode,
    getWeChatQRCode,
    init,
  };
});
