# 📊 Visual Guide - File Management System Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐│
│  │  FileManager.tsx │  │ SiteSettings.tsx │  │  Content.tsx    ││
│  │  - Upload UI     │  │  - Site Config   │  │  - Create/Read  ││
│  │  - File List     │  │  - Logo Upload   │  │  - Edit Record  ││
│  │  - Delete UI     │  │  - Favicon Mgmt  │  │  - Delete       ││
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬────────┘│
│           │                      │                     │         │
│           └──────────────────────┼─────────────────────┘         │
│                                  │                               │
│                        ┌──────────▼────────────┐                │
│                        │   API Client          │                │
│                        │  (client.ts)          │                │
│                        │  - uploadFile()       │                │
│                        │  - getAssetUrl()      │                │
│                        │  - updateSiteInfo()   │                │
│                        │  - updateCrudItem()   │                │
│                        └──────────┬────────────┘                │
│                                   │ HTTP/JSON                   │
└───────────────────────────────────┼────────────────────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │                               │
          ┌─────────▼──────────┐      ┌────────────▼─────────┐
          │   BACKEND LAYER    │      │  ASSET SERVING       │
          └────────────────────┘      └──────────────────────┘
          │                           │
          │ FilesModule              │ /assets/:id
          │ ├─ Controller            │ │
          │ ├─ Service              │ └─ Serve static files
          │ └─ Routes               │
          │                         │
          │ SiteInfoModule          │ Upload Directory
          │ ├─ Controller          │ └─ {root}/uploads/files/
          │ ├─ Service            │
          │ └─ Routes             │
          │                       │
          │ CrudService (FIXED)  │
          │ └─ update() method   │
          │                       │
          └───────────┬───────────┘
                      │ SQL
        ┌─────────────▼───────────────┐
        │    POSTGRESQL DATABASE      │
        ├────────────────────────────┤
        │ files table                │
        │ ├─ id (PK)                │
        │ ├─ fileName               │
        │ ├─ originalName           │
        │ ├─ mimeType              │
        │ ├─ size                  │
        │ ├─ path                  │
        │ ├─ url                   │
        │ ├─ createdAt             │
        │ └─ updatedAt             │
        │                          │
        │ site_info table          │
        │ ├─ id (PK)               │
        │ ├─ siteName              │
        │ ├─ logoId (FK→files)     │
        │ ├─ faviconId (FK→files)  │
        │ ├─ contactEmail          │
        │ ├─ contactPhone          │
        │ ├─ socialLinks (JSON)    │
        │ ├─ metadata (JSON)       │
        │ ├─ createdAt             │
        │ └─ updatedAt             │
        │                          │
        │ fields table (updated)   │
        │ ├─ isFileField           │
        │ ├─ acceptedFileTypes     │
        │ ├─ maxFileSize           │
        │ └─ metadata (JSON)       │
        │                          │
        │ collections table        │
        │ records table (dynamic)  │
        │ └─ Can reference files   │
        │    using file IDs        │
        └──────────────────────────┘

        File Storage (Filesystem)
        └─ /uploads/files/{uuid}.ext
```

## Data Flow Diagrams

### File Upload Flow
```
User selects file
       ↓
Input validated (size, type)
       ↓
FormData created with file
       ↓
POST /api/files
       ↓
Backend FilesService
  ├─ Generate UUID
  ├─ Save to disk at /uploads/files/{uuid}.ext
  ├─ Create database record
  └─ Return file ID + metadata
       ↓
Frontend receives response
       ↓
Store file ID in component state
       ↓
Display success message
```

### Content with File Integration
```
Create/Update Content Record
       ↓
Include file ID in record data
{
  title: "My Post",
  featured_image: "uuid-here"
}
       ↓
POST/PATCH /:collection
       ↓
Save to database
       ↓
Fetch record later
       ↓
Get file ID from record
       ↓
Use getAssetsUrl(fileId)
       ↓
Render <img src={url} />
```

### Asset Display Flow
```
Component renders: <img src={getAssetsUrl(fileId)} />
       ↓
Browser requests: GET /assets/{fileId}
       ↓
Express/NestJS routes via ServeStaticModule
       ↓
Read file from /uploads/files/{fileId}.ext
       ↓
Return with proper MIME type
       ↓
Browser displays image
```

## API Call Sequence

### Upload File Sequence
```
1. FileManager.tsx
   │
   └─> apiClient.uploadFile(file)
       │
       ├─> Create FormData
       ├─> POST http://localhost:4000/api/files
       │
       └─> FilesController.uploadFile()
           │
           ├─> FilesService.uploadFile()
           │   ├─> Generate UUID
           │   ├─> Write to disk
           │   ├─> Create DB record
           │   └─> Return file metadata
           │
           └─> Response: { id, fileName, url, ... }

   └─> Store fileId in state
   └─> Render success message
```

### Update Site Info Sequence
```
1. SiteSettings.tsx
   │
   └─> apiClient.updateSiteInfo(data)
       │
       ├─> PATCH /api/site-info
       │
       └─> SiteInfoController.updateSiteDetails()
           │
           ├─> SiteInfoService.updateSiteDetails()
           │   ├─> Get current site info
           │   ├─> Update fields
           │   ├─> Save to database
           │   └─> Return updated record
           │
           └─> Response: { siteName, logoId, ... }

   └─> Update component state
   └─> Render updated values
```

### Edit Content Record Sequence
```
1. Content.tsx (Records Table)
   │
   ├─> User clicks Edit button
   ├─> handleOpenEditDialog(record)
   ├─> Set editingRecord state
   ├─> Show edit dialog
   │
2. User modifies fields in dialog
   │
3. User clicks Update
   │
   └─> handleUpdateRecord()
       │
       ├─> Prepare updateData (remove system fields)
       ├─> apiClient.updateCrudItem(collection, id, data)
       │
       └─> CrudController.update()
           │
           ├─> CrudService.update()
           │   ├─> Get collection schema
           │   ├─> Validate all fields
           │   ├─> Map field names to db columns (FIXED!)
           │   ├─> Build UPDATE query
           │   ├─> Execute query
           │   └─> Return updated record
           │
           └─> Response: { id, data, updatedAt, ... }

   └─> Close dialog
   └─> Refresh records list
   └─> Show success message
```

## Endpoint Hierarchy

```
API Base: http://localhost:4000

/api
├─ /files
│  ├─ POST   /         (Upload file)
│  ├─ POST   /multiple (Upload multiple)
│  ├─ GET    /         (List files)
│  ├─ GET    /:id      (Get file metadata)
│  └─ DELETE /:id      (Delete file)
│
├─ /site-info
│  ├─ GET    /         (Get site config)
│  ├─ PATCH  /         (Update site config)
│  ├─ GET    /:id      (Get by ID)
│  └─ PATCH  /:id      (Update by ID)
│
├─ /:collection
│  ├─ GET    /         (List records)
│  ├─ POST   /         (Create record)
│  ├─ GET    /:id      (Get record)
│  ├─ PATCH  /:id      (Update record) ← FIXED!
│  └─ DELETE /:id      (Delete record)
│
└─ /assets
   └─ /:fileId        (Serve file content)
```

## UI Component Structure

```
App
├─ Navigation
│  ├─ Link to /file-manager
│  ├─ Link to /site-settings
│  └─ Link to /content
│
├─ Routes
│  ├─ /file-manager → FileManager
│  │  ├─ Upload Dialog
│  │  │  └─ File Input
│  │  │
│  │  ├─ Files Table
│  │  │  ├─ File Rows
│  │  │  │  ├─ Name, Type, Size
│  │  │  │  ├─ URL Copy Button
│  │  │  │  └─ Delete Button
│  │  │  │
│  │  │  └─ Pagination
│  │  │
│  │  └─ Loading States
│  │
│  ├─ /site-settings → SiteSettings
│  │  ├─ Site Info Card
│  │  │  ├─ Name Input
│  │  │  ├─ Title Input
│  │  │  ├─ Description TextArea
│  │  │  └─ URL Input
│  │  │
│  │  ├─ Contact Card
│  │  │  ├─ Email Input
│  │  │  └─ Phone Input
│  │  │
│  │  ├─ Branding Card
│  │  │  ├─ Logo Upload
│  │  │  │  ├─ File Input
│  │  │  │  └─ Preview Image
│  │  │  │
│  │  │  └─ Favicon Upload
│  │  │     ├─ File Input
│  │  │     └─ Preview Image
│  │  │
│  │  ├─ Save Button
│  │  ├─ Reset Button
│  │  └─ Loading States
│  │
│  └─ /content → Content
│     ├─ Collection Selector
│     │
│     ├─ New Record Button
│     │  └─ Create Dialog
│     │
│     ├─ Records Table
│     │  ├─ Rows
│     │  │  ├─ Edit Button (NEW!)
│     │  │  │  └─ Edit Dialog
│     │  │  │     ├─ Field Inputs
│     │  │  │     └─ Update Button
│     │  │  │
│     │  │  └─ Delete Button
│     │  │
│     │  └─ Pagination
│     │
│     └─ Loading States
```

## Database Schema Visualization

```
┌──────────────────────────────────────────────────────────────────┐
│                         DATABASE                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  files (NEW)                site_info (NEW)                       │
│  ┌──────────────────┐      ┌──────────────────────┐             │
│  │ id (PK)          │      │ id (PK)              │             │
│  │ fileName         │      │ siteName             │             │
│  │ originalName     │      │ siteTitle            │             │
│  │ mimeType         │      │ siteDescription      │             │
│  │ size             │      │ logoId (→files)      │───┐         │
│  │ path             │      │ faviconId (→files)   │───┼─────┐   │
│  │ url              │      │ contactEmail         │   │     │   │
│  │ createdAt        │      │ contactPhone         │   │     │   │
│  │ updatedAt        │      │ socialLinks (JSON)   │   │     │   │
│  └──────────────────┘      │ metadata (JSON)      │   │     │   │
│         ▲                   │ createdAt            │   │     │   │
│         │                   │ updatedAt            │   │     │   │
│         │                   └──────────────────────┘   │     │   │
│         │                                              │     │   │
│         └──────────────────────────────────────────────┘     │   │
│                                                              │   │
│  fields (ENHANCED)                                           │   │
│  ┌─────────────────────────────┐                            │   │
│  │ id                          │                            │   │
│  │ collectionId (→collections) │                            │   │
│  │ name                        │                            │   │
│  │ dbColumn                    │                            │   │
│  │ type                        │                            │   │
│  │ required                    │                            │   │
│  │ isFileField (NEW)           │ ◄──────────────────────────┘   │
│  │ acceptedFileTypes (NEW)     │                                │
│  │ maxFileSize (NEW)           │                                │
│  │ metadata (NEW)              │                                │
│  │ createdAt                   │                                │
│  │ updatedAt                   │                                │
│  └─────────────────────────────┘                                │
│                                                                   │
│  collections (EXISTING)                                           │
│  ├─ id, name, displayName, etc.                                 │
│  └─ (unchanged, fields updated)                                 │
│                                                                   │
│  {dynamic_collection_tables} (EXISTING)                          │
│  ├─ Can now store file IDs in any field                         │
│  └─ File ID references to files.id                              │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Technology Stack

```
BACKEND
├─ NestJS 10.x
├─ Prisma ORM
├─ PostgreSQL
├─ Multer (file upload)
├─ Express (static serving)
└─ TypeScript

FRONTEND
├─ React 18.x
├─ TypeScript
├─ React Router
├─ Shadcn/UI (components)
├─ Lucide Icons
├─ React Hot Toast (notifications)
└─ Tailwind CSS

STORAGE
├─ Local filesystem (/uploads/files/)
├─ PostgreSQL database
└─ Asset serving via Express static

DEPLOYMENT
├─ Backend: Node.js/Docker
├─ Database: PostgreSQL server
├─ Assets: Local or S3 (future)
└─ Frontend: Static hosting or embedded
```

---

This visual guide helps understand how all the components work together!
