#!/usr/bin/env node

/**
 * Setup Neon Database Schema
 * This script sets up the database schema on your Neon database
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const connectionString = 'postgresql://neondb_owner:npg_sokSZ3PxOD8M@ep-silent-frost-a7fbns5i-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require';

async function setupDatabase() {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    console.log('🔌 Connecting to Neon database...');
    await client.connect();
    console.log('✅ Connected to database');

    console.log('📖 Reading init-db.sql...');
    const sqlContent = fs.readFileSync(path.join(__dirname, 'init-db.sql'), 'utf8');
    
    console.log('🚀 Running database schema setup...');
    await client.query(sqlContent);
    
    console.log('✅ Database schema setup completed successfully!');
    console.log('🎉 Your database is ready for the backend!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
