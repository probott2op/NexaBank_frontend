# JWT Token Flow - Quick Reference

## Token Structure
```json
{
  "sub": "user@nexabank.com",          // Email address
  "jti": "uuid-v4",                     // Unique token ID
  "userId": "user-uuid",                // User identifier
  "userType": "ADMIN | CUSTOMER",       // Determines dashboard
  "roles": "ROLE1,ROLE2",               // Comma-separated roles
  "iat": 1761121018,                    // Issued timestamp
  "exp": 1761121048                     // Expiration timestamp
}
```

## Authentication Flow

### Login
```typescript
1. User submits email + password
2. POST /api/auth/login
3. Response: { token, refreshToken, userId, userType }
4. Store tokens in localStorage:
   - accessToken
   - refreshToken
   - userInfo (decoded from token)
5. Start auto-refresh interval (5 min)
6. Redirect based on userType:
   - ADMIN → /admin
   - CUSTOMER → /dashboard
```

### Auto Token Refresh (Every 5 Minutes)
```typescript
setInterval(async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  });
  
  if (response.ok) {
    const { token, refreshToken } = await response.json();
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
  } else {
    // Logout user
    localStorage.clear();
    window.location.href = '/auth';
  }
}, 300000); // 5 minutes
```

### API Request with Token
```typescript
const token = localStorage.getItem('accessToken');

fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Logout
```typescript
1. POST /api/auth/logout (with Authorization header)
2. Clear localStorage:
   - accessToken
   - refreshToken
   - userInfo
3. Stop auto-refresh interval
4. Redirect to /auth or /
```

## Role-Based Routing

### Protected Routes
```typescript
<Route 
  path="/admin" 
  element={
    isAuthenticated && userType === "ADMIN" 
      ? <AdminDashboard /> 
      : <Navigate to="/auth" />
  } 
/>

<Route 
  path="/dashboard" 
  element={
    isAuthenticated && userType === "CUSTOMER" 
      ? <UserDashboard /> 
      : <Navigate to="/auth" />
  } 
/>
```

## Token Manager Utilities

### Get Tokens
```typescript
import { tokenManager } from '@/services/api';

const accessToken = tokenManager.getAccessToken();
const refreshToken = tokenManager.getRefreshToken();
```

### Store Tokens
```typescript
tokenManager.setTokens(accessToken, refreshToken);
```

### Clear Tokens
```typescript
tokenManager.clearTokens();
```

### Get User Info
```typescript
const userInfo = tokenManager.getUserInfo();
// Returns: { userId, email, userType, roles }
```

### Decode Token
```typescript
const decoded = tokenManager.decodeToken(accessToken);
// Returns JWT payload
```

## FD Calculator Flow with Auth

### Unauthenticated User
```
1. User calculates FD
2. Clicks "Create FD Account"
3. Show login dialog
4. Redirect to /auth
```

### Authenticated User
```
1. User calculates FD
2. Clicks "Create FD Account"
3. POST /api/v1/accounts (with JWT token)
4. Account created
5. Redirect to /dashboard
```

## Error Handling

### 401 Unauthorized
```typescript
if (response.status === 401) {
  // Try to refresh token
  const newToken = await refreshToken();
  if (newToken) {
    // Retry request with new token
    return fetch(url, { ...options, token: newToken });
  } else {
    // Logout user
    tokenManager.clearTokens();
    window.location.href = '/auth';
  }
}
```

### Token Expiration
```typescript
const decoded = tokenManager.decodeToken(token);
const isExpired = Date.now() >= decoded.exp * 1000;

if (isExpired) {
  // Refresh token or logout
}
```

## Best Practices

1. **Always check authentication** before accessing protected resources
2. **Use tokenManager** utilities instead of direct localStorage access
3. **Handle 401 errors** gracefully with automatic token refresh
4. **Clear tokens** on logout to prevent security issues
5. **Start token refresh** after successful login
6. **Stop token refresh** on logout or component unmount
7. **Decode token** to get user info instead of separate API calls
8. **Store minimal data** in localStorage (tokens only)
9. **Validate token** on every protected route access
10. **Log errors** for debugging authentication issues

## Testing Checklist

- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new user
- [ ] Token automatically refreshes after 5 minutes
- [ ] User redirected based on userType (ADMIN/CUSTOMER)
- [ ] Protected routes blocked when not authenticated
- [ ] Logout clears tokens and redirects
- [ ] 401 errors trigger token refresh or logout
- [ ] FD calculator prompts login when not authenticated
- [ ] FD account created when authenticated
