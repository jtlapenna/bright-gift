# 🧱 Supabase Schema: Multi-Site Content Workflow State

## 📋 Table: `blog_workflow_state`

This table tracks the live status and metadata of every blog post across multiple sites in the system for dashboard display, monitoring, and searchability.

### 🔑 Fields

| Field                    | Type      | Description                                                    |
| ------------------------ | --------- | -------------------------------------------------------------- |
| `post_id`                | text (PK) | Unique blog ID (e.g. `blog-2025-07-25-sleep-training`)         |
| `site_id`                | text      | Site identifier (e.g. `brightgift`, `smartbaby`, `cannabis`)   |
| `title`                  | text      | Blog post title                                                |
| `current_phase`          | text      | Current workflow phase (e.g. `SEO_COMPLETE`, `CONTENT_GENERATED`) |
| `next_workflow_phase`    | text      | Name of the next n8n workflow phase                            |
| `status`                 | text      | `in_progress`, `paused`, `complete`, `failed`                  |
| `preview_url`            | text      | URL to preview branch                                          |
| `final_url`              | text      | URL to live blog post                                          |
| `last_updated`           | timestamp | Timestamp of last update                                       |
| `workflow_phases_completed` | jsonb  | Array of completed workflow phases                             |
| `metadata`               | jsonb     | Optional metadata (keywords, SEO scores, performance data)     |
| `created_at`             | timestamp | Timestamp when workflow was initiated                          |
| `approved_by`            | text      | User who approved the content (if applicable)                 |
| `approved_at`            | timestamp | Timestamp when content was approved (if applicable)           |

---

## 🧾 SQL: Create Table

```sql
create table blog_workflow_state (
  post_id text primary key,
  site_id text not null,
  title text,
  current_phase text,
  next_workflow_phase text,
  status text default 'in_progress',
  preview_url text,
  final_url text,
  last_updated timestamp with time zone default now(),
  workflow_phases_completed jsonb default '[]',
  metadata jsonb default '{}',
  created_at timestamp with time zone default now(),
  approved_by text,
  approved_at timestamp with time zone
);

-- Create index for site-based queries
create index idx_blog_workflow_state_site_id on blog_workflow_state(site_id);

-- Create index for status-based queries
create index idx_blog_workflow_state_status on blog_workflow_state(status);

-- Create index for phase-based queries
create index idx_blog_workflow_state_current_phase on blog_workflow_state(current_phase);
```

---

## 📊 Additional Tables for Multi-Site Management

### Table: `sites`

```sql
create table sites (
  site_id text primary key,
  site_name text not null,
  domain text,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_active boolean default true
);
```

### Table: `workflow_phases`

```sql
create table workflow_phases (
  phase_id text primary key,
  phase_name text not null,
  description text,
  estimated_duration_minutes integer,
  is_required boolean default true,
  created_at timestamp with time zone default now()
);

-- Insert default workflow phases
insert into workflow_phases (phase_id, phase_name, description, estimated_duration_minutes) values
('SEO_RESEARCH', 'SEO Research', 'Keyword research and topic analysis', 30),
('CONTENT_GENERATION', 'Content Generation', 'Blog content creation', 45),
('CONTENT_REVIEW', 'Content Review', 'Content optimization and quality check', 20),
('IMAGE_GENERATION', 'Image Generation', 'Create and optimize images', 25),
('PUBLISHING', 'Publishing', 'Deploy to preview and prepare for approval', 15),
('APPROVAL', 'Approval', 'Awaiting human approval', null),
('LIVE_DEPLOYMENT', 'Live Deployment', 'Deploy to production', 10);
```

### Table: `workflow_executions`

```sql
create table workflow_executions (
  execution_id uuid primary key default gen_random_uuid(),
  post_id text references blog_workflow_state(post_id),
  phase_id text references workflow_phases(phase_id),
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  status text default 'running',
  error_message text,
  execution_logs jsonb default '{}'
);
```

---

## 🛠️ How You'll Build in Supabase

### ✅ What Supabase Provides:

- PostgreSQL database (via a friendly GUI + SQL editor)
- REST & Realtime APIs (auto-generated for your tables)
- Row-level security (RLS) for controlling access
- Authentication (if needed later)
- Dashboard with usage monitoring and table editor

### 🪜 Setup Steps:

1. **Create project** at [supabase.com](https://supabase.com)
2. **Go to SQL editor** → paste all the `CREATE TABLE` SQL statements
3. **Enable Realtime** for the `blog_workflow_state` table under `Settings → Realtime`
4. **Add Row-Level Security (optional)** if users will access data directly
5. **Create service role or anon key** to use in your dashboard or n8n workflows
6. **Build dashboard queries** using Supabase client libraries (or fetch from n8n)

### 🧠 Optional Enhancements

- Add triggers to auto-update `last_updated` and `updated_at` fields
- Use Supabase Functions to create event hooks for workflow state changes
- Add RLS policies for multi-tenant access control
- Create views for common dashboard queries

---

## 📈 Example Queries

### Get all posts for a specific site:
```sql
select * from blog_workflow_state 
where site_id = 'brightgift' 
order by last_updated desc;
```

### Get posts by status:
```sql
select * from blog_workflow_state 
where status = 'in_progress' 
order by created_at desc;
```

### Get workflow execution history:
```sql
select 
  we.execution_id,
  we.post_id,
  wp.phase_name,
  we.started_at,
  we.completed_at,
  we.status
from workflow_executions we
join workflow_phases wp on we.phase_id = wp.phase_id
where we.post_id = 'blog-2025-07-25-sleep-training'
order by we.started_at;
```

### Get site statistics:
```sql
select 
  site_id,
  count(*) as total_posts,
  count(*) filter (where status = 'complete') as published_posts,
  count(*) filter (where status = 'in_progress') as in_progress_posts
from blog_workflow_state
group by site_id;
```

---

## 🔄 Workflow Phase Values

The `current_phase` field uses these standardized values:

- `SEO_RESEARCH` - SEO research and keyword analysis
- `CONTENT_GENERATION` - Blog content creation
- `CONTENT_REVIEW` - Content optimization and quality check
- `IMAGE_GENERATION` - Image creation and optimization
- `PUBLISHING` - Preview deployment and preparation
- `APPROVAL` - Awaiting human approval
- `LIVE_DEPLOYMENT` - Production deployment
- `COMPLETE` - Workflow finished successfully
- `FAILED` - Workflow failed at some point

---

This schema provides a robust foundation for tracking multi-site content workflows with detailed execution history and performance metrics. 