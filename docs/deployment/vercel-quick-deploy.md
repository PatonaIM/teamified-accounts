# Vercel Backend Quick Deploy Guide

## 🚀 Quick Start (5 Minutes)

### 1. Prerequisites
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
```

### 2. Deploy Backend
```bash
# Run deployment script
./scripts/deploy-vercel.sh
```

### 3. Set Up Database
1. Go to Vercel Dashboard → Your Project → Storage
2. Create Postgres database: `teamified-db`
3. Create KV store: `teamified-kv`
4. Create Blob storage: `teamified-blob`

### 4. Environment Variables
Set these in Vercel Dashboard → Project Settings → Environment Variables:

```bash
# Database (from Vercel Postgres)
POSTGRES_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...

# Redis (from Vercel KV)
KV_URL=redis://...
KV_REST_API_TOKEN=...

# Blob Storage
BLOB_READ_WRITE_TOKEN=...

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Workable ATS
WORKABLE_SUBDOMAIN=yourcompany
WORKABLE_API_TOKEN=your-workable-token

# Frontend URL
FRONTEND_URL=https://your-frontend.vercel.app
```

### 5. Test Deployment
```bash
# Test health endpoint
curl https://your-backend.vercel.app/api/health

# Test authentication
curl -X POST https://your-backend.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@teamified.com", "password": "Admin123!"}'
```

## 📋 Deployment Checklist

- [ ] Vercel CLI installed and authenticated
- [ ] Backend deployed to Vercel
- [ ] Postgres database created
- [ ] KV store created
- [ ] Blob storage created
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] API endpoints tested
- [ ] CORS configured
- [ ] Workable integration tested

## 🔧 Troubleshooting

### Common Issues

1. **Function Timeout**
   - Increase `maxDuration` in vercel.json
   - Optimize database queries

2. **Database Connection**
   - Check `POSTGRES_URL` environment variable
   - Verify SSL configuration

3. **CORS Issues**
   - Update CORS configuration in main.ts
   - Check frontend URL in environment variables

### Debug Commands

```bash
# Check Vercel logs
vercel logs

# Check function logs
vercel logs --follow

# Test locally with Vercel environment
vercel env pull .env.local
npm run start:dev
```

## 📊 Monitoring

1. **Vercel Dashboard**
   - Monitor function execution times
   - Set up alerts for errors
   - Monitor database usage

2. **API Testing**
   - Use Postman or curl to test endpoints
   - Monitor response times
   - Check error rates

## 🎯 Next Steps

1. **Set up CI/CD** for automated deployments
2. **Configure custom domain** for production
3. **Set up monitoring and alerting**
4. **Implement backup strategies**
5. **Plan for scaling**

---

**For detailed instructions, see:** `VERCEL_BACKEND_DEPLOYMENT_GUIDE.md`
