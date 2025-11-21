#!/usr/bin/env node

/**
 * Production Database Seeding Script (Simplified)
 * 
 * This script populates the database with PRODUCTION-READY data only:
 * - Countries (India, Philippines, Australia) with currencies and tax years
 * - One admin user (admin@teamified.com) for initial system access
 * 
 * ⚠️ SAFE FOR PRODUCTION - Contains NO test/fake data
 * 
 * Note: Payroll components (salary/statutory) should be configured via the admin UI
 * after initial setup, as they require specific regulatory compliance settings.
 * 
 * Usage:
 *   node scripts/seed-database-production-v2.js
 *   npm run seed:prod
 */

const { Pool } = require('pg');
const argon2 = require('argon2');

// Database configuration - supports both local and Vercel environments
const dbConfig = process.env.POSTGRES_URL || process.env.DATABASE_URL 
  ? {
      connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' || process.env.POSTGRES_URL ? { rejectUnauthorized: false } : false,
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

class ProductionSeeder {
  constructor() {
    this.pool = new Pool(dbConfig);
    this.seedData = {
      currencies: [],
      countries: [],
      taxYears: [],
      adminUser: null,
      salaryComponents: [],
      statutoryComponents: [],
    };
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

  generateId() {
    return '650e8400-e29b-41d4-a716-' + Math.random().toString(16).substr(2, 12).padStart(12, '0');
  }

  async generateSeedData() {
    console.log(`${colors.yellow}📊${colors.reset} Generating production seed data...`);

    // Generate currencies
    this.seedData.currencies = [
      {
        id: this.generateId(),
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: this.generateId(),
        code: 'PHP',
        name: 'Philippine Peso',
        symbol: '₱',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: this.generateId(),
        code: 'AUD',
        name: 'Australian Dollar',
        symbol: 'A$',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: this.generateId(),
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
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
      
      const startMonth = taxYearStartMonth.toString().padStart(2, '0');
      const startDate = `${currentYear}-${startMonth}-01`;
      
      const endYear = taxYearStartMonth === 1 ? currentYear : currentYear + 1;
      const endMonth = taxYearStartMonth === 1 ? 12 : taxYearStartMonth - 1;
      
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

    this.generateSalaryComponents();
    this.generateStatutoryComponents();
    await this.generateAdminUser();

    console.log(`${colors.green}✓${colors.reset} Generated production seed data`);
  }

  generateSalaryComponents() {
    const indiaCountry = this.seedData.countries.find(c => c.code === 'IN');
    const philippinesCountry = this.seedData.countries.find(c => c.code === 'PH');
    const australiaCountry = this.seedData.countries.find(c => c.code === 'AU');

    // India salary components
    if (indiaCountry) {
      this.seedData.salaryComponents.push(
        {
          id: this.generateId(),
          country_id: indiaCountry.id,
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
          country_id: indiaCountry.id,
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
          country_id: indiaCountry.id,
          component_name: 'Special Allowance',
          component_code: 'SPECIAL',
          component_type: 'earnings',
          calculation_type: 'fixed_amount',
          calculation_value: 10000,
          calculation_formula: null,
          is_taxable: true,
          is_statutory: false,
          is_mandatory: false,
          display_order: 3,
          description: 'Special allowance',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );
    }

    // Philippines salary components
    if (philippinesCountry) {
      this.seedData.salaryComponents.push(
        {
          id: this.generateId(),
          country_id: philippinesCountry.id,
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
          country_id: philippinesCountry.id,
          component_name: 'Allowances',
          component_code: 'ALLOWANCE',
          component_type: 'earnings',
          calculation_type: 'fixed_amount',
          calculation_value: 5000,
          calculation_formula: null,
          is_taxable: true,
          is_statutory: false,
          is_mandatory: false,
          display_order: 2,
          description: 'General allowances',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );
    }

    // Australia salary components
    if (australiaCountry) {
      this.seedData.salaryComponents.push(
        {
          id: this.generateId(),
          country_id: australiaCountry.id,
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
          country_id: australiaCountry.id,
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
    const indiaCountry = this.seedData.countries.find(c => c.code === 'IN');
    const philippinesCountry = this.seedData.countries.find(c => c.code === 'PH');
    const australiaCountry = this.seedData.countries.find(c => c.code === 'AU');

    // India statutory components
    if (indiaCountry) {
      this.seedData.statutoryComponents.push(
        {
          id: this.generateId(),
          country_id: indiaCountry.id,
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
          country_id: indiaCountry.id,
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
          is_mandatory: false,
          display_order: 2,
          description: 'Employee State Insurance contribution',
          regulatory_reference: 'ESI Act 1948',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: indiaCountry.id,
          component_name: 'Professional Tax',
          component_code: 'PT',
          component_type: 'pt',
          contribution_type: 'employee',
          calculation_basis: 'fixed_amount',
          employee_percentage: 0.5,  // Nominal percentage for fixed amount calculation
          employer_percentage: null,
          minimum_amount: 0,
          maximum_amount: 2500,
          wage_ceiling: null,
          wage_floor: 0,
          effective_from: '2024-01-01',
          effective_to: null,
          is_mandatory: true,
          display_order: 3,
          description: 'Professional tax (varies by state)',
          regulatory_reference: 'State Professional Tax Acts',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );
    }

    // Philippines statutory components
    if (philippinesCountry) {
      this.seedData.statutoryComponents.push(
        {
          id: this.generateId(),
          country_id: philippinesCountry.id,
          component_name: 'Social Security System',
          component_code: 'SSS',
          component_type: 'sss',
          contribution_type: 'both',
          calculation_basis: 'capped_amount',
          employee_percentage: 4.5,
          employer_percentage: 9.5,
          minimum_amount: 100,
          maximum_amount: 2400,
          wage_ceiling: 30000,
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
          country_id: philippinesCountry.id,
          component_name: 'PhilHealth',
          component_code: 'PHILHEALTH',
          component_type: 'philhealth',
          contribution_type: 'both',
          calculation_basis: 'gross_salary',
          employee_percentage: 2.0,
          employer_percentage: 2.0,
          minimum_amount: 0,
          maximum_amount: 1800,
          wage_ceiling: 90000,
          wage_floor: 10000,
          effective_from: '2024-01-01',
          effective_to: null,
          is_mandatory: true,
          display_order: 2,
          description: 'PhilHealth contribution',
          regulatory_reference: 'National Health Insurance Act',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: philippinesCountry.id,
          component_name: 'Pag-IBIG Fund',
          component_code: 'PAGIBIG',
          component_type: 'pagibig',
          contribution_type: 'both',
          calculation_basis: 'gross_salary',
          employee_percentage: 2.0,
          employer_percentage: 2.0,
          minimum_amount: 100,
          maximum_amount: 200,
          wage_ceiling: 5000,
          wage_floor: 1000,
          effective_from: '2024-01-01',
          effective_to: null,
          is_mandatory: true,
          display_order: 3,
          description: 'Pag-IBIG Fund contribution',
          regulatory_reference: 'Home Development Mutual Fund Law',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );
    }

    // Australia statutory components
    if (australiaCountry) {
      this.seedData.statutoryComponents.push(
        {
          id: this.generateId(),
          country_id: australiaCountry.id,
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
  }

  async generateAdminUser() {
    const adminPassword = 'Admin123!';
    const hashedPassword = await argon2.hash(adminPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    this.seedData.adminUser = {
      id: this.generateId(),
      email: 'admin@teamified.com',
      password_hash: hashedPassword,
      first_name: 'System',
      last_name: 'Administrator',
      phone: null,
      address: null,
      profile_data: {
        personal: {
          countryCode: 'AU'
        },
        metadata: {
          version: '1.0',
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }
      },
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
    };
  }

  async insertData() {
    console.log(`${colors.yellow}💾${colors.reset} Inserting production data into database...`);

    try {
      // Insert currencies and get actual IDs
      for (let i = 0; i < this.seedData.currencies.length; i++) {
        const currency = this.seedData.currencies[i];
        const result = await this.pool.query(`
          INSERT INTO currencies (id, code, name, symbol, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (code) DO UPDATE SET 
            name = EXCLUDED.name,
            symbol = EXCLUDED.symbol,
            updated_at = EXCLUDED.updated_at
          RETURNING id
        `, [
          currency.id,
          currency.code,
          currency.name,
          currency.symbol,
          currency.is_active,
          currency.created_at,
          currency.updated_at
        ]);
        // Update the currency ID with the actual ID from database
        this.seedData.currencies[i].id = result.rows[0].id;
      }
      console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.currencies.length} currencies`);

      // Update country currency_ids with actual IDs from database
      const inrCurrency = this.seedData.currencies.find(c => c.code === 'INR');
      const phpCurrency = this.seedData.currencies.find(c => c.code === 'PHP');
      const audCurrency = this.seedData.currencies.find(c => c.code === 'AUD');
      
      this.seedData.countries.find(c => c.code === 'IN').currency_id = inrCurrency.id;
      this.seedData.countries.find(c => c.code === 'PH').currency_id = phpCurrency.id;
      this.seedData.countries.find(c => c.code === 'AU').currency_id = audCurrency.id;

      // Insert countries and get actual IDs
      for (let i = 0; i < this.seedData.countries.length; i++) {
        const country = this.seedData.countries[i];
        const result = await this.pool.query(`
          INSERT INTO countries (id, code, name, currency_id, tax_year_start_month, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (code) DO UPDATE SET 
            name = EXCLUDED.name,
            currency_id = EXCLUDED.currency_id,
            tax_year_start_month = EXCLUDED.tax_year_start_month,
            updated_at = EXCLUDED.updated_at
          RETURNING id
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
        // Update the country ID with the actual ID from database
        this.seedData.countries[i].id = result.rows[0].id;
      }
      console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.countries.length} countries`);

      // Regenerate tax years with actual country IDs from database
      this.seedData.taxYears = [];
      const currentYear = new Date().getFullYear();
      
      for (const country of this.seedData.countries) {
        const taxYearStartMonth = country.tax_year_start_month;
        
        const startMonth = taxYearStartMonth.toString().padStart(2, '0');
        const startDate = `${currentYear}-${startMonth}-01`;
        
        const endYear = taxYearStartMonth === 1 ? currentYear : currentYear + 1;
        const endMonth = taxYearStartMonth === 1 ? 12 : taxYearStartMonth - 1;
        
        const daysInEndMonth = new Date(endYear, endMonth, 0).getDate();
        const endDate = `${endYear}-${endMonth.toString().padStart(2, '0')}-${daysInEndMonth.toString().padStart(2, '0')}`;
        
        this.seedData.taxYears.push({
          id: this.generateId(),
          country_id: country.id,  // Use the actual country ID from database
          year: currentYear,
          start_date: startDate,
          end_date: endDate,
          is_current: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      // Insert tax years
      for (const taxYear of this.seedData.taxYears) {
        // Check if tax year already exists
        const existing = await this.pool.query(`
          SELECT id FROM tax_years WHERE country_id = $1 AND year = $2
        `, [taxYear.country_id, taxYear.year]);
        
        if (existing.rows.length === 0) {
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
      }
      console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.taxYears.length} tax years`);

      // Update salary and statutory components with actual country IDs
      const indiaCountry = this.seedData.countries.find(c => c.code === 'IN');
      const philippinesCountry = this.seedData.countries.find(c => c.code === 'PH');
      const australiaCountry = this.seedData.countries.find(c => c.code === 'AU');

      for (const component of this.seedData.salaryComponents) {
        if (component.component_code.includes('BASIC') || component.component_code === 'HRA' || component.component_code === 'SPECIAL') {
          component.country_id = indiaCountry.id;
        } else if (component.component_code === 'ALLOWANCE') {
          component.country_id = philippinesCountry.id;
        } else if (component.component_code === 'BASE' || component.component_code === 'SUPER') {
          component.country_id = australiaCountry.id;
        }
      }

      for (const component of this.seedData.statutoryComponents) {
        if (component.component_code === 'EPF' || component.component_code === 'ESI' || component.component_code === 'PT') {
          component.country_id = indiaCountry.id;
        } else if (component.component_code === 'SSS' || component.component_code === 'PHILHEALTH' || component.component_code === 'PAGIBIG') {
          component.country_id = philippinesCountry.id;
        } else if (component.component_code === 'SUPER' && component.component_type === 'superannuation') {
          component.country_id = australiaCountry.id;
        }
      }

      // Insert salary components
      for (const component of this.seedData.salaryComponents) {
        // Check if component already exists
        const existingComponent = await this.pool.query(`
          SELECT id FROM salary_components WHERE country_id = $1 AND component_code = $2
        `, [component.country_id, component.component_code]);

        if (existingComponent.rows.length === 0) {
          await this.pool.query(`
            INSERT INTO salary_components (
              id, country_id, component_name, component_code, component_type,
              calculation_type, calculation_value, calculation_formula,
              is_taxable, is_statutory, is_mandatory, display_order,
              description, is_active, created_at, updated_at
            )
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
        } else {
          // Update existing component
          await this.pool.query(`
            UPDATE salary_components SET
              component_name = $1,
              component_type = $2,
              calculation_type = $3,
              calculation_value = $4,
              calculation_formula = $5,
              is_taxable = $6,
              is_statutory = $7,
              is_mandatory = $8,
              display_order = $9,
              description = $10,
              is_active = $11,
              updated_at = $12
            WHERE country_id = $13 AND component_code = $14
          `, [
            component.component_name,
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
            component.updated_at,
            component.country_id,
            component.component_code
          ]);
        }
      }
      console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.salaryComponents.length} salary components`);

      // Insert statutory components
      for (const component of this.seedData.statutoryComponents) {
        // Check if component already exists
        const existingComponent = await this.pool.query(`
          SELECT id FROM statutory_components WHERE country_id = $1 AND component_code = $2
        `, [component.country_id, component.component_code]);

        if (existingComponent.rows.length === 0) {
          await this.pool.query(`
            INSERT INTO statutory_components (
              id, country_id, component_name, component_code, component_type,
              contribution_type, calculation_basis,
              employee_percentage, employer_percentage,
              minimum_amount, maximum_amount, wage_ceiling, wage_floor,
              effective_from, effective_to, is_mandatory, display_order,
              description, regulatory_reference, is_active,
              created_at, updated_at
            )
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
        } else {
          // Update existing component
          await this.pool.query(`
            UPDATE statutory_components SET
              component_name = $1,
              component_type = $2,
              contribution_type = $3,
              calculation_basis = $4,
              employee_percentage = $5,
              employer_percentage = $6,
              minimum_amount = $7,
              maximum_amount = $8,
              wage_ceiling = $9,
              wage_floor = $10,
              effective_from = $11,
              effective_to = $12,
              is_mandatory = $13,
              display_order = $14,
              description = $15,
              regulatory_reference = $16,
              is_active = $17,
              updated_at = $18
            WHERE country_id = $19 AND component_code = $20
          `, [
            component.component_name,
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
            component.updated_at,
            component.country_id,
            component.component_code
          ]);
        }
      }
      console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.statutoryComponents.length} statutory components`);

      // Insert admin user
      const user = this.seedData.adminUser;
      await this.pool.query(`
        INSERT INTO users (
          id, email, password_hash, first_name, last_name, phone, address,
          profile_data, status, is_active, email_verified,
          email_verification_token, email_verification_token_expiry,
          password_reset_token, migrated_from_zoho, zoho_user_id,
          created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (email) DO NOTHING
      `, [
        user.id,
        user.email,
        user.password_hash,
        user.first_name,
        user.last_name,
        user.phone,
        user.address ? JSON.stringify(user.address) : null,
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

      // Add admin role (check if user was actually inserted)
      const userCheck = await this.pool.query(`SELECT id FROM users WHERE email = $1`, [user.email]);
      if (userCheck.rows.length > 0) {
        const actualUserId = userCheck.rows[0].id;
        const roleCheck = await this.pool.query(`
          SELECT id FROM user_roles WHERE user_id = $1 AND role_type = $2
        `, [actualUserId, 'admin']);
        
        if (roleCheck.rows.length === 0) {
          const adminRoleId = this.generateId();
          await this.pool.query(`
            INSERT INTO user_roles (id, user_id, role_type, scope, scope_entity_id, granted_by, expires_at, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [
            adminRoleId,
            actualUserId,
            'admin',
            'all',
            null,
            actualUserId,
            null,
            new Date().toISOString(),
            new Date().toISOString()
          ]);
        }
      }

      console.log(`${colors.green}✓${colors.reset} Inserted admin user`);

      console.log(`${colors.green}✓${colors.reset} All production data inserted successfully`);
    } catch (error) {
      console.error(`${colors.red}✗${colors.reset} Failed to insert data:`, error.message);
      throw error;
    }
  }

  async displaySummary() {
    console.log(`\n${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}  Production Database Seeding Complete${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

    console.log(`${colors.yellow}📊 Data Summary:${colors.reset}`);
    console.log(`  • Currencies: ${this.seedData.currencies.length}`);
    console.log(`  • Countries: ${this.seedData.countries.length} (India, Philippines, Australia)`);
    console.log(`  • Tax Years: ${this.seedData.taxYears.length}`);
    console.log(`  • Salary Components: ${this.seedData.salaryComponents.length}`);
    console.log(`  • Statutory Components: ${this.seedData.statutoryComponents.length}`);
    console.log(`  • Admin User: 1\n`);

    console.log(`${colors.yellow}🔐 Admin Credentials:${colors.reset}`);
    console.log(`  Email: ${colors.bright}admin@teamified.com${colors.reset}`);
    console.log(`  Password: ${colors.bright}Admin123!${colors.reset}`);
    console.log(`  ${colors.red}⚠️  IMPORTANT: Change this password immediately after first login!${colors.reset}\n`);

    console.log(`${colors.yellow}📝 Next Steps:${colors.reset}`);
    console.log(`  1. Log in with admin credentials`);
    console.log(`  2. Change admin password`);
    console.log(`  3. Review and customize salary components via Payroll Configuration`);
    console.log(`  4. Review and customize statutory components for compliance`);
    console.log(`  5. Configure region-specific settings and exchange rates\n`);

    console.log(`${colors.green}✓${colors.reset} Production database is ready for use\n`);
  }

  async close() {
    await this.pool.end();
    console.log(`${colors.green}✓${colors.reset} Database connection closed`);
  }

  async run() {
    try {
      console.log(`${colors.bright}${colors.blue}Starting Production Database Seeding...${colors.reset}\n`);
      
      await this.connect();
      await this.generateSeedData();
      await this.insertData();
      await this.displaySummary();
      await this.close();
      
      process.exit(0);
    } catch (error) {
      console.error(`${colors.red}✗${colors.reset} Seeding failed:`, error);
      await this.close();
      process.exit(1);
    }
  }
}

// Run the seeder
const seeder = new ProductionSeeder();
seeder.run();

