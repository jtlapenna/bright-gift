# BrightGift n8n Workflow Integration Implementation Plan

## Project Overview

**Goal**: Create a unified web dashboard that integrates n8n automation workflows with the approval hub for end-to-end blog content creation and publishing.

**Vision**: User clicks "Start Automation" → n8n does SEO research → User selects topic → n8n generates blog + images → Preview → Approve/Reject → Publish

---

## Current Architecture

### 1. Approval Hub (React + Cloudflare Functions)
- **Frontend**: React dashboard for post review/approval
- **Backend**: Express API + Cloudflare Functions
- **Data Storage**: Local JSON files (FileHelpers.js)
- **Current Functionality**: 
  - List pending posts (mock data)
  - View post details (mock data)
  - Approve/reject posts (mock, no real GitHub integration)
  - No n8n integration
  - No Supabase integration

### 2. n8n Workflows (Standalone)
- **BrightGift_SEO_Idea_Workflow.json**: 
  - Webhook trigger: `seo-keyword-discovery-trigger`
  - Fetches existing blog content
  - Generates SEO research and blog topic suggestions
  - Returns suggested topics (not integrated with UI)
- **BrightGift_Blog_and_Image_Generator_Workflow.json**:
  - Schedule trigger (not webhook)
  - Generates blog content and images
  - Creates preview branch
  - Deploys to Cloudflare Pages
  - No user selection integration

### 3. Data Flow (Current)
```
n8n Workflows (Manual/Standalone)
    ↓
GitHub Repository (Preview Branch)
    ↓
Approval Hub (Mock Data)
    ↓
Manual Review/Approval
```

---

## New Architecture

### 1. Integrated Web Dashboard
- **Frontend**: React dashboard with automation controls
- **Backend**: Express API + Cloudflare Functions + Supabase
- **Data Storage**: Supabase tables (posts, approvals, workflow_status)
- **New Functionality**:
  - "Start Automation" button
  - Real-time workflow status updates
  - Topic selection interface
  - Preview links and SEO scores
  - Real GitHub integration

### 2. n8n Workflows (Integrated)
- **SEO Workflow**: Triggered by webhook, returns results to dashboard
- **Blog Generation Workflow**: Triggered by topic selection, updates status
- **Status Webhooks**: Real-time updates to dashboard

### 3. Data Flow (New)
```
User Dashboard
    ↓ (Start Automation)
n8n SEO Workflow
    ↓ (Return Topics)
Dashboard (Topic Selection)
    ↓ (Select Topic)
n8n Blog Generation Workflow
    ↓ (Status Updates)
Dashboard (Preview/Approve)
    ↓ (Approve)
GitHub (Merge to Main)
    ↓
Live Site
```

---

## Required Changes/Updates

### 1. Approval Hub Frontend
- **Add Components**:
  - `AutomationControl.jsx`: Start automation button, status display
  - `TopicSelector.jsx`: Display and select from n8n SEO results
  - `WorkflowStatus.jsx`: Real-time status updates
  - `PreviewDisplay.jsx`: Show preview links, images, SEO scores
- **Update Existing Components**:
  - `App.jsx`: Add automation flow state management
  - `PostList.jsx`: Show real posts from Supabase
  - `PostDetail.jsx`: Show real preview data

### 2. Approval Hub Backend
- **Add Supabase Integration**:
  - Install `@supabase/supabase-js`
  - Create database tables
  - Replace FileHelpers with SupabaseClient
- **Add n8n Integration**:
  - Webhook endpoints for n8n to call
  - HTTP requests to trigger n8n workflows
  - Status polling/updating
- **Add Real GitHub Integration**:
  - GitHub API for PR creation/merging
  - Preview branch management

### 3. n8n Workflows
- **Update SEO Workflow**:
  - Add webhook response with topic suggestions
  - Add status update webhooks
- **Update Blog Generation Workflow**:
  - Change from schedule to webhook trigger
  - Add status update webhooks
  - Add topic input parameter

### 4. Database Schema (Supabase)
```sql
-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workflow status table
CREATE TABLE workflow_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_type TEXT NOT NULL,
  status TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Approvals table
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id),
  action TEXT NOT NULL,
  user_info JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Implementation Steps

### Phase 1: Foundation (Week 1)
1. **Set up Supabase**
   - Create Supabase project
   - Create database tables
   - Add environment variables

2. **Update Approval Hub Backend**
   - Install Supabase dependencies
   - Create SupabaseClient utility
   - Update API endpoints to use Supabase
   - Test data persistence

3. **Update Approval Hub Frontend**
   - Install Supabase client
   - Update components to use real data
   - Test CRUD operations

### Phase 2: n8n Integration (Week 2)
1. **Update n8n SEO Workflow**
   - Add webhook response node
   - Add status update webhooks
   - Test webhook triggers

2. **Update n8n Blog Generation Workflow**
   - Change to webhook trigger
   - Add topic input parameter
   - Add status update webhooks
   - Test workflow chain

3. **Add n8n Integration to Backend**
   - Create webhook endpoints
   - Add n8n API client
   - Test workflow triggering

### Phase 3: Dashboard Integration (Week 3)
1. **Add Automation Controls**
   - Create AutomationControl component
   - Add "Start Automation" button
   - Add workflow status display

2. **Add Topic Selection**
   - Create TopicSelector component
   - Display n8n SEO results
   - Add topic selection logic

3. **Add Preview Display**
   - Create PreviewDisplay component
   - Show preview links and images
   - Display SEO scores

### Phase 4: GitHub Integration (Week 4)
1. **Add Real GitHub Integration**
   - GitHub API for PR creation
   - Preview branch management
   - Merge to main functionality

2. **Update Approve/Reject Logic**
   - Real PR creation on approve
   - Real branch cleanup on reject
   - Status updates to Supabase

3. **Testing and Refinement**
   - End-to-end testing
   - Error handling
   - Performance optimization

---

## Technical Requirements

### Dependencies to Add
```json
{
  "@supabase/supabase-js": "^2.x.x",
  "@octokit/rest": "^19.x.x",
  "node-fetch": "^3.x.x"
}
```

### Environment Variables
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
N8N_WEBHOOK_URL=your_n8n_webhook_url
GITHUB_TOKEN=your_github_token
```

### API Endpoints to Create
- `POST /api/automation/start` - Start SEO workflow
- `POST /api/automation/select-topic` - Select topic and start blog generation
- `GET /api/automation/status` - Get workflow status
- `POST /api/webhooks/n8n-status` - Receive n8n status updates
- `POST /api/posts/:id/approve` - Real GitHub PR creation
- `POST /api/posts/:id/reject` - Real branch cleanup

---

## Success Criteria

1. **User can start automation from dashboard**
2. **User can see and select from SEO suggestions**
3. **User can see real-time workflow status**
4. **User can preview generated content**
5. **User can approve/reject with real GitHub integration**
6. **All data persists in Supabase**
7. **Workflow is fully automated end-to-end**

---

## Risk Mitigation

1. **n8n Webhook Reliability**: Add retry logic and status polling
2. **GitHub API Rate Limits**: Implement rate limiting and caching
3. **Supabase Connection Issues**: Add connection pooling and fallbacks
4. **Workflow Failures**: Add error handling and user notifications
5. **Data Consistency**: Use transactions and validation

---

## Next Steps

1. **Review and approve this plan**
2. **Set up Supabase project and tables**
3. **Begin Phase 1 implementation**
4. **Test each phase before proceeding**
5. **Document any deviations or discoveries** 