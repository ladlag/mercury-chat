/**
 * Authentication Adapter
 * 
 * Provides an isolation layer between business authentication logic and external authentication services.
 * Following the project's principle of "Code Independence and Framework Upgrade Compatibility".
 * 
 * Backend API Base: http(s)://host:port/chat-api
 * All authentication endpoints are under /auth path
 */

import type { LoginRequest } from '@/types/auth-types';
import { httpClient } from '@/utils/http-client';

// API Endpoints Configuration
const AUTH_ENDPOINTS = {
  SEND_CODE: '/auth/verification-code/send',        // POST - Send verification code
  LOGIN: '/auth/login',                             // POST - Login with credentials
  LOGOUT: '/auth/logout',                           // POST - Logout
  REFRESH_TOKEN: '/auth/token/refresh',             // POST - Refresh JWT token
  USER_INFO: '/auth/user/info',                     // GET - Get current user info
  WECHAT_QR: '/auth/wechat/qr-code',               // POST - Get WeChat QR code
  WECHAT_STATUS: '/auth/wechat/scan-status',       // GET - Poll WeChat scan status
} as const;

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
   * 
   * API Endpoint: POST /chat-api/auth/verification-code/send
   * Request Body: { phone: string, type: 'sms' }
   * Response: { code: 0, message: string, data: { expiresIn: number } }
   * 
   * NOTE: Currently using mock implementation
   */
  async sendVerificationCodeAPI(phone: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Mock implementation - replace with real API when backend is ready
      console.log('[AuthAdapter] Mock: Sending verification code to:', phone);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock success response
      return { 
        success: true, 
        message: '验证码已发送' 
      };
      
      // Real API implementation (uncomment when backend is ready):
      /*
      const response = await httpClient.post(AUTH_ENDPOINTS.SEND_CODE, { 
        phone,
        type: 'sms'
      });
      return { 
        success: response.code === 0, 
        message: response.message 
      };
      */
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
   * 
   * API Endpoint: POST /chat-api/auth/login
   * Request Body: LoginRequest
   * Response: { 
   *   code: 0, 
   *   message: string, 
   *   data: { 
   *     token: string, 
   *     refreshToken: string,
   *     user: UserInfo 
   *   } 
   * }
   * 
   * Real API implementation with token
   */
  async loginAPI(request: LoginRequest): Promise<{ 
    success: boolean; 
    token?: string; 
    user?: any;
    message?: string 
  }> {
    try {
      const response = await httpClient.post(AUTH_ENDPOINTS.LOGIN, request);
      
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
   * 
   * API Endpoint: POST /chat-api/auth/wechat/qr-code
   * Request Body: { type: 'official' | 'scan' }
   * Response: { 
   *   code: 0, 
   *   data: { 
   *     qrUrl: string, 
   *     ticket: string,
   *     expiresIn: number 
   *   } 
   * }
   * 
   * NOTE: Currently using mock implementation
   */
  async getWeChatQRCodeAPI(type: 'official' | 'scan'): Promise<{ 
    success: boolean; 
    qrUrl?: string; 
    ticket?: string;
    message?: string 
  }> {
    try {
      // Mock implementation - replace with real API when backend is ready
      console.log('[AuthAdapter] Mock: Getting WeChat QR code for:', type);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockTicket = `MOCK_TICKET_${Date.now()}`;
      const mockQrUrl = `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${mockTicket}`;
      
      return { 
        success: true, 
        qrUrl: mockQrUrl,
        ticket: mockTicket,
      };
      
      // Real API implementation (uncomment when backend is ready):
      /*
      const response = await httpClient.post(AUTH_ENDPOINTS.WECHAT_QR, { type });
      
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
      */
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
   * 
   * API Endpoint: GET /chat-api/auth/wechat/scan-status?ticket=xxx
   * Response: { 
   *   code: 0, 
   *   data: { 
   *     scanned: boolean,
   *     confirmed: boolean,
   *     token?: string,
   *     user?: UserInfo
   *   } 
   * }
   * 
   * NOTE: Currently using mock implementation
   */
  async pollWeChatQRStatus(ticket: string): Promise<{ 
    success: boolean; 
    scanned?: boolean; 
    confirmed?: boolean;
    token?: string;
    user?: any;
  }> {
    try {
      // Mock implementation - replace with real API when backend is ready
      console.log('[AuthAdapter] Mock: Polling WeChat QR status for ticket:', ticket);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock: Not scanned yet
      return { 
        success: true, 
        scanned: false,
        confirmed: false,
      };
      
      // Real API implementation (uncomment when backend is ready):
      /*
      const response = await httpClient.get(`${AUTH_ENDPOINTS.WECHAT_STATUS}?ticket=${ticket}`);
      
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
      */
    } catch (error: any) {
      console.error('[AuthAdapter] Failed to poll WeChat QR status:', error);
      return { 
        success: false 
      };
    }
  },

  /**
   * Refresh authentication token
   * 
   * API Endpoint: POST /chat-api/auth/token/refresh
   * Request Body: { refreshToken: string }
   * Response: { 
   *   code: 0, 
   *   data: { 
   *     token: string,
   *     refreshToken: string 
   *   } 
   * }
   */
  async refreshTokenAPI(refreshToken: string): Promise<{
    success: boolean;
    token?: string;
    message?: string;
  }> {
    try {
      const response = await httpClient.post(AUTH_ENDPOINTS.REFRESH_TOKEN, { refreshToken });
      
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
   * 
   * API Endpoint: POST /chat-api/auth/logout
   * Request: No body (token in header)
   * Response: { code: 0, message: string }
   */
  async logoutAPI(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.post(AUTH_ENDPOINTS.LOGOUT);
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
   * 
   * API Endpoint: GET /chat-api/auth/user/info
   * Request: No body (token in header)
   * Response: { 
   *   code: 0, 
   *   data: UserInfo 
   * }
   */
  async getUserInfoAPI(): Promise<{
    success: boolean;
    user?: any;
    message?: string;
  }> {
    try {
      const response = await httpClient.get(AUTH_ENDPOINTS.USER_INFO);
      
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
