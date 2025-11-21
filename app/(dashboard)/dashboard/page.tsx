import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

async function getDashboardStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const serviceSupabase = createServiceClient()

  // Get API keys count
  const { count: apiKeysCount } = await serviceSupabase
    .from('api_keys')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id as any)

  // Get PDFs count
  const { count: pdfsCount } = await serviceSupabase
    .from('pdfs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id as any)

  // Get this month's usage
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: requestsThisMonth } = await serviceSupabase
    .from('api_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id as any)
    .gte('created_at', startOfMonth.toISOString())

  return {
    apiKeysCount: apiKeysCount || 0,
    pdfsCount: pdfsCount || 0,
    requestsThisMonth: requestsThisMonth || 0,
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  if (!stats) {
    return <div>Error loading dashboard</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome to your PDF generation dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              API Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.apiKeysCount}</div>
            <p className="text-xs text-gray-500 mt-1">Active API keys</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              PDFs Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pdfsCount}</div>
            <p className="text-xs text-gray-500 mt-1">Total PDFs created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              API Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.requestsThisMonth}</div>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with PDF generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <a
            href="/dashboard/api-keys"
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all"
          >
            <h3 className="font-semibold text-gray-900">Create API Key</h3>
            <p className="text-sm text-gray-600 mt-1">
              Generate a new API key to start using the PDF generation API
            </p>
          </a>
          <a
            href="/dashboard/docs"
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all"
          >
            <h3 className="font-semibold text-gray-900">View Documentation</h3>
            <p className="text-sm text-gray-600 mt-1">
              Learn how to integrate PDF generation into your application
            </p>
          </a>
          <a
            href="/dashboard/pdfs"
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all"
          >
            <h3 className="font-semibold text-gray-900">Browse PDFs</h3>
            <p className="text-sm text-gray-600 mt-1">
              View and manage all your generated PDF files
            </p>
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
