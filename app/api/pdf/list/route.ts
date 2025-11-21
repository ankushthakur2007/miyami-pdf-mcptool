import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, updateApiKeyUsage } from '@/lib/api/api-key-validator'
import { checkRateLimit, logApiUsage } from '@/lib/api/rate-limiter'
import { createServiceClient } from '@/lib/supabase/server'
import { hashApiKey } from '@/lib/utils/crypto'

export async function GET(req: NextRequest) {
  try {
    // Validate API key
    const apiKey = req.headers.get('x-api-key')
    const validation = await validateApiKey(apiKey)

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 401 }
      )
    }

    const { apiKeyId, userId } = validation

    // Check rate limit
    const rateLimitCheck = await checkRateLimit(apiKeyId!)

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: rateLimitCheck },
        { status: 429 }
      )
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = (page - 1) * limit

    // Fetch user's PDFs
    const supabase = createServiceClient()
    const { data: pdfs, error, count } = await supabase
      .from('pdfs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId! as any)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch PDFs' },
        { status: 500 }
      )
    }

    // Log usage
    await logApiUsage({
      apiKeyId: apiKeyId!,
      userId: userId!,
      endpoint: '/api/pdf/list',
      method: 'GET',
      responseTimeMs: 0,
      statusCode: 200,
    })
    await updateApiKeyUsage(apiKeyId!)

    return NextResponse.json({
      pdfs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
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
