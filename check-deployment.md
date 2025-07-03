# Railway Deployment Monitoring Guide

## 🚂 Deployment Status Checklist

### Step 1: Check Railway Dashboard
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Find your `brightgift-puppeteer` project
3. Check the deployment status (should show "Deploying" or "Deployed")

### Step 2: Get Your Railway URL
1. In the Railway dashboard, click on your service
2. Look for the "Domains" section
3. Copy the generated URL (e.g., `https://brightgift-puppeteer-production-xxxx.up.railway.app`)

### Step 3: Test the Deployment

#### Option A: Using the Monitoring Script
```bash
# Set your Railway URL
export RAILWAY_URL="https://your-app-name.railway.app"

# Run the monitoring script
node monitor-deployment.js
```

#### Option B: Manual Testing
```bash
# Test health endpoint
curl https://your-app-name.railway.app/health

# Test generate endpoint
curl -X POST https://your-app-name.railway.app/generate \
  -H "Content-Type: application/json" \
  -d '{"slug":"test","label":"Test","prompt":"A red circle"}'
```

### Step 4: Check Railway Logs
1. In Railway dashboard, go to your service
2. Click on "Logs" tab
3. Look for:
   - `[STARTUP]` messages showing server startup
   - `[HEALTH]` messages for health check requests
   - `[REQUEST_ID]` messages for generate requests
   - Any error messages with detailed stack traces

## 🔍 What to Look For

### ✅ Successful Deployment Signs
- Server starts without errors
- Health endpoint returns `{"status":"healthy"}`
- Generate endpoint processes requests
- No 502 errors in logs

### ❌ Problem Indicators
- **502 Errors**: Service not responding
- **Puppeteer Launch Errors**: Chromium installation issues
- **Timeout Errors**: Service taking too long to respond
- **Memory Errors**: Container running out of memory

## 🛠️ Troubleshooting Steps

### If Health Check Fails
1. Check Railway logs for startup errors
2. Verify the service is actually running
3. Check if the port configuration is correct

### If Generate Endpoint Fails
1. Look for Puppeteer launch errors in logs
2. Check if Chromium dependencies are installed
3. Look for timeout or memory issues
4. Check the request ID in logs for detailed error info

### If 502 Errors Persist
1. Check Railway logs for crash information
2. Verify nixpacks.toml is being used
3. Check if the service is restarting repeatedly
4. Look for memory or timeout issues

## 📊 Expected Log Output

### Startup Logs
```
[STARTUP] Puppeteer server running on port 3000
[STARTUP] Environment: production
[STARTUP] Memory usage: 45MB
```

### Health Check Logs
```
[2024-01-01T00:00:00.000Z] GET /health - Request received
[HEALTH] Health check requested
```

### Generate Request Logs
```
[2024-01-01T00:00:00.000Z] POST /generate - Request received
[1234567890] Starting image generation request
[1234567890] Request body: { slug: 'test', label: 'Test', prompt: 'A red circle...' }
[1234567890] Launching Puppeteer browser...
[1234567890] Browser launched successfully
[1234567890] New page created
[1234567890] Navigating to ChatGPT...
[1234567890] Page loaded successfully
[1234567890] Waiting for textarea...
[1234567890] Textarea found, typing prompt...
[1234567890] Prompt typed, pressing Enter...
[1234567890] Waiting for images to generate...
[1234567890] Images detected, extracting URLs...
[1234567890] Extracted 4 image URLs: [array of URLs]
[1234567890] Browser closed, sending response
```

## 🎯 Next Steps After Successful Deployment

1. **Test with Real Data**: Send actual prompts from your n8n workflow
2. **Monitor Performance**: Watch response times and success rates
3. **Set Up Alerts**: Configure Railway alerts for service failures
4. **Scale if Needed**: Adjust Railway plan if you need more resources 