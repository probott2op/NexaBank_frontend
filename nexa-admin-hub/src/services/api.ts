// API base URLs - configure these based on your deployment
const API_URLS = {
  CUSTOMER: 'http://localhost:8081',
  PRODUCT: 'http://localhost:8080',
  FD: 'http://localhost:8080',
  LOGIN: 'http://localhost:8082',
  AUTH: 'http://localhost:8080'
};

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Common fetch wrapper with auth
const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
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
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// Customer Profile APIs
export const customerAPI = {
  getAllProfiles: () => apiFetch(`${API_URLS.CUSTOMER}/api/profiles`),
  
  getProfileByUserId: (userId: string) => 
    apiFetch(`${API_URLS.CUSTOMER}/api/profiles/user/${userId}`),
  
  getProfileByEmail: (email: string) => 
    apiFetch(`${API_URLS.CUSTOMER}/api/profiles/email/${email}`),
  
  searchProfiles: (name: string) => 
    apiFetch(`${API_URLS.CUSTOMER}/api/profiles/search?name=${encodeURIComponent(name)}`),
  
  createProfile: (data: any) => 
    apiFetch(`${API_URLS.CUSTOMER}/api/profiles`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateProfile: (userId: string, data: any) => 
    apiFetch(`${API_URLS.CUSTOMER}/api/profiles/user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteProfile: (userId: string) => 
    apiFetch(`${API_URLS.CUSTOMER}/api/profiles/user/${userId}`, {
      method: 'DELETE',
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

// FD Account APIs
export const fdAPI = {
  searchAccounts: (idType: string, value: string) => 
    apiFetch(`${API_URLS.FD}/api/v1/accounts/search?idType=${idType}&value=${encodeURIComponent(value)}`),
  
  createAccount: (data: any) => 
    apiFetch(`${API_URLS.FD}/api/v1/accounts`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getAccountTransactions: (accountNumber: string) => 
    apiFetch(`${API_URLS.FD}/api/v1/accounts/${accountNumber}/transactions`),
};

// Login/Auth APIs
export const authAPI = {
  getDashboardStats: () => 
    apiFetch(`${API_URLS.AUTH}/api/admin/dashboard/stats`),
};
