const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with fallbacks for missing env vars
const supabaseUrl = process.env.SUPABASE_URL || 'https://pdbgsvtmznaduhcopphq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-key';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'mock-anon-key';

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create Supabase client with anon key for user operations
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

// Database table names (matching our schema)
const TABLES = {
  SITES: 'sites',
  BLOG_WORKFLOW_STATE: 'blog_workflow_state',
  WORKFLOW_EXECUTIONS: 'workflow_executions',
  WORKFLOW_PHASES: 'workflow_phases',
  SITE_PERFORMANCE_ANALYTICS: 'site_performance_analytics',
  CONTENT_PERFORMANCE_INSIGHTS: 'content_performance_insights',
  WORKFLOW_EXECUTION_ANALYTICS: 'workflow_execution_analytics'
};

// Workflow phases (matching our schema)
const WORKFLOW_PHASES = {
  SEO_RESEARCH: 'seo_research',
  CONTENT_GENERATION: 'content_generation',
  CONTENT_REVIEW: 'content_review',
  IMAGE_GENERATION: 'image_generation',
  PUBLISHING: 'publishing',
  APPROVAL: 'approval',
  LIVE_DEPLOYMENT: 'live_deployment'
};

// Post statuses
const POST_STATUS = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PUBLISHED: 'published',
  FAILED: 'failed'
};

// Workflow statuses
const WORKFLOW_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

module.exports = {
  supabase,
  supabaseAnon,
  TABLES,
  WORKFLOW_PHASES,
  POST_STATUS,
  WORKFLOW_STATUS
}; 