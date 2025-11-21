import fetch from 'node-fetch'

export interface ApiConfig {
  baseUrl: string
  apiKey: string
  timeout: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: any
}

export class ApiClient {
  private config: ApiConfig

  constructor(config: ApiConfig) {
    this.config = config
  }

  async request<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json() as any

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
          details: data.details,
        }
      }

      return {
        success: true,
        data: data,
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout - PDF operation took too long',
          }
        }
        return {
          success: false,
          error: error.message,
        }
      }
      return {
        success: false,
        error: 'Unknown error occurred',
      }
    }
  }

  async generatePdf(body: any): Promise<ApiResponse> {
    return this.request('/api/pdf/generate', 'POST', body)
  }

  async generatePdfFromUrl(body: any): Promise<ApiResponse> {
    return this.request('/api/pdf/generate-from-url', 'POST', body)
  }

  async listPdfs(page: number = 1, limit: number = 20): Promise<ApiResponse> {
    return this.request(`/api/pdf/list?page=${page}&limit=${limit}`, 'GET')
  }

  // Note: These endpoints need to be implemented in the Next.js app
  async mergePdfs(body: any): Promise<ApiResponse> {
    return this.request('/api/pdf/merge', 'POST', body)
  }

  async modifyPdf(body: any): Promise<ApiResponse> {
    return this.request('/api/pdf/modify', 'POST', body)
  }

  async watermarkPdf(body: any): Promise<ApiResponse> {
    return this.request('/api/pdf/watermark', 'POST', body)
  }

  async extractContent(body: any): Promise<ApiResponse> {
    return this.request('/api/pdf/extract', 'POST', body)
  }

  async getPdfInfo(pdfId: string): Promise<ApiResponse> {
    return this.request(`/api/pdf/${pdfId}`, 'GET')
  }
}

export function createApiClient(): ApiClient {
  const baseUrl = process.env.PDF_API_BASE_URL || 'http://localhost:3000'
  const apiKey = process.env.PDF_API_KEY
  const timeout = parseInt(process.env.PDF_API_TIMEOUT || '120000', 10)

  if (!apiKey) {
    throw new Error(
      'PDF_API_KEY environment variable is required. ' +
      'Please set it in your MCP server configuration or .env file.'
    )
  }

  return new ApiClient({ baseUrl, apiKey, timeout })
}
