# Miyami PDF Tool - MCP Server

[![npm version](https://img.shields.io/npm/v/@ankush_thxkur/miyami-pdf-tool-mcp-server)](https://www.npmjs.com/package/@ankush_thxkur/miyami-pdf-tool-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Advanced PDF generation and manipulation server for Claude Desktop using the Model Context Protocol (MCP).

## 📦 Installation

### NPM (Recommended)

The easiest way to use this MCP server:

```bash
# No installation required - use with npx
npx @ankush_thxkur/miyami-pdf-tool-mcp-server

# Or install globally
npm install -g @ankush_thxkur/miyami-pdf-tool-mcp-server
pdf-mcp-server
```

### From Source

Clone and build from source:

```bash
git clone https://github.com/ankushthakur2007/miyami-pdf-mcptool.git
cd miyami-pdf-mcptool/mcp-server
npm install
npm run build
npm start
```

## Features

### 🎨 PDF Generation
- **HTML to PDF**: Convert rich HTML with CSS styling
- **Markdown to PDF**: Automatic conversion with beautiful formatting
- **Text to PDF**: Plain text with customizable layout
- **URL to PDF**: Convert any webpage to PDF

### 🔧 PDF Manipulation
- **Merge PDFs**: Combine multiple PDFs into one
- **Extract Pages**: Pull specific pages from a PDF
- **Rotate Pages**: Rotate pages by 90°, 180°, or 270°
- **Add Watermarks**: Text watermarks with position, opacity, rotation

### 📊 PDF Analysis
- **Extract Text**: Pull text content for processing
- **Get Info**: Metadata, page count, size, format
- **List PDFs**: View all your generated PDFs

## Quick Start

### 1. Setup API Credentials

You need an API key from Miyami PDF Tool:
1. Sign up at your deployed instance
2. Navigate to Dashboard → API Keys
3. Create a new API key
4. Save the key securely

### 2. Configure Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

**Using NPM (Recommended):**
```json
{
  "mcpServers": {
    "miyami-pdf": {
      "command": "npx",
      "args": [
        "@ankush_thxkur/miyami-pdf-tool-mcp-server"
      ],
      "env": {
        "API_KEY": "your-api-key-here",
        "API_BASE_URL": "https://your-deployment-url.com/api"
      }
    }
  }
}
```

**Using Local Installation:**
```json
{
  "mcpServers": {
    "miyami-pdf": {
      "command": "node",
      "args": [
        "/path/to/miyami-pdf-mcptool/mcp-server/dist/index.js"
      ],
      "env": {
        "API_KEY": "your-api-key-here",
        "API_BASE_URL": "http://localhost:3000/api"
      }
    }
  }
}
```

### 3. Restart Claude Desktop

Quit and reopen Claude Desktop to load the MCP server.

### 2. Install Dependencies

```bash
cd mcp-server
npm install
```

### 3. Configure Environment

Create `.env` file:

```bash
PDF_API_BASE_URL=http://localhost:3000
PDF_API_KEY=sk_live_your_api_key_here
PDF_API_TIMEOUT=120000
```

**Get your API key:**
1. Run the PDF SaaS platform: `cd .. && npm run dev`
2. Sign up/login at http://localhost:3000
3. Go to Dashboard → API Keys
4. Create a new key and copy it

### 4. Build the Server

```bash
npm run build
```

### 5. Configure Claude Desktop

Edit your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add this configuration:

```json
{
  "mcpServers": {
    "pdf-saas": {
      "command": "node",
      "args": ["/absolute/path/to/pdf-saas/mcp-server/dist/index.js"],
      "env": {
        "PDF_API_BASE_URL": "http://localhost:3000",
        "PDF_API_KEY": "sk_live_your_api_key_here"
      }
    }
  }
}
```

**Replace `/absolute/path/to/pdf-saas/` with your actual path!**

### 6. Restart Claude Desktop

Quit and reopen Claude Desktop. The PDF tools will now be available!

## Usage Examples

### Generate PDF from HTML

```
Can you create a PDF from this HTML:
<h1>Invoice</h1>
<p>Invoice #12345</p>
<table>
  <tr><th>Item</th><th>Price</th></tr>
  <tr><td>Service</td><td>$100</td></tr>
</table>
```

### Generate PDF from Markdown

```
Generate a PDF from this markdown:
# Project Report
## Summary
This is the summary...
```

### Convert Webpage to PDF

```
Convert https://example.com to PDF
```

### Merge Multiple PDFs

```
Merge these PDFs into one:
- https://example.com/doc1.pdf
- https://example.com/doc2.pdf
- https://example.com/doc3.pdf
```

### Extract Specific Pages

```
Extract pages 1, 3, and 5 from this PDF:
https://example.com/document.pdf
```

### Add Watermark

```
Add a "CONFIDENTIAL" watermark to this PDF:
https://example.com/document.pdf
Position: center, opacity 0.3, rotation 45 degrees
```

### Extract Text

```
Extract all text from this PDF:
https://example.com/document.pdf
```

## Available Tools

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `generate-pdf-from-html` | Convert HTML to PDF | html, options (format, margins, header/footer) |
| `generate-pdf-from-markdown` | Convert Markdown to PDF | markdown, options |
| `generate-pdf-from-text` | Convert text to PDF | text, options |
| `generate-pdf-from-url` | Web page to PDF | url, format, wait_for, full_page |
| `merge-pdfs` | Combine PDFs | pdf_urls (2-10 PDFs) |
| `extract-pages` | Pull specific pages | pdf_url, pages (array) |
| `rotate-pages` | Rotate pages | pdf_url, pages, angle (90/180/270) |
| `add-watermark` | Add text watermark | pdf_url, text, position, opacity, rotation |
| `extract-text` | Extract text content | pdf_url, pages (optional), max_length |
| `get-pdf-info` | Get PDF metadata | pdf_url |
| `list-pdfs` | List your PDFs | page, limit |

## Configuration Options

### PDF Generation Options

```typescript
{
  format: 'A4' | 'Letter' | 'Legal',  // Default: A4
  filename: 'output.pdf',              // Optional custom name
  margin: {
    top: '20mm',
    right: '20mm',
    bottom: '20mm',
    left: '20mm'
  },
  landscape: false,                    // Portrait by default
  header: 'Header text',               // Optional
  footer: 'Page {page} of {pages}'     // Optional, supports placeholders
}
```

### Watermark Options

```typescript
{
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
  opacity: 0.3,        // 0-1, default 0.3
  rotation: 45,        // -90 to 90, default 0
  font_size: 48        // 8-72, default 48
}
```

## Troubleshooting

### MCP Server Not Appearing in Claude

1. **Check config path**: Ensure the path in `claude_desktop_config.json` is absolute
2. **Verify build**: Run `npm run build` in mcp-server directory
3. **Check logs**: Look at Claude Desktop logs (Help → View Logs)
4. **Restart Claude**: Fully quit and reopen

### API Connection Errors

```
Error: PDF_API_KEY environment variable is required
```

**Solution**: Add `PDF_API_KEY` to your `.env` file or Claude config

```
Error: Request timeout
```

**Solution**: Increase `PDF_API_TIMEOUT` in environment (default 120 seconds)

```
Error: Unauthorized - Please provide a valid API key
```

**Solution**: 
1. Verify API key is correct
2. Check key is active in dashboard
3. Ensure PDF SaaS platform is running

### PDF Generation Errors

```
Error: Failed to generate PDF
```

**Common causes**:
- Invalid HTML/Markdown syntax
- Extremely large content (>50MB)
- Network timeout for URL conversion
- Insufficient disk space

**Solutions**:
1. Validate HTML/Markdown before submission
2. Split large documents into smaller parts
3. Increase timeout for complex web pages
4. Check disk space

### Rate Limiting

```
Error: Rate limit exceeded
```

**Solution**: 
- Wait for rate limit to reset (shown in error)
- Increase rate limit in dashboard (API Keys page)
- Use different API key

## Development

### Run in Development Mode

```bash
npm run dev
```

This watches for file changes and recompiles automatically.

### Test the Server

```bash
# Build first
npm run build

# Test directly
npm run test
```

### Project Structure

```
mcp-server/
├── src/
│   ├── index.ts          # Main MCP server
│   ├── api-client.ts     # API client for Next.js endpoints
│   └── schemas.ts        # Zod validation schemas
├── dist/                 # Compiled output
├── package.json
├── tsconfig.json
└── .env.example
```

## Security

- ✅ API key authentication required
- ✅ Rate limiting enforced
- ✅ Input validation with Zod
- ✅ Timeout protection
- ✅ Error sanitization

**Best Practices**:
- Never commit `.env` file
- Use different API keys for dev/prod
- Rotate API keys regularly
- Monitor usage in dashboard
- Set appropriate rate limits

## Performance Tips

1. **Batch Operations**: Merge multiple PDFs instead of generating separately
2. **Cache Results**: Reuse generated PDFs when possible
3. **Optimize Content**: Minimize HTML/CSS for faster rendering
4. **Use Templates**: Create reusable templates for common formats
5. **Parallel Requests**: Generate multiple PDFs concurrently (respects rate limits)

## API Endpoints Used

| MCP Tool | API Endpoint | Method |
|----------|--------------|--------|
| generate-pdf-* | `/api/pdf/generate` | POST |
| generate-pdf-from-url | `/api/pdf/generate-from-url` | POST |
| merge-pdfs | `/api/pdf/merge` | POST |
| extract-pages, rotate-pages | `/api/pdf/modify` | POST |
| add-watermark | `/api/pdf/watermark` | POST |
| extract-text | `/api/pdf/extract` | POST |
| get-pdf-info | `/api/pdf/{id}` | GET |
| list-pdfs | `/api/pdf/list` | GET |

**Note**: Some endpoints need to be implemented in the Next.js app (merge, modify, watermark, extract, single PDF info).

## Contributing

We welcome contributions! Areas for improvement:
- Additional PDF operations (compress, OCR, form filling)
- Template system integration
- Batch processing utilities
- Enhanced error messages
- Performance optimizations

## Support

- 📚 Documentation: See main [README.md](../README.md)
- 🐛 Issues: Report bugs in GitHub issues
- 💬 Questions: Check [PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md)

## License

MIT License - See main project for details

---

**Made with ❤️ for Claude Desktop and the MCP ecosystem**
