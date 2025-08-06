const express = require('express');
const { body, validationResult, query } = require('express-validator');
const axios = require('axios');
const { supabase, TABLES, WORKFLOW_STATUS, WORKFLOW_PHASES } = require('../config/supabase');
const { checkSiteAccess } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/v1/sites/{siteId}/workflows
 * Get all workflows for a site
 */
router.get('/', checkSiteAccess, [
  query('status').optional().isIn(Object.values(WORKFLOW_STATUS)),
  query('type').optional().isIn(['seo', 'content', 'publish', 'social']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const { siteId } = req.params;
    const { 
      status, 
      type, 
      page = 1, 
      limit = 20 
    } = req.query;

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: errors.array()
        }
      });
    }

    // Build query
    let query = supabase
      .from(TABLES.WORKFLOW_EXECUTIONS)
      .select('*')
      .eq('site_id', siteId);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (type) {
      query = query.eq('workflow_type', type);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: workflows, error } = await query;

    if (error) {
      console.error('Error fetching workflows:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch workflows'
        }
      });
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from(TABLES.WORKFLOW_EXECUTIONS)
      .select('*', { count: 'exact', head: true })
      .eq('site_id', siteId)
      .modify(q => {
        if (status) q.eq('status', status);
        if (type) q.eq('workflow_type', type);
        return q;
      });

    res.json({
      workflows: workflows.map(wf => ({
        id: wf.id,
        name: wf.name,
        type: wf.workflow_type,
        status: wf.status,
        siteId: wf.site_id,
        postId: wf.post_id,
        startedAt: wf.started_at,
        completedAt: wf.completed_at,
        progress: wf.progress || 0,
        estimatedCompletion: wf.estimated_completion,
        config: wf.config || {},
        results: wf.results || {},
        logs: wf.logs || []
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in workflows route:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch workflows'
      }
    });
  }
});

/**
 * GET /api/v1/sites/{siteId}/workflows/{workflowId}
 * Get single workflow details
 */
router.get('/:workflowId', checkSiteAccess, async (req, res) => {
  try {
    const { siteId, workflowId } = req.params;

    // Get workflow data
    const { data: workflow, error } = await supabase
      .from(TABLES.WORKFLOW_EXECUTIONS)
      .select('*')
      .eq('id', workflowId)
      .eq('site_id', siteId)
      .single();

    if (error || !workflow) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Workflow not found'
        }
      });
    }

    // Get related post data if workflow is for a specific post
    let postData = null;
    if (workflow.post_id) {
      const { data: post } = await supabase
        .from(TABLES.BLOG_WORKFLOW_STATE)
        .select('title, status, current_phase')
        .eq('post_id', workflow.post_id)
        .single();
      
      if (post) {
        postData = {
          title: post.title,
          status: post.status,
          currentPhase: post.current_phase
        };
      }
    }

    res.json({
      id: workflow.id,
      name: workflow.name,
      type: workflow.workflow_type,
      status: workflow.status,
      siteId: workflow.site_id,
      postId: workflow.post_id,
      post: postData,
      startedAt: workflow.started_at,
      completedAt: workflow.completed_at,
      progress: workflow.progress || 0,
      estimatedCompletion: workflow.estimated_completion,
      config: workflow.config || {},
      results: workflow.results || {},
      logs: workflow.logs || [],
      metadata: workflow.metadata || {}
    });
  } catch (error) {
    console.error('Error fetching workflow details:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch workflow details'
      }
    });
  }
});

/**
 * POST /api/v1/sites/{siteId}/workflows
 * Start new workflow
 */
router.post('/', checkSiteAccess, [
  body('type').isIn(['seo', 'content', 'publish', 'social']),
  body('name').isLength({ min: 1, max: 200 }),
  body('config').isObject(),
  body('postId').optional().isString()
], async (req, res) => {
  try {
    const { siteId } = req.params;
    const { type, name, config, postId } = req.body;

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }

    // Create workflow execution record
    const workflowId = `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data: workflow, error } = await supabase
      .from(TABLES.WORKFLOW_EXECUTIONS)
      .insert({
        id: workflowId,
        name,
        workflow_type: type,
        status: WORKFLOW_STATUS.PENDING,
        site_id: siteId,
        post_id: postId,
        config,
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating workflow:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create workflow'
        }
      });
    }

    // Trigger n8n workflow based on type
    try {
      const n8nPayload = {
        workflowId,
        siteId,
        postId,
        type,
        config,
        triggerTime: new Date().toISOString()
      };

      // Send to n8n webhook
      const n8nResponse = await axios.post(
        process.env.N8N_WEBHOOK_URL,
        n8nPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.N8N_API_KEY
          },
          timeout: 10000
        }
      );

      // Update workflow status to running
      await supabase
        .from(TABLES.WORKFLOW_EXECUTIONS)
        .update({
          status: WORKFLOW_STATUS.RUNNING,
          metadata: {
            n8n_response: n8nResponse.data,
            triggered_at: new Date().toISOString()
          }
        })
        .eq('id', workflowId);

    } catch (n8nError) {
      console.error('Error triggering n8n workflow:', n8nError);
      
      // Update workflow status to failed
      await supabase
        .from(TABLES.WORKFLOW_EXECUTIONS)
        .update({
          status: WORKFLOW_STATUS.FAILED,
          metadata: {
            error: n8nError.message,
            failed_at: new Date().toISOString()
          }
        })
        .eq('id', workflowId);
    }

    res.status(201).json({
      message: 'Workflow started successfully',
      workflow: {
        id: workflow.id,
        name: workflow.name,
        type: workflow.workflow_type,
        status: workflow.status,
        startedAt: workflow.started_at
      }
    });
  } catch (error) {
    console.error('Error starting workflow:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to start workflow'
      }
    });
  }
});

/**
 * POST /api/v1/sites/{siteId}/workflows/{workflowId}/cancel
 * Cancel running workflow
 */
router.post('/:workflowId/cancel', checkSiteAccess, async (req, res) => {
  try {
    const { siteId, workflowId } = req.params;

    // Get workflow
    const { data: workflow, error: fetchError } = await supabase
      .from(TABLES.WORKFLOW_EXECUTIONS)
      .select('*')
      .eq('id', workflowId)
      .eq('site_id', siteId)
      .single();

    if (fetchError || !workflow) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Workflow not found'
        }
      });
    }

    if (workflow.status !== WORKFLOW_STATUS.RUNNING && workflow.status !== WORKFLOW_STATUS.PENDING) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Only running or pending workflows can be cancelled'
        }
      });
    }

    // Cancel in n8n (if supported)
    try {
      if (process.env.N8N_API_URL) {
        await axios.post(
          `${process.env.N8N_API_URL}/workflows/${workflowId}/cancel`,
          {},
          {
            headers: {
              'X-API-Key': process.env.N8N_API_KEY
            }
          }
        );
      }
    } catch (n8nError) {
      console.error('Error cancelling workflow in n8n:', n8nError);
      // Continue with local cancellation even if n8n fails
    }

    // Update workflow status
    const { data: updatedWorkflow, error } = await supabase
      .from(TABLES.WORKFLOW_EXECUTIONS)
      .update({
        status: WORKFLOW_STATUS.CANCELLED,
        completed_at: new Date().toISOString(),
        metadata: {
          ...workflow.metadata,
          cancelled_at: new Date().toISOString(),
          cancelled_by: req.user.id
        }
      })
      .eq('id', workflowId)
      .eq('site_id', siteId)
      .select()
      .single();

    if (error) {
      console.error('Error cancelling workflow:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to cancel workflow'
        }
      });
    }

    res.json({
      message: 'Workflow cancelled successfully',
      workflow: {
        id: updatedWorkflow.id,
        name: updatedWorkflow.name,
        status: updatedWorkflow.status,
        completedAt: updatedWorkflow.completed_at
      }
    });
  } catch (error) {
    console.error('Error cancelling workflow:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to cancel workflow'
      }
    });
  }
});

/**
 * POST /api/v1/sites/{siteId}/workflows/{workflowId}/retry
 * Retry failed workflow
 */
router.post('/:workflowId/retry', checkSiteAccess, async (req, res) => {
  try {
    const { siteId, workflowId } = req.params;

    // Get workflow
    const { data: workflow, error: fetchError } = await supabase
      .from(TABLES.WORKFLOW_EXECUTIONS)
      .select('*')
      .eq('id', workflowId)
      .eq('site_id', siteId)
      .single();

    if (fetchError || !workflow) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Workflow not found'
        }
      });
    }

    if (workflow.status !== WORKFLOW_STATUS.FAILED) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Only failed workflows can be retried'
        }
      });
    }

    // Create new workflow execution with same config
    const newWorkflowId = `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data: newWorkflow, error } = await supabase
      .from(TABLES.WORKFLOW_EXECUTIONS)
      .insert({
        id: newWorkflowId,
        name: `${workflow.name} (Retry)`,
        workflow_type: workflow.workflow_type,
        status: WORKFLOW_STATUS.PENDING,
        site_id: siteId,
        post_id: workflow.post_id,
        config: workflow.config,
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        metadata: {
          ...workflow.metadata,
          retry_of: workflowId,
          retry_count: (workflow.metadata?.retry_count || 0) + 1
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating retry workflow:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create retry workflow'
        }
      });
    }

    // Trigger n8n workflow
    try {
      const n8nPayload = {
        workflowId: newWorkflowId,
        siteId,
        postId: workflow.post_id,
        type: workflow.workflow_type,
        config: workflow.config,
        triggerTime: new Date().toISOString(),
        isRetry: true
      };

      await axios.post(
        process.env.N8N_WEBHOOK_URL,
        n8nPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.N8N_API_KEY
          }
        }
      );

      // Update status to running
      await supabase
        .from(TABLES.WORKFLOW_EXECUTIONS)
        .update({
          status: WORKFLOW_STATUS.RUNNING
        })
        .eq('id', newWorkflowId);

    } catch (n8nError) {
      console.error('Error triggering retry workflow:', n8nError);
      
      await supabase
        .from(TABLES.WORKFLOW_EXECUTIONS)
        .update({
          status: WORKFLOW_STATUS.FAILED,
          metadata: {
            ...newWorkflow.metadata,
            error: n8nError.message
          }
        })
        .eq('id', newWorkflowId);
    }

    res.status(201).json({
      message: 'Workflow retry started successfully',
      workflow: {
        id: newWorkflow.id,
        name: newWorkflow.name,
        type: newWorkflow.workflow_type,
        status: newWorkflow.status,
        retryOf: workflowId
      }
    });
  } catch (error) {
    console.error('Error retrying workflow:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retry workflow'
      }
    });
  }
});

/**
 * GET /api/v1/sites/{siteId}/workflows/{workflowId}/logs
 * Get workflow execution logs
 */
router.get('/:workflowId/logs', checkSiteAccess, async (req, res) => {
  try {
    const { siteId, workflowId } = req.params;

    // Get workflow logs
    const { data: logs, error } = await supabase
      .from('workflow_logs')
      .select('*')
      .eq('workflow_id', workflowId)
      .eq('site_id', siteId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching workflow logs:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch workflow logs'
        }
      });
    }

    res.json({
      workflowId,
      logs: logs.map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        level: log.level,
        message: log.message,
        metadata: log.metadata || {}
      }))
    });
  } catch (error) {
    console.error('Error fetching workflow logs:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch workflow logs'
      }
    });
  }
});

module.exports = router; 