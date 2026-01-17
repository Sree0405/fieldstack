# 📋 NovaCMS Quick Reference Card

## 🚀 Commands

### Backend
```powershell
cd server

# Setup
npm install                    # Install dependencies
npm run db:generate           # Generate Prisma client
npm run db:migrate:dev        # Create/update database schema
npm run db:seed               # Seed default users & collections
npm run db:studio             # Open database UI (localhost:5555)

# Development
npm run build                 # Compile TypeScript
npm run start:dev             # Start with hot-reload
npm run start:prod            # Run compiled version
npm run lint                  # Check code style

# Database
npm run db:reset              # ⚠️  Wipe & reseed database
npm run db:migrate deploy     # Deploy migrations to production
```

### Frontend
```powershell
# From root directory

npm install                   # Install dependencies
npm run dev                   # Start dev server (localhost:3000)
npm run build                 # Build for production
npm run preview              # Preview production build
npm run lint                 # Check code style
npm run type-check           # TypeScript validation
```

### Docker
```bash
docker-compose up -d         # Start PostgreSQL + PgAdmin
docker-compose down          # Stop services
docker-compose logs -f       # View logs
```

---

## 🔐 Default Credentials

```
Email:    admin@novacms.local
Password: NovaCMS@Admin123!
```

Alternative users (after seed):
```
editor@novacms.local     / Editor@Password123!
viewer@novacms.local     / Viewer@Password123!
```

---

## 🌐 URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | React application |
| Backend API | http://localhost:4000 | NestJS API |
| Database UI | http://localhost:5555 | Prisma Studio |
| PgAdmin | http://localhost:5050 | PostgreSQL admin |

---

## 📊 Database

### Connection Details
```
Host:     localhost
Port:     5432
Database: novacms
User:     novacms_user
Password: Sree2005
URL:      postgresql://novacms_user:Sree2005@localhost:5432/novacms
```

### Quick Queries
```sql
-- List all users
SELECT id, email, (SELECT displayName FROM profiles WHERE id = users.id) FROM users;

-- List all collections
SELECT id, name, displayName, tableName FROM collections;

-- List user permissions
SELECT role, action FROM permissions WHERE collectionId = '<collection-id>';

-- Reset admin password (hash must be bcrypt)
UPDATE users SET password = '$2b$12$...' WHERE email = 'admin@novacms.local';
```

---

## 🔑 API Cheatsheet

### Login
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@novacms.local","password":"NovaCMS@Admin123!"}'
```

### Authenticated Request
```bash
curl -X GET http://localhost:4000/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

### Create Collection
```bash
curl -X POST http://localhost:4000/collections \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"name":"posts","displayName":"Blog Posts","tableName":"posts"}'
```

### List Items
```bash
curl -X GET "http://localhost:4000/crud/posts?page=1&limit=10" \
  -H "Authorization: Bearer <accessToken>"
```

---

## 📁 Key Files

### Backend
- `server/src/main.ts` - Entry point
- `server/src/auth/` - Authentication system
- `server/prisma/schema.prisma` - Database schema
- `server/.env` - Environment variables
- `Dockerfile` - Container image
- `docker-compose.yml` - Local dev stack

### Frontend
- `src/pages/Auth.tsx` - Login page
- `src/hooks/useAuth.tsx` - Auth context
- `src/integrations/api/client.ts` - API client
- `.env` - Frontend config

### Documentation
- `SETUP.md` - Full setup guide
- `PROJECT_SUMMARY.md` - Overview
- `TROUBLESHOOTING.md` - Common issues
- `AUTH_FIXES_COMPLETE.md` - Auth details

---

## 🛠️ Troubleshooting

### "Cannot connect to database"
```bash
# Check PostgreSQL is running
docker-compose up -d
```

### "Invalid credentials" on login
```bash
# Reseed database
cd server
npm run db:reset && npm run db:seed
```

### "CORS error" in browser
```bash
# Check backend is running and CORS configured
curl -i http://localhost:4000/auth/login
```

### "Module not found" error
```bash
cd server
npm install
npm run db:generate
npm run build
```

### Port already in use
```bash
# Kill process using port 4000
lsof -i :4000
kill -9 <PID>

# Or use different port
PORT=4001 npm run start:dev
```

---

## 🔄 Typical Workflow

```
1. Terminal 1 - Backend
   cd server && npm run start:dev

2. Terminal 2 - Frontend
   npm run dev

3. Browser - http://localhost:3000
   Login with: admin@novacms.local / NovaCMS@Admin123!

4. Dashboard - Create/view collections and items

5. Database - View changes in Prisma Studio
   npm run db:studio (localhost:5555)

6. Code changes - Both have hot-reload enabled
   Edit → Save → Auto-refresh in browser
```

---

## 📦 Dependencies

### Backend
- `@nestjs/common` - Core framework
- `@nestjs/jwt` - JWT authentication
- `@nestjs/passport` - Passport integration
- `@prisma/client` - Database ORM
- `bcrypt` - Password hashing
- `passport-jwt` - JWT strategy
- `class-validator` - Input validation

### Frontend
- `react` - UI framework
- `react-router-dom` - Routing
- `@tanstack/react-query` - Data fetching
- `vite` - Build tool
- `shadcn/ui` - UI components
- `sonner` - Toast notifications

---

## 🔒 Security

- ✅ JWT tokens (15m access, 7d refresh)
- ✅ Bcrypt password hashing (salt: 12)
- ✅ CORS configured
- ✅ Input validation enabled
- ✅ SQL injection protected (Prisma)
- ✅ Secure headers ready

---

## 📈 Monitoring

### Logs
```bash
# Backend logs
npm run start:dev 2>&1 | tee backend.log

# Database logs
docker-compose logs -f postgres

# Frontend logs
npm run dev 2>&1 | tee frontend.log
```

### Health Check
```bash
# Backend health
curl http://localhost:4000/health

# Database health
psql -U novacms_user -d novacms -c "SELECT 1"
```

---

## 🚀 Production Deployment

```bash
# Build backend
cd server
npm run build

# Start production
npm start

# Or use Docker
docker build -t novacms:latest .
docker run -p 4000:4000 novacms:latest
```

---

## 📞 Support

- 📖 Full docs: See SETUP.md
- 🐛 Issues: Check TROUBLESHOOTING.md
- 💬 API: See AUTH_FIXES_COMPLETE.md
- 📋 Design: See ARCHITECTURE.md

---

**Last Updated:** November 23, 2025  
**Status:** ✅ Production Ready  
**Version:** 1.0.0
