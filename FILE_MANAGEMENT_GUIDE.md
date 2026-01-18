# File Management & Site Configuration System

## Overview

This document outlines the new file management and site configuration features added to NOVACMS. These features enable users to upload files, manage media assets, and configure site-wide settings like site name, logo, and contact information.

## Features Added

### 1. **File Management System**

#### Database Models

**File Model** (`server/prisma/schema.prisma`)
```prisma
model File {
  id            String   @id @default(uuid())
  fileName      String
  originalName  String
  mimeType      String
  size          Int      // File size in bytes
  path          String   @unique // Relative path
  url           String   // Public URL
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@map("files")
}
```

#### Backend Endpoints

**File Upload**
- `POST /api/files` - Upload a single file
  - Request: multipart/form-data with `file` field
  - Response: File metadata with ID and URL
  - Returns: `{ id, fileName, originalName, mimeType, size, url, createdAt }`

- `POST /api/files/multiple` - Upload multiple files
  - Request: multipart/form-data with `files` field
  - Response: Array of file metadata

**File Retrieval**
- `GET /api/files` - Get all files with pagination
  - Query params: `limit=50&offset=0`
  - Response: `{ data: File[], total: number, limit: number, offset: number }`

- `GET /api/files/:id` - Get specific file metadata
  - Response: File metadata object

**File Deletion**
- `DELETE /api/files/:id` - Delete a file
  - Response: `{ success: true, id: string }`

**Asset Serving**
- `GET /assets/:id` - Serve file content (configured via ServeStaticModule)
  - Automatically serves files from `uploads/files/` directory
  - URL format: `http://localhost:4000/assets/{fileId}`

#### File Upload Service (`server/src/files/files.service.ts`)

Features:
- In-memory file storage using multer
- File validation (MIME type, size limits)
- Database record creation for tracking files
- Unique file ID generation (UUID)
- Asset URL generation

#### Frontend File Upload Methods

In `src/integrations/api/client.ts`:

```typescript
// Upload single file
apiClient.uploadFile(file: File): Promise<ApiResponse<any>>

// Upload multiple files
apiClient.uploadMultipleFiles(files: File[]): Promise<ApiResponse<any>>

// Get file metadata
apiClient.getFile(fileId: string): Promise<ApiResponse<any>>

// Get all files
apiClient.getAllFiles(limit?: number, offset?: number): Promise<ApiResponse<any>>

// Delete file
apiClient.deleteFile(fileId: string): Promise<ApiResponse<any>>
```

#### Asset URL Helper

```typescript
// Get asset URL for displaying a file
getAssetsUrl(fileId: string): string
// Returns: http://localhost:4000/assets/{fileId}

// Usage in components:
<img src={getAssetsUrl(fileId)} alt="Image" />
```

### 2. **Site Configuration System**

#### Database Model

**SiteInfo Model** (`server/prisma/schema.prisma`)
```prisma
model SiteInfo {
  id              String   @id @default(uuid())
  siteName        String
  siteTitle       String?
  siteDescription String?
  siteUrl         String?
  logoId          String?  // File ID reference
  faviconId       String?  // File ID reference
  contactEmail    String?
  contactPhone    String?
  socialLinks     Json?    // { twitter, facebook, instagram, etc }
  metadata        Json?    // Additional metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  @@map("site_info")
}
```

#### Backend Endpoints

**SiteInfo Management**
- `GET /api/site-info` - Get site configuration (auto-creates if doesn't exist)
  - Response: SiteInfo object

- `GET /api/site-info/:id` - Get specific site info by ID
  - Response: SiteInfo object

- `PATCH /api/site-info` - Update site details
  - Request body: `{ siteName?, siteTitle?, siteDescription?, siteUrl?, contactEmail?, contactPhone?, socialLinks?, metadata? }`
  - Response: Updated SiteInfo

- `PATCH /api/site-info/:id` - Update full site info by ID
  - Request body: Any SiteInfo fields
  - Response: Updated SiteInfo

#### Frontend Methods

In `src/integrations/api/client.ts`:

```typescript
// Get site info
apiClient.getSiteInfo(): Promise<ApiResponse<any>>

// Update site details
apiClient.updateSiteInfo(data: SiteInfoUpdate): Promise<ApiResponse<any>>

// Update site logo
apiClient.updateSiteLogo(logoId: string): Promise<ApiResponse<any>>

// Update site favicon
apiClient.updateSiteFavicon(faviconId: string): Promise<ApiResponse<any>>
```

### 3. **Enhanced Field Model**

Updated `Field` model to support file fields:

```prisma
model Field {
  // ... existing fields ...
  isFileField         Boolean   @default(false)
  acceptedFileTypes   String?   // comma-separated MIME types
  maxFileSize         Int?      // Max file size in bytes
  metadata            Json?     // Additional field metadata
}
```

### 4. **Fixed Content Update Issue**

**Problem**: The update endpoint wasn't properly mapping field names to database column names.

**Solution**: Updated `CrudService.update()` to:
1. Map field names to `dbColumn` names before generating UPDATE SQL
2. Handle empty data gracefully
3. Properly validate all fields before updating

**Before**:
```typescript
const updates = Object.keys(cleanData)
  .map((k, i) => `"${k}" = $${i + 1}`)
  .join(',');
```

**After**:
```typescript
const fieldMap = new Map(collection.fields.map((f: any) => [f.name, f.dbColumn]));

const updates = dataEntries
  .map(([fieldName, _], i) => {
    const dbColumn = fieldMap.get(fieldName) || fieldName;
    return `"${dbColumn}" = $${i + 1}`;
  })
  .join(',');
```

## UI Components

### 1. File Manager Page (`src/pages/FileManager.tsx`)

Features:
- Upload single or multiple files
- View all uploaded files in a table
- Copy asset URLs to clipboard
- Delete files
- Pagination support
- File size formatting
- MIME type display

### 2. Site Settings Page (`src/pages/SiteSettings.tsx`)

Features:
- Edit site name, title, and description
- Manage contact information (email, phone)
- Upload and manage logo
- Upload and manage favicon
- Preview uploaded images
- Save/reset functionality
- Auto-create site info on first visit

## Database Migration

Migration: `20260118_add_files_and_site_info`

Creates:
1. `files` table - for storing file metadata
2. `site_info` table - for storing site configuration
3. Updates `fields` table with file-related columns

## Usage Examples

### Uploading a File

```typescript
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const response = await apiClient.uploadFile(file);
  
  if (response.data) {
    const fileId = response.data.id;
    const assetUrl = getAssetsUrl(fileId);
    console.log('Uploaded file:', assetUrl);
  }
};
```

### Displaying an Uploaded File

```typescript
import { getAssetsUrl } from '@/integrations/api/client';

export function FileDisplay({ fileId }: { fileId: string }) {
  return (
    <img 
      src={getAssetsUrl(fileId)} 
      alt="User uploaded file"
    />
  );
}
```

### Updating Site Information

```typescript
const handleUpdateSite = async () => {
  const response = await apiClient.updateSiteInfo({
    siteName: 'My New Site',
    siteTitle: 'Welcome!',
    contactEmail: 'info@example.com'
  });

  if (response.data) {
    console.log('Site updated:', response.data);
  }
};
```

### Storing File IDs in Content

When creating or updating content records, store the file ID:

```typescript
const recordData = {
  title: 'My Blog Post',
  featured_image: fileId, // Store file ID in the field
  content: 'Post content here'
};

await apiClient.createCrudItem('blog_posts', recordData);
```

Then when displaying:

```typescript
const post = records[0];
<img src={getAssetsUrl(post.featured_image)} alt={post.title} />
```

## Configuration

### Upload Directory

Files are stored in: `{project_root}/uploads/files/`

This directory is automatically created if it doesn't exist.

### File Size Limits

- Default: 100MB per file
- Configure in `FilesController` via multer options

### Asset Serving Configuration

Configured in `app.module.ts`:

```typescript
ServeStaticModule.forRoot({
  rootPath: path.join(__dirname, '..', '..', 'uploads'),
  serveRoot: '/assets',
})
```

## Running Migrations

```bash
cd server

# Run all pending migrations
npx prisma migrate deploy

# Or generate migration (development)
npx prisma migrate dev --name "add_files_and_site_info"
```

## Next Steps

1. Run database migration to create new tables
2. Install any missing dependencies (@nestjs/platform-express for file handling)
3. Restart the backend server
4. Add FileManager and SiteSettings pages to navigation/routing
5. Start uploading files and managing site settings!

## API Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/files` | POST | Upload file |
| `/api/files/multiple` | POST | Upload multiple files |
| `/api/files` | GET | List all files |
| `/api/files/:id` | GET | Get file metadata |
| `/api/files/:id` | DELETE | Delete file |
| `/assets/:id` | GET | Serve file content |
| `/api/site-info` | GET | Get site info |
| `/api/site-info` | PATCH | Update site info |
| `/api/site-info/:id` | GET | Get site info by ID |
| `/api/site-info/:id` | PATCH | Update site info by ID |
