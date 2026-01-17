# NovaCMS Architecture & Data Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          User's Browser                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │               React Admin Dashboard (Port 3000)               │   │
│  ├────────────────────────────────────────────────────────────────┤   │
│  │  • Collections Manager                                         │   │
│  │  • Content Editor                                              │   │
│  │  • User Management                                             │   │
│  │  • Role & Permissions                                          │   │
│  │  • Media Manager                                               │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                              ↕                                         │
│                         HTTP / JWT                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                   NovaCMS Backend (Port 4000)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                         NestJS Application                              │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │              Request → NestJS Router                         │      │
│  └────────────┬────────────────────────────────────────────────┘      │
│               ↓                                                         │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │  • Auth Middleware (JWT Validation)                          │      │
│  │  • Validation Pipe (DTOs)                                    │      │
│  │  • Error Handling                                            │      │
│  └────────────┬────────────────────────────────────────────────┘      │
│               ↓                                                         │
│  ┌──────────┬──────────────┬──────────────┬─────────────────┐          │
│  │          │              │              │                 │          │
│  ▼          ▼              ▼              ▼                 ▼          │
│┌────────┐┌─────────────┐┌───────────┐┌──────────┐┌──────────────┐    │
││ Auth   ││Collections  ││ CRUD      ││Bootstrap ││ Permissions  │    │
││Module  ││ Module      ││ Module    ││Service   ││ Module       │    │
│└────────┘└─────────────┘└───────────┘└──────────┘└──────────────┘    │
│   │          │              │              │           │              │
│   └──────────┴──────────────┴──────────────┴───────────┘              │
│                              ↓                                         │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │         Prisma ORM (Type-Safe Database Layer)               │      │
│  ├─────────────────────────────────────────────────────────────┤      │
│  │  • Query Builder                                             │      │
│  │  • Schema Validation                                         │      │
│  │  • Connection Pooling                                        │      │
│  └─────────────────────────────────────────────────────────────┘      │
│                              ↓                                         │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │         Database Connection (PostgreSQL Driver)              │      │
│  └─────────────────────────────────────────────────────────────┘      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────────┐
│            PostgreSQL Database (Port 5432)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────┐         │
│  │              System Metadata Schema                       │         │
│  ├──────────────────────────────────────────────────────────┤         │
│  │                                                          │         │
│  │  • collections                   (Define data types)     │         │
│  │  • fields                         (Define columns)       │         │
│  │  • relations                      (Define relationships) │         │
│  │  • users                          (Authentication)       │         │
│  │  • profiles                       (User metadata)        │         │
│  │  • user_roles                     (Role assignment)      │         │
│  │  • permissions                    (Access control)       │         │
│  │                                                          │         │
│  └──────────────────────────────────────────────────────────┘         │
│                              ↓                                         │
│  ┌──────────────────────────────────────────────────────────┐         │
│  │           Dynamic Tables (Created by Users)               │         │
│  ├──────────────────────────────────────────────────────────┤         │
│  │                                                          │         │
│  │  • posts_collection         (Example collection)         │         │
│  │  • products_collection      (User-created)              │         │
│  │  • [user_created_table]*    (Generated per collection)  │         │
│  │                                                          │         │
│  └──────────────────────────────────────────────────────────┘         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Request/Response Flow Example

### Flow 1: Login Request

```
1. User enters credentials
   ↓
   {"email": "admin@novacms.local", "password": "NovaCMS@Admin123!"}
   ↓
   POST /auth/login
   ↓

2. NestJS Router receives request
   ↓
   AuthController.login(loginDto)
   ↓

3. Validation Pipe validates DTO
   ✓ Email format
   ✓ Password minimum length
   ↓

4. AuthService processes login
   ├─ Query: SELECT * FROM users WHERE email = ?
   ├─ Compare: bcrypt.compare(password, hashedPassword)
   ├─ Query: SELECT * FROM user_roles WHERE user_id = ?
   └─ Generate JWT tokens
   ↓

5. Return tokens to frontend
   ↓
   {
     accessToken: "eyJh...",
     refreshToken: "eyJh...",
     user: {
       id: "uuid",
       email: "admin@novacms.local",
       roles: ["ADMIN"]
     }
   }
   ↓

6. Frontend stores tokens in memory
   └─ Uses accessToken for subsequent requests
```

### Flow 2: Create Collection Request

```
1. Admin creates "Products" collection in UI
   ├─ Name: "products"
   ├─ Display: "Products"
   └─ Table: "products_collection"
   ↓
   POST /collections
   Authorization: Bearer <accessToken>
   ↓

2. NestJS Auth Guard validates JWT
   ✓ Token signature valid
   ✓ Token not expired
   ✓ User extracted from payload
   ↓

3. CollectionsController.create()
   ↓
   Validate CreateCollectionDto
   ✓ name is unique
   ✓ tableName is valid
   ↓

4. CollectionsService.create()
   ↓
   INSERT INTO collections (name, displayName, tableName, status)
   VALUES ('products', 'Products', 'products_collection', 'ACTIVE')
   RETURNING *
   ↓

5. Collection created in DB
   ↓

6. Response sent to frontend
   ↓
   {
     id: "uuid",
     name: "products",
     displayName: "Products",
     tableName: "products_collection",
     status: "ACTIVE",
     fields: []
   }
   ↓

7. Frontend shows new collection in list
```

### Flow 3: Fetch Collection Records

```
1. User views Products collection content
   ↓
   GET /api/products?page=1&limit=25
   Authorization: Bearer <accessToken>
   ↓

2. NestJS Auth Guard validates token
   ✓ Valid JWT
   ✓ Extract user ID and roles
   ↓

3. CrudController.list()
   ↓

4. CrudService.list()
   ├─ Find collection by name: SELECT * FROM collections WHERE name = ?
   ├─ Get fields: SELECT * FROM fields WHERE collection_id = ?
   ├─ Get permissions: Check if user role can READ
   └─ Query dynamic table: SELECT * FROM products_collection LIMIT 25 OFFSET 0
   ↓

5. Data fetched from DB
   ↓

6. Response with pagination metadata
   ↓
   {
     collection: "products",
     data: [
       { id: "uuid", name: "Product 1", price: 29.99, ... },
       { id: "uuid", name: "Product 2", price: 39.99, ... },
       ...
     ],
     meta: {
       page: 1,
       limit: 25,
       total: 245,
       totalPages: 10
     },
     fields: [
       { name: "name", type: "TEXT", required: true },
       { name: "price", type: "NUMBER", required: false },
       ...
     ]
   }
   ↓

7. Frontend renders table with data
```

---

## Bootstrap Initialization Flow

```
Application Start
   ↓
Node process starts main.ts
   ↓
NestFactory.create(AppModule)
   ├─ Register all modules
   ├─ Inject dependencies
   └─ Initialize services
   ↓
app.listen(4000)
   ├─ Enable CORS
   ├─ Add global validation pipe
   └─ Call BootstrapService.init()
   ↓
✓ Check Database Connection
   └─ SELECT NOW()
      └─ Verify PostgreSQL is reachable
   ↓
✓ Seed Default Roles
   └─ Log available roles (created as enums)
   ↓
✓ Create Sample Collections
   └─ INSERT INTO collections IF NOT EXISTS
      └─ Create "posts" collection with sample fields
   ↓
✓ Seed Admin User
   ├─ Check if admin@novacms.local exists
   └─ If not:
      ├─ Hash password with bcrypt
      ├─ INSERT INTO users
      ├─ INSERT INTO profiles
      └─ INSERT INTO user_roles (role = ADMIN)
   ↓
✓ Seed Default Permissions
   └─ For each role (ADMIN, EDITOR, VIEWER):
      └─ INSERT permissions for sample collection
   ↓
Log "✅ Bootstrap completed successfully!"
   ↓
Server Ready at http://localhost:4000
```

---

## Module Dependencies

```
AppModule (Root)
├── ConfigModule              (Environment variables)
├── JwtModule                 (Token generation/verification)
├── PassportModule            (Authentication strategies)
├── PrismaModule ◄────────────┐
│   └── PrismaService         │ (Database abstraction)
├── BootstrapModule ◄─────────┤──┐ (Auto-init)
│   └── BootstrapService      │  │
├── AuthModule ◄──────────────┤──┤
│   ├── AuthController        │  │ (Login/Refresh/JWT)
│   ├── AuthService           │  │
│   └── Dependencies: PrismaModule, JwtModule
├── CollectionsModule ◄───────┤──┤
│   ├── CollectionsController │  │ (CRUD for collections)
│   ├── CollectionsService    │  │
│   └── Dependencies: PrismaModule
├── CrudModule ◄──────────────┤──┤
│   ├── CrudController        │  │ (Dynamic CRUD for records)
│   ├── CrudService           │  │
│   └── Dependencies: PrismaModule
├── UsersModule ◄─────────────┤──┤
│   └── Dependencies: PrismaModule
└── PermissionsModule ◄───────┴──┘
    └── Dependencies: PrismaModule
```

---

## Database Schema Relationships

```
users (Authentication)
  ├─ 1 ──→ ∞ profiles (User metadata)
  ├─ 1 ──→ ∞ user_roles (Role assignments)
  └─ 1 ──→ ∞ [other] (created_by foreign keys)

collections (Metadata)
  ├─ 1 ──→ ∞ fields (Collection columns)
  ├─ 1 ──→ ∞ relations (Relationships to other collections)
  └─ 1 ──→ ∞ permissions (Access control rules)

user_roles (Role assignment)
  └─ ∞ ──→ 1 users

permissions (Access control)
  ├─ role (ENUM: ADMIN, EDITOR, VIEWER, CUSTOM)
  ├─ collectionId → collections
  └─ action (ENUM: READ, CREATE, UPDATE, DELETE)
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│         Docker Host Machine                 │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │     Docker Network: novacms-network │   │
│  │                                     │   │
│  │  ┌──────────────┐  ┌────────────┐  │   │
│  │  │ PostgreSQL   │  │ NestJS     │  │   │
│  │  │ Container    │◄─┤ Container  │  │   │
│  │  │              │  │            │  │   │
│  │  │ Port 5432    │  │ Port 4000  │  │   │
│  │  │ (internal)   │  │ (mapped)   │  │   │
│  │  └──────────────┘  └──────┬─────┘  │   │
│  │                           │        │   │
│  │  postgres_data volume     │        │   │
│  │  ├─ Database files        │        │   │
│  │  └─ Persistent storage    │        │   │
│  │                           │        │   │
│  │  uploads volume           │        │   │
│  │  ├─ User uploads          │        │   │
│  │  └─ Persistent storage    │        │   │
│  │                     ┌─────┘        │   │
│  │                     │              │   │
│  └─────────────────────┼──────────────┘   │
│                        │                 │
│                   Port 4000               │
│                (exposed to host)          │
│                                             │
└─────────────────────────────────────────────┘
         ↕
    Host Machine Network
         ↕
  Browser at http://localhost:3000
  (React frontend)
```

---

## Scaling Considerations

### Current Setup (Single Instance)
```
Client → NestJS (1 instance) → PostgreSQL (1 instance)
                    ↓
              Single Process
              Single Thread
              Limited to 1 CPU core
```

### Scaled Setup (Future)
```
                 ┌─ NestJS Instance 1
                 ├─ NestJS Instance 2
Client → Nginx ──┼─ NestJS Instance 3
                 └─ NestJS Instance N
                        ↓
                 Connection Pool
                        ↓
              PostgreSQL (Primary)
                        ↓
              PostgreSQL (Replica)
                        ↓
         Redis Cache Layer (Optional)
```

### For Production at Scale:
- Use Kubernetes for orchestration
- Add Redis for caching
- Use PostgreSQL read replicas
- Set up load balancer (Nginx, HAProxy)
- Implement API rate limiting
- Add monitoring (Prometheus, Grafana)
- Use CDN for static assets

---

## Security Layers

```
┌──────────────────────────────────────────────────┐
│            1. Network Layer                      │
│  • HTTPS/TLS (enables in reverse proxy)         │
│  • Firewall rules (block unauthorized IPs)      │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│            2. Application Layer                  │
│  • CORS validation (frontend domain check)      │
│  • JWT token validation                         │
│  • Rate limiting (prevent brute force)          │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│            3. Business Logic Layer               │
│  • Role-based access control (middleware)       │
│  • Permission checks (per-collection)           │
│  • Input validation (DTO/Pipes)                │
│  • Output sanitization                          │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│            4. Database Layer                     │
│  • Connection string security (env vars)        │
│  • Query parameterization (Prisma ORM)          │
│  • Row-level security (PostgreSQL RLS)          │
│  • Backups & encryption at rest                 │
└──────────────────────────────────────────────────┘
```

---

This architecture is designed to be:
- **Scalable** — Add more NestJS instances behind a load balancer
- **Secure** — Multiple layers of validation and authentication
- **Maintainable** — Clear module separation, dependency injection
- **Observable** — Logging at each layer for debugging
- **Production-Ready** — Enterprise-grade patterns and practices

---

**Generated:** November 23, 2025  
**Framework:** NestJS 10 + Prisma 5 + PostgreSQL
