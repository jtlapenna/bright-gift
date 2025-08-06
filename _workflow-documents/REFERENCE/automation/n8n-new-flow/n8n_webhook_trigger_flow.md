# 🔄 n8n Webhook Trigger Flow System

## 🎯 Purpose

Create a comprehensive webhook-based trigger system for n8n workflows that can be initiated by:

- Dashboard user actions (manual triggers)
- Scheduled cron jobs (automated triggers)
- External system integrations (API triggers)
- Previous workflow completions (chained triggers)

This system replaces Slack-based triggers with direct webhook triggers for better reliability, performance, and integration.

---

## 🧱 Flow Structure: `Webhook Trigger System`

### 🔹 Trigger Options

#### **1. Dashboard Webhook Trigger**
```javascript
// Triggered by frontend dashboard
POST /webhook/workflow-initiation
{
  "workflow_phase": "SEO_RESEARCH",
  "site_id": "brightgift",
  "custom_topic": "Gift ideas for outdoor enthusiasts",
  "workflow_type": "full",
  "trigger_type": "manual",
  "triggered_by": "user@example.com"
}
```

#### **2. Scheduled Cron Trigger**
```javascript
// Triggered by scheduled cron job
POST /webhook/scheduled-workflow
{
  "workflow_phase": "SEO_RESEARCH",
  "site_id": "brightgift",
  "trigger_type": "scheduled",
  "schedule_id": "daily-seo-research",
  "triggered_by": "system"
}
```

#### **3. External API Trigger**
```javascript
// Triggered by external system
POST /webhook/external-workflow
{
  "workflow_phase": "CONTENT_GENERATION",
  "post_id": "blog-2025-01-15-example",
  "site_id": "brightgift",
  "trigger_type": "external",
  "source": "content_calendar",
  "triggered_by": "external-system"
}
```

#### **4. Workflow Chain Trigger**
```javascript
// Triggered by previous workflow completion
POST /webhook/workflow-chain
{
  "workflow_phase": "CONTENT_REVIEW",
  "post_id": "blog-2025-01-15-example",
  "site_id": "brightgift",
  "trigger_type": "chain",
  "previous_phase": "CONTENT_GENERATION",
  "triggered_by": "system"
}
```

---

### 🔸 Action Nodes

#### **1. Webhook Receiver**
```javascript
// n8n Webhook Node: Receive Trigger
{
  "parameters": {
    "httpMethod": "POST",
    "path": "workflow-trigger",
    "responseMode": "lastNode",
    "options": {
      "responseHeaders": {
        "parameters": [
          {
            "name": "Content-Type",
            "value": "application/json"
          }
        ]
      }
    }
  },
  "name": "Webhook Receiver",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 1
}
```

#### **2. Validate Webhook Payload**
```javascript
// n8n Function Node: Validate Input
const payload = $input.first().json;

// Validate required fields
const requiredFields = ['workflow_phase', 'site_id'];
const missingFields = requiredFields.filter(field => !payload[field]);

if (missingFields.length > 0) {
  throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
}

// Validate workflow phase
const validPhases = [
  'SEO_RESEARCH', 'CONTENT_GENERATION', 'CONTENT_REVIEW',
  'IMAGE_GENERATION', 'PUBLISHING', 'APPROVAL', 'LIVE_DEPLOYMENT'
];

if (!validPhases.includes(payload.workflow_phase)) {
  throw new Error(`Invalid workflow phase: ${payload.workflow_phase}`);
}

// Validate site_id
const validSites = ['brightgift', 'smart-baby-checklist', 'cannabis-guide-hub'];
if (!validSites.includes(payload.site_id)) {
  throw new Error(`Invalid site_id: ${payload.site_id}`);
}

// Generate post_id if not provided
if (!payload.post_id) {
  payload.post_id = `blog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

return payload;
```

#### **3. Authenticate Request**
```javascript
// n8n Function Node: Authenticate
const payload = $input.first().json;
const headers = $input.first().headers;

// Verify webhook signature
const signature = headers['x-webhook-signature'];
const expectedSignature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');

if (signature !== expectedSignature) {
  throw new Error('Invalid webhook signature');
}

// Check rate limiting
const clientId = headers['x-client-id'] || 'default';
const rateLimitKey = `rate_limit:${clientId}`;

// Rate limiting logic here...

return payload;
```

#### **4. Create Workflow State**
```javascript
// n8n Supabase Node: Create State
const payload = $input.first().json;

const workflowData = {
  post_id: payload.post_id,
  site_id: payload.site_id,
  title: payload.custom_topic || 'Untitled Blog Post',
  current_phase: payload.workflow_phase,
  next_workflow_phase: getNextPhase(payload.workflow_phase),
  status: 'initiated',
  workflow_phases_completed: [],
  metadata: {
    workflow_type: payload.workflow_type || 'full',
    custom_topic: payload.custom_topic,
    trigger_type: payload.trigger_type,
    triggered_by: payload.triggered_by,
    initiated_at: new Date().toISOString()
  },
  created_at: new Date().toISOString(),
  last_updated: new Date().toISOString()
};

const { data, error } = await supabase
  .from('blog_workflow_state')
  .insert(workflowData)
  .select()
  .single();

if (error) throw error;

return { ...payload, workflowState: data };
```

#### **5. Log Trigger Event**
```javascript
// n8n Supabase Node: Log Event
const payload = $input.first().json;
const workflowState = $input.first().json.workflowState;

const triggerLog = {
  post_id: payload.post_id,
  trigger_type: payload.trigger_type,
  workflow_phase: payload.workflow_phase,
  site_id: payload.site_id,
  triggered_by: payload.triggered_by,
  trigger_data: payload,
  timestamp: new Date().toISOString(),
  status: 'success'
};

const { data, error } = await supabase
  .from('workflow_triggers')
  .insert(triggerLog)
  .select()
  .single();

if (error) throw error;

return { ...payload, triggerLog: data };
```

#### **6. Trigger Target Workflow**
```javascript
// n8n HTTP Request Node: Trigger Workflow
const payload = $input.first().json;

const workflowWebhooks = {
  'SEO_RESEARCH': `${N8N_BASE_URL}/webhook/seo-workflow-trigger`,
  'CONTENT_GENERATION': `${N8N_BASE_URL}/webhook/content-workflow-trigger`,
  'CONTENT_REVIEW': `${N8N_BASE_URL}/webhook/review-workflow-trigger`,
  'IMAGE_GENERATION': `${N8N_BASE_URL}/webhook/image-workflow-trigger`,
  'PUBLISHING': `${N8N_BASE_URL}/webhook/publish-workflow-trigger`,
  'APPROVAL': `${N8N_BASE_URL}/webhook/approval-workflow-trigger`,
  'LIVE_DEPLOYMENT': `${N8N_BASE_URL}/webhook/deploy-workflow-trigger`
};

const webhookUrl = workflowWebhooks[payload.workflow_phase];
const triggerPayload = {
  post_id: payload.post_id,
  site_id: payload.site_id,
  workflow_phase: payload.workflow_phase,
  trigger_type: payload.trigger_type,
  metadata: payload.metadata || {},
  timestamp: new Date().toISOString()
};

const response = await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${N8N_API_KEY}`,
    'X-Webhook-Signature': generateSignature(triggerPayload)
  },
  body: JSON.stringify(triggerPayload)
});

if (!response.ok) {
  throw new Error(`Failed to trigger workflow: ${response.statusText}`);
}

return { ...payload, triggerResponse: await response.json() };
```

#### **7. Return Success Response**
```javascript
// n8n Respond to Webhook Node: Success Response
const payload = $input.first().json;
const workflowState = $input.first().json.workflowState;

const response = {
  success: true,
  message: `Workflow ${payload.workflow_phase} initiated successfully`,
  data: {
    post_id: payload.post_id,
    site_id: payload.site_id,
    workflow_phase: payload.workflow_phase,
    status: 'initiated',
    dashboard_url: `${DASHBOARD_URL}/workflows/${payload.post_id}`,
    triggered_at: new Date().toISOString()
  }
};

return response;
```

---

## 🔧 Webhook Configuration

### **1. Webhook Security**
```javascript
// Webhook signature generation
const generateSignature = (payload, secret = WEBHOOK_SECRET) => {
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
};

// Webhook signature verification
const verifySignature = (payload, signature, secret = WEBHOOK_SECRET) => {
  const expectedSignature = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};
```

### **2. Rate Limiting**
```javascript
// Rate limiting configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: {
    'manual': 50,
    'scheduled': 10,
    'external': 100,
    'chain': 200
  }
};

// Rate limiting implementation
const checkRateLimit = async (clientId, triggerType) => {
  const key = `rate_limit:${clientId}:${triggerType}`;
  const current = await redis.get(key);
  
  if (current && parseInt(current) >= rateLimitConfig.maxRequests[triggerType]) {
    throw new Error('Rate limit exceeded');
  }
  
  await redis.incr(key);
  await redis.expire(key, rateLimitConfig.windowMs / 1000);
};
```

### **3. Webhook Endpoints**
```javascript
// Available webhook endpoints
const webhookEndpoints = {
  '/webhook/workflow-initiation': {
    method: 'POST',
    description: 'Manual workflow initiation from dashboard',
    auth: 'webhook_signature',
    rateLimit: 'manual'
  },
  '/webhook/scheduled-workflow': {
    method: 'POST',
    description: 'Scheduled workflow triggers',
    auth: 'webhook_signature',
    rateLimit: 'scheduled'
  },
  '/webhook/external-workflow': {
    method: 'POST',
    description: 'External system workflow triggers',
    auth: 'api_key',
    rateLimit: 'external'
  },
  '/webhook/workflow-chain': {
    method: 'POST',
    description: 'Chained workflow triggers',
    auth: 'internal',
    rateLimit: 'chain'
  }
};
```

---

## 🔄 Integration Patterns

### **1. Dashboard Integration**
```javascript
// Frontend dashboard trigger
const triggerWorkflow = async (workflowPhase, siteId, customTopic) => {
  const response = await fetch('/api/webhooks/workflow-initiation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      workflow_phase: workflowPhase,
      site_id: siteId,
      custom_topic: customTopic,
      workflow_type: 'full',
      trigger_type: 'manual',
      triggered_by: user.email
    })
  });
  
  return response.json();
};
```

### **2. Scheduled Triggers**
```javascript
// Cron job configuration
const scheduledTriggers = [
  {
    name: 'daily-seo-research',
    schedule: '0 9 * * *', // Daily at 9 AM
    workflow_phase: 'SEO_RESEARCH',
    site_id: 'brightgift',
    trigger_type: 'scheduled'
  },
  {
    name: 'weekly-content-review',
    schedule: '0 10 * * 1', // Weekly on Monday at 10 AM
    workflow_phase: 'CONTENT_REVIEW',
    site_id: 'brightgift',
    trigger_type: 'scheduled'
  }
];
```

### **3. External System Integration**
```javascript
// External system webhook
const externalWebhook = {
  url: `${N8N_BASE_URL}/webhook/external-workflow`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${EXTERNAL_API_KEY}`,
    'X-Webhook-Signature': generateSignature(payload)
  },
  body: {
    workflow_phase: 'CONTENT_GENERATION',
    post_id: 'blog-2025-01-15-example',
    site_id: 'brightgift',
    trigger_type: 'external',
    source: 'content_calendar',
    metadata: {
      content_brief: '...',
      target_audience: '...',
      seo_keywords: '...'
    }
  }
};
```

---

## 📊 Monitoring & Analytics

### **1. Webhook Performance**
```sql
-- Webhook trigger performance
SELECT 
  trigger_type,
  workflow_phase,
  COUNT(*) as total_triggers,
  AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_response_time,
  COUNT(CASE WHEN status = 'success' THEN 1 END) as successful,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
FROM workflow_triggers
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY trigger_type, workflow_phase
ORDER BY total_triggers DESC;
```

### **2. Error Tracking**
```sql
-- Webhook error analysis
SELECT 
  error_type,
  trigger_type,
  COUNT(*) as error_count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as error_percentage
FROM workflow_triggers
WHERE status = 'failed'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY error_type, trigger_type
ORDER BY error_count DESC;
```

### **3. Usage Analytics**
```sql
-- Webhook usage by client
SELECT 
  triggered_by,
  trigger_type,
  COUNT(*) as usage_count,
  COUNT(DISTINCT post_id) as unique_posts
FROM workflow_triggers
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY triggered_by, trigger_type
ORDER BY usage_count DESC;
```

---

## ✅ Benefits

- **Direct Integration**: No Slack dependency, faster response times
- **Better Security**: Webhook signatures and rate limiting
- **Scalable**: Handle high-volume triggers efficiently
- **Flexible**: Support multiple trigger types and sources
- **Reliable**: Built-in error handling and retry logic
- **Monitorable**: Comprehensive logging and analytics
- **Extensible**: Easy to add new trigger types and integrations

---

*This webhook trigger system provides a robust, secure, and scalable foundation for triggering n8n workflows from various sources while maintaining proper authentication, rate limiting, and monitoring.* 