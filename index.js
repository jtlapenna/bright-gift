const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const app = express();

puppeteer.use(StealthPlugin());

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
    
    // Load and set cookies from environment variable
    console.log(`[${requestId}] Loading session cookies...`);
    const cookiesJson = process.env.CHATGPT_COOKIES;
    if (!cookiesJson) {
      throw new Error('CHATGPT_COOKIES environment variable not set');
    }
    
    try {
      const cookies = JSON.parse(cookiesJson);
      await page.setCookie(...cookies);
      console.log(`[${requestId}] Successfully set ${cookies.length} cookies`);
    } catch (cookieErr) {
      console.error(`[${requestId}] Error parsing cookies:`, cookieErr.message);
      throw new Error('Invalid cookie format in CHATGPT_COOKIES environment variable');
    }
    
    console.log(`[${requestId}] Navigating to ChatGPT...`);
    await page.goto('https://chatgpt.com/g/g-68659216a67c8191a91604afe44e6655-brightgift-image-generator', { 
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    console.log(`[${requestId}] Page loaded successfully`);

    // Debug: Check what page we're actually on
    console.log(`[${requestId}] Current URL:`, await page.url());
    const pageTitle = await page.title();
    console.log(`[${requestId}] Page title:`, pageTitle);

    // Check for common page states
    const loginButton = await page.$('button[data-provider="google"]');
    const loginText = await page.$('text="Sign in"');
    const errorText = await page.$('text="Error"');
    
    if (loginButton) {
      console.log(`[${requestId}] Login button found - cookies may not be working`);
    }
    if (loginText) {
      console.log(`[${requestId}] Login text found - authentication required`);
    }
    if (errorText) {
      console.log(`[${requestId}] Error text found on page`);
    }

    // Try multiple selectors for the input area
    console.log(`[${requestId}] Looking for input elements...`);
    const selectors = [
      'textarea',
      'div[contenteditable="true"]',
      'input[type="text"]',
      '[data-testid="chat-input"]',
      '.chat-input',
      '#prompt-textarea'
    ];

    let foundSelector = null;
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          console.log(`[${requestId}] Found element with selector: ${selector}`);
          foundSelector = selector;
          break;
        }
      } catch (err) {
        console.log(`[${requestId}] Selector ${selector} not found`);
      }
    }

    if (!foundSelector) {
      console.log(`[${requestId}] No input element found, saving debug info...`);
      // Save screenshot and HTML for debugging
      const screenshotPath = `/tmp/${requestId}-debug.png`;
      const html = await page.content();
      const fs = require('fs');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      fs.writeFileSync(`/tmp/${requestId}-debug.html`, html);
      console.log(`[${requestId}] Screenshot saved to ${screenshotPath}`);
      
      // Log page structure
      const bodyContent = await page.evaluate(() => {
        return {
          title: document.title,
          url: window.location.href,
          bodyText: document.body.innerText.substring(0, 500),
          forms: document.forms.length,
          inputs: document.querySelectorAll('input, textarea, [contenteditable]').length
        };
      });
      console.log(`[${requestId}] Page structure:`, bodyContent);
      
      throw new Error('No input element found on page - may need to refresh cookies');
    }

    console.log(`[${requestId}] Using selector: ${foundSelector}`);
    
    // Clear any existing content and type the prompt
    await page.click(foundSelector);
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    
    await page.type(foundSelector, prompt);
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

const PORT = 3001;

// Add error handling for server startup
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[STARTUP] Puppeteer server running on port ${PORT}`);
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