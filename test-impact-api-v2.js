#!/usr/bin/env node

const https = require('https');

// Your existing credentials from .env
const ACCOUNT_SID = 'IRv9AJaNHmVi6372946FY8DiNRu8Lg99L1';
const AUTH_TOKEN = 'x-UH5abWPihhcGtuGyeWAPeupBG9zk~w%';

console.log('🔍 Testing Impact.com API Connection (v2)...\n');
console.log('Account SID:', ACCOUNT_SID);
console.log('Auth Token:', AUTH_TOKEN.substring(0, 10) + '...');
console.log('');

// Test different authentication methods
function testAuthMethods() {
  const authMethods = [
    {
      name: 'Basic Auth (URL encoded)',
      header: `Basic ${Buffer.from(`${ACCOUNT_SID}:${encodeURIComponent(AUTH_TOKEN)}`).toString('base64')}`
    },
    {
      name: 'Basic Auth (raw)',
      header: `Basic ${Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64')}`
    },
    {
      name: 'Bearer Token',
      header: `Bearer ${AUTH_TOKEN}`
    },
    {
      name: 'X-API-Key',
      header: `X-API-Key: ${AUTH_TOKEN}`
    }
  ];

  return Promise.all(authMethods.map(method => testWithAuth(method)));
}

function testWithAuth(authMethod) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.impact.com',
      port: 443,
      path: '/Mediapartners/IRv9AJaNHmVi6372946FY8DiNRu8Lg99L1/Account',
      method: 'GET',
      headers: {
        'Authorization': authMethod.header,
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
        console.log(`🔐 ${authMethod.name}:`);
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
      console.log(`🔐 ${authMethod.name}:`);
      console.log(`   Error: ${error.message}`);
      console.log('');
      resolve();
    });

    req.end();
  });
}

// Test different API endpoints
function testEndpoints() {
  const endpoints = [
    '/Mediapartners/IRv9AJaNHmVi6372946FY8DiNRu8Lg99L1/Account',
    '/Mediapartners/IRv9AJaNHmVi6372946FY8DiNRu8Lg99L1/Campaign',
    '/Mediapartners/IRv9AJaNHmVi6372946FY8DiNRu8Lg99L1/Catalog',
    '/Mediapartners/IRv9AJaNHmVi6372946FY8DiNRu8Lg99L1/Action',
    '/Mediapartners/IRv9AJaNHmVi6372946FY8DiNRu8Lg99L1/Report'
  ];

  const authHeader = `Basic ${Buffer.from(`${ACCOUNT_SID}:${encodeURIComponent(AUTH_TOKEN)}`).toString('base64')}`;

  return Promise.all(endpoints.map(endpoint => testEndpoint(endpoint, authHeader)));
}

function testEndpoint(endpoint, authHeader) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.impact.com',
      port: 443,
      path: endpoint,
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
        console.log(`🌐 ${endpoint}:`);
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
      console.log(`🌐 ${endpoint}:`);
      console.log(`   Error: ${error.message}`);
      console.log('');
      resolve();
    });

    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('=== Testing Authentication Methods ===');
  await testAuthMethods();
  
  console.log('=== Testing API Endpoints ===');
  await testEndpoints();
  
  console.log('✅ API connection test completed!');
}

runTests(); 