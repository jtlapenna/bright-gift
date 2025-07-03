// Broken Links Checker Script
// This script can be run monthly to check for broken links on the site

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { getCollection } from '@astrojs/astro/dist/content';

// URLs to check (internal and external)
const urls = [];
const checkedUrls = new Set();
const brokenLinks = [];

// Helper function to normalize URLs
function normalizeUrl(url, baseUrl) {
  try {
    return new URL(url, baseUrl).toString();
  } catch (e) {
    return null;
  }
}

// Function to extract links from HTML content
async function extractLinks(html, baseUrl) {
  const $ = cheerio.load(html);
  const links = [];
  
  $('a').each((i, link) => {
    const href = $(link).attr('href');
    if (href) {
      const normalizedUrl = normalizeUrl(href, baseUrl);
      if (normalizedUrl && !normalizedUrl.startsWith('mailto:') && !normalizedUrl.startsWith('tel:')) {
        links.push({
          url: normalizedUrl,
          text: $(link).text().trim() || 'No text',
          source: baseUrl
        });
      }
    }
  });
  
  return links;
}

// Function to check if a URL is working
async function checkUrl(urlObj) {
  const { url, text, source } = urlObj;
  
  if (checkedUrls.has(url)) {
    return;
  }
  
  checkedUrls.add(url);
  console.log(`Checking: ${url}`);
  
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      timeout: 10000,
      redirect: 'follow'
    });
    
    if (!response.ok) {
      brokenLinks.push({
        url,
        text,
        source,
        status: response.status,
        statusText: response.statusText
      });
    }
  } catch (error) {
    brokenLinks.push({
      url,
      text,
      source,
      status: 'Error',
      statusText: error.message
    });
  }
}

// Function to crawl the site
async function crawlSite(baseUrl) {
  try {
    // Start with the homepage
    const response = await fetch(baseUrl);
    const html = await response.text();
    
    // Extract links from homepage
    const links = await extractLinks(html, baseUrl);
    
    // Add links to the queue
    links.forEach(link => {
      if (!checkedUrls.has(link.url)) {
        urls.push(link);
      }
    });
    
    // Process all URLs
    for (let i = 0; i < urls.length; i++) {
      const urlObj = urls[i];
      
      // Only check internal links for additional links
      if (urlObj.url.startsWith(baseUrl)) {
        try {
          const response = await fetch(urlObj.url);
          const html = await response.text();
          const newLinks = await extractLinks(html, urlObj.url);
          
          newLinks.forEach(link => {
            if (!checkedUrls.has(link.url)) {
              urls.push(link);
            }
          });
        } catch (error) {
          console.error(`Error fetching ${urlObj.url}: ${error.message}`);
        }
      }
      
      await checkUrl(urlObj);
    }
    
    // Generate report
    generateReport();
    
  } catch (error) {
    console.error(`Error crawling site: ${error.message}`);
  }
}

// Function to generate a report
function generateReport() {
  const date = new Date().toISOString().split('T')[0];
  const reportDir = path.join(__dirname, '../../reports');
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportPath = path.join(reportDir, `broken-links-${date}.json`);
  
  const report = {
    date,
    totalChecked: checkedUrls.size,
    brokenLinksCount: brokenLinks.length,
    brokenLinks
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Report generated at ${reportPath}`);
  console.log(`Found ${brokenLinks.length} broken links out of ${checkedUrls.size} checked URLs`);
}

// Main function
async function main() {
  const baseUrl = 'https://bright-gift.com';
  console.log(`Starting broken links check for ${baseUrl}`);
  await crawlSite(baseUrl);
}

// Run the script
main().catch(console.error);

/*
To run this script monthly:
1. Install required packages:
   npm install node-fetch@2 cheerio
   
2. Set up a cron job or scheduled task:
   For example, to run on the 1st of each month at 2am:
   
   0 2 1 * * node /path/to/broken-links-checker.js
   
3. The script will generate reports in the /reports directory
*/ 