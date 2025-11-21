# Pre-Deployment Checklist for Render

Use this checklist before deploying to Render to ensure everything is configured correctly.

## ✅ Code Preparation

- [x] `Dockerfile` created with Puppeteer/Chromium support
- [x] `.dockerignore` configured to exclude unnecessary files
- [x] `render.yaml` blueprint file created
- [x] `next.config.ts` has `output: 'standalone'`
- [x] Health check endpoint created at `/api/health`
- [x] All code committed to Git
- [ ] All tests passing (if applicable)
- [ ] No hardcoded secrets in code

## ✅ Environment Variables

Collect these values BEFORE deployment:

### From Supabase Dashboard

Go to: Supabase Dashboard → Your Project → Settings → API

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - Example: `https://xxxxx.supabase.co`
  - Found in: API Settings → Project URL

- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Example: `eyJhbGc...` (long token)
  - Found in: API Settings → Project API keys → anon public

- [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - Example: `eyJhbGc...` (different from anon key)
  - Found in: API Settings → Project API keys → service_role
  - ⚠️ KEEP SECRET - never expose in client code

### Auto-Generated

- [ ] `API_KEY_ENCRYPTION_SECRET`
  - Render will generate this automatically
  - Or generate manually: `openssl rand -base64 32`

### Set After Deployment

- [ ] `NEXT_PUBLIC_APP_URL`
  - Will be: `https://your-app-name.onrender.com`
  - Update after first deployment

## ✅ Supabase Setup

### Database Tables

Verify these tables exist in Supabase:

- [ ] `api_keys` table with columns:
  - id, user_id, name, key_hash, key_prefix, rate_limit, created_at, last_used_at, total_requests

- [ ] `pdfs` table with columns:
  - id, user_id, api_key_id, title, storage_path, format, file_size, metadata, created_at

- [ ] `usage_logs` table with columns:
  - id, api_key_id, endpoint, created_at

### Storage

- [ ] Storage bucket `pdfs` created
- [ ] Bucket is PUBLIC (for file downloads)
- [ ] Storage policies allow authenticated uploads

### RLS Policies

Check Row Level Security is enabled:

- [ ] `api_keys` table has RLS policies
- [ ] `pdfs` table has RLS policies
- [ ] `usage_logs` table has RLS policies
- [ ] Service role key can bypass RLS (default behavior)

### Functions

Verify these database functions exist:

- [ ] `get_api_key_info(TEXT)` - validates API keys
- [ ] `increment_usage(UUID)` - tracks usage

## ✅ GitHub Repository

- [ ] Code pushed to GitHub
- [ ] Repository is: `ankushthakur2007/miyami-pdf-mcptool`
- [ ] Main branch is up to date
- [ ] No merge conflicts
- [ ] `.env` files are in `.gitignore` (never commit secrets!)

## ✅ Render Account

- [ ] Render account created at [render.com](https://render.com)
- [ ] GitHub connected to Render
- [ ] Payment method added (if using paid tier)

## ✅ Pre-Deployment Test (Local)

Test everything works locally first:

```bash
# 1. Install dependencies
npm install

# 2. Set up .env.local with your Supabase credentials
cp .env.example .env.local
# Edit .env.local with your actual values

# 3. Build the app
npm run build

# 4. Start production mode
npm start

# 5. Test health check
curl http://localhost:3000/api/health

# 6. Test authentication
# Visit http://localhost:3000
# Sign up and log in

# 7. Test API key creation
# Go to Dashboard → API Keys → Create Key

# 8. Test PDF generation
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_test_key" \
  -d '{"content": "Test", "format": "text"}'
```

## ✅ Deployment Steps

### Option 1: Blueprint Deployment

1. [ ] Go to [Render Dashboard](https://dashboard.render.com)
2. [ ] Click **New** → **Blueprint**
3. [ ] Select repository: `ankushthakur2007/miyami-pdf-mcptool`
4. [ ] Render detects `render.yaml`
5. [ ] Fill in environment variables (see above)
6. [ ] Click **Apply**
7. [ ] Wait for deployment (10-15 minutes)
8. [ ] Note the deployed URL
9. [ ] Update `NEXT_PUBLIC_APP_URL` environment variable
10. [ ] Trigger manual redeploy

### Option 2: Manual Deployment

1. [ ] Go to Render Dashboard
2. [ ] Click **New** → **Web Service**
3. [ ] Connect GitHub repository
4. [ ] Configure:
   - Name: `miyami-pdf-tool`
   - Runtime: Docker
   - Branch: main
   - Dockerfile: `./Dockerfile`
   - Health Check: `/api/health`
5. [ ] Add all environment variables
6. [ ] Click **Create Web Service**
7. [ ] Wait for deployment
8. [ ] Update `NEXT_PUBLIC_APP_URL`
9. [ ] Redeploy

## ✅ Post-Deployment Verification

### Test Health
```bash
curl https://your-app-name.onrender.com/api/health
```

Expected: `{"status":"healthy","database":"connected",...}`

### Test Web App
- [ ] Visit deployed URL
- [ ] Landing page loads
- [ ] Click "Get Started"
- [ ] Sign up works
- [ ] Email verification received
- [ ] Login works
- [ ] Dashboard accessible

### Test API
- [ ] Create API key in dashboard
- [ ] Test PDF generation endpoint
- [ ] Test PDF from URL endpoint
- [ ] Check PDF saved to Supabase Storage
- [ ] Verify usage tracking works

### Test MCP Server
- [ ] Update Claude Desktop config with production URL
- [ ] Restart Claude Desktop
- [ ] Test PDF generation from Claude
- [ ] Verify tools show up in Claude

## ✅ Monitoring Setup

- [ ] Bookmark Render Dashboard → Logs
- [ ] Check metrics for CPU/Memory usage
- [ ] Monitor Supabase Dashboard → Database
- [ ] Set up alerts (optional)

## 🚨 Common Issues

### Build Fails
- Check Dockerfile syntax
- Verify all dependencies in package.json
- Check build logs in Render

### Database Connection Error
- Double-check Supabase environment variables
- Ensure no typos in URLs/keys
- Verify Supabase project is active

### Puppeteer Fails
- Dockerfile includes all Chromium dependencies
- Check logs for missing libraries
- Verify PUPPETEER_EXECUTABLE_PATH is set

### Storage Upload Fails
- Ensure `pdfs` bucket exists
- Check bucket is public
- Verify storage policies

## 📝 Notes

- First deployment takes 10-15 minutes
- Free tier spins down after 15 minutes inactivity
- Starter plan ($7/month) keeps service always on
- Cold starts on free tier: 30-60 seconds
- HTTPS is automatic on Render
- Custom domains supported

## ✅ Ready to Deploy?

If all checkboxes above are checked, you're ready to deploy! 🚀

Follow the deployment steps in `RENDER_DEPLOYMENT.md`.
