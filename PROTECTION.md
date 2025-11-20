# Route and API Protection Implementation

This document explains how route and API protection has been implemented in the frontend application.

## Frontend Route Protection

### ProtectedRoute Component

A Higher-Order Component (HOC) called `ProtectedRoute` has been created to protect frontend routes based on authentication status and user roles.

**Location:** `components/ProtectedRoute.tsx`

**Features:**
- Protects routes from unauthorized access
- Supports role-based access control
- Redirects unauthenticated users to the login page
- Shows "Access Denied" message for users with insufficient privileges

**Usage:**
```tsx
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

### Protected Pages

The following pages have been protected with role-based access control:

1. **Tasks Page** (`app/tasks/page.tsx`) - Accessible to all authenticated users
2. **Admin Dashboard** (`app/admin/dashboard/page.tsx`) - Accessible only to admins
3. **Agent Dashboard** (`app/agent/dashboard/page.tsx`) - Accessible only to agents
4. **User Dashboard** (`app/user/dashboard/page.tsx`) - Accessible only to users
5. **Login Page** (`app/page.tsx`) - Accessible to everyone, but redirects authenticated users
6. **Registration Page** (`app/register/page.tsx`) - Accessible to everyone, but redirects authenticated users

## API Protection

### HTTP Service

The HTTP service has been enhanced to automatically handle authentication and authorization for API calls.

**Location:** `services/http.ts`

**Features:**
- Automatically adds JWT token to Authorization header for all requests
- Handles 401 (Unauthorized) responses by redirecting to login page
- Removes expired tokens from localStorage

### Protected API Calls

All API calls through the service layers automatically include authentication:

1. **Auth API** (`services/auth.api.ts`) - Handles registration and login
2. **Task API** (`services/task.api.ts`) - Handles task management operations

## Implementation Details

### Authentication Flow

1. User logs in through the login page
2. JWT token is received and stored in localStorage
3. Token is automatically attached to all subsequent API requests
4. If a 401 response is received, user is redirected to login page

### Role-Based Access Control

The `ProtectedRoute` component checks the user's role against the required roles for a page:
- If no role is specified, any authenticated user can access the page
- If a role is specified, only users with that role can access the page
- Users attempting to access pages outside their role are redirected to their dashboard

### Token Management

- Tokens are stored in localStorage
- Tokens are automatically removed when a 401 response is received
- Tokens are attached to all API requests through the HTTP interceptor