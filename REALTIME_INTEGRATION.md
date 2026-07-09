# Real-time CI/CD Pipeline Integration

This document explains how the real-time features work in your CI/CD pipeline interface.

## 🔄 Real-time Features

### Frontend Pipeline Visualization (`src/pages/Index.tsx`)
- **Live Status Updates**: Pipeline stages update in real-time as deployment progresses
- **WebSocket Connection**: Connects to the backend server for instant updates
- **Manual Trigger**: Click "Trigger Deploy" button to start a deployment
- **Stage Progression**: Watch each stage (Clone → Build → Test → Deploy) progress live
- **Log Streaming**: See live logs for each pipeline stage

### Real-time Dashboard (`src/components/DeploymentDashboard.tsx`)
- **Detailed Monitoring**: More comprehensive view of deployment process
- **Progress Tracking**: Real-time progress bars and status indicators
- **Log History**: Complete log history with timestamps
- **Deployment URLs**: Direct links to deployed applications

## 🏗️ Architecture

### WebSocket Server (`server/websocket-server.js`)
- **Socket.IO Server**: Handles real-time communication
- **Deployment Simulation**: Simulates real deployment steps
- **GitHub Integration**: Listens for GitHub webhook events
- **API Endpoints**: REST endpoints for triggering deployments

### Event Types

#### Deployment Events
- `deployment:started` - Deployment process begins
- `deployment:progress` - Progress updates with step information
- `deployment:log` - Individual log messages
- `deployment:completed` - Deployment finished successfully
- `deployment:failed` - Deployment failed with error

#### GitHub Events
- `github:workflow` - GitHub Actions workflow status updates

## 🚀 Usage

### Starting the Development Environment

#### Option 1: Start Script
```bash
./start-dev.sh
```

#### Option 2: Manual Start
```bash
# Terminal 1: Start WebSocket server
npm run server

# Terminal 2: Start frontend
npm run dev
```

### Testing Real-time Features

#### Option 1: Test Script
```bash
./test-deployment.sh
```

#### Option 2: Manual API Call
```bash
curl -X POST http://localhost:3001/api/deploy \
  -H "Content-Type: application/json" \
  -d '{"branch": "main"}'
```

#### Option 3: Frontend Button
1. Open http://localhost:8080
2. Click "Trigger Deploy" button
3. Watch real-time updates

### Viewing Real-time Updates

1. **Main Pipeline View**: http://localhost:8080
   - Overview of pipeline stages
   - Quick status indicators
   - Trigger deployment button

2. **Detailed Dashboard**: http://localhost:8080/dashboard
   - Comprehensive monitoring
   - Detailed logs and progress
   - Historical data

## 🔧 Configuration

### Environment Variables (`.env`)
```bash
# Frontend WebSocket connection
VITE_WS_URL=http://localhost:3001

# Backend configuration
PORT=3001
FRONTEND_URL=http://localhost:8080

# GitHub configuration (optional)
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repo_name
```

### Frontend Environment Types (`src/vite-env.d.ts`)
```typescript
interface ImportMetaEnv {
  readonly VITE_WS_URL: string
  readonly VITE_API_URL: string
  readonly VITE_GITHUB_OWNER: string
  readonly VITE_GITHUB_REPO: string
}
```

## 🎯 Integration with Real CI/CD

### GitHub Actions Integration
The WebSocket server can receive webhooks from GitHub Actions:

1. **Setup Webhook**: Configure GitHub webhook to POST to `/api/webhook/github`
2. **Workflow Events**: Automatically trigger frontend updates on GitHub Actions events
3. **Real Deployments**: Replace simulation with actual deployment commands

### Deployment Platform Integration
Support for multiple deployment platforms:

#### Vercel
- Webhook URL: `/api/webhook/deployment`
- Events: `deployment.created`, `deployment.ready`, `deployment.error`

#### Netlify
- Build hooks integration
- Deploy notifications
- Status updates

#### Custom Deployment
- SSH deployment scripts
- Docker container deployments
- Cloud platform APIs

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   ```bash
   # Check if server is running
   curl http://localhost:3001/health
   
   # Check environment variables
   echo $VITE_WS_URL
   ```

2. **Frontend Not Updating**
   ```bash
   # Check browser console for WebSocket errors
   # Verify CORS settings in server
   # Ensure ports match between frontend and backend
   ```

3. **Deployment Not Triggering**
   ```bash
   # Test API endpoint directly
   curl -X POST http://localhost:3001/api/deploy -H "Content-Type: application/json" -d '{"branch": "main"}'
   
   # Check server logs
   npm run server
   ```

## 🚀 Production Deployment

### Frontend (Vercel/Netlify)
1. Set environment variable: `VITE_WS_URL=https://your-websocket-server.com`
2. Deploy frontend to your platform
3. Update CORS settings in backend

### Backend (Railway/Heroku/VPS)
1. Deploy WebSocket server
2. Set environment variables for GitHub integration
3. Configure webhooks to point to deployed server

### Security Considerations
- Use HTTPS for production WebSocket connections
- Implement authentication for deployment triggers
- Validate webhook signatures from GitHub
- Rate limit API endpoints

## 📝 Next Steps

1. **Real GitHub Integration**: Replace simulation with actual GitHub API calls
2. **Authentication**: Add user authentication for deployment triggers
3. **Multi-project Support**: Support multiple repositories/projects
4. **Notification System**: Email/Slack notifications for deployment status
5. **Metrics & Analytics**: Track deployment frequency, success rates, etc.
