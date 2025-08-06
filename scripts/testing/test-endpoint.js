const fetch = require('node-fetch');

async function testEndpoint() {
  const baseUrl = process.env.TEST_URL || 'http://localhost:3000';
  
  console.log('Testing endpoint:', baseUrl);
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    console.log('Health check result:', healthData);
    
    // Test generate endpoint
    console.log('\n2. Testing generate endpoint...');
    const generateResponse = await fetch(`${baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug: 'test-slug',
        label: 'Test Image',
        prompt: 'A beautiful sunset over mountains'
      })
    });
    
    const generateData = await generateResponse.json();
    console.log('Generate response status:', generateResponse.status);
    console.log('Generate response:', generateData);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testEndpoint(); 