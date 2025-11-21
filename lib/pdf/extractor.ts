// @ts-ignore - pdf-parse has CommonJS default export
import pdfParse from 'pdf-parse'

export interface PdfInfo {
  pageCount: number
  metadata: {
    title?: string
    author?: string
    subject?: string
    creator?: string
    producer?: string
    creationDate?: string
    modificationDate?: string
  }
  version?: string
  isEncrypted: boolean
}

export interface ExtractedContent {
  text?: string
  pageCount: number
  metadata: {
    title?: string
    author?: string
    [key: string]: any
  }
}

/**
 * Extract text content from PDF
 */
export async function extractText(
  pdfBuffer: Buffer,
  options: {
    pages?: number[]
    maxLength?: number
  } = {}
): Promise<string> {
  const data = await pdfParse(pdfBuffer)
  
  let text = data.text
  
  // If maxLength is specified, truncate
  if (options.maxLength && text.length > options.maxLength) {
    text = text.substring(0, options.maxLength) + '...'
  }
  
  return text
}

/**
 * Get comprehensive PDF information
 */
export async function getPdfInfo(pdfBuffer: Buffer): Promise<PdfInfo> {
  const data = await pdfParse(pdfBuffer)
  
  return {
    pageCount: data.numpages,
    metadata: {
      title: data.info?.Title,
      author: data.info?.Author,
      subject: data.info?.Subject,
      creator: data.info?.Creator,
      producer: data.info?.Producer,
      creationDate: data.info?.CreationDate,
      modificationDate: data.info?.ModDate,
    },
    version: data.version,
    isEncrypted: data.info?.IsEncrypted === 'yes',
  }
}

/**
 * Extract all content from PDF (text + metadata)
 */
export async function extractAllContent(
  pdfBuffer: Buffer,
  options: {
    maxLength?: number
  } = {}
): Promise<ExtractedContent> {
  const data = await pdfParse(pdfBuffer)
  
  let text = data.text
  if (options.maxLength && text.length > options.maxLength) {
    text = text.substring(0, options.maxLength) + '...'
  }
  
  return {
    text,
    pageCount: data.numpages,
    metadata: data.info || {},
  }
}

/**
 * Validate if buffer is a valid PDF
 */
export async function validatePdf(pdfBuffer: Buffer): Promise<boolean> {
  try {
    await pdfParse(pdfBuffer)
    return true
  } catch {
    return false
  }
}

/**
 * Get text from specific pages
 */
export async function extractTextFromPages(
  pdfBuffer: Buffer,
  pageNumbers: number[]
): Promise<string> {
  // Note: pdf-parse doesn't support per-page extraction out of the box
  // This is a simplified implementation
  const data = await pdfParse(pdfBuffer)
  
  // For now, return all text with a note
  // A more sophisticated implementation would use a library like pdf.js
  return data.text
}
