// Authentication types for Mercury Chat

export enum LoginMethod {
  VerificationCode = 'verification-code',
  WeChatOfficial = 'wechat-official',
  Email = 'email',
  WeChatScan = 'wechat-scan',
}

export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
}

export interface LoginRequest {
  method: LoginMethod;
  phone?: string;
  email?: string;
  code?: string;
  wechatToken?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  loginMethod: LoginMethod | null;
}

export interface VerificationCodeResponse {
  success: boolean;
  message?: string;
  expiresIn?: number;
}
