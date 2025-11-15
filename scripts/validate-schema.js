#!/usr/bin/env node

/**
 * Schema Validation Script
 * Validates structured data markup (JSON-LD) across blog posts
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Configuration
const BLOG_DIR = 'src/content/blog';

// Required schema fields for different content types
const SCHEMA_REQUIREMENTS = {
  'gift-guides': {
    required: ['@context', '@type', 'headline', 'description', 'author', 'datePublished', 'dateModified'],
    optional: ['image', 'publisher', 'mainEntityOfPage', 'keywords', 'articleSection']
  },
  'educational': {
    required: ['@context', '@type', 'headline', 'description', 'author', 'datePublished', 'dateModified'],
    optional: ['image', 'publisher', 'mainEntityOfPage', 'keywords', 'articleSection']
  },
  'data-driven': {
    required: ['@context', '@type', 'headline', 'description', 'author', 'datePublished', 'dateModified'],
    optional: ['image', 'publisher', 'mainEntityOfPage', 'keywords', 'articleSection']
  }
};

// Expected schema types
const EXPECTED_TYPES = ['Article', 'BlogPosting', 'WebPage'];

class SchemaValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.stats = {
      totalFiles: 0,
      validSchemas: 0,
      invalidSchemas: 0,
      missingSchemas: 0,
      schemaTypes: {}
    };
  }

  async validateAllPosts() {
    console.log('📋 Starting schema validation...\n');
    
    const blogFiles = this.getBlogFiles();
    this.stats.totalFiles = blogFiles.length;
    
    for (const file of blogFiles) {
      await this.validatePost(file);
    }
    
    this.generateReport();
    this.printSummary();
    
    // Exit with error code if there are validation errors
    if (this.errors.length > 0) {
      process.exit(1);
    }
  }

  getBlogFiles() {
    const blogDir = path.join(process.cwd(), BLOG_DIR);
    return fs.readdirSync(blogDir)
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(blogDir, file));
  }

  async validatePost(filePath) {
    const filename = path.basename(filePath, '.md');
    console.log(`📝 Validating schema requirements for: ${filename}.md`);
    
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data: frontmatter } = matter(fileContent);
      
      const category = frontmatter.category || 'gift-guides';
      
      // Check if required frontmatter fields exist for schema generation
      const validation = this.validateSchemaRequirements(frontmatter, category, filePath);
      
      if (validation.isValid) {
        console.log(`✅ Schema requirements met`);
        this.stats.validSchemas++;
        
        // Track schema types based on category
        const schemaType = this.getExpectedSchemaType(category);
        this.stats.schemaTypes[schemaType] = (this.stats.schemaTypes[schemaType] || 0) + 1;
      } else {
        console.log(`❌ Schema requirements not met: ${validation.errors.join(', ')}`);
        this.stats.invalidSchemas++;
        
        validation.errors.forEach(error => {
          this.addError(filePath, 0, error.message, error.fix);
        });
      }
      
    } catch (error) {
      this.addError(filePath, 0,
        `Error reading file: ${error.message}`,
        'Check file format and content structure');
    }
  }

  validateSchemaRequirements(frontmatter, category, filePath) {
    const errors = [];
    
    // Required fields for schema generation
    const requiredFields = ['title', 'description', 'date'];
    
    requiredFields.forEach(field => {
      if (!frontmatter[field]) {
        errors.push({
          message: `Missing required field for schema: ${field}`,
          fix: `Add '${field}' field to frontmatter`
        });
      }
    });
    
    // Check title length (SEO best practice)
    if (frontmatter.title && frontmatter.title.length > 60) {
      errors.push({
        message: `Title too long: ${frontmatter.title.length} characters (max 60)`,
        fix: 'Shorten title to 60 characters or less'
      });
    }
    
    // Check description length (SEO best practice)
    if (frontmatter.description && frontmatter.description.length > 160) {
      errors.push({
        message: `Description too long: ${frontmatter.description.length} characters (max 160)`,
        fix: 'Shorten description to 160 characters or less'
      });
    }
    
    // Check date format (accept both YYYY-MM-DD strings and Date objects)
    if (frontmatter.date) {
      if (typeof frontmatter.date === 'string' && !this.isValidDate(frontmatter.date)) {
        errors.push({
          message: `Invalid date format: ${frontmatter.date}`,
          fix: 'Use YYYY-MM-DD format for date'
        });
      } else if (frontmatter.date instanceof Date && !this.isValidDateObject(frontmatter.date)) {
        errors.push({
          message: `Invalid date object: ${frontmatter.date}`,
          fix: 'Use a valid date format (will be converted by content config)'
        });
      }
    }
    
    // Check for image fields (recommended for schema)
    if (!frontmatter.image) {
      errors.push({
        message: 'Missing image field (recommended for schema)',
        fix: 'Add image field to frontmatter for better SEO'
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getExpectedSchemaType(category) {
    const typeMapping = {
      'gift-guides': 'Article',
      'educational': 'Article', 
      'data-driven': 'Article'
    };
    return typeMapping[category] || 'Article';
  }

  validateSchema(schema, category, filePath) {
    const errors = [];
    const requirements = SCHEMA_REQUIREMENTS[category] || SCHEMA_REQUIREMENTS['gift-guides'];
    
    // Check required fields
    requirements.required.forEach(field => {
      if (!schema[field]) {
        errors.push({
          message: `Missing required field: ${field}`,
          fix: `Add '${field}' field to JSON-LD schema`
        });
      }
    });
    
    // Check @context
    if (schema['@context'] !== 'https://schema.org') {
      errors.push({
        message: 'Invalid @context, should be "https://schema.org"',
        fix: 'Set @context to "https://schema.org"'
      });
    }
    
    // Check @type
    if (!schema['@type'] || !EXPECTED_TYPES.includes(schema['@type'])) {
      errors.push({
        message: `Invalid @type: ${schema['@type'] || 'missing'}`,
        fix: `Use one of: ${EXPECTED_TYPES.join(', ')}`
      });
    }
    
    // Check required string fields
    const stringFields = ['headline', 'description', 'author'];
    stringFields.forEach(field => {
      if (schema[field] && typeof schema[field] !== 'string') {
        errors.push({
          message: `Field '${field}' should be a string`,
          fix: `Convert '${field}' to a string value`
        });
      }
    });
    
    // Check date fields
    const dateFields = ['datePublished', 'dateModified'];
    dateFields.forEach(field => {
      if (schema[field] && !this.isValidDate(schema[field])) {
        errors.push({
          message: `Invalid date format for '${field}': ${schema[field]}`,
          fix: `Use ISO 8601 date format (e.g., "2025-01-01T00:00:00Z")`
        });
      }
    });
    
    // Check author structure
    if (schema.author && typeof schema.author === 'object') {
      if (!schema.author['@type'] || schema.author['@type'] !== 'Person') {
        errors.push({
          message: 'Author should have @type: "Person"',
          fix: 'Add @type: "Person" to author object'
        });
      }
      if (!schema.author.name) {
        errors.push({
          message: 'Author should have a name field',
          fix: 'Add name field to author object'
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isValidDate(dateString) {
    if (typeof dateString !== 'string') return false;
    
    // Check ISO 8601 format
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    if (isoRegex.test(dateString)) return true;
    
    // Check simple date format (YYYY-MM-DD)
    const simpleRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (simpleRegex.test(dateString)) return true;
    
    return false;
  }

  // Check if date is a valid Date object (will be converted by content config)
  isValidDateObject(dateValue) {
    return dateValue instanceof Date && !isNaN(dateValue.getTime());
  }

  addError(filePath, line, message, fix) {
    this.errors.push({
      file: path.basename(filePath),
      line,
      message,
      fix,
      severity: 'error'
    });
  }

  addWarning(filePath, line, message, fix) {
    this.warnings.push({
      file: path.basename(filePath),
      line,
      message,
      fix,
      severity: 'warning'
    });
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.stats,
      errors: this.errors,
      warnings: this.warnings
    };
    
    const reportPath = path.join(__dirname, '../_workflow-documents/reports/schema-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  }

  printSummary() {
    console.log('\n📊 SCHEMA VALIDATION RESULTS\n');
    console.log(`Total Files: ${this.stats.totalFiles}`);
    console.log(`Valid Schema Requirements: ${this.stats.validSchemas}`);
    console.log(`Invalid Schema Requirements: ${this.stats.invalidSchemas}`);
    console.log(`Missing Schema Requirements: ${this.stats.missingSchemas}`);
    
    if (Object.keys(this.stats.schemaTypes).length > 0) {
      console.log('\n📈 Expected Schema Types:');
      Object.entries(this.stats.schemaTypes)
        .sort(([,a], [,b]) => b - a)
        .forEach(([type, count]) => {
          console.log(`  ✅ ${type}: ${count} posts`);
        });
    }
    
    if (this.errors.length > 0) {
      console.log('\n🚨 ERRORS FOUND:');
      this.errors.forEach(error => {
        console.log(`  ${error.file}:${error.line} - ${error.message}`);
        console.log(`    Fix: ${error.fix}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => {
        console.log(`  ${warning.file}:${warning.line} - ${warning.message}`);
        console.log(`    Fix: ${warning.fix}`);
      });
    }
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ All schema requirements are met!');
    }
    
    console.log('\n📄 Detailed report saved to: _workflow-documents/reports/schema-validation-report.json');
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new SchemaValidator();
  validator.validateAllPosts().catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

module.exports = SchemaValidator;
