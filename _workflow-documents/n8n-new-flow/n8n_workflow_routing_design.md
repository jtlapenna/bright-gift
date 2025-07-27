# 🔄 n8n Workflow Routing Design for Multi-Site Support

## 🎯 Goal
Enable n8n workflows to detect which content workflow to process next by evaluating multiple sites and posts in various phases, allowing concurrent or out-of-order publishing workflows across multiple sites.

---

## 🗂️ Database Structure Context
Each content workflow is tracked in Supabase:
```sql
-- Main workflow state table
blog_workflow_state (
  post_id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  current_phase TEXT,
  next_workflow_phase TEXT,
  status TEXT DEFAULT 'in_progress',
  workflow_phases_completed JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}'
)

-- Workflow execution tracking
workflow_executions (
  execution_id UUID PRIMARY KEY,
  post_id TEXT REFERENCES blog_workflow_state(post_id),
  phase_id TEXT REFERENCES workflow_phases(phase_id),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'running',
  execution_logs JSONB DEFAULT '{}'
)
```

---

## 🔍 Workflow Routing Logic
When a workflow phase completes, it triggers the next workflow phase by:

1. **Updating Workflow State**: Mark current phase as complete
2. **Determining Next Phase**: Based on workflow type and completion status
3. **Triggering Next Workflow**: Send webhook to next workflow phase
4. **Logging Execution**: Record completion in workflow_executions table

### **Workflow Phase Flow**
```
SEO_RESEARCH → CONTENT_GENERATION → CONTENT_REVIEW → IMAGE_GENERATION → PUBLISHING → APPROVAL → LIVE_DEPLOYMENT
```

### **Workflow Type Variations**
- **Full Workflow**: All phases
- **SEO Only**: SEO_RESEARCH only
- **Content Only**: CONTENT_GENERATION → CONTENT_REVIEW → IMAGE_GENERATION
- **Publish Only**: PUBLISHING → APPROVAL → LIVE_DEPLOYMENT

---

## ✅ Supported Behaviors
- Multiple sites with concurrent workflows
- Multiple posts per site in different phases
- Ability to pause/resume workflows at any phase
- Site-specific workflow configurations
- Real-time dashboard updates
- Error handling and retry mechanisms

---

## 🧾 Example Workflow Routing Condition
```javascript
// n8n Function Node: Determine Next Workflow Phase
const workflowData = $input.first().json;
const currentPhase = workflowData.current_phase;
const workflowType = workflowData.metadata.workflow_type;

// Define phase transitions
const phaseTransitions = {
  'SEO_RESEARCH': 'CONTENT_GENERATION',
  'CONTENT_GENERATION': 'CONTENT_REVIEW',
  'CONTENT_REVIEW': 'IMAGE_GENERATION',
  'IMAGE_GENERATION': 'PUBLISHING',
  'PUBLISHING': 'APPROVAL',
  'APPROVAL': 'LIVE_DEPLOYMENT'
};

// Determine next phase based on workflow type
let nextPhase = null;
if (workflowType === 'full') {
  nextPhase = phaseTransitions[currentPhase];
} else if (workflowType === 'seo_only') {
  nextPhase = null; // End workflow
} else if (workflowType === 'content_only') {
  if (['CONTENT_GENERATION', 'CONTENT_REVIEW', 'IMAGE_GENERATION'].includes(currentPhase)) {
    nextPhase = phaseTransitions[currentPhase];
  }
}

// Update workflow state
const updateData = {
  current_phase: nextPhase || 'completed',
  next_workflow_phase: nextPhase ? phaseTransitions[nextPhase] : null,
  workflow_phases_completed: [...workflowData.workflow_phases_completed, currentPhase],
  status: nextPhase ? 'in_progress' : 'completed',
  last_updated: new Date().toISOString()
};

// Trigger next workflow if applicable
if (nextPhase) {
  await triggerNextWorkflow(workflowData.post_id, nextPhase, updateData);
}
```

---

## 📤 Workflow State Update Example (after SEO_RESEARCH completes)
```json
{
  "post_id": "blog-2025-01-15-example",
  "site_id": "brightgift",
  "current_phase": "CONTENT_GENERATION",
  "next_workflow_phase": "CONTENT_REVIEW",
  "status": "in_progress",
  "workflow_phases_completed": ["SEO_RESEARCH"],
  "metadata": {
    "seo_results": {
      "keywords": [...],
      "selected_keyword": {...},
      "content_structure": {...}
    },
    "workflow_type": "full",
    "seo_research_completed_at": "2025-01-15T10:30:00Z"
  },
  "last_updated": "2025-01-15T10:30:00Z"
}
```

---

## 🔄 Webhook Trigger Patterns

### **1. Workflow Phase Completion Webhook**
```javascript
// Trigger next workflow phase
const webhookUrl = `${N8N_BASE_URL}/webhook/${nextPhase.toLowerCase()}-trigger`;
const payload = {
  post_id: workflowData.post_id,
  site_id: workflowData.site_id,
  previous_phase: currentPhase,
  phase_data: phaseResults,
  trigger_type: 'phase_completion',
  timestamp: new Date().toISOString()
};

await fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
```

### **2. Manual Workflow Initiation Webhook**
```javascript
// Manual workflow start
const webhookUrl = `${N8N_BASE_URL}/webhook/workflow-initiation`;
const payload = {
  post_id: `blog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  site_id: selectedSite,
  workflow_type: 'full',
  custom_topic: customTopic,
  trigger_type: 'manual_initiation',
  timestamp: new Date().toISOString()
};
```

### **3. Error Recovery Webhook**
```javascript
// Retry failed workflow phase
const webhookUrl = `${N8N_BASE_URL}/webhook/${failedPhase.toLowerCase()}-retry`;
const payload = {
  post_id: workflowData.post_id,
  site_id: workflowData.site_id,
  phase: failedPhase,
  retry_count: retryCount,
  error_details: errorMessage,
  trigger_type: 'error_recovery',
  timestamp: new Date().toISOString()
};
```

---

## 🧩 Benefits
- **Visual Workflow Design**: n8n provides visual workflow builder
- **Built-in Error Handling**: Automatic retry and error recovery
- **Real-time Monitoring**: Live workflow execution tracking
- **Scalable Architecture**: Handle multiple sites and workflows
- **Flexible Routing**: Easy to modify workflow paths
- **State Persistence**: Database-backed state management
- **Webhook Integration**: Seamless integration with external services

---

## 🔧 Implementation Details

### **Workflow Configuration**
```json
{
  "workflow_name": "Content Generation Workflow",
  "trigger_type": "webhook",
  "webhook_path": "content-generation-trigger",
  "nodes": [
    {
      "name": "Validate Input",
      "type": "function",
      "parameters": {
        "functionCode": "// Validate webhook payload"
      }
    },
    {
      "name": "Update Workflow State",
      "type": "supabase",
      "parameters": {
        "operation": "upsert",
        "table": "blog_workflow_state"
      }
    },
    {
      "name": "Generate Content",
      "type": "openAi",
      "parameters": {
        "resource": "chat",
        "operation": "create"
      }
    },
    {
      "name": "Trigger Next Phase",
      "type": "httpRequest",
      "parameters": {
        "method": "POST",
        "url": "={{ $json.next_workflow_url }}"
      }
    }
  ]
}
```

### **Error Handling Strategy**
```javascript
// Error handling in workflow nodes
try {
  // Workflow logic
  await processWorkflowPhase(data);
} catch (error) {
  // Log error to workflow_executions
  await logWorkflowError(postId, phaseId, error);
  
  // Update workflow state
  await updateWorkflowState(postId, {
    status: 'failed',
    error_message: error.message
  });
  
  // Trigger error recovery workflow
  await triggerErrorRecovery(postId, phaseId, error);
}
```

### **Multi-Site Support**
```javascript
// Site-specific workflow configuration
const siteConfigs = {
  'brightgift': {
    content_style: 'gift_guide',
    target_audience: 'gift_shoppers',
    seo_focus: 'gift_keywords'
  },
  'smart-baby-checklist': {
    content_style: 'checklist',
    target_audience: 'new_parents',
    seo_focus: 'baby_essentials'
  },
  'cannabis-guide-hub': {
    content_style: 'educational',
    target_audience: 'cannabis_enthusiasts',
    seo_focus: 'cannabis_education'
  }
};
```

---

## 📊 Monitoring and Analytics

### **Workflow Performance Tracking**
```sql
-- Workflow performance summary
SELECT 
  wp.phase_name,
  s.site_name,
  COUNT(*) as total_executions,
  AVG(EXTRACT(EPOCH FROM (we.completed_at - we.started_at))) as avg_duration_seconds,
  COUNT(CASE WHEN we.status = 'completed' THEN 1 END) as successful,
  COUNT(CASE WHEN we.status = 'failed' THEN 1 END) as failed
FROM workflow_executions we
JOIN workflow_phases wp ON we.phase_id = wp.phase_id
JOIN blog_workflow_state bws ON we.post_id = bws.post_id
JOIN sites s ON bws.site_id = s.site_id
GROUP BY wp.phase_name, s.site_name;
```

### **Real-time Dashboard Updates**
```javascript
// Supabase real-time subscription
const channel = supabase
  .channel('workflow_updates')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'blog_workflow_state' },
    (payload) => {
      // Update dashboard in real-time
      updateDashboardState(payload.new);
    }
  )
  .subscribe();
```

---

*This design provides a comprehensive framework for routing n8n workflows across multiple sites and content types, with built-in error handling, monitoring, and real-time updates.* 