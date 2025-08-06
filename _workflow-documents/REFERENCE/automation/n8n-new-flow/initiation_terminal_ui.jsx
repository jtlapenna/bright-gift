import React, { useState } from 'react'
import { useSites } from '../hooks/use_sites_hook'

export default function InitiationTerminal({ onWorkflowStarted }) {
  const { sites, loading: sitesLoading } = useSites()
  const [starting, setStarting] = useState(false)
  const [status, setStatus] = useState(null)
  const [selectedSite, setSelectedSite] = useState('')
  const [workflowType, setWorkflowType] = useState('full')
  const [customTopic, setCustomTopic] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Workflow type options
  const workflowTypes = [
    { 
      id: 'full', 
      label: 'Full Content Workflow', 
      description: 'Complete SEO research, content generation, and publishing',
      phases: ['SEO_RESEARCH', 'CONTENT_GENERATION', 'CONTENT_REVIEW', 'IMAGE_GENERATION', 'PUBLISHING', 'APPROVAL']
    },
    { 
      id: 'seo_only', 
      label: 'SEO Research Only', 
      description: 'Just keyword research and topic analysis',
      phases: ['SEO_RESEARCH']
    },
    { 
      id: 'content_only', 
      label: 'Content Generation Only', 
      description: 'Generate content for existing topic',
      phases: ['CONTENT_GENERATION', 'CONTENT_REVIEW', 'IMAGE_GENERATION']
    },
    { 
      id: 'publish_only', 
      label: 'Publishing Only', 
      description: 'Publish existing content',
      phases: ['PUBLISHING', 'APPROVAL']
    }
  ]

  const handleStartWorkflow = async () => {
    if (!selectedSite) {
      setStatus('Please select a site')
      return
    }

    setStarting(true)
    setStatus('Initializing workflow...')

    try {
      // Create workflow state in Supabase
      const workflowData = {
        post_id: `blog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        site_id: selectedSite,
        title: customTopic || 'Untitled Blog Post',
        current_phase: 'INITIATION',
        next_workflow_phase: workflowTypes.find(w => w.id === workflowType)?.phases[0] || 'SEO_RESEARCH',
        status: 'initiated',
        workflow_phases_completed: [],
        metadata: {
          workflow_type: workflowType,
          custom_topic: customTopic,
          initiated_at: new Date().toISOString(),
          phases: workflowTypes.find(w => w.id === workflowType)?.phases || []
        }
      }

      // TODO: Replace with actual Supabase client
      const response = await fetch('/api/workflows/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowData)
      })

      if (!response.ok) {
        throw new Error('Failed to initiate workflow')
      }

      const result = await response.json()
      
      setStatus('Workflow initiated successfully!')
      
      // Trigger n8n workflow via webhook
      await triggerN8nWorkflow(result.post_id, workflowType, selectedSite)
      
      // Notify parent component
      if (onWorkflowStarted) {
        onWorkflowStarted(result.post_id)
      }

    } catch (error) {
      console.error('Error starting workflow:', error)
      setStatus(`Error: ${error.message}`)
    } finally {
      setStarting(false)
    }
  }

  const triggerN8nWorkflow = async (postId, workflowType, siteId) => {
    try {
      setStatus('Triggering n8n workflow...')
      
      // TODO: Replace with actual n8n webhook URL
      const webhookUrl = process.env.VITE_N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook/workflow-trigger'
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          workflow_type: workflowType,
          site_id: siteId,
          trigger_type: 'manual_initiation',
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to trigger n8n workflow')
      }

      setStatus('n8n workflow triggered successfully!')
      
    } catch (error) {
      console.error('Error triggering n8n workflow:', error)
      setStatus(`Warning: Workflow created but n8n trigger failed: ${error.message}`)
    }
  }

  const getSelectedWorkflow = () => {
    return workflowTypes.find(w => w.id === workflowType)
  }

  const selectedWorkflow = getSelectedWorkflow()

  if (sitesLoading) {
    return (
      <div className="p-6 border rounded-lg bg-white shadow-md">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading sites...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 border rounded-lg bg-white shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Workflow Initiation Terminal</h2>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </button>
      </div>

      {/* Site Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Site *
        </label>
        <select
          value={selectedSite}
          onChange={(e) => setSelectedSite(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={starting}
        >
          <option value="">Choose a site...</option>
          {sites?.map(site => (
            <option key={site.site_id} value={site.site_id}>
              {site.site_name}
            </option>
          ))}
        </select>
      </div>

      {/* Workflow Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Workflow Type
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {workflowTypes.map(type => (
            <label
              key={type.id}
              className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                workflowType === type.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="workflowType"
                value={type.id}
                checked={workflowType === type.id}
                onChange={(e) => setWorkflowType(e.target.value)}
                className="sr-only"
                disabled={starting}
              />
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{type.label}</p>
                    <p className="text-gray-500">{type.description}</p>
                  </div>
                </div>
                {workflowType === type.id && (
                  <div className="shrink-0 text-blue-600">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Custom Topic Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Topic (Optional)
        </label>
        <input
          type="text"
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          placeholder="Enter a specific topic or leave blank for auto-generation"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={starting}
        />
      </div>

      {/* Workflow Preview */}
      {selectedWorkflow && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Workflow Preview</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium">{selectedWorkflow.label}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Phases:</span>
              <span className="font-medium">{selectedWorkflow.phases.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Site:</span>
              <span className="font-medium">
                {sites?.find(s => s.site_id === selectedSite)?.site_name || 'Not selected'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="border-t pt-4 space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Advanced Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Length
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="auto">Auto-detect</option>
                <option value="short">Short (500-800 words)</option>
                <option value="medium">Medium (800-1500 words)</option>
                <option value="long">Long (1500+ words)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4 border-t">
        <button
          onClick={handleStartWorkflow}
          disabled={starting || !selectedSite}
          className={`flex-1 px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            starting || !selectedSite
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
          }`}
        >
          {starting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Starting Workflow...
            </div>
          ) : (
            'Start Workflow'
          )}
        </button>
        
        <button
          onClick={() => {
            setSelectedSite('')
            setWorkflowType('full')
            setCustomTopic('')
            setStatus(null)
          }}
          disabled={starting}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Reset
        </button>
      </div>

      {/* Status Display */}
      {status && (
        <div className={`p-3 rounded-md text-sm ${
          status.includes('Error') || status.includes('Warning')
            ? 'bg-red-50 text-red-700 border border-red-200'
            : status.includes('successfully')
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {status}
        </div>
      )}
    </div>
  )
} 