#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${RED}========================================${NC}"
echo -e "${RED}    Fix: Vercel Git Scope Issue        ${NC}"
echo -e "${RED}========================================${NC}\n"

echo -e "${YELLOW}Error: 'Team does not have permission to deploy from utkarsh232005'${NC}\n"

echo -e "${BLUE}This happens when:${NC}"
echo -e "  • You're trying to deploy to a team account"
echo -e "  • But your GitHub repo is in personal account"
echo -e "  • Or the team doesn't have access to your repo\n"

echo -e "${GREEN}✅ Solution Options:${NC}\n"

echo -e "${YELLOW}Option 1: Use Personal Account (Recommended)${NC}"
echo -e "  1. Go to: https://vercel.com/dashboard"
echo -e "  2. Click account switcher (top-left)"
echo -e "  3. Select: ${BLUE}utkarsh232005${NC} (your personal account)"
echo -e "  4. Click 'New Project'"
echo -e "  5. Import: utkarsh232005/CI-CD"
echo -e "  6. Deploy!"

echo -e "\n${YELLOW}Option 2: Fix Team Permissions${NC}"
echo -e "  1. Go to Team Settings"
echo -e "  2. Git Integrations → GitHub"
echo -e "  3. Configure Repository Access"
echo -e "  4. Add access to: utkarsh232005/CI-CD"

echo -e "\n${YELLOW}Option 3: Check Current Account${NC}"
echo -e "  1. Look at Vercel dashboard URL"
echo -e "  2. Should be: vercel.com/utkarsh232005 (not vercel.com/team-name)"
echo -e "  3. If wrong account, switch using account switcher"

echo -e "\n${BLUE}After fixing:${NC}"
echo -e "  1. Get your Project ID from Project Settings"
echo -e "  2. Get your Org ID (should be your username for personal account)"
echo -e "  3. Add GitHub secrets:"
echo -e "     • VERCEL_TOKEN"
echo -e "     • VERCEL_PROJECT_ID" 
echo -e "     • VERCEL_ORG_ID (use: utkarsh232005)"

echo -e "\n${GREEN}Quick Links:${NC}"
echo -e "  • Vercel Dashboard: ${BLUE}https://vercel.com/dashboard${NC}"
echo -e "  • GitHub Secrets: ${BLUE}https://github.com/utkarsh232005/CI-CD/settings/secrets/actions${NC}"
echo -e "  • Account Tokens: ${BLUE}https://vercel.com/account/tokens${NC}"

echo -e "\n${YELLOW}Tip: For personal repos, always use your personal Vercel account!${NC}"

echo -e "\n${RED}========================================${NC}"
echo -e "${GREEN}       Try Option 1 first! 🚀          ${NC}"
echo -e "${RED}========================================${NC}\n"
