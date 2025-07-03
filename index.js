const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

// Middleware for request logging
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Request received`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Simple test endpoint for debugging
app.get('/test', (req, res) => {
  res.status(200).json({ message: 'Test endpoint working' });
});

app.post('/generate', async (req, res) => {
  const requestId = Date.now().toString();
  console.log(`[${requestId}] Starting image generation request`);
  
  const { slug, label, prompt } = req.body;
  console.log(`[${requestId}] Request body:`, { slug, label, prompt: prompt?.substring(0, 50) + '...' });
  
  if (!prompt) {
    console.log(`[${requestId}] Error: Missing prompt`);
    return res.status(400).json({ error: 'Missing prompt' });
  }

  let browser = null;
  
  try {
    console.log(`[${requestId}] Launching Puppeteer browser...`);
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 30000
    });
    
    console.log(`[${requestId}] Browser launched successfully`);
    
    const page = await browser.newPage();
    console.log(`[${requestId}] New page created`);
    
    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 720 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log(`[${requestId}] Navigating to ChatGPT...`);
    await page.goto('https://chatgpt.com/g/g-68659216a67c8191a91604afe44e6655-brightgift-image-generator', { 
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    console.log(`[${requestId}] Page loaded successfully`);

    // Wait for and type the prompt
    console.log(`[${requestId}] Waiting for textarea...`);
    await page.waitForSelector('textarea', { timeout: 30000 });
    console.log(`[${requestId}] Textarea found, typing prompt...`);
    
    await page.type('textarea', prompt);
    console.log(`[${requestId}] Prompt typed, pressing Enter...`);
    await page.keyboard.press('Enter');

    // Wait for images with longer timeout
    console.log(`[${requestId}] Waiting for images to generate...`);
    await page.waitForSelector('img', { timeout: 60000 }); // Wait up to 60s for images
    
    console.log(`[${requestId}] Images detected, extracting URLs...`);
    
    // Extract image URLs with more specific selector
    const imageUrls = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      console.log('Found images:', images.length);
      return images
        .filter(img => img.src && img.src.startsWith('http'))
        .map(img => img.src);
    });

    console.log(`[${requestId}] Extracted ${imageUrls.length} image URLs:`, imageUrls);

    await browser.close();
    console.log(`[${requestId}] Browser closed, sending response`);
    
    res.json({ 
      success: true, 
      message: 'Images generated successfully', 
      slug, 
      label, 
      prompt, 
      imageUrls,
      requestId 
    });
    
  } catch (err) {
    console.error(`[${requestId}] Error occurred:`, err.message);
    console.error(`[${requestId}] Full error:`, err);
    
    // Ensure browser is closed on error
    if (browser) {
      try {
        await browser.close();
        console.log(`[${requestId}] Browser closed after error`);
      } catch (closeErr) {
        console.error(`[${requestId}] Error closing browser:`, closeErr.message);
      }
    }
    
    res.status(500).json({ 
      error: 'Image generation failed', 
      details: err.message,
      requestId 
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

const port = process.env.PORT || 3000;

// Add error handling for server startup
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`[STARTUP] Puppeteer server running on port ${port}`);
  console.log(`[STARTUP] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[STARTUP] Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
  console.log(`[STARTUP] Server started successfully`);
});

// Handle server errors
server.on('error', (error) => {
  console.error(`[STARTUP] Server error:`, error);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(`[STARTUP] Uncaught Exception:`, error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`[STARTUP] Unhandled Rejection at:`, promise, 'reason:', reason);
  process.exit(1);
}); 