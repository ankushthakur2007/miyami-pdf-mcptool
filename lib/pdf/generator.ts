import puppeteer, { type PDFOptions, type Page } from 'puppeteer'
import { marked } from 'marked'
import { PDF_FORMATS, type PdfFormat } from '@/lib/constants'

export interface PdfGenerationOptions {
  format?: PdfFormat
  filename?: string
  margin?: {
    top?: string
    right?: string
    bottom?: string
    left?: string
  }
  header?: string
  footer?: string
  landscape?: boolean
}

export interface PdfGenerationResult {
  buffer: Buffer
  filename: string
  pageCount?: number
}

/**
 * Generate PDF from HTML content
 */
export async function generatePdfFromHtml(
  html: string,
  options: PdfGenerationOptions = {}
): Promise<PdfGenerationResult> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-extensions',
    ],
  })

  try {
    const page = await browser.newPage()
    
    // Set longer timeout for complex pages
    page.setDefaultNavigationTimeout(60000)
    page.setDefaultTimeout(60000)
    
    // Set content with a more lenient wait condition
    await page.setContent(html, {
      waitUntil: 'domcontentloaded', // Changed from 'networkidle0' for faster loading
      timeout: 60000,
    })

    // Wait a bit for any dynamic content to render
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate PDF
    const pdfOptions: PDFOptions = {
      format: options.format || 'A4',
      printBackground: true,
      landscape: options.landscape || false,
      margin: {
        top: options.margin?.top || '20mm',
        right: options.margin?.right || '20mm',
        bottom: options.margin?.bottom || '20mm',
        left: options.margin?.left || '20mm',
      },
      displayHeaderFooter: !!(options.header || options.footer),
      headerTemplate: options.header || '<div></div>',
      footerTemplate: options.footer || '<div></div>',
    }

    const buffer = await page.pdf(pdfOptions)

    return {
      buffer: Buffer.from(buffer),
      filename: options.filename || `pdf-${Date.now()}.pdf`,
    }
  } finally {
    await browser.close()
  }
}

/**
 * Generate PDF from Markdown content
 */
export async function generatePdfFromMarkdown(
  markdown: string,
  options: PdfGenerationOptions = {}
): Promise<PdfGenerationResult> {
  // Convert markdown to HTML
  const html = await marked(markdown, {
    gfm: true,
    breaks: true,
  })

  // Wrap in a styled HTML template
  const styledHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
          }
          h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
          h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
          code {
            background-color: #f6f8fa;
            border-radius: 3px;
            padding: 2px 6px;
            font-family: 'Courier New', monospace;
          }
          pre {
            background-color: #f6f8fa;
            border-radius: 6px;
            padding: 16px;
            overflow: auto;
          }
          pre code {
            background-color: transparent;
            padding: 0;
          }
          blockquote {
            border-left: 4px solid #dfe2e5;
            color: #6a737d;
            padding-left: 16px;
            margin: 0;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          table th, table td {
            border: 1px solid #dfe2e5;
            padding: 8px 12px;
          }
          table th {
            background-color: #f6f8fa;
            font-weight: 600;
          }
          img {
            max-width: 100%;
            height: auto;
          }
          a {
            color: #0366d6;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `

  return generatePdfFromHtml(styledHtml, options)
}

/**
 * Generate PDF from plain text
 */
export async function generatePdfFromText(
  text: string,
  options: PdfGenerationOptions = {}
): Promise<PdfGenerationResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Courier New', monospace;
            white-space: pre-wrap;
            word-wrap: break-word;
            padding: 20px;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>${text}</body>
    </html>
  `

  return generatePdfFromHtml(html, options)
}

/**
 * Generate PDF from a URL
 */
export async function generatePdfFromUrl(
  url: string,
  options: PdfGenerationOptions & {
    waitFor?: string
    fullPage?: boolean
  } = {}
): Promise<PdfGenerationResult> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  })

  try {
    const page = await browser.newPage()
    
    // Set longer timeout
    page.setDefaultNavigationTimeout(90000)
    page.setDefaultTimeout(90000)
    
    // Navigate to URL with more lenient wait condition
    await page.goto(url, {
      waitUntil: 'domcontentloaded', // Changed from 'networkidle0'
      timeout: 90000,
    })

    // Wait for specific selector if provided
    if (options.waitFor) {
      await page.waitForSelector(options.waitFor, { timeout: 30000 })
    } else {
      // Wait a bit for dynamic content
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    // Generate PDF
    const pdfOptions: PDFOptions = {
      format: options.format || 'A4',
      printBackground: true,
      landscape: options.landscape || false,
      margin: {
        top: options.margin?.top || '20mm',
        right: options.margin?.right || '20mm',
        bottom: options.margin?.bottom || '20mm',
        left: options.margin?.left || '20mm',
      },
    }

    const buffer = await page.pdf(pdfOptions)

    return {
      buffer: Buffer.from(buffer),
      filename: options.filename || `pdf-${Date.now()}.pdf`,
    }
  } finally {
    await browser.close()
  }
}

/**
 * Auto-detect content type and generate PDF
 */
export async function generatePdfAuto(
  content: string,
  contentType: 'auto' | 'html' | 'markdown' | 'text',
  options: PdfGenerationOptions = {}
): Promise<PdfGenerationResult> {
  let detectedType = contentType

  if (contentType === 'auto') {
    const trimmedContent = content.trim()
    if (trimmedContent.startsWith('<')) {
      detectedType = 'html'
    } else if (trimmedContent.includes('#') || trimmedContent.includes('**')) {
      detectedType = 'markdown'
    } else {
      detectedType = 'text'
    }
  }

  switch (detectedType) {
    case 'html':
      return generatePdfFromHtml(content, options)
    case 'markdown':
      return generatePdfFromMarkdown(content, options)
    case 'text':
      return generatePdfFromText(content, options)
    default:
      throw new Error(`Unsupported content type: ${detectedType}`)
  }
}
