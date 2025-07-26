import React, { useState } from 'react'

// Workflow phase configuration with colors and descriptions
const WORKFLOW_PHASES = {
  SEO_RESEARCH: { color: 'bg-blue-100 text-blue-800', label: 'SEO Research' },
  CONTENT_GENERATION: { color: 'bg-green-100 text-green-800', label: 'Content Generation' },
  CONTENT_REVIEW: { color: 'bg-yellow-100 text-yellow-800', label: 'Content Review' },
  IMAGE_GENERATION: { color: 'bg-purple-100 text-purple-800', label: 'Image Generation' },
  PUBLISHING: { color: 'bg-orange-100 text-orange-800', label: 'Publishing' },
  APPROVAL: { color: 'bg-red-100 text-red-800', label: 'Approval' },
  LIVE_DEPLOYMENT: { color: 'bg-emerald-100 text-emerald-800', label: 'Live Deployment' }
}

// Status configuration with colors
const STATUS_CONFIG = {
  in_progress: { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
  completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
  failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
  pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  approved: { color: 'bg-emerald-100 text-emerald-800', label: 'Approved' },
  rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
}

export function BlogStatusTable({ posts, sites, selectedSite, onSiteChange }) {
  const [sortField, setSortField] = useState('last_updated')
  const [sortDirection, setSortDirection] = useState('desc')

  // Filter posts by selected site
  const filteredPosts = selectedSite 
    ? posts.filter(post => post.site_id === selectedSite)
    : posts

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getPhaseInfo = (phase) => {
    return WORKFLOW_PHASES[phase] || { color: 'bg-gray-100 text-gray-800', label: phase }
  }

  const getStatusInfo = (status) => {
    return STATUS_CONFIG[status] || { color: 'bg-gray-100 text-gray-800', label: status }
  }

  const getWorkflowProgress = (post) => {
    const phases = post.workflow_phases_completed || []
    const totalPhases = Object.keys(WORKFLOW_PHASES).length
    return Math.round((phases.length / totalPhases) * 100)
  }

  return (
    <div className="space-y-4">
      {/* Site Filter */}
      {sites && sites.length > 0 && (
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Site:</label>
          <select
            value={selectedSite || ''}
            onChange={(e) => onSiteChange(e.target.value || null)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sites</option>
            {sites.map(site => (
              <option key={site.site_id} value={site.site_id}>
                {site.site_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">
            {filteredPosts.filter(p => p.status === 'in_progress').length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {filteredPosts.filter(p => p.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">
            {filteredPosts.filter(p => p.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending Approval</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">
            {filteredPosts.filter(p => p.status === 'failed').length}
          </div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
      </div>

      {/* Blog Status Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th 
                  className="p-3 border-b cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Title</span>
                    {sortField === 'title' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="p-3 border-b">Site</th>
                <th className="p-3 border-b">Phase</th>
                <th className="p-3 border-b">Progress</th>
                <th className="p-3 border-b">Status</th>
                <th className="p-3 border-b">Preview</th>
                <th className="p-3 border-b">Live</th>
                <th 
                  className="p-3 border-b cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('last_updated')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Updated</span>
                    {sortField === 'last_updated' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="p-3 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPosts.map((post) => {
                const phaseInfo = getPhaseInfo(post.current_phase)
                const statusInfo = getStatusInfo(post.status)
                const progress = getWorkflowProgress(post)
                
                return (
                  <tr key={post.post_id} className="hover:bg-gray-50 border-b">
                    <td className="p-3 font-medium text-gray-900">
                      <div className="max-w-xs truncate" title={post.title}>
                        {post.title}
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {post.site_id}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`rounded px-2 py-1 text-xs font-medium ${phaseInfo.color}`}>
                        {phaseInfo.label}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{progress}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`rounded px-2 py-1 text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="p-3">
                      {post.preview_url ? (
                        <a
                          href={post.preview_url}
                          className="text-blue-600 hover:underline text-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Preview
                        </a>
                      ) : (
                        <span className="text-gray-400 italic text-sm">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      {post.final_url ? (
                        <a
                          href={post.final_url}
                          className="text-green-600 hover:underline text-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Live
                        </a>
                      ) : (
                        <span className="text-gray-400 italic text-sm">—</span>
                      )}
                    </td>
                    <td className="p-3 text-gray-500 text-sm">
                      {new Date(post.last_updated).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(`/posts/${post.post_id}`, '_blank')}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          View
                        </button>
                        {post.status === 'pending' && (
                          <>
                            <button
                              onClick={() => console.log('Approve', post.post_id)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => console.log('Reject', post.post_id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {sortedPosts.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No posts found for the selected criteria.
          </div>
        )}
      </div>
    </div>
  )
} 