# API Implementation Priority Guide for Multi-Site Dashboard

## Overview
This guide prioritizes the API endpoints from `API_ENDPOINTS_SPECIFICATION.md` for implementation, organized by development phases. It aligns with our n8n workflow system and Supabase integration.

## Phase 1: Core Foundation (Week 1-2)
**Priority: CRITICAL - Must implement first**

### 1.1 Authentication & Site Management
```
POST /auth/login
GET /auth/me
GET /sites/{siteId}
GET /sites (list all sites for user)
```

### 1.2 Basic Blog Post Management
```
GET /sites/{siteId}/posts
GET /sites/{siteId}/posts/{postId}
POST /sites/{siteId}/posts
PUT /sites/{siteId}/posts/{postId}
DELETE /sites/{siteId}/posts/{postId}
```

### 1.3 Workflow Status Integration
```
GET /sites/{siteId}/workflows
GET /sites/{siteId}/workflows/{workflowId}
POST /sites/{siteId}/workflows (start new workflow)
```

### 1.4 Webhook Endpoints (for n8n integration)
```
POST /webhooks/workflow-status
POST /webhooks/post-status
```

**Implementation Notes:**
- Connect to Supabase using our schema from `supabase_schema_and_sql.md`
- Integrate with existing n8n workflows: `BrightGift_SEO_Idea_Workflow.json` and `BrightGift_Blog_and_Image_Generator_Workflow.json`
- Use JWT authentication with Supabase Auth

---

## Phase 2: Workflow Control & Approval (Week 3-4)
**Priority: HIGH - Core functionality**

### 2.1 Workflow Control
```
POST /sites/{siteId}/workflows/{workflowId}/cancel
POST /sites/{siteId}/workflows/{workflowId}/retry
GET /sites/{siteId}/workflows/{workflowId}/logs
```

### 2.2 Post Approval System
```
POST /sites/{siteId}/posts/{postId}/publish
POST /sites/{siteId}/posts/{postId}/unpublish
POST /sites/{siteId}/posts/{postId}/approve
POST /sites/{siteId}/posts/{postId}/reject
```

### 2.3 Real-time Updates
```
WebSocket: wss://api.multisitehub.com/v1/ws/sites/{siteId}
Events: workflow_update, post_update
```

**Implementation Notes:**
- Implement approval workflow that triggers GitHub merge to main branch
- Add real-time notifications for workflow status changes
- Connect to n8n webhook triggers for status updates

---

## Phase 3: Analytics & Monitoring (Week 5-6)
**Priority: MEDIUM - Enhanced features**

### 3.1 Basic Analytics
```
GET /sites/{siteId}/analytics
GET /sites/{siteId}/posts/{postId}/analytics
```

### 3.2 Health Scoring
```
GET /sites/{siteId}/health
```

### 3.3 Activity Feed
```
GET /sites/{siteId}/activity
```

**Implementation Notes:**
- Start with basic metrics (post count, workflow status)
- Integrate with Google Analytics API for traffic data
- Implement health scoring algorithm from our planning docs

---

## Phase 4: Advanced Features (Week 7-8)
**Priority: LOW - Nice to have**

### 4.1 Advanced Analytics
```
GET /sites/{siteId}/workflows/analytics
```

### 4.2 Site Management
```
PUT /sites/{siteId} (update site settings)
```

### 4.3 Additional Webhooks
```
POST /webhooks/site-health
```

---

## Implementation Checklist

### Database Setup (Required First)
- [ ] Create Supabase project
- [ ] Run schema from `supabase_schema_and_sql.md`
- [ ] Set up authentication
- [ ] Configure environment variables

### n8n Integration (Required First)
- [ ] Import existing workflow JSON files
- [ ] Configure webhook triggers
- [ ] Set up Supabase nodes in workflows
- [ ] Test workflow execution

### API Development Order
1. **Authentication endpoints** (login, user info)
2. **Site listing** (get user's sites)
3. **Basic CRUD** (posts, workflows)
4. **Webhook receivers** (for n8n status updates)
5. **Workflow control** (start, cancel, retry)
6. **Approval system** (publish, reject)
7. **Real-time updates** (WebSocket)
8. **Analytics** (basic metrics first)

---

## Technical Requirements

### Backend Framework
- **Recommended**: Node.js with Express or Fastify
- **Alternative**: Python with FastAPI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with JWT

### Integration Points
- **n8n Workflows**: Webhook triggers and status updates
- **GitHub**: Branch management and content publishing
- **Supabase**: Real-time subscriptions and data storage
- **Cloudflare Pages**: Frontend hosting and serverless functions

### Environment Variables Needed
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
N8N_WEBHOOK_URL=your_n8n_webhook_url
GITHUB_TOKEN=your_github_token
JWT_SECRET=your_jwt_secret
```

---

## Success Criteria

### Phase 1 Complete When:
- [ ] User can log in and see their sites
- [ ] User can view and manage blog posts
- [ ] n8n workflows can update status via webhooks
- [ ] Basic workflow control works

### Phase 2 Complete When:
- [ ] User can approve/reject posts
- [ ] Approved posts publish to live site
- [ ] Real-time updates work via WebSocket
- [ ] Workflow logs are accessible

### Phase 3 Complete When:
- [ ] Basic analytics are displayed
- [ ] Health scores are calculated
- [ ] Activity feed shows recent actions
- [ ] Dashboard provides actionable insights

---

## Files to Reference
- `supabase_schema_and_sql.md` - Database structure
- `n8n_workflow_system.md` - Workflow architecture
- `control-hub-feature-specification.md` - UI requirements
- `BrightGift_SEO_Idea_Workflow.json` - SEO workflow
- `BrightGift_Blog_and_Image_Generator_Workflow.json` - Content workflow

---

## Next Steps for Implementation Agent
1. **Review this priority guide** and the full API specification
2. **Set up Supabase** database using our schema
3. **Start with Phase 1 endpoints** (authentication, basic CRUD)
4. **Integrate n8n workflows** via webhooks
5. **Build incrementally** following the phases
6. **Test each phase** before moving to the next

This guide ensures the API is built in the right order to support our multi-site content automation system. 