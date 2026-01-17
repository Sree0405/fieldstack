# 🚀 Quick Reference: NovaCMS Build & Run Commands

## 30-Second Setup

```powershell
# Terminal 1: Backend
cd c:\NOVACMS\sql-weaver\server
npm install
npm run db:generate
npm run db:migrate:dev
npm run db:seed
npm run start:dev

# Terminal 2: Frontend (from root)
cd c:\NOVACMS\sql-weaver
npm install
npm run dev
```

## Docker Setup (Even Faster!)

```powershell
cd c:\NOVACMS\sql-weaver
docker-compose up -d
npm install
npm run dev
```

## Default Credentials

```
Email: admin@novacms.local
Password: NovaCMS@Admin123!
```

## Verify Everything Works

```powershell
# 1. Check backend is running
curl http://localhost:4000/health

# 2. Check frontend loads
# Open http://localhost:3000 in browser

# 3. Test login
# Use credentials above
```

## Key URLs

```
Frontend:    http://localhost:3000
Backend API: http://localhost:4000
DB Studio:   http://localhost:5555 (after npm run db:studio)
```

## If Something Breaks

```powershell
# Clear everything and restart
docker-compose down
rimraf server/dist
rimraf node_modules
npm install
cd server
npm install
npm run db:generate
npm run start:dev

# In another terminal
npm run dev
```

## Essential Commands

```powershell
# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate:dev   # Run/create migrations
npm run db:seed          # Seed default data
npm run db:studio        # Open DB visual editor
npm run db:reset         # ⚠️ WIPE & RESEED DATABASE

# Development
npm run start:dev        # Backend with hot-reload (from server/)
npm run dev              # Frontend with hot-reload (from root)
npm run lint             # Check code style
npm run build            # Build for production

# Build
npm run build            # Compile TypeScript
npm start                # Run compiled backend
```

## Documentation Files

1. **SETUP.md** — Complete setup guide (read first!)
2. **ARCHITECTURE.md** — System diagrams & flows
3. **TYPESCRIPT_FIXES_APPLIED.md** — What was fixed
4. **POST_IMPLEMENTATION_CHECKLIST.md** — Verification steps

---

**Everything is ready!** Follow SETUP.md for complete instructions. 🎉
