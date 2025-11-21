import { PDFDocument, rgb, degrees } from 'pdf-lib'

export interface MergePdfOptions {
  order?: number[]
}

export interface ModifyPdfOperation {
  action: 'extract' | 'rotate' | 'delete'
  pages: number[]
  angle?: 90 | 180 | 270
}

export interface WatermarkOptions {
  text: string
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  opacity?: number
  rotation?: number
  fontSize?: number
}

/**
 * Merge multiple PDF buffers into one
 */
export async function mergePdfs(
  pdfBuffers: Buffer[],
  options: MergePdfOptions = {}
): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create()
  
  // Apply custom order if specified
  const order = options.order || pdfBuffers.map((_, i) => i)
  
  for (const index of order) {
    const pdfBuffer = pdfBuffers[index]
    const pdf = await PDFDocument.load(pdfBuffer)
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    copiedPages.forEach((page) => mergedPdf.addPage(page))
  }
  
  const mergedPdfBytes = await mergedPdf.save()
  return Buffer.from(mergedPdfBytes)
}

/**
 * Extract specific pages from a PDF
 */
export async function extractPages(
  pdfBuffer: Buffer,
  pageNumbers: number[]
): Promise<Buffer> {
  const pdf = await PDFDocument.load(pdfBuffer)
  const newPdf = await PDFDocument.create()
  
  // Convert to 0-indexed
  const indices = pageNumbers.map(n => n - 1)
  
  const copiedPages = await newPdf.copyPages(pdf, indices)
  copiedPages.forEach((page) => newPdf.addPage(page))
  
  const pdfBytes = await newPdf.save()
  return Buffer.from(pdfBytes)
}

/**
 * Rotate specific pages in a PDF
 */
export async function rotatePages(
  pdfBuffer: Buffer,
  pageNumbers: number[],
  angle: 90 | 180 | 270
): Promise<Buffer> {
  const pdf = await PDFDocument.load(pdfBuffer)
  
  for (const pageNum of pageNumbers) {
    const page = pdf.getPage(pageNum - 1) // Convert to 0-indexed
    const currentRotation = page.getRotation().angle
    page.setRotation(degrees(currentRotation + angle))
  }
  
  const pdfBytes = await pdf.save()
  return Buffer.from(pdfBytes)
}

/**
 * Delete specific pages from a PDF
 */
export async function deletePages(
  pdfBuffer: Buffer,
  pageNumbers: number[]
): Promise<Buffer> {
  const pdf = await PDFDocument.load(pdfBuffer)
  
  // Sort in descending order to avoid index shifting
  const sortedPages = [...pageNumbers].sort((a, b) => b - a)
  
  for (const pageNum of sortedPages) {
    pdf.removePage(pageNum - 1) // Convert to 0-indexed
  }
  
  const pdfBytes = await pdf.save()
  return Buffer.from(pdfBytes)
}

/**
 * Add text watermark to all pages
 */
export async function addWatermark(
  pdfBuffer: Buffer,
  options: WatermarkOptions
): Promise<Buffer> {
  const pdf = await PDFDocument.load(pdfBuffer)
  const pages = pdf.getPages()
  
  const {
    text,
    position = 'center',
    opacity = 0.3,
    rotation = 0,
    fontSize = 48
  } = options
  
  for (const page of pages) {
    const { width, height } = page.getSize()
    
    // Calculate position
    let x: number, y: number
    const textWidth = fontSize * text.length * 0.5 // Rough estimate
    
    switch (position) {
      case 'center':
        x = width / 2 - textWidth / 2
        y = height / 2
        break
      case 'top-left':
        x = 50
        y = height - 50
        break
      case 'top-right':
        x = width - textWidth - 50
        y = height - 50
        break
      case 'bottom-left':
        x = 50
        y = 50
        break
      case 'bottom-right':
        x = width - textWidth - 50
        y = 50
        break
      default:
        x = width / 2 - textWidth / 2
        y = height / 2
    }
    
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      color: rgb(0.5, 0.5, 0.5),
      opacity,
      rotate: degrees(rotation),
    })
  }
  
  const pdfBytes = await pdf.save()
  return Buffer.from(pdfBytes)
}

/**
 * Perform multiple operations on a PDF
 */
export async function modifyPdf(
  pdfBuffer: Buffer,
  operations: ModifyPdfOperation[]
): Promise<Buffer> {
  let currentBuffer = pdfBuffer
  
  for (const operation of operations) {
    switch (operation.action) {
      case 'extract':
        currentBuffer = await extractPages(currentBuffer, operation.pages)
        break
      case 'rotate':
        if (!operation.angle) {
          throw new Error('Rotation angle is required for rotate operation')
        }
        currentBuffer = await rotatePages(currentBuffer, operation.pages, operation.angle)
        break
      case 'delete':
        currentBuffer = await deletePages(currentBuffer, operation.pages)
        break
    }
  }
  
  return currentBuffer
}

/**
 * Get page count from PDF
 */
export async function getPageCount(pdfBuffer: Buffer): Promise<number> {
  const pdf = await PDFDocument.load(pdfBuffer)
  return pdf.getPageCount()
}

/**
 * Get PDF metadata
 */
export async function getPdfMetadata(pdfBuffer: Buffer): Promise<{
  title?: string
  author?: string
  subject?: string
  creator?: string
  producer?: string
  creationDate?: Date
  modificationDate?: Date
}> {
  const pdf = await PDFDocument.load(pdfBuffer)
  
  return {
    title: pdf.getTitle(),
    author: pdf.getAuthor(),
    subject: pdf.getSubject(),
    creator: pdf.getCreator(),
    producer: pdf.getProducer(),
    creationDate: pdf.getCreationDate(),
    modificationDate: pdf.getModificationDate(),
  }
}
