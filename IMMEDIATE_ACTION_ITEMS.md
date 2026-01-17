# ✅ NovaCMS - IMMEDIATE ACTION ITEMS

## ⚡ CURRENT BLOCKER

**Backend Error:** `Nest can't resolve dependencies of the AuthService`

**Fix Applied:** ✅ auth.module.ts now includes JwtModule.register()

**Next Step:** Rebuild and restart backend

---

## 🎯 STEP-BY-STEP TO GET RUNNING

### Terminal 1: Backend

```bash
cd c:\NOVACMS\sql-weaver\server

# Verify fix was applied
cat src/auth/auth.module.ts | grep "JwtModule.register"
# Should show: JwtModule.register({

# Rebuild
npm run build

# Start
npm run start:dev

# Wait for: ✅ NovaCMS Backend running on http://localhost:4000
```

**Troubleshoot if error:**
- Check .env file has DATABASE_URL
- Check .env has JWT_SECRET  
- Check PostgreSQL is running: `docker ps | grep postgres`
- If seed issue: `npm run db:seed`

---

### Terminal 2: Frontend

```bash
cd c:\NOVACMS\sql-weaver

# Install if needed
npm install

# Start dev server
npm run dev

# Wait for: ➜ Local: http://localhost:3000 (or 8080)
```

---

### Terminal 3: Test

```bash
# In browser or curl: Login
# URL: http://localhost:3000
# Email: admin@novacms.local
# Password: NovaCMS@Admin123!

# Expected: Dashboard loads, no errors in console
```

---

## 📋 VERIFICATION CHECKLIST

- [ ] Backend builds without errors: `npm run build` ✅ Output: `Successfully compiled`
- [ ] Backend starts: `npm run start:dev` ✅ Output: `✅ NovaCMS Backend running on http://localhost:4000`
- [ ] Database connected: Check logs for `✅ Database connection successful`
- [ ] Migrations applied: Check logs for `✅ Bootstrap completed successfully`
- [ ] Admin user seeded: Check logs for `✅ Created admin user: admin@novacms.local`
- [ ] Frontend starts: `npm run dev` ✅ Output shows local dev server URL
- [ ] Login works: Navigate to http://localhost:3000, login succeeds and dashboard loads
- [ ] No console errors: Open DevTools, check for CORS, connection, or auth errors

---

## 🔧 IF THINGS BREAK

### Backend won't start

```bash
# 1. Check dependencies
npm list @nestjs/jwt @nestjs/passport

# 2. Reinstall
npm install

# 3. Rebuild
npm run build

# 4. Check database
psql -U novacms_user -d novacms -c "SELECT 1"
```

### Login returns 401 or 500

```bash
# 1. Check admin user exists
psql -U novacms_user -d novacms -c "SELECT email FROM users WHERE email = 'admin@novacms.local';"

# 2. If not found, reseed
npm run db:seed

# 3. Check JWT_SECRET in .env
cat .env | grep JWT_SECRET
```

### Frontend can't reach backend (CORS error)

```bash
# 1. Verify backend is running
curl -i http://localhost:4000/health

# 2. Check CORS in main.ts includes your frontend URL
# Should see 'http://localhost:3000' or 'http://localhost:8080'

# 3. If using 8080, make sure it's in the allowed origins
```

### Port already in use

```bash
# Kill process on port 4000
taskkill /PID <process_id> /F

# Or use different port
PORT=4001 npm run start:dev
```

---

## 📊 ARCHITECTURE OVERVIEW

```
┌──────────────────┐
│   Frontend       │
│   React/Vite     │
│ :3000 or :8080   │
└────────┬─────────┘
         │ HTTP/REST
         │ JWT Bearer tokens
         ▼
┌──────────────────┐
│   Backend        │
│   NestJS         │
│   :4000          │
└────────┬─────────┘
         │ SQL
         ▼
┌──────────────────┐
│  PostgreSQL      │
│  :5432           │
│  novacms         │
└──────────────────┘
```

**API Endpoints (Implemented):**
- POST /auth/login
- POST /auth/refresh
- GET /auth/me (protected)
- GET /collections (protected)

**API Endpoints (To Implement):**
- POST /system/collections (create)
- GET/POST /crud/{collection}
- PATCH/DELETE /crud/{collection}/{id}
- GET /system/endpoints (for API Explorer)

---

## 🚀 NEXT PHASES (After login works)

**Phase 1: Dynamic CRUD** (30 min)
- Implement POST /system/collections endpoint
- Auto-create database table
- Auto-generate REST endpoints

**Phase 2: API Explorer** (20 min)
- Create admin UI component
- List all endpoints
- Click to test/open endpoint

**Phase 3: Collection Builder UI** (20 min)
- Create collection form
- Add fields dynamically
- See endpoints appear in real-time

**Phase 4: Production Hardening** (30 min)
- Add rate limiting
- Input validation
- Error logging
- Security headers

---

## 📚 DOCUMENTATION

Refer to these files for details:
- `FULL_INTEGRATION_GUIDE.md` - Complete overview
- `AUTH_FIXES_COMPLETE.md` - Authentication details
- `TROUBLESHOOTING.md` - Common issues
- `QUICK_REFERENCE.md` - Commands cheat sheet

---

## 💾 Environment Files

### server/.env

```bash
DATABASE_URL="postgresql://novacms_user:Sree2005@localhost:5432/novacms?schema=public"
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

JWT_SECRET=<generate-a-random-hex-string-or-use-dev-default>
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

BCRYPT_SALT_ROUNDS=12
STORAGE_DRIVER=local
STORAGE_LOCAL_PATH=./uploads
LOG_LEVEL=debug
```

### frontend/.env

```bash
VITE_API_URL=http://localhost:4000
```

---

## ✅ SUCCESS CRITERIA

Login successful when:
1. ✅ Backend running without errors
2. ✅ Frontend loads at http://localhost:3000
3. ✅ Can enter admin@novacms.local / NovaCMS@Admin123!
4. ✅ Click "Sign In" button
5. ✅ Dashboard loads (no errors in DevTools)
6. ✅ Collections page shows "Blog Posts" collection
7. ✅ Can view/create items
8. ✅ Logout works

---

## 📞 SUPPORT

**Quick diagnostics:**
```bash
# Backend health
curl http://localhost:4000/health

# Frontend connectivity
curl -i http://localhost:3000

# Database connectivity
psql -U novacms_user -d novacms -c "SELECT version();"

# Check logs
tail -f server/dist/main.js    # Backend logs
npm run dev -- --log-level debug  # Frontend with debug
```

---

**Status:** ✅ Ready to run  
**Estimated Setup Time:** 5 minutes  
**Last Updated:** November 23, 2025

