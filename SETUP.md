# 🚀 NovaCMS - Quick Start Guide

## Overview
NovaCMS is a production-ready headless CMS built with:
- **Backend:** NestJS + Prisma ORM + PostgreSQL
- **Frontend:** React + TailwindCSS + Vite
- **Database:** PostgreSQL (self-hosted)
- **Authentication:** JWT-based custom auth
- **Deployment:** Docker + Docker Compose

---

## ⚡ Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL 14+ ([Download](https://www.postgresql.org/download/) or use Docker)
- Docker & Docker Compose ([Download](https://docs.docker.com/get-docker/))

### Option 1: Using Docker Compose (Recommended for Development)

```powershell
# 1. Navigate to project root
cd c:\NOVACMS\sql-weaver

# 2. Start Docker services (PostgreSQL + Backend)
docker-compose up -d

# 3. Install frontend dependencies
npm install

# 4. Start frontend dev server
npm run dev
```

Then open **http://localhost:3000** in your browser.

> Default Admin Credentials:
> - Email: `admin@novacms.local`
> - Password: `NovaCMS@Admin123!` (change on first login!)

---

### Option 2: Local Development (Manual Setup)

#### Step 1: Set Up PostgreSQL
**Windows (Using PostgreSQL Installer):**
```powershell
# After installing PostgreSQL, create a database
$env:PGPASSWORD = "strongpassword"
psql -U postgres -c "CREATE DATABASE novacms;"
psql -U postgres -d novacms -c "CREATE USER novacms_user WITH PASSWORD 'strongpassword';"
psql -U postgres -d novacms -c "ALTER ROLE novacms_user CREATEDB;"
```

**Windows (Using Docker):**
```powershell
docker run -d `
  --name novacms-postgres `
  -e POSTGRES_USER=novacms_user `
  -e POSTGRES_PASSWORD=strongpassword `
  -e POSTGRES_DB=novacms `
  -p 5432:5432 `
  postgres:16-alpine
```

#### Step 2: Set Up Backend
```powershell
# Navigate to server directory
cd server

# Copy .env template
Copy-Item .env.example .env

# Generate JWT Secret (run this in PowerShell)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env with the generated secret
# DATABASE_URL=postgresql://novacms_user:strongpassword@localhost:5432/novacms?schema=public
# JWT_SECRET=<paste-generated-value>

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate:dev

# Seed database (creates admin user)
npm run db:seed

# Start backend
npm run start:dev
```

#### Step 3: Set Up Frontend
```powershell
# In project root
npm install

# Copy .env template
Copy-Item .env.example .env

# Start frontend
npm run dev
```

---

## 📚 File Structure

```
sql-weaver/
├── server/                      # NestJS Backend
│   ├── src/
│   │   ├── auth/               # Authentication & JWT
│   │   ├── bootstrap/          # Auto-init system
│   │   ├── collections/        # Collection management
│   │   ├── crud/               # Dynamic CRUD operations
│   │   ├── permissions/        # Role-based access
│   │   ├── users/              # User management
│   │   ├── prisma/             # Database service
│   │   └── main.ts             # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── migrations/         # SQL migrations
│   ├── .env.example            # Environment template
│   └── package.json
├── src/                        # React Frontend
│   ├── pages/                  # Page components
│   ├── hooks/                  # Custom hooks
│   ├── components/             # Reusable components
│   └── App.tsx                 # Main app
├── docker-compose.yml          # Local dev setup
├── Dockerfile                  # Production image
├── .env.example                # Frontend env template
└── package.json
```

---

## 🔐 Environment Configuration

### Backend (.env in `server/`)
```env
DATABASE_URL=postgresql://novacms_user:strongpassword@localhost:5432/novacms?schema=public
PORT=4000
JWT_SECRET=<your-random-32-char-secret>
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

### Frontend (.env in root)
```env
VITE_API_URL=http://localhost:4000
```

---

## ✅ Verification Steps

### 1. Check Database Connection
```powershell
# Connect to PostgreSQL
$env:PGPASSWORD = "strongpassword"
psql -U novacms_user -d novacms

# List tables
\dt

# Check if tables exist
SELECT * FROM "collections";
SELECT * FROM "users";
SELECT * FROM "permissions";

# Exit psql
\q
```

### 2. Test Backend API
```powershell
# Login and get tokens
$loginResponse = Invoke-WebRequest `
  -Uri "http://localhost:4000/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body (@{email="admin@novacms.local"; password="NovaCMS@Admin123!"} | ConvertTo-Json)

# Save access token
$token = ($loginResponse.Content | ConvertFrom-Json).accessToken

# Get collections
Invoke-WebRequest `
  -Uri "http://localhost:4000/collections" `
  -Headers @{"Authorization"="Bearer $token"}
```

### 3. Check Frontend
- Open http://localhost:3000
- Login with admin credentials
- Navigate to Collections → should see "Blog Posts"
- Create a new collection or add fields

### 4. View Database Schema (psql)
```sql
-- Check metadata tables
\d+ collections
\d+ fields
\d+ users
\d+ permissions
\d+ user_roles

-- View default data
SELECT * FROM collections;
SELECT * FROM permissions LIMIT 10;
SELECT email, display_name FROM profiles;
```

---

## 🔄 Common Commands

### Backend (in `server/` directory)
```powershell
npm run db:generate        # Generate Prisma client
npm run db:migrate         # Run migrations in production
npm run db:migrate:dev     # Interactive migration (dev)
npm run db:seed            # Seed database with defaults
npm run db:studio          # Open Prisma Studio UI (visual DB editor)
npm run db:reset           # WARNING: Wipes database and re-migrates
npm run start:dev          # Start backend with hot-reload
npm run build              # Compile TypeScript
npm run lint               # Check code style
npm run test               # Run unit tests
```

### Frontend (in root directory)
```powershell
npm run dev                # Start dev server (http://localhost:3000)
npm run build              # Build for production
npm run preview            # Preview production build
npm run lint               # Check code style
```

### Docker
```powershell
docker-compose up -d       # Start all services in background
docker-compose down        # Stop all services
docker-compose logs -f     # View logs
docker-compose exec backend npm run db:studio  # Open Prisma Studio
```

---

## 🚀 Deployment

### Docker (Production)
```powershell
# Build image
docker build -t novacms:latest .

# Run with external database
docker run -d `
  -e DATABASE_URL="postgresql://user:pass@db-host:5432/novacms?schema=public" `
  -e PORT=4000 `
  -e JWT_SECRET="your-secure-secret" `
  -p 4000:4000 `
  novacms:latest
```

### Environment Variables for Production
```env
NODE_ENV=production
JWT_SECRET=<generate-new-secure-secret>
DATABASE_URL=<production-postgres-url>
FRONTEND_URL=<your-domain-frontend>
```

---

## 🐛 Troubleshooting

### "Connection refused" to PostgreSQL
- Check if PostgreSQL is running: `pg_isready -U novacms_user`
- Verify credentials match in `.env`
- Check port 5432 is open

### "ENOENT: no such file or directory, open '.env'"
- Run: `Copy-Item server\.env.example server\.env`
- Fill in actual values

### "JWT_SECRET not set"
- Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Add to `.env`

### "Admin user not created"
- Manually create: `npm run db:seed` (from `server/` directory)
- Or login to Prisma Studio: `npm run db:studio`

### Port 4000 already in use
- Find process: `Get-NetTcpConnection -LocalPort 4000`
- Kill process: `Stop-Process -Id <PID> -Force`
- Or change PORT in `.env` to 5000

---

## 📖 API Documentation

### Authentication

**Login**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@novacms.local",
  "password": "NovaCMS@Admin123!"
}

Response:
{
  "accessToken": "eyJh...",
  "refreshToken": "eyJh...",
  "user": {
    "id": "uuid",
    "email": "admin@novacms.local",
    "roles": ["ADMIN"]
  }
}
```

**Refresh Token**
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJh..."
}

Response:
{
  "accessToken": "eyJh..."
}
```

### Collections

**List Collections**
```http
GET /collections
Authorization: Bearer <accessToken>
```

**Create Collection**
```http
POST /collections
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "posts",
  "displayName": "Blog Posts",
  "tableName": "posts"
}
```

### Dynamic CRUD (by Collection)

**List Records**
```http
GET /api/{collection}?page=1&limit=25
Authorization: Bearer <accessToken>
```

**Get Single Record**
```http
GET /api/{collection}/{id}
Authorization: Bearer <accessToken>
```

**Create Record**
```http
POST /api/{collection}
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "My Post",
  "content": "Content here..."
}
```

**Update Record**
```http
PATCH /api/{collection}/{id}
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "Updated Title"
}
```

**Delete Record**
```http
DELETE /api/{collection}/{id}
Authorization: Bearer <accessToken>
```

---

## 🔐 Security Checklist

- [ ] Change `JWT_SECRET` to a random 32+ character string
- [ ] Change default admin password after first login
- [ ] Enable HTTPS in production
- [ ] Use strong PostgreSQL password
- [ ] Keep Node.js and dependencies updated
- [ ] Set `NODE_ENV=production` in production
- [ ] Use environment variables, never hardcode secrets
- [ ] Enable CORS only for trusted domains
- [ ] Set rate limiting on auth endpoints

---

## 📞 Support & Documentation

- **GitHub:** https://github.com/Sree0405/sql-weaver
- **Issues:** https://github.com/Sree0405/sql-weaver/issues
- **NestJS Docs:** https://docs.nestjs.com
- **Prisma Docs:** https://www.prisma.io/docs

---

## 📄 License

MIT - See LICENSE file for details

---

**Happy building with NovaCMS! 🎉**
