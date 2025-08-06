# 🪽 Frontend Dashboard Integration Plan: n8n Workflow System

## 📃 Overview

This plan explains how to integrate the Supabase-powered state management system with your frontend dashboard (e.g., built with React/Vite and deployed on Cloudflare Pages). It includes post workflow status, images, social content, links, and metadata for live preview and publishing control.

---

## 🔄 Data Source

All data is stored in the `blog_workflow_state` table in Supabase, maintained by n8n workflows. Each row represents a blog post session with workflow execution tracking.

---

## 📒 Dashboard Features & Data Mapping

| UI Feature                | Supabase Field(s)                         |         |
| ------------------------- | ----------------------------------------- | ------- |
|                           | **Blog title**                            | `title` |
| **Status badge**          | `current_phase`, `status`                 |         |
| **Preview URL**           | `preview_url`                             |         |
| **Final URL**             | `final_url`                               |         |
| **Workflow phases log**   | `workflow_phases_completed`               |         |
| **Last updated time**     | `last_updated`                            |         |
| **Hero/OG/social images** | `metadata.images.hero`, `.og`, `.social`  |         |
| **Social captions/posts** | `metadata.social_posts`                   |         |
| **Keywords/SEO info**     | `metadata.keywords`, `metadata.seo_score` |         |
| **Site identifier**       | `site_id`                                 |         |
| **Approval info**         | `approved_by`, `approved_at`              |         |

---

## ⚙️ Integration Plan (React/Vite)

### 1. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 2. Configure Client

```ts
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)
```

### 3. Fetch Blog Data

```ts
const { data, error } = await supabase
  .from('blog_workflow_state')
  .select('*')
  .order('last_updated', { ascending: false })
```

### 4. Render Components

Use tables, cards, or dashboards to display:

- Blog name & phase badge
- Live preview/final links
- Latest images (metadata.images)
- Social post preview (metadata.social_posts)
- Time since last update
- Site-specific filtering

### 5. Realtime Sync (Optional)

```ts
supabase
  .channel('blog_updates')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'blog_workflow_state' }, payload => {
    // Update UI with new state
  })
  .subscribe()
```

### 6. Secure Access (Optional)

- For public access: no RLS needed
- For private team access: enable Supabase Auth + Row-Level Security (RLS)

---

## 🔧 Multi-Site Dashboard Features

### Site Selection
```ts
// Filter by site
const { data, error } = await supabase
  .from('blog_workflow_state')
  .select('*')
  .eq('site_id', 'brightgift')
  .order('last_updated', { ascending: false })
```

### Cross-Site Analytics
```ts
// Get statistics across all sites
const { data, error } = await supabase
  .from('blog_workflow_state')
  .select('site_id, status, count')
  .group('site_id, status')
```

### Site-Specific Workflows
- Different workflow configurations per site
- Site-specific approval workflows
- Custom branding and styling per site

---

## 🎯 Workflow Integration

### Workflow Execution Tracking
```ts
// Get detailed workflow execution history
const { data, error } = await supabase
  .from('workflow_executions')
  .select(`
    *,
    workflow_phases(phase_name, description)
  `)
  .eq('post_id', 'blog-2025-01-15-example')
  .order('started_at', { ascending: true })
```

### Workflow Phase Status
- Real-time phase progression tracking
- Phase completion time monitoring
- Error handling and retry status
- Workflow efficiency metrics

---

## 📊 Dashboard Components

### Main Dashboard
- **Global Overview**: All sites at a glance
- **Site-Specific Views**: Individual site dashboards
- **Workflow Status**: Current phase and progress
- **Performance Metrics**: SEO scores, traffic, engagement

### Workflow Management
- **Initiation Terminal**: Start new workflows via webhook
- **Approval Interface**: Review and approve content
- **Error Handling**: View and resolve workflow issues
- **Workflow History**: Complete execution logs

### Content Preview
- **Blog Preview**: Live preview of generated content
- **Image Gallery**: Generated images and assets
- **Social Posts**: Preview social media content
- **SEO Analysis**: Keyword performance and scores

---

## 🔐 Security & Access Control

### Row-Level Security (RLS)
```sql
-- Example RLS policy for site-specific access
CREATE POLICY "Users can view their site's blogs" ON blog_workflow_state
  FOR SELECT USING (site_id IN (
    SELECT site_id FROM user_sites WHERE user_id = auth.uid()
  ));
```

### Webhook Authentication
- Secure webhook endpoints for workflow triggers
- Payload validation and verification
- Rate limiting and abuse prevention

### User Authentication
- Supabase Auth integration
- Role-based access control
- Site-specific permissions

---

## 📈 Analytics & Reporting

### Workflow Performance
- Execution time per phase
- Success/failure rates
- Error analysis and recovery
- Resource utilization

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

## ✅ Benefits

- Live visibility into blog content and workflow pipeline
- All data driven from a single source (Supabase)
- Integrates tightly with n8n workflows and webhook triggers
- Reusable layout for multiple brand dashboards
- Supports preview vs. publish decision flows
- Multi-site management and analytics
- Real-time workflow status updates
- Comprehensive error handling and monitoring

---

## 🚀 Implementation Steps

### Phase 1: Basic Integration
1. Set up Supabase client and environment
2. Create basic data fetching and display
3. Implement real-time updates
4. Add basic filtering and sorting

### Phase 2: Multi-Site Support
1. Add site selection and filtering
2. Implement site-specific configurations
3. Add cross-site analytics
4. Create site-specific dashboards

### Phase 3: Advanced Features
1. Add workflow execution tracking
2. Implement approval workflows
3. Add error handling and recovery
4. Create comprehensive analytics

---

Let me know when you're ready to scaffold components or pages in code. 