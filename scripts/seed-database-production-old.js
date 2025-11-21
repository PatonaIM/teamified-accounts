#!/usr/bin/env node

/**
 * Production Database Seeding Script
 * 
 * This script populates the database with PRODUCTION-READY data only:
 * - Countries (India, Philippines, Australia) with currencies and tax years
 * - Payroll configuration (region configs, salary components, statutory components)
 * - Exchange rates for multi-currency support
 * - One admin user (admin@teamified.com) for initial system access
 * 
 * ⚠️ SAFE FOR PRODUCTION - Contains NO test/fake data
 * 
 * Usage:
 *   node scripts/seed-database-production.js
 *   npm run seed:prod
 */

const { Pool } = require('pg');
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

class ProductionSeeder {
  constructor() {
    this.pool = new Pool(dbConfig);
    this.seedData = {
      currencies: [],
      countries: [],
      taxYears: [],
      regionConfigurations: [],
      exchangeRates: [],
      salaryComponents: [],
      statutoryComponents: [],
      adminUser: null,
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
        currency_code: 'INR',
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
        currency_code: 'PHP',
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
        currency_code: 'AUD',
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
        config_key: 'sss_rate',
        config_value: { employer: 9.5, employee: 4.5 },
        description: 'SSS contribution rates',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: this.generateId(),
        country_id: philippinesCountry.id,
        config_key: 'philhealth_rate',
        config_value: { employer: 2, employee: 2 },
        description: 'PhilHealth contribution rates',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: this.generateId(),
        country_id: philippinesCountry.id,
        config_key: 'pagibig_rate',
        config_value: { employer: 2, employee: 2 },
        description: 'Pag-IBIG contribution rates',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      // Australia configurations
      {
        id: this.generateId(),
        country_id: australiaCountry.id,
        config_key: 'superannuation_rate',
        config_value: { employer: 11, employee: 0 },
        description: 'Superannuation contribution rates',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Generate exchange rates
    const usdCurrency = this.seedData.currencies.find(c => c.code === 'USD');
    
    this.seedData.exchangeRates = [
      {
        id: this.generateId(),
        from_currency_id: usdCurrency.id,
        to_currency_id: inrCurrency.id,
        rate: 83.12,
        effective_date: new Date().toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: this.generateId(),
        from_currency_id: usdCurrency.id,
        to_currency_id: phpCurrency.id,
        rate: 56.45,
        effective_date: new Date().toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: this.generateId(),
        from_currency_id: usdCurrency.id,
        to_currency_id: audCurrency.id,
        rate: 1.52,
        effective_date: new Date().toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

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
          calculation_value: null,
          is_taxable: true,
          is_statutory: false,
          is_mandatory: true,
          display_order: 1,
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
          calculation_value: 40.00,
          is_taxable: true,
          is_statutory: false,
          is_mandatory: false,
          display_order: 2,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: indiaCountry.id,
          component_name: 'Conveyance Allowance',
          component_code: 'CONVEYANCE',
          component_type: 'earnings',
          calculation_type: 'fixed_amount',
          calculation_value: 1600.00,
          is_taxable: false,
          is_statutory: false,
          is_mandatory: false,
          display_order: 3,
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
          calculation_value: null,
          is_taxable: true,
          is_statutory: false,
          is_mandatory: false,
          display_order: 4,
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
          component_type: 'earning',
          calculation_type: 'fixed',
          is_taxable: true,
          is_statutory: false,
          display_order: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: philippinesCountry.id,
          component_name: 'Allowances',
          component_code: 'ALLOWANCES',
          component_type: 'earning',
          calculation_type: 'fixed',
          is_taxable: true,
          is_statutory: false,
          display_order: 2,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: philippinesCountry.id,
          component_name: '13th Month Pay',
          component_code: '13TH_MONTH',
          component_type: 'earning',
          calculation_type: 'percentage',
          is_taxable: false,
          is_statutory: true,
          display_order: 3,
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
          component_type: 'earning',
          calculation_type: 'fixed',
          is_taxable: true,
          is_statutory: false,
          display_order: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: australiaCountry.id,
          component_name: 'Allowances',
          component_code: 'ALLOWANCES',
          component_type: 'earning',
          calculation_type: 'fixed',
          is_taxable: true,
          is_statutory: false,
          display_order: 2,
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
          component_name: 'Provident Fund (Employee)',
          component_code: 'EPF_EMPLOYEE',
          component_type: 'deduction',
          calculation_type: 'percentage',
          calculation_base: 'basic',
          rate: 12.0,
          is_mandatory: true,
          applies_to: 'all',
          display_order: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: indiaCountry.id,
          component_name: 'Provident Fund (Employer)',
          component_code: 'EPF_EMPLOYER',
          component_type: 'contribution',
          calculation_type: 'percentage',
          calculation_base: 'basic',
          rate: 12.0,
          is_mandatory: true,
          applies_to: 'all',
          display_order: 2,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: indiaCountry.id,
          component_name: 'ESI (Employee)',
          component_code: 'ESI_EMPLOYEE',
          component_type: 'deduction',
          calculation_type: 'percentage',
          calculation_base: 'gross',
          rate: 0.75,
          threshold: 21000,
          is_mandatory: true,
          applies_to: 'below_threshold',
          display_order: 3,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: indiaCountry.id,
          component_name: 'ESI (Employer)',
          component_code: 'ESI_EMPLOYER',
          component_type: 'contribution',
          calculation_type: 'percentage',
          calculation_base: 'gross',
          rate: 3.25,
          threshold: 21000,
          is_mandatory: true,
          applies_to: 'below_threshold',
          display_order: 4,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: indiaCountry.id,
          component_name: 'Professional Tax',
          component_code: 'PT',
          component_type: 'deduction',
          calculation_type: 'slab',
          is_mandatory: true,
          applies_to: 'all',
          display_order: 5,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: indiaCountry.id,
          component_name: 'Tax Deducted at Source',
          component_code: 'TDS',
          component_type: 'deduction',
          calculation_type: 'progressive',
          is_mandatory: true,
          applies_to: 'all',
          display_order: 6,
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
          component_name: 'SSS (Employee)',
          component_code: 'SSS_EMPLOYEE',
          component_type: 'deduction',
          calculation_type: 'table',
          rate: 4.5,
          is_mandatory: true,
          applies_to: 'all',
          display_order: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: philippinesCountry.id,
          component_name: 'SSS (Employer)',
          component_code: 'SSS_EMPLOYER',
          component_type: 'contribution',
          calculation_type: 'table',
          rate: 9.5,
          is_mandatory: true,
          applies_to: 'all',
          display_order: 2,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: philippinesCountry.id,
          component_name: 'PhilHealth (Employee)',
          component_code: 'PHILHEALTH_EMPLOYEE',
          component_type: 'deduction',
          calculation_type: 'percentage',
          calculation_base: 'gross',
          rate: 2.0,
          is_mandatory: true,
          applies_to: 'all',
          display_order: 3,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: philippinesCountry.id,
          component_name: 'PhilHealth (Employer)',
          component_code: 'PHILHEALTH_EMPLOYER',
          component_type: 'contribution',
          calculation_type: 'percentage',
          calculation_base: 'gross',
          rate: 2.0,
          is_mandatory: true,
          applies_to: 'all',
          display_order: 4,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: philippinesCountry.id,
          component_name: 'Pag-IBIG (Employee)',
          component_code: 'PAGIBIG_EMPLOYEE',
          component_type: 'deduction',
          calculation_type: 'percentage',
          calculation_base: 'gross',
          rate: 2.0,
          is_mandatory: true,
          applies_to: 'all',
          display_order: 5,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: philippinesCountry.id,
          component_name: 'Pag-IBIG (Employer)',
          component_code: 'PAGIBIG_EMPLOYER',
          component_type: 'contribution',
          calculation_type: 'percentage',
          calculation_base: 'gross',
          rate: 2.0,
          is_mandatory: true,
          applies_to: 'all',
          display_order: 6,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: philippinesCountry.id,
          component_name: 'Withholding Tax',
          component_code: 'WHT',
          component_type: 'deduction',
          calculation_type: 'progressive',
          is_mandatory: true,
          applies_to: 'all',
          display_order: 7,
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
          component_name: 'Superannuation',
          component_code: 'SUPER',
          component_type: 'contribution',
          calculation_type: 'percentage',
          calculation_base: 'gross',
          rate: 11.0,
          is_mandatory: true,
          applies_to: 'all',
          display_order: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          country_id: australiaCountry.id,
          component_name: 'PAYG Withholding',
          component_code: 'PAYG',
          component_type: 'deduction',
          calculation_type: 'progressive',
          is_mandatory: true,
          applies_to: 'all',
          display_order: 2,
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
      // Insert currencies
      for (const currency of this.seedData.currencies) {
        await this.pool.query(`
          INSERT INTO currencies (id, code, name, symbol, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          currency.id,
          currency.code,
          currency.name,
          currency.symbol,
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

      // Insert salary components
      for (const component of this.seedData.salaryComponents) {
        await this.pool.query(`
          INSERT INTO salary_components (
            id, country_id, component_name, component_code, component_type,
            calculation_type, is_taxable, is_statutory, display_order,
            is_active, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          component.id,
          component.country_id,
          component.component_name,
          component.component_code,
          component.component_type,
          component.calculation_type,
          component.is_taxable,
          component.is_statutory,
          component.display_order,
          component.is_active,
          component.created_at,
          component.updated_at
        ]);
      }
      console.log(`${colors.green}✓${colors.reset} Inserted ${this.seedData.salaryComponents.length} salary components`);

      // Insert statutory components
      for (const component of this.seedData.statutoryComponents) {
        await this.pool.query(`
          INSERT INTO statutory_components (
            id, country_id, component_name, component_code, component_type,
            calculation_type, calculation_base, rate, threshold,
            is_mandatory, applies_to, display_order,
            is_active, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `, [
          component.id,
          component.country_id,
          component.component_name,
          component.component_code,
          component.component_type,
          component.calculation_type,
          component.calculation_base || null,
          component.rate || null,
          component.threshold || null,
          component.is_mandatory,
          component.applies_to,
          component.display_order,
          component.is_active,
          component.created_at,
          component.updated_at
        ]);
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

      // Add admin role
      const adminRoleId = this.generateId();
      await this.pool.query(`
        INSERT INTO user_roles (id, user_id, role_type, scope, scope_entity_id, granted_by, expires_at, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        adminRoleId,
        user.id,
        'admin',
        'global',
        null,
        user.id,
        null,
        new Date().toISOString(),
        new Date().toISOString()
      ]);

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
    console.log(`  • Region Configurations: ${this.seedData.regionConfigurations.length}`);
    console.log(`  • Exchange Rates: ${this.seedData.exchangeRates.length}`);
    console.log(`  • Salary Components: ${this.seedData.salaryComponents.length}`);
    console.log(`  • Statutory Components: ${this.seedData.statutoryComponents.length}`);
    console.log(`  • Admin User: 1\n`);

    console.log(`${colors.yellow}🔐 Admin Credentials:${colors.reset}`);
    console.log(`  Email: ${colors.bright}admin@teamified.com${colors.reset}`);
    console.log(`  Password: ${colors.bright}Admin123!${colors.reset}`);
    console.log(`  ${colors.red}⚠️  IMPORTANT: Change this password immediately after first login!${colors.reset}\n`);

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

