# Implementation Checklist

## Backend Setup

### 1. Install Dependencies
```bash
cd server
npm install @nestjs/platform-express uuid
# or if using bun
bun install @nestjs/platform-express uuid
```

### 2. Database Migration
```bash
# Navigate to server directory
cd server

# Run Prisma migration
npx prisma migrate deploy

# Or in development mode:
npx prisma migrate dev
```

### 3. Verify New Modules
- ✅ `src/files/files.module.ts` - File management module
- ✅ `src/files/files.service.ts` - File handling service
- ✅ `src/files/files.controller.ts` - File endpoints
- ✅ `src/site-info/site-info.module.ts` - Site configuration module
- ✅ `src/site-info/site-info.service.ts` - Site info service
- ✅ `src/site-info/site-info.controller.ts` - Site info endpoints

### 4. Verify Module Registration
- ✅ `FilesModule` imported in `app.module.ts`
- ✅ `SiteInfoModule` imported in `app.module.ts`
- ✅ `ServeStaticModule` configured in `app.module.ts`

### 5. Backend Verification
```bash
# Start the server
npm run start:dev

# Check logs for:
# - "File service initialized"
# - "Site info service initialized"
# - No errors on startup
```

## Frontend Setup

### 1. New Pages Added
- ✅ `src/pages/FileManager.tsx` - File management UI
- ✅ `src/pages/SiteSettings.tsx` - Site configuration UI

### 2. Updated Files
- ✅ `src/integrations/api/client.ts`
  - Added file upload methods
  - Added file retrieval methods
  - Added file deletion methods
  - Added site info methods
  - Added `getAssetsUrl()` helper function

- ✅ `src/pages/Content.tsx`
  - Added edit dialog component
  - Added edit record handler
  - Added update handler
  - Fixed CRUD update mapping

### 3. Add Pages to Router

Add the new pages to your router/navigation. Example for React Router:

```typescript
// In your routing configuration
import FileManager from '@/pages/FileManager';
import SiteSettings from '@/pages/SiteSettings';

// Add routes
{
  path: '/file-manager',
  element: <FileManager />
},
{
  path: '/site-settings',
  element: <SiteSettings />
},
```

### 4. Add Navigation Links

Update your navigation component to include links to:
- File Manager (`/file-manager`)
- Site Settings (`/site-settings`)

Example in NavLink or sidebar:
```tsx
<NavLink to="/file-manager">📁 File Manager</NavLink>
<NavLink to="/site-settings">⚙️ Site Settings</NavLink>
```

## Testing Checklist

### File Upload Tests
- [ ] Single file upload works
- [ ] Multiple file upload works
- [ ] File size limit enforced
- [ ] Invalid file types rejected
- [ ] File appears in file manager
- [ ] Asset URL is accessible

### File Display Tests
- [ ] Image files display correctly via `/assets/{id}`
- [ ] Video files serve correctly
- [ ] File copying URL to clipboard works
- [ ] File deletion removes file

### Site Settings Tests
- [ ] Site name updates save
- [ ] Site description saves
- [ ] Contact info saves correctly
- [ ] Logo upload works
- [ ] Favicon upload works
- [ ] Logo preview displays
- [ ] Favicon preview displays

### Content Update Tests
- [ ] Edit button appears in content table
- [ ] Edit dialog opens with current values
- [ ] Fields update correctly
- [ ] Update saves to database
- [ ] Updated values display in table

## File Structure

```
server/
├── src/
│   ├── files/
│   │   ├── files.module.ts
│   │   ├── files.service.ts
│   │   └── files.controller.ts
│   ├── site-info/
│   │   ├── site-info.module.ts
│   │   ├── site-info.service.ts
│   │   └── site-info.controller.ts
│   ├── crud/
│   │   └── crud.service.ts (UPDATED)
│   └── app.module.ts (UPDATED)
├── prisma/
│   ├── schema.prisma (UPDATED)
│   └── migrations/
│       └── 20260118_add_files_and_site_info/
│           └── migration.sql
└── uploads/
    └── files/ (auto-created)

src/
├── pages/
│   ├── FileManager.tsx (NEW)
│   ├── SiteSettings.tsx (NEW)
│   └── Content.tsx (UPDATED)
├── integrations/
│   └── api/
│       └── client.ts (UPDATED)
└── ...
```

## Environment Setup

No new environment variables required. The system uses:
- Existing `API_BASE_URL` for API calls
- Automatic upload directory creation
- Default JWT authentication

## Common Issues & Fixes

### Issue: "File upload endpoint not found"
**Solution**: Verify `FilesModule` is imported in `app.module.ts`

### Issue: "Cannot serve assets at /assets"
**Solution**: Verify `ServeStaticModule` is configured in `app.module.ts`

### Issue: "Update not working for records"
**Solution**: This has been fixed in the updated `CrudService.update()`. Run the migration.

### Issue: "404 when accessing uploaded files"
**Solution**: Ensure uploads directory exists at `{project_root}/uploads/files/`

### Issue: "CORS error on file upload"
**Solution**: The file upload uses FormData which should work with existing CORS settings. If issues persist, verify backend CORS configuration.

## Performance Optimization Tips

1. **File Size Limits**: Adjust in `FilesController` if needed
```typescript
limits: {
  fileSize: 100 * 1024 * 1024, // Change this value
}
```

2. **Pagination**: File Manager defaults to 20 per page
```typescript
const [limit] = useState(20); // Adjust as needed
```

3. **Image Optimization**: Consider adding image compression in the future
```typescript
// Future enhancement: Use sharp library for image optimization
```

## Deployment Notes

1. Ensure `uploads` directory is writable on production server
2. Configure file storage location for your hosting environment
3. Set appropriate file size limits for your infrastructure
4. Consider using cloud storage (S3, etc.) for scalability in future

## Support & Questions

For issues or questions:
1. Check the `FILE_MANAGEMENT_GUIDE.md` for detailed API documentation
2. Review test files for usage examples
3. Check browser console for client-side errors
4. Check server logs for backend errors

## Next Phases (Future Enhancement Ideas)

1. **Cloud Storage Integration**: Connect to S3, Azure Storage, or GCS
2. **Image Compression**: Auto-compress images on upload
3. **Video Transcoding**: Convert videos to web-friendly formats
4. **File Versioning**: Keep version history of files
5. **Access Control**: Restrict file access by user/role
6. **File Relationships**: Link files to specific content records
7. **Metadata Extraction**: Auto-extract file metadata (dimensions, duration, etc.)
8. **Search & Filtering**: Search files by name, type, date
9. **Bulk Operations**: Bulk upload, download, delete files
10. **File Analytics**: Track file access and usage
