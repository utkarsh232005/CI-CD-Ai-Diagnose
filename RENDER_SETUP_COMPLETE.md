# 🚀 Render Deployment - Complete Setup

## ✅ What's Been Configured

Your WebSocket server is now ready for Render deployment with the following files:

### 📄 Configuration Files Created

1. **`render.yaml`** - Blueprint for automatic Render deployment
2. **`RENDER_DEPLOYMENT.md`** - Detailed deployment guide
3. **`RENDER_QUICK_START.md`** - Quick 5-minute deployment guide
4. **`.renderignore`** - Excludes unnecessary files from deployment
5. **`deploy-to-render.sh`** - Helper script for deployment

### 🔧 Updated Files

1. **`server/websocket-server.js`**:
   - ✅ Added `dotenv` for environment variables
   - ✅ Enhanced CORS configuration for multiple origins
   - ✅ Better error handling for port conflicts
   - ✅ Improved production logging

2. **`server/package.json`**:
   - ✅ Added `dotenv` dependency
   - ✅ Added Node.js version requirement

## 🎯 Deployment Steps

### Option A: Quick Deployment (5 minutes)

```bash
# 1. Run the helper script
./deploy-to-render.sh

# 2. Go to Render Dashboard
# Visit: https://dashboard.render.com

# 3. Create Blueprint
# Click "New +" → "Blueprint" → Select your repo

# 4. Set Environment Variables
# - GITHUB_TOKEN: (copy from .env)
# - FRONTEND_URL: (your frontend URL)

# 5. Deploy!
# Click "Apply"
```

### Option B: Manual Deployment

See `RENDER_DEPLOYMENT.md` for detailed step-by-step instructions.

## 🔐 Environment Variables to Set in Render

| Variable | Value | Required |
|----------|-------|----------|
| `GITHUB_TOKEN` | Your GitHub PAT | ✅ Yes |
| `GITHUB_OWNER` | `utkarsh232005` | ✅ Yes |
| `GITHUB_REPO` | `CI-CD` | ✅ Yes |
| `FRONTEND_URL` | Your frontend URL | ✅ Yes |
| `NODE_ENV` | `production` | Auto-set |
| `PORT` | `10000` | Auto-set |

### Get Your Values:

```bash
# Your GitHub Token (from .env)
grep GITHUB_TOKEN .env

# Output example:
# GITHUB_TOKEN=github_pat_11BAWBDNQ0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 📝 After Deployment Checklist

### 1. Test Your Deployment

Visit your health endpoint:
```
https://YOUR-SERVICE-NAME.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-22T...",
  "activeDeployments": 0
}
```

### 2. Update Frontend Configuration

**Local Development** (`.env`):
```bash
VITE_WS_URL=https://YOUR-SERVICE-NAME.onrender.com
```

**Vercel**:
```bash
vercel env add VITE_WS_URL
# Enter: https://YOUR-SERVICE-NAME.onrender.com
vercel --prod
```

**Netlify**:
```bash
netlify env:set VITE_WS_URL https://YOUR-SERVICE-NAME.onrender.com
netlify deploy --prod
```

### 3. Update Index.tsx (if needed)

The frontend should already be configured to use `VITE_WS_URL`:
```typescript
const newSocket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3001');
```

### 4. Monitor Your Deployment

- **View Logs**: Render Dashboard → Your Service → Logs
- **Check Metrics**: Dashboard → Metrics tab
- **Set Alerts**: Settings → Alerts

## 🐛 Troubleshooting

### Server Won't Start
```bash
# Check Render logs for:
# - Missing environment variables
# - GitHub token issues
# - Build errors
```

### CORS Errors
```bash
# Ensure FRONTEND_URL is set correctly:
# ✅ https://your-app.vercel.app
# ❌ your-app.vercel.app (missing https://)
```

### WebSocket Connection Fails
```bash
# Frontend should use:
VITE_WS_URL=https://YOUR-SERVICE.onrender.com
# NOT http:// (use https://)
```

### GitHub API Rate Limit
```bash
# Verify GITHUB_TOKEN:
# - Has correct permissions (repo, workflow)
# - Hasn't expired
# - Is properly set in Render
```

## 💰 Render Pricing

### Free Tier (Current)
- ✅ 750 hours/month
- ⚠️ Spins down after 15 min inactivity
- ⚠️ ~30s cold start time

### Starter Tier ($7/month)
- ✅ Always-on (no spin down)
- ✅ Faster performance
- ✅ Better for production

## 📊 Service Specifications

- **Runtime**: Node.js 18+
- **Region**: Oregon (configurable)
- **Health Check**: `/health`
- **Auto-Deploy**: Enabled (deploys on git push)
- **Build Command**: `cd server && npm install`
- **Start Command**: `node server/websocket-server.js`

## 🔄 Continuous Deployment

Once set up, every push to main branch:
1. Triggers automatic deployment
2. Runs build command
3. Deploys new version
4. Zero-downtime deployment

## 📚 Resources

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [GitHub Actions + Render](https://render.com/docs/deploy-github-actions)

## ✅ Verification Steps

After deployment, verify:

1. ✅ Health endpoint returns 200 OK
2. ✅ GitHub token is configured
3. ✅ Frontend can connect via WebSocket
4. ✅ No CORS errors in browser console
5. ✅ GitHub workflows are fetched successfully

## 🎉 Success!

Your WebSocket server should now be:
- ✅ Deployed to Render
- ✅ Accessible via HTTPS
- ✅ Monitoring GitHub workflows
- ✅ Connected to your frontend

## 🆘 Need Help?

1. Check `RENDER_DEPLOYMENT.md` for detailed guide
2. See Render logs for error messages
3. Verify environment variables are set correctly
4. Test health endpoint first

---

**Ready to deploy?** Run `./deploy-to-render.sh` to get started! 🚀
