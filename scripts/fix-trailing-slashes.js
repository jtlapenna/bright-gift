#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const SITE_URL = 'https://bright-gift.com';
const SITE_URL_WITH_SLASH = 'https://bright-gift.com/';

// File patterns to process
const FILE_PATTERNS = [
  'src/**/*.astro',
  'src/**/*.ts',
  'src/**/*.js',
  'src/**/*.md',
  'public/**/*.html',
  'public/**/*.xml',
  'public/**/*.txt'
];

// Patterns to fix
const FIX_PATTERNS = [
  // Fix double slashes
  {
    pattern: /https:\/\/bright-gift\.com\/\//g,
    replacement: 'https://bright-gift.com/',
    description: 'Fix double slashes'
  },
  // Fix URLs without trailing slashes (but not for specific cases)
  {
    pattern: /https:\/\/bright-gift\.com(?![\/\w\-\.])/g,
    replacement: 'https://bright-gift.com/',
    description: 'Add trailing slashes to root URLs'
  },
  // Fix blog URLs without trailing slashes
  {
    pattern: /https:\/\/bright-gift\.com\/blog\/([^\/\s"']+)(?![\/\w\-\.])/g,
    replacement: 'https://bright-gift.com/blog/$1/',
    description: 'Add trailing slashes to blog URLs'
  },
  // Fix category URLs without trailing slashes
  {
    pattern: /https:\/\/bright-gift\.com\/category\/([^\/\s"']+)(?![\/\w\-\.])/g,
    replacement: 'https://bright-gift.com/category/$1/',
    description: 'Add trailing slashes to category URLs'
  },
  // Fix static page URLs without trailing slashes
  {
    pattern: /https:\/\/bright-gift\.com\/(privacy|terms|data-deletion|oauth\/callback|care-calculator)(?![\/\w\-\.])/g,
    replacement: 'https://bright-gift.com/$1/',
    description: 'Add trailing slashes to static page URLs'
  },
  // Fix relative URLs that should have trailing slashes
  {
    pattern: /href="\/(blog|category|privacy|terms|data-deletion|oauth\/callback|care-calculator)"(?![\/\w\-\.])/g,
    replacement: 'href="/$1/"',
    description: 'Add trailing slashes to relative URLs'
  },
  // Fix canonical URLs in meta tags
  {
    pattern: /canonical="https:\/\/bright-gift\.com(?![\/\w\-\.])/g,
    replacement: 'canonical="https://bright-gift.com/',
    description: 'Fix canonical URLs'
  },
  // Fix structured data URLs
  {
    pattern: /"url":\s*"https:\/\/bright-gift\.com(?![\/\w\-\.])/g,
    replacement: '"url": "https://bright-gift.com/',
    description: 'Fix structured data URLs'
  },
  // Fix preconnect and dns-prefetch URLs
  {
    pattern: /(preconnect|dns-prefetch)\s+href="https:\/\/bright-gift\.com"(?![\/\w\-\.])/g,
    replacement: '$1 href="https://bright-gift.com/"',
    description: 'Fix preconnect/dns-prefetch URLs'
  }
];

// Files to exclude from processing
const EXCLUDE_PATTERNS = [
  'node_modules/**',
  'dist/**',
  '.git/**',
  '*.log',
  'package-lock.json',
  'internal-link-audit-report.json'
];

class TrailingSlashFixer {
  constructor() {
    this.filesProcessed = 0;
    this.filesModified = 0;
    this.totalReplacements = 0;
    this.errors = [];
  }

  // Get all files matching the patterns
  getFilesToProcess() {
    const allFiles = [];
    
    FILE_PATTERNS.forEach(pattern => {
      const files = glob.sync(pattern, { 
        ignore: EXCLUDE_PATTERNS,
        cwd: process.cwd()
      });
      allFiles.push(...files);
    });

    // Remove duplicates
    return [...new Set(allFiles)];
  }

  // Check if file should be processed
  shouldProcessFile(filePath) {
    // Skip if file doesn't exist
    if (!fs.existsSync(filePath)) {
      return false;
    }

    // Skip binary files
    const ext = path.extname(filePath).toLowerCase();
    const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
    if (binaryExtensions.includes(ext)) {
      return false;
    }

    return true;
  }

  // Process a single file
  processFile(filePath) {
    try {
      if (!this.shouldProcessFile(filePath)) {
        return;
      }

      const originalContent = fs.readFileSync(filePath, 'utf8');
      let content = originalContent;
      let fileReplacements = 0;

      // Apply all fix patterns
      FIX_PATTERNS.forEach(({ pattern, replacement, description }) => {
        const matches = content.match(pattern);
        if (matches) {
          content = content.replace(pattern, replacement);
          fileReplacements += matches.length;
          console.log(`  ✓ ${description}: ${matches.length} replacements`);
        }
      });

      // Write file if changes were made
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.filesModified++;
        this.totalReplacements += fileReplacements;
        console.log(`📝 Modified: ${filePath} (${fileReplacements} replacements)`);
      }

      this.filesProcessed++;
    } catch (error) {
      this.errors.push(`Error processing ${filePath}: ${error.message}`);
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  // Validate URLs in content
  validateUrls(content, filePath) {
    const issues = [];
    
    // Check for double slashes
    const doubleSlashMatches = content.match(/https:\/\/bright-gift\.com\/\//g);
    if (doubleSlashMatches) {
      issues.push(`Double slashes found: ${doubleSlashMatches.length} instances`);
    }

    // Check for URLs without trailing slashes that should have them
    const missingSlashMatches = content.match(/https:\/\/bright-gift\.com\/(blog|category|privacy|terms|data-deletion|oauth\/callback|care-calculator)(?![\/\w\-\.])/g);
    if (missingSlashMatches) {
      issues.push(`Missing trailing slashes: ${missingSlashMatches.length} instances`);
    }

    if (issues.length > 0) {
      console.log(`⚠️  Validation issues in ${filePath}:`);
      issues.forEach(issue => console.log(`   - ${issue}`));
    }

    return issues;
  }

  // Run the fixer
  async run() {
    console.log('🔧 Starting trailing slash fixer...\n');

    const files = this.getFilesToProcess();
    console.log(`📁 Found ${files.length} files to process\n`);

    // Process each file
    files.forEach(filePath => {
      console.log(`Processing: ${filePath}`);
      this.processFile(filePath);
    });

    // Validation pass
    console.log('\n🔍 Running validation...');
    let validationIssues = 0;
    files.forEach(filePath => {
      if (this.shouldProcessFile(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const issues = this.validateUrls(content, filePath);
          validationIssues += issues.length;
        } catch (error) {
          // Skip validation errors for files that couldn't be read
        }
      }
    });

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Files processed: ${this.filesProcessed}`);
    console.log(`   Files modified: ${this.filesModified}`);
    console.log(`   Total replacements: ${this.totalReplacements}`);
    console.log(`   Validation issues: ${validationIssues}`);
    
    if (this.errors.length > 0) {
      console.log(`   Errors: ${this.errors.length}`);
      this.errors.forEach(error => console.log(`     - ${error}`));
    }

    if (validationIssues === 0 && this.errors.length === 0) {
      console.log('\n✅ All trailing slash issues have been fixed!');
    } else {
      console.log('\n⚠️  Some issues may remain. Please review the output above.');
    }
  }
}

// Run the fixer
if (require.main === module) {
  const fixer = new TrailingSlashFixer();
  fixer.run().catch(console.error);
}

module.exports = TrailingSlashFixer;
