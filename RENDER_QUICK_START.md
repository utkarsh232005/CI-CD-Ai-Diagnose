# Quick Render Deployment Guide

## 🚀 Deploy in 5 Minutes

### Step 1: Prepare Your Code
```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

Or use the helper script:
```bash
./deploy-to-render.sh
```

### Step 2: Deploy to Render

1. **Go to Render**: https://dashboard.render.com
2. **Click**: "New +" → "Blueprint"
3. **Connect**: Your GitHub repository
4. **Set Environment Variables**:
   - `GITHUB_TOKEN`: Your token from `.env` file
   - `FRONTEND_URL`: Your frontend URL (e.g., `https://your-app.vercel.app`)
5. **Click**: "Apply"

### Step 3: Get Your Server URL

After deployment (~2 minutes), you'll get a URL like:
```
https://ci-cd-websocket-server.onrender.com
```

### Step 4: Update Frontend

Update your frontend environment variable:
```bash
VITE_WS_URL=https://ci-cd-websocket-server.onrender.com
```

**For Vercel:**
```bash
vercel env add VITE_WS_URL
# Paste: https://ci-cd-websocket-server.onrender.com
```

**For Netlify:**
```bash
netlify env:set VITE_WS_URL https://ci-cd-websocket-server.onrender.com
```

### Step 5: Test

Visit your health endpoint:
```
https://ci-cd-websocket-server.onrender.com/health
```

✅ You should see:
```json
{
  "status": "ok",
  "timestamp": "...",
  "activeDeployments": 0
}
```

## 🎉 Done!

Your WebSocket server is now live and ready to handle real-time GitHub workflow updates!

## 📚 Need More Details?

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for:
- Detailed step-by-step guide
- Troubleshooting tips
- Configuration options
- Monitoring and logs

## ⚡ Important Notes

- **Free Tier**: Server spins down after 15 minutes of inactivity
- **Cold Start**: First request takes ~30 seconds after spin down
- **Upgrade**: Consider Starter plan ($7/month) for always-on service

## 🔧 Environment Variables

Don't forget to set these in Render:

| Variable | Value |
|----------|-------|
| `GITHUB_TOKEN` | Your GitHub token |
| `GITHUB_OWNER` | `utkarsh232005` |
| `GITHUB_REPO` | `CI-CD` |
| `FRONTEND_URL` | Your frontend URL |
| `NODE_ENV` | `production` (auto-set) |
