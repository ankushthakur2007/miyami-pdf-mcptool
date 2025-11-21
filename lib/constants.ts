// PDF Formats
export const PDF_FORMATS = {
  A4: { width: '210mm', height: '297mm' },
  Letter: { width: '8.5in', height: '11in' },
  Legal: { width: '8.5in', height: '14in' },
} as const

export type PdfFormat = keyof typeof PDF_FORMATS

// Default values
export const DEFAULT_RATE_LIMIT = 100 // requests per hour
export const DEFAULT_PDF_FORMAT: PdfFormat = 'A4'
export const MAX_FILE_SIZE = 52428800 // 50MB in bytes
export const MAX_MERGE_FILES = 10

// API Key prefixes
export const API_KEY_PREFIX_LIVE = 'sk_live'
export const API_KEY_PREFIX_TEST = 'sk_test'

// Pagination
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized - Please provide a valid API key',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded - Please try again later',
  INVALID_API_KEY: 'Invalid or inactive API key',
  INVALID_INPUT: 'Invalid request parameters',
  PDF_GENERATION_FAILED: 'Failed to generate PDF',
  PDF_NOT_FOUND: 'PDF not found',
  STORAGE_ERROR: 'Failed to upload PDF to storage',
  DATABASE_ERROR: 'Database operation failed',
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  PDF_GENERATED: 'PDF generated successfully',
  API_KEY_CREATED: 'API key created successfully',
  API_KEY_DELETED: 'API key deleted successfully',
  ACCOUNT_CREATED: 'Account created successfully',
  LOGIN_SUCCESS: 'Login successful',
} as const
