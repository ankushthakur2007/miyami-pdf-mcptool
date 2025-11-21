export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      api_keys: {
        Row: {
          id: string
          user_id: string
          key_hash: string
          key_prefix: string
          name: string
          vault_secret_id: string | null
          created_at: string
          last_used_at: string | null
          is_active: boolean
          rate_limit_per_hour: number
          total_requests: number
          metadata: Json
        }
        Insert: {
          id?: string
          user_id: string
          key_hash: string
          key_prefix: string
          name?: string
          vault_secret_id?: string | null
          created_at?: string
          last_used_at?: string | null
          is_active?: boolean
          rate_limit_per_hour?: number
          total_requests?: number
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          key_hash?: string
          key_prefix?: string
          name?: string
          vault_secret_id?: string | null
          created_at?: string
          last_used_at?: string | null
          is_active?: boolean
          rate_limit_per_hour?: number
          total_requests?: number
          metadata?: Json
        }
      }
      pdfs: {
        Row: {
          id: string
          user_id: string
          api_key_id: string | null
          filename: string
          storage_path: string
          public_url: string
          file_size: number | null
          page_count: number | null
          format: string
          source_type: 'html' | 'markdown' | 'url' | 'template' | 'text' | null
          operation_type: 'generate' | 'merge' | 'modify' | 'watermark' | 'compress' | null
          metadata: Json
          created_at: string
          created_via: 'api' | 'dashboard' | 'mcp'
        }
        Insert: {
          id?: string
          user_id: string
          api_key_id?: string | null
          filename: string
          storage_path: string
          public_url: string
          file_size?: number | null
          page_count?: number | null
          format?: string
          source_type?: 'html' | 'markdown' | 'url' | 'template' | 'text' | null
          operation_type?: 'generate' | 'merge' | 'modify' | 'watermark' | 'compress' | null
          metadata?: Json
          created_at?: string
          created_via?: 'api' | 'dashboard' | 'mcp'
        }
        Update: {
          id?: string
          user_id?: string
          api_key_id?: string | null
          filename?: string
          storage_path?: string
          public_url?: string
          file_size?: number | null
          page_count?: number | null
          format?: string
          source_type?: 'html' | 'markdown' | 'url' | 'template' | 'text' | null
          operation_type?: 'generate' | 'merge' | 'modify' | 'watermark' | 'compress' | null
          metadata?: Json
          created_at?: string
          created_via?: 'api' | 'dashboard' | 'mcp'
        }
      }
      api_usage: {
        Row: {
          id: string
          api_key_id: string
          user_id: string
          endpoint: string
          pdf_id: string | null
          method: string
          created_at: string
          response_time_ms: number | null
          status_code: number | null
          error_message: string | null
          request_size: number | null
          response_size: number | null
        }
        Insert: {
          id?: string
          api_key_id: string
          user_id: string
          endpoint: string
          pdf_id?: string | null
          method: string
          created_at?: string
          response_time_ms?: number | null
          status_code?: number | null
          error_message?: string | null
          request_size?: number | null
          response_size?: number | null
        }
        Update: {
          id?: string
          api_key_id?: string
          user_id?: string
          endpoint?: string
          pdf_id?: string | null
          method?: string
          created_at?: string
          response_time_ms?: number | null
          status_code?: number | null
          error_message?: string | null
          request_size?: number | null
          response_size?: number | null
        }
      }
      pdf_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          template_html: string
          variables: Json
          is_public: boolean
          usage_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          template_html: string
          variables?: Json
          is_public?: boolean
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          template_html?: string
          variables?: Json
          is_public?: boolean
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_usage_stats: {
        Args: {
          p_user_id: string
          p_days?: number
        }
        Returns: Json
      }
      check_rate_limit: {
        Args: {
          p_api_key_hash: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
