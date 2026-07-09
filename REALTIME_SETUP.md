# 🔄 Real-Time Monitoring Setup Guide

This guide shows you how to set up real-time monitoring for your CI/CD pipeline.

## 🚀 What You'll Get

- **Real-time deployment progress** with live progress bars
- **Live log streaming** from GitHub Actions
- **Manual deployment triggers** from the dashboard
- **GitHub Actions integration** showing workflow status
- **WebSocket communication** for instant updates

## 📋 Setup Instructions

### Step 1: Install Dependencies

```bash
npm install socket.io-client
```

### Step 2: Start the WebSocket Server

```bash
# Install server dependencies
cd server
npm install

# Start the WebSocket server
npm start
```

The server will run on `http://localhost:3001`

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Frontend WebSocket connection
VITE_WS_URL=ws://localhost:3001

# Backend configuration
PORT=3001
FRONTEND_URL=http://localhost:5173

# GitHub configuration (for API access)
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=utkarsh232005
GITHUB_REPO=CI-CD

# Webhook URL for real-time notifications
WEBHOOK_URL=http://localhost:3001
```

### Step 4: Get GitHub Token (Optional)

For enhanced GitHub Actions integration:

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `workflow`
4. Copy the token and add to `.env`

### Step 5: Add Webhook Secret to GitHub

For real-time GitHub Actions updates:

1. Go to your GitHub repository settings
2. Secrets and variables → Actions
3. Add new secret: `WEBHOOK_URL` = `http://localhost:3001`

### Step 6: Start the Application

```bash
# Terminal 1: Start the WebSocket server
npm run server

# Terminal 2: Start the frontend
npm run dev
```

### Step 7: Access the Dashboard

- **Main App**: http://localhost:5173
- **Real-time Dashboard**: http://localhost:5173/dashboard
- **Server Health**: http://localhost:3001/health

## 🎯 Features Overview

### Real-Time Dashboard (`/dashboard`)

- **Deployment Status**: Shows current deployment stage
- **Progress Bar**: Live progress during deployments
- **Real-time Logs**: Streaming logs with timestamps
- **Manual Trigger**: Deploy button to trigger deployments
- **GitHub Actions**: Live status of workflow runs

### WebSocket Events

The system uses these real-time events:

- `deployment:started` - Deployment begins
- `deployment:progress` - Progress updates with percentage
- `deployment:log` - Individual log messages
- `deployment:completed` - Deployment finished successfully
- `deployment:failed` - Deployment failed
- `github:workflow` - GitHub Actions workflow updates

## 🔧 API Endpoints

### WebSocket Server

- `POST /api/deploy` - Trigger manual deployment
- `GET /api/github/workflows` - Get GitHub Actions status
- `POST /api/webhook/github` - GitHub webhook handler
- `POST /api/webhook/deployment` - Deployment notifications
- `GET /health` - Server health check

## 🌐 Production Deployment

### Deploy WebSocket Server

For production, deploy the WebSocket server separately:

```bash
# Build for production
cd server
npm install --production

# Deploy to your hosting platform
# Update WEBHOOK_URL in GitHub secrets to your production URL
```

### Popular Hosting Options

1. **Railway**: Easy Node.js deployment
2. **Heroku**: Classic platform-as-a-service
3. **DigitalOcean App Platform**: Simple deployment
4. **Vercel**: Serverless functions (modify for serverless)

### Update GitHub Secrets

When deploying to production, update:

- `WEBHOOK_URL` → Your production server URL
- `VITE_WS_URL` → Your production WebSocket URL

## 🧪 Testing the Setup

### 1. Test WebSocket Connection

Open the dashboard at http://localhost:5173/dashboard
You should see "No deployment activity yet" message.

### 2. Test Manual Deployment

Click "Deploy Now" button in the dashboard.
You should see:
- Progress bar advancing
- Real-time logs appearing
- Status changing from "IDLE" to "STARTED" to "COMPLETED"

### 3. Test GitHub Integration

Push a commit to your main branch:
```bash
git add .
git commit -m "Test real-time monitoring"
git push origin main
```

Watch the dashboard for real-time updates!

## 🔍 Troubleshooting

### WebSocket Connection Issues

**Problem**: Dashboard shows "No deployment activity"
**Solution**: 
1. Check if WebSocket server is running on port 3001
2. Verify `VITE_WS_URL` in environment variables
3. Check browser console for connection errors

### GitHub API Issues

**Problem**: No GitHub Actions data
**Solution**:
1. Verify `GITHUB_TOKEN` is valid
2. Check token has `repo` and `workflow` permissions
3. Ensure repository name is correct in environment

### Manual Deployment Not Working

**Problem**: "Deploy Now" button doesn't work
**Solution**:
1. Check WebSocket server is running
2. Verify `/api/deploy` endpoint is accessible
3. Check browser network tab for failed requests

## 📊 Monitoring in Production

### Health Checks

Monitor your WebSocket server:
- `GET /health` - Returns server status
- Check WebSocket connections: `activeDeployments` count
- Monitor server logs for errors

### Scaling Considerations

For high-traffic applications:
- Use Redis for WebSocket session management
- Implement rate limiting for manual deployments
- Add authentication for admin features
- Use a reverse proxy (nginx) for WebSocket handling

## 🎉 You're Done!

Your real-time CI/CD monitoring is now active! Every deployment will be visible in real-time on your dashboard.

**Dashboard URL**: http://localhost:5173/dashboard

Push a commit to test it out! 🚀
