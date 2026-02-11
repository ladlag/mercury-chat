/**
 * Composable for making authenticated HTTP requests
 * 
 * Provides easy access to HTTP client with automatic token management
 */

import { httpClient } from '@/utils/http-client';
import type { ApiResponse, RequestConfig } from '@/utils/http-client';

export function useHttp() {
  /**
   * Make GET request with authentication
   */
  const get = async <T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> => {
    return httpClient.get<T>(url, config);
  };

  /**
   * Make POST request with authentication
   */
  const post = async <T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> => {
    return httpClient.post<T>(url, data, config);
  };

  /**
   * Make PUT request with authentication
   */
  const put = async <T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> => {
    return httpClient.put<T>(url, data, config);
  };

  /**
   * Make DELETE request with authentication
   */
  const del = async <T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> => {
    return httpClient.delete<T>(url, config);
  };

  /**
   * Make PATCH request with authentication
   */
  const patch = async <T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> => {
    return httpClient.patch<T>(url, data, config);
  };

  /**
   * Upload file with authentication
   */
  const upload = async <T>(url: string, formData: FormData, config?: RequestConfig): Promise<ApiResponse<T>> => {
    return httpClient.upload<T>(url, formData, config);
  };

  return {
    get,
    post,
    put,
    del,
    patch,
    upload,
  };
}
