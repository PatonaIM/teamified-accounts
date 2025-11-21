#!/usr/bin/env node

/**
 * Build Configuration Validator
 * 
 * Validates TypeScript configuration to prevent common deployment issues
 * Run before adding new modules or making configuration changes
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Build Configuration...\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: Verify tsconfig.json exists
const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
if (!fs.existsSync(tsconfigPath)) {
  console.error('❌ ERROR: tsconfig.json not found!');
  process.exit(1);
}

// Check 2: Parse and validate tsconfig.json
let tsconfig;
try {
  const content = fs.readFileSync(tsconfigPath, 'utf8');
  tsconfig = JSON.parse(content);
  console.log('✅ tsconfig.json is valid JSON');
} catch (error) {
  console.error('❌ ERROR: Failed to parse tsconfig.json:', error.message);
  process.exit(1);
}

// Check 3: Verify rootDir is set
if (!tsconfig.compilerOptions?.rootDir) {
  console.error('❌ ERROR: "rootDir" is not set in compilerOptions');
  console.error('   Add: "rootDir": "./src"');
  hasErrors = true;
} else if (tsconfig.compilerOptions.rootDir !== './src') {
  console.warn('⚠️  WARNING: rootDir is not "./src", got:', tsconfig.compilerOptions.rootDir);
  hasWarnings = true;
} else {
  console.log('✅ rootDir is correctly set to "./src"');
}

// Check 4: Verify outDir is set
if (!tsconfig.compilerOptions?.outDir) {
  console.error('❌ ERROR: "outDir" is not set in compilerOptions');
  console.error('   Add: "outDir": "./dist"');
  hasErrors = true;
} else if (tsconfig.compilerOptions.outDir !== './dist') {
  console.warn('⚠️  WARNING: outDir is not "./dist", got:', tsconfig.compilerOptions.outDir);
  hasWarnings = true;
} else {
  console.log('✅ outDir is correctly set to "./dist"');
}

// Check 5: Verify exclude patterns
const requiredExcludes = ['tests/**/*', 'dist/**/*', 'frontend/**/*', 'node_modules/**/*'];
const currentExcludes = tsconfig.exclude || [];

requiredExcludes.forEach(pattern => {
  if (!currentExcludes.includes(pattern)) {
    console.error(`❌ ERROR: Missing exclude pattern: "${pattern}"`);
    hasErrors = true;
  } else {
    console.log(`✅ Exclude pattern present: "${pattern}"`);
  }
});

// Check 6: Verify dist structure after build
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  const mainJsPath = path.join(distPath, 'main.js');
  const wrongMainJsPath = path.join(distPath, 'src', 'main.js');
  
  if (fs.existsSync(wrongMainJsPath)) {
    console.error('❌ ERROR: main.js found at dist/src/main.js instead of dist/main.js');
    console.error('   This indicates rootDir is not properly configured');
    console.error('   Run: rm -rf dist && npm run build');
    hasErrors = true;
  } else if (fs.existsSync(mainJsPath)) {
    console.log('✅ dist/main.js is in correct location');
  } else {
    console.warn('⚠️  WARNING: dist folder exists but no main.js found');
    console.warn('   Run: npm run build');
    hasWarnings = true;
  }
} else {
  console.warn('⚠️  WARNING: dist folder does not exist');
  console.warn('   Run: npm run build');
  hasWarnings = true;
}

// Check 7: Verify nest-cli.json
const nestCliPath = path.join(process.cwd(), 'nest-cli.json');
if (fs.existsSync(nestCliPath)) {
  try {
    const nestCli = JSON.parse(fs.readFileSync(nestCliPath, 'utf8'));
    if (nestCli.sourceRoot === 'src') {
      console.log('✅ nest-cli.json sourceRoot is "src"');
    } else {
      console.warn('⚠️  WARNING: nest-cli.json sourceRoot is not "src"');
      hasWarnings = true;
    }
  } catch (error) {
    console.warn('⚠️  WARNING: Could not parse nest-cli.json');
    hasWarnings = true;
  }
} else {
  console.warn('⚠️  WARNING: nest-cli.json not found');
  hasWarnings = true;
}

// Summary
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.error('❌ VALIDATION FAILED - Please fix errors above');
  console.error('\nRecommended fix:');
  console.error('1. Update tsconfig.json with correct rootDir and exclude patterns');
  console.error('2. Run: rm -rf dist && npm run build');
  console.error('3. Run: docker-compose -f docker-compose.dev.yml build backend');
  console.error('4. Run this validation script again\n');
  process.exit(1);
} else if (hasWarnings) {
  console.warn('⚠️  VALIDATION PASSED WITH WARNINGS');
  console.warn('Review warnings above - they may cause issues\n');
  process.exit(0);
} else {
  console.log('✅ ALL CHECKS PASSED - Build configuration is correct!\n');
  process.exit(0);
}

