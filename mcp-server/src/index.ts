#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js'
import { createApiClient } from './api-client.js'
import {
  GeneratePdfFromHtmlSchema,
  GeneratePdfFromMarkdownSchema,
  GeneratePdfFromTextSchema,
  GeneratePdfFromUrlSchema,
  MergePdfsSchema,
  ExtractPagesSchema,
  RotatePagesSchema,
  AddWatermarkSchema,
  ExtractTextSchema,
  GetPdfInfoSchema,
  ListPdfsSchema,
} from './schemas.js'

// Initialize API client
const apiClient = createApiClient()

// Define MCP Tools
const tools: Tool[] = [
  {
    name: 'generate-pdf-from-html',
    description: 'Generate a PDF from HTML content with custom styling and layout options',
    inputSchema: {
      type: 'object',
      properties: {
        html: {
          type: 'string',
          description: 'HTML content to convert to PDF',
        },
        options: {
          type: 'object',
          description: 'PDF generation options',
          properties: {
            format: {
              type: 'string',
              enum: ['A4', 'Letter', 'Legal'],
              default: 'A4',
              description: 'Page format',
            },
            filename: {
              type: 'string',
              description: 'Output filename (optional)',
            },
            margin: {
              type: 'object',
              description: 'Page margins',
              properties: {
                top: { type: 'string', default: '20mm' },
                right: { type: 'string', default: '20mm' },
                bottom: { type: 'string', default: '20mm' },
                left: { type: 'string', default: '20mm' },
              },
            },
            landscape: {
              type: 'boolean',
              default: false,
              description: 'Landscape orientation',
            },
            header: {
              type: 'string',
              description: 'Header text (optional)',
            },
            footer: {
              type: 'string',
              description: 'Footer text (optional)',
            },
          },
        },
      },
      required: ['html'],
    },
  },
  {
    name: 'generate-pdf-from-markdown',
    description: 'Generate a PDF from Markdown content - automatically converts to styled HTML',
    inputSchema: {
      type: 'object',
      properties: {
        markdown: {
          type: 'string',
          description: 'Markdown content to convert to PDF',
        },
        options: {
          type: 'object',
          description: 'PDF generation options (same as HTML)',
          properties: {
            format: { type: 'string', enum: ['A4', 'Letter', 'Legal'], default: 'A4' },
            filename: { type: 'string' },
            margin: {
              type: 'object',
              properties: {
                top: { type: 'string', default: '20mm' },
                right: { type: 'string', default: '20mm' },
                bottom: { type: 'string', default: '20mm' },
                left: { type: 'string', default: '20mm' },
              },
            },
            landscape: { type: 'boolean', default: false },
            header: { type: 'string' },
            footer: { type: 'string' },
          },
        },
      },
      required: ['markdown'],
    },
  },
  {
    name: 'generate-pdf-from-text',
    description: 'Generate a PDF from plain text content with basic formatting',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Plain text content to convert to PDF',
        },
        options: {
          type: 'object',
          description: 'PDF generation options',
          properties: {
            format: { type: 'string', enum: ['A4', 'Letter', 'Legal'], default: 'A4' },
            filename: { type: 'string' },
            margin: {
              type: 'object',
              properties: {
                top: { type: 'string', default: '20mm' },
                right: { type: 'string', default: '20mm' },
                bottom: { type: 'string', default: '20mm' },
                left: { type: 'string', default: '20mm' },
              },
            },
            landscape: { type: 'boolean', default: false },
            header: { type: 'string' },
            footer: { type: 'string' },
          },
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'generate-pdf-from-url',
    description: 'Generate a PDF by rendering any web page URL - perfect for converting websites to PDFs',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL of the webpage to convert to PDF',
        },
        format: {
          type: 'string',
          enum: ['A4', 'Letter', 'Legal'],
          default: 'A4',
          description: 'Page format',
        },
        filename: {
          type: 'string',
          description: 'Output filename (optional)',
        },
        wait_for: {
          type: 'string',
          description: 'Wait condition: networkidle0, networkidle2, load, domcontentloaded',
        },
        full_page: {
          type: 'boolean',
          default: true,
          description: 'Capture full page or just viewport',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'merge-pdfs',
    description: 'Merge multiple PDFs into a single PDF file',
    inputSchema: {
      type: 'object',
      properties: {
        pdf_urls: {
          type: 'array',
          description: 'Array of PDF URLs to merge (2-10 PDFs)',
          items: { type: 'string' },
          minItems: 2,
          maxItems: 10,
        },
        filename: {
          type: 'string',
          description: 'Output filename (optional)',
        },
      },
      required: ['pdf_urls'],
    },
  },
  {
    name: 'extract-pages',
    description: 'Extract specific pages from a PDF to create a new PDF',
    inputSchema: {
      type: 'object',
      properties: {
        pdf_url: {
          type: 'string',
          description: 'URL of the source PDF',
        },
        pages: {
          type: 'array',
          description: 'Page numbers to extract (1-indexed)',
          items: { type: 'number' },
          minItems: 1,
        },
        filename: {
          type: 'string',
          description: 'Output filename (optional)',
        },
      },
      required: ['pdf_url', 'pages'],
    },
  },
  {
    name: 'rotate-pages',
    description: 'Rotate specific pages in a PDF by 90, 180, or 270 degrees',
    inputSchema: {
      type: 'object',
      properties: {
        pdf_url: {
          type: 'string',
          description: 'URL of the source PDF',
        },
        pages: {
          type: 'array',
          description: 'Page numbers to rotate (1-indexed)',
          items: { type: 'number' },
          minItems: 1,
        },
        angle: {
          type: 'number',
          enum: [90, 180, 270],
          description: 'Rotation angle in degrees',
        },
        filename: {
          type: 'string',
          description: 'Output filename (optional)',
        },
      },
      required: ['pdf_url', 'pages', 'angle'],
    },
  },
  {
    name: 'add-watermark',
    description: 'Add a text watermark to all pages of a PDF',
    inputSchema: {
      type: 'object',
      properties: {
        pdf_url: {
          type: 'string',
          description: 'URL of the source PDF',
        },
        watermark_text: {
          type: 'string',
          description: 'Text to use as watermark',
        },
        position: {
          type: 'string',
          enum: ['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right'],
          default: 'center',
          description: 'Watermark position',
        },
        opacity: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          default: 0.3,
          description: 'Watermark opacity (0-1)',
        },
        rotation: {
          type: 'number',
          minimum: -90,
          maximum: 90,
          default: 0,
          description: 'Watermark rotation in degrees',
        },
        font_size: {
          type: 'number',
          minimum: 8,
          maximum: 72,
          default: 48,
          description: 'Font size in points',
        },
        filename: {
          type: 'string',
          description: 'Output filename (optional)',
        },
      },
      required: ['pdf_url', 'watermark_text'],
    },
  },
  {
    name: 'extract-text',
    description: 'Extract text content from a PDF for analysis or processing',
    inputSchema: {
      type: 'object',
      properties: {
        pdf_url: {
          type: 'string',
          description: 'URL of the source PDF',
        },
        pages: {
          type: 'array',
          description: 'Specific page numbers to extract (optional, defaults to all)',
          items: { type: 'number' },
        },
        max_length: {
          type: 'number',
          default: 10000,
          description: 'Maximum text length to return',
        },
      },
      required: ['pdf_url'],
    },
  },
  {
    name: 'get-pdf-info',
    description: 'Get detailed metadata and information about a PDF (page count, size, format, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        pdf_url: {
          type: 'string',
          description: 'URL of the PDF to analyze',
        },
      },
      required: ['pdf_url'],
    },
  },
  {
    name: 'list-pdfs',
    description: 'List all PDFs created by the authenticated user with pagination',
    inputSchema: {
      type: 'object',
      properties: {
        page: {
          type: 'number',
          minimum: 1,
          default: 1,
          description: 'Page number for pagination',
        },
        limit: {
          type: 'number',
          minimum: 1,
          maximum: 100,
          default: 20,
          description: 'Number of results per page',
        },
      },
    },
  },
]

// Create MCP Server
const server = new Server(
  {
    name: 'pdf-saas-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

// List Tools Handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools }
})

// Call Tool Handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      case 'generate-pdf-from-html': {
        const validated = GeneratePdfFromHtmlSchema.parse(args)
        const response = await apiClient.generatePdf(validated)
        
        if (!response.success) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${response.error}${response.details ? '\n\nDetails: ' + JSON.stringify(response.details, null, 2) : ''}`,
              },
            ],
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: `✅ PDF generated successfully!\n\nFilename: ${response.data.pdf.filename}\nURL: ${response.data.pdf.url}\nSize: ${(response.data.pdf.size / 1024).toFixed(2)} KB\nFormat: ${response.data.pdf.format}\n\nYou can download the PDF from the URL above.`,
            },
          ],
        }
      }

      case 'generate-pdf-from-markdown': {
        const validated = GeneratePdfFromMarkdownSchema.parse(args)
        const response = await apiClient.generatePdf(validated)
        
        if (!response.success) {
          return {
            content: [{ type: 'text', text: `Error: ${response.error}` }],
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: `✅ PDF generated from Markdown!\n\nFilename: ${response.data.pdf.filename}\nURL: ${response.data.pdf.url}\nSize: ${(response.data.pdf.size / 1024).toFixed(2)} KB\nFormat: ${response.data.pdf.format}`,
            },
          ],
        }
      }

      case 'generate-pdf-from-text': {
        const validated = GeneratePdfFromTextSchema.parse(args)
        const response = await apiClient.generatePdf(validated)
        
        if (!response.success) {
          return {
            content: [{ type: 'text', text: `Error: ${response.error}` }],
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: `✅ PDF generated from text!\n\nFilename: ${response.data.pdf.filename}\nURL: ${response.data.pdf.url}\nSize: ${(response.data.pdf.size / 1024).toFixed(2)} KB\nFormat: ${response.data.pdf.format}`,
            },
          ],
        }
      }

      case 'generate-pdf-from-url': {
        const validated = GeneratePdfFromUrlSchema.parse(args)
        const response = await apiClient.generatePdfFromUrl(validated)
        
        if (!response.success) {
          return {
            content: [{ type: 'text', text: `Error: ${response.error}` }],
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: `✅ PDF generated from URL!\n\nSource: ${validated.url}\nFilename: ${response.data.pdf.filename}\nURL: ${response.data.pdf.url}\nSize: ${(response.data.pdf.size / 1024).toFixed(2)} KB\nFormat: ${response.data.pdf.format}`,
            },
          ],
        }
      }

      case 'merge-pdfs': {
        const validated = MergePdfsSchema.parse(args)
        const response = await apiClient.mergePdfs({ pdf_sources: validated.pdf_urls, filename: validated.filename })
        
        if (!response.success) {
          return {
            content: [{ type: 'text', text: `Error: ${response.error}` }],
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: `✅ PDFs merged successfully!\n\nMerged ${validated.pdf_urls.length} PDFs\nFilename: ${response.data.pdf.filename}\nURL: ${response.data.pdf.url}\nSize: ${(response.data.pdf.size / 1024).toFixed(2)} KB`,
            },
          ],
        }
      }

      case 'extract-pages': {
        const validated = ExtractPagesSchema.parse(args)
        const response = await apiClient.modifyPdf({
          pdf_source: validated.pdf_url,
          operations: [{
            action: 'extract',
            pages: validated.pages,
          }],
          filename: validated.filename,
        })
        
        if (!response.success) {
          return {
            content: [{ type: 'text', text: `Error: ${response.error}` }],
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: `✅ Pages extracted successfully!\n\nExtracted ${validated.pages.length} pages: ${validated.pages.join(', ')}\nFilename: ${response.data.pdf.filename}\nURL: ${response.data.pdf.url}\nSize: ${(response.data.pdf.size / 1024).toFixed(2)} KB`,
            },
          ],
        }
      }

      case 'rotate-pages': {
        const validated = RotatePagesSchema.parse(args)
        const response = await apiClient.modifyPdf({
          pdf_source: validated.pdf_url,
          operations: [{
            action: 'rotate',
            pages: validated.pages,
            angle: validated.angle,
          }],
          filename: validated.filename,
        })
        
        if (!response.success) {
          return {
            content: [{ type: 'text', text: `Error: ${response.error}` }],
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: `✅ Pages rotated successfully!\n\nRotated ${validated.pages.length} pages by ${validated.angle}°\nPages: ${validated.pages.join(', ')}\nFilename: ${response.data.pdf.filename}\nURL: ${response.data.pdf.url}`,
            },
          ],
        }
      }

      case 'add-watermark': {
        const validated = AddWatermarkSchema.parse(args)
        const response = await apiClient.watermarkPdf({
          pdf_source: validated.pdf_url,
          watermark_text: validated.watermark_text,
          position: validated.position,
          opacity: validated.opacity,
          rotation: validated.rotation,
          font_size: validated.font_size,
          filename: validated.filename,
        })
        
        if (!response.success) {
          return {
            content: [{ type: 'text', text: `Error: ${response.error}` }],
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: `✅ Watermark added successfully!\n\nWatermark: "${validated.watermark_text}"\nPosition: ${validated.position}\nOpacity: ${validated.opacity}\nFilename: ${response.data.pdf.filename}\nURL: ${response.data.pdf.url}`,
            },
          ],
        }
      }

      case 'extract-text': {
        const validated = ExtractTextSchema.parse(args)
        const response = await apiClient.extractContent({
          pdf_source: validated.pdf_url,
          extract_type: 'text',
          pages: validated.pages,
          max_length: validated.max_length,
        })
        
        if (!response.success) {
          return {
            content: [{ type: 'text', text: `Error: ${response.error}` }],
          }
        }

        const textContent = response.data.content?.text || response.data.text || 'No text extracted'
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Text extracted successfully!\n\n${validated.pages ? `Pages: ${validated.pages.join(', ')}\n` : 'All pages\n'}\nExtracted Text:\n\n${textContent.substring(0, validated.max_length)}${textContent.length > validated.max_length ? '\n\n...(truncated)' : ''}`,
            },
          ],
        }
      }

      case 'get-pdf-info': {
        const validated = GetPdfInfoSchema.parse(args)
        // Extract PDF ID from URL or use URL directly
        const response = await apiClient.getPdfInfo(validated.pdf_url)
        
        if (!response.success) {
          return {
            content: [{ type: 'text', text: `Error: ${response.error}` }],
          }
        }

        const info = response.data.pdf || response.data
        return {
          content: [
            {
              type: 'text',
              text: `📄 PDF Information:\n\nFilename: ${info.filename || 'N/A'}\nFormat: ${info.format || 'N/A'}\nSize: ${info.file_size ? (info.file_size / 1024).toFixed(2) + ' KB' : 'N/A'}\nPages: ${info.page_count || 'N/A'}\nCreated: ${info.created_at || 'N/A'}\nSource Type: ${info.source_type || 'N/A'}\nURL: ${info.public_url || info.url || 'N/A'}`,
            },
          ],
        }
      }

      case 'list-pdfs': {
        const validated = ListPdfsSchema.parse(args)
        const response = await apiClient.listPdfs(validated.page, validated.limit)
        
        if (!response.success) {
          return {
            content: [{ type: 'text', text: `Error: ${response.error}` }],
          }
        }

        const pdfs = response.data.pdfs || response.data.api_keys || []
        if (pdfs.length === 0) {
          return {
            content: [{ type: 'text', text: '📋 No PDFs found. Generate your first PDF!' }],
          }
        }

        const pdfList = pdfs.map((pdf: any, index: number) => 
          `${index + 1}. ${pdf.filename || pdf.name}\n   Size: ${pdf.file_size ? (pdf.file_size / 1024).toFixed(2) + ' KB' : 'N/A'}\n   Created: ${pdf.created_at}\n   URL: ${pdf.public_url || pdf.url || 'N/A'}`
        ).join('\n\n')

        return {
          content: [
            {
              type: 'text',
              text: `📋 Your PDFs (Page ${validated.page}):\n\n${pdfList}`,
            },
          ],
        }
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        }
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        },
      ],
      isError: true,
    }
  }
})

// Start server
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('PDF SaaS MCP Server running on stdio')
}

main().catch((error) => {
  console.error('Fatal error in main():', error)
  process.exit(1)
})
