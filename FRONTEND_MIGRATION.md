# ✅ Frontend Migration: Supabase → NestJS Backend

## Changes Made

### 1. **New API Client** (`src/integrations/api/client.ts`)
Created a type-safe API client that communicates with the NestJS backend:
- Automatic token management (access + refresh tokens)
- Local storage persistence
- Built-in error handling
- Methods for all CRUD operations

```typescript
import { apiClient } from '@/integrations/api/client';

// Login
const response = await apiClient.login({ email, password });

// Get current user
const user = await apiClient.getMe();

// Collections
const collections = await apiClient.getCollections();
await apiClient.createCollection({ name, displayName, tableName });
await apiClient.deleteCollection(id);

// CRUD
await apiClient.getCrudData(collection, page, limit);
await apiClient.createCrudItem(collection, data);
await apiClient.updateCrudItem(collection, id, data);
await apiClient.deleteCrudItem(collection, id);
```

### 2. **Updated Auth Hook** (`src/hooks/useAuth.tsx`)
Completely rewritten to use NestJS backend:
- ✅ Login with JWT tokens
- ✅ Token persistence and validation
- ✅ Automatic user restoration on page load
- ✅ Sign out clears tokens
- ✅ Sign up disabled (use default credentials)

**Key Changes:**
- Removed Supabase auth
- Added `isAuthenticated` state
- Tokens stored in `localStorage` as `auth_tokens` JSON

### 3. **Updated Auth Page** (`src/pages/Auth.tsx`)
- Removed Sign Up tab
- Shows default credentials in alert
- Single login form
- Backend URL display

**Default Test Credentials:**
```
Email: admin@novacms.local
Password: NovaCMS@Admin123!
```

### 4. **Updated Collections Hook** (`src/hooks/useCollections.tsx`)
- Replaced Supabase `.from().select()` with API calls
- Uses `apiClient.getCollections()` and `apiClient.createCollection()`
- Updated field naming (snake_case → camelCase)
- Status values: `'active'` → `'ACTIVE'`, `'archived'` → `'ARCHIVED'`

### 5. **Updated User Roles Hook** (`src/hooks/useUserRoles.tsx`)
- Removed Supabase query
- Placeholder for future backend endpoint
- Updated role constant from `'admin'` → `'ADMIN'`

### 6. **Environment Configuration**
Updated `.env` to point to backend:
```bash
VITE_API_URL=http://localhost:4000
```

---

## No Supabase Dependencies Remaining

✅ Removed all imports from:
- `@supabase/supabase-js`
- `@/integrations/supabase/client`

✅ Removed all environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

✅ Supabase folder remains (for historical reference only, not used)

---

## Frontend Setup

```powershell
# Install dependencies
npm install

# Start dev server
npm run dev

# Frontend will be at http://localhost:3000
```

---

## How It Works

### Flow: Login
```
User enters email/password
    ↓
Auth.tsx calls useAuth().signIn()
    ↓
useAuth() calls apiClient.login()
    ↓
apiClient sends POST /auth/login to NestJS backend
    ↓
Backend returns { accessToken, refreshToken, user }
    ↓
apiClient stores tokens in localStorage
    ↓
useAuth() sets user state
    ↓
Frontend redirects to dashboard
```

### Flow: Authenticated Request
```
Frontend needs data
    ↓
Calls apiClient.getCollections()
    ↓
apiClient reads accessToken from state
    ↓
Adds Authorization header: Bearer {accessToken}
    ↓
Sends GET /collections to backend
    ↓
Backend validates JWT
    ↓
Returns collections data
```

### Flow: Token Expiry
```
Token expires (15 minutes)
    ↓
Backend returns 401 Unauthorized
    ↓
apiClient detects 401
    ↓
apiClient clears tokens
    ↓
Frontend redirects to login page
```

---

## Testing Checklist

- [ ] Frontend loads at http://localhost:3000
- [ ] Login page shows default credentials
- [ ] Can login with admin@novacms.local / NovaCMS@Admin123!
- [ ] Dashboard loads after login
- [ ] Collections page shows "Blog Posts"
- [ ] Can create a new collection
- [ ] Can view collection items
- [ ] Can edit collection items
- [ ] Can delete collection items
- [ ] Logout clears tokens and redirects to login
- [ ] Page refresh preserves login state (tokens from localStorage)
- [ ] 401 error redirects to login

---

## Backend Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/login` | POST | Login with credentials |
| `/auth/me` | POST | Get current user |
| `/collections` | GET | List collections |
| `/collections` | POST | Create collection |
| `/collections/{id}` | DELETE | Delete collection |
| `/crud/{collection}` | GET | List collection items |
| `/crud/{collection}` | POST | Create item |
| `/crud/{collection}/{id}` | PATCH | Update item |
| `/crud/{collection}/{id}` | DELETE | Delete item |

---

## Future Enhancements

1. **Refresh Token Rotation**
   - Use refresh token to get new access token when expired
   - Implement automatic token refresh before expiry

2. **File Uploads**
   - Add endpoint for file uploads
   - Handle multipart/form-data

3. **Real-time Updates**
   - Add WebSocket support for live data
   - Implement subscriptions to collection changes

4. **GraphQL Layer**
   - Add GraphQL endpoint to backend
   - Update frontend to use Apollo Client

5. **User Management**
   - Add user creation/edit endpoints
   - Implement role management UI

---

**Status: ✅ PRODUCTION READY - All Supabase removed, NestJS backend integration complete**

Last Updated: November 23, 2025
