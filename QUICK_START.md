# 🚀 Quick Start Guide - CI/CD Pipeline Setup

## Step 1: Initialize Git Repository

### Option A: Using the Setup Script (Recommended)
```bash
chmod +x setup-github.sh
./setup-github.sh
```

### Option B: Manual Setup
```bash
# Initialize Git
git init

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Stage all files
git add .

# Create initial commit
git commit -m "Initial commit: Setup CI/CD pipeline"

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to `Settings` → `Secrets and variables` → `Actions`
3. Click `New repository secret`
4. Add the following secrets:

### Required Secrets:

#### Docker Hub Configuration
- **DOCKER_HUB_USERNAME**: Your Docker Hub username
  - Get it from: https://hub.docker.com
  
- **DOCKER_HUB_ACCESS_TOKEN**: Docker Hub access token
  - Create at: https://hub.docker.com/settings/security
  - Click "New Access Token"
  - Name it "github-actions"
  - Copy the token (you won't see it again!)

#### Server Configuration
- **SERVER_IP**: Your production server IP address
  - Example: `123.45.67.89`
  
- **SERVER_USER**: SSH username for your server
  - Common values: `ubuntu`, `root`, `admin`
  
- **SSH_PRIVATE_KEY**: Your SSH private key
  - Generate with: `ssh-keygen -t ed25519 -C "github-deploy"`
  - Copy private key: `cat ~/.ssh/id_ed25519`
  - Add public key to server: `ssh-copy-id user@server-ip`
  
- **SERVER_PORT**: (Optional) SSH port, defaults to 22

## Step 3: Test Locally with Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t vite-frontend .
docker run -d -p 3000:80 vite-frontend

# Access the app
open http://localhost:3000
```

## Step 4: Verify CI/CD Workflows

### Check CI Workflow:
1. Create a new branch: `git checkout -b test-ci`
2. Make a small change
3. Push and create a PR: `git push -u origin test-ci`
4. Go to `Actions` tab on GitHub
5. Watch the CI workflow run

### Check CD Workflow:
1. Merge PR to `main` branch
2. Go to `Actions` tab on GitHub
3. Watch the CD workflow run
4. Check your server: `ssh user@server-ip "docker ps"`

## Step 5: Server Setup (First Time Only)

### Install Docker on Your Server:
```bash
# SSH into your server
ssh user@server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Configure Firewall:
```bash
# Allow HTTP traffic on port 3000
sudo ufw allow 3000/tcp

# Or use nginx reverse proxy (port 80)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## Common Commands

### Development:
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code
```

### Docker:
```bash
docker-compose up -d              # Start in background
docker-compose down               # Stop services
docker-compose logs -f            # View logs
docker-compose restart            # Restart services
docker image prune -f             # Clean up old images
```

### Git:
```bash
git status                        # Check status
git add .                         # Stage changes
git commit -m "message"           # Commit changes
git push                          # Push to GitHub
git pull                          # Pull latest changes
```

## Troubleshooting

### CI Workflow Fails:
- Check Node.js version in workflow matches your local version
- Ensure all dependencies are in `package.json`
- Check for lint errors: `npm run lint`

### CD Workflow Fails:
- Verify all GitHub secrets are set correctly
- Check SSH connection: `ssh user@server-ip`
- Verify Docker Hub credentials
- Check server logs: `docker logs vite-frontend`

### Docker Build Fails:
- Clear Docker cache: `docker builder prune`
- Rebuild without cache: `docker build --no-cache -t vite-frontend .`
- Check `.dockerignore` file

### Deployment Issues:
- Check if port 3000 is available: `sudo lsof -i :3000`
- Check container status: `docker ps -a`
- View container logs: `docker logs vite-frontend`
- Restart container: `docker restart vite-frontend`

## Project Structure

```
├── .github/workflows/
│   ├── ci.yml              # Continuous Integration
│   └── cd.yml              # Continuous Deployment
├── src/                    # Source code
├── public/                 # Static assets
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Local Docker setup
├── nginx.conf              # Nginx configuration
├── setup-github.sh         # Setup script
└── QUICK_START.md         # This file
```

## Next Steps

1. ✅ **Customize the App**: Modify components in `src/`
2. ✅ **Add Environment Variables**: Create `.env` file
3. ✅ **Set Up Monitoring**: Add logging and monitoring
4. ✅ **Configure Domain**: Point domain to your server IP
5. ✅ **Add SSL**: Use Let's Encrypt for HTTPS
6. ✅ **Set Up Staging**: Create `develop` branch for staging

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Nginx Documentation](https://nginx.org/en/docs/)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review GitHub Actions logs
3. Check Docker container logs
4. Review this documentation

---

**Happy Deploying! 🚀**
