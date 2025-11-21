# Database Seeding Scripts

This directory contains database seeding scripts for different environments.

## 📋 Available Scripts

### 1. `seed-database-production.js` ✅ Production Safe

**Purpose:** Seeds minimal production-ready data only.

**What it includes:**
- ✅ **Countries** (3): India, Philippines, Australia
- ✅ **Currencies** (4): INR, PHP, AUD, USD
- ✅ **Tax Years** (3): Current year for each country
- ✅ **Salary Components** (7):
  - India: Basic Salary, HRA, Special Allowance
  - Philippines: Basic Salary, Allowances
  - Australia: Base Salary, Superannuation
- ✅ **Statutory Components** (7):
  - India: EPF (Employee Provident Fund), ESI (Employee State Insurance), Professional Tax
  - Philippines: SSS (Social Security System), PhilHealth, Pag-IBIG Fund
  - Australia: Superannuation Guarantee
- ✅ **Admin User** (1): `admin@teamified.com`

**What it DOES NOT include:**
- ❌ Test users
- ❌ Test clients
- ❌ Test employment records
- ❌ Test payslips, timesheets, or leave data

**Usage:**
```bash
npm run seed:prod
# OR
node scripts/seed-database-production.js
```

**Default Admin Credentials:**
- Email: `admin@teamified.com`
- Password: `Admin123!`
- ⚠️ **Change this password immediately after first login!**

---

### 2. `seed-database-development.js` ⚠️ Development Only

**Purpose:** Seeds comprehensive test data for development and testing.

**What it includes:**
- Everything from production seed PLUS:
- 25 test users with realistic Indian profiles
- 3 test clients (TechCorp, Global Enterprises, Innovation Labs)
- Employment records linking users to clients
- Salary history for all employment records
- 50+ timesheets with various statuses
- Leave requests and balances for all users
- Payslips and tax documents
- Complete audit trail data

**Usage:**
```bash
npm run seed:dev
# OR
node scripts/seed-database-development.js
```

**⚠️ WARNING:** DO NOT run this script in production! It contains fake test data.

---

### 3. `seed-database.js` (Legacy)

**Status:** Maintained for backward compatibility.

This is the original comprehensive seed script. It's equivalent to `seed-database-development.js`.

**Usage:**
```bash
npm run seed:db
# OR
node scripts/seed-database.js
```

---

## 🚀 Quick Start

### Local Development

```bash
# 1. Set up database schema
psql -U postgres -d teamified_portal -f init-db.sql

# 2. Seed development data
npm run seed:dev
```

### Production Deployment (Vercel)

```bash
# 1. Set up database schema (via Vercel dashboard or psql)
psql $POSTGRES_URL -f init-db.sql

# 2. Seed production data only
POSTGRES_URL="your-postgres-url" npm run seed:prod
```

---

## 🗂️ Data Structure

### Production Data

#### Countries
| Code | Name        | Currency | Tax Year Start |
|------|-------------|----------|----------------|
| IN   | India       | INR (₹)  | April (4)      |
| PH   | Philippines | PHP (₱)  | January (1)    |
| AU   | Australia   | AUD (A$) | July (7)       |

#### Salary Components (Examples)

**India:**
- Basic Salary
- House Rent Allowance (HRA)
- Conveyance Allowance
- Special Allowance

**Philippines:**
- Basic Salary
- Allowances
- 13th Month Pay

**Australia:**
- Base Salary
- Allowances

#### Statutory Components (Examples)

**India:**
- EPF (Employee & Employer) - 12% each
- ESI (Employee 0.75%, Employer 3.25%)
- Professional Tax (PT)
- Tax Deducted at Source (TDS)

**Philippines:**
- SSS (Employee 4.5%, Employer 9.5%)
- PhilHealth (Employee & Employer 2% each)
- Pag-IBIG (Employee & Employer 2% each)
- Withholding Tax (WHT)

**Australia:**
- Superannuation (Employer 11%)
- PAYG Withholding

---

## 🔄 Migration from Old Seed Script

If you were using `seed-database.js` before:

**For Production:**
```bash
# OLD (includes test data)
npm run seed:db

# NEW (production-safe)
npm run seed:prod
```

**For Development:**
```bash
# OLD
npm run seed:db

# NEW (same data, clearer naming)
npm run seed:dev
```

---

## 🛠️ Customization

### Adding a New Country

Edit `seed-database-production.js`:

1. Add currency to `this.seedData.currencies`
2. Add country to `this.seedData.countries`
3. Add region configurations
4. Add salary components
5. Add statutory components
6. Add exchange rate

### Modifying Statutory Rates

Update the relevant section in `generateStatutoryComponents()`:

```javascript
{
  id: this.generateId(),
  country_id: indiaCountry.id,
  component_name: 'Provident Fund (Employee)',
  component_code: 'EPF_EMPLOYEE',
  rate: 12.0,  // ← Change rate here
  // ...
}
```

---

## 📝 Notes

1. **Production seeding is idempotent:** Running it multiple times won't create duplicates (it doesn't clear existing data).
2. **Development seeding clears data:** The development script truncates tables before seeding.
3. **Password security:** Always change the default admin password after first login.
4. **Country-specific data:** All payroll configurations are based on current regulations as of 2025. Review and update as needed.

---

## 🐛 Troubleshooting

### Error: "relation does not exist"
**Solution:** Run `init-db.sql` first to create the database schema.

### Error: "duplicate key value violates unique constraint"
**Solution:** The database already has data. Either:
- Clear the database first (development only)
- Or skip seeding if data already exists

### Error: "connect ECONNREFUSED"
**Solution:** Check your database connection string in environment variables.

---

## 📚 Related Documentation

- [VERCEL_BACKEND_DEPLOYMENT_GUIDE.md](../VERCEL_BACKEND_DEPLOYMENT_GUIDE.md) - Full deployment guide
- [init-db.sql](../init-db.sql) - Database schema
- [setup-database.sh](./setup-database.sh) - Additional setup script

