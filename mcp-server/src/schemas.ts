import { z } from 'zod'

// PDF Generation Options
export const PdfOptionsSchema = z.object({
  format: z.enum(['A4', 'Letter', 'Legal']).default('A4'),
  filename: z.string().optional(),
  margin: z.object({
    top: z.string().default('20mm'),
    right: z.string().default('20mm'),
    bottom: z.string().default('20mm'),
    left: z.string().default('20mm'),
  }).optional(),
  landscape: z.boolean().default(false),
  header: z.string().optional(),
  footer: z.string().optional(),
})

// Generate PDF from HTML
export const GeneratePdfFromHtmlSchema = z.object({
  html: z.string().min(1, 'HTML content is required'),
  options: PdfOptionsSchema.optional(),
})

// Generate PDF from Markdown
export const GeneratePdfFromMarkdownSchema = z.object({
  markdown: z.string().min(1, 'Markdown content is required'),
  options: PdfOptionsSchema.optional(),
})

// Generate PDF from Text
export const GeneratePdfFromTextSchema = z.object({
  text: z.string().min(1, 'Text content is required'),
  options: PdfOptionsSchema.optional(),
})

// Generate PDF from URL
export const GeneratePdfFromUrlSchema = z.object({
  url: z.string().url('Valid URL is required'),
  format: z.enum(['A4', 'Letter', 'Legal']).default('A4'),
  filename: z.string().optional(),
  wait_for: z.string().optional(),
  full_page: z.boolean().default(true),
})

// Merge PDFs
export const MergePdfsSchema = z.object({
  pdf_urls: z.array(z.string().url()).min(2, 'At least 2 PDFs required').max(10, 'Maximum 10 PDFs allowed'),
  filename: z.string().optional(),
})

// Extract Pages
export const ExtractPagesSchema = z.object({
  pdf_url: z.string().url('Valid PDF URL is required'),
  pages: z.array(z.number().min(1)).min(1, 'At least one page number required'),
  filename: z.string().optional(),
})

// Rotate Pages
export const RotatePagesSchema = z.object({
  pdf_url: z.string().url('Valid PDF URL is required'),
  pages: z.array(z.number().min(1)).min(1, 'At least one page number required'),
  angle: z.union([z.literal(90), z.literal(180), z.literal(270)]),
  filename: z.string().optional(),
})

// Add Watermark
export const AddWatermarkSchema = z.object({
  pdf_url: z.string().url('Valid PDF URL is required'),
  watermark_text: z.string().min(1, 'Watermark text is required'),
  position: z.enum(['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right']).default('center'),
  opacity: z.number().min(0).max(1).default(0.3),
  rotation: z.number().min(-90).max(90).default(0),
  font_size: z.number().min(8).max(72).default(48),
  filename: z.string().optional(),
})

// Extract Text
export const ExtractTextSchema = z.object({
  pdf_url: z.string().url('Valid PDF URL is required'),
  pages: z.array(z.number().min(1)).optional(),
  max_length: z.number().default(10000),
})

// Get PDF Info
export const GetPdfInfoSchema = z.object({
  pdf_url: z.string().url('Valid PDF URL is required'),
})

// List User PDFs
export const ListPdfsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

export type PdfOptions = z.infer<typeof PdfOptionsSchema>
export type GeneratePdfFromHtmlInput = z.infer<typeof GeneratePdfFromHtmlSchema>
export type GeneratePdfFromMarkdownInput = z.infer<typeof GeneratePdfFromMarkdownSchema>
export type GeneratePdfFromTextInput = z.infer<typeof GeneratePdfFromTextSchema>
export type GeneratePdfFromUrlInput = z.infer<typeof GeneratePdfFromUrlSchema>
export type MergePdfsInput = z.infer<typeof MergePdfsSchema>
export type ExtractPagesInput = z.infer<typeof ExtractPagesSchema>
export type RotatePagesInput = z.infer<typeof RotatePagesSchema>
export type AddWatermarkInput = z.infer<typeof AddWatermarkSchema>
export type ExtractTextInput = z.infer<typeof ExtractTextSchema>
export type GetPdfInfoInput = z.infer<typeof GetPdfInfoSchema>
export type ListPdfsInput = z.infer<typeof ListPdfsSchema>
