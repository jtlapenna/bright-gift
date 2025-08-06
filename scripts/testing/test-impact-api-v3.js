#!/usr/bin/env node

const https = require('https');

// Updated credentials from .env
const ACCOUNT_SID = 'IRv9AJaNHmVi6372946FY8DiNRu8Lg99L1';
const AUTH_TOKEN = 'x-UH5abWPihhcGtuGyeWAPeupBG9zk~w';
const PARTNER_ID = '6372946';
const API_VERSION = 'v15.0';

console.log('🔍 Testing Impact.com API Connection (v3)...\n');
console.log('Account SID:', ACCOUNT_SID);
console.log('Partner ID:', PARTNER_ID);
console.log('API Version:', API_VERSION);
console.log('Auth Token:', AUTH_TOKEN.substring(0, 10) + '...');
console.log('');

// Test with different API versions
const apiVersions = ['v13.0', 'v14.0', 'v15.0'];

function testApiVersions() {
  return Promise.all(apiVersions.map(version => testWithVersion(version)));
}

function testWithVersion(version) {
  return new Promise((resolve) => {
    const authHeader = `Basic ${Buffer.from(`${ACCOUNT_SID}:${encodeURIComponent(AUTH_TOKEN)}`).toString('base64')}`;
    
    const options = {
      hostname: 'api.impact.com',
      port: 443,
      path: `/Mediapartners/${ACCOUNT_SID}/Account`,
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Version': version
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`🌐 API Version ${version}:`);
        console.log(`   Status: ${res.statusCode}`);
        try {
          const jsonData = JSON.parse(data);
          console.log(`   Response: ${JSON.stringify(jsonData, null, 2)}`);
        } catch (e) {
          console.log(`   Response: ${data}`);
        }
        console.log('');
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`🌐 API Version ${version}:`);
      console.log(`   Error: ${error.message}`);
      console.log('');
      resolve();
    });

    req.end();
  });
}

// Test campaigns to find UncommonGoods
function testCampaigns() {
  return new Promise((resolve) => {
    const authHeader = `Basic ${Buffer.from(`${ACCOUNT_SID}:${encodeURIComponent(AUTH_TOKEN)}`).toString('base64')}`;
    
    const options = {
      hostname: 'api.impact.com',
      port: 443,
      path: `/Mediapartners/${ACCOUNT_SID}/Campaign`,
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`🎯 Campaigns Test:`);
        console.log(`   Status: ${res.statusCode}`);
        try {
          const jsonData = JSON.parse(data);
          console.log(`   Response: ${JSON.stringify(jsonData, null, 2)}`);
          
          // Look for UncommonGoods in campaigns
          if (jsonData.campaigns) {
            const uncommonGoods = jsonData.campaigns.find(c => 
              c.name && c.name.toLowerCase().includes('uncommon')
            );
            if (uncommonGoods) {
              console.log(`   ✅ Found UncommonGoods Campaign:`, uncommonGoods);
            }
          }
        } catch (e) {
          console.log(`   Response: ${data}`);
        }
        console.log('');
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`🎯 Campaigns Test:`);
      console.log(`   Error: ${error.message}`);
      console.log('');
      resolve();
    });

    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('=== Testing API Versions ===');
  await testApiVersions();
  
  console.log('=== Testing Campaigns ===');
  await testCampaigns();
  
  console.log('✅ API connection test completed!');
}

runTests(); 