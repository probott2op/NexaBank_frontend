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

// Auto-refresh token before it expires (access token is valid for 10 minutes)
let refreshInterval: NodeJS.Timeout | null = null;

export const startTokenRefresh = () => {
  // Clear any existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  
  // Refresh token every 9 minutes (540000 ms) - before the 10-minute expiry
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
          // API returns: { success: true, data: { accessToken, refreshToken, ... }, ... }
          if (result.success && result.data) {
            const { accessToken, refreshToken: newRefreshToken, user } = result.data;
            tokenManager.setTokens(accessToken, newRefreshToken);
            if (user) {
              tokenManager.setUserInfo(user);
            }
            console.log('Token refreshed successfully at', new Date().toLocaleTimeString());
          } else {
            throw new Error('Invalid refresh response');
          }
        } else {
          console.error('Token refresh failed, logging out');
          tokenManager.clearTokens();
          window.location.href = '/auth';
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        // Don't logout on network errors, only on auth failures
      }
    }
  }, 540000); // 9 minutes
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
            const result = await refreshResponse.json();
            // API returns: { success: true, data: { accessToken, refreshToken, user }, ... }
            if (result.success && result.data) {
              const { accessToken, refreshToken: newRefreshToken, user } = result.data;
              tokenManager.setTokens(accessToken, newRefreshToken);
              if (user) {
                tokenManager.setUserInfo(user);
              }
              
              // Retry original request with new token
              return apiFetch(url, options);
            }
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
  // Core Product Management
  getAllProducts: (params?: { page?: number; size?: number; sort?: string }) => {
    const queryParams = params ? `?${new URLSearchParams(params as any)}` : '';
    return apiFetch(`${API_URLS.PRODUCT}/api/products${queryParams}`);
  },
  
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

  // Interest Rates Management
  getInterestRates: (productCode: string, params?: { page?: number; size?: number }) => {
    const queryParams = params ? `?${new URLSearchParams(params as any)}` : '';
    return apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/interest-rates${queryParams}`);
  },
  
  addInterestRate: (productCode: string, data: any) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/interest-rates`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateInterestRate: (productCode: string, interestId: string, data: any) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/interest-rates/${interestId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteInterestRate: (productCode: string, interestId: string) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/interest-rates/${interestId}`, {
      method: 'DELETE',
    }),

  // Charges & Fees Management
  getCharges: (productCode: string, params?: { page?: number; size?: number }) => {
    const queryParams = params ? `?${new URLSearchParams(params as any)}` : '';
    return apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/charges${queryParams}`);
  },
  
  addCharge: (productCode: string, data: any) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/charges`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateCharge: (productCode: string, chargeId: string, data: any) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/charges/${chargeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteCharge: (productCode: string, chargeId: string) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/charges/${chargeId}`, {
      method: 'DELETE',
    }),

  // Balance Types Management
  getBalances: (productCode: string, params?: { page?: number; size?: number }) => {
    const queryParams = params ? `?${new URLSearchParams(params as any)}` : '';
    return apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/balances${queryParams}`);
  },
  
  addBalance: (productCode: string, data: any) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/balances`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateBalance: (productCode: string, balanceType: string, data: any) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/balances/${balanceType}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteBalance: (productCode: string, balanceType: string) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/balances/${balanceType}`, {
      method: 'DELETE',
    }),

  // Business Rules Management
  getRules: (productCode: string, params?: { page?: number; size?: number }) => {
    const queryParams = params ? `?${new URLSearchParams(params as any)}` : '';
    return apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/rules${queryParams}`);
  },
  
  addRule: (productCode: string, data: any) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/rules`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateRule: (productCode: string, ruleId: string, data: any) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteRule: (productCode: string, ruleId: string) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/rules/${ruleId}`, {
      method: 'DELETE',
    }),

  // Transaction Types Management
  getTransactions: (productCode: string, params?: { page?: number; size?: number }) => {
    const queryParams = params ? `?${new URLSearchParams(params as any)}` : '';
    return apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/transactions${queryParams}`);
  },
  
  addTransaction: (productCode: string, data: any) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/transactions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateTransaction: (productCode: string, transactionCode: string, data: any) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/transactions/${transactionCode}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteTransaction: (productCode: string, transactionCode: string) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/transactions/${transactionCode}`, {
      method: 'DELETE',
    }),

  // Communication Templates Management
  getCommunications: (productCode: string, params?: { page?: number; size?: number }) => {
    const queryParams = params ? `?${new URLSearchParams(params as any)}` : '';
    return apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/communications${queryParams}`);
  },
  
  addCommunication: (productCode: string, data: any) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/communications`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateCommunication: (productCode: string, commId: string, data: any) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/communications/${commId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteCommunication: (productCode: string, commId: string) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/communications/${commId}`, {
      method: 'DELETE',
    }),

  // Roles & Permissions Management
  getRoles: (productCode: string, params?: { page?: number; size?: number }) => {
    const queryParams = params ? `?${new URLSearchParams(params as any)}` : '';
    return apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/roles${queryParams}`);
  },
  
  addRole: (productCode: string, data: any) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/roles`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateRole: (productCode: string, roleId: string, data: any) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteRole: (productCode: string, roleId: string) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/roles/${roleId}`, {
      method: 'DELETE',
    }),

  // Audit Trail APIs
  // Interest Rates Audit Trail
  getInterestRateAuditTrail: (productCode: string, rateCode: string) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/interest-rates/${rateCode}/audit-trail`),
  
  getAllInterestRatesAuditTrail: (productCode: string) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/interest-rates/audit-trail`),

  // Charges Audit Trail
  getChargeAuditTrail: (productCode: string, chargeCode: string) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/charges/${chargeCode}/audit-trail`),
  
  getAllChargesAuditTrail: (productCode: string) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/charges/audit-trail`),

  // Balances Audit Trail
  getBalanceAuditTrail: (productCode: string, balanceType: string) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/balances/${balanceType}/audit-trail`),
  
  getAllBalancesAuditTrail: (productCode: string) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/balances/audit-trail`),

  // Rules Audit Trail
  getRuleAuditTrail: (productCode: string, ruleCode: string) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/rules/${ruleCode}/audit-trail`),
  
  getAllRulesAuditTrail: (productCode: string) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/rules/audit-trail`),

  // Transactions Audit Trail
  getTransactionAuditTrail: (productCode: string, transactionCode: string) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/transactions/${transactionCode}/audit-trail`),
  
  getAllTransactionsAuditTrail: (productCode: string) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/transactions/audit-trail`),

  // Communications Audit Trail
  getCommunicationAuditTrail: (productCode: string, commCode: string) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/communications/${commCode}/audit-trail`),
  
  getAllCommunicationsAuditTrail: (productCode: string) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/communications/audit-trail`),

  // Roles Audit Trail
  getRoleAuditTrail: (productCode: string, roleCode: string) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/roles/${roleCode}/audit-trail`),
  
  getAllRolesAuditTrail: (productCode: string) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/roles/audit-trail`),

  // Product Audit Trail
  getProductAuditTrail: (productCode: string) =>
    apiFetch(`${API_URLS.PRODUCT}/api/products/${productCode}/audit-trail`),
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
