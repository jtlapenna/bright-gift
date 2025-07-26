import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useBlogWorkflowPosts(options = {}) {
  const {
    siteId = null,
    status = null,
    phase = null,
    limit = 100,
    enableRealtime = true,
    autoRefresh = true,
    refreshInterval = 30000 // 30 seconds
  } = options

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastFetched, setLastFetched] = useState(null)

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('blog_workflow_state')
        .select(`
          *,
          sites(site_name, domain),
          workflow_executions(
            execution_id,
            phase_id,
            started_at,
            completed_at,
            status,
            error_message
          )
        `)
        .order('last_updated', { ascending: false })
        .limit(limit)

      // Apply filters
      if (siteId) {
        query = query.eq('site_id', siteId)
      }

      if (status) {
        query = query.eq('status', status)
      }

      if (phase) {
        query = query.eq('current_phase', phase)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      // Transform data to include computed fields
      const transformedPosts = (data || []).map(post => ({
        ...post,
        // Add computed fields
        workflow_progress: calculateWorkflowProgress(post),
        time_in_current_phase: calculateTimeInPhase(post),
        is_stuck: isWorkflowStuck(post),
        next_phase_info: getNextPhaseInfo(post),
        site_display_name: post.sites?.site_name || post.site_id,
        execution_summary: summarizeExecutions(post.workflow_executions)
      }))

      setPosts(transformedPosts)
      setLastFetched(new Date())
    } catch (err) {
      console.error('Error fetching blog workflow posts:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [siteId, status, phase, limit])

  // Calculate workflow progress percentage
  const calculateWorkflowProgress = (post) => {
    const phases = post.workflow_phases_completed || []
    const totalPhases = 7 // Total number of workflow phases
    return Math.round((phases.length / totalPhases) * 100)
  }

  // Calculate time spent in current phase
  const calculateTimeInPhase = (post) => {
    const lastExecution = post.workflow_executions?.find(exec => 
      exec.phase_id === post.current_phase
    )
    
    if (!lastExecution?.started_at) return null
    
    const startTime = new Date(lastExecution.started_at)
    const now = new Date()
    const diffMs = now - startTime
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    return { hours: diffHours, minutes: diffMinutes }
  }

  // Check if workflow is stuck (in same phase for too long)
  const isWorkflowStuck = (post) => {
    const timeInPhase = calculateTimeInPhase(post)
    if (!timeInPhase) return false
    
    // Consider stuck if in same phase for more than 2 hours
    return timeInPhase.hours >= 2
  }

  // Get information about next phase
  const getNextPhaseInfo = (post) => {
    const phaseOrder = [
      'SEO_RESEARCH',
      'CONTENT_GENERATION', 
      'CONTENT_REVIEW',
      'IMAGE_GENERATION',
      'PUBLISHING',
      'APPROVAL',
      'LIVE_DEPLOYMENT'
    ]
    
    const currentIndex = phaseOrder.indexOf(post.current_phase)
    const nextPhase = phaseOrder[currentIndex + 1]
    
    return nextPhase ? {
      phase: nextPhase,
      label: nextPhase.replace('_', ' ').toLowerCase(),
      is_last: currentIndex === phaseOrder.length - 1
    } : null
  }

  // Summarize workflow executions
  const summarizeExecutions = (executions) => {
    if (!executions || executions.length === 0) return null
    
    const total = executions.length
    const successful = executions.filter(exec => exec.status === 'completed').length
    const failed = executions.filter(exec => exec.status === 'failed').length
    const running = executions.filter(exec => exec.status === 'running').length
    
    return {
      total,
      successful,
      failed,
      running,
      success_rate: total > 0 ? Math.round((successful / total) * 100) : 0
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchPosts()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchPosts])

  // Real-time subscription
  useEffect(() => {
    if (!enableRealtime) return

    const channel = supabase
      .channel('blog_workflow_updates')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'blog_workflow_state' 
        },
        (payload) => {
          console.log('Real-time update received:', payload)
          
          // Update the specific post in the list
          setPosts(currentPosts => {
            const updatedPosts = [...currentPosts]
            const index = updatedPosts.findIndex(p => p.post_id === payload.new.post_id)
            
            if (index !== -1) {
              // Update existing post
              updatedPosts[index] = {
                ...updatedPosts[index],
                ...payload.new,
                workflow_progress: calculateWorkflowProgress(payload.new),
                time_in_current_phase: calculateTimeInPhase(payload.new),
                is_stuck: isWorkflowStuck(payload.new),
                next_phase_info: getNextPhaseInfo(payload.new)
              }
            } else if (payload.eventType === 'INSERT') {
              // Add new post
              const newPost = {
                ...payload.new,
                workflow_progress: calculateWorkflowProgress(payload.new),
                time_in_current_phase: calculateTimeInPhase(payload.new),
                is_stuck: isWorkflowStuck(payload.new),
                next_phase_info: getNextPhaseInfo(payload.new)
              }
              updatedPosts.unshift(newPost)
            }
            
            return updatedPosts
          })
        }
      )
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'workflow_executions' 
        },
        (payload) => {
          console.log('Workflow execution update received:', payload)
          // Refresh posts when execution status changes
          fetchPosts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enableRealtime, fetchPosts])

  // Utility functions for external use
  const refetch = useCallback(() => {
    fetchPosts()
  }, [fetchPosts])

  const getPostById = useCallback((postId) => {
    return posts.find(post => post.post_id === postId)
  }, [posts])

  const getPostsByStatus = useCallback((status) => {
    return posts.filter(post => post.status === status)
  }, [posts])

  const getPostsByPhase = useCallback((phase) => {
    return posts.filter(post => post.current_phase === phase)
  }, [posts])

  const getStuckWorkflows = useCallback(() => {
    return posts.filter(post => post.is_stuck)
  }, [posts])

  const getWorkflowStats = useCallback(() => {
    const stats = {
      total: posts.length,
      by_status: {},
      by_phase: {},
      by_site: {},
      stuck_count: 0,
      avg_progress: 0
    }

    posts.forEach(post => {
      // Count by status
      stats.by_status[post.status] = (stats.by_status[post.status] || 0) + 1
      
      // Count by phase
      stats.by_phase[post.current_phase] = (stats.by_phase[post.current_phase] || 0) + 1
      
      // Count by site
      stats.by_site[post.site_id] = (stats.by_site[post.site_id] || 0) + 1
      
      // Count stuck workflows
      if (post.is_stuck) stats.stuck_count++
    })

    // Calculate average progress
    if (posts.length > 0) {
      const totalProgress = posts.reduce((sum, post) => sum + post.workflow_progress, 0)
      stats.avg_progress = Math.round(totalProgress / posts.length)
    }

    return stats
  }, [posts])

  return {
    posts,
    loading,
    error,
    lastFetched,
    refetch,
    getPostById,
    getPostsByStatus,
    getPostsByPhase,
    getStuckWorkflows,
    getWorkflowStats
  }
} 