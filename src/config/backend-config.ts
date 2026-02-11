/**
 * Environment Configuration
 * 
 * Configure backend API settings based on environment
 */

export interface BackendConfig {
  host: string;      // Backend server host (e.g., 'localhost' or '192.168.1.100')
  port: number;      // Backend server port (e.g., 8080)
  apiPrefix: string; // API prefix (e.g., 'chat-api')
  useHttps: boolean; // Use HTTPS instead of HTTP
  timeout: number;   // Request timeout in milliseconds
}

// Default configuration
const defaultConfig: BackendConfig = {
  host: import.meta.env.VITE_API_HOST || 'localhost',
  port: import.meta.env.VITE_API_PORT ? parseInt(import.meta.env.VITE_API_PORT) : 8080,
  apiPrefix: import.meta.env.VITE_API_PREFIX || 'chat-api',
  useHttps: import.meta.env.VITE_API_USE_HTTPS === 'true',
  timeout: 30000,
};

export class BackendConfigManager {
  private config: BackendConfig;

  constructor(config?: Partial<BackendConfig>) {
    this.config = {
      ...defaultConfig,
      ...config,
    };
  }

  /**
   * Get the full base URL for API requests
   * Format: http(s)://host:port/apiPrefix
   * Example: http://localhost:8080/chat-api
   */
  getBaseURL(): string {
    const protocol = this.config.useHttps ? 'https' : 'http';
    const { host, port, apiPrefix } = this.config;
    
    // Don't include port in URL if it's the default port for the protocol
    const portStr = (protocol === 'https' && port === 443) || (protocol === 'http' && port === 80)
      ? ''
      : `:${port}`;
    
    return `${protocol}://${host}${portStr}/${apiPrefix}`;
  }

  /**
   * Get request timeout
   */
  getTimeout(): number {
    return this.config.timeout;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<BackendConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<BackendConfig> {
    return { ...this.config };
  }
}

// Create and export singleton instance
export const backendConfig = new BackendConfigManager();

// Export base URL for convenient access
export const getApiBaseURL = () => backendConfig.getBaseURL();
export const getApiTimeout = () => backendConfig.getTimeout();
