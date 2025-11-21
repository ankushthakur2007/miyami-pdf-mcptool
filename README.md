# Miyami PDF Tool

A production-ready SaaS platform for generating PDFs from HTML, Markdown, text, and URLs with API key management, rate limiting, and cloud storage.

## Features

- 🔐 **Authentication**: Supabase Auth with email/password
- 🔑 **API Key Management**: Generate, manage, and revoke API keys
- 📄 **PDF Generation**: 
  - Convert HTML, Markdown, or plain text to PDF
  - Generate PDFs from URLs
  - Customizable formats (A4, Letter, Legal)
  - Margins, headers, footers, landscape mode
- 🚀 **PDF Operations**:
  - Merge multiple PDFs
  - Extract pages
  - Rotate pages
  - Add watermarks
  - Extract text content
- 📊 **Usage Analytics**: Track API usage and monitor rate limits
- ☁️ **Cloud Storage**: Supabase Storage for PDF files
- 🔒 **Security**: Row Level Security (RLS), HMAC-SHA256 API key hashing, Vault support
- ⚡ **Rate Limiting**: Configurable per-hour rate limits
- 🤖 **MCP Integration**: Model Context Protocol server for Claude Desktop

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **PDF Generation**: Puppeteer
- **PDF Manipulation**: pdf-lib
- **PDF Extraction**: pdf-parse
- **UI**: Tailwind CSS v4, shadcn/ui
- **Validation**: Zod

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account (create one at [supabase.com](https://supabase.com))

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned (takes 1-2 minutes)
3. Go to **Project Settings** → **API**
4. Copy your project URL and keys

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Generate a secure encryption secret for API key hashing
# Run: openssl rand -base64 32
API_KEY_ENCRYPTION_SECRET=your-generated-secret-here
```

**Generate encryption secret:**

```bash
openssl rand -base64 32
```

Copy the output and use it as `API_KEY_ENCRYPTION_SECRET` in your `.env.local` file.

> **Security Note**: API keys are hashed using HMAC-SHA256 with this secret. Never commit this secret to version control. See [ENCRYPTION_SETUP.md](./ENCRYPTION_SETUP.md) for details.

### 4. Apply Database Migrations

The database migrations have already been applied via MCP tools during setup. The following were created:

- **Tables**: `api_keys`, `pdfs`, `api_usage`, `pdf_templates`
- **Storage**: `pdfs` bucket with public access
- **Functions**: `get_usage_stats()`, `check_rate_limit()`
- **RLS Policies**: Row Level Security enabled on all tables

Verify by checking your Supabase dashboard → **Table Editor**.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 6. Create an Account

1. Navigate to [http://localhost:3000/signup](http://localhost:3000/signup)
2. Create a new account with your email and password
3. Check your email for the confirmation link
4. Sign in at [http://localhost:3000/login](http://localhost:3000/login)

### 7. Generate an API Key

1. Go to **Dashboard** → **API Keys**
2. Click **Create New Key**
3. Copy the API key (you won't see it again!)

## API Usage

### Generate PDF from HTML

```bash
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<h1>Hello World</h1>",
    "options": {"format": "A4"}
  }'
```

### Generate PDF from URL

```bash
curl -X POST http://localhost:3000/api/pdf/generate-from-url \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "format": "A4"
  }'
```

### List Your PDFs

```bash
curl -X GET http://localhost:3000/api/pdf/list?page=1&limit=20 \
  -H "x-api-key: your-api-key"
```

## Project Structure

```
pdf-saas/
├── app/
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Protected dashboard
│   └── api/                 # API routes
├── lib/
│   ├── supabase/            # Supabase clients
│   ├── pdf/                 # PDF generation/manipulation
│   ├── api/                 # API utilities
│   └── utils/               # Utility functions (crypto, validation)
├── components/ui/           # shadcn/ui components
├── supabase/migrations/     # Database migrations
├── ENCRYPTION_SETUP.md      # Detailed encryption setup guide
├── SETUP_GUIDE.md           # Quick start guide
└── PROJECT_SUMMARY.md       # Detailed project overview
```

## Security

### API Key Hashing

API keys are hashed using **HMAC-SHA256** with a secret encryption key before storage. This provides:

- Protection against rainbow table attacks
- Cryptographically strong one-way hashing
- Secret key isolation from database

**See [ENCRYPTION_SETUP.md](./ENCRYPTION_SETUP.md) for:**
- Detailed security architecture
- Vault integration guide (optional)
- Secret rotation procedures
- Production security checklist

## MCP Server for Claude Desktop

This platform includes a **Model Context Protocol (MCP) server** that enables Claude Desktop to generate and manipulate PDFs directly.

### Quick Setup

1. **Build the MCP server:**
   ```bash
   cd mcp-server
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Get your API key** from the dashboard (Dashboard → API Keys)

3. **Configure Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
   ```json
   {
     "mcpServers": {
       "pdf-saas": {
         "command": "node",
         "args": ["/absolute/path/to/pdf-saas/mcp-server/dist/index.js"],
         "env": {
           "PDF_API_BASE_URL": "http://localhost:3000",
           "PDF_API_KEY": "your-api-key-here"
         }
       }
     }
   }
   ```

4. **Restart Claude Desktop**

### Available MCP Tools

- `generate-pdf-from-html` - Convert HTML to PDF
- `generate-pdf-from-markdown` - Convert Markdown to PDF
- `generate-pdf-from-text` - Convert text to PDF
- `generate-pdf-from-url` - Convert web pages to PDF
- `merge-pdfs` - Combine multiple PDFs
- `extract-pages` - Pull specific pages
- `rotate-pages` - Rotate pages by angle
- `add-watermark` - Add text watermarks
- `extract-text` - Extract text content
- `get-pdf-info` - Get PDF metadata
- `list-pdfs` - List your PDFs

**See [mcp-server/README.md](./mcp-server/README.md) for detailed documentation.**

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

See the [documentation](http://localhost:3000/dashboard/docs) for more details.

## License

MIT
