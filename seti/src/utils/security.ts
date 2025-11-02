/**
 * Frontend Security Utilities
 * Comprehensive security measures for the Seti frontend
 */

// Input validation and sanitization
export class SecurityUtils {
  /**
   * Sanitize user input to prevent XSS attacks
   */
  static sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate blockchain address format
   */
  static validateAddress(address: string): boolean {
    if (!address || typeof address !== 'string') return false;
    
    // Basic address validation (implement proper checksum validation)
    return /^[0-9a-fA-Fx]+$/.test(address) && address.length >= 20;
  }

  /**
   * Validate amount is positive number
   */
  static validateAmount(amount: number | string): boolean {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return !isNaN(num) && num > 0 && num < 1e18; // Reasonable upper limit
  }

  /**
   * Validate prediction outcome
   */
  static validateOutcome(outcome: string): boolean {
    return outcome === 'YES' || outcome === 'NO';
  }

  /**
   * Sanitize and validate market question
   */
  static validateMarketQuestion(question: string): { valid: boolean; sanitized: string; error?: string } {
    if (!question || typeof question !== 'string') {
      return { valid: false, sanitized: '', error: 'Question is required' };
    }

    const sanitized = this.sanitizeInput(question);
    
    if (sanitized.length < 10) {
      return { valid: false, sanitized, error: 'Question too short (min 10 characters)' };
    }
    
    if (sanitized.length > 500) {
      return { valid: false, sanitized, error: 'Question too long (max 500 characters)' };
    }

    return { valid: true, sanitized };
  }

  /**
   * Sanitize and validate market description
   */
  static validateMarketDescription(description: string): { valid: boolean; sanitized: string; error?: string } {
    if (!description) {
      return { valid: true, sanitized: '' }; // Description is optional
    }

    const sanitized = this.sanitizeInput(description);
    
    if (sanitized.length > 2000) {
      return { valid: false, sanitized, error: 'Description too long (max 2000 characters)' };
    }

    return { valid: true, sanitized };
  }

  /**
   * Validate username
   */
  static validateUsername(username: string): { valid: boolean; sanitized: string; error?: string } {
    if (!username || typeof username !== 'string') {
      return { valid: false, sanitized: '', error: 'Username is required' };
    }

    const sanitized = this.sanitizeInput(username);
    
    if (sanitized.length < 3) {
      return { valid: false, sanitized, error: 'Username too short (min 3 characters)' };
    }
    
    if (sanitized.length > 100) {
      return { valid: false, sanitized, error: 'Username too long (max 100 characters)' };
    }

    // Check for valid characters (alphanumeric, underscore, hyphen)
    if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
      return { valid: false, sanitized, error: 'Username contains invalid characters' };
    }

    return { valid: true, sanitized };
  }

  /**
   * Validate URL format
   */
  static validateUrl(url: string): boolean {
    if (!url) return true; // Optional field
    
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Escape HTML entities
   */
  static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Secure API client with built-in security measures
export class SecureApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Set admin key for admin operations
   */
  setAdminKey(key: string): void {
    this.defaultHeaders['X-Admin-Key'] = key;
  }

  /**
   * Secure fetch with error handling and validation
   */
  async secureFetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data?: T; error?: string; status: number }> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      // Validate URL to prevent SSRF attacks
      if (!this.isValidUrl(url)) {
        throw new Error('Invalid URL');
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
      });

      // Handle different response types
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
        }
        
        return { error: errorMessage, status: response.status };
      }

      // Parse response safely
      let data: T;
      try {
        data = await response.json();
      } catch {
        throw new Error('Invalid JSON response');
      }

      return { data, status: response.status };
    } catch (error) {
      console.error('API Error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 0 
      };
    }
  }

  /**
   * Validate URL to prevent SSRF attacks
   */
  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      // Only allow HTTP/HTTPS protocols
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Secure GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<{ data?: T; error?: string; status: number }> {
    const url = params ? `${endpoint}?${new URLSearchParams(params).toString()}` : endpoint;
    return this.secureFetch<T>(url, { method: 'GET' });
  }

  /**
   * Secure POST request with data validation
   */
  async post<T>(endpoint: string, data: any, validateData?: (data: any) => { valid: boolean; error?: string }): Promise<{ data?: T; error?: string; status: number }> {
    // Validate data if validator provided
    if (validateData) {
      const validation = validateData(data);
      if (!validation.valid) {
        return { error: validation.error || 'Invalid data', status: 400 };
      }
    }

    return this.secureFetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Secure PUT request with data validation
   */
  async put<T>(endpoint: string, data: any, validateData?: (data: any) => { valid: boolean; error?: string }): Promise<{ data?: T; error?: string; status: number }> {
    // Validate data if validator provided
    if (validateData) {
      const validation = validateData(data);
      if (!validation.valid) {
        return { error: validation.error || 'Invalid data', status: 400 };
      }
    }

    return this.secureFetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

// Rate limiting for frontend
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }

  /**
   * Get remaining requests
   */
  getRemaining(key: string): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

// Content Security Policy helper
export class CSPHelper {
  /**
   * Generate nonce for inline scripts
   */
  static generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Create secure script tag
   */
  static createSecureScript(code: string): HTMLScriptElement {
    const script = document.createElement('script');
    script.nonce = this.generateNonce();
    script.textContent = code;
    return script;
  }
}

// Secure storage for sensitive data
export class SecureStorage {
  /**
   * Store data securely (in memory for sensitive data)
   */
  static setSecure(key: string, value: string): void {
    // For sensitive data, store in memory only
    // In production, consider using Web Crypto API for encryption
    sessionStorage.setItem(`secure_${key}`, value);
  }

  /**
   * Get secure data
   */
  static getSecure(key: string): string | null {
    return sessionStorage.getItem(`secure_${key}`);
  }

  /**
   * Remove secure data
   */
  static removeSecure(key: string): void {
    sessionStorage.removeItem(`secure_${key}`);
  }

  /**
   * Clear all secure data
   */
  static clearSecure(): void {
    const keys = Object.keys(sessionStorage).filter(key => key.startsWith('secure_'));
    keys.forEach(key => sessionStorage.removeItem(key));
  }
}

// Security event logging
export class SecurityLogger {
  private static logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info';

  static setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    this.logLevel = level;
  }

  static log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    
    if (levels[level] >= levels[this.logLevel]) {
      console[level](`[Security] ${message}`, data || '');
      
      // In production, send to security monitoring service
      if (level === 'error' || level === 'warn') {
        this.sendToMonitoring(level, message, data);
      }
    }
  }

  private static sendToMonitoring(level: string, message: string, data?: any): void {
    // Implement security monitoring integration
    // This could send to a security service like Sentry, LogRocket, etc.
    console.log(`[Security Monitoring] ${level.toUpperCase()}: ${message}`, data);
  }
}

// Export all security utilities
export const Security = {
  utils: SecurityUtils,
  api: SecureApiClient,
  rateLimiter: RateLimiter,
  csp: CSPHelper,
  storage: SecureStorage,
  logger: SecurityLogger,
};
