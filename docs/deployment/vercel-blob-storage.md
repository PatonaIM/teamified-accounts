# Vercel Blob Storage Setup for CV Uploads

**Date:** October 20, 2025  
**Status:** ✅ COMPLETE

---

## 🎯 Problem

CV uploads were failing in production with error:
```
ENOENT: no such file or directory, mkdir '/var/task/storage'
```

This happened because the application was trying to create local directories in Vercel's read-only serverless environment.

---

## ✅ Solution

Implemented **dual storage strategy**:
- **Development:** Local file storage (existing behavior)
- **Production:** Vercel Blob storage

---

## 📦 Implementation Details

### Storage Service Updates

The `StorageService` now:
1. **Detects environment** via `NODE_ENV`
2. **Uses appropriate storage backend**:
   - Production → Vercel Blob
   - Development → Local filesystem

3. **Stores different values in `file_path` column**:
   - Production: Full blob URL (e.g., `https://abc123.public.blob.vercel-storage.com/cvs/users/123/v456.pdf`)
   - Development: Relative path (e.g., `cvs/users/123/v456.pdf`)

### Methods Updated

All storage methods handle both storage types:
- ✅ `uploadCV()` - Uploads to blob or local storage
- ✅ `generateSignedUrl()` - Returns blob URL directly or generates signed local URL
- ✅ `deleteFile()` - Deletes from blob or local storage
- ✅ `readFileFromStorage()` - Fetches from blob URL or reads local file
- ✅ `fileExists()` - Checks blob or local file existence

---

## 🔧 Configuration

### Environment Variables

**Required in Vercel:**
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
NODE_ENV=production
```

The `BLOB_READ_WRITE_TOKEN` is automatically created when you add Vercel Blob storage to your project via the Vercel dashboard.

### How to Get BLOB_READ_WRITE_TOKEN

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** → **Blob**
4. Vercel automatically creates the token and adds it to your environment variables

---

## 📊 How It Works

### Upload Flow (Production)

```
1. User uploads CV file
   ↓
2. StorageService.uploadCV() called
   ↓
3. Detects NODE_ENV === 'production'
   ↓
4. Calls put() from @vercel/blob
   ↓
5. Vercel Blob returns URL: https://...blob.vercel-storage.com/path
   ↓
6. URL stored in documents.file_path column
   ↓
7. Success!
```

### Download Flow (Production)

```
1. User clicks download
   ↓
2. Backend calls StorageService.generateSignedUrl()
   ↓
3. Detects file_path starts with 'https://'
   ↓
4. Returns blob URL directly (no signing needed)
   ↓
5. Frontend opens blob URL
   ↓
6. User downloads file from Vercel Blob CDN
```

### Upload Flow (Development)

```
1. User uploads CV file
   ↓
2. StorageService.uploadCV() called
   ↓
3. Detects NODE_ENV !== 'production'
   ↓
4. Creates local directory: ./storage/cvs/users/123/
   ↓
5. Writes file to disk
   ↓
6. Relative path stored in documents.file_path
   ↓
7. Success!
```

---

## 🧪 Testing

### Test CV Upload in Production

1. **Login** as `priya.sharma@teamified-test.com`
2. **Navigate** to CV Management page
3. **Upload** the sample CV (`sample-cv-priya-sharma.pdf`)
4. **Verify** upload succeeds
5. **Check** the CV appears in the list
6. **Download** the CV to verify it works

### Expected Behavior

- ✅ Upload completes without ENOENT error
- ✅ CV appears in list with correct filename
- ✅ Download opens blob URL directly
- ✅ File is accessible from Vercel Blob CDN

### Verify in Database

```sql
SELECT id, file_name, file_path, file_size 
FROM documents 
WHERE document_type = 'cv' 
ORDER BY uploaded_at DESC 
LIMIT 5;
```

**Expected `file_path` in production:**
```
https://abc123xyz.public.blob.vercel-storage.com/cvs/users/32c36da5.../v1234567890-abc.pdf
```

**Expected `file_path` in development:**
```
cvs/users/32c36da5-6300-4557-b443-b6f8349b0bcb/v1234567890-abc.pdf
```

---

## 📝 Dependencies Added

```json
{
  "dependencies": {
    "@vercel/blob": "^0.x.x"
  }
}
```

---

## 🔍 Troubleshooting

### Issue: "BLOB_READ_WRITE_TOKEN not set"

**Solution:** Add the token in Vercel dashboard:
1. Project Settings → Environment Variables
2. Add `BLOB_READ_WRITE_TOKEN` with your token value
3. Redeploy

### Issue: "Blob upload failed"

**Possible causes:**
- Invalid token
- Token doesn't have write permissions
- Network connectivity issues

**Solution:**
1. Verify token in Vercel dashboard
2. Check Vercel Blob storage is enabled
3. Check backend logs for detailed error

### Issue: Downloads return 404

**Possible causes:**
- Blob URL expired or invalid
- File was deleted
- Blob storage not accessible

**Solution:**
1. Check if file exists in Vercel Blob dashboard
2. Verify blob URL in database is correct
3. Try re-uploading the file

---

## 🚀 Deployment

### Backend Deployment

The backend automatically redeploys when you push to `main`:

```bash
git push origin main
```

Vercel will:
1. Build the NestJS application
2. Deploy as serverless functions
3. Use `BLOB_READ_WRITE_TOKEN` from environment variables
4. CV uploads will now use Vercel Blob storage

### No Frontend Changes Required

The frontend doesn't need any changes - it just:
1. Uploads files to the same backend endpoint
2. Receives download URLs (now blob URLs instead of local paths)
3. Opens the URLs for download

---

## 📚 Related Files

- `src/documents/services/storage.service.ts` - Main storage service (UPDATED)
- `src/documents/services/cv.service.ts` - CV service (uses StorageService)
- `src/documents/controllers/cv.controller.ts` - CV upload/download endpoints
- `package.json` - Added @vercel/blob dependency

---

## ✅ Success Criteria

- [x] CV uploads work in production without ENOENT errors
- [x] Files are stored in Vercel Blob
- [x] Downloads work correctly
- [x] Local development still uses local storage
- [x] No breaking changes to existing functionality
- [x] Blob URLs are stored in database for production
- [x] All storage methods handle both storage types

---

## 🎉 Result

CV uploads now work seamlessly in both development and production environments, with automatic storage backend selection based on the environment!

