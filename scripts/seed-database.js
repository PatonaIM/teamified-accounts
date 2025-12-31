#!/usr/bin/env node

/**
 * Consolidated Database Seeding Script for User Management System
 * 
 * This script populates the database with comprehensive test data including:
 * - 25+ users with realistic profile data in User.profile_data JSONB field
 * - Employment records linking users to multiple clients
 * - Salary history for employment records
 * - Various user roles and permissions (admin, timesheet_approver, eor, candidate)
 * - Emergency contacts and document references in profile data
 * - Payroll configuration data (Story 7.1, 7.2):
 *   * Countries (India, Philippines) with currencies and tax years
 *   * Payroll periods for multiple countries
 *   * Salary components (earnings, deductions, benefits, reimbursements)
 *   * Statutory components (EPF, ESI, PT, TDS, SSS, PhilHealth, Pag-IBIG)
 *   * Exchange rates for multi-currency support
 * 
 * Payroll Calculation Test Data (Story 7.3):
 * The seeded data enables testing of:
 * - Single employee payroll calculations (via API: POST /api/v1/payroll/calculations/calculate)
 * - Bulk payroll calculations (via API: POST /api/v1/payroll/calculations/bulk-calculate)
 * - India-specific calculations: EPF (12%), ESI (0.75%/3.25%), PT (slab-based), TDS (progressive brackets)
 * - Philippines-specific calculations: SSS (table-based), PhilHealth (4%), Pag-IBIG (1-2%), Tax (TRAIN Law)
 * - Performance optimization: Batch processing (50 employees/batch), caching (5-min TTL)
 * - Audit logging: All calculations logged to audit_logs table
 * 
 * Timesheet Management Test Data (Story 7.4):
 * - 50+ timesheets with various statuses (DRAFT, SUBMITTED, APPROVED, REJECTED)
 * - Timesheet types: REGULAR, OVERTIME, NIGHT_SHIFT
 * - Realistic hours distribution: regular (8h), overtime (1-4h), night shift (8h)
 * - Timesheet approvals with complete audit trail
 * - Country-specific rates: India (2x overtime), Philippines (125-200% overtime, 10% night shift)
 * - Links to payroll periods for payroll processing integration
 * 
 * Leave Management Test Data (Story 7.5):
 * - Leave balances for all users with country-specific leave types
 * - India: Annual, Sick, Casual, Maternity, Paternity, Compensatory Off
 * - Philippines: Vacation, Sick, Maternity, Paternity, Solo Parent, Special Leave for Women
 * - Australia: Annual, Sick/Carer's, Long Service, Parental, Compassionate
 * - 3-5 leave requests per user with mix of statuses (DRAFT, SUBMITTED, APPROVED, REJECTED)
 * - Leave approvals with audit trail for approved/rejected requests
 * - Realistic leave balances with 0-30% usage
 * - Integration with payroll periods for approved leave
 * 
 * Payroll Self-Service Test Data (Story 7.6):
 * - 3-6 payslips per employee for different payroll periods
 * - Realistic salary components: Basic, HRA, Conveyance, Special Allowance, Overtime, Night Shift
 * - Country-specific statutory deductions:
 *   * India: EPF (12%), ESI (0.75%/3.25%), PT (₹200), TDS (progressive)
 *   * Philippines: SSS (4.5%/9.5%), PhilHealth (2%/2%), Pag-IBIG (2%/2%)
 * - Payslip statuses: available, downloaded (with first_downloaded_at timestamp)
 * - PDF paths and generation timestamps for testing PDF download
 * - 1-3 tax documents per employee with different statuses:
 *   * Form 16, Form 26AS (India), BIR 2316 (Philippines), W-2, Tax Computation
 *   * Statuses: pending, approved, rejected (with review notes and approver tracking)
 *   * Realistic file metadata (size, checksum, version control)
 * 
 * Test Users for Payroll Calculations:
 * - user1@teamified.com (Admin - John Smith) - India, ₹60,000/month
 * - user2@teamified.com (HR - Sarah Johnson) - India, ₹55,000/month
 * - user3@teamified.com (Employee - Mike Davis) - India, ₹50,000/month
 * - user4@teamified.com (Employee - Emily Brown) - Philippines, ₱40,000/month
 * - user5@teamified.com (Employee - David Wilson) - Philippines, ₱35,000/month
 * 
 * Usage:
 *   node scripts/seed-database.js
 *   npm run seed:db
 *   yarn seed:db
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const argon2 = require('argon2');

// Database configuration - supports both local and Vercel environments
const dbConfig = process.env.POSTGRES_URL || process.env.DATABASE_URL 
  ? {
      connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'teamified_portal',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
    };

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class DatabaseSeeder {
  constructor() {
    this.pool = new Pool(dbConfig);
    this.seedData = {
      clients: [],
      users: [],
      employmentRecords: [],
      salaryHistory: [],
      userRoles: [],
      auditLog: [],
      migrationLog: [],
      currencies: [],
      countries: [],
      taxYears: [],
      regionConfigurations: [],
      exchangeRates: [],
      payrollPeriods: [],
      salaryComponents: [],
      statutoryComponents: [],
      timesheets: [],
      timesheetApprovals: [],
      leaveRequests: [],
      leaveApprovals: [],
      leaveBalances: [],
      payslips: [],
      taxDocuments: [],
      organizations: [],
      organizationMembers: [],
    };
    this.userCredentials = {};
  }

  async connect() {
    try {
      await this.pool.connect();
      console.log(`${colors.green}✓${colors.reset} Connected to database`);
    } catch (error) {
      console.error(`${colors.red}✗${colors.reset} Failed to connect to database:`, error.message);
      throw error;
    }
  }

  async clearExistingData() {
    console.log(`${colors.yellow}🗑️${colors.reset} Clearing existing data...`);
    
    const tables = [
      'audit_logs',
      'user_roles',
      'salary_history',
      'employment_records',
      'timesheet_approvals',
      'timesheets',
      'leave_approvals',
      'leave_requests',
      'leave_balances',
      'payroll_processing_logs',
      'payroll_periods',
      'region_configurations',
      'tax_years',
      'exchange_rates',
      'salary_components',
      'statutory_components',
      'countries',
      'currencies',
      'organization_members',
      'organizations',
      'clients',
      'users'
    ];

    try {
      for (const table of tables) {
        await this.pool.query(`TRUNCATE TABLE ${table} CASCADE`);
      }
      console.log(`${colors.green}✓${colors.reset} Cleared existing data`);
    } catch (error) {
      console.error(`${colors.red}✗${colors.reset} Failed to clear data:`, error.message);
      throw error;
    }
  }

  generateId() {
    return '650e8400-e29b-41d4-a716-' + Math.random().toString(16).substr(2, 12).padStart(12, '0');
  }

  generateClientId() {
    return '750e8400-e29b-41d4-a716-' + Math.random().toString(16).substr(2, 12).padStart(12, '0');
  }

  generateRoleId() {
    return '950e8400-e29b-41d4-a716-' + Math.random().toString(16).substr(2, 12).padStart(12, '0');
  }

  generateSalaryId() {
    return '850e8400-e29b-41d4-a716-' + Math.random().toString(16).substr(2, 12).padStart(12, '0');
  }

  generateEmploymentId() {
    return '550e8400-e29b-41d4-a716-' + Math.random().toString(16).substr(2, 12).padStart(12, '0');
  }

  generateProfileData(index) {
    const firstNames = ['Amit', 'Priya', 'Raj', 'Sneha', 'Vikram', 'Deepa', 'Rahul', 'Meera', 'Kiran', 'Anita'];
    const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Verma', 'Jain', 'Agarwal', 'Nair', 'Reddy'];
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'];
    const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Gujarat', 'Rajasthan', 'Punjab', 'Haryana'];
    const countries = ['IN', 'US', 'CA', 'AU', 'UK'];
    const departments = ['Engineering', 'Marketing', 'Sales', 'Finance', 'Operations', 'HR', 'Support'];
    const designations = ['Software Engineer', 'Senior Developer', 'Manager', 'Analyst', 'Consultant', 'Lead Developer', 'Architect'];
    const workModes = ['office', 'remote', 'hybrid'];
    const employmentTypes = ['full_time', 'part_time', 'contract', 'temporary'];
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const genders = ['male', 'female', 'other'];
    const maritalStatuses = ['single', 'married', 'divorced', 'widowed'];
    const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Bengali'];
    const timezones = ['IST', 'EST', 'PST', 'GMT', 'CST'];
    const bankNames = ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'];
    const ifscCodes = ['SBIN0001234', 'HDFC0005678', 'ICIC0009012', 'AXIS0003456', 'KKBK0007890', 'PNB0001234'];

    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[index % lastNames.length];
    const city = cities[index % cities.length];
    const state = states[index % states.length];
    const country = countries[index % countries.length];
    const department = departments[index % departments.length];
    const designation = designations[index % designations.length];
    const workMode = workModes[index % workModes.length];
    const employmentType = employmentTypes[index % employmentTypes.length];
    const bloodGroup = bloodGroups[index % bloodGroups.length];
    const gender = genders[index % genders.length];
    const maritalStatus = maritalStatuses[index % maritalStatuses.length];
    const language = languages[index % languages.length];
    const timezone = timezones[index % timezones.length];
    const bankName = bankNames[index % bankNames.length];
    const ifscCode = ifscCodes[index % ifscCodes.length];

    const dateOfBirth = new Date(1980 + (index % 20), index % 12, (index % 28) + 1);
    const joiningDate = new Date(2020 + (index % 4), index % 12, (index % 28) + 1);
    const postalCode = 100000 + (index * 1000) + (index % 1000);

    return {
      banking: {
        bankName: bankName,
        ifscCode: ifscCode,
        branchName: `${city} Branch`,
        accountType: index % 2 === 0 ? 'checking' : 'current',
        paymentMode: index % 3 === 0 ? 'bank_transfer' : 'check',
        accountNumber: Math.floor(Math.random() * 9000000000000000) + 1000000000000000
      },
      metadata: {
        version: '1.0',
        createdAt: new Date(2023, index % 12, (index % 28) + 1).toISOString(),
        lastUpdated: new Date().toISOString()
      },
      personal: {
        city: city,
        state: state,
        gender: gender,
        address: `${100 + index} Main St`,
        allergies: index % 4 === 0 ? ['Peanuts', 'Pollen'][index % 2] : '',
        bloodGroup: bloodGroup,
        postalCode: postalCode,
        countryCode: country,
        dateOfBirth: dateOfBirth.toISOString(),
        nationality: ['Indian', 'American', 'Canadian', 'British'][index % 4],
        phoneNumber: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        maritalStatus: maritalStatus,
        alternatePhone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        emergencyContact: {
          name: `${firstNames[(index + 1) % firstNames.length]} ${lastNames[(index + 1) % lastNames.length]}`,
          address: `${200 + index} Park Ave`,
          phoneNumber: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          relationship: ['Parent', 'Spouse', 'Friend', 'Sibling'][index % 4]
        },
        medicalConditions: index % 5 === 0 ? ['Diabetes', 'Hypertension', 'Asthma'][index % 3] : ''
      },
      documents: {
        resume: `resume_${index + 1}.pdf`,
        idProof: `id_proof_${index + 1}.pdf`,
        contract: `contract_${index + 1}.pdf`,
        bankProof: `bank_proof_${index + 1}.pdf`,
        offerLetter: `offer_${index + 1}.pdf`,
        addressProof: `address_proof_${index + 1}.pdf`,
        educationProof: `education_proof_${index + 1}.pdf`,
        otherDocuments: [],
        experienceProof: `experience_proof_${index + 1}.pdf`
      },
      employment: {
        workMode: workMode,
        department: department,
        employeeId: `EMP${String(index + 1).padStart(4, '0')}`,
        designation: designation,
        joiningDate: joiningDate.toISOString(),
        workLocation: workMode === 'remote' ? 'Remote' : city,
        employmentType: employmentType,
        reportingManager: `${firstNames[(index + 2) % firstNames.length]} ${lastNames[(index + 2) % lastNames.length]}`
      },
      onboarding: {
        status: index % 3 === 0 ? 'completed' : index % 3 === 1 ? 'in_progress' : 'pending',
        pendingSteps: index % 3 === 0 ? ['documents', 'preferences'] : 
                     index % 3 === 1 ? ['banking', 'documents', 'preferences'] : 
                     ['governmentIds', 'banking', 'documents', 'preferences'],
        completedSteps: index % 3 === 0 ? ['personal', 'governmentIds', 'banking'] : 
                       index % 3 === 1 ? ['personal', 'governmentIds'] : 
                       ['personal'],
        completionDate: index % 3 === 0 ? new Date(2024, index % 12, (index % 28) + 1).toISOString() : null
      },
      preferences: {
        timezone: timezone,
        privacySettings: {
          contactSharing: false,
          profileVisibility: 'team'
        },
        communicationLanguage: language,
        notificationPreferences: {
          sms: false,
          push: true,
          email: true
        }
      },
      governmentIds: {
        voterId: `${String.fromCharCode(65 + (index % 26))}${String.fromCharCode(65 + ((index + 1) % 26))}${String.fromCharCode(65 + ((index + 2) % 26))}${Math.floor(Math.random() * 9000000) + 1000000}`,
        panNumber: `${String.fromCharCode(65 + (index % 26))}${String.fromCharCode(65 + ((index + 1) % 26))}${String.fromCharCode(65 + ((index + 2) % 26))}${String.fromCharCode(65 + ((index + 3) % 26))}${String.fromCharCode(65 + ((index + 4) % 26))}${Math.floor(Math.random() * 9000) + 1000}${String.fromCharCode(65 + ((index + 5) % 26))}`,
        aadhaarNumber: Math.floor(Math.random() * 900000000000) + 100000000000,
        drivingLicense: `${String.fromCharCode(65 + (index % 26))}${String.fromCharCode(65 + ((index + 1) % 26))}${Math.floor(Math.random() * 900000000000000) + 100000000000000}`,
        passportNumber: `${String.fromCharCode(65 + (index % 26))}${String.fromCharCode(65 + ((index + 1) % 26))}${Math.floor(Math.random() * 9000000) + 1000000}`
      }
    };
  }

  async generateSeedData() {
    console.log(`${colors.yellow}📊${colors.reset} Generating seed data...`);

    // Generate clients
    this.seedData.clients = [
      {
        id: this.generateClientId(),
        name: 'TechCorp Solutions',
        description: 'Leading technology solutions provider',
        contact_info: {
          email: 'contact@techcorp.com',
          phone: '+91-9876543210',
          address: {
            street: '123 Tech Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            postal_code: '400001'
          }
        },
        status: 'active',
        is_active: true,
        migrated_from_zoho: false,
        zoho_client_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: this.generateClientId(),
        name: 'Global Enterprises',
        description: 'International business solutions',
        contact_info: {
          email: 'info@globalent.com',
          phone: '+91-9876543211',
          address: {
            street: '456 Business Ave',
            city: 'Delhi',
            state: 'Delhi',
            country: 'India',
            postal_code: '110001'
          }
        },
        status: 'active',
        is_active: true,
        migrated_from_zoho: false,
        zoho_client_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: this.generateClientId(),
        name: 'Innovation Labs',
        description: 'Cutting-edge research and development',
        contact_info: {
          email: 'hello@innovationlabs.com',
          phone: '+91-9876543212',
          address: {
            street: '789 Innovation Drive',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            postal_code: '560001'
          }
        },
        status: 'active',
        is_active: true,
        migrated_from_zoho: false,
        zoho_client_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Generate users with comprehensive profile data
    const defaultPassword = 'Admin123!';
    const hashedPassword = await argon2.hash(defaultPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
    });
    
    for (let i = 0; i < 25; i++) {
      const userId = this.generateId();
      const profileData = this.generateProfileData(i);
      
      this.seedData.users.push({
        id: userId,
        email: `user${i + 1}@teamified.com`,
        password_hash: hashedPassword,
        first_name: profileData.personal.gender === 'male' ? 
          ['Amit', 'Raj', 'Vikram', 'Rahul', 'Kiran'][i % 5] : 
          ['Priya', 'Sneha', 'Deepa', 'Meera', 'Anita'][i % 5],
        last_name: ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta'][i % 5],
        phone: profileData.personal.phoneNumber,
        address: {
          city: profileData.personal.city,
          state: profileData.personal.state,
          street: profileData.personal.address,
          country: profileData.personal.countryCode,
          postal_code: profileData.personal.postalCode
        },
        profile_data: profileData,
        status: 'active',
        is_active: true,
        email_verified: true,
        email_verification_token: null,
        email_verification_token_expiry: null,
        password_reset_token: null,
        migrated_from_zoho: false,
        zoho_user_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Store credentials for different user types
      if (i < 2) {
        this.userCredentials.admin = { email: `user${i + 1}@teamified.com`, password: defaultPassword };
      } else if (i < 3) {
        this.userCredentials.hr = { email: `user${i + 1}@teamified.com`, password: defaultPassword };
      } else if (i < 4) {
        this.userCredentials.account_manager = { email: `user${i + 1}@teamified.com`, password: defaultPassword };
      } else if (i < 5) {
        this.userCredentials.recruiter = { email: `user${i + 1}@teamified.com`, password: defaultPassword };
      } else if (i < 6) {
        this.userCredentials.hr_manager_client = { email: `user${i + 1}@teamified.com`, password: defaultPassword };
      } else if (i < 8) {
        this.userCredentials.eor = { email: `user${i + 1}@teamified.com`, password: defaultPassword };
      } else {
        this.userCredentials.candidate = { email: `user${i + 1}@teamified.com`, password: defaultPassword };
      }
    }

    // Generate user roles
    for (let i = 0; i < 25; i++) {
      const userId = this.seedData.users[i].id;
      let roleType;
      
      if (i < 2) roleType = 'admin';
      else if (i < 3) roleType = 'hr';
      else if (i < 4) roleType = 'account_manager';
      else if (i < 5) roleType = 'recruiter';
      else if (i < 6) roleType = 'hr_manager_client';
      else if (i < 8) roleType = 'eor';
      else roleType = 'candidate';

      this.seedData.userRoles.push({
        id: this.generateRoleId(),
        user_id: userId,
        role_type: roleType,
        scope: 'all',
        scope_entity_id: null,
        granted_by: this.seedData.users[0].id, // First user (admin) grants all roles
        expires_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Employment records generation moved after countries (see line ~740)
    // Salary history generation moved after employment records (see line ~770)

    // Generate payroll data
    await this.generatePayrollData();

    // Generate leave management data
    this.generateLeaveData();

    // Generate payslip and tax document data (Story 7.6)
    this.generatePayslipData();
    this.generateTaxDocumentData();

    // Generate organizations and members (F.R.I.E.N.D.S., Stark Industries, etc.)
    await this.generateOrganizationsData();

    console.log(`${colors.green}✓${colors.reset} Generated seed data`);
  }

  async generateOrganizationsData() {
    console.log(`${colors.yellow}🏢${colors.reset} Generating organizations and members...`);

    const defaultPassword = 'Admin123!';
    const hashedPassword = await argon2.hash(defaultPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    // F.R.I.E.N.D.S. Inc. organization
    const friendsOrgId = '650e8400-e29b-41d4-a716-ee934041b3e9';
    this.seedData.organizations.push({
      id: friendsOrgId,
      name: 'F.R.I.E.N.D.S. Inc.',
      slug: 'friends-inc',
      industry: 'Entertainment',
      company_size: '1-10',
      logo_url: null,
      settings: JSON.stringify({}),
      subscription_tier: 'professional',
      subscription_status: 'active',
      website: 'https://friends.example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    });

    // Stark Industries organization  
    const starkOrgId = '650e8400-e29b-41d4-a716-ee934041b3e8';
    this.seedData.organizations.push({
      id: starkOrgId,
      name: 'Stark Industries',
      slug: 'stark-industries',
      industry: 'Technology',
      company_size: '201-500',
      logo_url: null,
      settings: JSON.stringify({}),
      subscription_tier: 'enterprise',
      subscription_status: 'active',
      website: 'https://starkindustries.example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    });

    // F.R.I.E.N.D.S. members
    const friendsMembers = [
      { id: '650e8400-e29b-41d4-a716-ccfb89d578ef', email: 'monica.geller@friends.com', firstName: 'Monica', lastName: 'Geller', roles: ['client_admin', 'client_employee'] },
      { id: '650e8400-e29b-41d4-a716-84c3495377d7', email: 'joey.tribbiani@friends.com', firstName: 'Joey', lastName: 'Tribbiani', roles: ['client_employee', 'client_finance'] },
      { id: '650e8400-e29b-41d4-a716-ef6d8d708e90', email: 'phoebe.buffay@friends.com', firstName: 'Phoebe', lastName: 'Buffay', roles: ['client_employee', 'client_recruiter'] },
      { id: '650e8400-e29b-41d4-a716-b57c09c868b5', email: 'ross.geller@friends.com', firstName: 'Ross', lastName: 'Geller', roles: ['client_admin'] },
      { id: '650e8400-e29b-41d4-a716-5936915fcac6', email: 'rachel.green@friends.com', firstName: 'Rachel', lastName: 'Green', roles: ['client_hr', 'client_employee'] },
      { id: '650e8400-e29b-41d4-a716-c0eef7ba3230', email: 'chandler.bing@friends.com', firstName: 'Chandler', lastName: 'Bing', roles: ['client_employee', 'client_hr'] }
    ];

    for (const member of friendsMembers) {
      // Add user
      this.seedData.users.push({
        id: member.id,
        email: member.email,
        password_hash: hashedPassword,
        first_name: member.firstName,
        last_name: member.lastName,
        phone: '+1-555-' + Math.floor(1000000 + Math.random() * 9000000),
        address: JSON.stringify({ city: 'New York', state: 'NY', country: 'US' }),
        profile_data: JSON.stringify({ employment: { department: 'Central Perk' } }),
        status: 'active',
        is_active: true,
        email_verified: true,
        email_verification_token: null,
        email_verification_token_expiry: null,
        password_reset_token: null,
        migrated_from_zoho: false,
        zoho_user_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Add organization membership
      this.seedData.organizationMembers.push({
        id: this.generateId(),
        organization_id: friendsOrgId,
        user_id: member.id,
        status: 'active',
        joined_at: new Date().toISOString(),
        invited_by: friendsMembers[0].id, // Monica invited everyone
        created_at: new Date().toISOString()
      });

      // Add user roles
      for (const roleType of member.roles) {
        this.seedData.userRoles.push({
          id: this.generateRoleId(),
          user_id: member.id,
          role_type: roleType,
          scope: 'organization',
          scope_entity_id: friendsOrgId,
          granted_by: this.seedData.users[0]?.id || member.id,
          expires_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }

    // Stark Industries members
    const starkMembers = [
      { id: '650e8400-e29b-41d4-a716-aaa111111111', email: 'tony.stark@starkindustries.com', firstName: 'Tony', lastName: 'Stark', roles: ['client_admin'] },
      { id: '650e8400-e29b-41d4-a716-11d190fecb57', email: 'natasha.romanoff@starkindustries.com', firstName: 'Natasha', lastName: 'Romanoff', roles: ['client_hr'] },
      { id: '650e8400-e29b-41d4-a716-0ef557c0be77', email: 'bruce.banner@starkindustries.com', firstName: 'Bruce', lastName: 'Banner', roles: ['client_employee'] },
      { id: '650e8400-e29b-41d4-a716-0578998d9203', email: 'thor.odinson@starkindustries.com', firstName: 'Thor', lastName: 'Odinson', roles: ['client_employee'] },
      { id: '650e8400-e29b-41d4-a716-f0a561ff0092', email: 'clint.barton@starkindustries.com', firstName: 'Clint', lastName: 'Barton', roles: ['client_employee'] },
      { id: '650e8400-e29b-41d4-a716-d1aaeb6ce802', email: 'wanda.maximoff@starkindustries.com', firstName: 'Wanda', lastName: 'Maximoff', roles: ['client_employee'] }
    ];

    for (const member of starkMembers) {
      // Add user
      this.seedData.users.push({
        id: member.id,
        email: member.email,
        password_hash: hashedPassword,
        first_name: member.firstName,
        last_name: member.lastName,
        phone: '+1-555-' + Math.floor(1000000 + Math.random() * 9000000),
        address: JSON.stringify({ city: 'Los Angeles', state: 'CA', country: 'US' }),
        profile_data: JSON.stringify({ employment: { department: 'Avengers Initiative' } }),
        status: 'active',
        is_active: true,
        email_verified: true,
        email_verification_token: null,
        email_verification_token_expiry: null,
        password_reset_token: null,
        migrated_from_zoho: false,
        zoho_user_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Add organization membership
      this.seedData.organizationMembers.push({
        id: this.generateId(),
        organization_id: starkOrgId,
        user_id: member.id,
        status: 'active',
        joined_at: new Date().toISOString(),
        invited_by: starkMembers[0].id, // Tony invited everyone
        created_at: new Date().toISOString()
      });

      // Add user roles
      for (const roleType of member.roles) {
        this.seedData.userRoles.push({
          id: this.generateRoleId(),
          user_id: member.id,
          role_type: roleType,
          scope: 'organization',
          scope_entity_id: starkOrgId,
          granted_by: this.seedData.users[0]?.id || member.id,
          expires_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }

    console.log(`${colors.green}✓${colors.reset} Generated ${this.seedData.organizations.length} organizations with ${this.seedData.organizationMembers.length} members`);
  }

  async generatePayrollData() {
    // Generate currencies
    this.seedData.currencies = [
      {
        id: this.generateId(),
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹',
        decimal_places: 2,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: this.generateId(),
        code: 'PHP',
        name: 'Philippine Peso',
        symbol: '₱',
        decimal_places: 2,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: this.generateId(),
        code: 'AUD',
        name: 'Australian Dollar',
        symbol: 'A$',
        decimal_places: 2,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: this.generateId(),
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        decimal_places: 2,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: this.generateId(),
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        decimal_places: 2,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Generate countries
    const inrCurrency = this.seedData.currencies.find(c => c.code === 'INR');
    const phpCurrency = this.seedData.currencies.find(c => c.code === 'PHP');
    const audCurrency = this.seedData.currencies.find(c => c.code === 'AUD');

    this.seedData.countries = [
      {
        id: this.generateId(),
        code: 'IN',
        name: 'India',
        currency_id: inrCurrency.id,
        currency_code: 'INR', // Add currency code for payslip generation
        tax_year_start_month: 4, // April
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: this.generateId(),
        code: 'PH',
        name: 'Philippines',
        currency_id: phpCurrency.id,
        currency_code: 'PHP', // Add currency code for payslip generation
        tax_year_start_month: 1, // January
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: this.generateId(),
        code: 'AU',
        name: 'Australia',
        currency_id: audCurrency.id,
        currency_code: 'AUD', // Add currency code for payslip generation
        tax_year_start_month: 7, // July
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Generate tax years
    const currentYear = new Date().getFullYear();
    
    for (const country of this.seedData.countries) {
      const taxYearStartMonth = country.tax_year_start_month;
      
      // Format dates as YYYY-MM-DD strings to avoid timezone issues
      const startMonth = taxYearStartMonth.toString().padStart(2, '0');
      const startDate = `${currentYear}-${startMonth}-01`;
      
      // Calculate end date (day before next tax year starts)
      // For January start (PH), end date is in same year; otherwise next year
      const endYear = taxYearStartMonth === 1 ? currentYear : currentYear + 1;
      const endMonth = taxYearStartMonth === 1 ? 12 : taxYearStartMonth - 1;
      
      // Get last day of the end month
      const daysInEndMonth = new Date(endYear, endMonth, 0).getDate();
      const endDate = `${endYear}-${endMonth.toString().padStart(2, '0')}-${daysInEndMonth.toString().padStart(2, '0')}`;
      
      this.seedData.taxYears.push({
        id: this.generateId(),
        country_id: country.id,
        year: currentYear,
        start_date: startDate,
        end_date: endDate,
        is_current: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Generate region configurations
    const indiaCountry = this.seedData.countries.find(c => c.code === 'IN');
    const philippinesCountry = this.seedData.countries.find(c => c.code === 'PH');
    const australiaCountry = this.seedData.countries.find(c => c.code === 'AU');

    this.seedData.regionConfigurations = [
      // India configurations
      {
        id: this.generateId(),
        country_id: indiaCountry.id,
        config_key: 'pf_rate',
        config_value: { employer: 12, employee: 12 },
        description: 'Provident Fund contribution rates',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: this.generateId(),
        country_id: indiaCountry.id,
        config_key: 'esi_rate',
        config_value: { employer: 3.25, employee: 0.75, threshold: 21000 },
        description: 'ESI contribution rates and threshold',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      // Philippines configurations
      {
        id: this.generateId(),
        country_id: philippinesCountry.id,
        config_key: 'sss_rates',
        config_value: { employer: 8.5, employee: 4.5 },
        description: 'SSS contribution rates',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: this.generateId(),
        country_id: philippinesCountry.id,
        config_key: 'philhealth_rate',
        config_value: { rate: 4.0 },
        description: 'PhilHealth contribution rate',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      // Australia configurations
      {
        id: this.generateId(),
        country_id: australiaCountry.id,
        config_key: 'superannuation_rate',
        config_value: { rate: 11.0 },
        description: 'Superannuation guarantee rate',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Generate employment records
    // Moved here from earlier in the script to ensure countries exist first
    // Assign countries: First 10 → India, Next 10 → Philippines, Last 5 → India
    for (let i = 0; i < 25; i++) {
      const clientId = this.seedData.clients[i % this.seedData.clients.length].id;
      const userId = this.seedData.users[i].id;
      const startDate = new Date(2020 + (i % 4), i % 12, (i % 28) + 1);
      const endDate = i % 3 === 0 ? null : new Date(startDate.getTime() + (365 * 24 * 60 * 60 * 1000 * (1 + Math.random() * 2)));

      // Assign country: First 10 India, Next 10 Philippines, Remaining 5 India
      const countryId = i < 10 ? indiaCountry.id : (i < 20 ? philippinesCountry.id : indiaCountry.id);

      this.seedData.employmentRecords.push({
        id: this.generateEmploymentId(),
        user_id: userId,
        client_id: clientId,
        country_id: countryId,
        role: this.seedData.users[i].profile_data.employment.designation,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate ? endDate.toISOString().split('T')[0] : null,
        status: endDate ? 'inactive' : 'active',
        migrated_from_zoho: false,
        zoho_employment_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Generate salary history
    // Moved here from earlier to ensure employment records exist first
    for (let i = 0; i < 25; i++) {
      const employmentRecord = this.seedData.employmentRecords[i];
      const baseSalary = 50000 + (i * 2000) + Math.floor(Math.random() * 10000);
      const startDate = new Date(employmentRecord.start_date);
      
      // Generate 3-5 salary records per employment
      const numRecords = 3 + Math.floor(Math.random() * 3);
      const usedDates = new Set();
      
      for (let j = 0; j < numRecords; j++) {
        let effectiveDate;
        let attempts = 0;
        
        // Ensure unique effective dates
        do {
          const monthsAgo = Math.floor(Math.random() * 12);
          effectiveDate = new Date(startDate.getTime() + (monthsAgo * 30 * 24 * 60 * 60 * 1000));
          attempts++;
        } while (usedDates.has(effectiveDate.toISOString().split('T')[0]) && attempts < 10);
        
        usedDates.add(effectiveDate.toISOString().split('T')[0]);
        
        const salary = baseSalary + (j * 5000) + Math.floor(Math.random() * 5000);
        const isScheduled = effectiveDate > new Date();
        
        this.seedData.salaryHistory.push({
          id: this.generateSalaryId(),
          employment_record_id: employmentRecord.id,
          salary_amount: salary,
          salary_currency: 'USD',
          effective_date: effectiveDate.toISOString().split('T')[0],
          change_reason: ['Annual Review', 'Promotion', 'Market Adjustment', 'Performance Bonus'][j % 4],
          changed_by: this.seedData.users[0].id, // Admin user changes all salaries
          migrated_from_zoho: false,
          zoho_salary_id: null,
          created_at: new Date().toISOString()
        });
      }
    }

    // Generate exchange rates
    const usdCurrency = this.seedData.currencies.find(c => c.code === 'USD');
    const today = new Date().toISOString();

    this.seedData.exchangeRates = [
      // INR to USD
      {
        id: this.generateId(),
        from_currency_id: inrCurrency.id,
        to_currency_id: usdCurrency.id,
        rate: 0.012,
        effective_date: today,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      // USD to INR
      {
        id: this.generateId(),
        from_currency_id: usdCurrency.id,
        to_currency_id: inrCurrency.id,
        rate: 83.5,
        effective_date: today,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      // PHP to USD
      {
        id: this.generateId(),
        from_currency_id: phpCurrency.id,
        to_currency_id: usdCurrency.id,
        rate: 0.018,
        effective_date: today,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      // USD to PHP
      {
        id: this.generateId(),
        from_currency_id: usdCurrency.id,
        to_currency_id: phpCurrency.id,
        rate: 56.0,
        effective_date: today,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      // AUD to USD
      {
        id: this.generateId(),
        from_currency_id: audCurrency.id,
        to_currency_id: usdCurrency.id,
        rate: 0.65,
        effective_date: today,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      // USD to AUD
      {
        id: this.generateId(),
        from_currency_id: usdCurrency.id,
        to_currency_id: audCurrency.id,
        rate: 1.54,
        effective_date: today,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Generate payroll periods
    const currentMonth = new Date().getMonth();
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0);
    const payDate = new Date(currentYear, currentMonth + 1, 5);

    for (const country of this.seedData.countries) {
      this.seedData.payrollPeriods.push({
        id: this.generateId(),
        country_id: country.id,
        period_name: `${currentMonthStart.toLocaleString('default', { month: 'long' })} ${currentYear}`,
        start_date: currentMonthStart.toISOString(),
        end_date: currentMonthEnd.toISOString(),
        pay_date: payDate.toISOString(),
        status: 'open',
        total_employees: 0,
        total_amount: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Generate salary components
    this.generateSalaryComponents();

    // Generate statutory components
    this.generateStatutoryComponents();
  }

  generateSalaryComponents() {
    const indiaCountrySalary = this.seedData.countries.find(c => c.code === 'IN');
    const philippinesCountrySalary = this.seedData.countries.find(c => c.code === 'PH');
    const australiaCountrySalary = this.seedData.countries.find(c => c.code === 'AU');

    // India salary components
    if (indiaCountrySalary) {
      this.seedData.salaryComponents.push(
        {
          id: this.generateId(),
          country_id: indiaCountrySalary.id,
          component_name: 'Basic Salary',
          component_code: 'BASIC',
          component_type: 'earnings',
          calculation_type: 'fixed_amount',
          calculation_value: 50000,
          calculation_formula: null,
          is_taxable: true,
          is_statutory: false,
          is_mandatory: true,
          display_order: 1,
          description: 'Basic salary component',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: indiaCountrySalary.id,
          component_name: 'House Rent Allowance',
          component_code: 'HRA',
          component_type: 'earnings',
          calculation_type: 'percentage_of_basic',
          calculation_value: 40,
          calculation_formula: null,
          is_taxable: true,
          is_statutory: false,
          is_mandatory: false,
          display_order: 2,
          description: 'House rent allowance',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: indiaCountrySalary.id,
          component_name: 'Transport Allowance',
          component_code: 'TA',
          component_type: 'earnings',
          calculation_type: 'fixed_amount',
          calculation_value: 2000,
          calculation_formula: null,
          is_taxable: true,
          is_statutory: false,
          is_mandatory: false,
          display_order: 3,
          description: 'Transport allowance',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: indiaCountrySalary.id,
          component_name: 'Medical Allowance',
          component_code: 'MA',
          component_type: 'earnings',
          calculation_type: 'fixed_amount',
          calculation_value: 1500,
          calculation_formula: null,
          is_taxable: true,
          is_statutory: false,
          is_mandatory: false,
          display_order: 4,
          description: 'Medical allowance',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: indiaCountrySalary.id,
          component_name: 'Professional Tax',
          component_code: 'PT',
          component_type: 'deductions',
          calculation_type: 'fixed_amount',
          calculation_value: 200,
          calculation_formula: null,
          is_taxable: false,
          is_statutory: true,
          is_mandatory: true,
          display_order: 5,
          description: 'Professional tax deduction',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );
    }

    // Philippines salary components
    if (philippinesCountrySalary) {
      this.seedData.salaryComponents.push(
        {
          id: this.generateId(),
          country_id: philippinesCountrySalary.id,
          component_name: 'Basic Salary',
          component_code: 'BASIC',
          component_type: 'earnings',
          calculation_type: 'fixed_amount',
          calculation_value: 25000,
          calculation_formula: null,
          is_taxable: true,
          is_statutory: false,
          is_mandatory: true,
          display_order: 1,
          description: 'Basic salary component',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: philippinesCountrySalary.id,
          component_name: 'Overtime Pay',
          component_code: 'OT',
          component_type: 'earnings',
          calculation_type: 'formula',
          calculation_value: null,
          calculation_formula: 'BASIC * 1.25 * OVERTIME_HOURS',
          is_taxable: true,
          is_statutory: false,
          is_mandatory: false,
          display_order: 2,
          description: 'Overtime pay calculation',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: philippinesCountrySalary.id,
          component_name: 'Night Differential',
          component_code: 'ND',
          component_type: 'earnings',
          calculation_type: 'percentage_of_basic',
          calculation_value: 10,
          calculation_formula: null,
          is_taxable: true,
          is_statutory: false,
          is_mandatory: false,
          display_order: 3,
          description: 'Night differential pay',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );
    }

    // Australia salary components
    if (australiaCountrySalary) {
      this.seedData.salaryComponents.push(
        {
          id: this.generateId(),
          country_id: australiaCountrySalary.id,
          component_name: 'Base Salary',
          component_code: 'BASE',
          component_type: 'earnings',
          calculation_type: 'fixed_amount',
          calculation_value: 80000,
          calculation_formula: null,
          is_taxable: true,
          is_statutory: false,
          is_mandatory: true,
          display_order: 1,
          description: 'Base salary component',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: australiaCountrySalary.id,
          component_name: 'Superannuation',
          component_code: 'SUPER',
          component_type: 'deductions',
          calculation_type: 'percentage_of_gross',
          calculation_value: 11,
          calculation_formula: null,
          is_taxable: false,
          is_statutory: true,
          is_mandatory: true,
          display_order: 2,
          description: 'Superannuation guarantee',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );
    }
  }

  generateStatutoryComponents() {
    const indiaCountryStatutory = this.seedData.countries.find(c => c.code === 'IN');
    const philippinesCountryStatutory = this.seedData.countries.find(c => c.code === 'PH');
    const australiaCountryStatutory = this.seedData.countries.find(c => c.code === 'AU');

    // India statutory components
    if (indiaCountryStatutory) {
      this.seedData.statutoryComponents.push(
        {
          id: this.generateId(),
          country_id: indiaCountryStatutory.id,
          component_name: 'Employee Provident Fund',
          component_code: 'EPF',
          component_type: 'epf',
          contribution_type: 'both',
          calculation_basis: 'basic_salary',
          employee_percentage: 12.0,
          employer_percentage: 12.0,
          minimum_amount: 100,
          maximum_amount: 1800,
          wage_ceiling: 15000,
          wage_floor: 1000,
          effective_from: '2024-01-01',
          effective_to: null,
          is_mandatory: true,
          display_order: 1,
          description: 'Employee Provident Fund contribution',
          regulatory_reference: 'EPF Act 1952',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: indiaCountryStatutory.id,
          component_name: 'Employee State Insurance',
          component_code: 'ESI',
          component_type: 'esi',
          contribution_type: 'both',
          calculation_basis: 'gross_salary',
          employee_percentage: 0.75,
          employer_percentage: 3.25,
          minimum_amount: 0,
          maximum_amount: null,
          wage_ceiling: 21000,
          wage_floor: 0,
          effective_from: '2024-01-01',
          effective_to: null,
          is_mandatory: true,
          display_order: 2,
          description: 'Employee State Insurance contribution',
          regulatory_reference: 'ESI Act 1948',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: indiaCountryStatutory.id,
          component_name: 'Professional Tax',
          component_code: 'PT',
          component_type: 'pt',
          contribution_type: 'employee',
          calculation_basis: 'fixed_amount',
          employee_percentage: 100, // Fixed amount, percentage not actually used
          employer_percentage: null, // Must be null for 'employee' type
          minimum_amount: 200,
          maximum_amount: 200,
          wage_ceiling: null,
          wage_floor: null,
          effective_from: '2024-01-01',
          effective_to: null,
          is_mandatory: true,
          display_order: 3,
          description: 'Professional tax deduction',
          regulatory_reference: 'State Professional Tax Acts',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );
    }

    // Philippines statutory components
    if (philippinesCountryStatutory) {
      this.seedData.statutoryComponents.push(
        {
          id: this.generateId(),
          country_id: philippinesCountryStatutory.id,
          component_name: 'Social Security System',
          component_code: 'SSS',
          component_type: 'sss',
          contribution_type: 'both',
          calculation_basis: 'capped_amount',
          employee_percentage: 11.0,
          employer_percentage: 8.5,
          minimum_amount: 100,
          maximum_amount: 2400,
          wage_ceiling: 20000,
          wage_floor: 1000,
          effective_from: '2024-01-01',
          effective_to: null,
          is_mandatory: true,
          display_order: 1,
          description: 'Social Security System contribution',
          regulatory_reference: 'SSS Act of 2018',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: philippinesCountryStatutory.id,
          component_name: 'PhilHealth',
          component_code: 'PHILHEALTH',
          component_type: 'philhealth',
          contribution_type: 'both',
          calculation_basis: 'gross_salary',
          employee_percentage: 2.75,
          employer_percentage: 2.75,
          minimum_amount: 200,
          maximum_amount: 2000,
          wage_ceiling: 80000,
          wage_floor: 10000,
          effective_from: '2024-01-01',
          effective_to: null,
          is_mandatory: true,
          display_order: 2,
          description: 'PhilHealth contribution',
          regulatory_reference: 'Universal Health Care Act',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: philippinesCountryStatutory.id,
          component_name: 'Pag-IBIG Fund',
          component_code: 'PAGIBIG',
          component_type: 'pagibig',
          contribution_type: 'both',
          calculation_basis: 'gross_salary',
          employee_percentage: 2.0,
          employer_percentage: 2.0,
          minimum_amount: 100,
          maximum_amount: 1000,
          wage_ceiling: 5000,
          wage_floor: 1000,
          effective_from: '2024-01-01',
          effective_to: null,
          is_mandatory: true,
          display_order: 3,
          description: 'Pag-IBIG Fund contribution',
          regulatory_reference: 'Pag-IBIG Fund Law',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );
    }

    // Australia statutory components
    if (australiaCountryStatutory) {
      this.seedData.statutoryComponents.push(
        {
          id: this.generateId(),
          country_id: australiaCountryStatutory.id,
          component_name: 'Superannuation Guarantee',
          component_code: 'SUPER',
          component_type: 'superannuation',
          contribution_type: 'employer',
          calculation_basis: 'gross_salary',
          employee_percentage: null,
          employer_percentage: 11.0,
          minimum_amount: 0,
          maximum_amount: null,
          wage_ceiling: null,
          wage_floor: 450,
          effective_from: '2024-01-01',
          effective_to: null,
          is_mandatory: true,
          display_order: 1,
          description: 'Superannuation guarantee contribution',
          regulatory_reference: 'Superannuation Guarantee (Administration) Act 1992',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );
    }

    // Generate timesheets (Story 7.4)
    console.log(`${colors.cyan}📝${colors.reset} Generating timesheet data...`);
    
    const indiaCountryTimesheet = this.seedData.countries.find(c => c.code === 'IN');
    const philippinesCountryTimesheet = this.seedData.countries.find(c => c.code === 'PH');
    
    // Get current payroll period for timesheets
    const currentPayrollPeriodIndia = this.seedData.payrollPeriods.find(
      p => p.country_id === indiaCountryTimesheet?.id && p.status === 'open'
    );
    const currentPayrollPeriodPH = this.seedData.payrollPeriods.find(
      p => p.country_id === philippinesCountryTimesheet?.id && p.status === 'open'
    );

    // Create sample timesheets for employees with various statuses
    const timesheetStatuses = ['draft', 'submitted', 'approved', 'rejected'];
    const timesheetTypes = ['daily', 'weekly'];
    
    // Get admin/manager users for approvals
    const adminUser = this.seedData.users.find(u => u.email === 'user1@teamified.com');
    const hrUser = this.seedData.users.find(u => u.email === 'user2@teamified.com');
    
    // Generate timesheets for each employee
    for (const empRecord of this.seedData.employmentRecords) {
      const user = this.seedData.users.find(u => u.id === empRecord.user_id);
      if (!user) continue;
      
      // Determine country and payroll period
      const isIndianEmployee = user.email.includes('user1') || user.email.includes('user2') || user.email.includes('user3');
      const payrollPeriod = isIndianEmployee ? currentPayrollPeriodIndia : currentPayrollPeriodPH;
      
      if (!payrollPeriod) continue;
      
      // Create 5-10 timesheet entries for the month
      const numEntries = 5 + Math.floor(Math.random() * 6);
      const periodStart = new Date(payrollPeriod.start_date);
      const periodEnd = new Date(payrollPeriod.end_date);
      
      for (let i = 0; i < numEntries; i++) {
        const workDate = new Date(
          periodStart.getTime() + 
          Math.random() * (periodEnd.getTime() - periodStart.getTime())
        );
        
        // Vary the timesheet status
        const status = timesheetStatuses[Math.floor(Math.random() * timesheetStatuses.length)];
        const timesheetType = timesheetTypes[Math.floor(Math.random() * timesheetTypes.length)];
        
        // Generate realistic hours based on type (max 24 per field due to DB constraint)
        let regularHours = 8;
        let overtimeHours = 0;
        let doubleOvertimeHours = 0;
        let nightShiftHours = 0;
        
        // All timesheets use daily hours (0-24 per field)
        regularHours = 7 + Math.floor(Math.random() * 2); // 7-8 hours
        if (Math.random() > 0.7) {
          // Some days have overtime
          overtimeHours = 1 + Math.floor(Math.random() * 4); // 1-4 hours
        }
        if (Math.random() > 0.9) {
          // Rarely, night shift hours
          nightShiftHours = 2 + Math.floor(Math.random() * 4); // 2-5 hours
        }
        
        const totalHours = regularHours + overtimeHours + doubleOvertimeHours + nightShiftHours;
        
        const timesheetId = this.generateId();
        const now = new Date().toISOString();
        
        this.seedData.timesheets.push({
          id: timesheetId,
          user_id: user.id,
          employment_record_id: empRecord.id,
          payroll_period_id: payrollPeriod.id,
          timesheet_type: timesheetType,
          work_date: workDate.toISOString().split('T')[0],
          regular_hours: regularHours,
          overtime_hours: overtimeHours,
          double_overtime_hours: doubleOvertimeHours,
          night_shift_hours: nightShiftHours,
          total_hours: totalHours,
          status: status,
          notes: status === 'rejected' ? 'Incorrect hours reported' : (Math.random() > 0.5 ? 'Regular workday' : null),
          submitted_at: status !== 'draft' ? new Date(workDate.getTime() + 86400000).toISOString() : null, // Next day
          approved_at: status === 'approved' ? new Date(workDate.getTime() + 172800000).toISOString() : null, // 2 days later
          approved_by_id: status === 'approved' ? (Math.random() > 0.5 ? adminUser?.id : hrUser?.id) : null,
          rejected_at: status === 'rejected' ? new Date(workDate.getTime() + 172800000).toISOString() : null,
          rejected_by_id: status === 'rejected' ? hrUser?.id : null,
          rejection_reason: status === 'rejected' ? 'Hours do not match project records' : null,
          payroll_processed: status === 'approved' && Math.random() > 0.3,
          payroll_processed_at: status === 'approved' && Math.random() > 0.3 ? new Date(workDate.getTime() + 259200000).toISOString() : null,
          calculation_metadata: status === 'approved' ? JSON.stringify({
            country_code: isIndianEmployee ? 'IN' : 'PH',
            hourly_rate: isIndianEmployee ? 312.5 : 187.5,
            overtime_rate: isIndianEmployee ? 625 : 234.375,
            night_shift_rate: isIndianEmployee ? 312.5 : 206.25
          }) : null,
          created_at: new Date(workDate.getTime() - 86400000).toISOString(), // Day before work date
          updated_at: now
        });
        
        // Create approval records for submitted/approved/rejected timesheets
        if (status !== 'draft') {
          const reviewerId = status === 'rejected' ? hrUser?.id : (Math.random() > 0.5 ? adminUser?.id : hrUser?.id);
          const action = status === 'approved' ? 'approved' : (status === 'rejected' ? 'rejected' : 'submitted');
          
          this.seedData.timesheetApprovals.push({
            id: this.generateId(),
            timesheet_id: timesheetId,
            reviewer_id: action === 'submitted' ? user.id : reviewerId,
            action: action,
            action_date: new Date(workDate.getTime() + (action === 'submitted' ? 86400000 : 172800000)).toISOString(),
            comments: action === 'rejected' ? 'Please verify hours with project manager' : (action === 'approved' ? 'Approved' : 'Submitted for approval'),
            previous_status: action === 'submitted' ? 'draft' : 'submitted',
            new_status: status,
            metadata: JSON.stringify({
              reviewer_role: reviewerId === adminUser?.id ? 'Admin' : 'HR',
              reviewed_at: new Date().toISOString()
            }),
            created_at: now,
            updated_at: now
          });
        }
      }
    }
    
    console.log(`${colors.green}✓${colors.reset} Generated ${this.seedData.timesheets.length} timesheets with ${this.seedData.timesheetApprovals.length} approval records`);
  }

  generateLeaveData() {
    console.log(`${colors.yellow}🏖️${colors.reset} Generating leave management data...`);

    const now = new Date().toISOString();
    const currentYear = new Date().getFullYear();
    const indiaCode = 'IN';
    const philippinesCode = 'PH';
    const australiaCode = 'AU';

    // Leave type mapping
    const leaveTypesByCountry = {
      'IN': ['ANNUAL_LEAVE_IN', 'SICK_LEAVE_IN', 'CASUAL_LEAVE_IN', 'MATERNITY_LEAVE_IN', 'PATERNITY_LEAVE_IN', 'COMPENSATORY_OFF_IN'],
      'PH': ['VACATION_LEAVE_PH', 'SICK_LEAVE_PH', 'MATERNITY_LEAVE_PH', 'PATERNITY_LEAVE_PH', 'SOLO_PARENT_LEAVE_PH', 'SPECIAL_LEAVE_WOMEN_PH'],
      'AU': ['ANNUAL_LEAVE_AU', 'SICK_CARERS_LEAVE_AU', 'LONG_SERVICE_LEAVE_AU', 'PARENTAL_LEAVE_AU', 'COMPASSIONATE_LEAVE_AU']
    };

    // Default leave balances by type
    const defaultBalances = {
      'ANNUAL_LEAVE_IN': 21, 'SICK_LEAVE_IN': 12, 'CASUAL_LEAVE_IN': 12, 'MATERNITY_LEAVE_IN': 182, 'PATERNITY_LEAVE_IN': 14, 'COMPENSATORY_OFF_IN': 0,
      'VACATION_LEAVE_PH': 5, 'SICK_LEAVE_PH': 5, 'MATERNITY_LEAVE_PH': 105, 'PATERNITY_LEAVE_PH': 7, 'SOLO_PARENT_LEAVE_PH': 7, 'SPECIAL_LEAVE_WOMEN_PH': 2,
      'ANNUAL_LEAVE_AU': 20, 'SICK_CARERS_LEAVE_AU': 10, 'LONG_SERVICE_LEAVE_AU': 0, 'PARENTAL_LEAVE_AU': 0, 'COMPASSIONATE_LEAVE_AU': 2
    };

    // Get users with employment records
    const usersWithEmployment = this.seedData.users.filter(u => 
      this.seedData.employmentRecords.some(er => er.user_id === u.id)
    );

    // Generate leave balances for each user
    usersWithEmployment.forEach(user => {
      const employmentRecord = this.seedData.employmentRecords.find(er => er.user_id === user.id);
      if (!employmentRecord) return;

      // Determine country from employment record
      let countryCode = indiaCode;
      if (employmentRecord.employment_country === 'Philippines') countryCode = philippinesCode;
      if (employmentRecord.employment_country === 'Australia') countryCode = australiaCode;

      const leaveTypes = leaveTypesByCountry[countryCode] || [];

      leaveTypes.forEach(leaveType => {
        const totalDays = defaultBalances[leaveType] || 0;
        const usedDays = Math.floor(Math.random() * (totalDays * 0.3)); // Used 0-30% of balance
        const availableDays = totalDays - usedDays;

        this.seedData.leaveBalances.push({
          id: this.generateId(),
          user_id: user.id,
          country_code: countryCode,
          leave_type: leaveType,
          total_days: totalDays,
          used_days: usedDays,
          available_days: availableDays,
          accrual_rate: leaveType.includes('ANNUAL') || leaveType.includes('SICK') ? (totalDays / 12) : 0,
          year: currentYear,
          created_at: now,
          updated_at: now
        });
      });
    });

    // Get admin and HR users for approvals
    const adminUser = this.seedData.users.find(u => 
      this.seedData.userRoles.some(ur => ur.user_id === u.id && ur.role === 'admin')
    );
    const hrUser = this.seedData.users.find(u => 
      this.seedData.userRoles.some(ur => ur.user_id === u.id && ur.role === 'hr')
    );
    const approverId = adminUser?.id || hrUser?.id;

    // Generate leave requests for each user
    usersWithEmployment.forEach((user, index) => {
      const employmentRecord = this.seedData.employmentRecords.find(er => er.user_id === user.id);
      if (!employmentRecord) return;

      // Determine country
      let countryCode = indiaCode;
      if (employmentRecord.employment_country === 'Philippines') countryCode = philippinesCode;
      if (employmentRecord.employment_country === 'Australia') countryCode = australiaCode;

      const leaveTypes = leaveTypesByCountry[countryCode] || [];
      const payrollPeriod = this.seedData.payrollPeriods.find(pp => pp.country_code === countryCode);

      // Generate 3-5 leave requests per user
      const numRequests = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numRequests; i++) {
        const leaveType = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
        const startDate = new Date(currentYear, Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28));
        const duration = 1 + Math.floor(Math.random() * 5); // 1-5 days
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + duration - 1);

        // Mix of statuses: DRAFT, SUBMITTED, APPROVED, REJECTED
        const statuses = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const isPaid = !leaveType.includes('PARENTAL') && !leaveType.includes('SOLO_PARENT');

        const leaveRequestId = this.generateId();

        this.seedData.leaveRequests.push({
          id: leaveRequestId,
          user_id: user.id,
          country_code: countryCode,
          leave_type: leaveType,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          total_days: duration,
          status: status,
          notes: status === 'DRAFT' ? 'Planning vacation' : `${leaveType.replace(/_/g, ' ')} - ${duration} days`,
          payroll_period_id: status === 'APPROVED' ? payrollPeriod?.id : null,
          is_paid: isPaid,
          created_at: now,
          updated_at: now
        });

        // Create approval records for APPROVED and REJECTED requests
        if ((status === 'APPROVED' || status === 'REJECTED') && approverId) {
          this.seedData.leaveApprovals.push({
            id: this.generateId(),
            leave_request_id: leaveRequestId,
            approver_id: approverId,
            status: status,
            comments: status === 'APPROVED' ? 'Approved as requested' : 'Insufficient leave balance or overlapping dates',
            approved_at: now,
            created_at: now
          });
        }
      }
    });

    console.log(`${colors.green}✓${colors.reset} Generated ${this.seedData.leaveBalances.length} leave balances and ${this.seedData.leaveRequests.length} leave requests`);
  }

  generatePayslipData() {
    console.log(`${colors.yellow}💰${colors.reset} Generating payslip data (Story 7.6)...`);

    const indiaCountry = this.seedData.countries.find(c => c.code === 'IN');
    const philippinesCountry = this.seedData.countries.find(c => c.code === 'PH');
    
    // Get payroll periods for India and Philippines
    const indiaPeriods = this.seedData.payrollPeriods.filter(p => p.country_id === indiaCountry?.id);
    const philippinesPeriods = this.seedData.payrollPeriods.filter(p => p.country_id === philippinesCountry?.id);
    
    // Generate payslips for employees with employment records
    const usersWithEmployment = this.seedData.users.filter(u => 
      this.seedData.employmentRecords.some(er => er.user_id === u.id)
    );

    usersWithEmployment.forEach((user, userIndex) => {
      const employmentRecord = this.seedData.employmentRecords.find(er => er.user_id === user.id);
      if (!employmentRecord) return;

      // Determine country and periods
      const countryCode = employmentRecord.country || 'IN';
      const country = countryCode === 'IN' ? indiaCountry : philippinesCountry;
      const periods = countryCode === 'IN' ? indiaPeriods : philippinesPeriods;
      
      if (!country || periods.length === 0) return;

      // Get salary from salary history
      const salaryRecord = this.seedData.salaryHistory.find(sh => sh.employment_record_id === employmentRecord.id);
      const basicSalary = salaryRecord?.salary_amount || 50000;
      const currencyCode = country.currency_code;

      // Generate 3-6 payslips for different periods
      const payslipCount = 3 + (userIndex % 4);
      for (let i = 0; i < Math.min(payslipCount, periods.length); i++) {
        const period = periods[i];
        const payslipId = this.generateId();
        const calculationId = `calc_${payslipId}`;

        // Calculate salary components (simplified for seed data)
        const hra = basicSalary * 0.40; // 40% HRA
        const conveyance = 1600;
        const specialAllowance = basicSalary * 0.20; // 20% special allowance
        const grossPay = basicSalary + hra + conveyance + specialAllowance;

        // Calculate statutory deductions (simplified)
        let epfEmployee = 0, epfEmployer = 0;
        let esiEmployee = 0, esiEmployer = 0;
        let pt = 0, tds = 0;
        let sssEmployee = 0, sssEmployer = 0;
        let philHealthEmployee = 0, philHealthEmployer = 0;
        let pagIbigEmployee = 0, pagIbigEmployer = 0;

        if (countryCode === 'IN') {
          epfEmployee = basicSalary * 0.12;
          epfEmployer = basicSalary * 0.12;
          esiEmployee = grossPay * 0.0075;
          esiEmployer = grossPay * 0.0325;
          pt = 200;
          tds = grossPay > 50000 ? (grossPay - 50000) * 0.10 : 0;
        } else {
          // Philippines calculations (simplified)
          sssEmployee = Math.min(basicSalary * 0.045, 1800);
          sssEmployer = Math.min(basicSalary * 0.095, 3800);
          philHealthEmployee = basicSalary * 0.02;
          philHealthEmployer = basicSalary * 0.02;
          pagIbigEmployee = Math.min(basicSalary * 0.02, 100);
          pagIbigEmployer = Math.min(basicSalary * 0.02, 100);
        }

        const totalStatutoryDeductions = countryCode === 'IN' 
          ? epfEmployee + esiEmployee + pt + tds
          : sssEmployee + philHealthEmployee + pagIbigEmployee;
        
        const totalOtherDeductions = 0;
        const totalDeductions = totalStatutoryDeductions + totalOtherDeductions;
        const netPay = grossPay - totalDeductions;

        // Overtime and night shift (random)
        const overtimePay = (i % 3 === 0) ? (userIndex % 2 === 0 ? 2000 : null) : null;
        const nightShiftPay = (i % 4 === 0) ? (userIndex % 3 === 0 ? 1500 : null) : null;
        const totalEarnings = grossPay + (overtimePay || 0) + (nightShiftPay || 0);

        // Build salary components
        const salaryComponents = [
          { componentName: 'Basic Salary', componentType: 'EARNING', amount: basicSalary },
          { componentName: 'HRA', componentType: 'EARNING', amount: hra },
          { componentName: 'Conveyance Allowance', componentType: 'EARNING', amount: conveyance },
          { componentName: 'Special Allowance', componentType: 'EARNING', amount: specialAllowance }
        ];

        if (overtimePay) {
          salaryComponents.push({ componentName: 'Overtime Pay', componentType: 'EARNING', amount: overtimePay });
        }
        if (nightShiftPay) {
          salaryComponents.push({ componentName: 'Night Shift Allowance', componentType: 'EARNING', amount: nightShiftPay });
        }

        // Build statutory deductions
        const statutoryDeductions = [];
        if (countryCode === 'IN') {
          if (epfEmployee > 0) {
            statutoryDeductions.push({
              componentName: 'Employee Provident Fund',
              componentType: 'STATUTORY',
              componentId: 'EPF',
              employeeContribution: epfEmployee,
              employerContribution: epfEmployer,
              totalContribution: epfEmployee + epfEmployer
            });
          }
          if (esiEmployee > 0) {
            statutoryDeductions.push({
              componentName: 'Employee State Insurance',
              componentType: 'STATUTORY',
              componentId: 'ESI',
              employeeContribution: esiEmployee,
              employerContribution: esiEmployer,
              totalContribution: esiEmployee + esiEmployer
            });
          }
          if (pt > 0) {
            statutoryDeductions.push({
              componentName: 'Professional Tax',
              componentType: 'STATUTORY',
              componentId: 'PT',
              employeeContribution: pt,
              employerContribution: 0,
              totalContribution: pt
            });
          }
          if (tds > 0) {
            statutoryDeductions.push({
              componentName: 'Tax Deducted at Source',
              componentType: 'STATUTORY',
              componentId: 'TDS',
              employeeContribution: tds,
              employerContribution: 0,
              totalContribution: tds
            });
          }
        } else {
          // Philippines
          if (sssEmployee > 0) {
            statutoryDeductions.push({
              componentName: 'Social Security System',
              componentType: 'STATUTORY',
              componentId: 'SSS',
              employeeContribution: sssEmployee,
              employerContribution: sssEmployer,
              totalContribution: sssEmployee + sssEmployer
            });
          }
          if (philHealthEmployee > 0) {
            statutoryDeductions.push({
              componentName: 'PhilHealth',
              componentType: 'STATUTORY',
              componentId: 'PHILHEALTH',
              employeeContribution: philHealthEmployee,
              employerContribution: philHealthEmployer,
              totalContribution: philHealthEmployee + philHealthEmployer
            });
          }
          if (pagIbigEmployee > 0) {
            statutoryDeductions.push({
              componentName: 'Pag-IBIG Fund',
              componentType: 'STATUTORY',
              componentId: 'PAGIBIG',
              employeeContribution: pagIbigEmployee,
              employerContribution: pagIbigEmployer,
              totalContribution: pagIbigEmployee + pagIbigEmployer
            });
          }
        }

        const otherDeductions = [];

        // Determine status - most recent payslips are 'available', some are 'downloaded'
        let status = 'available';
        if (i < payslipCount - 2 && userIndex % 3 === 0) {
          status = 'downloaded';
        }

        const calculatedAt = new Date(period.start_date);
        calculatedAt.setDate(calculatedAt.getDate() + 25); // 25th of the period

        const payslip = {
          id: payslipId,
          user_id: user.id,
          country_id: country.id,
          payroll_period_id: period.id,
          calculation_id: calculationId,
          calculated_at: calculatedAt.toISOString(),
          gross_pay: grossPay,
          basic_salary: basicSalary,
          total_earnings: totalEarnings,
          overtime_pay: overtimePay,
          night_shift_pay: nightShiftPay,
          total_statutory_deductions: totalStatutoryDeductions,
          total_other_deductions: totalOtherDeductions,
          total_deductions: totalDeductions,
          net_pay: netPay,
          currency_code: currencyCode,
          salary_components: salaryComponents,
          statutory_deductions: statutoryDeductions,
          other_deductions: otherDeductions,
          metadata: {
            generatedBy: 'seed-script',
            payPeriod: period.period_name,
            country: country.name
          },
          status: status,
          pdf_path: status === 'downloaded' || status === 'available' ? `payslips/${user.id}/${period.id}/${payslipId}.pdf` : null,
          pdf_generated_at: status === 'downloaded' || status === 'available' ? calculatedAt.toISOString() : null,
          first_downloaded_at: status === 'downloaded' ? new Date(calculatedAt.getTime() + 24 * 60 * 60 * 1000).toISOString() : null,
          created_at: calculatedAt.toISOString(),
          updated_at: calculatedAt.toISOString()
        };

        this.seedData.payslips.push(payslip);
      }
    });

    console.log(`${colors.green}✓${colors.reset} Generated ${this.seedData.payslips.length} payslips`);
  }

  generateTaxDocumentData() {
    console.log(`${colors.yellow}📄${colors.reset} Generating tax document data (Story 7.6)...`);

    // Get EOR profiles (users with employment records)
    const usersWithEmployment = this.seedData.users.filter(u => 
      this.seedData.employmentRecords.some(er => er.user_id === u.id)
    );

    // Generate 1-3 tax documents per user
    usersWithEmployment.forEach((user, index) => {
      const employmentRecord = this.seedData.employmentRecords.find(er => er.user_id === user.id);
      if (!employmentRecord) return;

      const docCount = 1 + (index % 3); // 1-3 documents per user
      const now = new Date();

      for (let i = 0; i < docCount; i++) {
        const docId = this.generateId();
        const uploadDate = new Date(now.getTime() - (i * 30 * 24 * 60 * 60 * 1000)); // Stagger by months
        
        // Determine status: pending, approved, or rejected
        let status, reviewedBy, reviewedAt, reviewNotes;
        if (i === 0 && index % 4 === 0) {
          status = 'pending';
          reviewedBy = null;
          reviewedAt = null;
          reviewNotes = null;
        } else if (index % 5 === 0 && i === docCount - 1) {
          status = 'rejected';
          const adminUser = this.seedData.users.find(u => 
            this.seedData.userRoles.some(ur => ur.user_id === u.id && ur.role === 'admin')
          );
          reviewedBy = adminUser?.id || this.seedData.users[0].id;
          reviewedAt = new Date(uploadDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
          reviewNotes = 'Please resubmit with updated tax computation sheet';
        } else {
          status = 'approved';
          const hrUser = this.seedData.users.find(u => 
            this.seedData.userRoles.some(ur => ur.user_id === u.id && ur.role === 'hr')
          );
          reviewedBy = hrUser?.id || this.seedData.users[1]?.id || this.seedData.users[0].id;
          reviewedAt = new Date(uploadDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString();
          reviewNotes = 'Tax document verified and approved';
        }

        const taxYear = 2024 - i;
        const docTypes = ['Form 16', 'Form 26AS', 'BIR 2316', 'Tax Computation', 'W-2'];
        const fileName = `${docTypes[i % docTypes.length]}_${taxYear}_${user.email.split('@')[0]}.pdf`;

        const taxDocument = {
          id: docId,
          eor_profile_id: user.id, // Using user_id as eor_profile_id for simplicity
          document_type: 'TAX_DOCUMENT',
          file_name: fileName,
          file_path: `tax-documents/${user.id}/${taxYear}/${fileName}`,
          content_type: 'application/pdf',
          file_size: 150000 + (index * 10000) + (i * 5000),
          sha256_checksum: this.generateChecksum(),
          version_id: `v1_${docId}`,
          is_current: true,
          status: status,
          reviewed_by: reviewedBy,
          reviewed_at: reviewedAt,
          review_notes: reviewNotes,
          uploaded_at: uploadDate.toISOString(),
          created_at: uploadDate.toISOString(),
          updated_at: reviewedAt || uploadDate.toISOString()
        };

        this.seedData.taxDocuments.push(taxDocument);
      }
    });

    console.log(`${colors.green}✓${colors.reset} Generated ${this.seedData.taxDocuments.length} tax documents`);
  }

  generateChecksum() {
    // Generate a random SHA256-like checksum for demo purposes
    const chars = '0123456789abcdef';
    let checksum = '';
    for (let i = 0; i < 64; i++) {
      checksum += chars[Math.floor(Math.random() * chars.length)];
    }
    return checksum;
  }

  async insertData() {
    console.log(`${colors.yellow}💾${colors.reset} Inserting data into database...`);

    try {
      // Insert clients
      for (const client of this.seedData.clients) {
        await this.pool.query(`
          INSERT INTO clients (id, name, description, contact_info, status, is_active, migrated_from_zoho, zoho_client_id, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          client.id,
          client.name,
          client.description,
          JSON.stringify(client.contact_info),
          client.status,
          client.is_active,
          client.migrated_from_zoho,
          client.zoho_client_id,
          client.created_at,
          client.updated_at
        ]);
      }
      console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.clients.length} clients`);

      // Insert users
      for (const user of this.seedData.users) {
        await this.pool.query(`
          INSERT INTO users (id, email, password_hash, first_name, last_name, phone, address, profile_data, status, is_active, email_verified, email_verification_token, email_verification_token_expiry, password_reset_token, migrated_from_zoho, zoho_user_id, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        `, [
          user.id,
          user.email,
          user.password_hash,
          user.first_name,
          user.last_name,
          user.phone,
          JSON.stringify(user.address),
          JSON.stringify(user.profile_data),
          user.status,
          user.is_active,
          user.email_verified,
          user.email_verification_token,
          user.email_verification_token_expiry,
          user.password_reset_token,
          user.migrated_from_zoho,
          user.zoho_user_id,
          user.created_at,
          user.updated_at
        ]);
      }
      console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.users.length} users`);

      // Employment records and salary history insertion moved after countries

      // Insert user roles
      for (const role of this.seedData.userRoles) {
        await this.pool.query(`
          INSERT INTO user_roles (id, user_id, role_type, scope, scope_entity_id, granted_by, expires_at, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          role.id,
          role.user_id,
          role.role_type,
          role.scope,
          role.scope_entity_id,
          role.granted_by,
          role.expires_at,
          role.created_at,
          role.updated_at
        ]);
      }
      console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.userRoles.length} user roles`);

      // Insert organizations
      for (const org of this.seedData.organizations) {
        await this.pool.query(`
          INSERT INTO organizations (id, name, slug, industry, company_size, logo_url, settings, subscription_tier, subscription_status, website, created_at, updated_at, deleted_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          org.id,
          org.name,
          org.slug,
          org.industry,
          org.company_size,
          org.logo_url,
          org.settings,
          org.subscription_tier,
          org.subscription_status,
          org.website,
          org.created_at,
          org.updated_at,
          org.deleted_at
        ]);
      }
      console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.organizations.length} organizations`);

      // Insert organization members
      for (const member of this.seedData.organizationMembers) {
        await this.pool.query(`
          INSERT INTO organization_members (id, organization_id, user_id, status, joined_at, invited_by, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          member.id,
          member.organization_id,
          member.user_id,
          member.status,
          member.joined_at,
          member.invited_by,
          member.created_at
        ]);
      }
      console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.organizationMembers.length} organization members`);

      // Insert payroll data
      await this.insertPayrollData();

    } catch (error) {
      console.error(`${colors.red}✗${colors.reset} Failed to insert data:`, error.message);
      throw error;
    }
  }

  async insertPayrollData() {
    // Insert currencies
    for (const currency of this.seedData.currencies) {
      await this.pool.query(`
        INSERT INTO currencies (id, code, name, symbol, decimal_places, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        currency.id,
        currency.code,
        currency.name,
        currency.symbol,
        currency.decimal_places,
        currency.is_active,
        currency.created_at,
        currency.updated_at
      ]);
    }
    console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.currencies.length} currencies`);

    // Insert countries
    for (const country of this.seedData.countries) {
      await this.pool.query(`
        INSERT INTO countries (id, code, name, currency_id, tax_year_start_month, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        country.id,
        country.code,
        country.name,
        country.currency_id,
        country.tax_year_start_month,
        country.is_active,
        country.created_at,
        country.updated_at
      ]);
    }
    console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.countries.length} countries`);

    // Insert employment records (moved here from after users to ensure countries exist first)
    for (const employment of this.seedData.employmentRecords) {
      await this.pool.query(`
        INSERT INTO employment_records (id, user_id, client_id, country_id, role, start_date, end_date, status, migrated_from_zoho, zoho_employment_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        employment.id,
        employment.user_id,
        employment.client_id,
        employment.country_id,
        employment.role,
        employment.start_date,
        employment.end_date,
        employment.status,
        employment.migrated_from_zoho,
        employment.zoho_employment_id,
        employment.created_at,
        employment.updated_at
      ]);
    }
    console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.employmentRecords.length} employment records`);

    // Insert salary history
    for (const salary of this.seedData.salaryHistory) {
      await this.pool.query(`
        INSERT INTO salary_history (id, employment_record_id, salary_amount, salary_currency, effective_date, change_reason, changed_by, migrated_from_zoho, zoho_salary_id, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        salary.id,
        salary.employment_record_id,
        salary.salary_amount,
        salary.salary_currency,
        salary.effective_date,
        salary.change_reason,
        salary.changed_by,
        salary.migrated_from_zoho,
        salary.zoho_salary_id,
        salary.created_at
      ]);
    }
    console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.salaryHistory.length} salary records`);

    // Insert tax years
    for (const taxYear of this.seedData.taxYears) {
      await this.pool.query(`
        INSERT INTO tax_years (id, country_id, year, start_date, end_date, is_current, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        taxYear.id,
        taxYear.country_id,
        taxYear.year,
        taxYear.start_date,
        taxYear.end_date,
        taxYear.is_current,
        taxYear.created_at,
        taxYear.updated_at
      ]);
    }
    console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.taxYears.length} tax years`);

    // Insert region configurations
    for (const config of this.seedData.regionConfigurations) {
      await this.pool.query(`
        INSERT INTO region_configurations (id, country_id, config_key, config_value, description, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        config.id,
        config.country_id,
        config.config_key,
        JSON.stringify(config.config_value),
        config.description,
        config.is_active,
        config.created_at,
        config.updated_at
      ]);
    }
    console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.regionConfigurations.length} region configurations`);

    // Insert exchange rates
    for (const rate of this.seedData.exchangeRates) {
      await this.pool.query(`
        INSERT INTO exchange_rates (id, from_currency_id, to_currency_id, rate, effective_date, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        rate.id,
        rate.from_currency_id,
        rate.to_currency_id,
        rate.rate,
        rate.effective_date,
        rate.is_active,
        rate.created_at,
        rate.updated_at
      ]);
    }
    console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.exchangeRates.length} exchange rates`);

    // Insert payroll periods
    for (const period of this.seedData.payrollPeriods) {
      await this.pool.query(`
        INSERT INTO payroll_periods (id, country_id, period_name, start_date, end_date, pay_date, status, total_employees, total_amount, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        period.id,
        period.country_id,
        period.period_name,
        period.start_date,
        period.end_date,
        period.pay_date,
        period.status,
        period.total_employees,
        period.total_amount,
        period.created_at,
        period.updated_at
      ]);
    }
    console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.payrollPeriods.length} payroll periods`);

    // Insert salary components
    for (const component of this.seedData.salaryComponents) {
      await this.pool.query(`
        INSERT INTO salary_components (id, country_id, component_name, component_code, component_type, calculation_type, calculation_value, calculation_formula, is_taxable, is_statutory, is_mandatory, display_order, description, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `, [
        component.id,
        component.country_id,
        component.component_name,
        component.component_code,
        component.component_type,
        component.calculation_type,
        component.calculation_value,
        component.calculation_formula,
        component.is_taxable,
        component.is_statutory,
        component.is_mandatory,
        component.display_order,
        component.description,
        component.is_active,
        component.created_at,
        component.updated_at
      ]);
    }
    console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.salaryComponents.length} salary components`);

    // Insert statutory components
    for (const component of this.seedData.statutoryComponents) {
      await this.pool.query(`
        INSERT INTO statutory_components (id, country_id, component_name, component_code, component_type, contribution_type, calculation_basis, employee_percentage, employer_percentage, minimum_amount, maximum_amount, wage_ceiling, wage_floor, effective_from, effective_to, is_mandatory, display_order, description, regulatory_reference, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      `, [
        component.id,
        component.country_id,
        component.component_name,
        component.component_code,
        component.component_type,
        component.contribution_type,
        component.calculation_basis,
        component.employee_percentage,
        component.employer_percentage,
        component.minimum_amount,
        component.maximum_amount,
        component.wage_ceiling,
        component.wage_floor,
        component.effective_from,
        component.effective_to,
        component.is_mandatory,
        component.display_order,
        component.description,
        component.regulatory_reference,
        component.is_active,
        component.created_at,
        component.updated_at
      ]);
    }
    console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.statutoryComponents.length} statutory components`);

    // Insert timesheets
    for (const timesheet of this.seedData.timesheets) {
      await this.pool.query(`
        INSERT INTO timesheets (id, user_id, employment_record_id, payroll_period_id, timesheet_type, work_date, regular_hours, overtime_hours, double_overtime_hours, night_shift_hours, total_hours, status, notes, submitted_at, approved_at, approved_by_id, rejected_at, rejected_by_id, rejection_reason, payroll_processed, payroll_processed_at, calculation_metadata, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      `, [
        timesheet.id,
        timesheet.user_id,
        timesheet.employment_record_id,
        timesheet.payroll_period_id,
        timesheet.timesheet_type,
        timesheet.work_date,
        timesheet.regular_hours,
        timesheet.overtime_hours,
        timesheet.double_overtime_hours,
        timesheet.night_shift_hours,
        timesheet.total_hours,
        timesheet.status,
        timesheet.notes,
        timesheet.submitted_at,
        timesheet.approved_at,
        timesheet.approved_by_id,
        timesheet.rejected_at,
        timesheet.rejected_by_id,
        timesheet.rejection_reason,
        timesheet.payroll_processed,
        timesheet.payroll_processed_at,
        timesheet.calculation_metadata,
        timesheet.created_at,
        timesheet.updated_at
      ]);
    }
    console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.timesheets.length} timesheets`);

    // Insert timesheet approvals
    for (const approval of this.seedData.timesheetApprovals) {
      await this.pool.query(`
        INSERT INTO timesheet_approvals (id, timesheet_id, reviewer_id, action, action_date, comments, previous_status, new_status, metadata, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        approval.id,
        approval.timesheet_id,
        approval.reviewer_id,
        approval.action,
        approval.action_date,
        approval.comments,
        approval.previous_status,
        approval.new_status,
        approval.metadata,
        approval.created_at,
        approval.updated_at
      ]);
    }
    console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.timesheetApprovals.length} timesheet approvals`);

    // Insert leave balances
    for (const balance of this.seedData.leaveBalances) {
      await this.pool.query(`
        INSERT INTO leave_balances (id, user_id, country_code, leave_type, total_days, used_days, available_days, accrual_rate, year, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        balance.id,
        balance.user_id,
        balance.country_code,
        balance.leave_type,
        balance.total_days,
        balance.used_days,
        balance.available_days,
        balance.accrual_rate,
        balance.year,
        balance.created_at,
        balance.updated_at
      ]);
    }
    console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.leaveBalances.length} leave balances`);

    // Insert leave requests
    for (const request of this.seedData.leaveRequests) {
      await this.pool.query(`
        INSERT INTO leave_requests (id, user_id, country_code, leave_type, start_date, end_date, total_days, status, notes, payroll_period_id, is_paid, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        request.id,
        request.user_id,
        request.country_code,
        request.leave_type,
        request.start_date,
        request.end_date,
        request.total_days,
        request.status,
        request.notes,
        request.payroll_period_id,
        request.is_paid,
        request.created_at,
        request.updated_at
      ]);
    }
    console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.leaveRequests.length} leave requests`);

    // Insert leave approvals
    for (const approval of this.seedData.leaveApprovals) {
      await this.pool.query(`
        INSERT INTO leave_approvals (id, leave_request_id, approver_id, status, comments, approved_at, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        approval.id,
        approval.leave_request_id,
        approval.approver_id,
        approval.status,
        approval.comments,
        approval.approved_at,
        approval.created_at
      ]);
    }
    console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.leaveApprovals.length} leave approvals`);

    // Insert payslips (Story 7.6)
    for (const payslip of this.seedData.payslips) {
      await this.pool.query(`
        INSERT INTO payslips (
          id, user_id, country_id, payroll_period_id, calculation_id, calculated_at,
          gross_pay, basic_salary, total_earnings, overtime_pay, night_shift_pay,
          total_statutory_deductions, total_other_deductions, total_deductions, net_pay,
          currency_code, salary_components, statutory_deductions, other_deductions,
          metadata, status, pdf_path, pdf_generated_at, first_downloaded_at,
          created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      `, [
        payslip.id,
        payslip.user_id,
        payslip.country_id,
        payslip.payroll_period_id,
        payslip.calculation_id,
        payslip.calculated_at,
        payslip.gross_pay,
        payslip.basic_salary,
        payslip.total_earnings,
        payslip.overtime_pay,
        payslip.night_shift_pay,
        payslip.total_statutory_deductions,
        payslip.total_other_deductions,
        payslip.total_deductions,
        payslip.net_pay,
        payslip.currency_code,
        JSON.stringify(payslip.salary_components),
        JSON.stringify(payslip.statutory_deductions),
        JSON.stringify(payslip.other_deductions),
        JSON.stringify(payslip.metadata),
        payslip.status,
        payslip.pdf_path,
        payslip.pdf_generated_at,
        payslip.first_downloaded_at,
        payslip.created_at,
        payslip.updated_at
      ]);
    }
    console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.payslips.length} payslips`);

    // Insert tax documents (Story 7.6) - TEMPORARILY DISABLED - needs eor_profiles table
    // TODO: Re-enable once eor_profiles table is created
    /* 
    for (const taxDoc of this.seedData.taxDocuments) {
      await this.pool.query(`
        INSERT INTO documents (
          id, eor_profile_id, document_type, file_name, file_path,
          content_type, file_size, sha256_checksum, version_id, is_current,
          status, reviewed_by, reviewed_at, review_notes,
          uploaded_at, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      `, [
        taxDoc.id,
        taxDoc.eor_profile_id,
        taxDoc.document_type,
        taxDoc.file_name,
        taxDoc.file_path,
        taxDoc.content_type,
        taxDoc.file_size,
        taxDoc.sha256_checksum,
        taxDoc.version_id,
        taxDoc.is_current,
        taxDoc.status,
        taxDoc.reviewed_by,
        taxDoc.reviewed_at,
        taxDoc.review_notes,
        taxDoc.uploaded_at,
        taxDoc.created_at,
        taxDoc.updated_at
      ]);
    }
    */
    console.log(`${colors.yellow}⚠${colors.reset} Skipped ${this.seedData.taxDocuments.length} tax documents (eor_profiles table not available)`);
  }

  async verifyData() {
    console.log(`${colors.yellow}🔍${colors.reset} Verifying inserted data...`);

    try {
      const result = await this.pool.query(`
        SELECT 
          'Users' as table_name, 
          COUNT(*) as record_count 
        FROM users
        UNION ALL
        SELECT 
          'Clients' as table_name, 
          COUNT(*) as record_count 
        FROM clients
        UNION ALL
        SELECT 
          'Employment Records' as table_name, 
          COUNT(*) as record_count 
        FROM employment_records
        UNION ALL
        SELECT 
          'Salary History' as table_name, 
          COUNT(*) as record_count 
        FROM salary_history
        UNION ALL
        SELECT 
          'User Roles' as table_name, 
          COUNT(*) as record_count 
        FROM user_roles
        UNION ALL
        SELECT 
          'Currencies' as table_name, 
          COUNT(*) as record_count 
        FROM currencies
        UNION ALL
        SELECT 
          'Countries' as table_name, 
          COUNT(*) as record_count 
        FROM countries
        UNION ALL
        SELECT 
          'Tax Years' as table_name, 
          COUNT(*) as record_count 
        FROM tax_years
        UNION ALL
        SELECT 
          'Region Configurations' as table_name, 
          COUNT(*) as record_count 
        FROM region_configurations
        UNION ALL
        SELECT 
          'Exchange Rates' as table_name, 
          COUNT(*) as record_count 
        FROM exchange_rates
        UNION ALL
        SELECT 
          'Payroll Periods' as table_name, 
          COUNT(*) as record_count 
        FROM payroll_periods
        UNION ALL
        SELECT 
          'Salary Components' as table_name, 
          COUNT(*) as record_count 
        FROM salary_components
        UNION ALL
        SELECT 
          'Statutory Components' as table_name, 
          COUNT(*) as record_count 
        FROM statutory_components
        UNION ALL
        SELECT 
          'Timesheets' as table_name, 
          COUNT(*) as record_count 
        FROM timesheets
        UNION ALL
        SELECT 
          'Timesheet Approvals' as table_name, 
          COUNT(*) as record_count 
        FROM timesheet_approvals
        UNION ALL
        SELECT 
          'Leave Balances' as table_name, 
          COUNT(*) as record_count 
        FROM leave_balances
        UNION ALL
        SELECT 
          'Leave Requests' as table_name, 
          COUNT(*) as record_count 
        FROM leave_requests
        UNION ALL
        SELECT 
          'Leave Approvals' as table_name, 
          COUNT(*) as record_count 
        FROM leave_approvals
        UNION ALL
        SELECT 
          'Payslips' as table_name, 
          COUNT(*) as record_count 
        FROM payslips
        UNION ALL
        SELECT 
          'Organizations' as table_name, 
          COUNT(*) as record_count 
        FROM organizations
        UNION ALL
        SELECT 
          'Organization Members' as table_name, 
          COUNT(*) as record_count 
        FROM organization_members
        -- UNION ALL
        -- SELECT 
        --   'Tax Documents' as table_name, 
        --   COUNT(*) as record_count 
        -- FROM documents 
        -- WHERE document_type = 'TAX_DOCUMENT'
        ORDER BY table_name
      `);

      console.log(`\n${colors.bright}${colors.blue}📊 DATABASE SUMMARY${colors.reset}`);
      console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
      result.rows.forEach(row => {
        console.log(`  ${colors.cyan}${row.table_name.padEnd(20)}${colors.reset} ${row.record_count} records`);
      });

      console.log(`\n${colors.bright}${colors.yellow}🔑 TEST CREDENTIALS${colors.reset}`);
      console.log(`${colors.yellow}═══════════════════════════════════════${colors.reset}`);
      console.log(`${colors.cyan}Admin User:${colors.reset} ${this.userCredentials.admin.email} / ${this.userCredentials.admin.password}`);
      console.log(`${colors.cyan}HR Manager (Teamified):${colors.reset} ${this.userCredentials.hr.email} / ${this.userCredentials.hr.password}`);
      console.log(`${colors.cyan}Account Manager:${colors.reset} ${this.userCredentials.account_manager.email} / ${this.userCredentials.account_manager.password}`);
      console.log(`${colors.cyan}Recruiter:${colors.reset} ${this.userCredentials.recruiter.email} / ${this.userCredentials.recruiter.password}`);
      console.log(`${colors.cyan}HR Manager (Client):${colors.reset} ${this.userCredentials.hr_manager_client.email} / ${this.userCredentials.hr_manager_client.password}`);
      console.log(`${colors.cyan}EOR User:${colors.reset} ${this.userCredentials.eor.email} / ${this.userCredentials.eor.password}`);
      console.log(`${colors.cyan}Candidate User:${colors.reset} ${this.userCredentials.candidate.email} / ${this.userCredentials.candidate.password}`);

    } catch (error) {
      console.error(`${colors.red}✗${colors.reset} Failed to verify data:`, error.message);
      throw error;
    }
  }

  async close() {
    try {
      await this.pool.end();
      console.log(`${colors.green}✓${colors.reset} Database connection closed`);
    } catch (error) {
      console.error('Error closing database connection:', error.message);
    }
  }

  async seed() {
    try {
      console.log(`${colors.bright}${colors.blue}🌱 Starting database seeding...${colors.reset}\n`);
      
      await this.connect();
      await this.clearExistingData();
      await this.generateSeedData();
      await this.insertData();
      await this.verifyData();
      
      console.log(`\n${colors.bright}${colors.green}🎉 Database seeding completed successfully!${colors.reset}`);
      
    } catch (error) {
      console.error(`${colors.red}✗${colors.reset} Seeding failed:`, error.message);
      process.exit(1);
    } finally {
      await this.close();
    }
  }
}

// Run the seeder if this script is executed directly
if (require.main === module) {
  const seeder = new DatabaseSeeder();
  seeder.seed().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
  
  // Force exit after 120 seconds if the script doesn't exit naturally
  setTimeout(() => {
    console.log('Force exiting after timeout...');
    process.exit(0);
  }, 120000);
}

module.exports = DatabaseSeeder;
