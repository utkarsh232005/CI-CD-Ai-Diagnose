#!/bin/bash

# Render Deployment Helper Script
# This script helps you deploy to Render

echo "🚀 Render Deployment Helper"
echo "=============================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git repository not found!"
    echo "💡 Initialize git first: git init"
    exit 1
fi

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "📝 You have uncommitted changes:"
    git status -s
    echo ""
    read -p "Do you want to commit all changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_message
        git add .
        git commit -m "$commit_message"
        echo "✅ Changes committed"
    else
        echo "⚠️  Please commit your changes before deploying"
        exit 1
    fi
fi

# Check if remote exists
if ! git remote | grep -q "origin"; then
    echo "❌ No git remote 'origin' found!"
    echo "💡 Add your GitHub repository:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    exit 1
fi

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push origin main || git push origin master

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://dashboard.render.com"
echo "2. Click 'New +' → 'Blueprint'"
echo "3. Select your repository"
echo "4. Set environment variables:"
echo "   - GITHUB_TOKEN: (from your .env file)"
echo "   - FRONTEND_URL: (your frontend URL)"
echo "5. Click 'Apply' to deploy"
echo ""
echo "📚 For detailed instructions, see RENDER_DEPLOYMENT.md"
echo ""
echo "🔗 Your .env file values:"
echo "   GITHUB_TOKEN: $(grep GITHUB_TOKEN .env | cut -d '=' -f2 | cut -c1-20)..."
echo "   GITHUB_OWNER: $(grep GITHUB_OWNER .env | cut -d '=' -f2)"
echo "   GITHUB_REPO: $(grep GITHUB_REPO .env | cut -d '=' -f2)"
echo ""
