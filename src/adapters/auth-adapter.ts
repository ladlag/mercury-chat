/**
 * Authentication Adapter
 * 
 * Provides an isolation layer between business authentication logic and external authentication services.
 * Following the project's principle of "Code Independence and Framework Upgrade Compatibility".
 */

import type { LoginRequest } from '@/types/auth-types';
import { httpClient } from '@/utils/http-client';

export const AuthAdapter = {
  /**
   * Validate phone number format
   */
  validatePhone(phone: string): boolean {
    // Chinese phone number format: 11 digits starting with 1
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  },

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate verification code format
   */
  validateVerificationCode(code: string): boolean {
    // 6 digits verification code
    return /^\d{6}$/.test(code);
  },

  /**
   * Format phone number for display
   */
  formatPhone(phone: string): string {
    if (phone.length === 11) {
      return `${phone.slice(0, 3)} ${phone.slice(3, 7)} ${phone.slice(7)}`;
    }
    return phone;
  },

  /**
   * Get countdown time for resending verification code
   */
  getResendCountdown(): number {
    return 60; // 60 seconds
  },

  /**
   * Send verification code to phone
   * API Endpoint: POST /api/auth/send-code
   */
  async sendVerificationCodeAPI(phone: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.post('/auth/send-code', { phone });
      return { 
        success: response.code === 0, 
        message: response.message 
      };
    } catch (error: any) {
      console.error('[AuthAdapter] Failed to send verification code:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to send verification code' 
      };
    }
  },

  /**
   * Login with credentials
   * API Endpoint: POST /api/auth/login
   * Returns JWT token and user info
   */
  async loginAPI(request: LoginRequest): Promise<{ 
    success: boolean; 
    token?: string; 
    user?: any;
    message?: string 
  }> {
    try {
      const response = await httpClient.post('/auth/login', request);
      
      if (response.code === 0) {
        return {
          success: true,
          token: response.data.token,
          user: response.data.user,
        };
      } else {
        return {
          success: false,
          message: response.message || 'Login failed',
        };
      }
    } catch (error: any) {
      console.error('[AuthAdapter] Login failed:', error);
      return { 
        success: false, 
        message: error.message || 'Login failed' 
      };
    }
  },

  /**
   * Get WeChat QR code
   * API Endpoint: POST /api/auth/wechat/qr
   */
  async getWeChatQRCodeAPI(type: 'official' | 'scan'): Promise<{ 
    success: boolean; 
    qrUrl?: string; 
    ticket?: string;
    message?: string 
  }> {
    try {
      const response = await httpClient.post('/auth/wechat/qr', { type });
      
      if (response.code === 0) {
        return { 
          success: true, 
          qrUrl: response.data.qrUrl,
          ticket: response.data.ticket,
        };
      } else {
        return {
          success: false,
          message: response.message,
        };
      }
    } catch (error: any) {
      console.error('[AuthAdapter] Failed to get WeChat QR code:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to get WeChat QR code' 
      };
    }
  },

  /**
   * Poll WeChat QR code scan status
   * API Endpoint: GET /api/auth/wechat/status?ticket=xxx
   */
  async pollWeChatQRStatus(ticket: string): Promise<{ 
    success: boolean; 
    scanned?: boolean; 
    confirmed?: boolean;
    token?: string;
    user?: any;
  }> {
    try {
      const response = await httpClient.get(`/auth/wechat/status?ticket=${ticket}`);
      
      if (response.code === 0) {
        return { 
          success: true, 
          scanned: response.data.scanned,
          confirmed: response.data.confirmed,
          token: response.data.token,
          user: response.data.user,
        };
      } else {
        return {
          success: false,
        };
      }
    } catch (error: any) {
      console.error('[AuthAdapter] Failed to poll WeChat QR status:', error);
      return { 
        success: false 
      };
    }
  },

  /**
   * Refresh authentication token
   * API Endpoint: POST /api/auth/refresh-token
   */
  async refreshTokenAPI(refreshToken: string): Promise<{
    success: boolean;
    token?: string;
    message?: string;
  }> {
    try {
      const response = await httpClient.post('/auth/refresh-token', { refreshToken });
      
      if (response.code === 0) {
        return {
          success: true,
          token: response.data.token,
        };
      } else {
        return {
          success: false,
          message: response.message,
        };
      }
    } catch (error: any) {
      console.error('[AuthAdapter] Failed to refresh token:', error);
      return {
        success: false,
        message: error.message || 'Failed to refresh token',
      };
    }
  },

  /**
   * Logout
   * API Endpoint: POST /api/auth/logout
   */
  async logoutAPI(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.post('/auth/logout');
      return {
        success: response.code === 0,
        message: response.message,
      };
    } catch (error: any) {
      console.error('[AuthAdapter] Logout failed:', error);
      return {
        success: false,
        message: error.message || 'Logout failed',
      };
    }
  },

  /**
   * Get current user info
   * API Endpoint: GET /api/auth/user
   */
  async getUserInfoAPI(): Promise<{
    success: boolean;
    user?: any;
    message?: string;
  }> {
    try {
      const response = await httpClient.get('/auth/user');
      
      if (response.code === 0) {
        return {
          success: true,
          user: response.data,
        };
      } else {
        return {
          success: false,
          message: response.message,
        };
      }
    } catch (error: any) {
      console.error('[AuthAdapter] Failed to get user info:', error);
      return {
        success: false,
        message: error.message || 'Failed to get user info',
      };
    }
  },
};
