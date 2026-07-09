#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}     GitHub Secrets Verification       ${NC}"
echo -e "${BLUE}========================================${NC}\n"

REPO_URL="https://github.com/utkarsh232005/CI-CD"

echo -e "${YELLOW}This script helps verify your GitHub secrets are configured correctly.${NC}\n"

echo -e "${BLUE}Step 1: Go to your GitHub repository secrets${NC}"
echo -e "URL: ${YELLOW}${REPO_URL}/settings/secrets/actions${NC}\n"

echo -e "${BLUE}Step 2: Verify you have the required secrets${NC}\n"

echo -e "${YELLOW}For Vercel deployment, you need:${NC}"
echo -e "  ✅ ${GREEN}VERCEL_TOKEN${NC}"
echo -e "  ✅ ${GREEN}VERCEL_PROJECT_ID${NC}"
echo -e "  ✅ ${GREEN}VERCEL_ORG_ID${NC}"

echo -e "\n${YELLOW}For Firebase deployment, you need:${NC}"
echo -e "  ✅ ${GREEN}FIREBASE_SERVICE_ACCOUNT${NC}"
echo -e "  ✅ ${GREEN}FIREBASE_PROJECT_ID${NC}"

echo -e "\n${BLUE}Step 3: Check which workflow is active${NC}"

if [ -f ".github/workflows/cd.yml" ]; then
    WORKFLOW_CONTENT=$(head -1 .github/workflows/cd.yml)
    echo -e "✅ Active workflow: ${GREEN}.github/workflows/cd.yml${NC}"
    
    if grep -q "vercel" .github/workflows/cd.yml; then
        echo -e "📋 Deployment target: ${YELLOW}Vercel${NC}"
        echo -e "🔑 Required secrets: VERCEL_TOKEN, VERCEL_PROJECT_ID, VERCEL_ORG_ID"
    elif grep -q "firebase" .github/workflows/cd.yml; then
        echo -e "📋 Deployment target: ${YELLOW}Firebase${NC}"
        echo -e "🔑 Required secrets: FIREBASE_SERVICE_ACCOUNT, FIREBASE_PROJECT_ID"
    else
        echo -e "❓ Deployment target: ${RED}Unknown${NC}"
    fi
else
    echo -e "❌ No CD workflow found at ${RED}.github/workflows/cd.yml${NC}"
fi

echo -e "\n${BLUE}Step 4: Test deployment${NC}"
echo -e "To test your deployment:"
echo -e "  ${YELLOW}git add .${NC}"
echo -e "  ${YELLOW}git commit -m 'Test deployment'${NC}"
echo -e "  ${YELLOW}git push origin main${NC}"

echo -e "\n${BLUE}Step 5: Monitor deployment${NC}"
echo -e "Watch your deployment progress:"
echo -e "  ${YELLOW}${REPO_URL}/actions${NC}"

echo -e "\n${BLUE}Quick Setup Options:${NC}"
echo -e "  📖 ${YELLOW}EASY_SETUP.md${NC} - Web dashboard setup (no CLI)"
echo -e "  🔧 ${YELLOW}setup-deployment.sh${NC} - Interactive CLI setup"  
echo -e "  📚 ${YELLOW}DEPLOYMENT_PLATFORMS.md${NC} - Complete guide"

echo -e "\n${GREEN}Tip: Use the EASY_SETUP.md guide if you had CLI permission issues!${NC}"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}     Ready to deploy? Push to main!     ${NC}"
echo -e "${BLUE}========================================${NC}\n"
