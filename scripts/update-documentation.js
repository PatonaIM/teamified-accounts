#!/usr/bin/env node

/**
 * Documentation Update Script
 * 
 * This script helps maintain API documentation by:
 * 1. Validating Swagger documentation
 * 2. Checking for missing documentation
 * 3. Generating documentation reports
 * 4. Updating documentation version
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DocumentationUpdater {
  constructor() {
    this.swaggerPath = path.join(__dirname, '..', 'swagger-docs.json');
    this.mainTsPath = path.join(__dirname, '..', 'src', 'main.ts');
  }

  /**
   * Main execution method
   */
  async run() {
    console.log('🚀 Starting documentation update process...\n');

    try {
      // Step 1: Build the application
      console.log('📦 Building application...');
      this.buildApplication();

      // Step 2: Generate Swagger documentation
      console.log('📚 Generating Swagger documentation...');
      await this.generateSwaggerDocs();

      // Step 3: Validate documentation
      console.log('✅ Validating documentation...');
      this.validateDocumentation();

      // Step 4: Generate report
      console.log('📊 Generating documentation report...');
      this.generateReport();

      console.log('\n🎉 Documentation update completed successfully!');
    } catch (error) {
      console.error('\n❌ Documentation update failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Build the application
   */
  buildApplication() {
    try {
      execSync('npm run build', { stdio: 'pipe' });
      console.log('✅ Application built successfully');
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
  }

  /**
   * Generate Swagger documentation
   */
  async generateSwaggerDocs() {
    return new Promise((resolve, reject) => {
      // Start the application
      const app = execSync('npm run start:prod', { 
        stdio: 'pipe',
        detached: true 
      });

      // Wait for application to start
      setTimeout(async () => {
        try {
          // Generate Swagger JSON
          const response = await fetch('http://localhost:3000/api/docs-json');
          const swaggerDoc = await response.json();

          // Save to file
          fs.writeFileSync(this.swaggerPath, JSON.stringify(swaggerDoc, null, 2));
          console.log('✅ Swagger documentation generated');

          // Kill the application
          process.kill(-app.pid);
          resolve();
        } catch (error) {
          process.kill(-app.pid);
          reject(new Error(`Failed to generate Swagger docs: ${error.message}`));
        }
      }, 10000);
    });
  }

  /**
   * Validate documentation
   */
  validateDocumentation() {
    if (!fs.existsSync(this.swaggerPath)) {
      throw new Error('Swagger documentation file not found');
    }

    const swaggerDoc = JSON.parse(fs.readFileSync(this.swaggerPath, 'utf8'));

    // Check required fields
    const requiredFields = ['openapi', 'info', 'paths'];
    for (const field of requiredFields) {
      if (!swaggerDoc[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Check for documented endpoints
    const paths = swaggerDoc.paths || {};
    if (Object.keys(paths).length === 0) {
      throw new Error('No API endpoints documented');
    }

    // Check for proper documentation structure
    for (const [path, methods] of Object.entries(paths)) {
      for (const [method, details] of Object.entries(methods)) {
        if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
          if (!details.summary) {
            throw new Error(`Missing summary for ${method.toUpperCase()} ${path}`);
          }
          if (!details.responses) {
            throw new Error(`Missing responses for ${method.toUpperCase()} ${path}`);
          }
        }
      }
    }

    console.log(`✅ Documentation validated (${Object.keys(paths).length} endpoints)`);
  }

  /**
   * Generate documentation report
   */
  generateReport() {
    const swaggerDoc = JSON.parse(fs.readFileSync(this.swaggerPath, 'utf8'));
    const paths = swaggerDoc.paths || {};

    // Count endpoints by method
    const methods = {};
    for (const [path, pathMethods] of Object.entries(paths)) {
      for (const method of Object.keys(pathMethods)) {
        if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
          methods[method.toUpperCase()] = (methods[method.toUpperCase()] || 0) + 1;
        }
      }
    }

    // Generate report
    const report = `# API Documentation Report

## Summary
- **Total Endpoints:** ${Object.keys(paths).length}
- **API Version:** ${swaggerDoc.info?.version || 'Unknown'}
- **OpenAPI Version:** ${swaggerDoc.openapi || 'Unknown'}
- **Generated:** ${new Date().toISOString()}

## Endpoints by Method
${Object.entries(methods)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([method, count]) => `- **${method}:** ${count}`)
  .join('\n')}

## Documented Endpoints
${Object.keys(paths)
  .sort()
  .map(path => `- \`${path}\``)
  .join('\n')}

## Documentation Quality
- ✅ All endpoints have summaries
- ✅ All endpoints have response documentation
- ✅ Documentation structure is valid
- ✅ Swagger JSON is valid

## Next Steps
1. Review the generated Swagger UI at http://localhost:3000/api/docs
2. Test all documented endpoints
3. Verify error responses are comprehensive
4. Update examples if needed
`;

    const reportPath = path.join(__dirname, '..', 'documentation-report.md');
    fs.writeFileSync(reportPath, report);
    console.log('✅ Documentation report generated');
  }

  /**
   * Update documentation version
   */
  updateVersion(newVersion) {
    if (!fs.existsSync(this.mainTsPath)) {
      throw new Error('main.ts file not found');
    }

    let content = fs.readFileSync(this.mainTsPath, 'utf8');
    
    // Update version in DocumentBuilder
    const versionRegex = /\.setVersion\('([^']+)'\)/;
    const match = content.match(versionRegex);
    
    if (match) {
      content = content.replace(versionRegex, `.setVersion('${newVersion}')`);
      fs.writeFileSync(this.mainTsPath, content);
      console.log(`✅ Version updated to ${newVersion}`);
    } else {
      throw new Error('Version not found in main.ts');
    }
  }
}

// CLI interface
if (require.main === module) {
  const updater = new DocumentationUpdater();
  
  const args = process.argv.slice(2);
  if (args[0] === '--version' && args[1]) {
    updater.updateVersion(args[1]);
  } else {
    updater.run();
  }
}

module.exports = DocumentationUpdater;
