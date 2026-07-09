#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\0    echo -e "\n${BLUE}Next Steps:${NC}"
    
    if [ -f ".vercel/project.json" ]; then
      echo -e "1. ✅ Project linked! Check the ${YELLOW}.vercel/project.json${NC} file for credentials"
    else
      echo -e "1. ${YELLOW}Manual setup required:${NC}"
      echo -e "   - Go to https://vercel.com and create/import your project"
      echo -e "   - Or install Vercel CLI locally: ${BLUE}npm install vercel${NC}"
      echo -e "   - Then run: ${BLUE}npx vercel link${NC}"
    fi
    
    echo -e "\n2. Add these secrets to GitHub (Settings → Secrets → Actions):"
    echo -e "   - ${YELLOW}VERCEL_TOKEN${NC} - Get from: https://vercel.com/account/tokens"
    
    if [ -f ".vercel/project.json" ]; then
      echo -e "   - ${YELLOW}VERCEL_ORG_ID${NC} - From .vercel/project.json"
      echo -e "   - ${YELLOW}VERCEL_PROJECT_ID${NC} - From .vercel/project.json"
      
      echo -e "\n${BLUE}Your project credentials:${NC}"
      if command -v jq &> /dev/null; then
        echo -e "   ORG_ID: ${YELLOW}$(jq -r '.orgId' .vercel/project.json)${NC}"
        echo -e "   PROJECT_ID: ${YELLOW}$(jq -r '.projectId' .vercel/project.json)${NC}"
      else
        echo -e "   Check ${YELLOW}.vercel/project.json${NC} for orgId and projectId"
      fi
    else
      echo -e "   - ${YELLOW}VERCEL_ORG_ID${NC} - From Vercel dashboard or .vercel/project.json"
      echo -e "   - ${YELLOW}VERCEL_PROJECT_ID${NC} - From Vercel dashboard or .vercel/project.json"
    fi
    
    echo -e "\n3. Push to main branch:"
    echo -e "   ${BLUE}git push origin main${NC}"
    echo -e "\n${GREEN}✓ Your app will be live at: https://your-project.vercel.app${NC}"
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Deployment Platform Setup Wizard     ${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}Choose your deployment platform:${NC}"
echo -e "  ${GREEN}1${NC} - Vercel (Easiest, recommended)"
echo -e "  ${GREEN}2${NC} - Firebase Hosting"
echo -e "  ${GREEN}3${NC} - Docker Self-Hosting"
echo -e "  ${GREEN}4${NC} - Skip (I'll configure manually)"
echo ""
read -p "Enter your choice (1-4): " PLATFORM_CHOICE

case $PLATFORM_CHOICE in
  1)
    echo -e "\n${BLUE}=== Vercel Setup ===${NC}\n"
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
      echo -e "${YELLOW}Vercel CLI not found. Let's install it...${NC}\n"
      echo -e "${BLUE}Choose installation method:${NC}"
      echo -e "  ${GREEN}1${NC} - Install globally with npm (requires sudo)"
      echo -e "  ${GREEN}2${NC} - Install locally in project"
      echo -e "  ${GREEN}3${NC} - Skip CLI and configure manually"
      echo ""
      read -p "Enter choice (1-3): " CLI_CHOICE
      
      case $CLI_CHOICE in
        1)
          echo -e "${YELLOW}Installing globally (you may need to enter your password)...${NC}"
          sudo npm install -g vercel
          if ! command -v vercel &> /dev/null; then
            echo -e "${RED}Global installation failed. Trying local installation...${NC}"
            npm install vercel
            VERCEL_CMD="npx vercel"
          else
            VERCEL_CMD="vercel"
          fi
          ;;
        2)
          echo -e "${YELLOW}Installing locally...${NC}"
          npm install vercel
          VERCEL_CMD="npx vercel"
          ;;
        3)
          echo -e "${YELLOW}Skipping CLI installation${NC}"
          VERCEL_CMD=""
          ;;
        *)
          echo -e "${RED}Invalid choice. Installing locally...${NC}"
          npm install vercel
          VERCEL_CMD="npx vercel"
          ;;
      esac
    else
      VERCEL_CMD="vercel"
    fi
    
    if [ -n "$VERCEL_CMD" ]; then
      echo -e "${GREEN}✓ Vercel CLI ready${NC}\n"
      
      echo -e "${YELLOW}Step 1: Login to Vercel${NC}"
      $VERCEL_CMD login
      
      echo -e "\n${YELLOW}Step 2: Link your project${NC}"
      $VERCEL_CMD link
    else
      echo -e "${YELLOW}CLI skipped - manual configuration required${NC}\n"
    fi
    
    echo -e "\n${GREEN}✓ Project linked!${NC}\n"
    
    echo -e "${BLUE}Next Steps:${NC}"
    echo -e "1. Check the ${YELLOW}.vercel/project.json${NC} file for your credentials"
    echo -e "2. Add these secrets to GitHub (Settings → Secrets → Actions):"
    echo -e "   - ${YELLOW}VERCEL_TOKEN${NC} - Get from: https://vercel.com/account/tokens"
    echo -e "   - ${YELLOW}VERCEL_ORG_ID${NC} - From .vercel/project.json"
    echo -e "   - ${YELLOW}VERCEL_PROJECT_ID${NC} - From .vercel/project.json"
    echo -e "\n3. Push to main branch:"
    echo -e "   ${BLUE}git push origin main${NC}"
    echo -e "\n${GREEN}✓ Your app will be live at: https://your-project.vercel.app${NC}"
    ;;
    
  2)
    echo -e "\n${BLUE}=== Firebase Setup ===${NC}\n"
    
    # Check if Firebase CLI is installed
    if ! command -v firebase &> /dev/null; then
      echo -e "${YELLOW}Firebase CLI not found. Installing...${NC}"
      npm install -g firebase-tools
    fi
    
    echo -e "${GREEN}✓ Firebase CLI installed${NC}\n"
    
    echo -e "${YELLOW}Step 1: Login to Firebase${NC}"
    firebase login
    
    echo -e "\n${YELLOW}Step 2: Initialize Firebase Hosting${NC}"
    echo -e "${BLUE}When prompted:${NC}"
    echo -e "  - Select ${YELLOW}Hosting${NC}"
    echo -e "  - Use existing project or create new"
    echo -e "  - Public directory: ${YELLOW}dist${NC}"
    echo -e "  - Single-page app: ${YELLOW}Yes${NC}"
    echo -e "  - GitHub Actions: ${YELLOW}No${NC} (we already have it)\n"
    
    firebase init hosting
    
    echo -e "\n${GREEN}✓ Firebase initialized!${NC}\n"
    
    # Switch workflow
    echo -e "${YELLOW}Switching to Firebase workflow...${NC}"
    if [ -f .github/workflows/cd.yml ]; then
      mv .github/workflows/cd.yml .github/workflows/cd-vercel.yml.backup
      echo -e "${GREEN}✓ Vercel workflow backed up${NC}"
    fi
    
    if [ -f .github/workflows/cd-firebase.yml ]; then
      mv .github/workflows/cd-firebase.yml .github/workflows/cd.yml
      echo -e "${GREEN}✓ Firebase workflow activated${NC}"
    fi
    
    echo -e "\n${BLUE}Next Steps:${NC}"
    echo -e "1. Get Firebase Service Account:"
    echo -e "   - Go to: https://console.firebase.google.com"
    echo -e "   - Select your project"
    echo -e "   - Project Settings → Service Accounts"
    echo -e "   - Generate New Private Key"
    echo -e "   - Copy the entire JSON content"
    echo -e "\n2. Add these secrets to GitHub (Settings → Secrets → Actions):"
    echo -e "   - ${YELLOW}FIREBASE_SERVICE_ACCOUNT${NC} - The entire JSON from above"
    echo -e "   - ${YELLOW}FIREBASE_PROJECT_ID${NC} - Your project ID"
    echo -e "\n3. Commit and push:"
    echo -e "   ${BLUE}git add .${NC}"
    echo -e "   ${BLUE}git commit -m 'Configure Firebase deployment'${NC}"
    echo -e "   ${BLUE}git push origin main${NC}"
    echo -e "\n${GREEN}✓ Your app will be live at: https://your-project.web.app${NC}"
    ;;
    
  3)
    echo -e "\n${BLUE}=== Docker Self-Hosting Setup ===${NC}\n"
    echo -e "${YELLOW}This option requires:${NC}"
    echo -e "  - A VPS or cloud server"
    echo -e "  - Docker installed on the server"
    echo -e "  - SSH access to the server\n"
    
    read -p "Do you have a server ready? (y/n): " HAS_SERVER
    
    if [ "$HAS_SERVER" = "y" ] || [ "$HAS_SERVER" = "Y" ]; then
      echo -e "\n${BLUE}Testing Docker locally first...${NC}"
      
      if command -v docker &> /dev/null; then
        echo -e "${YELLOW}Building Docker image...${NC}"
        docker build -t vite-frontend .
        
        if [ $? -eq 0 ]; then
          echo -e "${GREEN}✓ Docker build successful!${NC}\n"
          
          read -p "Run container locally for testing? (y/n): " RUN_LOCAL
          if [ "$RUN_LOCAL" = "y" ] || [ "$RUN_LOCAL" = "Y" ]; then
            echo -e "${YELLOW}Starting container...${NC}"
            docker run -d -p 3000:80 --name vite-frontend-test vite-frontend
            echo -e "${GREEN}✓ Container running at http://localhost:3000${NC}"
            echo -e "Stop it later with: ${BLUE}docker stop vite-frontend-test${NC}"
          fi
        else
          echo -e "${RED}✗ Docker build failed${NC}"
          exit 1
        fi
      else
        echo -e "${RED}✗ Docker not found. Please install Docker first.${NC}"
        exit 1
      fi
      
      echo -e "\n${BLUE}Next Steps for Server Deployment:${NC}"
      echo -e "1. Add these secrets to GitHub:"
      echo -e "   - ${YELLOW}DOCKER_HUB_USERNAME${NC}"
      echo -e "   - ${YELLOW}DOCKER_HUB_ACCESS_TOKEN${NC}"
      echo -e "   - ${YELLOW}SERVER_IP${NC}"
      echo -e "   - ${YELLOW}SERVER_USER${NC}"
      echo -e "   - ${YELLOW}SSH_PRIVATE_KEY${NC}"
      echo -e "\n2. See ${YELLOW}DEPLOYMENT_PLATFORMS.md${NC} for detailed instructions"
    else
      echo -e "${YELLOW}Get a server first:${NC}"
      echo -e "  - DigitalOcean: https://digitalocean.com"
      echo -e "  - Linode: https://linode.com"
      echo -e "  - AWS EC2: https://aws.amazon.com/ec2"
      echo -e "  - Hetzner: https://hetzner.com"
    fi
    ;;
    
  4)
    echo -e "\n${YELLOW}Skipping automatic setup${NC}"
    echo -e "See ${BLUE}DEPLOYMENT_PLATFORMS.md${NC} for manual configuration"
    ;;
    
  *)
    echo -e "${RED}Invalid choice${NC}"
    exit 1
    ;;
esac

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}Setup complete! 🎉${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}Additional Resources:${NC}"
echo -e "  - Full guide: ${BLUE}DEPLOYMENT_PLATFORMS.md${NC}"
echo -e "  - Quick start: ${BLUE}QUICK_START.md${NC}"
echo -e "  - README: ${BLUE}README.md${NC}"
echo -e "\n${GREEN}Happy deploying! 🚀${NC}\n"
