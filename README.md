# NexaBank Admin Hub

> Enterprise-grade banking administration portal with JWT authentication, role-based access control, and comprehensive Fixed Deposit management.

## 🚀 Features

- **JWT Authentication** - Secure token-based authentication with automatic refresh
- **Role-Based Access** - Separate dashboards for Admin and Customer users
- **Auto Token Refresh** - Automatic token renewal every 5 minutes
- **FD Calculator** - Real-time Fixed Deposit calculation with compound interest
- **Account Management** - Create and manage FD accounts
- **Admin Dashboard** - User management, product configuration, and analytics
- **Customer Dashboard** - Profile management, FD account tracking, and transactions
- **Responsive Design** - Mobile-first design with Tailwind CSS

## 🏗️ Architecture

This application connects to the following microservices:

| Service | Port | Description |
|---------|------|-------------|
| Authentication | 3020 | User authentication, JWT token management |
| FD Calculator | 8081 | Fixed deposit calculation engine |
| FD Account | 8080 | FD account creation and management |
| Product & Pricing | 8080 | Product configuration and pricing rules |

## 📋 Prerequisites

- Node.js 18+ or Bun
- Backend services running (Auth, FD Calc, FD Account, Product services)

## 🛠️ Installation

### Using Bun (Recommended)
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Start development server
bun run dev
```

### Using npm
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Configuration

Update API endpoints in `src/services/api.ts`:

```typescript
const API_URLS = {
  AUTH: 'http://localhost:3020',        // Authentication Service
  FD_CALC: 'http://localhost:8081',     // FD Calculator Service  
  FD_ACCOUNT: 'http://localhost:8080',  // FD Account Management
  PRODUCT: 'http://localhost:8080',     // Product & Pricing
};
```

## 🔐 Authentication Flow

### Login Process
1. User enters credentials on `/auth` page
2. Frontend calls `POST /api/auth/login`
3. Backend validates and returns JWT tokens
4. Frontend stores tokens in localStorage
5. JWT decoded to extract `userType` (ADMIN/CUSTOMER)
6. User redirected based on `userType`:
   - **ADMIN** → `/admin` dashboard
   - **CUSTOMER** → `/dashboard`

### Token Management
- **Access Token**: Used for API authentication (Bearer token)
- **Refresh Token**: Used to obtain new access token
- **Auto Refresh**: Token automatically refreshes every 5 minutes
- **Expiration Handling**: 401 errors trigger token refresh or logout

### JWT Token Structure
```json
{
  "sub": "user@nexabank.com",
  "userId": "uuid",
  "userType": "ADMIN | CUSTOMER",
  "roles": "ROLE1,ROLE2",
  "exp": 1761121048
}
```

## 🎯 User Flows

### Admin Flow
```
Login → Decode JWT (userType=ADMIN) → /admin Dashboard
├── View Stats (users, FDs, revenue)
├── User Management (view, update roles/status)
├── Product Management (create, update, delete)
└── Analytics & Reports
```

### Customer Flow
```
Login → Decode JWT (userType=CUSTOMER) → /dashboard
├── View Profile
├── View FD Accounts
├── Use FD Calculator
├── Create New FD Account
└── View Transactions
```

### FD Calculator Flow (Unauthenticated)
```
Home Page → FD Calculator
├── Enter FD details
├── Calculate maturity value
└── Click "Create Account"
    └── Show login prompt → Redirect to /auth
```

### FD Calculator Flow (Authenticated)
```
Dashboard → FD Calculator
├── Enter FD details
├── Calculate maturity value (API call)
├── Click "Create Account"
└── Create FD account → Redirect to dashboard
```

## 📁 Project Structure

```
src/
├── components/
│   ├── FDCalculator.tsx       # FD calculation with API integration
│   ├── Navbar.tsx              # Navigation with auth status
│   ├── admin/                  # Admin-specific components
│   │   ├── UserManagementTable.tsx
│   │   └── ProductManagementTable.tsx
│   └── ui/                     # Reusable UI components (shadcn)
├── pages/
│   ├── Auth.tsx                # Login/Register page
│   ├── Index.tsx               # Home page with calculator
│   ├── AdminDashboard.tsx      # Admin panel
│   ├── UserDashboard.tsx       # Customer dashboard
│   └── NotFound.tsx            # 404 page
├── services/
│   └── api.ts                  # API client with token management
└── App.tsx                     # Main app with routing
```

## 🔌 API Integration

### Authentication API
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/admin/users` - Get all users (admin)
- `GET /api/admin/dashboard/stats` - Dashboard statistics

### FD Calculator API
- `POST /api/fd/calculate` - Calculate FD returns
- `GET /api/fd/categories` - Get customer categories
- `GET /api/fd/compounding-options` - Get compounding frequencies
- `GET /api/fd/calculations/{id}` - Get calculation by ID

### FD Account API
- `POST /api/v1/accounts` - Create FD account
- `GET /api/v1/accounts/search` - Search FD accounts
- `GET /api/v1/accounts/{number}/transactions` - Get transactions
- `POST /api/v1/accounts/{number}/withdrawal` - Premature withdrawal
- `GET /api/v1/auth/me` - Get current user info

### Product API
- `GET /api/products` - List all products
- `GET /api/products/{code}` - Get product by code
- `POST /api/products` - Create product (admin)
- `PUT /api/products/{code}` - Update product (admin)
- `DELETE /api/products/{code}` - Delete product (admin)

## 🧪 Testing

### Demo Credentials
- **Admin**: admin@nexabank.com
- **Customer**: customer@nexabank.com
- **Password**: (configured in backend)

### Test Scenarios
1. ✅ Login with admin credentials → Should redirect to `/admin`
2. ✅ Login with customer credentials → Should redirect to `/dashboard`
3. ✅ Calculate FD without login → Should show results only
4. ✅ Create FD account without login → Should prompt for login
5. ✅ Create FD account after login → Should create and redirect
6. ✅ Wait 5 minutes after login → Token should auto-refresh
7. ✅ Logout → Tokens cleared, redirected to home

## 🛡️ Security Features

- **JWT Authentication**: Stateless, secure token-based auth
- **Auto Token Refresh**: Prevents session expiration during use
- **Role-Based Access**: Separate routes for admin and customers
- **Token Expiration**: Automatic logout on expired tokens
- **Secure Storage**: Tokens stored in localStorage
- **401 Handling**: Auto-refresh on unauthorized errors
- **Logout API**: Server-side token invalidation

## 📚 Documentation

- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Detailed feature documentation
- [JWT Token Flow](./JWT_TOKEN_FLOW.md) - Authentication flow guide
- [Architecture Diagrams](./ARCHITECTURE_DIAGRAMS.md) - Visual system diagrams

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: React Hooks
- **Routing**: React Router v6
- **HTTP Client**: Fetch API with custom wrapper
- **Authentication**: JWT (Bearer tokens)

## 🚀 Deployment

### Production Build
```bash
bun run build
```

### Preview Production Build
```bash
bun run preview
```

### Environment Variables
Create `.env` file:
```env
VITE_AUTH_API_URL=https://auth.nexabank.com
VITE_FD_CALC_API_URL=https://fdcalc.nexabank.com
VITE_FD_ACCOUNT_API_URL=https://fdaccount.nexabank.com
VITE_PRODUCT_API_URL=https://products.nexabank.com
```

## 🐛 Troubleshooting

### Token refresh not working
- Check if Auth service is running on port 3020
- Verify refresh token API endpoint
- Check browser console for errors

### 401 Errors after login
- Verify JWT token in localStorage
- Check Authorization header in requests
- Validate token expiration time

### Wrong dashboard after login
- Check `userType` in JWT token payload
- Verify token decoding in `tokenManager`
- Ensure backend returns correct `userType`

### FD Calculator not creating account
- Check if FD Account service is running
- Verify calculation ID is valid
- Check JWT token is present

## 📞 Support

For issues or questions:
- Check [documentation files](./IMPLEMENTATION_SUMMARY.md)
- Review [API specifications](./login.yaml)
- Contact: support@nexabank.com

## 📄 License

Proprietary - NexaBank © 2025
