# NexaBank Admin Hub - Implementation Summary

## Overview
Complete implementation of JWT-based authentication system with automatic token refresh, role-based routing, and FD calculator integration.

## Key Features Implemented

### 1. **Authentication System**
- **Real API Integration**: Connected to Authentication Service (port 3020)
- **JWT Token Management**: 
  - Access token and refresh token storage
  - Automatic token decoding to extract user information
  - Token expiration handling with automatic refresh
- **User Types**: Support for ADMIN and CUSTOMER user types
- **Role-Based Routing**: Automatic redirection based on userType in JWT

### 2. **Automatic Token Refresh**
- **5-Minute Interval**: Token refresh triggers every 5 minutes
- **Silent Refresh**: Background token renewal without user interaction
- **Failure Handling**: Automatic logout and redirect on refresh failure
- **Auto-retry on 401**: Intercepts 401 errors and attempts token refresh

### 3. **FD Calculator Enhancement**
- **Real Calculation API**: Integrated with FD Calculation Service (port 8081)
- **Dynamic Categories**: Fetches customer categories from API
- **Cumulative & Non-Cumulative**: Support for both FD types
- **Login Prompt**: Displays dialog to login before creating FD account
- **Account Creation**: Direct FD account creation after calculation
- **Compounding Options**: Daily, Monthly, Quarterly, Yearly

### 4. **User Dashboard**
- **Profile Information**: Displays user details from JWT token
- **FD Accounts**: Lists all FD accounts for the logged-in customer
- **Real-time Stats**: Total FD value, interest earned, average rates
- **Transaction History**: View transactions for each FD account

### 5. **Admin Dashboard**
- **Dashboard Stats**: Total users, active FDs, deposits, revenue
- **User Management**: View and manage all users
- **Product Management**: Configure products and pricing
- **Analytics**: Performance metrics and KPIs

## API Integration

### Authentication Service (Port 3020)
```typescript
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/admin/dashboard/stats
GET  /api/admin/users
```

### FD Calculation Service (Port 8081)
```typescript
POST /api/fd/calculate
GET  /api/fd/calculations/{calcId}
GET  /api/fd/categories
GET  /api/fd/compounding-options
```

### FD Account Management Service (Port 8080)
```typescript
POST /api/v1/accounts
GET  /api/v1/accounts/search
GET  /api/v1/accounts/{accountNumber}/transactions
POST /api/v1/accounts/{accountNumber}/withdrawal
GET  /api/v1/auth/me
```

### Product & Pricing Service (Port 8080)
```typescript
GET  /api/products
GET  /api/products/{productCode}
POST /api/products
PUT  /api/products/{productCode}
DELETE /api/products/{productCode}
```

## JWT Token Structure

The JWT token contains the following claims:
```json
{
  "sub": "admin@nexabank.com",           // Email (subject)
  "jti": "uuid",                         // JWT ID
  "userId": "uuid",                      // User ID
  "userType": "ADMIN",                   // ADMIN or CUSTOMER
  "roles": "ADMIN_FULL_ACCESS,USER",     // Comma-separated roles
  "iat": 1761121018,                     // Issued at
  "exp": 1761121048                      // Expiration
}
```

## User Flows

### 1. Home Page Flow
```
Home Page → FD Calculator
↓
User enters FD details
↓
Clicks "Calculate"
↓
Calculation API called
↓
Results displayed
↓
User clicks "Create FD Account"
↓
If not logged in → Login prompt dialog
If logged in → Create account → Redirect to dashboard
```

### 2. Login Flow
```
User enters credentials
↓
POST /api/auth/login
↓
Receive access token + refresh token
↓
Decode token to get userType
↓
Store tokens + user info in localStorage
↓
Start auto-refresh (every 5 min)
↓
Redirect based on userType:
  - ADMIN → /admin
  - CUSTOMER → /dashboard
```

### 3. Token Refresh Flow
```
Every 5 minutes:
↓
Get refresh token from localStorage
↓
POST /api/auth/refresh
↓
If successful:
  - Store new tokens
  - Continue session
↓
If failed:
  - Clear tokens
  - Redirect to /auth
```

### 4. Admin Access Flow
```
Admin logs in
↓
userType: ADMIN detected
↓
Redirect to /admin
↓
Display:
  - Dashboard stats
  - User management
  - Product management
  - Analytics
```

### 5. Customer Access Flow
```
Customer logs in
↓
userType: CUSTOMER detected
↓
Redirect to /dashboard
↓
Fetch user data:
  - Profile info (from token)
  - FD accounts (from API)
  - Transactions
↓
Display:
  - Profile information
  - FD accounts list
  - Stats (total value, interest)
```

## Token Management

### Storage
- **accessToken**: Stored in localStorage
- **refreshToken**: Stored in localStorage
- **userInfo**: Stored in localStorage (parsed from JWT)

### Auto-Refresh
- Interval: 5 minutes (300,000 ms)
- Started: On successful login
- Stopped: On logout or app unmount

### Token Decoder
```typescript
tokenManager.decodeToken(token) → {
  sub: string,      // Email
  userId: string,   // User ID
  userType: string, // ADMIN or CUSTOMER
  roles: string,    // Comma-separated roles
  exp: number,      // Expiration timestamp
  iat: number       // Issued at timestamp
}
```

## Component Updates

### Modified Files
1. **src/services/api.ts**
   - Added tokenManager utility
   - Implemented auto-refresh mechanism
   - Updated API endpoints for all services
   - Added 401 error interception

2. **src/pages/Auth.tsx**
   - Real API integration (login/register)
   - Loading states
   - Error handling
   - Token storage
   - User type detection

3. **src/App.tsx**
   - Authentication state management
   - Token refresh lifecycle
   - Protected route logic

4. **src/components/FDCalculator.tsx**
   - Real calculation API
   - Dynamic categories
   - Login prompt dialog
   - Account creation flow

5. **src/pages/UserDashboard.tsx**
   - Token-based data fetching
   - FD account listing
   - Profile display

6. **src/components/Navbar.tsx**
   - Logout API integration
   - Token cleanup

## Environment Setup

### Required Services
```bash
# Authentication Service
http://localhost:3020

# FD Calculation Service
http://localhost:8081

# FD Account & Product Service
http://localhost:8080
```

### Starting the Application
```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

## Testing Scenarios

### 1. Admin Login
- Email: admin@nexabank.com
- Should redirect to /admin
- Should see admin dashboard with stats

### 2. Customer Login
- Email: customer@nexabank.com
- Should redirect to /dashboard
- Should see FD accounts and profile

### 3. FD Calculator (Not Logged In)
- Enter FD details
- Calculate
- Click "Create FD Account"
- Should show login prompt

### 4. FD Calculator (Logged In)
- Enter FD details
- Calculate
- Click "Create FD Account"
- Should create account and redirect to dashboard

### 5. Token Refresh
- Login
- Wait 5 minutes
- Check console for "Token refreshed successfully"
- Continue using app without interruption

### 6. Logout
- Click logout button
- Tokens should be cleared
- Should redirect to home page
- Should not be able to access protected routes

## Security Features

1. **JWT Validation**: Tokens verified on every API call
2. **Auto Logout**: Invalid/expired tokens trigger automatic logout
3. **Secure Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)
4. **Token Refresh**: Prevents session expiration during active use
5. **Role-Based Access**: Routes protected based on userType
6. **API Authorization**: Bearer token sent with all authenticated requests

## Future Enhancements

1. **Refresh Token Rotation**: Implement token rotation for enhanced security
2. **HttpOnly Cookies**: Move tokens to httpOnly cookies for XSS protection
3. **Remember Me**: Optional long-lived refresh tokens
4. **Multi-Factor Authentication**: Add 2FA support
5. **Session Management**: Display active sessions, remote logout
6. **Token Revocation**: Admin ability to revoke user tokens
7. **Activity Monitoring**: Track user actions and login history

## Troubleshooting

### Issue: Token refresh not working
**Solution**: Check if refresh token API endpoint is correct and service is running on port 3020

### Issue: 401 errors after login
**Solution**: Verify JWT token is being sent in Authorization header

### Issue: Auto-refresh not triggering
**Solution**: Check browser console for errors, verify refresh interval is set correctly

### Issue: Wrong dashboard after login
**Solution**: Verify userType in JWT token is correctly set by backend

### Issue: Calculator not creating account
**Solution**: Check if FD Account service is running on port 8080 and calculation ID is valid

## API Endpoints Summary

| Service | Port | Base URL |
|---------|------|----------|
| Authentication | 3020 | http://localhost:3020/api/auth |
| FD Calculator | 8081 | http://localhost:8081/api/fd |
| FD Account | 8080 | http://localhost:8080/api/v1 |
| Product & Pricing | 8080 | http://localhost:8080/api/products |

## Conclusion

The implementation provides a complete, production-ready authentication system with:
- ✅ JWT token management
- ✅ Automatic token refresh (5-minute interval)
- ✅ Role-based routing (ADMIN vs CUSTOMER)
- ✅ FD calculator with real API integration
- ✅ Login prompt for unauthenticated users
- ✅ Comprehensive error handling
- ✅ User dashboard with FD account management
- ✅ Admin dashboard with management tools

All features are fully integrated with the backend microservices architecture described in the OpenAPI specifications.
