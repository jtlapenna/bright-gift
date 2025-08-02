#!/usr/bin/env node

const https = require('https');

// Your existing credentials from .env
const ACCOUNT_SID = 'IRv9AJaNHmVi6372946FY8DiNRu8Lg99L1';
const AUTH_TOKEN = 'x-UH5abWPihhcGtuGyeWAPeupBG9zk~w%';

// Create base64 encoded auth header
const authHeader = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64');

console.log('🔍 Testing Impact.com API Connection...\n');

// Test 1: Get account information
function testAccountInfo() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.impact.com',
      port: 443,
      path: '/Mediapartners/IRv9AJaNHmVi6372946FY8DiNRu8Lg99L1/Account',
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📊 Account Info Response:');
        console.log('Status:', res.statusCode);
        console.log('Headers:', res.headers);
        console.log('Data:', JSON.parse(data));
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Test 2: Get campaigns (to find UncommonGoods)
function testCampaigns() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.impact.com',
      port: 443,
      path: '/Mediapartners/IRv9AJaNHmVi6372946FY8DiNRu8Lg99L1/Campaign',
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\n🎯 Campaigns Response:');
        console.log('Status:', res.statusCode);
        console.log('Data:', JSON.parse(data));
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Test 3: Get catalogs (for product discovery)
function testCatalogs() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.impact.com',
      port: 443,
      path: '/Mediapartners/IRv9AJaNHmVi6372946FY8DiNRu8Lg99L1/Catalog',
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\n📦 Catalogs Response:');
        console.log('Status:', res.statusCode);
        console.log('Data:', JSON.parse(data));
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Run all tests
async function runTests() {
  try {
    await testAccountInfo();
    await testCampaigns();
    await testCatalogs();
    console.log('\n✅ API connection test completed!');
  } catch (error) {
    console.error('\n❌ API test failed:', error.message);
  }
}

runTests(); 