import { createHmac, randomBytes } from 'crypto'

/**
 * Get encryption secret for HMAC hashing
 * Priority: Supabase Vault (future) -> Environment variable
 */
function getEncryptionSecret(): string {
  const secret = process.env.API_KEY_ENCRYPTION_SECRET
  
  if (!secret) {
    throw new Error(
      'API_KEY_ENCRYPTION_SECRET environment variable is required for API key hashing. ' +
      'Generate a secure random string (at least 32 characters) and add it to your .env.local file.'
    )
  }
  
  if (secret.length < 32) {
    throw new Error(
      'API_KEY_ENCRYPTION_SECRET must be at least 32 characters long for security.'
    )
  }
  
  return secret
}

/**
 * Generate a secure API key with a prefix
 * Format: sk_live_32_random_characters
 */
export function generateApiKey(prefix: string = 'sk_live'): string {
  const randomPart = randomBytes(24).toString('base64url')
  return `${prefix}_${randomPart}`
}

/**
 * Hash an API key using HMAC-SHA256 with a secret key
 * Used for storing API keys securely in the database
 * The secret key is stored in Supabase Vault or environment variables
 */
export function hashApiKey(apiKey: string): string {
  const secret = getEncryptionSecret()
  return createHmac('sha256', secret).update(apiKey).digest('hex')
}

/**
 * Extract the prefix from an API key
 * Example: sk_live_abc123 -> sk_live
 */
export function extractKeyPrefix(apiKey: string): string {
  const parts = apiKey.split('_')
  if (parts.length >= 2) {
    return `${parts[0]}_${parts[1]}`
  }
  return parts[0] || 'sk'
}

/**
 * Mask an API key for display
 * Example: sk_live_abc123def456 -> sk_live_...f456
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 12) return apiKey
  const prefix = extractKeyPrefix(apiKey)
  const lastFour = apiKey.slice(-4)
  return `${prefix}_...${lastFour}`
}
