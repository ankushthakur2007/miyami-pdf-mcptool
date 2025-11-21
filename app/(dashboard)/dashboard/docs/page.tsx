import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DocsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
        <p className="text-gray-600 mt-1">
          Learn how to integrate PDF generation into your application
        </p>
      </div>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>All API requests require an API key</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-700">
            Include your API key in the <code className="bg-gray-100 px-2 py-1 rounded">x-api-key</code> header:
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`curl -X POST https://your-domain.com/api/pdf/generate \\
  -H "x-api-key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{"html": "<h1>Hello World</h1>"}'`}
          </pre>
        </CardContent>
      </Card>

      {/* Generate PDF from HTML */}
      <Card>
        <CardHeader>
          <CardTitle>Generate PDF from HTML/Markdown/Text</CardTitle>
          <CardDescription>POST /api/pdf/generate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-700">
            Generate a PDF from HTML, Markdown, or plain text content.
          </p>
          <div>
            <h4 className="font-semibold text-sm mb-2">Request Body:</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`{
  "html": "<h1>Your HTML content</h1>",
  // OR
  "markdown": "# Your Markdown\\n\\nContent here",
  // OR
  "text": "Your plain text content",
  
  "options": {
    "format": "A4",           // A4, Letter, or Legal
    "filename": "output.pdf",
    "margin": {
      "top": "20mm",
      "right": "20mm",
      "bottom": "20mm",
      "left": "20mm"
    },
    "landscape": false,
    "header": "Header text",
    "footer": "Footer text"
  }
}`}
            </pre>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Response:</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`{
  "message": "PDF generated successfully",
  "pdf": {
    "id": "uuid",
    "filename": "output.pdf",
    "url": "https://storage-url/path/to/pdf",
    "size": 12345,
    "format": "A4",
    "created_at": "2024-01-01T00:00:00Z"
  }
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Generate PDF from URL */}
      <Card>
        <CardHeader>
          <CardTitle>Generate PDF from URL</CardTitle>
          <CardDescription>POST /api/pdf/generate-from-url</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-700">
            Convert any webpage to a PDF.
          </p>
          <div>
            <h4 className="font-semibold text-sm mb-2">Request Body:</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`{
  "url": "https://example.com",
  "format": "A4",
  "filename": "webpage.pdf",
  "wait_for": "networkidle0",  // Wait for page load
  "full_page": true             // Capture entire page
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* List PDFs */}
      <Card>
        <CardHeader>
          <CardTitle>List PDFs</CardTitle>
          <CardDescription>GET /api/pdf/list</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-700">
            Retrieve a paginated list of your generated PDFs.
          </p>
          <div>
            <h4 className="font-semibold text-sm mb-2">Query Parameters:</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`?page=1&limit=20`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">
            Each API key has a configurable rate limit (default: 100 requests per hour).
            Rate limit information is included in response headers:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
            <li><code className="bg-gray-100 px-2 py-1 rounded">X-RateLimit-Remaining</code>: Requests remaining</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">X-RateLimit-Reset</code>: When the limit resets</li>
          </ul>
        </CardContent>
      </Card>

      {/* Error Responses */}
      <Card>
        <CardHeader>
          <CardTitle>Error Responses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-sm font-semibold">401 Unauthorized</p>
            <p className="text-xs text-gray-600">Invalid or missing API key</p>
          </div>
          <div>
            <p className="text-sm font-semibold">429 Too Many Requests</p>
            <p className="text-xs text-gray-600">Rate limit exceeded</p>
          </div>
          <div>
            <p className="text-sm font-semibold">400 Bad Request</p>
            <p className="text-xs text-gray-600">Invalid request parameters</p>
          </div>
          <div>
            <p className="text-sm font-semibold">500 Internal Server Error</p>
            <p className="text-xs text-gray-600">Server error occurred</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
