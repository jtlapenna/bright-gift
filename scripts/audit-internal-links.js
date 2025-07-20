#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://bright-gift.com';
const BLOG_DIR = 'src/content/blog';
const PAGES_DIR = 'src/pages';

// Helper function to make HTTP requests
function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', timeout: 10000 }, (res) => {
      resolve({
        url,
        status: res.statusCode,
        redirect: res.headers.location,
        working: res.statusCode >= 200 && res.statusCode < 400
      });
    });
    
    req.on('error', () => {
      resolve({
        url,
        status: 'ERROR',
        redirect: null,
        working: false
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        redirect: null,
        working: false
      });
    });
    
    req.end();
  });
}

// Extract internal links from markdown content
function extractInternalLinks(content, filePath) {
  const links = [];
  
  // Find markdown links [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = markdownLinkRegex.exec(content)) !== null) {
    const [fullMatch, linkText, linkUrl] = match;
    
    // Only process internal links
    if (linkUrl.startsWith('/') || linkUrl.startsWith(BASE_URL) || 
        (linkUrl.startsWith('http') && linkUrl.includes('bright-gift.com'))) {
      links.push({
        text: linkText,
        url: linkUrl.startsWith('/') ? `${BASE_URL}${linkUrl}` : linkUrl,
        context: fullMatch,
        file: path.basename(filePath)
      });
    }
  }
  
  // Find HTML links <a href="url">
  const htmlLinkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/g;
  
  while ((match = htmlLinkRegex.exec(content)) !== null) {
    const linkUrl = match[1];
    
    // Only process internal links
    if (linkUrl.startsWith('/') || linkUrl.startsWith(BASE_URL) || 
        (linkUrl.startsWith('http') && linkUrl.includes('bright-gift.com'))) {
      links.push({
        text: 'HTML Link',
        url: linkUrl.startsWith('/') ? `${BASE_URL}${linkUrl}` : linkUrl,
        context: match[0],
        file: path.basename(filePath)
      });
    }
  }
  
  return links;
}

// Process markdown files
function processMarkdownFiles() {
  console.log('🔍 Scanning markdown files for internal links...\n');
  
  const files = fs.readdirSync(BLOG_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(BLOG_DIR, file));
  
  const allLinks = [];
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const links = extractInternalLinks(content, file);
      allLinks.push(...links);
      
      if (links.length > 0) {
        console.log(`📄 ${path.basename(file)}: Found ${links.length} internal links`);
        links.forEach(link => {
          console.log(`   - ${link.text}: ${link.url}`);
        });
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }
  
  return allLinks;
}

// Process Astro template files
function processAstroFiles() {
  console.log('\n🔍 Scanning Astro template files for internal links...\n');
  
  const allLinks = [];
  
  function scanDirectory(dir) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (stat.isFile() && item.endsWith('.astro')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const links = extractInternalLinks(content, fullPath);
            allLinks.push(...links);
            
            if (links.length > 0) {
              console.log(`📄 ${item}: Found ${links.length} internal links`);
              links.forEach(link => {
                console.log(`   - ${link.text}: ${link.url}`);
              });
            }
          } catch (error) {
            console.error(`❌ Error processing ${fullPath}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error scanning directory ${dir}:`, error.message);
    }
  }
  
  scanDirectory(PAGES_DIR);
  return allLinks;
}

// Check all links
async function checkAllLinks(links) {
  console.log('\n🔍 Checking link status...\n');
  
  const results = [];
  const uniqueUrls = [...new Set(links.map(link => link.url))];
  
  console.log(`Found ${uniqueUrls.length} unique internal URLs to check`);
  
  for (let i = 0; i < uniqueUrls.length; i++) {
    const url = uniqueUrls[i];
    process.stdout.write(`Checking ${i + 1}/${uniqueUrls.length}: ${url}... `);
    
    const result = await checkUrl(url);
    results.push(result);
    
    if (result.working) {
      console.log(`✅ ${result.status}`);
    } else {
      console.log(`❌ ${result.status}`);
    }
    
    // Small delay to be respectful to the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

// Generate report
function generateReport(links, results) {
  console.log('\n📊 INTERNAL LINK AUDIT REPORT\n');
  console.log('=' .repeat(50));
  
  const workingUrls = results.filter(r => r.working);
  const brokenUrls = results.filter(r => !r.working);
  
  console.log(`\n✅ WORKING LINKS: ${workingUrls.length}`);
  workingUrls.forEach(result => {
    console.log(`   - ${result.url} (${result.status})`);
  });
  
  console.log(`\n❌ BROKEN LINKS: ${brokenUrls.length}`);
  brokenUrls.forEach(result => {
    console.log(`   - ${result.url} (${result.status})`);
    
    // Find which files contain this broken link
    const filesWithLink = links.filter(link => link.url === result.url);
    filesWithLink.forEach(link => {
      console.log(`     Found in: ${link.file}`);
    });
  });
  
  console.log(`\n📈 SUMMARY:`);
  console.log(`   Total unique URLs: ${results.length}`);
  console.log(`   Working: ${workingUrls.length}`);
  console.log(`   Broken: ${brokenUrls.length}`);
  console.log(`   Success rate: ${((workingUrls.length / results.length) * 100).toFixed(1)}%`);
  
  return { workingUrls, brokenUrls };
}

// Main execution
async function main() {
  console.log('🔍 BRIGHT GIFT INTERNAL LINK AUDIT\n');
  console.log('=' .repeat(40));
  
  try {
    // Step 1: Extract all internal links
    const markdownLinks = processMarkdownFiles();
    const astroLinks = processAstroFiles();
    const allLinks = [...markdownLinks, ...astroLinks];
    
    if (allLinks.length === 0) {
      console.log('\n✅ No internal links found to audit');
      return;
    }
    
    console.log(`\n📊 Found ${allLinks.length} total internal links`);
    
    // Step 2: Check all unique URLs
    const results = await checkAllLinks(allLinks);
    
    // Step 3: Generate report
    const report = generateReport(allLinks, results);
    
    // Step 4: Save detailed report to file
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalLinks: allLinks.length,
        uniqueUrls: results.length,
        working: report.workingUrls.length,
        broken: report.brokenUrls.length,
        successRate: ((report.workingUrls.length / results.length) * 100).toFixed(1)
      },
      brokenLinks: report.brokenUrls.map(result => ({
        url: result.url,
        status: result.status,
        files: allLinks.filter(link => link.url === result.url).map(link => link.file)
      })),
      allLinks: allLinks
    };
    
    fs.writeFileSync('internal-link-audit-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n💾 Detailed report saved to: internal-link-audit-report.json');
    
  } catch (error) {
    console.error('\n❌ Audit failed:', error.message);
  }
}

main(); 