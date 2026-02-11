/**
 * Authentication Adapter
 * 
 * Provides an isolation layer between business authentication logic and external authentication services.
 * Following the project's principle of "Code Independence and Framework Upgrade Compatibility".
 */

import type { LoginRequest } from '@/types/auth-types';

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
   * Mock API call - should be replaced with actual API
   */
  async sendVerificationCodeAPI(phone: string): Promise<{ success: boolean; message?: string }> {
    // TODO: Replace with actual API call
    console.log('[AuthAdapter] Sending verification code to:', phone);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  },

  /**
   * Mock API call - should be replaced with actual API
   */
  async loginAPI(request: LoginRequest): Promise<{ success: boolean; token?: string; message?: string }> {
    // TODO: Replace with actual API call
    console.log('[AuthAdapter] Login request:', request);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { 
      success: true, 
      token: 'mock-token-' + Date.now() 
    };
  },

  /**
   * Mock API call - should be replaced with actual API
   */
  async getWeChatQRCodeAPI(type: 'official' | 'scan'): Promise<{ success: boolean; qrUrl?: string; message?: string }> {
    // TODO: Replace with actual API call
    console.log('[AuthAdapter] Getting WeChat QR code for:', type);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { 
      success: true, 
      qrUrl: `https://api.example.com/wechat/qr?type=${type}&t=${Date.now()}` 
    };
  },

  /**
   * Mock API call - Poll WeChat QR code scan status
   */
  async pollWeChatQRStatus(qrUrl: string): Promise<{ success: boolean; scanned?: boolean; token?: string }> {
    // TODO: Replace with actual API call
    console.log('[AuthAdapter] Polling WeChat QR status for:', qrUrl);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { 
      success: true, 
      scanned: false 
    };
  },
};
