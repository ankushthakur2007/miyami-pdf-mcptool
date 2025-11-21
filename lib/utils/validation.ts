import { z } from 'zod'

// PDF Generation Schemas
export const GeneratePdfSchema = z.object({
  html: z.string().optional(),
  markdown: z.string().optional(),
  text: z.string().optional(),
  options: z.object({
    format: z.enum(['A4', 'Letter', 'Legal']).default('A4'),
    filename: z.string().optional(),
    margin: z.object({
      top: z.string().default('20mm'),
      right: z.string().default('20mm'),
      bottom: z.string().default('20mm'),
      left: z.string().default('20mm'),
    }).optional(),
    header: z.string().optional(),
    footer: z.string().optional(),
    landscape: z.boolean().default(false),
  }).optional(),
}).refine(data => data.html || data.markdown || data.text, {
  message: 'At least one of html, markdown, or text must be provided'
})

export const GeneratePdfFromUrlSchema = z.object({
  url: z.string().url(),
  format: z.enum(['A4', 'Letter', 'Legal']).default('A4'),
  filename: z.string().optional(),
  wait_for: z.string().optional(),
  full_page: z.boolean().default(true),
})

export const GeneratePdfFromTemplateSchema = z.object({
  template_name: z.string().min(1),
  data: z.record(z.any()),
  format: z.enum(['A4', 'Letter', 'Legal']).default('A4'),
})

export const MergePdfsSchema = z.object({
  pdf_sources: z.array(z.string()).min(2).max(10),
  filename: z.string().optional(),
  order: z.array(z.number()).optional(),
})

export const ModifyPdfSchema = z.object({
  pdf_source: z.string(),
  operations: z.array(z.object({
    action: z.enum(['extract', 'rotate', 'delete']),
    pages: z.array(z.number().min(1)),
    angle: z.union([z.literal(90), z.literal(180), z.literal(270)]).optional(),
  })).min(1),
  filename: z.string().optional(),
})

export const WatermarkPdfSchema = z.object({
  pdf_source: z.string(),
  watermark_text: z.string().min(1),
  position: z.enum(['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right']).default('center'),
  opacity: z.number().min(0).max(1).default(0.3),
  rotation: z.number().min(-90).max(90).default(0),
  font_size: z.number().min(8).max(72).default(48),
})

export const ExtractContentSchema = z.object({
  pdf_source: z.string(),
  extract_type: z.enum(['text', 'tables', 'images', 'all']).default('text'),
  pages: z.array(z.number().min(1)).optional(),
  max_length: z.number().default(10000),
})

// API Key Schemas
export const CreateApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  rate_limit_per_hour: z.number().min(1).max(10000),
})

// Auth Schemas
export const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  confirmPassword: z.string(),
  fullName: z.string().min(1).max(100),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
