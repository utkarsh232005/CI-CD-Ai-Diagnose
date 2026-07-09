# Deploy WebSocket Server to Render

This guide will help you deploy your CI/CD WebSocket server to Render.

## Prerequisites

- A Render account (sign up at https://render.com)
- Your GitHub repository pushed to GitHub
- GitHub Personal Access Token (already in your `.env` file)

## Deployment Steps

### Option 1: Using Render Blueprint (Recommended)

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Go to Render Dashboard**:
   - Visit https://dashboard.render.com
   - Click "New +" → "Blueprint"

3. **Connect your repository**:
   - Select your `CI-CD` repository
   - Render will automatically detect the `render.yaml` file

4. **Set environment variables**:
   - `GITHUB_TOKEN`: Paste your GitHub token from `.env` file
   - `FRONTEND_URL`: Your frontend URL (e.g., `https://your-app.vercel.app` or `https://your-app.netlify.app`)

5. **Deploy**:
   - Click "Apply" to start the deployment
   - Wait for the build to complete (~2-3 minutes)

### Option 2: Manual Setup

1. **Go to Render Dashboard**:
   - Visit https://dashboard.render.com
   - Click "New +" → "Web Service"

2. **Connect your repository**:
   - Connect your GitHub account
   - Select your `CI-CD` repository

3. **Configure the service**:
   - **Name**: `ci-cd-websocket-server`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty
   - **Runtime**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `node server/websocket-server.js`

4. **Set environment variables** (in Render dashboard):
   ```
   NODE_ENV=production
   GITHUB_TOKEN=<your_github_token_from_.env>
   GITHUB_OWNER=utkarsh232005
   GITHUB_REPO=CI-CD
   FRONTEND_URL=<your_frontend_url>
   ```

5. **Advanced settings**:
   - **Health Check Path**: `/health`
   - **Auto-Deploy**: Yes (recommended)

6. **Create Web Service**:
   - Click "Create Web Service"
   - Wait for deployment (~2-3 minutes)

## After Deployment

### 1. Get Your Server URL

After deployment, you'll get a URL like:
```
https://ci-cd-websocket-server.onrender.com
```

### 2. Update Your Frontend

Update your frontend `.env` or environment variables:

**For local development** (`.env`):
```bash
VITE_WS_URL=https://ci-cd-websocket-server.onrender.com
```

**For Vercel/Netlify**:
Add the environment variable in your deployment platform:
```
VITE_WS_URL=https://ci-cd-websocket-server.onrender.com
```

### 3. Update CORS Settings

The server will automatically accept requests from your frontend URL that you set in `FRONTEND_URL` environment variable.

### 4. Test Your Deployment

1. Visit your health endpoint:
   ```
   https://ci-cd-websocket-server.onrender.com/health
   ```
   
   You should see:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-10-22T...",
     "activeDeployments": 0
   }
   ```

2. Check the logs in Render dashboard to ensure:
   - ✅ Server is running
   - ✅ GitHub Token is configured
   - ✅ No errors

## Important Notes

### Free Tier Limitations

- **Spin down after 15 minutes of inactivity**: The free tier will spin down your service after 15 minutes of no requests
- **Cold starts**: First request after spin down will take ~30 seconds
- **750 hours/month**: Free tier includes 750 hours per month

### Upgrading to Paid Plan

If you need always-on service:
- Upgrade to Starter plan ($7/month)
- No spin downs
- Better performance

## Troubleshooting

### Server won't start
- Check logs in Render dashboard
- Verify all environment variables are set correctly
- Ensure `GITHUB_TOKEN` is valid

### CORS errors
- Verify `FRONTEND_URL` matches your actual frontend URL
- Include protocol (https://) in the URL
- Check browser console for specific CORS error messages

### GitHub API errors
- Verify `GITHUB_TOKEN` has correct permissions:
  - `repo` scope
  - `workflow` scope
- Check token hasn't expired
- Verify `GITHUB_OWNER` and `GITHUB_REPO` are correct

### WebSocket connection fails
- Ensure frontend is using `https://` not `http://`
- Check if firewall/network is blocking WebSocket connections
- Verify server URL is correct in frontend

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GITHUB_TOKEN` | Yes | GitHub Personal Access Token | `github_pat_...` |
| `GITHUB_OWNER` | Yes | GitHub username/organization | `utkarsh232005` |
| `GITHUB_REPO` | Yes | Repository name | `CI-CD` |
| `FRONTEND_URL` | Yes | Your frontend URL for CORS | `https://app.vercel.app` |
| `NODE_ENV` | No | Environment (auto-set) | `production` |
| `PORT` | No | Port (auto-set by Render) | `10000` |

## Monitoring

### View Logs
- Go to Render dashboard
- Select your service
- Click "Logs" tab

### Monitor Performance
- Check "Metrics" tab for:
  - CPU usage
  - Memory usage
  - Request rate

### Set Up Alerts
- Go to "Settings"
- Configure email alerts for:
  - Deploy failures
  - Service health issues

## Auto-Deploy from GitHub

When auto-deploy is enabled:
1. Push code to GitHub
2. Render automatically detects changes
3. Builds and deploys new version
4. Zero-downtime deployment

## Next Steps

1. ✅ Deploy to Render
2. ✅ Update frontend with server URL
3. ✅ Test end-to-end functionality
4. ✅ Monitor logs for any issues
5. ✅ Consider upgrading if you need always-on service

## Support

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- GitHub Issues: Create an issue in your repository

---

**Need Help?** Check the Render logs first, they usually contain helpful error messages!
