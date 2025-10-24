// API base URLs - configure these based on your deployment
const API_URLS = {
  AUTH: 'http://localhost:3020', // Authentication Service
  FD_CALC: 'http://localhost:8081', // FD Calculator Service  
  FD_ACCOUNT: 'http://localhost:9090', // FD Account Management Service
  PRODUCT: 'http://localhost:8080', // Product & Pricing Service
  CUSTOMER: 'http://localhost:1005', // Customer Profile Service
};

// Token Management
export const tokenManager = {
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('customerNumber');
  },
  getUserInfo: () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  },
  setUserInfo: (userInfo: any) => {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  },
  getCustomerNumber: () => localStorage.getItem('customerNumber'),
  setCustomerNumber: (customerNumber: string) => {
    localStorage.setItem('customerNumber', customerNumber);
  },
  // Decode JWT to get user info
  decodeToken: (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }
};

// Auto-refresh token every 5 minutes
let refreshInterval: NodeJS.Timeout | null = null;

export const startTokenRefresh = () => {
  // Clear any existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  
  // Refresh token every 5 minutes (300000 ms)
  refreshInterval = setInterval(async () => {
    const refreshToken = tokenManager.getRefreshToken();
    if (refreshToken) {
      try {
        const response = await fetch(`${API_URLS.AUTH}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
        
        if (response.ok) {
          const result = await response.json();
          // Handle response with data wrapper
          const { accessToken, refreshToken: newRefreshToken } = result.data || result;
          tokenManager.setTokens(accessToken, newRefreshToken);
          console.log('Token refreshed successfully');
        } else {
          console.error('Token refresh failed, logging out');
          tokenManager.clearTokens();
          window.location.href = '/auth';
        }
      } catch (error) {
        console.error('Token refresh error:', error);
      }
    }
  }, 300000); // 5 minutes
};

export const stopTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

// Common fetch wrapper with auth
const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = tokenManager.getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Handle 401 Unauthorized - token expired
    if (response.status === 401) {
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        // Try to refresh token
        try {
          const refreshResponse = await fetch(`${API_URLS.AUTH}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          });
          
          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            tokenManager.setTokens(data.token, data.refreshToken);
            
            // Retry original request with new token
            return apiFetch(url, options);
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
      }
      
      // If refresh failed, logout
      tokenManager.clearTokens();
      window.location.href = '/auth';
      throw new Error('Session expired. Please login again.');
    }
    
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// Authentication APIs
export const authAPI = {
  // Login with email and password
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URLS.AUTH}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      // Create a custom error with status code for better handling
      const customError: any = new Error(error.message || error.error || 'Login failed');
      customError.status = response.status;
      customError.details = error;
      throw customError;
    }
    
    return response.json();
  },
  
  // Register new user
  register: async (data: any) => {
    const response = await fetch(`${API_URLS.AUTH}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(error.message || 'Registration failed');
    }
    
    return response.json();
  },
  
  // Refresh access token
  refresh: async (refreshToken: string) => {
    const response = await fetch(`${API_URLS.AUTH}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    
    return response.json();
  },
  
  // Logout
  logout: () => apiFetch(`${API_URLS.AUTH}/api/auth/logout`, { method: 'POST' }),
  
  // Admin: Get dashboard stats
  getDashboardStats: () => apiFetch(`${API_URLS.AUTH}/api/admin/dashboard/stats`),
  
  // Admin: Get all users
  getAllUsers: () => apiFetch(`${API_URLS.AUTH}/api/admin/users`),
  
  // Admin: Update user status
  updateUserStatus: (userId: string, status: string) => 
    apiFetch(`${API_URLS.AUTH}/api/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
  
  // Admin: Update user roles
  updateUserRoles: (userId: string, roles: string[]) => 
    apiFetch(`${API_URLS.AUTH}/api/admin/users/${userId}/roles`, {
      method: 'PUT',
      body: JSON.stringify({ roles })
    }),
};

// Product APIs
export const productAPI = {
  getAllProducts: () => apiFetch(`${API_URLS.PRODUCT}/api/products`),
  
  getProductByCode: (productCode: string) => 
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}`),
  
  createProduct: (data: any) => 
    apiFetch(`${API_URLS.PRODUCT}/api/products`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateProduct: (productCode: string, data: any) => 
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteProduct: (productCode: string) => 
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}`, {
      method: 'DELETE',
    }),
  
  searchProducts: (params: any) => 
    apiFetch(`${API_URLS.PRODUCT}/api/products/search?${new URLSearchParams(params)}`),
};

// FD Calculator APIs
export const fdCalcAPI = {
  // Calculate FD returns
  calculate: (data: any) => 
    apiFetch(`${API_URLS.FD_CALC}/api/fd/calculate`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Get calculation by ID
  getCalculation: (calcId: string) => 
    apiFetch(`${API_URLS.FD_CALC}/api/fd/calculations/${calcId}`),
  
  // Get categories
  getCategories: () => 
    apiFetch(`${API_URLS.FD_CALC}/api/fd/categories`),
  
  // Get compounding options
  getCompoundingOptions: () => 
    apiFetch(`${API_URLS.FD_CALC}/api/fd/compounding-options`),
};

// FD Account Management APIs
export const fdAccountAPI = {
  // Create FD account
  createAccount: (data: any) => 
    apiFetch(`${API_URLS.FD_ACCOUNT}/api/v1/accounts`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Search accounts
  searchAccounts: (params: { accountNumber?: string; customerId?: string; productCode?: string }) => {
    const queryParams = new URLSearchParams();
    if (params.accountNumber) queryParams.append('accountNumber', params.accountNumber);
    if (params.customerId) queryParams.append('customerId', params.customerId);
    if (params.productCode) queryParams.append('productCode', params.productCode);
    return apiFetch(`${API_URLS.FD_ACCOUNT}/api/v1/accounts/search?${queryParams}`);
  },
  
  // Get account transactions
  getAccountTransactions: (accountNumber: string) => 
    apiFetch(`${API_URLS.FD_ACCOUNT}/api/v1/accounts/${accountNumber}/transactions`),
  
  // Add account holder/role
  addAccountHolder: (accountNumber: string, data: any) => 
    apiFetch(`${API_URLS.FD_ACCOUNT}/api/v1/accounts/${accountNumber}/roles`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Premature withdrawal inquiry
  withdrawalInquiry: (accountNumber: string) => 
    apiFetch(`${API_URLS.FD_ACCOUNT}/api/v1/accounts/${accountNumber}/withdrawal-inquiry`),
  
  // Perform withdrawal
  performWithdrawal: (accountNumber: string, data: any) => 
    apiFetch(`${API_URLS.FD_ACCOUNT}/api/v1/accounts/${accountNumber}/withdrawal`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Verify auth
  verifyAuth: () => 
    apiFetch(`${API_URLS.FD_ACCOUNT}/api/v1/auth/verify`),
  
  // Get current user info
  getCurrentUser: () => 
    apiFetch(`${API_URLS.FD_ACCOUNT}/api/v1/auth/me`),
};

// Customer Profile APIs
export const customerAPI = {
  // Get profile by email
  getProfileByEmail: (email: string) => 
    apiFetch(`${API_URLS.CUSTOMER}/api/profiles/email/${encodeURIComponent(email)}`),
  
  // Get profile by customer number
  getProfileByCustomerNumber: (customerNumber: string) => 
    apiFetch(`${API_URLS.CUSTOMER}/api/profiles/customer/${customerNumber}`),
  
  // Get profile by user ID
  getProfileByUserId: (userId: string) => 
    apiFetch(`${API_URLS.CUSTOMER}/api/profiles/user/${userId}`),
  
  // Update profile by customer number
  updateProfile: (customerNumber: string, data: any) => 
    apiFetch(`${API_URLS.CUSTOMER}/api/profiles/customer/${customerNumber}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  // Update address
  updateAddress: (customerNumber: string, data: any) => 
    apiFetch(`${API_URLS.CUSTOMER}/api/profiles/customer/${customerNumber}/address`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  // Update name
  updateName: (customerNumber: string, data: any) => 
    apiFetch(`${API_URLS.CUSTOMER}/api/profiles/customer/${customerNumber}/name`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  // Update identification
  updateIdentification: (customerNumber: string, data: any) => 
    apiFetch(`${API_URLS.CUSTOMER}/api/profiles/customer/${customerNumber}/identification`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  // Get audit trail
  getAuditTrail: (userId: string) => 
    apiFetch(`${API_URLS.CUSTOMER}/api/profiles/user/${userId}/audit-trail`),
  
  // Search profiles
  searchProfiles: (name: string) => 
    apiFetch(`${API_URLS.CUSTOMER}/api/profiles/search?name=${encodeURIComponent(name)}`),
  
  // Get all profiles (admin only)
  getAllProfiles: () => 
    apiFetch(`${API_URLS.CUSTOMER}/api/profiles`),
};
