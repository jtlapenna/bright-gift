// Script to trigger the n8n idea generation workflow via webhook
// Usage: node scripts/trigger-n8n-idea-generation.js

const fetch = require('node-fetch');

const WEBHOOK_URL = 'https://thepeakbeyond.app.n8n.cloud/webhook/237cdc52-3a2b-431a-b92e-bc1a1d0aa7b5';

async function triggerWorkflow(payload = {}) {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await response.text();
    console.log('n8n webhook response:', text);
  } catch (err) {
    console.error('Error triggering n8n workflow:', err);
  }
}

// Example: send an empty payload or customize as needed
triggerWorkflow(); 