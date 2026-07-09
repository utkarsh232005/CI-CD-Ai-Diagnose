#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}  Git & GitHub Repository Setup  ${NC}"
echo -e "${BLUE}==================================${NC}\n"

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${YELLOW}Initializing Git repository...${NC}"
    git init
    echo -e "${GREEN}✓ Git initialized${NC}\n"
else
    echo -e "${GREEN}✓ Git already initialized${NC}\n"
fi

# Get GitHub repository URL
echo -e "${YELLOW}Enter your GitHub repository URL:${NC}"
echo -e "${BLUE}Example: https://github.com/username/repo.git${NC}"
read -p "URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo -e "${RED}❌ No URL provided. Exiting.${NC}"
    exit 1
fi

# Check if remote exists
if git remote get-url origin &> /dev/null; then
    echo -e "${YELLOW}Remote 'origin' already exists. Updating...${NC}"
    git remote set-url origin "$REPO_URL"
else
    echo -e "${YELLOW}Adding remote 'origin'...${NC}"
    git remote add origin "$REPO_URL"
fi
echo -e "${GREEN}✓ Remote configured${NC}\n"

# Configure git user if not set
if [ -z "$(git config user.name)" ]; then
    read -p "Enter your Git username: " GIT_USERNAME
    git config user.name "$GIT_USERNAME"
fi

if [ -z "$(git config user.email)" ]; then
    read -p "Enter your Git email: " GIT_EMAIL
    git config user.email "$GIT_EMAIL"
fi

echo -e "${GREEN}✓ Git user configured${NC}\n"

# Stage all files
echo -e "${YELLOW}Staging files...${NC}"
git add .
echo -e "${GREEN}✓ Files staged${NC}\n"

# Create initial commit
echo -e "${YELLOW}Creating initial commit...${NC}"
git commit -m "Initial commit: Setup CI/CD pipeline with Docker and GitHub Actions" || {
    echo -e "${YELLOW}No changes to commit or commit already exists${NC}"
}
echo -e "${GREEN}✓ Commit created${NC}\n"

# Determine default branch name
DEFAULT_BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo "main")

# Ask to push
echo -e "${YELLOW}Ready to push to GitHub?${NC}"
echo -e "${BLUE}Branch: $DEFAULT_BRANCH${NC}"
read -p "Push now? (y/n): " PUSH_NOW

if [ "$PUSH_NOW" = "y" ] || [ "$PUSH_NOW" = "Y" ]; then
    echo -e "${YELLOW}Pushing to GitHub...${NC}"
    git branch -M main
    git push -u origin main || {
        echo -e "${RED}❌ Push failed. Please check:${NC}"
        echo -e "  1. Repository exists on GitHub"
        echo -e "  2. You have access permissions"
        echo -e "  3. Authentication is configured"
        exit 1
    }
    echo -e "${GREEN}✓ Successfully pushed to GitHub!${NC}\n"
else
    echo -e "${YELLOW}Skipping push. You can push later with:${NC}"
    echo -e "${BLUE}  git branch -M main${NC}"
    echo -e "${BLUE}  git push -u origin main${NC}\n"
fi

# Next steps
echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}     Next Steps - CI/CD Setup     ${NC}"
echo -e "${BLUE}==================================${NC}\n"

echo -e "${GREEN}✓ Git repository configured${NC}"
echo -e "${GREEN}✓ GitHub Actions workflows ready${NC}"
echo -e "${GREEN}✓ Docker configuration complete${NC}\n"

echo -e "${YELLOW}📋 Required GitHub Secrets:${NC}"
echo -e "   Go to: Settings → Secrets and variables → Actions\n"
echo -e "   ${BLUE}DOCKER_HUB_USERNAME${NC}       - Your Docker Hub username"
echo -e "   ${BLUE}DOCKER_HUB_ACCESS_TOKEN${NC}   - Docker Hub access token"
echo -e "   ${BLUE}SERVER_IP${NC}                 - Your server IP address"
echo -e "   ${BLUE}SERVER_USER${NC}               - SSH username"
echo -e "   ${BLUE}SSH_PRIVATE_KEY${NC}           - SSH private key for deployment"
echo -e "   ${BLUE}SERVER_PORT${NC}               - SSH port (optional, default: 22)\n"

echo -e "${YELLOW}🐳 Test Docker locally:${NC}"
echo -e "   ${BLUE}docker-compose up --build${NC}\n"

echo -e "${YELLOW}🚀 Push to 'main' branch to trigger deployment!${NC}\n"

echo -e "${GREEN}Setup complete! 🎉${NC}"
