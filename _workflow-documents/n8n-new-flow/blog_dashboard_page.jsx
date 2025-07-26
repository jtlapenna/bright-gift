import React, { useState, useEffect } from 'react'
import { BlogStatusTable } from './blog_status_table_component'
import { useBlogWorkflowPosts } from '../hooks/use_blog_workflow_posts_hook'
import { useSites } from '../hooks/use_sites_hook'

export default function BlogDashboardPage() {
  const { posts, loading, error, refetch } = useBlogWorkflowPosts()
  const { sites, loading: sitesLoading } = useSites()
  const [selectedSite, setSelectedSite] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 30000)
    return () => clearInterval(interval)
  }, [refetch])

  const getWorkflowStats = () => {
    const filteredPosts = selectedSite 
      ? posts.filter(post => post.site_id === selectedSite)
      : posts

    return {
      total: filteredPosts.length,
      inProgress: filteredPosts.filter(p => p.status === 'in_progress').length,
      pending: filteredPosts.filter(p => p.status === 'pending').length,
      completed: filteredPosts.filter(p => p.status === 'completed').length,
      failed: filteredPosts.filter(p => p.status === 'failed').length,
      approved: filteredPosts.filter(p => p.status === 'approved').length
    }
  }

  const getWorkflowPhaseStats = () => {
    const filteredPosts = selectedSite 
      ? posts.filter(post => post.site_id === selectedSite)
      : posts

    const phaseCounts = {}
    filteredPosts.forEach(post => {
      const phase = post.current_phase
      phaseCounts[phase] = (phaseCounts[phase] || 0) + 1
    })

    return phaseCounts
  }

  const stats = getWorkflowStats()
  const phaseStats = getWorkflowPhaseStats()

  const handleSiteChange = (siteId) => {
    setSelectedSite(siteId)
  }

  const handleWorkflowAction = async (action, postId) => {
    try {
      // TODO: Implement workflow actions
      console.log(`${action} workflow for post:`, postId)
      
      // Refresh data after action
      await refetch()
    } catch (error) {
      console.error('Error performing workflow action:', error)
    }
  }

  if (loading || sitesLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Dashboard</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <button 
            onClick={refetch}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Multi-Site Workflow Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage content workflows across all your sites</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={refetch}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => window.open('/workflow/initiate', '_blank')}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Start Workflow
          </button>
        </div>
      </div>

      {/* Site Filter */}
      {sites && sites.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by Site:</label>
            <select
              value={selectedSite || ''}
              onChange={(e) => handleSiteChange(e.target.value || null)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sites</option>
              {sites.map(site => (
                <option key={site.site_id} value={site.site_id}>
                  {site.site_name}
                </option>
              ))}
            </select>
            {selectedSite && (
              <button
                onClick={() => handleSiteChange(null)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'workflows', label: 'Workflows', icon: '⚙️' },
            { id: 'analytics', label: 'Analytics', icon: '📈' },
            { id: 'holding', label: 'Holding Areas', icon: '📋' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white rounded-lg border p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Posts</div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-2xl font-bold text-emerald-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
          </div>

          {/* Workflow Phase Distribution */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Workflow Phase Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(phaseStats).map(([phase, count]) => (
                <div key={phase} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">
                    {phase.replace('_', ' ').toLowerCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'workflows' && (
        <div className="space-y-6">
          <BlogStatusTable 
            posts={posts} 
            sites={sites}
            selectedSite={selectedSite}
            onSiteChange={handleSiteChange}
          />
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Analytics</h3>
            <p className="text-gray-600">Analytics dashboard coming soon...</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Workflow Success Rate</div>
                <div className="text-2xl font-bold text-green-600">94%</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Avg. Completion Time</div>
                <div className="text-2xl font-bold text-blue-600">2.3h</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Content Quality Score</div>
                <div className="text-2xl font-bold text-purple-600">8.7/10</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'holding' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pending Approval */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 text-yellow-600">Pending Approval</h3>
              <div className="space-y-3">
                {posts.filter(p => p.status === 'pending').slice(0, 5).map(post => (
                  <div key={post.post_id} className="border-l-4 border-yellow-400 pl-3">
                    <div className="font-medium text-sm">{post.title}</div>
                    <div className="text-xs text-gray-500">{post.site_id}</div>
                    <div className="flex space-x-2 mt-2">
                      <button className="text-green-600 hover:text-green-800 text-xs">Approve</button>
                      <button className="text-red-600 hover:text-red-800 text-xs">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Failed Workflows */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 text-red-600">Failed Workflows</h3>
              <div className="space-y-3">
                {posts.filter(p => p.status === 'failed').slice(0, 5).map(post => (
                  <div key={post.post_id} className="border-l-4 border-red-400 pl-3">
                    <div className="font-medium text-sm">{post.title}</div>
                    <div className="text-xs text-gray-500">{post.site_id}</div>
                    <div className="flex space-x-2 mt-2">
                      <button className="text-blue-600 hover:text-blue-800 text-xs">Retry</button>
                      <button className="text-gray-600 hover:text-gray-800 text-xs">View Error</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ready for Publishing */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 text-green-600">Ready for Publishing</h3>
              <div className="space-y-3">
                {posts.filter(p => p.status === 'approved').slice(0, 5).map(post => (
                  <div key={post.post_id} className="border-l-4 border-green-400 pl-3">
                    <div className="font-medium text-sm">{post.title}</div>
                    <div className="text-xs text-gray-500">{post.site_id}</div>
                    <div className="flex space-x-2 mt-2">
                      <button className="text-green-600 hover:text-green-800 text-xs">Publish</button>
                      <button className="text-gray-600 hover:text-gray-800 text-xs">Preview</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 