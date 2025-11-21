import { createServiceClient } from '@/lib/supabase/server'
import { hashApiKey } from '@/lib/utils/crypto'
import { ERROR_MESSAGES } from '@/lib/constants'

export interface ApiKeyValidationResult {
  isValid: boolean
  apiKeyId?: string
  userId?: string
  error?: string
}

/**
 * Validate API key from request headers
 */
export async function validateApiKey(
  apiKey: string | null
): Promise<ApiKeyValidationResult> {
  if (!apiKey) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.UNAUTHORIZED,
    }
  }

  // Hash the API key
  const keyHash = hashApiKey(apiKey)

  // Query database using service role
  const supabase = createServiceClient()

  const { data: keyData, error } = await supabase
    .from('api_keys')
    .select('id, user_id, is_active')
    .eq('key_hash', keyHash as any)
    .eq('is_active', true as any)
    .single()

  if (error || !keyData) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_API_KEY,
    }
  }

  return {
    isValid: true,
    apiKeyId: (keyData as any).id as string,
    userId: (keyData as any).user_id as string,
  }
}

/**
 * Extract API key from request headers
 */
export function extractApiKey(request: Request): string | null {
  return request.headers.get('x-api-key')
}

/**
 * Update API key last used timestamp
 */
export async function updateApiKeyUsage(apiKeyId: string): Promise<void> {
  const supabase = createServiceClient()

  // Get current count and increment
  const { data: currentData } = await supabase
    .from('api_keys')
    .select('total_requests')
    .eq('id', apiKeyId as any)
    .single()

  const newCount = ((currentData as any)?.total_requests || 0) + 1

  await supabase
    .from('api_keys')
    .update({
      last_used_at: new Date().toISOString(),
      total_requests: newCount,
    } as any)
    .eq('id', apiKeyId as any)
}

/**
 * Middleware function to validate API key in route handlers
 */
export async function withApiKey(
  request: Request,
  handler: (apiKeyId: string, userId: string) => Promise<Response>
): Promise<Response> {
  const apiKey = extractApiKey(request)
  const validation = await validateApiKey(apiKey)

  if (!validation.isValid) {
    return Response.json(
      { error: validation.error },
      { status: 401 }
    )
  }

  // Update last used timestamp asynchronously
  updateApiKeyUsage(validation.apiKeyId!).catch(console.error)

  return handler(validation.apiKeyId!, validation.userId!)
}
