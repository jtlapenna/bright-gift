import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useBlogWorkflowPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    siteId: null,
    status: null,
    phase: null,
    limit: 50
  })

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('blog_workflow_state')
        .select(`
          post_id,
          site_id,
          title,
          current_phase,
          next_workflow_phase,
          status,
          preview_url,
          final_url,
          last_updated,
          workflow_phases_completed,
          metadata,
          created_at,
          approved_by,
          approved_at
        `)
        .order('last_updated', { ascending: false })
        .limit(filters.limit)

      // Apply filters
      if (filters.siteId) {
        query = query.eq('site_id', filters.siteId)
      }

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.phase) {
        query = query.eq('current_phase', filters.phase)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      // Transform and enrich the data
      const enrichedPosts = (data || []).map(post => ({
        ...post,
        // Add computed properties
        is_pending_approval: post.status === 'pending',
        is_completed: post.status === 'completed',
        is_failed: post.status === 'failed',
        is_in_progress: post.status === 'in_progress',
        has_preview: !!post.preview_url,
        has_final_url: !!post.final_url,
        workflow_progress: calculateProgress(post),
        time_since_update: calculateTimeSinceUpdate(post.last_updated),
        phase_display_name: formatPhaseName(post.current_phase),
        next_phase_display_name: formatPhaseName(post.next_workflow_phase)
      }))

      setPosts(enrichedPosts)
    } catch (err) {
      console.error('Error fetching blog workflow posts:', err)
      setError(err.message)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Calculate workflow progress based on completed phases
  const calculateProgress = (post) => {
    const completedPhases = post.workflow_phases_completed || []
    const totalPhases = 7 // Total workflow phases
    return Math.round((completedPhases.length / totalPhases) * 100)
  }

  // Calculate time since last update
  const calculateTimeSinceUpdate = (lastUpdated) => {
    if (!lastUpdated) return null
    
    const updateTime = new Date(lastUpdated)
    const now = new Date()
    const diffMs = now - updateTime
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    }
  }

  // Format phase names for display
  const formatPhaseName = (phase) => {
    if (!phase) return ''
    return phase.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  // Initial fetch
  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Real-time subscription for updates
  useEffect(() => {
    const channel = supabase
      .channel('blog_workflow_posts_updates')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'blog_workflow_state' 
        },
        (payload) => {
          console.log('Workflow post update received:', payload)
          
          // Update posts list in real-time
          setPosts(currentPosts => {
            const updatedPosts = [...currentPosts]
            const index = updatedPosts.findIndex(p => p.post_id === payload.new.post_id)
            
            if (index !== -1) {
              // Update existing post
              const updatedPost = {
                ...updatedPosts[index],
                ...payload.new,
                is_pending_approval: payload.new.status === 'pending',
                is_completed: payload.new.status === 'completed',
                is_failed: payload.new.status === 'failed',
                is_in_progress: payload.new.status === 'in_progress',
                has_preview: !!payload.new.preview_url,
                has_final_url: !!payload.new.final_url,
                workflow_progress: calculateProgress(payload.new),
                time_since_update: calculateTimeSinceUpdate(payload.new.last_updated),
                phase_display_name: formatPhaseName(payload.new.current_phase),
                next_phase_display_name: formatPhaseName(payload.new.next_workflow_phase)
              }
              updatedPosts[index] = updatedPost
            } else if (payload.eventType === 'INSERT') {
              // Add new post
              const newPost = {
                ...payload.new,
                is_pending_approval: payload.new.status === 'pending',
                is_completed: payload.new.status === 'completed',
                is_failed: payload.new.status === 'failed',
                is_in_progress: payload.new.status === 'in_progress',
                has_preview: !!payload.new.preview_url,
                has_final_url: !!payload.new.final_url,
                workflow_progress: calculateProgress(payload.new),
                time_since_update: calculateTimeSinceUpdate(payload.new.last_updated),
                phase_display_name: formatPhaseName(payload.new.current_phase),
                next_phase_display_name: formatPhaseName(payload.new.next_workflow_phase)
              }
              updatedPosts.unshift(newPost)
            }
            
            return updatedPosts
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Filter management functions
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      siteId: null,
      status: null,
      phase: null,
      limit: 50
    })
  }, [])

  // Utility functions for filtering posts
  const getPostsByStatus = useCallback((status) => {
    return posts.filter(post => post.status === status)
  }, [posts])

  const getPostsByPhase = useCallback((phase) => {
    return posts.filter(post => post.current_phase === phase)
  }, [posts])

  const getPostsBySite = useCallback((siteId) => {
    return posts.filter(post => post.site_id === siteId)
  }, [posts])

  const getPendingApprovalPosts = useCallback(() => {
    return posts.filter(post => post.is_pending_approval)
  }, [posts])

  const getFailedPosts = useCallback(() => {
    return posts.filter(post => post.is_failed)
  }, [posts])

  const getCompletedPosts = useCallback(() => {
    return posts.filter(post => post.is_completed)
  }, [posts])

  const getInProgressPosts = useCallback(() => {
    return posts.filter(post => post.is_in_progress)
  }, [posts])

  // Statistics functions
  const getStats = useCallback(() => {
    const stats = {
      total: posts.length,
      pending: getPendingApprovalPosts().length,
      failed: getFailedPosts().length,
      completed: getCompletedPosts().length,
      in_progress: getInProgressPosts().length,
      by_phase: {},
      by_site: {},
      avg_progress: 0
    }

    // Calculate phase and site distributions
    posts.forEach(post => {
      stats.by_phase[post.current_phase] = (stats.by_phase[post.current_phase] || 0) + 1
      stats.by_site[post.site_id] = (stats.by_site[post.site_id] || 0) + 1
    })

    // Calculate average progress
    if (posts.length > 0) {
      const totalProgress = posts.reduce((sum, post) => sum + post.workflow_progress, 0)
      stats.avg_progress = Math.round(totalProgress / posts.length)
    }

    return stats
  }, [posts, getPendingApprovalPosts, getFailedPosts, getCompletedPosts, getInProgressPosts])

  // Workflow action functions
  const approvePost = useCallback(async (postId) => {
    try {
      const { error } = await supabase
        .from('blog_workflow_state')
        .update({
          status: 'approved',
          approved_by: 'current_user', // TODO: Get actual user ID
          approved_at: new Date().toISOString()
        })
        .eq('post_id', postId)

      if (error) throw error
      
      // Refresh posts after approval
      fetchPosts()
      
      return { success: true }
    } catch (err) {
      console.error('Error approving post:', err)
      return { success: false, error: err.message }
    }
  }, [fetchPosts])

  const rejectPost = useCallback(async (postId, reason = '') => {
    try {
      const { error } = await supabase
        .from('blog_workflow_state')
        .update({
          status: 'rejected',
          metadata: {
            rejection_reason: reason,
            rejected_at: new Date().toISOString()
          }
        })
        .eq('post_id', postId)

      if (error) throw error
      
      // Refresh posts after rejection
      fetchPosts()
      
      return { success: true }
    } catch (err) {
      console.error('Error rejecting post:', err)
      return { success: false, error: err.message }
    }
  }, [fetchPosts])

  const retryFailedPost = useCallback(async (postId) => {
    try {
      const { error } = await supabase
        .from('blog_workflow_state')
        .update({
          status: 'in_progress',
          current_phase: 'SEO_RESEARCH', // Reset to first phase
          next_workflow_phase: 'CONTENT_GENERATION'
        })
        .eq('post_id', postId)

      if (error) throw error
      
      // Refresh posts after retry
      fetchPosts()
      
      return { success: true }
    } catch (err) {
      console.error('Error retrying post:', err)
      return { success: false, error: err.message }
    }
  }, [fetchPosts])

  return {
    // Data
    posts,
    loading,
    error,
    
    // Filters
    filters,
    updateFilters,
    clearFilters,
    
    // Filtered data
    getPostsByStatus,
    getPostsByPhase,
    getPostsBySite,
    getPendingApprovalPosts,
    getFailedPosts,
    getCompletedPosts,
    getInProgressPosts,
    
    // Statistics
    getStats,
    
    // Actions
    approvePost,
    rejectPost,
    retryFailedPost,
    
    // Refresh
    refetch: fetchPosts
  }
} 