'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface UsageStats {
  total_requests: number
  total_pdfs: number
  total_storage_bytes: number
  requests_last_24h: number
  requests_last_7d: number
  requests_last_30d: number
  top_endpoints: Array<{
    endpoint: string
    count: number
  }>
  recent_activity: Array<{
    endpoint: string
    method: string
    status_code: number
    created_at: string
  }>
}

export default function UsagePage() {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsageStats()
  }, [])

  async function fetchUsageStats() {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/usage/stats')
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to fetch usage statistics')
        return
      }

      setStats(data.stats || data)
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usage & Analytics</h1>
          <p className="text-gray-600 mt-1">Track your API usage and statistics</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">Loading statistics...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usage & Analytics</h1>
          <p className="text-gray-600 mt-1">Track your API usage and statistics</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Usage & Analytics</h1>
        <p className="text-gray-600 mt-1">Track your API usage and statistics</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-3xl">{stats?.total_requests?.toLocaleString() || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">All time API calls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total PDFs</CardDescription>
            <CardTitle className="text-3xl">{stats?.total_pdfs?.toLocaleString() || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Generated documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Storage Used</CardDescription>
            <CardTitle className="text-3xl">
              {formatBytes(stats?.total_storage_bytes || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Total file storage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Last 24 Hours</CardDescription>
            <CardTitle className="text-3xl">{stats?.requests_last_24h?.toLocaleString() || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Recent requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Period Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request Timeline</CardTitle>
            <CardDescription>API requests over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last 24 hours</span>
                <Badge variant="secondary">{stats?.requests_last_24h?.toLocaleString() || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last 7 days</span>
                <Badge variant="secondary">{stats?.requests_last_7d?.toLocaleString() || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last 30 days</span>
                <Badge variant="secondary">{stats?.requests_last_30d?.toLocaleString() || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Endpoints</CardTitle>
            <CardDescription>Most used API endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.top_endpoints && stats.top_endpoints.length > 0 ? (
              <div className="space-y-3">
                {stats.top_endpoints.map((endpoint, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-mono">{endpoint.endpoint}</span>
                    <Badge>{endpoint.count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No endpoint data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest API requests</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recent_activity && stats.recent_activity.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_activity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {activity.method}
                      </Badge>
                      <span className="text-sm font-mono">{activity.endpoint}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(activity.created_at)}</p>
                  </div>
                  <Badge variant={activity.status_code >= 200 && activity.status_code < 300 ? 'default' : 'destructive'}>
                    {activity.status_code}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
