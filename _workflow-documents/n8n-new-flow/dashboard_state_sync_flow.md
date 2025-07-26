# 📊 Dashboard State Sync Flow: n8n Workflow System

## 🎯 Purpose
This flow keeps the web dashboard in sync with blog post workflow progress by:
- Monitoring updates to workflow state via webhook triggers
- Extracting key metadata from n8n workflow executions
- Writing current state to Supabase for real-time dashboard updates

This enables real-time visibility in your UI for multiple sites and blogs at different workflow stages.

---

## 🧱 Flow Structure: `Sync Dashboard State`

### 🔹 Trigger Options
1. **n8n Webhook Trigger**
   - Triggered when any workflow phase completes
   - Receives workflow execution data and state updates

2. **Scheduled Polling** *(fallback)*
   - Checks for recent workflow updates across all sites (e.g. every 5 mins)
   - Monitors workflow execution status

---

### 🔸 Action Nodes

3. **Parse Webhook Payload**
   - Extract workflow execution data:
     - `post_id`
     - `site_id`
     - `current_phase`
     - `next_workflow_phase`
     - `workflow_phases_completed`
     - `status`
     - `execution_logs`

4. **Fetch Workflow Metadata**
   - Get additional metadata from workflow execution:
     - `preview_url`
     - `final_url`
     - `title`
     - `metadata` (images, social posts, SEO data)
     - `last_updated`

5. **Update Supabase Row**
   - Match on `post_id` and `site_id`
   - If exists → update with new workflow state
   - If not → insert new row with initial state
   - Update `workflow_phases_completed` array

6. **Log Workflow Execution**
   - Insert/update record in `workflow_executions` table
   - Track execution time, status, and any errors
   - Link to workflow phase definition

7. **Trigger Dashboard Update**
   - Send webhook to dashboard for real-time updates
   - Optionally notify via email/Slack: "🟡 Blog `X` now in phase `Y`"
   - Trigger dashboard revalidation if needed

---

## 🔄 Real-Time Sync Patterns

### Webhook-Based Updates
```json
{
  "post_id": "blog-2025-01-15-example",
  "site_id": "brightgift",
  "current_phase": "CONTENT_GENERATION",
  "next_workflow_phase": "CONTENT_REVIEW",
  "status": "in_progress",
  "workflow_phases_completed": ["SEO_RESEARCH"],
  "metadata": {
    "title": "Example Blog Post",
    "seo_score": 85,
    "word_count": 1200
  }
}
```

### State Transition Tracking
- Track phase transitions with timestamps
- Monitor workflow efficiency and bottlenecks
- Alert on workflow failures or delays
- Calculate average phase completion times

---

## 📊 Multi-Site State Management

### Site-Specific Filtering
```sql
-- Get all blogs for a specific site
SELECT * FROM blog_workflow_state 
WHERE site_id = 'brightgift' 
ORDER BY last_updated DESC;
```

### Cross-Site Analytics
```sql
-- Get workflow performance across all sites
SELECT 
  site_id,
  current_phase,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (last_updated - created_at))/3600) as avg_hours
FROM blog_workflow_state 
GROUP BY site_id, current_phase;
```

### Workflow Execution History
```sql
-- Get detailed execution history for a post
SELECT 
  we.*,
  wp.phase_name,
  wp.description
FROM workflow_executions we
JOIN workflow_phases wp ON we.phase_id = wp.phase_id
WHERE we.post_id = 'blog-2025-01-15-example'
ORDER BY we.started_at ASC;
```

---

## 🎯 Dashboard Integration Points

### Real-Time Updates
```javascript
// Subscribe to workflow state changes
supabase
  .channel('workflow_updates')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'blog_workflow_state' }, 
    (payload) => {
      // Update dashboard UI with new state
      updateWorkflowStatus(payload.new);
    }
  )
  .subscribe();
```

### Workflow Status Display
- **Phase Badge**: Show current workflow phase with color coding
- **Progress Bar**: Visual representation of workflow completion
- **Time Tracking**: Show time spent in current phase
- **Next Phase**: Preview of upcoming workflow steps

### Error Handling
- **Failed Workflows**: Highlight and provide retry options
- **Stuck Workflows**: Alert on workflows that haven't progressed
- **Performance Issues**: Flag slow workflow phases

---

## 🔧 Configuration Options

### Webhook Security
- **Authentication**: Verify webhook signatures
- **Rate Limiting**: Prevent abuse and ensure stability
- **Payload Validation**: Ensure data integrity

### Sync Frequency
- **Real-Time**: Immediate updates via webhooks
- **Near Real-Time**: 30-second polling fallback
- **Batch Updates**: Periodic bulk synchronization

### Error Recovery
- **Retry Logic**: Automatic retry for failed syncs
- **Fallback Mechanisms**: Alternative data sources
- **Alerting**: Notify on sync failures

---

## 📈 Performance Monitoring

### Sync Metrics
- **Update Frequency**: How often state changes occur
- **Sync Latency**: Time from workflow update to dashboard update
- **Error Rate**: Percentage of failed sync attempts
- **Data Consistency**: Verify dashboard matches workflow state

### Workflow Performance
- **Phase Duration**: Average time per workflow phase
- **Success Rate**: Percentage of successful workflow completions
- **Bottleneck Identification**: Slowest workflow phases
- **Resource Utilization**: System resource usage during syncs

---

## ✅ Benefits
- Enables UI to show real-time status per blog and site
- Avoids polling from the frontend for better performance
- Supports filtering, sorting, and human decision-making
- Keeps Supabase as the single source of UI truth
- Provides comprehensive workflow execution tracking
- Enables multi-site workflow management
- Supports workflow performance optimization
- Facilitates error detection and recovery

---

## 🧩 Data Table Example (Supabase)

### blog_workflow_state
| post_id | site_id | title | current_phase | next_workflow_phase | status | preview_url | final_url | last_updated | workflow_phases_completed |
|---------|---------|-------|---------------|-------------------|--------|-------------|-----------|--------------|---------------------------|
| blog-2025-01-15-example | brightgift | Sleep Training Tips | CONTENT_REVIEW | IMAGE_GENERATION | in_progress | https://... | null | 2025-01-15T03:10Z | ["SEO_RESEARCH", "CONTENT_GENERATION"] |

### workflow_executions
| execution_id | post_id | phase_id | started_at | completed_at | status | error_message |
|--------------|---------|----------|------------|--------------|--------|---------------|
| uuid-123 | blog-2025-01-15-example | CONTENT_GENERATION | 2025-01-15T02:30Z | 2025-01-15T03:10Z | completed | null | 