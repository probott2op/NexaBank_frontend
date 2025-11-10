# 🚀 Quick Start Guide - NexaBank Admin Hub

## Prerequisites Checklist

- [ ] Node.js 18+ or Bun installed
- [ ] Backend services running:
  - [ ] Authentication Service (port 3020)
  - [ ] FD Calculator Service (port 8081)
  - [ ] FD Account Service (port 8080)
  - [ ] Product & Pricing Service (port 8080)

## Installation (5 minutes)

### Step 1: Install Dependencies
```bash
# Using Bun (recommended)
bun install

# OR using npm
npm install
```

### Step 2: Start Development Server
```bash
bun run dev
# OR
npm run dev
```

### Step 3: Open Browser
Navigate to: `http://localhost:5173`

## First-Time Setup

### 1. Test Authentication
- Click "Get Started" or "Login"
- Use demo credentials:
  - **Admin**: admin@nexabank.com
  - **Customer**: customer@nexabank.com

### 2. Explore Admin Dashboard (if admin)
- View dashboard statistics
- Manage users
- Configure products
- View analytics

### 3. Explore Customer Dashboard (if customer)
- View profile information
- See FD accounts
- Use FD calculator
- Track transactions

## Feature Walkthrough

### 🧮 FD Calculator (Unauthenticated)
1. Go to home page
2. Scroll to "Calculate Your Returns"
3. Enter:
   - Principal: 100000
   - Tenure: 5 years
   - Category: Any (optional)
   - Compounding: Quarterly
4. Click "Calculate Maturity Value"
5. See results
6. Click "Create FD Account" → Login prompt appears

### 🔐 Login & Token Management
1. Click "Login"
2. Enter credentials
3. Submit form
4. **Automatic:**
   - JWT token stored in localStorage
   - Token decoded to get userType
   - Redirect to appropriate dashboard
   - Auto-refresh starts (every 5 min)

### 💼 Create FD Account (Authenticated)
1. Login as customer
2. Use FD calculator
3. Enter FD details
4. Click "Calculate"
5. Click "Create FD Account"
6. Account created automatically
7. Redirected to dashboard
8. View new account in list

### 👤 Admin Operations
1. Login as admin
2. Go to "User Management" tab
3. View all users
4. Update user status/roles
5. Go to "Product Management"
6. View/edit products
7. Check analytics

## Testing the Token Refresh

### Manual Test
1. Login successfully
2. Open browser DevTools → Console
3. Wait 5 minutes
4. Look for: `"Token refreshed successfully"`
5. Continue using app without interruption

### Programmatic Test
```javascript
// Run in browser console after login
setInterval(() => {
  console.log('Token:', localStorage.getItem('accessToken')?.substring(0, 20) + '...');
}, 60000); // Log every minute
```

## Common Workflows

### Workflow 1: New Customer Sign Up
```
1. Click "Get Started"
2. Go to "Sign Up" tab
3. Fill form:
   - Full Name
   - Email
   - Phone
   - Date of Birth
   - Password
4. Submit
5. Auto-login
6. Redirected to dashboard
```

### Workflow 2: Calculate & Create FD
```
1. Login as customer
2. Go to dashboard
3. Use calculator:
   - Principal: 500000
   - Tenure: 3 years
   - Category: SENIOR
   - Type: Cumulative
4. Calculate
5. Review results
6. Create account
7. See account in list
```

### Workflow 3: Admin User Management
```
1. Login as admin
2. Go to "User Management"
3. View user list
4. Click edit on user
5. Update status: ACTIVE/INACTIVE
6. Update roles
7. Save changes
```

## Debugging Tips

### Check Token Status
```javascript
// Run in browser console
const token = localStorage.getItem('accessToken');
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log('User:', decoded);
console.log('Expires:', new Date(decoded.exp * 1000));
```

### Check User Info
```javascript
const userInfo = JSON.parse(localStorage.getItem('userInfo'));
console.log('UserType:', userInfo.userType);
console.log('UserId:', userInfo.userId);
```

### Clear Tokens (Force Logout)
```javascript
localStorage.clear();
window.location.reload();
```

### Monitor API Calls
1. Open DevTools → Network tab
2. Filter: Fetch/XHR
3. Watch for:
   - `POST /api/auth/login`
   - `POST /api/auth/refresh`
   - `POST /api/fd/calculate`
   - `POST /api/v1/accounts`

## API Health Checks

### Test Backend Services
```bash
# Authentication Service
curl http://localhost:3020/api/auth/public-key

# FD Calculator Service
curl http://localhost:8081/api/fd/categories

# FD Account Service (requires auth)
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/v1/auth/verify

# Product Service
curl http://localhost:8080/api/products
```

## Troubleshooting Quick Fixes

### Issue: Login fails with "Network Error"
**Fix:**
```bash
# Check if auth service is running
curl http://localhost:3020/health
# OR start the service
```

### Issue: Token refresh fails
**Fix:**
```javascript
// Clear corrupted tokens
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
// Refresh page and login again
```

### Issue: Wrong dashboard displayed
**Fix:**
```javascript
// Check userType
const userInfo = JSON.parse(localStorage.getItem('userInfo'));
console.log('UserType:', userInfo.userType); // Should be ADMIN or CUSTOMER
```

### Issue: FD Calculator not loading categories
**Fix:**
```bash
# Check FD Calc service
curl http://localhost:8081/api/fd/categories
# Should return array of categories
```

### Issue: Can't create FD account
**Fix:**
1. Check if logged in: `localStorage.getItem('accessToken')`
2. Check calculation ID exists
3. Verify FD Account service is running
4. Check JWT token is valid

## Performance Tips

1. **Enable React DevTools**: Install browser extension for debugging
2. **Check Bundle Size**: `bun run build --analyze`
3. **Monitor Network**: Use browser DevTools Network tab
4. **Cache API Responses**: Categories/products rarely change

## Next Steps

- [ ] Read [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [ ] Review [JWT Token Flow](./JWT_TOKEN_FLOW.md)
- [ ] Study [Architecture Diagrams](./ARCHITECTURE_DIAGRAMS.md)
- [ ] Explore [API Specifications](./login.yaml)
- [ ] Test all user flows
- [ ] Customize for your needs

## Need Help?

1. Check documentation files
2. Review browser console for errors
3. Verify backend services are running
4. Check API responses in Network tab
5. Validate JWT token structure
6. Contact: support@nexabank.com

---

**Happy Banking! 🏦**
