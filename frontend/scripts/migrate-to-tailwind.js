#!/usr/bin/env node

/**
 * Migration Script: Teamified Design System → Tailwind CSS
 * 
 * This script helps migrate components from custom CSS classes to Tailwind utility classes.
 * It provides automated suggestions and manual migration guidance.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Design token mappings
const designTokens = {
  // Typography
  'font-size-h1': 'text-h1',
  'font-size-h2': 'text-h2', 
  'font-size-h3': 'text-h3',
  'font-size-h4': 'text-h4',
  'font-size-h5': 'text-h5',
  'font-size-h6': 'text-h6',
  'font-size-body-large': 'text-body-large',
  'font-size-body-medium': 'text-body-medium',
  'font-size-body-small': 'text-body-small',
  
  // Font weights
  'font-weight-light': 'font-light',
  'font-weight-regular': 'font-regular',
  'font-weight-medium': 'font-medium',
  'font-weight-semibold': 'font-semibold',
  'font-weight-bold': 'font-bold',
  
  // Colors
  'color-brand-purple': 'bg-brand-purple',
  'color-brand-blue': 'bg-brand-blue',
  'color-text-primary': 'text-text-primary',
  'color-text-secondary': 'text-text-secondary',
  'color-text-tertiary': 'text-text-tertiary',
  'color-bg-primary': 'bg-bg-primary',
  'color-bg-secondary': 'bg-bg-secondary',
  'color-bg-tertiary': 'bg-bg-tertiary',
  'color-success': 'bg-success',
  'color-warning': 'bg-warning',
  'color-error': 'bg-error',
  'color-info': 'bg-info',
  
  // Spacing
  'spacing-1': 'p-1 m-1 gap-1',
  'spacing-2': 'p-2 m-2 gap-2',
  'spacing-3': 'p-3 m-3 gap-3',
  'spacing-4': 'p-4 m-4 gap-4',
  'spacing-5': 'p-5 m-5 gap-5',
  'spacing-6': 'p-6 m-6 gap-6',
  
  // Container widths
  'container-xl': 'max-w-container-xl',
  'container-lg': 'max-w-container-lg',
  'container-md': 'max-w-container-md',
  'container-sm': 'max-w-container-sm',
};

// Common CSS class patterns to Tailwind mappings
const commonMappings = {
  // Layout
  'flex': 'flex',
  'flex-col': 'flex-col',
  'flex-row': 'flex-row',
  'justify-center': 'justify-center',
  'justify-between': 'justify-between',
  'items-center': 'items-center',
  'grid': 'grid',
  'grid-cols-1': 'grid-cols-1',
  'grid-cols-2': 'grid-cols-2',
  'grid-cols-3': 'grid-cols-3',
  'grid-cols-4': 'grid-cols-4',
  
  // Spacing
  'p-4': 'p-4',
  'm-4': 'm-4',
  'mb-4': 'mb-4',
  'mt-4': 'mt-4',
  'ml-4': 'ml-4',
  'mr-4': 'mr-4',
  'px-4': 'px-4',
  'py-4': 'py-4',
  'gap-4': 'gap-4',
  
  // Colors
  'bg-white': 'bg-white',
  'bg-gray-100': 'bg-gray-100',
  'bg-blue-500': 'bg-blue-500',
  'text-gray-900': 'text-gray-900',
  'text-gray-600': 'text-gray-600',
  'text-white': 'text-white',
  
  // Borders
  'border': 'border',
  'border-gray-300': 'border-gray-300',
  'rounded': 'rounded',
  'rounded-md': 'rounded-md',
  'rounded-lg': 'rounded-lg',
  
  // Typography
  'text-lg': 'text-lg',
  'text-xl': 'text-xl',
  'text-2xl': 'text-2xl',
  'text-3xl': 'text-3xl',
  'font-bold': 'font-bold',
  'font-semibold': 'font-semibold',
  'font-medium': 'font-medium',
};

function findReactFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findReactFiles(fullPath));
    } else if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const analysis = {
    file: filePath,
    customClasses: [],
    suggestions: [],
    tailwindClasses: [],
  };
  
  lines.forEach((line, index) => {
    // Find className attributes
    const classNameMatch = line.match(/className\s*=\s*["']([^"']+)["']/);
    if (classNameMatch) {
      const classes = classNameMatch[1].split(/\s+/);
      
      classes.forEach(cls => {
        if (cls.startsWith('user-') || cls.startsWith('search-') || cls.startsWith('filter-')) {
          analysis.customClasses.push({
            line: index + 1,
            class: cls,
            context: line.trim()
          });
          
          // Generate suggestions
          if (cls.includes('container')) {
            analysis.suggestions.push({
              line: index + 1,
              old: cls,
              new: 'max-w-container-xl mx-auto p-6',
              reason: 'Container layout with max width and centering'
            });
          } else if (cls.includes('header')) {
            analysis.suggestions.push({
              line: index + 1,
              old: cls,
              new: 'mb-6',
              reason: 'Header spacing'
            });
          } else if (cls.includes('title')) {
            analysis.suggestions.push({
              line: index + 1,
              old: cls,
              new: 'text-h1 font-bold text-text-primary',
              reason: 'Main title styling'
            });
          } else if (cls.includes('button')) {
            analysis.suggestions.push({
              line: index + 1,
              old: cls,
              new: 'px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-deep-blue transition-colors',
              reason: 'Primary button styling'
            });
          }
        } else if (commonMappings[cls]) {
          analysis.tailwindClasses.push({
            line: index + 1,
            class: cls,
            context: line.trim()
          });
        }
      });
    }
  });
  
  return analysis;
}

function generateMigrationReport() {
  console.log('🔍 Analyzing React components for migration...\n');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const files = findReactFiles(srcDir);
  
  const report = {
    totalFiles: files.length,
    filesWithCustomClasses: 0,
    totalCustomClasses: 0,
    totalSuggestions: 0,
    fileAnalyses: []
  };
  
  files.forEach(file => {
    const analysis = analyzeFile(file);
    if (analysis.customClasses.length > 0) {
      report.filesWithCustomClasses++;
      report.totalCustomClasses += analysis.customClasses.length;
      report.totalSuggestions += analysis.suggestions.length;
      report.fileAnalyses.push(analysis);
    }
  });
  
  // Print summary
  console.log('📊 Migration Analysis Summary:');
  console.log(`   Total React files: ${report.totalFiles}`);
  console.log(`   Files with custom classes: ${report.filesWithCustomClasses}`);
  console.log(`   Total custom classes found: ${report.totalCustomClasses}`);
  console.log(`   Migration suggestions: ${report.totalSuggestions}\n`);
  
  // Print detailed analysis
  report.fileAnalyses.forEach(analysis => {
    console.log(`📁 ${path.relative(srcDir, analysis.file)}`);
    console.log(`   Custom classes: ${analysis.customClasses.length}`);
    console.log(`   Suggestions: ${analysis.suggestions.length}`);
    
    if (analysis.suggestions.length > 0) {
      console.log('   💡 Migration suggestions:');
      analysis.suggestions.forEach(suggestion => {
        console.log(`      Line ${suggestion.line}: ${suggestion.old} → ${suggestion.new}`);
        console.log(`         Reason: ${suggestion.reason}`);
      });
    }
    console.log('');
  });
  
  // Generate migration commands
  console.log('🚀 Migration Commands:');
  console.log('   1. Review the suggestions above');
  console.log('   2. Update className attributes in each file');
  console.log('   3. Test the components after migration');
  console.log('   4. Remove custom CSS files when done\n');
  
  return report;
}

function generateTailwindClasses() {
  console.log('🎨 Available Tailwind Classes with Design Tokens:\n');
  
  console.log('Typography:');
  console.log('  text-h1, text-h2, text-h3, text-h4, text-h5, text-h6');
  console.log('  text-body-large, text-body-medium, text-body-small');
  console.log('  font-light, font-regular, font-medium, font-semibold, font-bold\n');
  
  console.log('Colors:');
  console.log('  bg-brand-purple, bg-brand-blue, bg-brand-deep-purple, bg-brand-deep-blue');
  console.log('  text-text-primary, text-text-secondary, text-text-tertiary');
  console.log('  bg-bg-primary, bg-bg-secondary, bg-bg-tertiary');
  console.log('  bg-success, bg-warning, bg-error, bg-info\n');
  
  console.log('Spacing:');
  console.log('  p-1, p-2, p-3, p-4, p-5, p-6 (padding)');
  console.log('  m-1, m-2, m-3, m-4, m-5, m-6 (margin)');
  console.log('  gap-1, gap-2, gap-3, gap-4, gap-5, gap-6 (gap)\n');
  
  console.log('Layout:');
  console.log('  max-w-container-sm, max-w-container-md, max-w-container-lg, max-w-container-xl');
  console.log('  flex, flex-col, flex-row, justify-center, justify-between, items-center');
  console.log('  grid, grid-cols-1, grid-cols-2, grid-cols-3, grid-cols-4\n');
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🎯 Teamified Design System → Tailwind CSS Migration Tool\n');
  
  const command = process.argv[2];
  
  switch (command) {
    case 'analyze':
      generateMigrationReport();
      break;
    case 'classes':
      generateTailwindClasses();
      break;
    default:
      console.log('Usage: node migrate-to-tailwind.js [command]');
      console.log('');
      console.log('Commands:');
      console.log('  analyze  - Analyze React files for custom classes and generate migration suggestions');
      console.log('  classes  - Show available Tailwind classes with design tokens');
      console.log('');
      console.log('Examples:');
      console.log('  node migrate-to-tailwind.js analyze');
      console.log('  node migrate-to-tailwind.js classes');
      break;
  }
}

export {
  generateMigrationReport,
  generateTailwindClasses,
  designTokens,
  commonMappings
};
