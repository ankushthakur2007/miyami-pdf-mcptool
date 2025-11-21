# Deploying Miyami PDF Tool to Render

This guide covers deploying the complete Miyami PDF Tool platform to Render.com.

## Prerequisites

- [Render account](https://render.com) (free tier available)
- [Supabase project](https://supabase.com) (already set up)
- GitHub repository with your code

## Deployment Options

### Option 1: Deploy via Render Blueprint (Recommended)

This uses the `render.yaml` file for automatic setup.

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

2. **Create New Blueprint Instance**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **New** → **Blueprint**
   - Connect your GitHub repository: `ankushthakur2007/miyami-pdf-mcptool`
   - Select the repository
   - Render will detect `render.yaml`

3. **Configure Environment Variables**:
   
   Render will prompt you to fill these required variables:

   | Variable | Value | Where to Get |
   |----------|-------|--------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon/public key | Supabase Dashboard → Settings → API |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Supabase Dashboard → Settings → API |
   | `NEXT_PUBLIC_APP_URL` | `https://your-app-name.onrender.com` | Will be provided after creation |
   | `API_KEY_ENCRYPTION_SECRET` | Auto-generated | Render generates this automatically |

4. **Deploy**:
   - Click **Apply**
   - Render will build and deploy your app
   - Wait 10-15 minutes for first deployment

5. **Update App URL**:
   - After deployment, get your app URL from Render
   - Go to Environment Variables
   - Update `NEXT_PUBLIC_APP_URL` with the actual URL
   - Redeploy

### Option 2: Manual Web Service Creation

If you prefer manual setup:

1. **Create New Web Service**:
   - Go to Render Dashboard
   - Click **New** → **Web Service**
   - Connect your GitHub repository

2. **Configure Service**:
   ```
   Name: miyami-pdf-tool
   Region: Oregon (or your preference)
   Branch: main
   Runtime: Docker
   Docker Build Context Directory: .
   Dockerfile Path: ./Dockerfile
   ```

3. **Configure Service Details**:
   ```
   Instance Type: Starter ($7/month) or Free
   Health Check Path: /api/health
   Auto-Deploy: Yes
   ```

4. **Add Environment Variables** (same as above table)

5. **Create Web Service** and wait for deployment

## Post-Deployment Steps

### 1. Verify Health Check

```bash
curl https://your-app-name.onrender.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "puppeteer": "available",
  "timestamp": "2025-11-21T...",
  "environment": "production"
}
```

### 2. Test Authentication

- Visit `https://your-app-name.onrender.com`
- Click "Get Started"
- Sign up with email/password
- Verify email (check spam folder)
- Log in to dashboard

### 3. Create API Key

- Go to Dashboard → API Keys
- Create new API key
- Copy and save securely

### 4. Test PDF Generation

```bash
curl -X POST https://your-app-name.onrender.com/api/pdf/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{
    "content": "# Hello from Render!\n\nThis PDF was generated on Render.",
    "format": "markdown",
    "options": {
      "format": "A4"
    }
  }'
```

### 5. Update MCP Server Configuration

Update your Claude Desktop config to use production URL:

```json
{
  "mcpServers": {
    "miyami-pdf": {
      "command": "npx",
      "args": ["@ankush_thxkur/miyami-pdf-tool-mcp-server"],
      "env": {
        "PDF_API_BASE_URL": "https://your-app-name.onrender.com",
        "PDF_API_KEY": "your_production_api_key"
      }
    }
  }
}
```

## Monitoring & Logs

### View Logs
- Render Dashboard → Your Service → Logs
- Real-time streaming logs
- Filter by severity

### Monitor Performance
- Render Dashboard → Your Service → Metrics
- CPU, Memory, Network usage
- Response times

### Check Database
- Supabase Dashboard → Table Editor
- Verify `api_keys`, `pdfs`, `usage_logs` tables

## Troubleshooting

### Build Fails

**Issue**: Docker build timeout or fails

**Solution**:
- Check Dockerfile syntax
- Verify all dependencies in package.json
- Check Render build logs for specific errors

### Puppeteer Issues

**Issue**: PDF generation fails with Chromium errors

**Solution**:
- Dockerfile already includes all required dependencies
- Verify `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium` is set
- Check logs for specific missing libraries

### Database Connection Fails

**Issue**: "database error" in health check

**Solution**:
- Verify Supabase environment variables are correct
- Check Supabase project is active
- Ensure RLS policies allow service role access

### Storage Upload Fails

**Issue**: PDFs generate but don't save to storage

**Solution**:
- Verify Supabase Storage bucket exists (`pdfs`)
- Check bucket is public
- Verify service role key has storage access

### Free Tier Limitations

Render Free Tier:
- Service spins down after 15 minutes of inactivity
- 750 hours/month (enough for one service 24/7)
- Slower cold starts (30-60 seconds)

**Recommendation**: Use Starter plan ($7/month) for production:
- Always on
- Faster performance
- More resources

## Scaling

### Increase Performance

1. **Upgrade Instance Type**:
   - Free → Starter ($7/month)
   - Starter → Standard ($25/month)
   - More CPU, RAM, faster response

2. **Enable Auto-Deploy**:
   - Automatically deploys on git push
   - Already enabled in render.yaml

3. **Add Custom Domain**:
   - Render Dashboard → Settings → Custom Domains
   - Add your domain
   - Update DNS records
   - Free SSL certificate included

### Horizontal Scaling

For high traffic:
- Deploy multiple instances
- Use Render's load balancing
- Consider upgrading to Pro plan

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (secret) |
| `API_KEY_ENCRYPTION_SECRET` | Yes | Secret for API key hashing (auto-generated) |
| `NEXT_PUBLIC_APP_URL` | Yes | Your Render app URL |
| `PORT` | No | Auto-set to 3000 by Render |

## Security Checklist

- ✅ All environment variables set as secrets
- ✅ HTTPS enabled (automatic on Render)
- ✅ Supabase RLS policies active
- ✅ API key hashing with HMAC-SHA256
- ✅ Rate limiting enabled
- ✅ CORS configured for your domain
- ✅ No secrets in code/repository

## Cost Estimate

### Render
- **Free Tier**: $0/month (with limitations)
- **Starter**: $7/month (recommended)
- **Standard**: $25/month (high traffic)

### Supabase
- **Free Tier**: $0/month
  - 500MB database
  - 1GB file storage
  - 50,000 monthly active users
- **Pro**: $25/month (if needed)

### Total Monthly Cost
- **Minimal**: $7/month (Render Starter + Supabase Free)
- **Production**: $32/month (Render Starter + Supabase Pro)

## Support

- **Render**: [docs.render.com](https://docs.render.com)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Issues**: [GitHub Issues](https://github.com/ankushthakur2007/miyami-pdf-mcptool/issues)

## Next Steps

After successful deployment:

1. ✅ Test all PDF generation endpoints
2. ✅ Test PDF manipulation (merge, split, rotate, watermark)
3. ✅ Test PDF extraction
4. ✅ Verify rate limiting works
5. ✅ Test MCP server with Claude Desktop
6. ✅ Monitor logs for errors
7. ✅ Set up monitoring alerts (optional)
8. ✅ Configure custom domain (optional)

Your Miyami PDF Tool is now live on Render! 🎉
