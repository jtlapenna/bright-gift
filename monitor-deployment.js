const fetch = require('node-fetch');

// Configuration - Update this with your Railway URL
const RAILWAY_URL = process.env.RAILWAY_URL || 'https://your-app-name.railway.app';

async function monitorDeployment() {
  console.log('🚂 Monitoring Railway Deployment');
  console.log('URL:', RAILWAY_URL);
  console.log('Timestamp:', new Date().toISOString());
  console.log('─'.repeat(50));

  try {
    // Test 1: Health Check
    console.log('\n1️⃣ Testing Health Endpoint...');
    const healthStart = Date.now();
    const healthResponse = await fetch(`${RAILWAY_URL}/health`, {
      timeout: 10000
    });
    const healthTime = Date.now() - healthStart;
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health Check PASSED');
      console.log('   Status:', healthResponse.status);
      console.log('   Response Time:', healthTime + 'ms');
      console.log('   Data:', healthData);
    } else {
      console.log('❌ Health Check FAILED');
      console.log('   Status:', healthResponse.status);
      console.log('   Response Time:', healthTime + 'ms');
    }

    // Test 2: Generate Endpoint
    console.log('\n2️⃣ Testing Generate Endpoint...');
    const generateStart = Date.now();
    const generateResponse = await fetch(`${RAILWAY_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug: 'monitor-test',
        label: 'Deployment Test',
        prompt: 'A simple red circle on white background'
      }),
      timeout: 120000 // 2 minutes for image generation
    });
    const generateTime = Date.now() - generateStart;
    
    if (generateResponse.ok) {
      const generateData = await generateResponse.json();
      console.log('✅ Generate Endpoint PASSED');
      console.log('   Status:', generateResponse.status);
      console.log('   Response Time:', generateTime + 'ms');
      console.log('   Request ID:', generateData.requestId);
      console.log('   Images Found:', generateData.imageUrls?.length || 0);
      if (generateData.imageUrls?.length > 0) {
        console.log('   First Image URL:', generateData.imageUrls[0].substring(0, 50) + '...');
      }
    } else {
      console.log('❌ Generate Endpoint FAILED');
      console.log('   Status:', generateResponse.status);
      console.log('   Response Time:', generateTime + 'ms');
      try {
        const errorData = await generateResponse.json();
        console.log('   Error:', errorData);
      } catch (e) {
        console.log('   Could not parse error response');
      }
    }

  } catch (error) {
    console.log('❌ Connection Error:', error.message);
    console.log('   This might mean:');
    console.log('   - Deployment is still in progress');
    console.log('   - URL is incorrect');
    console.log('   - Service is down');
  }

  console.log('\n─'.repeat(50));
  console.log('Monitoring complete at:', new Date().toISOString());
}

// Run monitoring
monitorDeployment(); 