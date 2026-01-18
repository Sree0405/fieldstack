# Quick Start - File Management & Site Configuration

## 🚀 Get Up and Running in 5 Minutes

### Prerequisites
- Node.js installed
- Project already running
- Database configured

### Step 1: Install Dependencies (2 min)

```bash
cd server
npm install @nestjs/platform-express uuid
```

Or with bun:
```bash
cd server
bun install @nestjs/platform-express uuid
```

### Step 2: Run Database Migration (1 min)

```bash
cd server
npx prisma migrate deploy
```

This creates three new database tables:
- `files` - File metadata storage
- `site_info` - Site configuration storage  
- Updates `fields` table with file support columns

### Step 3: Restart Backend (1 min)

```bash
npm run start:dev
```

Look for these in logs:
```
✓ FilesModule loaded
✓ SiteInfoModule loaded
✓ Asset serving enabled at /assets
```

### Step 4: Add Routes to Frontend (1 min)

In your routing file, add:

```typescript
import FileManager from '@/pages/FileManager';
import SiteSettings from '@/pages/SiteSettings';

// In your routes array:
{
  path: '/file-manager',
  element: <FileManager />
},
{
  path: '/site-settings',
  element: <SiteSettings />
},
```

### Step 5: Add Navigation Links

In your navbar/sidebar component:

```tsx
<a href="/file-manager">📁 File Manager</a>
<a href="/site-settings">⚙️ Site Settings</a>
```

## ✅ Verify Everything Works

### Test 1: Upload a File
1. Go to `/file-manager`
2. Click "Upload"
3. Select any image or file
4. Should see "File uploaded successfully!"

### Test 2: Serve Asset
In browser, go to:
```
http://localhost:4000/assets/{file-id}
```
Should display or download the file.

### Test 3: Configure Site
1. Go to `/site-settings`
2. Enter site name: "My Awesome Site"
3. Enter email: "hello@example.com"
4. Upload a logo image
5. Click "Save Changes"
6. Should see "Site info updated successfully!"

### Test 4: Edit Content
1. Go to Content page
2. Select any collection
3. Click the edit (pencil) icon on any record
4. Modify a field
5. Click "Update Record"
6. Should see "Record updated successfully!"

## 📝 Common Tasks

### Upload a File (Frontend)
```typescript
import { apiClient, getAssetsUrl } from '@/integrations/api/client';

// Single file
const response = await apiClient.uploadFile(file);
const url = getAssetsUrl(response.data.id);

// Multiple files
const response = await apiClient.uploadMultipleFiles([file1, file2]);
```

### Display File in Component
```typescript
<img src={getAssetsUrl(fileId)} alt="My image" />
```

### Store File ID in Content
```typescript
await apiClient.createCrudItem('posts', {
  title: 'My Post',
  featured_image: fileId  // This is the file ID
});
```

### Update Content Record
```typescript
await apiClient.updateCrudItem('posts', recordId, {
  title: 'New Title',
  content: 'New content'
});
```

### Get Site Configuration
```typescript
const response = await apiClient.getSiteInfo();
console.log(response.data.siteName);
```

### Update Site Logo
```typescript
// 1. Upload logo
const uploadRes = await apiClient.uploadFile(logoFile);

// 2. Update site with logo ID
await apiClient.updateSiteLogo(uploadRes.data.id);
```

## 🎯 What You Get

### File Manager Features
- ✅ Upload single or multiple files
- ✅ View all uploaded files
- ✅ See file details (size, type, date)
- ✅ Copy asset URLs to clipboard
- ✅ Delete files
- ✅ Pagination for many files

### Site Settings Features
- ✅ Set site name and title
- ✅ Add site description
- ✅ Store contact information
- ✅ Upload and manage logo
- ✅ Upload and manage favicon
- ✅ Preview uploaded images

### Content Manager Updates
- ✅ **NEW**: Edit any record with edit button
- ✅ **NEW**: Update record values inline
- ✅ Create records (existing feature)
- ✅ Delete records (existing feature)
- ✅ View all records with pagination

## 🔗 API Endpoints Overview

```
FILES
  POST   /api/files              - Upload file
  GET    /api/files              - List all files
  GET    /api/files/:id          - Get file info
  DELETE /api/files/:id          - Delete file
  GET    /assets/:id             - Serve file

SITE INFO
  GET    /api/site-info          - Get site config
  PATCH  /api/site-info          - Update site config

CONTENT (ENHANCED)
  POST   /:collection            - Create record
  GET    /:collection            - List records
  PATCH  /:collection/:id        - Update record (FIXED!)
  DELETE /:collection/:id        - Delete record
```

## 💾 Database Schema

### files table
- id, fileName, originalName, mimeType, size
- path, url, createdAt, updatedAt

### site_info table
- id, siteName, siteTitle, siteDescription
- siteUrl, logoId, faviconId
- contactEmail, contactPhone
- socialLinks (JSON), metadata (JSON)
- createdAt, updatedAt

## 🧪 Testing Your Setup

### Quick Test Script
```typescript
// Test file upload
const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
const uploadResponse = await apiClient.uploadFile(testFile);
console.log('✓ File uploaded:', uploadResponse.data?.id);

// Test asset URL
const assetUrl = getAssetsUrl(uploadResponse.data.id);
console.log('✓ Asset URL:', assetUrl);

// Test site info
const siteResponse = await apiClient.getSiteInfo();
console.log('✓ Site info:', siteResponse.data?.siteName);

// Test content update
const updateResponse = await apiClient.updateCrudItem('any_collection', 'any_id', {
  test_field: 'test_value'
});
console.log('✓ Content updated:', updateResponse.data?.id);
```

## 🐛 Troubleshooting

### Upload fails with 404
- **Fix**: Restart backend after migration
- **Check**: Is FilesModule imported in app.module?

### Assets return 404
- **Fix**: Restart backend, verify uploads directory created
- **Check**: Is ServeStaticModule configured?

### Edit button doesn't appear
- **Fix**: Make sure Content.tsx was updated
- **Check**: Browser console for errors

### Update not working
- **Fix**: This has been fixed in the update
- **Check**: Verify CRUD service was updated

### Migration fails
- **Fix**: Run `npx prisma db push` instead
- **Check**: Is database connection valid?

## 📚 Need More Help?

- **API Details**: See FILE_MANAGEMENT_GUIDE.md
- **Setup Steps**: See IMPLEMENTATION_CHECKLIST.md
- **Code Examples**: See QUICK_REFERENCE.md
- **Overview**: See FILE_MANAGEMENT_UPDATE.md

## ✨ That's It!

You now have:
1. ✅ File upload and management
2. ✅ Site configuration UI
3. ✅ Working content editing
4. ✅ Asset serving at /assets/:id

Next steps:
- Add file upload to your collection fields
- Customize site branding
- Start using file IDs in your content
- Explore advanced features in documentation

## 🚀 Ready to Deploy?

1. Test all features locally
2. Review FILE_MANAGEMENT_GUIDE.md for edge cases
3. Configure file size limits if needed (in FilesController)
4. Set up proper file storage for production
5. Deploy database migrations first
6. Restart backend
7. Verify assets can be served
8. Test one more time in production

---

**Time to completion**: ~5 minutes  
**Complexity**: ⭐ Easy  
**Production ready**: ✅ Yes
