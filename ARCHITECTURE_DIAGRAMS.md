# NexaBank - System Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     NexaBank Frontend (React)                    │
│                     Port: 5173 (Development)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Requests (JWT Bearer Token)
                              │
        ┌─────────────────────┼─────────────────────┬──────────────┐
        │                     │                     │              │
        ▼                     ▼                     ▼              ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐  ┌──────────────┐
│     Auth     │    │  FD Account  │    │ FD Calculator│  │   Product    │
│   Service    │    │   Service    │    │   Service    │  │   Service    │
│  Port: 3020  │    │  Port: 8080  │    │  Port: 8081  │  │  Port: 8080  │
└──────────────┘    └──────────────┘    └──────────────┘  └──────────────┘
        │                     │                     │              │
        │                     │                     │              │
        └─────────────────────┴─────────────────────┴──────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   PostgreSQL     │
                    │   Database       │
                    └──────────────────┘
```

## Authentication Flow

```
┌──────────┐                ┌──────────────┐              ┌──────────────┐
│  User    │                │   Frontend   │              │ Auth Service │
└────┬─────┘                └──────┬───────┘              └──────┬───────┘
     │                             │                             │
     │ 1. Enter credentials        │                             │
     ├────────────────────────────>│                             │
     │                             │                             │
     │                             │ 2. POST /api/auth/login     │
     │                             ├────────────────────────────>│
     │                             │                             │
     │                             │ 3. Validate credentials     │
     │                             │    & generate JWT           │
     │                             │<────────────────────────────┤
     │                             │                             │
     │                             │ 4. Store tokens             │
     │                             │    - accessToken            │
     │                             │    - refreshToken           │
     │                             │    - userInfo               │
     │                             │                             │
     │ 5. Redirect to dashboard    │                             │
     │    based on userType        │                             │
     │<────────────────────────────┤                             │
     │                             │                             │
```

## Token Refresh Flow (Every 5 Minutes)

```
┌──────────────┐              ┌──────────────┐
│   Frontend   │              │ Auth Service │
│ (Auto Timer) │              │              │
└──────┬───────┘              └──────┬───────┘
       │                             │
       │ 1. Timer triggers (5 min)   │
       │                             │
       │ 2. GET refreshToken         │
       │    from localStorage        │
       │                             │
       │ 3. POST /api/auth/refresh   │
       ├────────────────────────────>│
       │                             │
       │                             │ 4. Validate refresh token
       │                             │    & generate new JWT
       │                             │
       │ 5. Return new tokens        │
       │<────────────────────────────┤
       │                             │
       │ 6. Update localStorage      │
       │    - new accessToken        │
       │    - new refreshToken       │
       │                             │
       │ 7. Continue session         │
       │                             │
```

## FD Calculator Flow (Unauthenticated User)

```
┌──────────┐        ┌──────────────┐        ┌──────────────┐
│  User    │        │   Frontend   │        │  FD Calc API │
└────┬─────┘        └──────┬───────┘        └──────┬───────┘
     │                     │                       │
     │ 1. Enter FD details │                       │
     ├────────────────────>│                       │
     │                     │                       │
     │                     │ 2. POST /api/fd/calc  │
     │                     ├──────────────────────>│
     │                     │                       │
     │                     │ 3. Return calculation │
     │                     │<──────────────────────┤
     │                     │                       │
     │ 4. Display results  │                       │
     │<────────────────────┤                       │
     │                     │                       │
     │ 5. Click "Create    │                       │
     │    FD Account"      │                       │
     ├────────────────────>│                       │
     │                     │                       │
     │                     │ 6. Check if           │
     │                     │    authenticated      │
     │                     │                       │
     │ 7. Show login       │                       │
     │    dialog           │                       │
     │<────────────────────┤                       │
     │                     │                       │
     │ 8. Redirect to      │                       │
     │    /auth            │                       │
     │<────────────────────┤                       │
     │                     │                       │
```

## FD Account Creation Flow (Authenticated User)

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  User    │    │   Frontend   │    │  FD Calc API │    │ FD Account   │
│          │    │              │    │              │    │    API       │
└────┬─────┘    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
     │                 │                    │                   │
     │ 1. Calculate FD │                    │                   │
     ├────────────────>│                    │                   │
     │                 │ 2. Calculate       │                   │
     │                 ├───────────────────>│                   │
     │                 │                    │                   │
     │                 │ 3. Return calcId   │                   │
     │                 │<───────────────────┤                   │
     │                 │                    │                   │
     │ 4. Click Create │                    │                   │
     │    Account      │                    │                   │
     ├────────────────>│                    │                   │
     │                 │                    │                   │
     │                 │ 5. POST /api/v1/accounts             │
     │                 │    (with JWT + calcId)                │
     │                 ├──────────────────────────────────────>│
     │                 │                    │                   │
     │                 │                    │                   │ 6. Verify JWT
     │                 │                    │                   │    Extract userId
     │                 │                    │                   │    Create account
     │                 │                    │                   │
     │                 │ 7. Return account details            │
     │                 │<──────────────────────────────────────┤
     │                 │                    │                   │
     │ 8. Redirect to  │                    │                   │
     │    dashboard    │                    │                   │
     │<────────────────┤                    │                   │
     │                 │                    │                   │
```

## User Type Routing

```
                        ┌─────────────┐
                        │   Login     │
                        │  Success    │
                        └──────┬──────┘
                               │
                               │ Decode JWT Token
                               │ Check userType
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
        ┌───────────────┐             ┌───────────────┐
        │  userType =   │             │  userType =   │
        │    "ADMIN"    │             │  "CUSTOMER"   │
        └───────┬───────┘             └───────┬───────┘
                │                             │
                ▼                             ▼
        ┌───────────────┐             ┌───────────────┐
        │     /admin    │             │   /dashboard  │
        ├───────────────┤             ├───────────────┤
        │ • Dashboard   │             │ • Profile     │
        │   Stats       │             │ • FD Accounts │
        │ • User Mgmt   │             │ • Calculator  │
        │ • Product Mgmt│             │ • Transactions│
        │ • Analytics   │             │               │
        └───────────────┘             └───────────────┘
```

## Request Flow with JWT

```
┌──────────────┐                    ┌──────────────┐
│   Frontend   │                    │  Backend API │
└──────┬───────┘                    └──────┬───────┘
       │                                   │
       │ 1. Get accessToken                │
       │    from localStorage              │
       │                                   │
       │ 2. Add to request header          │
       │    Authorization: Bearer <token>  │
       │                                   │
       │ 3. Send API request               │
       ├──────────────────────────────────>│
       │                                   │
       │                                   │ 4. Verify JWT signature
       │                                   │    Check expiration
       │                                   │    Extract userId
       │                                   │
       │ 5. Return response                │
       │<──────────────────────────────────┤
       │                                   │
       │                                   │
       │ IF 401 Unauthorized:              │
       │ 6. Try refresh token              │
       │ 7. Retry request with new token   │
       │                                   │
```

## Data Flow - Dashboard Loading

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  User    │    │   Frontend   │    │  FD Account  │    │  LocalStorage│
│          │    │   Dashboard  │    │     API      │    │              │
└────┬─────┘    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
     │                 │                    │                   │
     │ 1. Navigate to  │                    │                   │
     │    /dashboard   │                    │                   │
     ├────────────────>│                    │                   │
     │                 │                    │                   │
     │                 │ 2. Get userInfo    │                   │
     │                 ├───────────────────────────────────────>│
     │                 │                    │                   │
     │                 │ 3. Return userInfo │                   │
     │                 │<───────────────────────────────────────┤
     │                 │    (userId, email, userType)           │
     │                 │                    │                   │
     │                 │ 4. GET /api/v1/auth/me                │
     │                 │    (with JWT token)                   │
     │                 ├───────────────────>│                   │
     │                 │                    │                   │
     │                 │ 5. Return profile  │                   │
     │                 │<───────────────────┤                   │
     │                 │                    │                   │
     │                 │ 6. GET /api/v1/accounts/search        │
     │                 │    ?customerId=xxx │                   │
     │                 ├───────────────────>│                   │
     │                 │                    │                   │
     │                 │ 7. Return FD list  │                   │
     │                 │<───────────────────┤                   │
     │                 │                    │                   │
     │ 8. Display      │                    │                   │
     │    dashboard    │                    │                   │
     │<────────────────┤                    │                   │
     │                 │                    │                   │
```

## Key Design Decisions

### 1. Token Storage
- **Location**: localStorage
- **Why**: Simple, works across tabs
- **Future**: Consider httpOnly cookies for production

### 2. Auto-Refresh
- **Interval**: 5 minutes
- **Why**: Balance between security and UX
- **Silent**: No user interaction needed

### 3. Role-Based Routing
- **Source**: JWT token (userType field)
- **Why**: Single source of truth
- **Fallback**: Redirect to /auth if invalid

### 4. Error Handling
- **401**: Auto-refresh token → Retry → Logout
- **403**: Show error, don't logout
- **500**: Show error, retry option

### 5. FD Calculator
- **Pre-login**: Calculate only
- **Post-login**: Calculate + Create account
- **Prompt**: Dialog to encourage login

## API Request Headers

```
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
Content-Type: application/json
Accept: application/json
```

## LocalStorage Structure

```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiJ9...",
  "userInfo": {
    "userId": "cc11f7d0-dfaa-42dd-b5a6-098ef87e9b60",
    "email": "admin@nexabank.com",
    "userType": "ADMIN",
    "roles": "ADMIN_FULL_ACCESS,ADMIN_VIEW"
  }
}
```
