# BrightGift Puppeteer Image Generator

A Node.js/Express server that uses Puppeteer to automate image generation via ChatGPT's web interface.

## Features

- POST `/generate` endpoint for image generation
- GET `/health` endpoint for health checks
- Railway-optimized Puppeteer configuration
- Comprehensive logging for debugging
- Automatic browser cleanup on errors

## Deployment on Railway

### Prerequisites
- Railway account
- Node.js 18+ environment

### Deployment Steps

1. **Connect Repository**
   - Link your GitHub repository to Railway
   - Railway will automatically detect the Node.js project

2. **Environment Variables**
   - Railway will automatically set `PORT` and `NODE_ENV`
   - No additional environment variables required

3. **Deploy**
   - Railway will use the `nixpacks.toml` configuration
   - Chromium dependencies will be automatically installed
   - The service will start with `node index.js`

### Configuration Files

- `nixpacks.toml` - Ensures Chromium dependencies are installed
- `railway.toml` - Railway-specific deployment configuration
- `package.json` - Node.js dependencies and scripts

## API Endpoints

### POST /generate
Generate images using a text prompt.

**Request Body:**
```json
{
  "slug": "unique-identifier",
  "label": "Image Label",
  "prompt": "A beautiful sunset over mountains"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Images generated successfully",
  "slug": "unique-identifier",
  "label": "Image Label",
  "prompt": "A beautiful sunset over mountains",
  "imageUrls": ["https://...", "https://..."],
  "requestId": "1234567890"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Troubleshooting

### 502 Errors
If you encounter 502 errors:

1. **Check Railway Logs**
   - Look for Puppeteer launch errors
   - Check for memory/timeout issues
   - Verify Chromium installation

2. **Common Issues**
   - **Memory Issues**: The service includes memory optimization flags
   - **Timeout Issues**: Increased timeouts for navigation and image generation
   - **Chromium Issues**: nixpacks.toml ensures proper dependencies

3. **Debug Steps**
   - Check the `/health` endpoint first
   - Review detailed logs in Railway dashboard
   - Look for request IDs in logs to trace specific failures

### Local Testing
```bash
# Install dependencies
npm install

# Start server
npm start

# Test endpoints
node test-endpoint.js
```

## Logging

The service includes comprehensive logging:
- Request tracking with unique IDs
- Puppeteer operation status
- Error details with stack traces
- Memory usage monitoring
- Startup information

All logs are prefixed with timestamps and request IDs for easy debugging.

## Memory Management

- Browser instances are properly closed on completion/error
- Memory optimization flags are set for Railway environment
- Automatic cleanup prevents memory leaks 
<!-- Trigger deployment: inconsequential change --> 