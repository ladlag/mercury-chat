/**
 * HTTP Client with Token Authentication
 * 
 * Provides a configured HTTP client that automatically includes
 * authentication tokens in requests to the backend.
 * 
 * Backend API Format: http(s)://host:port/chat-api/xxxx
 */

import { useAuthStore } from '@/store/auth-store';
import { getApiBaseURL, getApiTimeout } from '@/config/backend-config';

export interface RequestConfig extends RequestInit {
  baseURL?: string;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  code: number;
  message: string;
}

class HttpClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL?: string, timeout?: number) {
    this.baseURL = baseURL || getApiBaseURL();
    this.timeout = timeout || getApiTimeout();
  }

  /**
   * Add authentication token to request headers
   * Token format: Authorization: Bearer <token>
   */
  private getAuthHeaders(): HeadersInit {
    const authStore = useAuthStore();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add token to Authorization header if available
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`;
    }

    return headers;
  }

  /**
   * Make HTTP request with token authentication
   * All requests to backend must include token in header
   */
  private async request<T>(
    url: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { baseURL = this.baseURL, timeout = this.timeout, ...fetchConfig } = config;
    
    // Build full URL
    const fullURL = url.startsWith('http') ? url : `${baseURL}${url}`;
    
    // Merge auth headers with custom headers
    const headers = {
      ...this.getAuthHeaders(),
      ...(fetchConfig.headers || {}),
    };

    console.log('[HTTP Client] Request:', {
      url: fullURL,
      method: config.method || 'GET',
      hasToken: !!headers['Authorization'],
    });

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(fullURL, {
        ...fetchConfig,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
          const authStore = useAuthStore();
          authStore.logout();
          authStore.openLoginModal();
          throw new Error('Authentication failed. Please login again.');
        }

        // Handle other HTTP errors
        const errorText = await response.text();
        throw new Error(`HTTP Error ${response.status}: ${errorText || response.statusText}`);
      }

      // Parse response
      const data = await response.json();
      
      console.log('[HTTP Client] Response:', {
        url: fullURL,
        code: data.code,
        success: data.code === 0,
      });
      
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      console.error('[HTTP Client] Error:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Upload file with multipart/form-data
   * Token is still included in Authorization header
   */
  async upload<T>(url: string, formData: FormData, config?: RequestConfig): Promise<ApiResponse<T>> {
    const authStore = useAuthStore();
    const headers: HeadersInit = {};

    // Add token for file uploads too
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`;
    }

    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: formData,
      headers: {
        ...headers,
        ...(config?.headers || {}),
      },
    });
  }
}

// Create and export default HTTP client instance
export const httpClient = new HttpClient();

// Export convenience methods
export const get = httpClient.get.bind(httpClient);
export const post = httpClient.post.bind(httpClient);
export const put = httpClient.put.bind(httpClient);
export const del = httpClient.delete.bind(httpClient);
export const patch = httpClient.patch.bind(httpClient);
export const upload = httpClient.upload.bind(httpClient);

export default httpClient;
