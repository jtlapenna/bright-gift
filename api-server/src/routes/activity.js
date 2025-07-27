const express = require('express');
const { query, validationResult } = require('express-validator');
const { supabase, TABLES } = require('../config/supabase');
const { checkSiteAccess } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/v1/sites/{siteId}/activity
 * Get activity feed for a site
 */
router.get('/', checkSiteAccess, [
  query('type').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const { siteId } = req.params;
    const { 
      type, 
      page = 1, 
      limit = 20, 
      startDate, 
      endDate 
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
      .from('user_actions')
      .select(`
        *,
        users:user_id(id, name, email, avatar)
      `)
      .eq('site_id', siteId)
      .order('timestamp', { ascending: false });

    // Apply filters
    if (type) {
      query = query.eq('action', type);
    }

    if (startDate) {
      query = query.gte('timestamp', startDate);
    }

    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: activities, error, count } = await query;

    if (error) {
      console.error('Error fetching activities:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch activities'
        }
      });
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('user_actions')
      .select('*', { count: 'exact', head: true })
      .eq('site_id', siteId);

    if (type) {
      countQuery = countQuery.eq('action', type);
    }

    if (startDate) {
      countQuery = countQuery.gte('timestamp', startDate);
    }

    if (endDate) {
      countQuery = countQuery.lte('timestamp', endDate);
    }

    const { count: totalCount } = await countQuery;

    // Transform activities to include user info and formatted messages
    const transformedActivities = activities.map(activity => {
      const user = activity.users || {};
      const message = generateActivityMessage(activity);
      
      return {
        id: activity.id,
        type: activity.action,
        message,
        timestamp: activity.timestamp,
        siteId: activity.site_id,
        userId: activity.user_id,
        user: {
          name: user.name || 'Unknown User',
          avatar: user.avatar || null
        },
        metadata: activity.action_details || {},
        postId: activity.post_id
      };
    });

    res.json({
      activities: transformedActivities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in activity route:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch activities'
      }
    });
  }
});

/**
 * POST /api/v1/sites/{siteId}/activity
 * Log a new activity (internal use by other endpoints)
 */
router.post('/', checkSiteAccess, async (req, res) => {
  try {
    const { siteId } = req.params;
    const { action, postId, actionDetails, userId } = req.body;

    if (!action || !userId) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Action and userId are required'
        }
      });
    }

    const { data: activity, error } = await supabase
      .from('user_actions')
      .insert({
        site_id: siteId,
        user_id: userId,
        action,
        post_id: postId,
        action_details: actionDetails || {},
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating activity:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to log activity'
        }
      });
    }

    // Send WebSocket notification
    const wss = req.app.get('wss');
    if (wss) {
      wss.clients.forEach(client => {
        if (client.siteId === siteId) {
          client.send(JSON.stringify({
            type: 'activity_update',
            data: {
              id: activity.id,
              type: activity.action,
              message: generateActivityMessage(activity),
              timestamp: activity.timestamp,
              userId: activity.user_id,
              postId: activity.post_id
            }
          }));
        }
      });
    }

    res.status(201).json({
      message: 'Activity logged successfully',
      activity: {
        id: activity.id,
        type: activity.action,
        timestamp: activity.timestamp
      }
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to log activity'
      }
    });
  }
});

/**
 * GET /api/v1/sites/{siteId}/activity/stats
 * Get activity statistics
 */
router.get('/stats', checkSiteAccess, async (req, res) => {
  try {
    const { siteId } = req.params;

    // Get activity counts by type for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentActivities, error } = await supabase
      .from('user_actions')
      .select('action, timestamp')
      .eq('site_id', siteId)
      .gte('timestamp', thirtyDaysAgo.toISOString());

    if (error) {
      console.error('Error fetching activity stats:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch activity statistics'
        }
      });
    }

    // Calculate statistics
    const actionCounts = recentActivities.reduce((acc, activity) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1;
      return acc;
    }, {});

    // Get daily activity for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: dailyActivities } = await supabase
      .from('user_actions')
      .select('timestamp')
      .eq('site_id', siteId)
      .gte('timestamp', sevenDaysAgo.toISOString());

    const dailyStats = {};
    if (dailyActivities) {
      dailyActivities.forEach(activity => {
        const date = activity.timestamp.split('T')[0];
        dailyStats[date] = (dailyStats[date] || 0) + 1;
      });
    }

    // Get most active users
    const { data: userStats } = await supabase
      .from('user_actions')
      .select('user_id, users:user_id(name)')
      .eq('site_id', siteId)
      .gte('timestamp', thirtyDaysAgo.toISOString());

    const userActivityCounts = {};
    if (userStats) {
      userStats.forEach(activity => {
        const userId = activity.user_id;
        const userName = activity.users?.name || 'Unknown User';
        if (!userActivityCounts[userId]) {
          userActivityCounts[userId] = { name: userName, count: 0 };
        }
        userActivityCounts[userId].count++;
      });
    }

    const topUsers = Object.entries(userActivityCounts)
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      totalActivities: recentActivities.length,
      actionBreakdown: actionCounts,
      dailyActivity: dailyStats,
      topUsers,
      period: {
        start: thirtyDaysAgo.toISOString(),
        end: new Date().toISOString(),
        days: 30
      }
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch activity statistics'
      }
    });
  }
});

// Helper function to generate activity messages
function generateActivityMessage(activity) {
  const actionMessages = {
    'post_created': 'Created a new blog post',
    'post_updated': 'Updated a blog post',
    'post_published': 'Published a blog post',
    'post_approved': 'Approved a blog post',
    'post_rejected': 'Rejected a blog post',
    'workflow_started': 'Started a new workflow',
    'workflow_completed': 'Completed a workflow',
    'workflow_failed': 'Workflow failed',
    'workflow_cancelled': 'Cancelled a workflow',
    'seo_research_completed': 'Completed SEO research',
    'content_generated': 'Generated new content',
    'images_created': 'Created images for content',
    'site_settings_updated': 'Updated site settings',
    'user_invited': 'Invited a new user',
    'analytics_exported': 'Exported analytics data'
  };

  const baseMessage = actionMessages[activity.action] || `Performed action: ${activity.action}`;
  
  // Add post title if available
  if (activity.post_id && activity.action_details?.post_title) {
    return `${baseMessage}: "${activity.action_details.post_title}"`;
  }

  return baseMessage;
}

module.exports = router; 