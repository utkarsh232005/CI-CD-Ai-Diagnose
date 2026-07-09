# 🚀 Deployment Guide - Vercel & Firebase

This project supports deployment to both **Vercel** and **Firebase Hosting**. Choose the platform that works best for you!

---

## 🎯 Option 1: Deploy to Vercel (Recommended for Quick Setup)

### Why Vercel?
- ✅ Zero configuration needed
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Preview deployments for PRs
- ✅ Custom domains
- ✅ Edge network

### Setup Steps

#### 1. Install Vercel CLI (Optional for local testing)
```bash
npm install -g vercel
```

#### 2. Get Vercel Credentials

**Method A: Using Vercel CLI (Easiest)**
```bash
# Login to Vercel
vercel login

# Link your project
vercel link

# This will create .vercel folder with project.json
# Copy the values from there
```

**Method B: From Vercel Dashboard**
1. Go to https://vercel.com
2. Sign up or log in
3. Create a new project or select existing
4. Go to **Settings** → **General**
   - Copy your **Project ID**
5. Go to https://vercel.com/account/tokens
   - Create new token
   - Copy the token

6. For Org ID:
   - Go to your team/org settings
   - Or run: `vercel whoami` in terminal

#### 3. Configure GitHub Secrets

Go to: `Settings → Secrets and variables → Actions → New repository secret`

Add these secrets:

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `VERCEL_TOKEN` | Vercel auth token | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | Your Org/Team ID | From `.vercel/project.json` or dashboard |
| `VERCEL_PROJECT_ID` | Your Project ID | From `.vercel/project.json` or dashboard |

#### 4. Deploy!

**Automatic Deployment:**
```bash
# Just push to main branch
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

**Manual Deployment (Local):**
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### 5. Custom Domain (Optional)
1. Go to your Vercel project dashboard
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Update DNS records as instructed

### Vercel Environment Variables

If you need environment variables:

1. Go to **Settings** → **Environment Variables**
2. Add variables like:
   - `VITE_API_URL`
   - `VITE_APP_NAME`
3. Redeploy to apply changes

---

## 🔥 Option 2: Deploy to Firebase Hosting

### Why Firebase?
- ✅ Google's infrastructure
- ✅ Free SSL certificate
- ✅ Custom domains
- ✅ Global CDN
- ✅ Easy rollbacks
- ✅ Can integrate with other Firebase services

### Setup Steps

#### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

#### 2. Login to Firebase
```bash
firebase login
```

#### 3. Initialize Firebase Project

**If you already have a Firebase project:**
```bash
firebase use --add
# Select your project
# Enter an alias (e.g., "production")
```

**If you need to create a new project:**
1. Go to https://console.firebase.google.com
2. Click **Add Project**
3. Enter project name
4. Follow the setup wizard
5. Then run: `firebase use --add`

#### 4. Update .firebaserc

The `.firebaserc` file should look like:
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

Replace `your-project-id` with your actual Firebase project ID.

#### 5. Get Firebase Service Account

1. Go to https://console.firebase.google.com
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file
7. **Copy the entire JSON content**

#### 6. Configure GitHub Secrets

Go to: `Settings → Secrets and variables → Actions → New repository secret`

Add these secrets:

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `FIREBASE_SERVICE_ACCOUNT` | Service account JSON | From Firebase Console (entire JSON) |
| `FIREBASE_PROJECT_ID` | Your project ID | From Firebase Console or `.firebaserc` |

#### 7. Choose Deployment Workflow

You have two CD workflows:
- `cd.yml` - Deploys to Vercel (currently active)
- `cd-firebase.yml` - Deploys to Firebase

**To use Firebase instead of Vercel:**

Option A: Rename files
```bash
# Disable Vercel workflow
mv .github/workflows/cd.yml .github/workflows/cd-vercel.yml.disabled

# Enable Firebase workflow
mv .github/workflows/cd-firebase.yml .github/workflows/cd.yml
```

Option B: Delete Vercel workflow
```bash
rm .github/workflows/cd.yml
mv .github/workflows/cd-firebase.yml .github/workflows/cd.yml
```

#### 8. Deploy!

**Automatic Deployment:**
```bash
git add .
git commit -m "Deploy to Firebase"
git push origin main
```

**Manual Deployment (Local):**
```bash
# Build the app
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

#### 9. Custom Domain (Optional)
```bash
# Add custom domain
firebase hosting:channel:deploy custom-domain

# Or via console
# Go to Firebase Console → Hosting → Add Custom Domain
```

### Firebase Environment Variables

Firebase doesn't directly support environment variables, but you can:

1. Use Vite's `.env` files locally
2. Add them to GitHub Secrets
3. Inject during build in GitHub Actions

Update the workflow:
```yaml
- name: Build application
  env:
    VITE_API_URL: ${{ secrets.VITE_API_URL }}
  run: npm run build
```

---

## 📊 Comparison: Vercel vs Firebase

| Feature | Vercel | Firebase |
|---------|--------|----------|
| **Setup Speed** | ⚡ Fastest | 🔥 Fast |
| **Free Tier** | Generous | Very generous |
| **Custom Domain** | ✅ Yes | ✅ Yes |
| **SSL Certificate** | ✅ Auto | ✅ Auto |
| **Preview Deployments** | ✅ Yes | ✅ Yes (channels) |
| **Analytics** | ✅ Built-in | ✅ Built-in |
| **Edge Network** | ✅ Global | ✅ Global |
| **Rollbacks** | ✅ Easy | ✅ Easy |
| **Backend Integration** | Serverless Functions | Firebase Services |
| **Best For** | JAMstack, Frontend | Google ecosystem integration |

---

## 🧪 Testing Locally

### Test Build
```bash
npm run build
npm run preview
```

### Test with Vercel CLI
```bash
vercel dev
```

### Test with Firebase CLI
```bash
firebase serve
```

---

## 🔄 Switching Between Platforms

### From Vercel to Firebase:
1. Set up Firebase secrets
2. Rename/disable `cd.yml` (Vercel)
3. Activate `cd-firebase.yml`
4. Push to main

### From Firebase to Vercel:
1. Set up Vercel secrets
2. Rename/disable `cd-firebase.yml`
3. Activate `cd.yml` (Vercel)
4. Push to main

### Deploy to Both:
Keep both workflow files active! They'll run in parallel.

---

## 🚨 Troubleshooting

### Vercel Issues

**Problem**: "Team does not have permission to deploy from utkarsh232005 as it is a Protected Git Scope"
**Solution**: 
1. Switch to your personal Vercel account (not team account)
2. Or go to Team Settings → Git Integrations → GitHub → Configure repository access
3. Make sure you're importing to the correct account that has access to your GitHub repos

**Problem**: Deployment fails with "Project not found"
**Solution**: Double-check `VERCEL_PROJECT_ID` and `VERCEL_ORG_ID`

**Problem**: Build fails
**Solution**: Ensure `npm run build` works locally first

**Problem**: 404 on routes
**Solution**: Vercel should auto-detect Vite. If not, check `vercel.json` rewrites

### Firebase Issues

**Problem**: Authentication failed
**Solution**: Regenerate service account key and update secret

**Problem**: "Firebase project not found"
**Solution**: Check `FIREBASE_PROJECT_ID` matches your project

**Problem**: Build fails
**Solution**: Ensure `dist` folder is created by `npm run build`

---

## 📚 Additional Resources

### Vercel:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

### Firebase:
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Custom Domains](https://firebase.google.com/docs/hosting/custom-domain)

---

## ✅ Quick Checklist

### For Vercel:
- [ ] Created Vercel account
- [ ] Created/linked project
- [ ] Added `VERCEL_TOKEN` to GitHub secrets
- [ ] Added `VERCEL_ORG_ID` to GitHub secrets
- [ ] Added `VERCEL_PROJECT_ID` to GitHub secrets
- [ ] Pushed to main branch
- [ ] Verified deployment at Vercel dashboard

### For Firebase:
- [ ] Created Firebase project
- [ ] Installed Firebase CLI
- [ ] Generated service account
- [ ] Added `FIREBASE_SERVICE_ACCOUNT` to GitHub secrets
- [ ] Added `FIREBASE_PROJECT_ID` to GitHub secrets
- [ ] Updated `.firebaserc` with project ID
- [ ] Activated Firebase workflow
- [ ] Pushed to main branch
- [ ] Verified deployment at Firebase console

---

## 🎉 Success!

Once deployed, your app will be available at:

**Vercel**: `https://your-project.vercel.app`
**Firebase**: `https://your-project-id.web.app`

Both platforms provide automatic deployments on every push to main! 🚀
