import authService from './authService';

class ApiService {
  constructor() {
    this.baseURL = 'https://fb-backend-chandra.kernn.xyz';
  }

  // Enhanced API request handler with automatic token refresh
  async request(url, options = {}) {
    const { accessToken, refreshToken } = authService.getTokens();
    
    // If no tokens, redirect to login
    if (!accessToken || !refreshToken) {
      console.log('❌ No tokens found, redirecting to login');
      this.redirectToLogin();
      return;
    }
    
    // Add authorization header
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers
    };
    
    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        ...options,
        headers
      });
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        const errorData = await response.json();
        
        // Check if it's a token missing error
        if (errorData.error === 'TOKEN_MISSING' || errorData.requiresLogin) {
          console.log('🔑 Token missing, redirecting to login');
          authService.clearTokens();
          this.redirectToLogin();
          return;
        }
        
        // Try to refresh token
        const refreshResult = await this.refreshAccessToken(refreshToken);
        if (refreshResult.success) {
          // Retry the original request with new token
          headers.Authorization = `Bearer ${refreshResult.accessToken}`;
          return await fetch(`${this.baseURL}${url}`, {
            ...options,
            headers
          });
        } else {
          // Refresh failed, redirect to login
          console.log('❌ Token refresh failed, redirecting to login');
          authService.clearTokens();
          this.redirectToLogin();
          return;
        }
      }
      
      return response;
    } catch (error) {
      console.error('❌ API request failed:', error);
      throw error;
    }
  }

  // Token refresh function
  async refreshAccessToken(refreshToken) {
    try {
      console.log('🔄 Attempting to refresh access token...');
      
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        },
        body: JSON.stringify({ refreshToken })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Token refresh successful');
        authService.storeTokens(data.accessToken, data.refreshToken);
        return { success: true, accessToken: data.accessToken };
      } else {
        console.error('❌ Token refresh failed:', data);
        
        // Handle specific error cases
        if (data.error === 'REFRESH_TOKEN_MISSING' || data.requiresLogin) {
          console.log('🔑 Refresh token missing, redirecting to login');
          authService.clearTokens();
          this.redirectToLogin();
        }
        
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      return { success: false, error: error.message };
    }
  }

  // Redirect to login
  redirectToLogin() {
    // Clear any existing auth state
    authService.clearTokens();
    
    // Redirect to login page
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  // Convenience methods
  async get(url) {
    return this.request(url, { method: 'GET' });
  }

  async post(url, data) {
    return this.request(url, { 
      method: 'POST', 
      body: JSON.stringify(data) 
    });
  }

  async put(url, data) {
    return this.request(url, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    });
  }

  async delete(url) {
    return this.request(url, { method: 'DELETE' });
  }
}

export default new ApiService();
