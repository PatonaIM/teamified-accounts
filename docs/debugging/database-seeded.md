# Database Seeded - Test Credentials

## ✅ Database Successfully Seeded

Date: October 16, 2025  
Environment: Development (Docker)

## 🔐 Test Credentials

### Admin User
- **Email**: `admin@teamified.com`
- **Password**: `Admin123!`
- **Roles**: admin
- **Status**: Active, Email Verified

## 🧪 Verified Working

### Authentication
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@teamified.com", "password": "Admin123!"}'
```

**Result**: ✅ Returns access token and refresh token

### Workable Integration
```bash
curl 'http://localhost:3000/api/v1/workable/jobs?limit=3'
```

**Result**: ✅ Returns live job data from Workable ATS

## 📊 Database Status

- **Users**: 26 (25 existing + 1 admin)
- **Tables**: All initialized via init-db.sql
- **Seeding**: Manual admin user creation
- **Status**: Fully functional

## 🌐 Access URLs

### Frontend
- Job Board: http://localhost/jobs
- Job Detail: http://localhost/jobs/DCCEED46C0
- Application: http://localhost/jobs/DCCEED46C0/apply
- Login: http://localhost/login

### Backend API
- Login: http://localhost:3000/api/v1/auth/login
- Jobs List: http://localhost:3000/api/v1/workable/jobs
- Health Check: http://localhost:3000/api/health
- API Docs: http://localhost:3000/api/docs

## 🎯 Ready for Testing

✅ Database seeded  
✅ Admin user created  
✅ Authentication working  
✅ Workable integration working  
✅ All services healthy  

**You can now**:
1. Login with admin@teamified.com / Admin123!
2. Browse jobs at http://localhost/jobs
3. Test the full job application workflow
4. Access API documentation at http://localhost:3000/api/docs

---

Generated: October 16, 2025, 11:30 PM

