const express = require('express');
const app = express();

app.use(express.json());

// Simple health check
app.get('/health', (req, res) => {
  console.log('[HEALTH] Health check requested');
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'Test server is running'
  });
});

// Simple test endpoint
app.get('/test', (req, res) => {
  console.log('[TEST] Test endpoint requested');
  res.json({ 
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  });
});

// Test POST endpoint
app.post('/test', (req, res) => {
  console.log('[TEST] Test POST requested with body:', req.body);
  res.json({ 
    message: 'Test POST working',
    received: req.body,
    timestamp: new Date().toISOString()
  });
});

const port = process.env.PORT || 3000;

console.log('[STARTUP] Starting test server...');
console.log('[STARTUP] Environment:', process.env.NODE_ENV || 'development');
console.log('[STARTUP] Port:', port);

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`[STARTUP] Test server running on port ${port}`);
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