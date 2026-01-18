# 📋 fieldstack Quick Reference Card

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
Email:    admin@fieldstack.local
Password: fieldstack@Admin123!
```

Alternative users (after seed):
```
editor@fieldstack.local     / Editor@Password123!
viewer@fieldstack.local     / Viewer@Password123!
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
Database: fieldstack
User:     fieldstack_user
Password: Sree2005
URL:      postgresql://fieldstack_user:Sree2005@localhost:5432/fieldstack
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
UPDATE users SET password = '$2b$12$...' WHERE email = 'admin@fieldstack.local';
```

---

## 🔑 API Cheatsheet

### Login
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fieldstack.local","password":"fieldstack@Admin123!"}'
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
   Login with: admin@fieldstack.local / fieldstack@Admin123!

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
psql -U fieldstack_user -d fieldstack -c "SELECT 1"
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
docker build -t fieldstack:latest .
docker run -p 4000:4000 fieldstack:latest
```

---

## � File Management & Site Configuration

### File Upload
```typescript
import { apiClient, getAssetsUrl } from '@/integrations/api/client';

// Upload single file
const response = await apiClient.uploadFile(file);
const fileId = response.data.id;

// Display file
<img src={getAssetsUrl(fileId)} alt="Image" />

// Upload multiple files
const multiResponse = await apiClient.uploadMultipleFiles([file1, file2]);

// Get file list
const filesResponse = await apiClient.getAllFiles(50, 0);
const files = filesResponse.data.data;

// Delete file
await apiClient.deleteFile(fileId);
```

### Site Configuration
```typescript
// Get site info
const siteResponse = await apiClient.getSiteInfo();
const site = siteResponse.data;

// Update site details
await apiClient.updateSiteInfo({
  siteName: 'My Site',
  siteTitle: 'Welcome',
  contactEmail: 'info@example.com'
});

// Upload logo
const logoResponse = await apiClient.uploadFile(logoFile);
await apiClient.updateSiteLogo(logoResponse.data.id);

// Upload favicon
const faviconResponse = await apiClient.uploadFile(faviconFile);
await apiClient.updateSiteFavicon(faviconResponse.data.id);
```

### Content Editing (NEW)
```typescript
// Edit existing record
const updateResponse = await apiClient.updateCrudItem(
  'collection_name',
  recordId,
  {
    field1: 'new value',
    field2: 'another value'
  }
);

// The edit UI automatically appears in Content page
// Just click the edit button on any record
```

### File API Endpoints
```
POST   /api/files                 - Upload single file
POST   /api/files/multiple        - Upload multiple files
GET    /api/files?limit=50&offset=0  - List files
GET    /api/files/:id             - Get file metadata
DELETE /api/files/:id             - Delete file
GET    /assets/:id                - Serve file content

GET    /api/site-info             - Get site config
PATCH  /api/site-info             - Update site config
PATCH  /api/site-info/:id         - Update by ID
```

### Example: Create Post with Image
```typescript
async function createPostWithImage(title: string, imageFile: File) {
  // Upload image
  const uploadRes = await apiClient.uploadFile(imageFile);
  const imageId = uploadRes.data.id;

  // Create post with image
  return await apiClient.createCrudItem('posts', {
    title,
    featured_image: imageId  // Store the file ID
  });
}
```

### Key Helpers
```typescript
// Get asset URL for any file ID
import { getAssetsUrl } from '@/integrations/api/client';
const url = getAssetsUrl(fileId);

// Use in images/videos
<img src={url} alt="Image" />
<video src={url} controls />
```

### New Pages
- `/file-manager` - Upload and manage files
- `/site-settings` - Configure site info and branding
- Content page now supports edit/update

---

## 🔧 File Management Setup

1. Install dependencies:
   ```bash
   cd server
   npm install @nestjs/platform-express uuid
   ```

2. Run migration:
   ```bash
   npx prisma migrate deploy
   ```

3. Restart backend:
   ```bash
   npm run start:dev
   ```

4. Add routes and navigation to frontend

---

## 📖 File Management Documentation

- **FILE_MANAGEMENT_GUIDE.md** - Complete API reference
- **IMPLEMENTATION_CHECKLIST.md** - Setup and testing
- **FILE_MANAGEMENT_UPDATE.md** - Overview of changes

---

## 📞 Support

- 📖 Full docs: See SETUP.md
- 🐛 Issues: Check TROUBLESHOOTING.md
- 💬 API: See AUTH_FIXES_COMPLETE.md
- 📋 Design: See ARCHITECTURE.md
- 📁 Files: See FILE_MANAGEMENT_GUIDE.md
- ✅ Implementation: See IMPLEMENTATION_CHECKLIST.md

---

**Last Updated:** January 18, 2026  
**Status:** ✅ Production Ready  
**Version:** 2.0.0 (File Management & Site Config Update)
