# 📊 Analytics Schema Plan: n8n Workflow System

This document outlines the foundational analytics we will use to track content performance, workflow efficiency, and user engagement across the multi-site platform.

---

## 🎯 Goals
- Measure content effectiveness (SEO + engagement) across all sites
- Evaluate workflow efficiency and performance across phases
- Monitor user interaction with dashboard tools and approval workflows
- Optimize content strategy and workflow performance based on actual outcomes
- Track multi-site performance and cross-site analytics

---

## 📈 Metrics to Track

### 🔍 SEO + Content Metrics
- Page views per blog post (per site)
- Unique visitors and geographic distribution
- Time on page and scroll depth
- Bounce rate and exit pages
- Keyword rankings (via external SEO API or search console import)
- Indexed status and crawl frequency
- Internal clickthroughs to other posts
- Organic search traffic and CTR

### 🔗 Affiliate Performance
- Clicks on affiliate links (per blog post, per product, per site)
- Outbound link destinations and conversion tracking
- Estimated earnings or conversions per product (via affiliate platform API)
- Conversion proxy (click + high dwell time or return visits)
- Affiliate link performance by site and content type

### ⚙️ Workflow Efficiency Metrics
- Workflow runtime per phase (SEO_RESEARCH, CONTENT_GENERATION, etc.)
- Number of retries or errors per workflow phase
- Time between workflow trigger and completion
- Workflow completion state (success/failure/partial)
- Phase transition efficiency and bottlenecks
- Resource utilization during workflow execution

### 👥 User Interaction Metrics
- User actions on dashboard (clicks, approvals, rejections, edits)
- Number of blogs initiated vs completed per user
- Number of approvals and rejections per user
- Number of edits requested and types of changes
- Dashboard usage patterns and feature adoption
- User workflow preferences and optimization patterns

### 📱 Social Post Metrics
- Social posts generated per platform and site
- Clickthroughs from social posts (if tracked)
- Social engagement rates and reach
- Cross-platform performance comparison
- Social content performance by content type

### 🌐 Multi-Site Performance
- Performance comparison across all sites
- Site-specific workflow efficiency
- Cross-site content performance patterns
- Site-specific user engagement metrics
- Resource allocation and optimization per site

---

## 🧱 Schema Draft

### **Table: `blog_analytics`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | primary key |
| post_id | text | FK to blog_workflow_state |
| site_id | text | FK to sites table |
| page_views | int | daily/weekly total |
| unique_visitors | int | daily/weekly total |
| time_on_page | float | seconds |
| bounce_rate | float | % |
| scroll_depth | float | % of page scrolled |
| keyword_rankings | json | keyword:rank pairs |
| indexed | boolean | search engine indexed |
| internal_clicks | int | clicks to other posts |
| affiliate_clicks | int | total clicks on affiliate links |
| affiliate_earnings | float | optional/nullable if tracked |
| organic_traffic | int | search engine traffic |
| social_traffic | int | traffic from social media |
| created_at | timestamp | when record created |
| updated_at | timestamp | when metrics last updated |

### **Table: `workflow_execution_analytics`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | primary key |
| execution_id | uuid | FK to workflow_executions |
| post_id | text | FK to blog_workflow_state |
| site_id | text | FK to sites table |
| phase_id | text | FK to workflow_phases |
| started_at | timestamp | workflow phase start |
| completed_at | timestamp | workflow phase completion |
| duration_seconds | int | calculated duration |
| status | text | success, failed, retry, partial |
| retries | int | number of retry attempts |
| error_message | text | optional error details |
| resource_usage | json | CPU, memory, API calls |
| performance_score | float | 0-100 efficiency score |

### **Table: `user_actions`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | primary key |
| post_id | text | FK to blog_workflow_state |
| site_id | text | FK to sites table |
| user_id | uuid | FK to user table |
| action | text | approve, reject, edit, push_live, initiate |
| action_details | json | additional action metadata |
| timestamp | timestamp | when action occurred |
| session_id | text | user session identifier |

### **Table: `site_performance_analytics`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | primary key |
| site_id | text | FK to sites table |
| date | date | analytics date |
| total_posts | int | total posts on site |
| total_page_views | int | aggregate page views |
| avg_time_on_page | float | average time across all posts |
| avg_bounce_rate | float | average bounce rate |
| total_affiliate_clicks | int | total affiliate clicks |
| total_affiliate_earnings | float | total affiliate earnings |
| workflow_success_rate | float | % of successful workflows |
| avg_workflow_duration | float | average workflow completion time |
| user_engagement_score | float | calculated engagement metric |

### **Table: `content_performance_insights`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | primary key |
| post_id | text | FK to blog_workflow_state |
| site_id | text | FK to sites table |
| content_type | text | blog, social, email, etc. |
| topic_category | text | gift guides, how-to, etc. |
| performance_score | float | 0-100 overall performance |
| seo_score | float | 0-100 SEO performance |
| engagement_score | float | 0-100 user engagement |
| conversion_score | float | 0-100 conversion performance |
| social_performance | json | social platform metrics |
| keyword_performance | json | keyword ranking changes |
| created_at | timestamp | when insight created |
| updated_at | timestamp | when insight last updated |

---

## 📊 Analytics Views

### **Workflow Performance Dashboard**
```sql
-- Workflow efficiency by phase and site
CREATE VIEW workflow_performance_summary AS
SELECT 
  wp.phase_name,
  s.site_name,
  COUNT(*) as total_executions,
  AVG(wea.duration_seconds) as avg_duration,
  AVG(wea.performance_score) as avg_performance,
  COUNT(CASE WHEN wea.status = 'success' THEN 1 END) as successful,
  COUNT(CASE WHEN wea.status = 'failed' THEN 1 END) as failed
FROM workflow_execution_analytics wea
JOIN workflow_phases wp ON wea.phase_id = wp.phase_id
JOIN sites s ON wea.site_id = s.site_id
GROUP BY wp.phase_name, s.site_name;
```

### **Content Performance Summary**
```sql
-- Content performance across all sites
CREATE VIEW content_performance_summary AS
SELECT 
  s.site_name,
  COUNT(ba.post_id) as total_posts,
  AVG(ba.page_views) as avg_page_views,
  AVG(ba.time_on_page) as avg_time_on_page,
  AVG(ba.bounce_rate) as avg_bounce_rate,
  SUM(ba.affiliate_clicks) as total_affiliate_clicks,
  SUM(ba.affiliate_earnings) as total_affiliate_earnings
FROM blog_analytics ba
JOIN sites s ON ba.site_id = s.site_id
GROUP BY s.site_name;
```

### **User Engagement Analytics**
```sql
-- User action patterns and engagement
CREATE VIEW user_engagement_summary AS
SELECT 
  ua.user_id,
  s.site_name,
  COUNT(*) as total_actions,
  COUNT(CASE WHEN ua.action = 'approve' THEN 1 END) as approvals,
  COUNT(CASE WHEN ua.action = 'reject' THEN 1 END) as rejections,
  COUNT(CASE WHEN ua.action = 'edit' THEN 1 END) as edits,
  AVG(EXTRACT(EPOCH FROM (ua.timestamp - LAG(ua.timestamp) OVER (PARTITION BY ua.user_id ORDER BY ua.timestamp))/3600)) as avg_hours_between_actions
FROM user_actions ua
JOIN sites s ON ua.site_id = s.site_id
GROUP BY ua.user_id, s.site_name;
```

---

## 🔧 Analytics Integration

### **Real-Time Metrics Collection**
- Webhook-based analytics updates from workflow completions
- Real-time dashboard updates via Supabase subscriptions
- Automated performance scoring and insights generation

### **External Analytics Integration**
- Google Analytics 4 integration for detailed visitor metrics
- Google Search Console for SEO performance
- Affiliate platform APIs for conversion tracking
- Social media APIs for engagement metrics

### **Performance Optimization**
- Automated workflow optimization based on performance data
- Content strategy recommendations based on performance patterns
- Resource allocation optimization across sites
- A/B testing framework for workflow improvements

---

## 📈 Reporting & Insights

### **Daily Reports**
- Workflow completion rates and performance
- Content performance across all sites
- User engagement and approval patterns
- Error rates and resolution times

### **Weekly Analysis**
- Cross-site performance comparison
- Workflow efficiency trends
- Content performance insights
- User behavior patterns

### **Monthly Optimization**
- Workflow optimization recommendations
- Content strategy adjustments
- Resource allocation optimization
- Performance improvement opportunities

---

## 📌 Implementation Notes
- Use Supabase real-time subscriptions for live dashboard updates
- Implement automated performance scoring algorithms
- Set up alerting for workflow failures and performance issues
- Create automated reporting and insight generation
- Integrate with external analytics platforms for comprehensive tracking
- Implement data retention policies for analytics data
- Set up data export capabilities for external analysis

---

Would you like to scaffold the database creation SQL based on this enhanced schema? 