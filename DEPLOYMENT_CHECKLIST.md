# 📋 Deployment Checklist

## Pre-Deployment Setup

### GitHub Repository ✓
- [x] Git repository initialized
- [x] Code pushed to GitHub
- [x] GitHub Actions workflows added
- [ ] Repository access configured

### Docker Hub Setup
- [ ] Create Docker Hub account (if not exists)
- [ ] Create access token
- [ ] Note username and token

### Production Server Setup
- [ ] VPS/Cloud server provisioned
- [ ] SSH access configured
- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] Firewall configured (port 3000 open)

## GitHub Secrets Configuration

Navigate to: `Settings → Secrets and variables → Actions → New repository secret`

- [ ] **DOCKER_HUB_USERNAME**
  - Value: Your Docker Hub username
  - Example: `johndoe`

- [ ] **DOCKER_HUB_ACCESS_TOKEN**
  - Get from: https://hub.docker.com/settings/security
  - Click "New Access Token"
  - Name: `github-actions`
  - Permissions: `Read & Write`

- [ ] **SERVER_IP**
  - Value: Your server IP address
  - Example: `123.45.67.89`

- [ ] **SERVER_USER**
  - Value: SSH username
  - Common: `ubuntu`, `root`, or `admin`

- [ ] **SSH_PRIVATE_KEY**
  - Generate: `ssh-keygen -t ed25519 -C "deploy" -f ~/.ssh/deploy_key`
  - Add public key to server: `ssh-copy-id -i ~/.ssh/deploy_key.pub user@server-ip`
  - Copy private key: `cat ~/.ssh/deploy_key`
  - Paste entire content including headers

- [ ] **SERVER_PORT** (Optional)
  - Value: SSH port number
  - Default: `22`

## Local Testing

- [ ] Test development build
  ```bash
  npm install
  npm run dev
  ```

- [ ] Test production build
  ```bash
  npm run build
  npm run preview
  ```

- [ ] Test Docker build
  ```bash
  docker build -t test-app .
  docker run -d -p 8080:80 test-app
  curl http://localhost:8080
  docker stop $(docker ps -q --filter ancestor=test-app)
  ```

- [ ] Test Docker Compose
  ```bash
  docker-compose up --build
  # Visit http://localhost:3000
  docker-compose down
  ```

## Server Preparation

### Install Docker
```bash
ssh user@server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Verify
docker --version
```

- [ ] Docker installed
- [ ] User added to docker group
- [ ] Docker service running

### Install Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker-compose --version
```

- [ ] Docker Compose installed
- [ ] Compose command works

### Configure Firewall
```bash
# Allow HTTP traffic
sudo ufw allow 3000/tcp

# If using reverse proxy
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

- [ ] Firewall configured
- [ ] Required ports open
- [ ] Firewall enabled

### Set Up SSH Keys
```bash
# On local machine
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/deploy_key

# Copy public key to server
ssh-copy-id -i ~/.ssh/deploy_key.pub user@server-ip

# Test connection
ssh -i ~/.ssh/deploy_key user@server-ip "echo 'SSH works!'"
```

- [ ] SSH key pair generated
- [ ] Public key added to server
- [ ] SSH connection tested
- [ ] Private key added to GitHub secrets

## First Deployment

### Trigger CI Workflow
```bash
# Create test branch
git checkout -b test-ci
echo "// CI test" >> src/App.tsx
git add .
git commit -m "test: CI workflow"
git push -u origin test-ci
```

- [ ] CI workflow triggered
- [ ] Linting passed
- [ ] Tests passed (if any)
- [ ] Build successful
- [ ] Docker image built

### Trigger CD Workflow
```bash
# Merge to main or push to main
git checkout main
git merge test-ci
git push origin main
```

- [ ] CD workflow triggered
- [ ] Docker image built
- [ ] Image pushed to Docker Hub
- [ ] SSH connection successful
- [ ] Container deployed
- [ ] Application accessible

## Post-Deployment Verification

### Check GitHub Actions
- [ ] Navigate to: https://github.com/utkarsh232005/CI-CD/actions
- [ ] CI workflow completed successfully
- [ ] CD workflow completed successfully
- [ ] No error messages in logs

### Check Docker Hub
- [ ] Login to: https://hub.docker.com
- [ ] Image pushed successfully
- [ ] Tags are correct (latest, sha)
- [ ] Image size is reasonable

### Check Server
```bash
ssh user@server-ip

# Check container is running
docker ps | grep vite-frontend

# Check logs
docker logs vite-frontend

# Test locally on server
curl http://localhost:80
```

- [ ] Container is running
- [ ] No errors in logs
- [ ] Health check passes
- [ ] App responds to requests

### Check Application
- [ ] Open: http://your-server-ip:3000
- [ ] Application loads correctly
- [ ] No console errors
- [ ] All features work
- [ ] Routing works properly

## Optional Enhancements

### Domain Configuration
- [ ] Domain DNS configured
- [ ] A record points to server IP
- [ ] Domain propagated

### SSL Certificate
```bash
# Install Certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com
```

- [ ] Certbot installed
- [ ] SSL certificate obtained
- [ ] Auto-renewal configured

### Reverse Proxy (Nginx)
```bash
# Install Nginx on server
sudo apt install nginx

# Configure reverse proxy
sudo nano /etc/nginx/sites-available/vite-app
```

- [ ] Nginx installed
- [ ] Reverse proxy configured
- [ ] SSL configured in Nginx
- [ ] Nginx restarted

### Monitoring
- [ ] Application monitoring set up
- [ ] Error tracking configured
- [ ] Uptime monitoring enabled
- [ ] Alerts configured

## Ongoing Maintenance

### Regular Tasks
- [ ] Monitor GitHub Actions workflows
- [ ] Check server disk space
- [ ] Review application logs
- [ ] Update dependencies regularly
- [ ] Backup important data

### When Making Changes
- [ ] Create feature branch
- [ ] Test locally
- [ ] Create pull request
- [ ] Wait for CI to pass
- [ ] Merge to main
- [ ] Verify deployment

## Troubleshooting Checklist

### If CI Fails
- [ ] Check Node.js version
- [ ] Verify dependencies install
- [ ] Run lint locally
- [ ] Run tests locally
- [ ] Check workflow file syntax

### If CD Fails
- [ ] Verify GitHub secrets
- [ ] Test SSH connection
- [ ] Check Docker Hub credentials
- [ ] Verify server has space
- [ ] Check server Docker status

### If App Not Accessible
- [ ] Check firewall settings
- [ ] Verify container is running
- [ ] Check container logs
- [ ] Test from server locally
- [ ] Verify port mapping

## Emergency Procedures

### Rollback Deployment
```bash
ssh user@server-ip

# Stop current container
docker stop vite-frontend
docker rm vite-frontend

# Run previous version
docker run -d --name vite-frontend -p 3000:80 \
  username/vite-frontend:previous-sha

# Or pull specific tag
docker pull username/vite-frontend:v1.0.0
docker run -d --name vite-frontend -p 3000:80 \
  username/vite-frontend:v1.0.0
```

### View Logs
```bash
# Container logs
docker logs vite-frontend -f

# Nginx logs inside container
docker exec vite-frontend tail -f /var/log/nginx/access.log
docker exec vite-frontend tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
# Restart container
docker restart vite-frontend

# Or recreate
docker-compose down
docker-compose up -d
```

## Success Criteria

- [x] ✅ Code pushed to GitHub
- [ ] ✅ GitHub secrets configured
- [ ] ✅ CI workflow passes
- [ ] ✅ CD workflow completes
- [ ] ✅ Docker image on Docker Hub
- [ ] ✅ Container running on server
- [ ] ✅ Application accessible
- [ ] ✅ All features functional

---

## 🎉 Deployment Complete!

When all items are checked, your CI/CD pipeline is fully operational!

**Repository**: https://github.com/utkarsh232005/CI-CD  
**Actions**: https://github.com/utkarsh232005/CI-CD/actions

**Next deployment**: Just push to main! 🚀
