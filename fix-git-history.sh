#!/bin/bash

# Script to remove sensitive token from git history

echo "🔧 Fixing git history to remove exposed token..."
echo ""

# Step 1: Interactive rebase to edit the commit
echo "Step 1: Amending the problematic commit..."
git rebase -i HEAD~2 << 'REBASE_COMMANDS'
edit 697177d
pick f0a247e
REBASE_COMMANDS

# After the rebase stops, amend the commit
git commit --amend --no-edit

# Continue the rebase
git rebase --continue

echo ""
echo "✅ Git history cleaned!"
echo ""
echo "Now you can push with:"
echo "  git push origin main --force"
echo ""
echo "⚠️  WARNING: This will rewrite history. Make sure no one else is using this branch!"
