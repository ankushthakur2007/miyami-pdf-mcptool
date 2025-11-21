# PDF SaaS MCP Server - Quick Test Guide

## Pre-Testing Checklist

- [ ] PDF SaaS platform running (`npm run dev` in main directory)
- [ ] Account created and logged in
- [ ] API key generated from dashboard
- [ ] MCP server dependencies installed (`npm install`)
- [ ] MCP server built successfully (`npm run build`)
- [ ] `.env` file created with API key

## Test Scenarios

### 1. Test Basic Setup

**Verify the build:**
```bash
cd mcp-server
npm run build
```

**Expected output:**
```
> @pdf-saas/mcp-server@1.0.0 build
> tsc && chmod +x dist/index.js
```

**Check compiled files:**
```bash
ls -la dist/
```

**Expected files:**
- `index.js`
- `api-client.js`
- `schemas.js`
- Corresponding `.d.ts` and `.js.map` files

### 2. Test API Client Connection

Create `test-api.js`:

```javascript
import { createApiClient } from './dist/api-client.js'

async function test() {
  try {
    const client = createApiClient()
    console.log('✅ API client created')
    
    // Test list PDFs
    const response = await client.listPdfs(1, 5)
    if (response.success) {
      console.log('✅ API connection successful')
      console.log('Response:', JSON.stringify(response.data, null, 2))
    } else {
      console.log('❌ API error:', response.error)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

test()
```

Run:
```bash
node test-api.js
```

### 3. Configure Claude Desktop

**macOS Config Path:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows Config Path:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Config Content:**
```json
{
  "mcpServers": {
    "pdf-saas": {
      "command": "node",
      "args": ["/Users/ankushthakur/developer/pdf-saas/mcp-server/dist/index.js"],
      "env": {
        "PDF_API_BASE_URL": "http://localhost:3000",
        "PDF_API_KEY": "sk_live_your_actual_key_here"
      }
    }
  }
}
```

**⚠️ Replace the path and API key with your actual values!**

### 4. Test in Claude Desktop

**Restart Claude Desktop** after updating config.

**Test 1: Generate PDF from HTML**
```
Can you create a PDF from this HTML:
<h1>Test Document</h1>
<p>This is a test PDF generated via MCP.</p>
<p>Date: November 18, 2025</p>
```

**Expected Result:**
- Claude uses `generate-pdf-from-html` tool
- Returns PDF URL and metadata
- No errors

**Test 2: Generate PDF from Markdown**
```
Generate a PDF from this markdown:
# Meeting Notes
## Attendees
- Alice
- Bob
- Charlie

## Action Items
1. Review proposal
2. Schedule follow-up
```

**Expected Result:**
- Claude uses `generate-pdf-from-markdown` tool
- Markdown converted to styled PDF
- Returns download URL

**Test 3: Convert Web Page**
```
Convert https://example.com to PDF
```

**Expected Result:**
- Claude uses `generate-pdf-from-url` tool
- Web page rendered and converted
- Returns PDF with full page content

**Test 4: List PDFs**
```
Show me my recent PDFs
```

**Expected Result:**
- Claude uses `list-pdfs` tool
- Displays list of PDFs with metadata
- Shows filenames, sizes, dates

**Test 5: Extract Text** (requires existing PDF)
```
Extract text from this PDF: [paste PDF URL from previous test]
```

**Expected Result:**
- Claude uses `extract-text` tool
- Returns extracted text content
- Handles pagination correctly

### 5. Advanced Tests

**Test Merge PDFs:**
```
Merge these two PDFs into one:
1. [URL from test 1]
2. [URL from test 2]
```

**Test Extract Pages:**
```
Extract pages 1 and 3 from this PDF: [URL]
```

**Test Add Watermark:**
```
Add a "DRAFT" watermark to this PDF: [URL]
Make it semi-transparent and diagonal
```

**Test Rotate Pages:**
```
Rotate page 1 by 90 degrees in this PDF: [URL]
```

## Troubleshooting

### Issue: MCP Server Not Visible in Claude

**Check Claude Desktop Logs:**
- macOS: `~/Library/Logs/Claude/mcp*.log`
- Windows: `%APPDATA%\Claude\logs\`

**Common Fixes:**
1. Verify absolute path in config
2. Check Node.js version (18+)
3. Rebuild: `npm run build`
4. Check file permissions: `chmod +x dist/index.js`

### Issue: API Key Errors

**Symptoms:**
```
Error: PDF_API_KEY environment variable is required
```

**Fixes:**
1. Verify API key in Claude config
2. Check API key is active in dashboard
3. Ensure PDF SaaS platform is running

### Issue: Connection Timeouts

**Symptoms:**
```
Error: Request timeout
```

**Fixes:**
1. Increase timeout in config:
   ```json
   "env": {
     "PDF_API_TIMEOUT": "180000"
   }
   ```
2. Check network connectivity
3. Verify platform is running on correct port

### Issue: Build Errors

**Symptoms:**
```
Cannot find module 'node-fetch'
```

**Fix:**
```bash
npm install
npm run build
```

### Issue: Rate Limiting

**Symptoms:**
```
Error: Rate limit exceeded
```

**Fixes:**
1. Wait for rate limit reset
2. Increase limit in dashboard (API Keys page)
3. Use different API key

## Success Criteria

✅ All 11 MCP tools visible in Claude
✅ Can generate PDF from HTML
✅ Can generate PDF from Markdown
✅ Can generate PDF from text
✅ Can convert URL to PDF
✅ Can list user PDFs
✅ Can extract text from PDF
✅ Proper error handling
✅ API authentication working
✅ Rate limiting respected

## Performance Benchmarks

| Operation | Expected Time | Notes |
|-----------|---------------|-------|
| HTML to PDF | 2-5 seconds | Small documents |
| Markdown to PDF | 2-5 seconds | Includes conversion |
| Text to PDF | 1-3 seconds | Fastest |
| URL to PDF | 5-15 seconds | Depends on page size |
| Merge PDFs | 3-8 seconds | 2-5 PDFs |
| Extract Text | 2-4 seconds | Small documents |
| Add Watermark | 3-6 seconds | All pages |
| List PDFs | 1-2 seconds | Database query |

## Next Steps After Testing

1. **Test with Real Content**: Try complex HTML, large Markdown files
2. **Test Error Cases**: Invalid URLs, malformed HTML, missing files
3. **Test Rate Limits**: Generate many PDFs quickly
4. **Test Concurrent Requests**: Multiple tools at once
5. **Monitor Performance**: Check dashboard analytics
6. **Test Cleanup**: Verify PDFs stored correctly in Supabase Storage

## Support

If tests fail:
1. Check main [README.md](README.md) for setup
2. Verify PDF SaaS platform is working standalone
3. Test API endpoints directly with curl
4. Review Claude Desktop MCP logs
5. Check Node.js and npm versions
