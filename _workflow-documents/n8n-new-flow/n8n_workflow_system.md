# 📘 n8n Workflow System Overview

## 🔹 Summary

This system automates the end-to-end creation, optimization, and publishing of SEO-optimized blog posts using specialized n8n workflows. A web-based control dashboard allows human-in-the-loop oversight (optionally only at the beginning and end), while n8n orchestrates workflow execution, state syncing, and dashboard updates. The system is modular, version-controlled, and designed for scalability across multiple sites.

---

## 🧱 Tech Stack

| Layer                 | Tool | Purpose |
| --------------------- | ---- | ------- |
| AI Logic & Automation | **n8n Workflows** | Executes modular content tasks (SEO, writing, reviewing, etc.), triggers next workflows via webhooks |
| State Mgmt (Live UI)   | **Supabase** | Tracks real-time progress and UI display |
| Version Control        | **GitHub** | Stores source content, commits trigger state for n8n monitoring |
| Workflow Orchestration | **n8n** | Manages workflow execution, webhook triggers, updates dashboard state, notifications |
| Deployment & Preview   | **Cloudflare Pages** | Auto-deploys preview branches on blog update |
| Control Dashboard      | **React/Vite** | Interface for workflow control and review |

---

## ✨ Key Features

- ✅ Modular **n8n Workflows** for each workflow phase
- ✅ Web dashboard to initiate, approve, and monitor progress
- ✅ GitHub-based version control and state signaling
- ✅ Cloudflare-powered blog previews
- ✅ Webhook-triggered workflow chaining
- ✅ n8n for workflow orchestration and notification logic
- ✅ n8n workflows handle all work and trigger next phase directly
- ✅ Future-proof architecture for n8n's evolving features (scheduling, APIs)

---

## 🔄 Workflow Steps

1. **Start**\
   User clicks "Start" in the dashboard — or n8n triggers SEO Workflow via webhook.

2. **SEO Workflow**\
   Gathers keyword data, recommends blog topics → commits `seo-results.json`, updates Supabase with `phase: SEO_COMPLETE`. Triggers next workflow via webhook.

3. **Content Generation Workflow**\
   Generates blog draft → commits `blog-draft.md`, updates state → triggers Review Workflow.

4. **Review Workflow**\
   Optimizes for SEO, links, formatting → commits `blog-final.md`, `social-posts.md` → triggers Image Generation Workflow.

5. **Image Generation Workflow**\
   Generates prompts, fetches + processes images → updates image references → commits assets → triggers Publishing Workflow.

6. **Publishing Workflow**\
   Pushes blog to preview branch → optionally merges to main → finalizes state.

7. **n8n Watches Final Phase**\
   Detects completed state → updates Supabase/dashboard → notifies user via email.

---

## 📂 Workflow Handoff via Webhooks

Each n8n workflow:

- Performs its specialized task
- Commits outputs + updates Supabase state
- Sends a webhook to start the next n8n workflow

n8n manages the **first webhook trigger** and **final dashboard update**.

---

## 📊 Dashboard UI Features

- **Live Phase Display** (from Supabase)
- **Action Buttons**: Start, Approve, Push to Main (only if needed)
- **Preview & Live Links**: Auto-fetched from Cloudflare Pages
- **Workflow Logs**: Per-run metadata and result summaries
- **Realtime status updates via Supabase**

---

## 🧽 Architecture Diagram (Simplified)

```
[User Dashboard] ⇄ [Supabase] ⇄ [GitHub Repo]
      ↓                    ↑           ↓
   [n8n Flow] → [Webhook] → [n8n Workflow] → [Next Workflow via Webhook]
                                                ↓
                                  [Cloudflare Preview / Main]
```

---

## 🔧 Workflow Configuration

### SEO Workflow
- **Trigger**: Webhook from dashboard or manual
- **Tasks**: Keyword research, topic analysis, SEO scoring
- **Output**: SEO recommendations, topic suggestions
- **Next**: Triggers Content Generation Workflow

### Content Generation Workflow
- **Trigger**: Webhook from SEO Workflow
- **Tasks**: Blog content creation, initial formatting
- **Output**: Blog draft with frontmatter
- **Next**: Triggers Review Workflow

### Review Workflow
- **Trigger**: Webhook from Content Generation Workflow
- **Tasks**: Content optimization, SEO enhancement, link insertion
- **Output**: Finalized blog content, social media posts
- **Next**: Triggers Image Generation Workflow

### Image Generation Workflow
- **Trigger**: Webhook from Review Workflow
- **Tasks**: Image prompt generation, image creation, optimization
- **Output**: Banner and OG images, optimized for web
- **Next**: Triggers Publishing Workflow

### Publishing Workflow
- **Trigger**: Webhook from Image Generation Workflow
- **Tasks**: Preview deployment, approval workflow, live publishing
- **Output**: Preview URL, final live URL
- **Next**: Updates Supabase with completion status

---

## 📈 State Management

### Supabase Schema
- **`blog_workflow_state`**: Tracks current workflow status
- **`workflow_executions`**: Detailed execution history
- **`workflow_phases`**: Standardized phase definitions
- **`sites`**: Multi-site configuration

### Real-time Updates
- Dashboard subscribes to Supabase changes
- Workflow status updates trigger UI refresh
- Error states are immediately visible
- Progress indicators show current phase

---

## 🔐 Security & Access Control

### Webhook Security
- Authenticated webhook endpoints
- Payload validation and verification
- Rate limiting and abuse prevention
- Secure API key management

### Multi-site Isolation
- Site-specific workflow configurations
- Row-level security in Supabase
- Isolated workflow execution per site
- Cross-site analytics aggregation

---

## 🚀 Scalability Features

### Multi-site Support
- Site-specific workflow templates
- Centralized dashboard for all sites
- Cross-site performance comparison
- Site-specific customization options

### Workflow Templates
- Configurable workflow phases
- Custom approval workflows
- Site-specific automation rules
- Reusable workflow components

### Performance Optimization
- Database indexes for common queries
- Efficient state management
- Optimized workflow execution
- Caching for frequently accessed data

---

## 📊 Monitoring & Analytics

### Workflow Performance
- Execution time tracking
- Success/failure rates
- Error analysis and reporting
- Performance optimization insights

### Content Performance
- SEO score tracking
- Traffic and engagement metrics
- Social media performance
- ROI analysis

### System Health
- Workflow uptime monitoring
- Database performance metrics
- API response times
- Error rate tracking

---

## 🔄 Error Handling & Recovery

### Automatic Retry
- Failed workflow step retry logic
- Exponential backoff for retries
- Maximum retry attempt limits
- Manual intervention triggers

### Error Notifications
- Real-time error alerts
- Detailed error reporting
- Escalation procedures
- Recovery recommendations

### State Recovery
- Workflow state backup
- Rollback capabilities
- Data consistency checks
- Recovery procedures

---

## ✅ Next Steps

- • **Sketch the file structure and workflow state format?**
- • **Help draft the first n8n workflow to trigger via webhook?**
- • **Create a dashboard state display model?**
- • **Draft a GitHub Action or webhook listener?**
- • **Set up Supabase real-time subscriptions?**
- • **Configure multi-site workflow templates?**

---

This n8n workflow system provides a robust, scalable foundation for automated content creation across multiple websites with real-time monitoring and human oversight capabilities. 