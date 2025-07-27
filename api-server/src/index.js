const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const WebSocket = require('ws');
const http = require('http');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const siteRoutes = require('./routes/sites');
const postRoutes = require('./routes/posts');
const workflowRoutes = require('./routes/workflows');
const webhookRoutes = require('./routes/webhooks');

// Import middleware
const { authenticateToken } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ server });

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/sites', authenticateToken, siteRoutes);
app.use('/api/v1/sites/:siteId/posts', authenticateToken, postRoutes);
app.use('/api/v1/sites/:siteId/workflows', authenticateToken, workflowRoutes);
app.use('/api/v1/webhooks', webhookRoutes);

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');
  
  // Extract siteId from URL if present
  const url = new URL(req.url, `http://${req.headers.host}`);
  const siteId = url.searchParams.get('siteId');
  
  if (siteId) {
    ws.siteId = siteId;
    ws.join(`site_${siteId}`);
  }
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('WebSocket message:', data);
    } catch (error) {
      console.error('Invalid WebSocket message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

// Make WebSocket server available to routes
app.set('wss', wss);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 WebSocket server ready`);
});

module.exports = { app, server, wss }; 