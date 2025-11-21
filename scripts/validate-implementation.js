#!/usr/bin/env node

/**
 * Implementation Validation Script
 * 
 * This script validates that new implementations follow the established patterns
 * and avoid common issues that can cause compilation errors or runtime problems.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ImplementationValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.srcPath = path.join(__dirname, '..', 'src');
  }

  /**
   * Main validation function
   */
  async validate() {
    console.log('🔍 Validating implementation patterns...\n');

    await this.validateControllers();
    await this.validateModules();
    await this.validateDTOs();
    await this.validateImports();

    this.printResults();
    return this.errors.length === 0;
  }

  /**
   * Validate controller implementations
   */
  async validateControllers() {
    const controllers = this.findFiles('**/controllers/*.controller.ts');
    
    for (const controller of controllers) {
      const content = fs.readFileSync(controller, 'utf8');
      
      // Check route prefix
      if (content.includes("@Controller('api/") || content.includes('@Controller("api/')) {
        this.errors.push({
          file: controller,
          issue: 'Controller uses incorrect route prefix',
          details: 'Use @Controller(\'v1/feature-name\') instead of @Controller(\'api/v1/feature-name\')',
          line: this.findLineNumber(content, '@Controller')
        });
      }

      // Check for authentication guards in @UseGuards decorators
      const hasJwtGuard = content.includes('JwtAuthGuard');
      const hasRolesGuard = content.includes('RolesGuard');
      const hasUseGuards = content.includes('@UseGuards(');
      
      
      if (hasUseGuards && (hasJwtGuard || hasRolesGuard)) {
        // Check if AuthModule import is mentioned in module file
        const moduleFile = controller.replace('controllers/', '').replace('.controller.ts', '.module.ts');
        if (fs.existsSync(moduleFile)) {
          const moduleContent = fs.readFileSync(moduleFile, 'utf8');
          if (!moduleContent.includes('AuthModule')) {
            this.errors.push({
              file: moduleFile,
              issue: 'Missing AuthModule import',
              details: 'Module using authentication guards must import AuthModule',
              line: this.findLineNumber(moduleContent, 'imports:')
            });
          }
        }
      }

      // Check import paths for auth components
      if (content.includes("from '../../auth/guards/") || content.includes('from "../../auth/guards/')) {
        this.errors.push({
          file: controller,
          issue: 'Incorrect import path for auth guards',
          details: 'Use \'../../common/guards/\' instead of \'../../auth/guards/\'',
          line: this.findLineNumber(content, "from '../../auth/guards/")
        });
      }

      if (content.includes("from '../../auth/decorators/") || content.includes('from "../../auth/decorators/')) {
        this.errors.push({
          file: controller,
          issue: 'Incorrect import path for auth decorators',
          details: 'Use \'../../common/decorators/\' instead of \'../../auth/decorators/\'',
          line: this.findLineNumber(content, "from '../../auth/decorators/")
        });
      }

      // Check for proper Swagger documentation (skip public endpoints)
      const isPublicEndpoint = content.includes("@ApiSecurity('public')") || content.includes('@ApiSecurity("public")');
      if (!content.includes('@ApiBearerAuth') && !isPublicEndpoint) {
        this.warnings.push({
          file: controller,
          issue: 'Missing Swagger authentication documentation',
          details: 'Add @ApiBearerAuth() decorator for authenticated controllers',
          line: this.findLineNumber(content, '@Controller')
        });
      }

      // Check for consistent @ApiBearerAuth usage (no parameters)
      if (content.includes('@ApiBearerAuth(') && !content.includes('@ApiBearerAuth()')) {
        this.errors.push({
          file: controller,
          issue: 'Inconsistent @ApiBearerAuth usage',
          details: 'Use @ApiBearerAuth() without parameters for consistency',
          line: this.findLineNumber(content, '@ApiBearerAuth(')
        });
      }
    }
  }

  /**
   * Validate module implementations
   */
  async validateModules() {
    const modules = this.findFiles('**/*.module.ts');
    
    for (const module of modules) {
      const content = fs.readFileSync(module, 'utf8');
      
      // Check if module has controllers that use auth but doesn't import AuthModule
      const hasControllers = content.includes('controllers:');
      const importsAuthModule = content.includes('AuthModule');
      
      if (hasControllers && !importsAuthModule) {
        // Check if any controller in this module uses auth guards
        const moduleDir = path.dirname(module);
        // Find controller files in the module directory only
        const controllerFiles = this.findFilesInDirectory(moduleDir, '*.controller.ts');
        
        
        let usesAuth = false;
        for (const controller of controllerFiles) {
          const controllerContent = fs.readFileSync(controller, 'utf8');
          const hasJwtGuard = controllerContent.includes('JwtAuthGuard');
          const hasRolesGuard = controllerContent.includes('RolesGuard');
          const hasUseGuards = controllerContent.includes('@UseGuards(');
          
          if (hasUseGuards && (hasJwtGuard || hasRolesGuard)) {
            usesAuth = true;
            break;
          }
        }
        
        if (usesAuth) {
          this.errors.push({
            file: module,
            issue: 'Missing AuthModule import for module with authentication',
            details: 'Add AuthModule to imports array when controllers use auth guards',
            line: this.findLineNumber(content, 'imports:')
          });
        }
      }
    }
  }

  /**
   * Validate DTO implementations
   */
  async validateDTOs() {
    const dtos = this.findFiles('**/dto/*.dto.ts');
    
    for (const dto of dtos) {
      const content = fs.readFileSync(dto, 'utf8');
      
      // Check for problematic validation decorators
      if (content.includes('@IsDecimal({ decimal_digits:')) {
        this.errors.push({
          file: dto,
          issue: 'Overly restrictive decimal validation',
          details: 'Use @IsNumber() instead of @IsDecimal({ decimal_digits: \'0,2\' })',
          line: this.findLineNumber(content, '@IsDecimal')
        });
      }

      // Check for missing error messages
      const validationDecorators = content.match(/@Is\w+\([^)]*\)/g) || [];
      for (const decorator of validationDecorators) {
        if (!decorator.includes('message:') && !decorator.includes('@IsOptional')) {
          this.warnings.push({
            file: dto,
            issue: 'Validation decorator missing custom error message',
            details: `Add custom error message to ${decorator}`,
            line: this.findLineNumber(content, decorator)
          });
        }
      }
    }
  }

  /**
   * Validate import statements
   */
  async validateImports() {
    const files = this.findFiles('**/*.ts').filter(file => 
      !file.includes('.spec.ts') && 
      !file.includes('.test.ts') &&
      !file.includes('node_modules')
    );
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for incorrect auth imports
      const incorrectAuthImports = [
        "from '../../auth/guards/",
        "from '../../auth/decorators/",
        'from "../../auth/guards/',
        'from "../../auth/decorators/'
      ];
      
      for (const importPath of incorrectAuthImports) {
        if (content.includes(importPath)) {
          this.errors.push({
            file: file,
            issue: 'Incorrect auth import path',
            details: 'Use \'../../common/\' instead of \'../../auth/\' for guards and decorators',
            line: this.findLineNumber(content, importPath)
          });
        }
      }
    }
  }

  /**
   * Find files matching pattern
   */
  findFiles(pattern) {
    try {
      const result = execSync(`find ${this.srcPath} -name "${pattern.split('/').pop()}" -type f`, { 
        encoding: 'utf8',
        cwd: path.join(__dirname, '..')
      });
      return result.trim().split('\n').filter(file => file.length > 0);
    } catch (error) {
      // Fallback to manual search for simpler patterns
      return this.findFilesRecursive(this.srcPath, pattern.split('/').pop());
    }
  }

  /**
   * Find files matching pattern in specific directory
   */
  findFilesInDirectory(dir, pattern) {
    try {
      const result = execSync(`find "${dir}" -name "${pattern}" -type f`, { 
        encoding: 'utf8',
        cwd: path.join(__dirname, '..')
      });
      return result.trim().split('\n').filter(file => file.length > 0);
    } catch (error) {
      // Fallback to manual search for simpler patterns
      return this.findFilesRecursive(dir, pattern);
    }
  }

  /**
   * Recursive file finder fallback
   */
  findFilesRecursive(dir, filename) {
    const files = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...this.findFilesRecursive(fullPath, filename));
        } else if (item === filename || item.includes(filename)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
    
    return files;
  }

  /**
   * Find line number for a search term
   */
  findLineNumber(content, searchTerm) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchTerm)) {
        return i + 1;
      }
    }
    return null;
  }

  /**
   * Print validation results
   */
  printResults() {
    console.log('📊 Validation Results:\n');

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All validations passed! No issues found.\n');
      return;
    }

    if (this.errors.length > 0) {
      console.log(`❌ Found ${this.errors.length} error(s):\n`);
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.issue}`);
        console.log(`   File: ${error.file}`);
        console.log(`   Line: ${error.line || 'Unknown'}`);
        console.log(`   Details: ${error.details}\n`);
      });
    }

    if (this.warnings.length > 0) {
      console.log(`⚠️  Found ${this.warnings.length} warning(s):\n`);
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.issue}`);
        console.log(`   File: ${warning.file}`);
        console.log(`   Line: ${warning.line || 'Unknown'}`);
        console.log(`   Details: ${warning.details}\n`);
      });
    }

    console.log('📚 For help with these issues, see:');
    console.log('   - docs/development/quick-reference.md');
    console.log('   - docs/development/feature-development-checklist.md');
    console.log('   - docs/architecture/coding-standards.md\n');
  }
}

// Run validation if script is executed directly
if (require.main === module) {
  const validator = new ImplementationValidator();
  validator.validate().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });
}

module.exports = ImplementationValidator;
