import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get total requests
    const { count: totalRequests } = await supabase
      .from('api_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Get total PDFs
    const { count: totalPdfs } = await supabase
      .from('pdfs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Get total storage
    const { data: pdfsData } = await supabase
      .from('pdfs')
      .select('file_size')
      .eq('user_id', user.id)

    const totalStorageBytes = pdfsData?.reduce((sum, pdf) => sum + (pdf.file_size || 0), 0) || 0

    // Get requests in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: requests24h } = await supabase
      .from('api_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneDayAgo)

    // Get requests in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: requests7d } = await supabase
      .from('api_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo)

    // Get requests in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { count: requests30d } = await supabase
      .from('api_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo)

    // Get top endpoints
    const { data: usageData } = await supabase
      .from('api_usage')
      .select('endpoint')
      .eq('user_id', user.id)
      .limit(1000)

    const endpointCounts: { [key: string]: number } = {}
    usageData?.forEach(item => {
      endpointCounts[item.endpoint] = (endpointCounts[item.endpoint] || 0) + 1
    })

    const topEndpoints = Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('api_usage')
      .select('endpoint, method, status_code, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      stats: {
        total_requests: totalRequests || 0,
        total_pdfs: totalPdfs || 0,
        total_storage_bytes: totalStorageBytes,
        requests_last_24h: requests24h || 0,
        requests_last_7d: requests7d || 0,
        requests_last_30d: requests30d || 0,
        top_endpoints: topEndpoints,
        recent_activity: recentActivity || [],
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
