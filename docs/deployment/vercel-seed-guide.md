# Vercel Database Seeding Guide

## 📋 Overview

This guide explains how to run the comprehensive `seed-database.js` script on your Vercel backend deployment. The seed script includes extensive test data for all features of the Teamified portal.

## 🚀 Quick Start

### **Step 1: Set Up Database and Environment Variables**

1. **Create Vercel Postgres Database:**
   - Go to Vercel Dashboard → `simon-4115s-projects` team
   - Navigate to `teamified-team-member-portal-backend` project
   - Go to "Storage" tab → Create Postgres database
   - Copy the connection strings

2. **Set Environment Variables:**
   In Vercel Dashboard → Project Settings → Environment Variables, add:

   ```bash
   # Database (from Vercel Postgres)
   POSTGRES_URL=postgresql://...
   POSTGRES_PRISMA_URL=postgresql://...
   POSTGRES_URL_NON_POOLING=postgresql://...
   
   # JWT Secrets (use the ones we generated earlier)
   JWT_SECRET=682dfd696f0c6bd0f63359dd8b3d6d9c4964daf8f710f81c2ae5a6c5b64713f5ebd857d2c608171f4faf80cc390ac1bc15f673db374e7b63c9469244a4758441
   JWT_REFRESH_SECRET=9ea1034c2aede199b53fa94b1726d0aaba456ece0fd8fc5c14b42775bb520beb5851c8765d7201fbe7ab3a787d2d4436531567c984a93b0fb2d4df60fec288dd
   
   # Other required variables
   FRONTEND_URL=https://your-frontend.vercel.app
   NODE_ENV=production
   ```

### **Step 2: Run Database Schema Setup**

1. Go to Vercel Dashboard → Storage → Postgres
2. Open the database editor
3. Copy and run the contents of `init-db.sql` from your project
4. This creates all tables and basic schema

### **Step 3: Run Database Seeding**

#### **Option A: Using the Helper Script (Recommended)**

```bash
# Update the backend URL in the script
./scripts/run-seed-on-vercel.sh --url https://teamified-team-member-portal-backend-6wpzllchw.vercel.app
```

#### **Option B: Using curl directly**

```bash
# Seed the database
curl -X POST "https://teamified-team-member-portal-backend-6wpzllchw.vercel.app/api/v1/seed/database" \
  -H "Content-Type: application/json"

# Clear database (if needed)
curl -X POST "https://teamified-team-member-portal-backend-6wpzllchw.vercel.app/api/v1/seed/clear" \
  -H "Content-Type: application/json"
```

## 📊 What Gets Seeded

The seed script creates comprehensive test data including:

### **👥 Users & Authentication**
- 25+ users with realistic profile data
- Various user roles (admin, eor, candidate, timesheet_approver)
- Password hashes using Argon2
- Emergency contacts and document references

### **🏢 Clients & Employment**
- Multiple client companies
- Employment records linking users to clients
- Salary history with realistic progression
- Role-based access control

### **💰 Payroll System**
- Countries (India, Philippines, Australia) with currencies
- Tax years and payroll periods
- Salary components (earnings, deductions, benefits)
- Statutory components (EPF, ESI, PT, TDS, SSS, PhilHealth, Pag-IBIG)
- Exchange rates for multi-currency support

### **⏰ Timesheet Management**
- 50+ timesheets with various statuses
- Timesheet types (REGULAR, OVERTIME, NIGHT_SHIFT)
- Realistic hours distribution
- Timesheet approvals with audit trail
- Country-specific overtime rates

### **🏖️ Leave Management**
- Leave balances for all users
- Country-specific leave types:
  - India: Annual, Sick, Casual, Maternity, Paternity
  - Philippines: Vacation, Sick, Maternity, Paternity, Solo Parent
  - Australia: Annual, Sick/Carer's, Long Service, Parental
- 3-5 leave requests per user
- Leave approvals with audit trail

### **📄 Payroll Self-Service**
- 3-6 payslips per employee
- Realistic salary components
- Country-specific statutory deductions
- Tax documents and compliance data

## 🔧 API Endpoints

### **Seed Database**
```http
POST /api/v1/seed/database
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Database seeded successfully",
  "data": {
    "message": "Database seeded successfully",
    "output": "...",
    "warnings": "..."
  }
}
```

### **Clear Database**
```http
POST /api/v1/seed/clear
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Database cleared successfully",
  "data": {
    "message": "Database cleared successfully",
    "output": "...",
    "warnings": "..."
  }
}
```

## 🧪 Testing the Seeded Data

### **Test User Credentials**
After seeding, you can test with these credentials:

```bash
# Admin user
Email: admin@teamified.com
Password: Admin123!

# HR Manager
Email: hr@teamified.com
Password: HRManager123!

# EOR Users
Email: john.doe@example.com
Password: EORUser123!

Email: jane.smith@example.com
Password: EORUser123!
```

### **Test API Endpoints**
```bash
# Test authentication
curl -X POST "https://your-backend.vercel.app/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@teamified.com", "password": "Admin123!"}'

# Test health endpoint
curl "https://your-backend.vercel.app/api/health"

# Test API documentation
curl "https://your-backend.vercel.app/api/docs"
```

## 🚨 Troubleshooting

### **Common Issues**

1. **"Backend is not accessible"**
   - Check if backend is deployed and running
   - Verify database and environment variables are set
   - Check Vercel logs for errors

2. **"Failed to seed database"**
   - Check backend logs: `vercel logs --scope simon-4115s-projects teamified-team-member-portal-backend`
   - Verify POSTGRES_URL environment variable is set
   - Ensure database schema is created (run init-db.sql first)

3. **"Database connection failed"**
   - Verify POSTGRES_URL is correct
   - Check if database is created in Vercel
   - Ensure SSL configuration is correct

### **Debug Commands**

```bash
# Check backend logs
vercel logs --scope simon-4115s-projects teamified-team-member-portal-backend

# Test backend connectivity
curl -v "https://your-backend.vercel.app/api/health"

# Check environment variables in Vercel dashboard
```

## 📋 Seeding Process

1. **Clear existing data** (if --clear flag used)
2. **Generate test data** (users, clients, employment records)
3. **Create payroll data** (countries, currencies, tax years)
4. **Generate timesheet data** (50+ timesheets with approvals)
5. **Create leave data** (balances, requests, approvals)
6. **Generate payslips** (3-6 per employee)
7. **Create audit logs** for all operations

## ⏱️ Expected Duration

- **Full seeding:** 2-5 minutes (due to large amount of test data)
- **Clear operation:** 30-60 seconds
- **Data volume:** ~1000+ records across all tables

## 🎯 Next Steps

After successful seeding:

1. **Test API endpoints** with the seeded data
2. **Verify user authentication** with test credentials
3. **Check database** in Vercel dashboard
4. **Test frontend integration** with backend
5. **Run comprehensive tests** on all features

---

**Backend URL:** `https://teamified-team-member-portal-backend-6wpzllchw.vercel.app`  
**Team:** `simon-4115s-projects`  
**Project:** `teamified-team-member-portal-backend`
