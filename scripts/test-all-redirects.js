#!/usr/bin/env node

/**
 * Comprehensive Redirect Testing Script
 * 
 * Tests all redirects to identify:
 * - 308 status codes (should be 301)
 * - Multi-hop redirect chains
 * - Missing redirects
 * - Redirect loops
 * - Broken redirect destinations
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const matter = require('gray-matter');

// Purpose: allow local testing (e.g. REDIRECT_TEST_BASE_URL=http://localhost:4321).
const BASE_URL = process.env.REDIRECT_TEST_BASE_URL || 'https://bright-gift.com';
const HTTP_BASE_URL =
  process.env.REDIRECT_TEST_HTTP_BASE_URL ||
  (BASE_URL.startsWith('https://') ? BASE_URL.replace('https://', 'http://') : BASE_URL);

// Results storage
const results = {
  tested: [],
  issues: {
    status308: [],
    multiHop: [],
    missingRedirects: [],
    redirectLoops: [],
    brokenDestinations: [],
    httpMultiHop: []
  },
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    status308: 0,
    multiHop: 0,
    missingRedirects: 0,
    redirectLoops: 0,
    brokenDestinations: 0
  }
};

/**
 * Make HTTP request and follow redirects
 */
function makeRequest(url, followRedirects = true, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const redirectChain = [];
    let redirectCount = 0;
    
    function follow(urlToFollow) {
      if (redirectCount >= maxRedirects) {
        resolve({
          url: urlToFollow,
          status: 'MAX_REDIRECTS',
          redirectChain,
          finalUrl: urlToFollow
        });
        return;
      }
      
      // Purpose: handle protocol changes (http <-> https) correctly per hop.
      const isHttps = urlToFollow.startsWith('https://');
      const client = isHttps ? https : http;

      const urlObj = new URL(urlToFollow);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RedirectTest/1.0)'
        },
        timeout: 10000
      };
      
      const req = client.request(options, (res) => {
        const status = res.statusCode;
        const location = res.headers.location;
        
        redirectChain.push({
          url: urlToFollow,
          status,
          location: location ? (location.startsWith('http') ? location : new URL(location, urlToFollow).href) : null
        });
        
        if (status >= 300 && status < 400 && location && followRedirects) {
          redirectCount++;
          const nextUrl = location.startsWith('http') ? location : new URL(location, urlToFollow).href;
          follow(nextUrl);
        } else {
          resolve({
            url: urlToFollow,
            status,
            redirectChain,
            finalUrl: urlToFollow,
            finalStatus: status
          });
        }
      });
      
      req.on('error', (error) => {
        reject({
          url: urlToFollow,
          error: error.message
        });
      });
      
      req.on('timeout', () => {
        req.destroy();
        reject({
          url: urlToFollow,
          error: 'Request timeout'
        });
      });
      
      req.end();
    }
    
    follow(url);
  });
}

/**
 * Parse _redirects file
 */
function parseRedirectsFile() {
  const redirectsPath = path.join(__dirname, '../public/_redirects');
  const content = fs.readFileSync(redirectsPath, 'utf8');
  const lines = content.split('\n');
  
  const redirects = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    
    // Parse redirect rule: /source /destination 301
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 3) {
      const source = parts[0];
      const destination = parts[1];
      const status = parseInt(parts[2]);
      
      if (status === 301) {
        redirects.push({
          source,
          destination,
          status
        });
      }
    }
  }
  
  return redirects;
}

/**
 * Get all published blog posts
 */
function getPublishedBlogPosts() {
  const blogDir = path.join(__dirname, '../src/content/blog');
  const posts = [];
  
  if (fs.existsSync(blogDir)) {
    const files = fs.readdirSync(blogDir);
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(blogDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(content);
        
        // Skip draft posts
        const isDraft = data.draft === true || data.draft === 'true' || 
                       data.status === 'draft' || data.status === 'archived';
        
        if (!isDraft) {
          const slug = file.replace('.md', '');
          posts.push({
            slug,
            url: `/blog/${slug}`,
            urlWithSlash: `/blog/${slug}/`
          });
        }
      }
    }
  }
  
  return posts;
}

/**
 * Test a single redirect
 */
async function testRedirect(source, expectedDestination, description = '') {
  const testUrl = `${BASE_URL}${source}`;
  const httpTestUrl = `${HTTP_BASE_URL}${source}`;
  
  results.summary.total++;
  
  try {
    // Test HTTPS version
    const httpsResult = await makeRequest(testUrl);
    
    // Test HTTP version (for multi-hop detection)
    let httpResult = null;
    try {
      httpResult = await makeRequest(httpTestUrl);
    } catch (error) {
      // HTTP might fail, that's okay
    }
    
    // Count only actual redirect hops (3xx responses). The chain includes the final 200.
    const redirectHops = httpsResult.redirectChain.filter(r => r.status >= 300 && r.status < 400).length;
    const finalStatus = httpsResult.finalStatus || httpsResult.status;
    const finalUrl = httpsResult.finalUrl;
    
    // Check for 308 status codes
    const has308 = httpsResult.redirectChain.some(r => r.status === 308);
    if (has308) {
      results.issues.status308.push({
        source,
        expectedDestination,
        redirectChain: httpsResult.redirectChain,
        description
      });
      results.summary.status308++;
      results.summary.failed++;
      return { passed: false, issue: '308 status code' };
    }
    
    // Check for multi-hop redirects (more than 1 redirect hop)
    if (redirectHops > 1) {
      results.issues.multiHop.push({
        source,
        expectedDestination,
        redirectCount: redirectHops,
        redirectChain: httpsResult.redirectChain,
        description
      });
      results.summary.multiHop++;
      results.summary.failed++;
      return { passed: false, issue: 'multi-hop redirect' };
    }
    
    // Check HTTP multi-hop (HTTP -> HTTPS -> trailing slash)
    if (httpResult && httpResult.redirectChain.length > 2) {
      results.issues.httpMultiHop.push({
        source,
        expectedDestination,
        redirectCount: httpResult.redirectChain.length,
        redirectChain: httpResult.redirectChain,
        description: 'HTTP version creates multi-hop chain'
      });
    }
    
    // Check if final destination is correct
    const expectedFinalUrl = `${BASE_URL}${expectedDestination}`;
    if (finalUrl !== expectedFinalUrl && finalStatus !== 200) {
      results.issues.brokenDestinations.push({
        source,
        expectedDestination,
        actualFinalUrl: finalUrl,
        finalStatus,
        redirectChain: httpsResult.redirectChain,
        description
      });
      results.summary.brokenDestinations++;
      results.summary.failed++;
      return { passed: false, issue: 'broken destination' };
    }
    
    // Check for redirect loops
    const urlsInChain = httpsResult.redirectChain.map(r => r.url);
    const uniqueUrls = new Set(urlsInChain);
    if (urlsInChain.length !== uniqueUrls.size) {
      results.issues.redirectLoops.push({
        source,
        expectedDestination,
        redirectChain: httpsResult.redirectChain,
        description
      });
      results.summary.redirectLoops++;
      results.summary.failed++;
      return { passed: false, issue: 'redirect loop' };
    }
    
    // Success
    results.summary.passed++;
    results.tested.push({
      source,
      expectedDestination,
      status: 'PASS',
      redirectCount: redirectHops,
      description
    });
    
    return { passed: true };
    
  } catch (error) {
    results.summary.failed++;
    results.tested.push({
      source,
      expectedDestination,
      status: 'ERROR',
      error: error.message || error.error,
      description
    });
    return { passed: false, issue: 'request error', error: error.message || error.error };
  }
}

/**
 * Find missing redirects
 */
function findMissingRedirects() {
  const redirects = parseRedirectsFile();
  const blogPosts = getPublishedBlogPosts();
  
  const redirectSources = new Set(redirects.map(r => r.source));
  const missing = [];
  
  // Check blog posts
  for (const post of blogPosts) {
    if (!redirectSources.has(post.url)) {
      missing.push({
        type: 'blog_post',
        url: post.url,
        expectedRedirect: `${post.url}/`,
        slug: post.slug
      });
    }
  }
  
  // Check static pages
  const staticPages = [
    { url: '/blog', expectedRedirect: '/blog/' },
    { url: '/contact', expectedRedirect: '/contact/' },
    { url: '/category/gift-guides', expectedRedirect: '/category/gift-guides/' }
  ];
  
  for (const page of staticPages) {
    if (!redirectSources.has(page.url)) {
      missing.push({
        type: 'static_page',
        url: page.url,
        expectedRedirect: page.expectedRedirect
      });
    }
  }
  
  if (missing.length > 0) {
    results.issues.missingRedirects = missing;
    results.summary.missingRedirects = missing.length;
  }
  
  return missing;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Starting comprehensive redirect diagnostic...\n');
  
  // Find missing redirects first
  console.log('📋 Checking for missing redirects...');
  const missing = findMissingRedirects();
  if (missing.length > 0) {
    console.log(`⚠️  Found ${missing.length} missing redirects`);
  } else {
    console.log('✅ All expected redirects are present\n');
  }
  
  // Parse redirects file
  console.log('📖 Parsing _redirects file...');
  const redirects = parseRedirectsFile();
  console.log(`Found ${redirects.length} redirect rules\n`);
  
  // Test all redirects
  console.log('🧪 Testing redirects...\n');
  
  for (let i = 0; i < redirects.length; i++) {
    const redirect = redirects[i];
    const progress = `[${i + 1}/${redirects.length}]`;
    
    process.stdout.write(`${progress} Testing ${redirect.source}... `);
    
    const result = await testRedirect(redirect.source, redirect.destination);
    
    if (result.passed) {
      console.log('✅');
    } else {
      console.log(`❌ (${result.issue})`);
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Generate report
  console.log('\n📊 Generating report...\n');
  
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: results.summary,
    issues: results.issues,
    tested: results.tested.slice(0, 100) // Limit to first 100 for readability
  };
  
  // Save report
  const reportPath = path.join(__dirname, '../_workflow-documents/SEO_audit/redirect-diagnostic-report.json');
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Print summary
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log(`Total Tests: ${results.summary.total}`);
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`❌ Failed: ${results.summary.failed}\n`);
  
  if (results.summary.status308 > 0) {
    console.log(`⚠️  308 Status Codes: ${results.summary.status308}`);
  }
  if (results.summary.multiHop > 0) {
    console.log(`⚠️  Multi-hop Redirects: ${results.summary.multiHop}`);
  }
  if (results.summary.missingRedirects > 0) {
    console.log(`⚠️  Missing Redirects: ${results.summary.missingRedirects}`);
  }
  if (results.summary.redirectLoops > 0) {
    console.log(`⚠️  Redirect Loops: ${results.summary.redirectLoops}`);
  }
  if (results.summary.brokenDestinations > 0) {
    console.log(`⚠️  Broken Destinations: ${results.summary.brokenDestinations}`);
  }
  
  console.log(`\n📄 Full report saved to: ${reportPath}\n`);
  
  // Exit with error code if issues found
  if (results.summary.failed > 0 || results.summary.missingRedirects > 0) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { testRedirect, findMissingRedirects, parseRedirectsFile };

