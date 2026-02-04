# GitHub & Render Deployment Instructions

## Step 1: Initialize Git Repository Locally

Run these commands in your project directory (`C:\Users\HP\OneDrive\Documents\ayomide web dev\APKL`):

```powershell
# Initialize git
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: APKL Learning Management System"
```

## Step 2: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click **"+"** icon (top right) → **"New repository"**
3. Repository name: `apkl-lms`
4. Description: "APKL Learning Management System with real-time video classes"
5. Choose **"Public"** (so Render can access it)
6. Do NOT initialize with README/gitignore (we already have those)
7. Click **"Create repository"**

## Step 3: Connect Local Repo to GitHub

```powershell
# Add GitHub as remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/apkl-lms.git

# Rename branch to main
git branch -M main

# Push all commits to GitHub
git push -u origin main
```

## Step 4: Deploy to Render

1. Go to [render.com](https://render.com)
2. Click **"Sign up"** (or sign in)
3. Click **"New +"** button (top right)
4. Select **"Web Service"**
5. Click **"Connect a repository"**
6. Find and select `apkl-lms` repo
7. Fill in the form:
   - **Name**: `apkl-lms` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
8. Click **"Create Web Service"**

Render will:
- Build your project
- Start the server
- Provide a public URL (e.g., `https://apkl-lms.onrender.com`)

## Step 5: Update Frontend URLs (Important!)

Once you have your Render URL, update the `API_URL` in your frontend files:

In `teacher.html`, `student.html`, `index.html`:
```javascript
// Change from:
const API_URL = window.appConfig?.API_URL || 'http://127.0.0.1:5002';

// To:
const API_URL = window.appConfig?.API_URL || 'https://apkl-lms.onrender.com';
```

Then commit and push:
```powershell
git add .
git commit -m "Update API_URL for Render deployment"
git push origin main
```

Render will automatically redeploy when you push to GitHub.

## Verification

After deployment:
1. Visit your Render URL (e.g., `https://apkl-lms.onrender.com`)
2. Test teacher login → start a class
3. Test student login → join the class
4. Check browser console for any errors
5. Monitor Render logs: Dashboard → Your Service → Logs

## Troubleshooting

### "Failed to connect to server"
- Wait 1-2 minutes for Render to fully deploy
- Check Render logs for startup errors
- Verify `node server.js` runs without errors locally

### "WebSocket connection failed"
- Ensure frontend is using correct Render URL
- Check CORS settings in server.js
- Render uses `wss://` (secure WebSocket) automatically

### "Cannot find module"
- Verify `npm install` completed successfully
- Check all dependencies are in `package.json`
- Run locally first: `npm install && npm start`

## Free Tier Notes

Render's free tier:
- ✅ Works for development/testing
- ❌ Spins down after 15 min of inactivity (cold start)
- ❌ Limited to 400GB/month bandwidth
- Upgrade to Pro for production reliability

## Next Steps

1. ✅ Create GitHub repo (done above)
2. ✅ Push code to GitHub (done above)
3. ✅ Deploy to Render (done above)
4. 📝 Share your Render URL with others
5. 🔄 Continue development: `git push origin main` → auto-redeploy

---

**Need help?** Check Render logs or open an issue on GitHub.
