# 🔄 n8n Workflow Trigger Flow System

## 🎯 Purpose

Create a comprehensive n8n workflow trigger system that can launch **any workflow phase** via webhook based on dynamic inputs:

- `workflow_phase` (e.g., SEO_RESEARCH, CONTENT_GENERATION, IMAGE_GENERATION)
- `post_id` (e.g., blog-2025-01-15-example)
- `site_id` (e.g., brightgift, smart-baby-checklist)

This system provides a unified interface for triggering workflows from the dashboard, external systems, or automated processes.

---

## 🧱 Flow Structure: `Workflow Trigger System`

### 🔹 Input Variables

- `workflow_phase` (string) - The phase to trigger
- `post_id` (string) - Unique identifier for the content
- `site_id` (string) - Site identifier
- `trigger_type` (string) - Type of trigger (manual, automated, retry)
- `metadata` (object) - Additional data for the workflow

These can come from:

- Webhook parameters
- Dashboard user actions
- Previous workflow output
- External system triggers

---

### 🔸 Action Nodes

#### **1. Validate Trigger Input**
```javascript
// n8n Function Node: Validate Input
const input = $input.first().json;

// Required fields validation
const requiredFields = ['workflow_phase', 'post_id', 'site_id'];
const missingFields = requiredFields.filter(field => !input[field]);

if (missingFields.length > 0) {
  throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
}

// Validate workflow phase
const validPhases = [
  'SEO_RESEARCH', 'CONTENT_GENERATION', 'CONTENT_REVIEW',
  'IMAGE_GENERATION', 'PUBLISHING', 'APPROVAL', 'LIVE_DEPLOYMENT'
];

if (!validPhases.includes(input.workflow_phase)) {
  throw new Error(`Invalid workflow phase: ${input.workflow_phase}`);
}

// Validate site_id
const validSites = ['brightgift', 'smart-baby-checklist', 'cannabis-guide-hub'];
if (!validSites.includes(input.site_id)) {
  throw new Error(`Invalid site_id: ${input.site_id}`);
}

return input;
```

#### **2. Check Workflow State**
```javascript
// n8n Supabase Node: Get Current State
const { data: currentState } = await supabase
  .from('blog_workflow_state')
  .select('*')
  .eq('post_id', input.post_id)
  .single();

if (!currentState) {
  throw new Error(`No workflow state found for post_id: ${input.post_id}`);
}

// Validate workflow can proceed
if (currentState.status === 'completed') {
  throw new Error(`Workflow already completed for post_id: ${input.post_id}`);
}

if (currentState.status === 'failed' && input.trigger_type !== 'retry') {
  throw new Error(`Workflow failed for post_id: ${input.post_id}. Use retry trigger.`);
}

return { ...input, currentState };
```

#### **3. Update Workflow State**
```javascript
// n8n Supabase Node: Update State
const updateData = {
  current_phase: input.workflow_phase,
  status: 'in_progress',
  last_updated: new Date().toISOString(),
  metadata: {
    ...currentState.metadata,
    last_trigger: {
      type: input.trigger_type,
      timestamp: new Date().toISOString(),
      triggered_by: input.triggered_by || 'system'
    }
  }
};

const { data: updatedState } = await supabase
  .from('blog_workflow_state')
  .update(updateData)
  .eq('post_id', input.post_id)
  .select()
  .single();

return { ...input, updatedState };
```

#### **4. Log Workflow Execution**
```javascript
// n8n Supabase Node: Log Execution
const executionData = {
  post_id: input.post_id,
  phase_id: input.workflow_phase,
  started_at: new Date().toISOString(),
  status: 'running',
  execution_logs: {
    trigger_type: input.trigger_type,
    triggered_by: input.triggered_by || 'system',
    input_metadata: input.metadata || {}
  }
};

const { data: execution } = await supabase
  .from('workflow_executions')
  .insert(executionData)
  .select()
  .single();

return { ...input, execution };
```

#### **5. Trigger Target Workflow**
```javascript
// n8n HTTP Request Node: Trigger Workflow
const workflowWebhooks = {
  'SEO_RESEARCH': `${N8N_BASE_URL}/webhook/seo-workflow-trigger`,
  'CONTENT_GENERATION': `${N8N_BASE_URL}/webhook/content-workflow-trigger`,
  'CONTENT_REVIEW': `${N8N_BASE_URL}/webhook/review-workflow-trigger`,
  'IMAGE_GENERATION': `${N8N_BASE_URL}/webhook/image-workflow-trigger`,
  'PUBLISHING': `${N8N_BASE_URL}/webhook/publish-workflow-trigger`,
  'APPROVAL': `${N8N_BASE_URL}/webhook/approval-workflow-trigger`,
  'LIVE_DEPLOYMENT': `${N8N_BASE_URL}/webhook/deploy-workflow-trigger`
};

const webhookUrl = workflowWebhooks[input.workflow_phase];
const payload = {
  post_id: input.post_id,
  site_id: input.site_id,
  workflow_phase: input.workflow_phase,
  trigger_type: input.trigger_type,
  metadata: input.metadata,
  execution_id: execution.execution_id,
  timestamp: new Date().toISOString()
};

const response = await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${N8N_API_KEY}`
  },
  body: JSON.stringify(payload)
});

if (!response.ok) {
  throw new Error(`Failed to trigger workflow: ${response.statusText}`);
}

return { ...input, triggerResponse: await response.json() };
```

#### **6. Return Success Response**
```javascript
// n8n Function Node: Format Response
const response = {
  success: true,
  message: `Workflow ${input.workflow_phase} triggered successfully`,
  data: {
    post_id: input.post_id,
    site_id: input.site_id,
    workflow_phase: input.workflow_phase,
    execution_id: execution.execution_id,
    triggered_at: new Date().toISOString(),
    webhook_url: webhookUrl
  }
};

return response;
```

---

## 🔁 Trigger Types

### **1. Manual Trigger**
```javascript
// Dashboard user clicks "Start Workflow"
{
  "workflow_phase": "SEO_RESEARCH",
  "post_id": "blog-2025-01-15-example",
  "site_id": "brightgift",
  "trigger_type": "manual",
  "triggered_by": "user@example.com",
  "metadata": {
    "custom_topic": "Gift ideas for outdoor enthusiasts",
    "priority": "high"
  }
}
```

### **2. Automated Trigger**
```javascript
// Previous workflow phase completes
{
  "workflow_phase": "CONTENT_GENERATION",
  "post_id": "blog-2025-01-15-example",
  "site_id": "brightgift",
  "trigger_type": "automated",
  "triggered_by": "system",
  "metadata": {
    "previous_phase": "SEO_RESEARCH",
    "seo_results": { ... }
  }
}
```

### **3. Retry Trigger**
```javascript
// Retry failed workflow
{
  "workflow_phase": "CONTENT_GENERATION",
  "post_id": "blog-2025-01-15-example",
  "site_id": "brightgift",
  "trigger_type": "retry",
  "triggered_by": "system",
  "retry_count": 2,
  "metadata": {
    "error_reason": "OpenAI API timeout",
    "previous_attempts": 2
  }
}
```

### **4. Batch Trigger**
```javascript
// Trigger multiple workflows
{
  "batch": [
    {
      "workflow_phase": "SEO_RESEARCH",
      "post_id": "blog-2025-01-15-example-1",
      "site_id": "brightgift"
    },
    {
      "workflow_phase": "CONTENT_GENERATION",
      "post_id": "blog-2025-01-15-example-2",
      "site_id": "smart-baby-checklist"
    }
  ],
  "trigger_type": "batch",
  "triggered_by": "system"
}
```

---

## 🔧 Error Handling & Retry Logic

### **1. Input Validation Errors**
```javascript
// Handle validation errors
try {
  // Validate input
  const validatedInput = validateInput(input);
} catch (error) {
  return {
    success: false,
    error: error.message,
    error_type: 'validation_error',
    timestamp: new Date().toISOString()
  };
}
```

### **2. Workflow State Errors**
```javascript
// Handle state conflicts
if (currentState.status === 'in_progress' && currentState.current_phase !== input.workflow_phase) {
  return {
    success: false,
    error: `Workflow already in progress with phase: ${currentState.current_phase}`,
    error_type: 'state_conflict',
    current_state: currentState
  };
}
```

### **3. Webhook Trigger Errors**
```javascript
// Handle webhook failures
try {
  const response = await triggerWorkflow(webhookUrl, payload);
} catch (error) {
  // Update execution status
  await updateExecutionStatus(execution.execution_id, 'failed', error.message);
  
  // Update workflow state
  await updateWorkflowState(input.post_id, {
    status: 'failed',
    error_message: error.message
  });
  
  return {
    success: false,
    error: `Failed to trigger workflow: ${error.message}`,
    error_type: 'trigger_failure',
    execution_id: execution.execution_id
  };
}
```

### **4. Automatic Retry Logic**
```javascript
// Retry configuration
const retryConfig = {
  max_retries: 3,
  retry_delay_ms: 5000,
  backoff_multiplier: 2
};

// Retry logic
if (error && retryCount < retryConfig.max_retries) {
  const delay = retryConfig.retry_delay_ms * Math.pow(retryConfig.backoff_multiplier, retryCount);
  
  setTimeout(() => {
    triggerWorkflow(input, retryCount + 1);
  }, delay);
}
```

---

## 📊 Monitoring & Analytics

### **1. Trigger Analytics**
```sql
-- Trigger success rate by type
SELECT 
  trigger_type,
  COUNT(*) as total_triggers,
  COUNT(CASE WHEN success = true THEN 1 END) as successful,
  COUNT(CASE WHEN success = false THEN 1 END) as failed,
  ROUND(
    COUNT(CASE WHEN success = true THEN 1 END) * 100.0 / COUNT(*), 2
  ) as success_rate
FROM workflow_triggers
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY trigger_type;
```

### **2. Performance Metrics**
```sql
-- Average trigger response time
SELECT 
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_response_time_seconds,
  MAX(EXTRACT(EPOCH FROM (completed_at - started_at))) as max_response_time_seconds,
  MIN(EXTRACT(EPOCH FROM (completed_at - started_at))) as min_response_time_seconds
FROM workflow_triggers
WHERE completed_at IS NOT NULL;
```

### **3. Error Tracking**
```sql
-- Most common error types
SELECT 
  error_type,
  COUNT(*) as error_count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as error_percentage
FROM workflow_triggers
WHERE success = false
GROUP BY error_type
ORDER BY error_count DESC;
```

---

## 🔐 Security & Access Control

### **1. Webhook Authentication**
```javascript
// Verify webhook signature
const verifyWebhookSignature = (payload, signature, secret) => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
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
  maxRequests: 100, // Max requests per window
  message: 'Too many workflow triggers, please try again later'
};
```

### **3. Access Control**
```javascript
// Check user permissions
const checkUserPermissions = async (userId, siteId, action) => {
  const { data: permissions } = await supabase
    .from('user_permissions')
    .select('*')
    .eq('user_id', userId)
    .eq('site_id', siteId)
    .eq('action', action)
    .single();
  
  return permissions !== null;
};
```

---

## ✅ Benefits

- **Unified Interface**: Single endpoint for all workflow triggers
- **Robust Error Handling**: Comprehensive error handling and retry logic
- **Real-time Monitoring**: Live tracking of trigger performance
- **Security**: Built-in authentication and access control
- **Scalability**: Support for batch operations and high throughput
- **Flexibility**: Support for multiple trigger types and workflows
- **Audit Trail**: Complete logging of all trigger activities

---

*This trigger system provides a comprehensive framework for launching n8n workflows with proper validation, error handling, monitoring, and security controls.* 