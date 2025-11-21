import { createServiceClient } from '@/lib/supabase/server'
import { ERROR_MESSAGES } from '@/lib/constants'

export interface RateLimitResult {
  allowed: boolean
  remaining?: number
  resetAt?: Date
  error?: string
}

/**
 * Check if API key is within rate limit
 */
export async function checkRateLimit(
  apiKeyId: string
): Promise<RateLimitResult> {
  const supabase = createServiceClient()

  // Get API key rate limit setting
  const { data: keyData, error: keyError } = await supabase
    .from('api_keys')
    .select('rate_limit_per_hour')
    .eq('id', apiKeyId as any)
    .single()

  if (keyError || !keyData) {
    return {
      allowed: false,
      error: 'Failed to fetch rate limit settings',
    }
  }

  const rateLimit = (keyData as any).rate_limit_per_hour || 100

  // Count requests in the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const { count, error: countError } = await supabase
    .from('api_usage')
    .select('*', { count: 'exact', head: true })
    .eq('api_key_id', apiKeyId as any)
    .gte('created_at', oneHourAgo)

  if (countError) {
    return {
      allowed: false,
      error: 'Failed to check rate limit',
    }
  }

  const requestCount = count || 0
  const remaining = Math.max(0, rateLimit - requestCount)

  // Calculate reset time (next full hour)
  const resetAt = new Date()
  resetAt.setHours(resetAt.getHours() + 1, 0, 0, 0)

  if (requestCount >= rateLimit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
    }
  }

  return {
    allowed: true,
    remaining,
    resetAt,
  }
}

/**
 * Middleware to check rate limit before processing request
 */
export async function withRateLimit(
  apiKeyId: string,
  handler: () => Promise<Response>
): Promise<Response> {
  const rateLimitResult = await checkRateLimit(apiKeyId)

  if (!rateLimitResult.allowed) {
    return Response.json(
      {
        error: rateLimitResult.error || ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
        remaining: 0,
        resetAt: rateLimitResult.resetAt?.toISOString(),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetAt?.toISOString() || '',
        },
      }
    )
  }

  const response = await handler()

  // Add rate limit headers to successful responses
  if (rateLimitResult.remaining !== undefined) {
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
  }
  if (rateLimitResult.resetAt) {
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetAt.toISOString())
  }

  return response
}

/**
 * Log API usage for analytics and rate limiting
 */
export async function logApiUsage(params: {
  apiKeyId: string
  userId: string
  endpoint: string
  method: string
  pdfId?: string
  responseTimeMs: number
  statusCode: number
  errorMessage?: string
  requestSize?: number
  responseSize?: number
}): Promise<void> {
  const supabase = createServiceClient()

  await supabase.from('api_usage').insert({
    api_key_id: params.apiKeyId,
    user_id: params.userId,
    endpoint: params.endpoint,
    method: params.method,
    pdf_id: params.pdfId,
    response_time_ms: params.responseTimeMs,
    status_code: params.statusCode,
    error_message: params.errorMessage,
    request_size: params.requestSize,
    response_size: params.responseSize,
  } as any)
}
