#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Google Search Console monitoring script
// This script helps track GSC metrics over time

const GSC_MONITORING_FILE = path.join(__dirname, '../_workflow-documents/SEO_audit/gsc-monitoring-baseline.json');

// Key metrics to track from Google Search Console
const GSC_METRICS = {
  // Coverage Report metrics
  coverage: {
    totalPages: 'Total pages submitted',
    validPages: 'Valid pages',
    errorPages: 'Pages with errors',
    excludedPages: 'Excluded pages',
    validWithWarnings: 'Valid pages with warnings'
  },
  
  // Specific error types to track
  errors: {
    notFound: 'Not found (404)',
    serverError: 'Server error (5xx)',
    redirectError: 'Redirect error',
    submittedUrlNotSelected: 'Submitted URL not selected (canonical)',
    duplicateContent: 'Duplicate content',
    crawledCurrentlyNotIndexed: 'Crawled - currently not indexed',
    discoveredCurrentlyNotIndexed: 'Discovered - currently not indexed'
  },
  
  // Page Experience metrics
  pageExperience: {
    goodPages: 'Good pages',
    needsImprovement: 'Needs improvement',
    poorPages: 'Poor pages'
  },
  
  // Sitemap status
  sitemaps: {
    submitted: 'Sitemaps submitted',
    processed: 'Sitemaps processed',
    errors: 'Sitemap errors'
  }
};

// Create baseline monitoring file
function createBaseline() {
  const baseline = {
    created: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    metrics: GSC_METRICS,
    instructions: {
      title: 'Google Search Console Monitoring Instructions',
      steps: [
        '1. Go to Google Search Console (https://search.google.com/search-console)',
        '2. Select your bright-gift.com property',
        '3. Navigate to each section below and record the current numbers',
        '4. Update this file with the current values',
        '5. Run this script weekly to track improvements'
      ],
      sections: {
        coverage: {
          path: 'Coverage > Pages',
          description: 'Track total pages, valid pages, and error pages',
          keyMetrics: ['Total pages', 'Valid', 'Error', 'Valid with warnings']
        },
        errors: {
          path: 'Coverage > Pages > Error',
          description: 'Track specific error types',
          keyMetrics: ['Not found (404)', 'Server error (5xx)', 'Redirect error', 'Submitted URL not selected (canonical)']
        },
        pageExperience: {
          path: 'Page Experience',
          description: 'Track Core Web Vitals and page experience',
          keyMetrics: ['Good', 'Needs improvement', 'Poor']
        },
        sitemaps: {
          path: 'Sitemaps',
          description: 'Track sitemap submission and processing',
          keyMetrics: ['Submitted', 'Processed', 'Errors']
        }
      }
    },
    currentValues: {
      coverage: {},
      errors: {},
      pageExperience: {},
      sitemaps: {}
    },
    history: []
  };
  
  fs.writeFileSync(GSC_MONITORING_FILE, JSON.stringify(baseline, null, 2));
  console.log('📊 Google Search Console monitoring baseline created!');
  console.log(`📄 File: ${GSC_MONITORING_FILE}`);
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Go to Google Search Console');
  console.log('2. Record current values in the baseline file');
  console.log('3. Run this script weekly to track improvements');
  
  return baseline;
}

// Load existing monitoring data
function loadMonitoringData() {
  if (fs.existsSync(GSC_MONITORING_FILE)) {
    return JSON.parse(fs.readFileSync(GSC_MONITORING_FILE, 'utf8'));
  }
  return null;
}

// Update monitoring data with new values
function updateMonitoringData(newValues) {
  const data = loadMonitoringData();
  if (!data) {
    console.log('❌ No monitoring data found. Run with --create-baseline first.');
    return;
  }
  
  const timestamp = new Date().toISOString();
  
  // Add current values to history
  data.history.push({
    timestamp,
    values: { ...data.currentValues }
  });
  
  // Update current values
  data.currentValues = { ...data.currentValues, ...newValues };
  data.lastUpdated = timestamp;
  
  // Calculate improvements
  if (data.history.length > 1) {
    const previous = data.history[data.history.length - 2].values;
    const current = data.currentValues;
    
    console.log('\n📈 IMPROVEMENTS SINCE LAST CHECK:');
    console.log('==================================');
    
    // Coverage improvements
    if (current.coverage.errorPages !== undefined && previous.coverage.errorPages !== undefined) {
      const errorChange = previous.coverage.errorPages - current.coverage.errorPages;
      if (errorChange > 0) {
        console.log(`✅ 404 errors reduced by ${errorChange}`);
      } else if (errorChange < 0) {
        console.log(`❌ 404 errors increased by ${Math.abs(errorChange)}`);
      } else {
        console.log(`➖ 404 errors unchanged`);
      }
    }
    
    // Valid pages improvement
    if (current.coverage.validPages !== undefined && previous.coverage.validPages !== undefined) {
      const validChange = current.coverage.validPages - previous.coverage.validPages;
      if (validChange > 0) {
        console.log(`✅ Valid pages increased by ${validChange}`);
      } else if (validChange < 0) {
        console.log(`❌ Valid pages decreased by ${Math.abs(validChange)}`);
      } else {
        console.log(`➖ Valid pages unchanged`);
      }
    }
  }
  
  fs.writeFileSync(GSC_MONITORING_FILE, JSON.stringify(data, null, 2));
  console.log(`\n📊 Monitoring data updated: ${GSC_MONITORING_FILE}`);
  
  return data;
}

// Generate monitoring report
function generateReport() {
  const data = loadMonitoringData();
  if (!data) {
    console.log('❌ No monitoring data found. Run with --create-baseline first.');
    return;
  }
  
  console.log('📊 GOOGLE SEARCH CONSOLE MONITORING REPORT');
  console.log('==========================================\n');
  
  console.log(`📅 Last Updated: ${data.lastUpdated}`);
  console.log(`📈 Data Points: ${data.history.length}\n`);
  
  // Current status
  console.log('🎯 CURRENT STATUS:');
  console.log('==================');
  
  if (data.currentValues.coverage.errorPages !== undefined) {
    console.log(`404 Errors: ${data.currentValues.coverage.errorPages}`);
  }
  if (data.currentValues.coverage.validPages !== undefined) {
    console.log(`Valid Pages: ${data.currentValues.coverage.validPages}`);
  }
  if (data.currentValues.coverage.totalPages !== undefined) {
    console.log(`Total Pages: ${data.currentValues.coverage.totalPages}`);
  }
  
  // Trend analysis
  if (data.history.length >= 2) {
    console.log('\n📈 TREND ANALYSIS:');
    console.log('==================');
    
    const first = data.history[0].values;
    const latest = data.currentValues;
    
    if (first.coverage.errorPages !== undefined && latest.coverage.errorPages !== undefined) {
      const totalErrorReduction = first.coverage.errorPages - latest.coverage.errorPages;
      console.log(`Total 404 errors reduced: ${totalErrorReduction}`);
    }
  }
  
  console.log('\n📋 TO UPDATE VALUES:');
  console.log('====================');
  console.log('1. Go to Google Search Console');
  console.log('2. Record current values');
  console.log('3. Run: node scripts/google-search-console-monitor.js --update');
}

// Main execution
const args = process.argv.slice(2);

if (args.includes('--create-baseline')) {
  createBaseline();
} else if (args.includes('--update')) {
  console.log('📊 To update monitoring data, edit the currentValues section in:');
  console.log(GSC_MONITORING_FILE);
  console.log('\nThen run this script again to see improvements.');
} else {
  generateReport();
}

