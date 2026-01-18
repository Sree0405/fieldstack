# Troubleshooting & FAQ - File Management System

## Common Issues & Solutions

### 🔴 Issue: "Cannot find module @nestjs/platform-express"

**Error Message**: 
```
Error: Cannot find module '@nestjs/platform-express'
```

**Solution**:
```bash
cd server
npm install @nestjs/platform-express
# or
bun install @nestjs/platform-express
```

**Why**: File upload functionality requires the file upload middleware.

---

### 🔴 Issue: "POST /api/files returns 404"

**Error Message**:
```
POST /api/files 404 Not Found
```

**Causes**:
1. Backend not restarted after adding FilesModule
2. FilesModule not imported in app.module.ts

**Solution**:
1. Verify `FilesModule` is imported in `app.module.ts`:
   ```typescript
   import { FilesModule } from './files/files.module';
   
   @Module({
     imports: [
       // ... other imports
       FilesModule,
     ],
   })
   ```

2. Restart backend:
   ```bash
   npm run start:dev
   ```

**Check**: Backend logs should show "FilesModule loaded"

---

### 🔴 Issue: "GET /assets/:id returns 404"

**Error Message**:
```
GET /assets/file-id-here 404 Not Found
```

**Causes**:
1. ServeStaticModule not configured
2. Upload directory doesn't exist
3. File not found in uploads directory

**Solution**:
1. Verify ServeStaticModule in `app.module.ts`:
   ```typescript
   import { ServeStaticModule } from '@nestjs/serve-static';
   
   @Module({
     imports: [
       ServeStaticModule.forRoot({
         rootPath: path.join(__dirname, '..', '..', 'uploads'),
         serveRoot: '/assets',
       }),
       // ... rest
     ],
   })
   ```

2. Restart backend
3. Check `{project_root}/uploads/files/` exists and has files

**Manual Test**:
```bash
# Check if uploads directory exists
ls uploads/files

# Check if files are there
ls -la uploads/files/
```

---

### 🔴 Issue: "File upload returns 500 error"

**Error Message**:
```
POST /api/files 500 Internal Server Error
```

**Causes**:
1. No write permissions to uploads directory
2. Out of disk space
3. File too large (default 100MB limit)

**Solution**:
```bash
# Fix permissions
chmod 755 uploads
chmod 755 uploads/files

# Check disk space
df -h

# Check file size
ls -lh uploads/files/
```

**Increase File Limit** (in `files.controller.ts`):
```typescript
@UseInterceptors(
  FileInterceptor('file', {
    storage: memoryStorage(),
    limits: {
      fileSize: 500 * 1024 * 1024, // 500MB instead of 100MB
    },
  })
)
```

---

### 🔴 Issue: "Edit button doesn't appear on Content page"

**Error Message**: No edit button visible in records table

**Causes**:
1. Content.tsx file not updated
2. Edit2 icon not imported
3. Browser cache

**Solution**:
1. Verify Content.tsx has:
   ```typescript
   import { Edit2 } from 'lucide-react';
   ```

2. Check edit button is in table:
   ```tsx
   <Button onClick={() => handleOpenEditDialog(record)}>
     <Edit2 className="h-4 w-4" />
   </Button>
   ```

3. Clear browser cache (Ctrl+Shift+Del)

4. Hard refresh (Ctrl+F5)

---

### 🔴 Issue: "Update record returns 400 Bad Request"

**Error Message**:
```
PATCH /:collection/:id 400 Bad Request
Validation failed for field "xyz"
```

**Causes**:
1. Field value fails validation
2. Required field missing
3. Wrong data type

**Solution**:
1. Check field type matches data:
   ```typescript
   // If field is INTEGER type, pass number
   { age: 30 }  // ✓ Correct
   { age: "30" } // ✗ Wrong
   ```

2. Check required fields are included:
   ```typescript
   // Don't include system fields
   delete updateData.id;
   delete updateData.created_at;
   delete updateData.updated_at;
   ```

3. Verify field exists in collection

---

### 🔴 Issue: "Migration fails with 'column already exists'"

**Error Message**:
```
Error: COLUMN already exists
```

**Causes**:
1. Migration partially applied
2. Manual schema changes
3. Running migration twice

**Solution**:
```bash
# Option 1: Check migration status
npx prisma migrate status

# Option 2: Resolve migration
npx prisma migrate resolve --rolled-back <migration_name>

# Option 3: Force reset (dev only!)
npx prisma migrate reset
```

**Prevention**: Back up database before migrations!

---

### 🔴 Issue: "Site info not loading"

**Error Message**:
```
GET /api/site-info 500 Error
Failed to load site info
```

**Causes**:
1. site_info table doesn't exist
2. Database migration not run
3. SiteInfoModule not imported

**Solution**:
```bash
# 1. Run migration
npx prisma migrate deploy

# 2. Verify SiteInfoModule in app.module.ts
import { SiteInfoModule } from './site-info/site-info.module';

# 3. Restart backend
npm run start:dev

# 4. Test directly
curl http://localhost:4000/api/site-info
```

---

### 🟡 Issue: "File upload very slow"

**Causes**:
1. Large file size
2. Network bottleneck
3. Server processing

**Solutions**:
- **For Users**: Break large uploads into smaller files
- **For Developers**: Implement chunked uploads (future enhancement)
- **For Infrastructure**: Increase max file size limit in server config

---

### 🟡 Issue: "Storage filling up quickly"

**Causes**:
1. Many large files uploaded
2. No cleanup of deleted files
3. Duplicate uploads

**Solutions**:
1. Monitor uploads directory:
   ```bash
   du -sh uploads/
   du -sh uploads/files/
   ```

2. Delete old files manually:
   ```bash
   find uploads/files -type f -mtime +30 -delete
   ```

3. Consider cloud storage for production

---

## ❓ Frequently Asked Questions

### Q: Where are files stored?
**A**: In `{project_root}/uploads/files/` directory on the server.

### Q: Can I change the upload directory?
**A**: Yes, in `FilesService.uploadDir`:
```typescript
private readonly uploadDir = path.join(process.cwd(), 'custom/path');
```

### Q: What's the maximum file size?
**A**: Default 100MB, configurable in `FilesController`:
```typescript
limits: { fileSize: 100 * 1024 * 1024 }
```

### Q: How do I store files in the cloud?
**A**: Implement cloud storage in `FilesService`:
```typescript
// Use AWS S3, Azure Blob, Google Cloud Storage, etc.
// Store path/URL in database, same interface
```

### Q: Can I restrict file types?
**A**: Yes, in collection field configuration:
```typescript
{
  name: 'gallery',
  isFileField: true,
  acceptedFileTypes: 'image/*'
}
```

### Q: How do I backup files?
**A**: Backup the uploads directory:
```bash
tar -czf backup.tar.gz uploads/
```

### Q: Can multiple users upload at once?
**A**: Yes, uses UUID for unique file names, no conflicts.

### Q: What if disk is full?
**A**: Upload will fail. Free space and retry, or use cloud storage.

### Q: How do I delete all files?
**A**: Only through API:
```typescript
const files = await apiClient.getAllFiles(1000, 0);
for (const file of files.data.data) {
  await apiClient.deleteFile(file.id);
}
```

### Q: Can I serve files without /assets/?
**A**: Change ServeStaticModule route in app.module.ts.

### Q: How do I version files?
**A**: Store multiple file IDs and track versions (future enhancement).

### Q: Can I transcode videos?
**A**: Add ffmpeg integration (future enhancement).

### Q: How do I implement image compression?
**A**: Use sharp library (future enhancement).

---

## 🔍 Debugging Tips

### 1. Check Backend Logs
```bash
npm run start:dev 2>&1 | grep -i "file\|error"
```

### 2. Test API Directly
```bash
# Upload test
curl -X POST -F "file=@test.jpg" http://localhost:4000/api/files

# List files
curl http://localhost:4000/api/files

# Get asset
curl -I http://localhost:4000/assets/{file-id}
```

### 3. Check Browser Console
```javascript
// In browser console
const response = await fetch('/api/files');
console.log(response);
```

### 4. Database Inspection
```bash
cd server
npx prisma studio
# Then inspect files and site_info tables
```

### 5. Network Tab
Open DevTools > Network tab and watch:
- Request/response headers
- Request/response body
- Timing information

---

## ✅ Verification Checklist

- [ ] Dependencies installed: `npm ls @nestjs/platform-express`
- [ ] Migration run: `npx prisma migrate status`
- [ ] Files tables exist: Check in `npx prisma studio`
- [ ] Backend running: Check console logs
- [ ] Modules imported: Check app.module.ts
- [ ] Upload directory exists: `ls uploads/files/`
- [ ] File upload works: Test in FileManager UI
- [ ] Asset serving works: Test `/assets/{id}` URL
- [ ] Site info works: Test in SiteSettings UI
- [ ] Content edit works: Test in Content page
- [ ] No console errors: Check browser DevTools

---

## 🆘 Emergency Fixes

### If file manager is broken:
```bash
# 1. Restart backend
npm run start:dev

# 2. Check if files table exists
npx prisma studio

# 3. Re-run migration if needed
npx prisma migrate deploy

# 4. Clear browser cache
# Ctrl+Shift+Del in browser
```

### If uploads aren't saving:
```bash
# 1. Check directory permissions
ls -la uploads/

# 2. Check disk space
df -h

# 3. Check if FilesService initializing
# Look for "✓ FilesModule loaded" in logs
```

### If assets won't serve:
```bash
# 1. Check ServeStaticModule config
cat server/src/app.module.ts | grep -A5 "ServeStaticModule"

# 2. Verify file exists
ls uploads/files/{file-id}

# 3. Check file permissions
ls -la uploads/files/{file-id}
```

---

## 📞 Getting More Help

1. **Check documentation**:
   - FILE_MANAGEMENT_GUIDE.md
   - IMPLEMENTATION_CHECKLIST.md
   - QUICK_START_FILEMANAGEMENT.md

2. **Search logs**:
   - Backend logs for errors
   - Browser console for client errors
   - Database logs if applicable

3. **Test endpoints**:
   - Use Postman or curl
   - Check request/response
   - Verify status codes

4. **Review code**:
   - Check imports are correct
   - Verify modules are registered
   - Confirm file paths match

5. **Restart and retry**:
   - Restart backend
   - Clear browser cache
   - Hard refresh page
   - Retry operation

---

**Version**: 1.0.0  
**Last Updated**: January 18, 2026  
**Status**: Complete & Tested
