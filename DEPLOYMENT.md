# 🚀 Absorbey Deployment Guide

## 📋 Prerequisites

Before deploying, make sure you have:
- ✅ GitHub account
- ✅ Vercel account (sign up at https://vercel.com)
- ✅ Anthropic API key
- ✅ Firebase project configured
- ✅ (Optional) YouTube Data API v3 key

---

## 🔗 Step 1: Push to GitHub

### 1.1 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `absorbey`
3. Description: "AI-powered YouTube learning app"
4. Make it **Public** or **Private** (your choice)
5. **DO NOT** initialize with README (we already have one)
6. Click "Create repository"

### 1.2 Push Your Code

Copy and run these commands in your terminal:

```bash
cd /Users/user/absorbey/absorbey

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/absorbey.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🌐 Step 2: Deploy Frontend to Vercel

### 2.1 Import Project

1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your `absorbey` repository
5. Click **"Import"**

### 2.2 Configure Build Settings

Vercel should auto-detect Vite. Verify these settings:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 2.3 Add Environment Variables

Click **"Environment Variables"** and add these:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-api03-5CMhpYXtlBMZwe_7_A8-Q2gYQzjHEC7GM3xiYJnT0RNiQ7yhRKZlp_ldGTLxLrYPG250qftaR22THqy6Qr0RVQ-p-UGqwAA

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

YOUTUBE_API_KEY=AIzaSyDYAjjr8CnVLC0xk5j4wzUSkXii7mGlmXY
```

**Important:** Make sure to select **"Production", "Preview", and "Development"** for all variables.

### 2.4 Deploy

1. Click **"Deploy"**
2. Wait 1-2 minutes for build to complete
3. You'll get a URL like: `https://absorbey-xxxx.vercel.app`

---

## 🖥️ Step 3: Deploy Backend API (Server.js)

### ⚠️ Important Note

The `server.js` file needs to be deployed separately. You have several options:

### Option A: Vercel Serverless Functions (Recommended)

1. Create an `api/` directory in your project
2. Move API endpoints to serverless function format
3. Each endpoint becomes a separate file

**Quick Setup:**
```bash
mkdir -p api
# Create serverless function files
# (We can help with this if you choose this option)
```

### Option B: Railway (Easiest for Node.js apps)

1. Go to https://railway.app/
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select `absorbey`
4. Railway will auto-detect Node.js
5. Add the same environment variables
6. Set **Start Command:** `node server.js`
7. Get your backend URL (e.g., `https://absorbey-production.up.railway.app`)

### Option C: Render

1. Go to https://render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. **Build Command:** `npm install`
5. **Start Command:** `node server.js`
6. Add environment variables
7. Deploy

### 3.1 Update Frontend API URL

Once backend is deployed, update the frontend:

In `src/services/anthropicService.js`, change:
```javascript
const API_SERVER_URL = 'http://localhost:3001'
```

To your deployed backend URL:
```javascript
const API_SERVER_URL = 'https://your-backend-url.railway.app'
```

Commit and push the change, Vercel will auto-redeploy.

---

## 🔐 Step 4: Security Checklist

### ✅ Environment Variables

- [ ] All API keys are in environment variables (not in code)
- [ ] `.env.local` is in `.gitignore` ✅ (already done)
- [ ] Environment variables added to Vercel
- [ ] Environment variables added to backend hosting

### ✅ Firebase Security

1. Go to Firebase Console → Firestore Database → Rules
2. Update rules to secure your data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Projects are private to the user
    match /projects/{projectId} {
      allow read, write: if request.auth != null 
        && resource.data.userId == request.auth.uid;
    }
  }
}
```

### ✅ API Rate Limiting

Consider adding rate limiting to your API to prevent abuse:
- Anthropic has usage limits on your API key
- YouTube Data API has quotas (10,000 requests/day)

---

## 📊 Step 5: Monitor Your App

### Vercel Analytics

1. Go to your Vercel project dashboard
2. Click **"Analytics"** tab
3. View page views, performance, and errors

### Firebase Usage

1. Go to Firebase Console
2. Check **Authentication** for user sign-ups
3. Check **Usage** for API calls

---

## 🐛 Troubleshooting

### "API Server Error" in Browser

**Cause:** Backend server not running or wrong URL

**Fix:**
- Check backend deployment status
- Verify `API_SERVER_URL` in `anthropicService.js`
- Check backend logs for errors

### "Firebase not configured" Error

**Cause:** Environment variables not set correctly

**Fix:**
- Verify all `VITE_FIREBASE_*` variables in Vercel
- Make sure variables are set for Production/Preview/Development
- Redeploy after adding variables

### Summaries Not Detailed

**Cause:** YouTube transcript extraction not working

**Status:** Known issue, working on fix
- App currently uses video title + description
- Full transcript integration coming soon
- Summaries will be much more comprehensive once fixed

---

## 🔄 Updating Your Deployment

### When You Make Changes:

```bash
git add .
git commit -m "Your update message"
git push
```

**Vercel will automatically:**
- Detect the push
- Build and deploy the new version
- Update your live site (usually takes 1-2 minutes)

---

## 🎉 Your Absorbey App is Live!

Once deployed, you can:
- ✅ Share your Vercel URL with anyone
- ✅ Paste YouTube links and get AI summaries
- ✅ Take interactive quizzes
- ✅ Track your learning progress
- ✅ Sign in with Google or Guest mode

**Your URLs:**
- **Frontend:** `https://absorbey-xxxx.vercel.app`
- **Backend:** `https://your-backend.railway.app` (or chosen platform)

---

## 📧 Need Help?

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app/
- Render Docs: https://render.com/docs
- Firebase Docs: https://firebase.google.com/docs

---

**Made with ❤️ - Happy Learning!** 🎓

