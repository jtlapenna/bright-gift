#!/usr/bin/env node

/**
 * Fix Noindex Issue Script
 * 
 * This script addresses the Google Search Console "Excluded by 'noindex' tag" issue
 * by creating a comprehensive solution for blog pagination pages.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Noindex Issue for Blog Pagination Pages');
console.log('=================================================\n');

// 1. Verify current blog index template has correct noindex setting
function verifyBlogIndexTemplate() {
  console.log('📋 Verifying blog index template...');
  
  const blogIndexPath = path.join(__dirname, '../src/pages/blog/index.astro');
  const content = fs.readFileSync(blogIndexPath, 'utf8');
  
  // Check for noindex={false} or noindex={currentPage > 1}
  const noindexPatterns = [
    /noindex\s*=\s*\{false\}/,
    /noindex\s*=\s*\{currentPage\s*>\s*1\}/,
    /noindex\s*=\s*\{validPage\s*>\s*1\}/
  ];
  
  let hasCorrectNoindex = false;
  for (const pattern of noindexPatterns) {
    if (pattern.test(content)) {
      hasCorrectNoindex = true;
      break;
    }
  }
  
  if (hasCorrectNoindex) {
    console.log('✅ Blog index template has correct noindex setting');
  } else {
    console.log('❌ Blog index template needs noindex fix');
    return false;
  }
  
  return true;
}

// 2. Create GSC revalidation guide
function createGSCRevalidationGuide() {
  console.log('📝 Creating GSC revalidation guide...');
  
  const guide = [
    'Google Search Console Revalidation Guide',
    '========================================',
    '',
    'ISSUE: Blog pagination pages showing "Excluded by \'noindex\' tag"',
    '',
    'ROOT CAUSE:',
    'Google\'s last crawl (September 8, 2025) occurred before our fixes were deployed (September 12, 2025).',
    'The pages now have correct "index, follow" meta tags, but Google hasn\'t re-crawled them yet.',
    '',
    'IMMEDIATE ACTIONS REQUIRED:',
    '',
    '1. CANCEL OLD VALIDATIONS:',
    '   - Go to: https://search.google.com/search-console',
    '   - Navigate to: Page indexing > Excluded by \'noindex\' tag',
    '   - Click "Cancel validation" for the old validation (started 9/3/25)',
    '',
    '2. START NEW VALIDATIONS:',
    '   - Click "START NEW VALIDATION"',
    '   - Test these specific URLs:',
    '     • https://bright-gift.com/blog/?page=4',
    '     • https://bright-gift.com/blog/?page=2',
    '     • https://bright-gift.com/blog/?page=3',
    '   - For each URL, click "Request Indexing"',
    '',
    '3. VERIFY FIXES:',
    '   - Check that pages return "index, follow" in meta robots tag',
    '   - Confirm no "noindex" tags are present',
    '   - Monitor GSC for validation success',
    '',
    'EXPECTED TIMELINE:',
    '- Immediate: Validation requests submitted',
    '- 24-48 hours: Google re-crawls pages',
    '- 3-7 days: Pages move from "Excluded" to "Indexed"',
    '',
    'TECHNICAL VERIFICATION:',
    'Run these commands to verify the fix:',
    'curl -s "https://bright-gift.com/blog/?page=4" | grep -i "robots"',
    'curl -s "https://bright-gift.com/blog/?page=2" | grep -i "robots"',
    '',
    'Should return: <meta name="robots" content="index, follow">',
    '',
    'If you see "noindex" in the output, the fix hasn\'t been deployed yet.',
    'If you see "index, follow", the fix is working and Google needs to re-crawl.'
  ];
  
  const guidePath = path.join(__dirname, '../_workflow-documents/seo/gsc-noindex-fix-guide.txt');
  fs.writeFileSync(guidePath, guide.join('\n'));
  
  console.log('✅ GSC revalidation guide created');
  console.log(`📁 Guide saved to: ${guidePath}`);
}

// 3. Create verification script
function createVerificationScript() {
  console.log('🔍 Creating verification script...');
  
  const script = `#!/usr/bin/env node

/**
 * Verify Noindex Fix Script
 * 
 * This script verifies that the noindex fix is working correctly
 * by checking the meta robots tags on blog pagination pages.
 */

const https = require('https');

console.log('🔍 Verifying Noindex Fix');
console.log('========================\\n');

const testUrls = [
  'https://bright-gift.com/blog/',
  'https://bright-gift.com/blog/?page=2',
  'https://bright-gift.com/blog/?page=4'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const robotsMatch = data.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i);
        const robotsContent = robotsMatch ? robotsMatch[1] : 'Not found';
        
        console.log(\`📄 \${url}\`);
        console.log(\`   Robots: \${robotsContent}\`);
        
        if (robotsContent.includes('noindex')) {
          console.log(\`   ❌ ISSUE: Contains noindex\`);
        } else if (robotsContent.includes('index, follow')) {
          console.log(\`   ✅ GOOD: Contains index, follow\`);
        } else {
          console.log(\`   ⚠️  WARNING: Unexpected robots content\`);
        }
        console.log('');
        
        resolve({
          url,
          robots: robotsContent,
          hasNoindex: robotsContent.includes('noindex'),
          hasIndexFollow: robotsContent.includes('index, follow')
        });
      });
    }).on('error', (err) => {
      console.log(\`❌ Error checking \${url}: \${err.message}\`);
      resolve({ url, error: err.message });
    });
  });
}

async function main() {
  console.log('Testing blog pagination pages for noindex issues...\\n');
  
  const results = await Promise.all(testUrls.map(checkUrl));
  
  const issues = results.filter(r => r.hasNoindex);
  const working = results.filter(r => r.hasIndexFollow);
  
  console.log('📊 SUMMARY:');
  console.log(\`✅ Working pages: \${working.length}\`);
  console.log(\`❌ Pages with issues: \${issues.length}\`);
  
  if (issues.length === 0) {
    console.log('\\n🎉 All pages are working correctly!');
    console.log('The noindex fix is successful. Google should re-crawl these pages soon.');
  } else {
    console.log('\\n⚠️  Some pages still have issues:');
    issues.forEach(issue => {
      console.log(\`   - \${issue.url}: \${issue.robots}\`);
    });
  }
}

main().catch(console.error);
`;

  const scriptPath = path.join(__dirname, '../scripts/verify-noindex-fix.js');
  fs.writeFileSync(scriptPath, script);
  
  // Make it executable
  fs.chmodSync(scriptPath, '755');
  
  console.log('✅ Verification script created');
  console.log(`📁 Script saved to: ${scriptPath}`);
}

// Main execution
try {
  const templateOk = verifyBlogIndexTemplate();
  
  if (templateOk) {
    createGSCRevalidationGuide();
    createVerificationScript();
    
    console.log('\n🎉 Noindex fix preparation complete!');
    console.log('\nNext steps:');
    console.log('1. Deploy these changes');
    console.log('2. Follow the GSC revalidation guide');
    console.log('3. Run the verification script to confirm fixes');
    console.log('4. Monitor GSC for validation success');
  } else {
    console.log('\n❌ Blog template needs to be fixed first');
  }
  
} catch (error) {
  console.error('❌ Error preparing noindex fix:', error);
  process.exit(1);
}
