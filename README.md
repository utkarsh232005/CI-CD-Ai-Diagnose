# Real-Time CI/CD Pipeline Monitoring System

A **DevOps-focused CI/CD monitoring solution** that provides real-time visibility into your deployment pipelines and GitHub Actions workflows. Built with **WebSocket communication** and **automated deployment triggers**, this system solves the critical problem of blind deployments by offering live monitoring, automated notifications, and centralized pipeline management.

## 🎯 What Problem Does This Solve?

### The DevOps Challenge
- **Blind Deployments**: No real-time visibility into CI/CD pipeline status and progress
- **Manual Monitoring**: DevOps teams constantly refreshing GitHub Actions to check build status
- **Delayed Incident Response**: Finding out about failed deployments minutes or hours later
- **Scattered Pipeline Data**: Deployment information spread across multiple tools and dashboards
- **Poor Operational Visibility**: Lack of centralized monitoring for multiple repositories and workflows
- **Manual Deployment Triggers**: No unified interface to trigger deployments across environments

### The Solution
Our monitoring system provides:
- ✅ **Real-time pipeline monitoring** with live status updates and progress tracking
- ✅ **Automated workflow detection** and instant notifications for all pipeline events
- ✅ **Centralized deployment dashboard** showing all repositories and workflows in one place
- ✅ **Manual deployment triggers** with environment selection and rollback capabilities
- ✅ **Live log streaming** from GitHub Actions with real-time error detection
- ✅ **WebSocket-powered updates** for instant pipeline status changes
- ✅ **DevOps-focused interface** designed for operational monitoring and incident response

## 🚀 Key Features

### 🔄 Real-Time Pipeline Monitoring
- **Live Workflow Tracking**: Monitor GitHub Actions workflows across multiple repositories
- **Stage-by-Stage Progress**: Watch each CI/CD stage (Build → Test → Deploy → Verify) in real-time
- **Duration Analytics**: Track pipeline execution times and identify bottlenecks
- **Status Aggregation**: Get instant overview of all active and recent deployments

### 📊 DevOps Operations Dashboard
- **Multi-Repository View**: Monitor workflows across your entire organization
- **Pipeline History**: Track deployment frequency, success rates, and failure patterns
- **Performance Metrics**: Analyze build times, test execution, and deployment durations
- **Operational Controls**: Trigger deployments, view logs, and manage pipeline configurations

### 🔗 GitHub Actions Integration
- **Automatic Workflow Detection**: Connects to GitHub API to monitor all repository workflows
- **Real-time Webhook Processing**: Receives instant updates from GitHub Actions events
- **Token-based Security**: Secure authentication with GitHub Personal Access Tokens
- **Multi-Environment Support**: Monitor development, staging, and production deployments

### 🌐 Production-Ready Infrastructure
- **Scalable WebSocket Server**: Real-time communication backend with auto-scaling capabilities
- **RESTful API**: Full REST API for integration with existing DevOps tools
- **Environment Configuration**: Easy setup across development, staging, and production
- **Monitoring & Alerting**: Built-in health checks and operational monitoring

## �️ Tech Stack

## 🛠️ Tech Stack

### Backend Infrastructure
- **Node.js** + **Express** for high-performance WebSocket server
- **Socket.io** for real-time bidirectional communication
- **GitHub API** integration via Octokit for workflow monitoring
- **RESTful APIs** for integration with external DevOps tools
- **Environment-based Configuration** for multi-stage deployments

### DevOps & Infrastructure
- **GitHub Actions** for automated CI/CD workflows
- **Webhook Processing** for real-time event handling
- **Docker** containerization for consistent deployments
- **Render** for scalable backend hosting
- **Environment Variables** for secure configuration management
- **Health Checks** and monitoring endpoints

### Monitoring & Communication
- **WebSocket Protocol** for real-time pipeline updates
- **GitHub Webhooks** for instant workflow notifications
- **API Rate Limiting** and error handling
- **CORS** configuration for secure cross-origin requests
- **SSL/TLS** encryption for production security

### Development & Operations
- **TypeScript** for enhanced code reliability
- **ESLint** for code quality and consistency
- **Git** workflows with automated testing
- **Logging** and error tracking
- **Documentation** and deployment guides

## 📋 Prerequisites

## 📋 Prerequisites

Before setting up the CI/CD monitoring system:

### Required Accounts & Access
- **GitHub account** with repository access
- **GitHub Personal Access Token** with workflow permissions
- **Render account** for backend deployment (or similar cloud provider)
- **Node.js 18+** and npm for local development

### DevOps Requirements
- **GitHub Actions** enabled on your repositories
- **Webhook permissions** for real-time event processing
- **API access** to GitHub for workflow monitoring
- **SSL certificates** for production deployment

## 🚀 Quick Setup

### 1. Clone and Install
```bash
# Clone the monitoring system
git clone https://github.com/utkarsh232005/CI-CD.git
cd CI-CD

# Install dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..
```

### 2. GitHub API Configuration
```bash
# Copy environment template
cp .env.example .env

# Configure GitHub integration:
# GITHUB_TOKEN=github_pat_xxxxx     # Your GitHub API token
# GITHUB_OWNER=your_username        # GitHub username/organization
# GITHUB_REPO=your_repository       # Repository to monitor
# PORT=3001                         # WebSocket server port
```

### 3. Start Monitoring Services
```bash
# Start WebSocket server for real-time monitoring
npm run server

# Server will be available at:
# - WebSocket: ws://localhost:3001
# - REST API: http://localhost:3001
# - Health Check: http://localhost:3001/health
```

### 4. Verify System Status
```bash
# Check server health
curl http://localhost:3001/health

# Test GitHub API connection
curl http://localhost:3001/api/github/workflows

# Monitor WebSocket connections
curl http://localhost:3001/
```

## 🔧 DevOps Configuration

### GitHub API Integration
```bash
# Generate GitHub Personal Access Token with these scopes:
# - repo (Full control of repositories)
# - workflow (Update GitHub Action workflows)
# - read:org (Read organization membership)

# Configure in .env file:
GITHUB_TOKEN=github_pat_xxxxx
GITHUB_OWNER=your_organization
GITHUB_REPO=your_repository
```

### WebSocket Server Configuration
```bash
# Production environment variables:
PORT=3001                              # Server port
NODE_ENV=production                    # Environment
GITHUB_TOKEN=github_pat_xxxxx          # GitHub API access
GITHUB_OWNER=your_organization         # GitHub organization/user
GITHUB_REPO=your_repository            # Repository to monitor
WEBHOOK_URL=https://your-server.com    # Webhook endpoint
FRONTEND_URL=https://your-app.com      # CORS origin
```

### Webhook Configuration (Optional)
```bash
# For real-time GitHub Events, configure webhook:
# URL: https://your-server.com/api/webhook/github
# Events: Workflow runs, Deployments
# Content-Type: application/json
```

## 🎯 System Architecture

### Real-Time Pipeline Monitoring Flow

1. **GitHub Actions Trigger**: Workflows triggered by push, PR, or manual dispatch
2. **Event Detection**: WebSocket server polls GitHub API for workflow status changes
3. **Real-time Processing**: Server processes workflow events and stage transitions
4. **Live Broadcasting**: WebSocket connections broadcast updates to connected clients
5. **Operational Response**: DevOps teams receive instant notifications and can take action

### Infrastructure Architecture

```
┌─────────────────┐    GitHub API     ┌─────────────────┐    WebSocket     ┌─────────────────┐
│ GitHub Actions  │◄──────────────────│ Monitoring      │◄─────────────────│ DevOps Teams    │
│   Workflows     │                   │   Server        │                  │   & Tools       │
└─────────────────┘                   │   (Render)      │                  └─────────────────┘
                                      └─────────────────┘
                                             │
                                             │ REST API
                                             ▼
                                    ┌─────────────────┐
                                    │ External Tools  │
                                    │ & Integrations  │
                                    └─────────────────┘
```

### Monitoring Capabilities

#### Pipeline Stage Monitoring
- **🔄 Source Control**: Repository clone and checkout operations
- **🔨 Build Process**: Dependency installation, compilation, and packaging
- **🧪 Quality Assurance**: Test execution, code analysis, and security scans
- **🚀 Deployment**: Multi-environment deployment with verification
- **✅ Post-Deployment**: Health checks, smoke tests, and monitoring setup

#### Operational Features
- **Multi-Repository Monitoring**: Track workflows across your entire organization
- **Environment-Specific Views**: Separate monitoring for dev, staging, and production
- **Performance Analytics**: Track deployment frequency, lead time, and success rates
- **Incident Response**: Quick access to logs, rollback capabilities, and team notifications

### Supported CI/CD Operations

1. **� Build Automation**
   - Multi-language build support (Node.js, Python, Java, .NET)
   - Dependency management and caching
   - Artifact generation and storage

2. **🧪 Quality Gates**
   - Automated testing (unit, integration, e2e)
   - Code quality analysis and security scanning
   - Performance testing and benchmarking

3. **🚀 Deployment Automation**
   - Blue-green deployments
   - Canary releases with traffic splitting
   - Infrastructure as Code (IaC) deployment

4. **� Monitoring & Observability**
   - Real-time pipeline metrics
   - Deployment success/failure tracking
   - Performance and reliability monitoring

## 🌐 Production Deployment

### Deploy Monitoring Server to Render

```bash
# 1. Prepare for production deployment
git add .
git commit -m "Deploy CI/CD monitoring system"
git push origin main

# 2. Automated deployment to Render
./deploy-to-render.sh
```

**Manual Render Configuration:**
1. Visit [Render Dashboard](https://dashboard.render.com)
2. Create new Web Service from your GitHub repository
3. Configure build settings:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `node server/websocket-server.js`
   - **Environment**: Node.js

4. Set production environment variables:
   ```bash
   GITHUB_TOKEN=github_pat_xxxxx     # GitHub API token
   GITHUB_OWNER=your_organization    # GitHub organization
   GITHUB_REPO=your_repository       # Repository to monitor
   NODE_ENV=production               # Production environment
   FRONTEND_URL=*                    # Allow all origins (or specific URLs)
   ```

### Infrastructure Scaling

**Auto-scaling Configuration:**
- **Free Tier**: Automatic spin-down after 15 minutes (development)
- **Starter Plan**: Always-on service with 0.5 CPU, 512MB RAM
- **Professional**: Auto-scaling with multiple instances

**Load Balancing:**
```bash
# For high-traffic environments, configure multiple instances
# Render automatically handles load distribution
```

### Production Environment Variables

```bash
# Required for production
NODE_ENV=production
PORT=10000                          # Render assigns this automatically
GITHUB_TOKEN=github_pat_xxxxx       # Your GitHub API token
GITHUB_OWNER=your_organization      # GitHub organization/username
GITHUB_REPO=your_repository         # Primary repository to monitor

# Optional production settings
WEBHOOK_URL=https://your-server.onrender.com
FRONTEND_URL=https://your-dashboard.com
GITHUB_WEBHOOK_SECRET=your_secret   # For secure webhook processing
LOG_LEVEL=info                      # Production logging level
```

### Monitoring & Operations

**Health Monitoring:**
```bash
# Health check endpoint
GET https://your-server.onrender.com/health

# API status check
GET https://your-server.onrender.com/api/github/workflows

# WebSocket connection test
ws://your-server.onrender.com/
```

**Operational Endpoints:**
- **Health Check**: `/health` - Service status and metrics
- **GitHub Workflows**: `/api/github/workflows` - Repository workflow data
- **Deployment Trigger**: `/api/deploy` - Manual deployment initiation
- **Webhook Handler**: `/api/webhook/github` - GitHub event processing

## 📚 Documentation & Operations

### API Documentation

**GitHub Integration Endpoints:**
```bash
# Get workflow runs
GET /api/github/workflows

# Trigger manual deployment
POST /api/deploy
{
  "branch": "main",
  "environment": "production"
}

# GitHub webhook handler
POST /api/webhook/github
```

**WebSocket Events:**
```javascript
// Pipeline status updates
socket.on('github:workflow', (data) => {
  // Handle workflow status changes
});

// Deployment progress
socket.on('deployment:progress', (data) => {
  // Handle real-time deployment updates
});

// System notifications
socket.on('deployment:completed', (data) => {
  // Handle deployment completion
});
```

### Operations Scripts
```bash
# Development
npm run server                    # Start monitoring server
npm run dev                      # Start development environment

# Production
./deploy-to-render.sh            # Deploy to production
./test-deployment.sh             # Test deployment functionality

# Maintenance
./check-secrets.sh               # Verify environment configuration
./setup-github.sh                # Configure GitHub integration
```

### Monitoring & Alerting

**System Health Checks:**
```bash
# Server health
curl https://your-server.com/health

# GitHub API connectivity
curl https://your-server.com/api/github/workflows

# WebSocket connectivity
wscat -c wss://your-server.com/
```

**Log Analysis:**
```bash
# View real-time logs (Render dashboard)
# Monitor GitHub API rate limits
# Track WebSocket connection metrics
# Analyze deployment success rates
```

## 🐳 Container & Infrastructure

### Docker Deployment

```bash
# Build monitoring server container
docker build -t cicd-monitor .

# Run with environment configuration
docker run -d \
  -p 3001:3001 \
  -e GITHUB_TOKEN=$GITHUB_TOKEN \
  -e GITHUB_OWNER=$GITHUB_OWNER \
  -e GITHUB_REPO=$GITHUB_REPO \
  --name cicd-monitor \
  cicd-monitor
```

### Docker Compose for Development

```bash
# Start complete monitoring stack
docker-compose up --build

# Background execution
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Kubernetes Deployment

```yaml
# Example Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cicd-monitor
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cicd-monitor
  template:
    spec:
      containers:
      - name: cicd-monitor
        image: cicd-monitor:latest
        ports:
        - containerPort: 3001
        env:
        - name: GITHUB_TOKEN
          valueFrom:
            secretKeyRef:
              name: github-secrets
              key: token
```

## 🔄 CI/CD Pipeline Integration

### GitHub Actions Workflow Example

```yaml
# .github/workflows/cicd-monitor.yml
name: CI/CD Pipeline with Monitoring

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
      
      - name: Notify monitoring system
        run: |
          curl -X POST ${{ secrets.MONITOR_WEBHOOK_URL }}/api/webhook/deployment \
            -H "Content-Type: application/json" \
            -d '{"action": "completed", "status": "success", "branch": "${{ github.ref_name }}"}'
```

### Webhook Integration

```javascript
// GitHub webhook handler for real-time updates
app.post('/api/webhook/github', (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;

  if (event === 'workflow_run') {
    const { action, workflow_run } = payload;
    
    // Broadcast to all connected monitoring clients
    io.emit('github:workflow', {
      action,
      workflow: {
        id: workflow_run.id,
        name: workflow_run.name,
        status: workflow_run.status,
        conclusion: workflow_run.conclusion,
        repository: workflow_run.repository.full_name,
        branch: workflow_run.head_branch,
        commit: workflow_run.head_sha
      }
    });
  }
  
  res.status(200).json({ received: true });
});
```

### Multi-Environment Pipeline

```bash
# Development pipeline
npm run deploy:dev    # Deploy to development environment

# Staging pipeline  
npm run deploy:staging    # Deploy to staging environment

# Production pipeline
npm run deploy:prod   # Deploy to production environment

# Rollback capabilities
npm run rollback:prod -- --version=1.2.3
```

## � Deployment Options

### Option 1: Vercel (Default - Easiest)

**Setup in 3 steps:**

1. **Get Vercel credentials:**
   ```bash
   npm install -g vercel
   vercel login
   vercel link
   ```

2. **Add GitHub Secrets:**
   - `VERCEL_TOKEN` - From https://vercel.com/account/tokens
   - `VERCEL_ORG_ID` - From `.vercel/project.json`
   - `VERCEL_PROJECT_ID` - From `.vercel/project.json`

3. **Deploy:**
   ```bash
   git push origin main
   ```

**Your app will be live at:** `https://your-project.vercel.app`

### Option 2: Firebase Hosting

**Setup in 3 steps:**

1. **Initialize Firebase:**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   ```

2. **Add GitHub Secrets:**
   - `FIREBASE_SERVICE_ACCOUNT` - From Firebase Console
   - `FIREBASE_PROJECT_ID` - Your Firebase project ID

3. **Switch workflow:**
   ```bash
   mv .github/workflows/cd.yml .github/workflows/cd-vercel.yml
   mv .github/workflows/cd-firebase.yml .github/workflows/cd.yml
   git push origin main
   ```

**Your app will be live at:** `https://your-project.web.app`

### Option 3: Docker (Self-Hosting)

**For custom servers/VPS:**
- See `docker-compose.yml` for local testing
- See original documentation for Docker Hub deployment
- Includes Nginx configuration for production

📖 **Full deployment guide:** See [DEPLOYMENT_PLATFORMS.md](./DEPLOYMENT_PLATFORMS.md)

## 🏗️ Project Structure

```
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI workflow
│       └── cd.yml              # CD workflow
├── src/
│   ├── components/            # React components
│   ├── pages/                # Page components
│   ├── lib/                  # Utilities
│   └── hooks/                # Custom hooks
├── public/                   # Static assets
├── Dockerfile               # Multi-stage Docker build
├── docker-compose.yml       # Local Docker setup
├── nginx.conf              # Nginx configuration
├── .dockerignore           # Docker ignore rules
├── .gitignore             # Git ignore rules
└── package.json           # Dependencies & scripts
```

## 🌐 Nginx Configuration

The application uses Nginx to serve static files with:
- React Router support (SPA routing)
- Gzip compression
- Static asset caching
- Security headers
- Health check endpoint at `/health`

## 🧪 Testing Docker Locally

```bash
# Test the Docker build
docker build -t test-app .

# Run and test
docker run -d -p 8080:80 --name test-container test-app

# Check if it's working
curl http://localhost:8080

# View logs
docker logs test-container

# Cleanup
docker stop test-container
docker rm test-container
```

## � Troubleshooting & Operations

### Common DevOps Issues

**GitHub API Rate Limiting**
```bash
# Symptoms: "API rate limit exceeded" errors
# Solution: Verify GitHub token configuration
echo $GITHUB_TOKEN | cut -c1-20  # Check token format
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit
```

**WebSocket Connection Issues**
```bash
# Check server connectivity
curl -I https://your-server.onrender.com/health

# Test WebSocket endpoint
wscat -c wss://your-server.onrender.com/

# Verify CORS configuration
curl -H "Origin: https://your-client.com" https://your-server.com/
```

**Pipeline Monitoring Failures**
```bash
# Verify GitHub webhook configuration
curl -X POST https://your-server.com/api/webhook/github \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Check GitHub repository access
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/actions/runs
```

**Server Performance Issues**
```bash
# Monitor server resources (Render dashboard)
# Check memory usage and CPU utilization
# Analyze response times and error rates
# Review log aggregation and error tracking
```

### Operational Procedures

**Daily Operations:**
- Monitor deployment success rates via health dashboard
- Review GitHub API usage and rate limit status
- Check WebSocket connection stability and client counts
- Verify webhook delivery success rates

**Incident Response:**
- Access real-time logs via Render dashboard
- Check GitHub service status for API availability
- Verify network connectivity and DNS resolution
- Review recent configuration changes and deployments

**Maintenance Tasks:**
- Rotate GitHub API tokens annually
- Update server dependencies and security patches
- Review and optimize webhook processing performance
- Archive old deployment logs and metrics data

## 📝 Additional Configuration

### Environment Variables

Create `.env` file for local development:
```env
VITE_API_URL=http://localhost:5000
VITE_APP_TITLE=My Vite App
```

### Custom Domain

If deploying with custom domain, update nginx.conf:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

## 🤝 Contributing to DevOps Excellence

### Development Workflow
1. **Fork** the repository for your organization
2. **Create feature branch**: `git checkout -b feature/monitoring-enhancement`
3. **Implement changes** with proper testing and documentation
4. **Commit with DevOps standards**: `git commit -m 'feat: add multi-repo monitoring'`
5. **Submit Pull Request** with detailed operational impact description

### DevOps Standards
- Follow semantic versioning for releases
- Include health checks for all new endpoints
- Document API changes and webhook modifications
- Test webhook processing and GitHub integration
- Ensure backward compatibility for monitoring clients

## 📄 License

This project is licensed under the MIT License - enabling open-source DevOps collaboration.

## 🎯 DevOps Use Cases

### Enterprise CI/CD Monitoring
- **Multi-Repository Oversight**: Monitor hundreds of repositories from a single dashboard
- **Team Collaboration**: Real-time visibility for distributed DevOps teams
- **Compliance Tracking**: Audit trail for all deployments and pipeline executions
- **Performance Analytics**: Track DORA metrics and deployment frequency

### Incident Response
- **Real-time Alerting**: Instant notifications for pipeline failures
- **Quick Debugging**: Access to live logs and workflow status
- **Rollback Coordination**: Rapid response to production issues
- **Status Communication**: Real-time updates for stakeholders

### Infrastructure Operations
- **Deployment Coordination**: Synchronized releases across environments
- **Resource Monitoring**: Track build and deployment resource usage
- **Automation Integration**: Webhook-driven automation workflows
- **Operational Metrics**: Monitor system reliability and performance

## 🚀 Future Roadmap

- **Multi-Cloud Support**: AWS CodePipeline, Azure DevOps integration
- **Advanced Analytics**: DORA metrics, deployment frequency analysis
- **Slack/Teams Integration**: Real-time notifications to communication channels
- **Infrastructure Monitoring**: Kubernetes cluster and container monitoring
- **Security Scanning**: Real-time vulnerability and compliance monitoring

---

**Built by DevOps engineers, for DevOps teams who demand real-time visibility and operational excellence in their CI/CD pipelines.**
