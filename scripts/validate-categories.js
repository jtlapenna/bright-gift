#!/usr/bin/env node

/**
 * Category Validation Script
 * Validates category consistency across blog posts
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Configuration
const BLOG_DIR = 'src/content/blog';

// Expected categories and their mappings
const EXPECTED_CATEGORIES = {
  'gift-guides': 'gift-guides',
  'gift-tips': 'gift-tips',
  'educational': 'gift-tips', // Maps to gift-tips
  'data-driven': 'gift-tips'  // Maps to gift-tips
};

// Legacy category mappings (for migration tracking)
const LEGACY_CATEGORIES = {
  'educational': 'gift-tips',
  'data-driven': 'gift-tips'
};

class CategoryValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.stats = {
      totalFiles: 0,
      validCategories: 0,
      invalidCategories: 0,
      legacyCategories: 0,
      missingCategories: 0
    };
    this.categoryUsage = {};
  }

  async validateAllPosts() {
    console.log('📂 Starting category validation...\n');
    
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
    console.log(`📝 Validating categories in: ${filename}.md`);
    
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data: frontmatter } = matter(fileContent);
      
      const category = frontmatter.category;
      
      if (!category) {
        this.addError(filePath, 0,
          'Missing category field in frontmatter',
          'Add a category field to the frontmatter (e.g., category: gift-guides)');
        this.stats.missingCategories++;
        return;
      }
      
      // Track category usage
      this.categoryUsage[category] = (this.categoryUsage[category] || 0) + 1;
      
      // Check if category is valid
      if (this.isValidCategory(category)) {
        console.log(`✅ Valid category: ${category}`);
        this.stats.validCategories++;
      } else if (this.isLegacyCategory(category)) {
        console.log(`⚠️  Legacy category: ${category} (should be ${LEGACY_CATEGORIES[category]})`);
        this.addWarning(filePath, 0,
          `Legacy category '${category}' should be updated to '${LEGACY_CATEGORIES[category]}'`,
          `Update category field from '${category}' to '${LEGACY_CATEGORIES[category]}'`);
        this.stats.legacyCategories++;
        // Count legacy as valid for now (they work but should be updated)
        this.stats.validCategories++;
      } else {
        console.log(`❌ Invalid category: ${category}`);
        this.addError(filePath, 0,
          `Invalid category '${category}'`,
          `Use one of: ${Object.keys(EXPECTED_CATEGORIES).join(', ')}`);
        this.stats.invalidCategories++;
      }
      
    } catch (error) {
      this.addError(filePath, 0,
        `Error reading file: ${error.message}`,
        'Check file format and frontmatter syntax');
    }
  }

  isValidCategory(category) {
    return Object.keys(EXPECTED_CATEGORIES).includes(category);
  }

  isLegacyCategory(category) {
    return Object.keys(LEGACY_CATEGORIES).includes(category);
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
      categoryUsage: this.categoryUsage,
      errors: this.errors,
      warnings: this.warnings
    };
    
    fs.writeFileSync('category-validation-report.json', JSON.stringify(report, null, 2));
  }

  printSummary() {
    console.log('\n📊 CATEGORY VALIDATION RESULTS\n');
    console.log(`Total Files: ${this.stats.totalFiles}`);
    console.log(`Valid Categories: ${this.stats.validCategories}`);
    console.log(`Invalid Categories: ${this.stats.invalidCategories}`);
    console.log(`Legacy Categories: ${this.stats.legacyCategories}`);
    console.log(`Missing Categories: ${this.stats.missingCategories}`);
    
    if (this.categoryUsage && Object.keys(this.categoryUsage).length > 0) {
      console.log('\n📈 Category Usage:');
      Object.entries(this.categoryUsage)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, count]) => {
          const status = this.isValidCategory(category) ? '✅' : 
                        this.isLegacyCategory(category) ? '⚠️' : '❌';
          console.log(`  ${status} ${category}: ${count} posts`);
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
      console.log('\n✅ All categories are valid!');
    }
    
    console.log('\n📄 Detailed report saved to: category-validation-report.json');
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new CategoryValidator();
  validator.validateAllPosts().catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

module.exports = CategoryValidator;
