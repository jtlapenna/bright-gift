# 🔄 Workflow Reference Guide for n8n Multi-Site Content System

This document provides essential reference information for developers and workflows working on the n8n-based multi-site content automation system. It contains foundational architecture insights and component assessments that are relevant across all phases of development.

---

## 📚 **Foundational Documents Summary**

### 🎯 **Key Foundational Documents Reviewed:**

#### **1. `n8n_workflow_system.md`** - System Architecture
- **New System**: n8n workflow-based with webhook triggers for each phase
- **State Management**: Supabase-based (not file-based)
- **Orchestration**: Webhook-triggered workflow chaining with n8n
- **Processing**: Multi-site concurrent with database-based organization

#### **2. `n8n_workflow_routing_design.md`** - Workflow Routing
- **Workflow Routing**: Each workflow phase processes based on Supabase state
- **Multi-Site Support**: Workflows can handle multiple sites and posts in different phases
- **Stateful Design**: Workflows pick up work based on database state

#### **3. `supabase_schema_and_sql.md`** - Database Design
- **Real-Time Dashboard**: Supabase tracks live status for dashboard display
- **State Tracking**: `blog_workflow_state` table with current phase, next workflow phase, etc.
- **Multi-Site Support**: Database supports concurrent site and post processing

#### **4. `web_tool_feature_overview.md`** - Dashboard Design
- **Multi-Site Control Hub**: Web-based dashboard for managing multiple sites
- **Workflow Management**: Real-time workflow status and control
- **Analytics**: Performance tracking and insights across sites

#### **5. `n8n_webhook_trigger_flow.md`** - Trigger System
- **Webhook Triggers**: Handle all workflow initiation (manual, scheduled, external, chain)
- **n8n Workflows**: Handle all content work (SEO, writing, review, images, publishing)
- **Dashboard Integration**: Direct webhook integration for real-time updates

---

## 📊 **Component Assessment & Reusability**

### ✅ **Components Ready for Reuse (11 total)**
Many utilities from the existing system align perfectly with the new n8n workflow system:

- **SEO Processing** → **SEO Workflow** (keyword research, topic generation)
- **GitHub Integration** → **Publishing Workflow** (version control, preview branches)
- **Content Checker** → **Review Workflow** (validation, optimization)
- **Image Generation** → **Image Workflow** (image creation)
- **Social Media** → **Social Workflow** (social posts)
- **Notification Service** → **n8n Integration** (webhook notifications)
- **Google Ads** → **SEO Workflow** (enhanced keyword research)
- **Environment Templates** → **System Setup** (configuration templates)
- **Cloudflare Integration** → **Publishing Workflow** (preview deployment)
- **CLI System** → **Development/Testing** (automation interface)
- **Planning Documentation** → **Implementation Guide** (comprehensive plans)

### 🔧 **Major Refactoring Required:**
- **Content Pipeline** → **n8n workflow system**
- **Workflow Config** → **Supabase state management**
- **Approval System** → **Web-based dashboard**
- **Content Generation** → **n8n workflow-based creation**

---

## 🎯 **Key Architecture Insights**

### **System Transformation:**
The current system has **much more reusable value** than initially assessed. The utilities are well-designed and can be **mapped directly to specific n8n workflows** in the new system.

### **Main Changes Required:**
1. **Architecture**: Monolithic pipeline → n8n workflow system
2. **State Management**: File-based → Supabase-based
3. **Content Generation**: GPT assistants → n8n workflows with OpenAI integration
4. **Orchestration**: Manual → Webhook-triggered with n8n

### **Workflow Responsibilities:**
- **SEO Workflow**: Keyword research, topic generation, Google Ads integration
- **Content Workflow**: Content creation using n8n workflows with OpenAI integration
- **Review Workflow**: Content validation, optimization, SEO enhancement
- **Image Workflow**: Image generation and processing
- **Publishing Workflow**: GitHub operations, Cloudflare deployment
- **Social Workflow**: Social media post generation and scheduling

---

## 📁 **Database Structure Reference**

### **New System Structure:**
```sql
-- Core workflow state table
blog_workflow_state (
  post_id text PRIMARY KEY,
  site_id text NOT NULL,
  title text,
  current_phase text,
  next_workflow_phase text,
  status text,
  workflow_phases_completed text[],
  metadata jsonb,
  created_at timestamp,
  last_updated timestamp,
  approved_by text,
  approved_at timestamp
)

-- Sites management
sites (
  site_id text PRIMARY KEY,
  site_name text,
  domain text,
  description text,
  created_at timestamp
)

-- Workflow phases definition
workflow_phases (
  phase_id text PRIMARY KEY,
  phase_name text,
  description text,
  order_index integer,
  is_required boolean
)

-- Workflow execution tracking
workflow_executions (
  execution_id text PRIMARY KEY,
  post_id text,
  workflow_phase text,
  status text,
  started_at timestamp,
  completed_at timestamp,
  execution_data jsonb,
  error_message text
)
```

### **State Management:**
- **Database-based**: `blog_workflow_state` table for all workflow state
- **Real-time**: Supabase real-time subscriptions for dashboard updates
- **Workflow Routing**: Based on `current_phase` and `next_workflow_phase` fields

---

## 🔄 **Workflow Phases**

### **n8n Workflow Phases:**
1. **SEO_RESEARCH** → Keyword research, topic selection
2. **CONTENT_GENERATION** → Content generation
3. **CONTENT_REVIEW** → Content optimization
4. **IMAGE_GENERATION** → Image generation
5. **PUBLISHING** → GitHub deployment
6. **APPROVAL** → Human approval process
7. **LIVE_DEPLOYMENT** → Live site deployment

### **n8n Responsibilities:**
- Webhook-based workflow triggering
- Dashboard state updates via Supabase
- Notifications (webhook/email)
- Workflow execution logging
- Scheduling and automation

---

## 🔧 **n8n Workflow Configuration**

### **Workflow Types:**
```javascript
// Full workflow (all phases)
const fullWorkflow = {
  workflow_type: 'full',
  phases: ['SEO_RESEARCH', 'CONTENT_GENERATION', 'CONTENT_REVIEW', 'IMAGE_GENERATION', 'PUBLISHING', 'APPROVAL', 'LIVE_DEPLOYMENT']
};

// SEO only workflow
const seoWorkflow = {
  workflow_type: 'seo_only',
  phases: ['SEO_RESEARCH']
};

// Content only workflow
const contentWorkflow = {
  workflow_type: 'content_only',
  phases: ['CONTENT_GENERATION', 'CONTENT_REVIEW']
};

// Publish only workflow
const publishWorkflow = {
  workflow_type: 'publish_only',
  phases: ['PUBLISHING', 'APPROVAL', 'LIVE_DEPLOYMENT']
};
```

### **Webhook Configuration:**
```javascript
// Webhook endpoints for each workflow phase
const workflowWebhooks = {
  'SEO_RESEARCH': `${N8N_BASE_URL}/webhook/seo-workflow-trigger`,
  'CONTENT_GENERATION': `${N8N_BASE_URL}/webhook/content-workflow-trigger`,
  'CONTENT_REVIEW': `${N8N_BASE_URL}/webhook/review-workflow-trigger`,
  'IMAGE_GENERATION': `${N8N_BASE_URL}/webhook/image-workflow-trigger`,
  'PUBLISHING': `${N8N_BASE_URL}/webhook/publish-workflow-trigger`,
  'APPROVAL': `${N8N_BASE_URL}/webhook/approval-workflow-trigger`,
  'LIVE_DEPLOYMENT': `${N8N_BASE_URL}/webhook/deploy-workflow-trigger`
};
```

---

## 🎛️ **Dashboard Integration**

### **Multi-Site Control Hub Features:**
- **Global Dashboard**: Overview of all sites and workflows
- **Site-Specific Control**: Individual site management
- **Workflow Management**: Real-time workflow status and control
- **Analytics**: Performance tracking across sites
- **Approval System**: Human-in-the-loop approval process

### **Real-Time Updates:**
```javascript
// Supabase real-time subscription
const subscription = supabase
  .channel('workflow_updates')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'blog_workflow_state' },
    (payload) => {
      // Update dashboard in real-time
      updateWorkflowStatus(payload.new);
    }
  )
  .subscribe();
```

---

## 🔄 **Workflow Execution Flow**

### **Standard Workflow Execution:**
1. **Webhook Trigger** → Workflow initiated via webhook
2. **State Validation** → Check current workflow state in Supabase
3. **Workflow Processing** → Execute workflow logic
4. **State Update** → Update workflow state in Supabase
5. **Next Phase Trigger** → Trigger next workflow phase if applicable
6. **Dashboard Update** → Real-time dashboard update via Supabase

### **Error Handling:**
```javascript
// Workflow error handling
try {
  // Execute workflow logic
  const result = await executeWorkflowPhase(workflowData);
  
  // Update state on success
  await updateWorkflowState({
    post_id: workflowData.post_id,
    current_phase: workflowData.workflow_phase,
    status: 'completed',
    workflow_phases_completed: [...workflowData.workflow_phases_completed, workflowData.workflow_phase]
  });
  
  // Trigger next phase
  if (workflowData.next_workflow_phase) {
    await triggerNextWorkflow(workflowData);
  }
} catch (error) {
  // Log error and update state
  await logWorkflowError(workflowData, error);
  await updateWorkflowState({
    post_id: workflowData.post_id,
    status: 'failed',
    error_message: error.message
  });
}
```

---

## 📊 **Monitoring & Analytics**

### **Workflow Performance Metrics:**
```sql
-- Workflow execution performance
SELECT 
  workflow_phase,
  COUNT(*) as total_executions,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
FROM workflow_executions
WHERE started_at >= NOW() - INTERVAL '7 days'
GROUP BY workflow_phase
ORDER BY total_executions DESC;
```

### **Site Performance Analytics:**
```sql
-- Site-specific workflow performance
SELECT 
  s.site_name,
  COUNT(w.post_id) as total_posts,
  COUNT(CASE WHEN w.status = 'completed' THEN 1 END) as completed_posts,
  AVG(EXTRACT(EPOCH FROM (w.last_updated - w.created_at))) as avg_processing_time
FROM sites s
LEFT JOIN blog_workflow_state w ON s.site_id = w.site_id
GROUP BY s.site_id, s.site_name
ORDER BY total_posts DESC;
```

---

## 💡 **Development Guidelines**

### **For n8n Workflows:**
- Always check Supabase `blog_workflow_state` for current status
- Update state in Supabase after completing tasks
- Use consistent workflow phase names and transitions
- Trigger next workflow phase via webhook
- Log all activities in `workflow_executions` table

### **For Dashboard Development:**
- Use Supabase real-time subscriptions for live updates
- Implement multi-site filtering and management
- Provide workflow initiation and control interfaces
- Enable human-in-the-loop approval when needed
- Display comprehensive analytics and performance metrics

### **For System Integration:**
- Use webhook-based triggers for all workflow initiation
- Implement comprehensive error handling and retry logic
- Ensure multi-site concurrent processing
- Maintain database-based organization
- Enable real-time dashboard updates

---

## 🔐 **Security & Authentication**

### **Webhook Security:**
```javascript
// Webhook signature verification
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

### **Rate Limiting:**
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
```

---

## 🚀 **Deployment & Configuration**

### **Environment Variables:**
```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# n8n Configuration
N8N_BASE_URL=https://your-n8n-instance.com
N8N_API_KEY=your_n8n_api_key
WEBHOOK_SECRET=your_webhook_secret

# Multi-Site Configuration
DEFAULT_SITE_ID=brightgift
AVAILABLE_SITES=brightgift,smart-baby-checklist,cannabis-guide-hub

# Dashboard Configuration
DASHBOARD_URL=https://your-dashboard.com
```

### **Deployment Checklist:**
- [ ] Supabase database schema created
- [ ] n8n workflows configured and tested
- [ ] Webhook endpoints secured and tested
- [ ] Dashboard deployed and connected
- [ ] Real-time subscriptions working
- [ ] Error handling and monitoring configured
- [ ] Rate limiting and security measures in place

---

*This guide should be referenced by all developers and workflows working on the n8n-based multi-site content system to ensure consistent understanding and implementation.* 