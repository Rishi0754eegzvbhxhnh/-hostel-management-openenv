# 🚀 Hostel Management System - Deployment Guide

## 📋 Deployment Options

We'll cover 3 popular deployment platforms:
1. **Vercel** (Frontend) + **Render** (Backend) - Recommended
2. **Railway** (Full Stack)
3. **Heroku** (Full Stack)

---

## 🎯 Option 1: Vercel + Render (RECOMMENDED)

### Why This Combo?
- ✅ **Free tier available**
- ✅ **Easy setup**
- ✅ **Automatic deployments from Git**
- ✅ **Great performance**
- ✅ **Custom domains**

---

## 📦 Part A: Deploy Backend to Render

### Step 1: Prepare Backend for Deployment

1. **Create `backend/.gitignore`** (if not exists):
```
node_modules/
.env
*.log
```

2. **Update `backend/package.json`** - Add start script:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

3. **Create `backend/render.yaml`**:
```yaml
services:
  - type: web
    name: hostel-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

### Step 2: Deploy to Render

1. **Go to** [render.com](https://render.com)
2. **Sign up/Login** with GitHub
3. **Click "New +"** → **"Web Service"**
4. **Connect your GitHub repository**
5. **Configure:**
   - **Name**: `hostel-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

6. **Add Environment Variables:**
   Click "Environment" tab and add:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   CLIENT_URL=https://your-frontend-url.vercel.app
   NEWSDATA_API_KEY=pub_afcaf271fc224c099f62cba1c0c1682f
   GEMINI_API_KEY=your_gemini_key
   XAI_API_KEY=your_xai_key
   AI_PROVIDER=xai
   ```

7. **Click "Create Web Service"**
8. **Wait for deployment** (5-10 minutes)
9. **Copy your backend URL**: `https://hostel-backend-xxxx.onrender.com`

---

## 🎨 Part B: Deploy Frontend to Vercel

### Step 1: Prepare Frontend for Deployment

1. **Update API URLs** - Create `src/config.js`:
```javascript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

2. **Update all API calls** - Replace `http://localhost:5000` with `API_URL`:

Example in `src/components/AriaAssistant.jsx`:
```javascript
import { API_URL } from '../config';

// Change this:
const res = await axios.post(`http://localhost:5000/api/ai/chat`, { query: msg });

// To this:
const res = await axios.post(`${API_URL}/api/ai/chat`, { query: msg });
```

3. **Create `.env.production`**:
```
VITE_API_URL=https://hostel-backend-xxxx.onrender.com
```

4. **Create `vercel.json`**:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Step 2: Deploy to Vercel

1. **Go to** [vercel.com](https://vercel.com)
2. **Sign up/Login** with GitHub
3. **Click "Add New"** → **"Project"**
4. **Import your GitHub repository**
5. **Configure:**
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. **Add Environment Variable:**
   ```
   VITE_API_URL=https://hostel-backend-xxxx.onrender.com
   ```

7. **Click "Deploy"**
8. **Wait for deployment** (2-3 minutes)
9. **Copy your frontend URL**: `https://hostel-system.vercel.app`

### Step 3: Update Backend CORS

Go back to Render and update `CLIENT_URL` environment variable:
```
CLIENT_URL=https://hostel-system.vercel.app
```

---

## 🚂 Option 2: Deploy to Railway (Full Stack)

### Step 1: Prepare for Railway

1. **Create `railway.json`** in root:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. **Create `Procfile`** in root:
```
web: npm start
```

3. **Update `package.json`** in root:
```json
{
  "scripts": {
    "start": "node backend/server.js",
    "build": "npm run build:frontend",
    "build:frontend": "npm install && npm run build"
  }
}
```

### Step 2: Deploy to Railway

1. **Go to** [railway.app](https://railway.app)
2. **Sign up/Login** with GitHub
3. **Click "New Project"** → **"Deploy from GitHub repo"**
4. **Select your repository**
5. **Add Environment Variables** (same as Render)
6. **Click "Deploy"**
7. **Generate Domain**: Settings → Generate Domain

---

## 🔧 Option 3: Deploy to Heroku

### Step 1: Install Heroku CLI

```bash
# Windows (PowerShell)
winget install Heroku.HerokuCLI

# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Prepare for Heroku

1. **Create `Procfile`** in root:
```
web: node backend/server.js
```

2. **Create `.slugignore`**:
```
*.md
.git
.gitignore
```

### Step 3: Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create new app
heroku create hostel-management-system

# Add MongoDB addon (optional)
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
# ... add all other env vars

# Deploy
git push heroku main

# Open app
heroku open
```

---

## 🗄️ MongoDB Atlas Setup (Required for All Options)

### Step 1: Create MongoDB Atlas Account

1. **Go to** [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Sign up** for free
3. **Create a cluster** (Free M0 tier)

### Step 2: Configure Database

1. **Database Access**:
   - Create a database user
   - Username: `hostel_admin`
   - Password: Generate strong password
   - Save credentials!

2. **Network Access**:
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, restrict to your server IPs

3. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Example: `mongodb+srv://hostel_admin:PASSWORD@cluster0.xxxxx.mongodb.net/hostelDB?retryWrites=true&w=majority`

### Step 3: Seed Production Database

```bash
# Update backend/.env with production MongoDB URI
MONGO_URI=mongodb+srv://hostel_admin:PASSWORD@cluster0.xxxxx.mongodb.net/hostelDB

# Run seed script
cd backend
node seedRooms.js
```

---

## 🔐 Environment Variables Checklist

Make sure you have all these set in your deployment platform:

### Required:
- ✅ `PORT` - 5000
- ✅ `MONGO_URI` - MongoDB Atlas connection string
- ✅ `JWT_SECRET` - Random secure string
- ✅ `CLIENT_URL` - Your frontend URL

### OAuth (Optional but Recommended):
- ✅ `GOOGLE_CLIENT_ID`
- ✅ `GOOGLE_CLIENT_SECRET`
- ✅ `GITHUB_CLIENT_ID`
- ✅ `GITHUB_CLIENT_SECRET`

### AI Services:
- ✅ `NEWSDATA_API_KEY` - pub_afcaf271fc224c099f62cba1c0c1682f
- ✅ `GEMINI_API_KEY` - Your Gemini API key
- ✅ `XAI_API_KEY` - Your xAI API key
- ✅ `AI_PROVIDER` - xai or gemini

### Optional:
- `TELEGRAM_BOT_TOKEN`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

---

## 🔄 Update OAuth Redirect URLs

After deployment, update your OAuth app settings:

### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. APIs & Services → Credentials
4. Edit OAuth 2.0 Client
5. Add Authorized redirect URIs:
   ```
   https://your-backend-url.onrender.com/api/auth/google/callback
   https://your-frontend-url.vercel.app
   ```

### GitHub OAuth:
1. Go to [GitHub Settings](https://github.com/settings/developers)
2. OAuth Apps → Your App
3. Update:
   - Homepage URL: `https://your-frontend-url.vercel.app`
   - Authorization callback URL: `https://your-backend-url.onrender.com/api/auth/github/callback`

---

## ✅ Post-Deployment Checklist

### Test These Features:
- [ ] Frontend loads correctly
- [ ] Backend health check: `https://your-backend-url/health`
- [ ] Login with email/password
- [ ] Login with Google OAuth
- [ ] Login with GitHub OAuth
- [ ] Room booking works
- [ ] 360° virtual tour loads
- [ ] Aria AI responds correctly
- [ ] News feed loads
- [ ] Dashboard displays data

### Performance Checks:
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Images load properly
- [ ] Mobile responsive
- [ ] No console errors

---

## 🐛 Common Deployment Issues & Fixes

### Issue 1: CORS Error
**Error**: "Access to fetch blocked by CORS policy"

**Fix**: Update backend `CLIENT_URL` environment variable with your frontend URL

### Issue 2: MongoDB Connection Failed
**Error**: "MongoNetworkError: connection timed out"

**Fix**: 
1. Check MongoDB Atlas Network Access
2. Add 0.0.0.0/0 to IP whitelist
3. Verify connection string is correct

### Issue 3: OAuth Not Working
**Error**: "Redirect URI mismatch"

**Fix**: Update OAuth app redirect URLs with production URLs

### Issue 4: Environment Variables Not Loading
**Error**: "undefined is not a function"

**Fix**: 
1. Verify all env vars are set in deployment platform
2. Restart the service
3. Check for typos in variable names

### Issue 5: Build Fails
**Error**: "npm ERR! code ELIFECYCLE"

**Fix**:
1. Check Node version compatibility
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install` again
4. Commit and redeploy

---

## 📊 Monitoring & Maintenance

### Render Dashboard:
- View logs: Dashboard → Your Service → Logs
- Monitor usage: Dashboard → Your Service → Metrics
- Restart service: Dashboard → Your Service → Manual Deploy

### Vercel Dashboard:
- View deployments: Dashboard → Your Project → Deployments
- Check analytics: Dashboard → Your Project → Analytics
- View logs: Click on deployment → Function Logs

### MongoDB Atlas:
- Monitor performance: Clusters → Metrics
- View logs: Clusters → Logs
- Set up alerts: Alerts → Create Alert

---

## 🚀 Quick Deploy Commands

### For Vercel (Frontend):
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd /path/to/project
vercel

# Follow prompts
```

### For Render (Backend):
```bash
# No CLI needed - use web dashboard
# Or connect GitHub for auto-deploy
```

---

## 🎯 Production Optimization Tips

### 1. Enable Caching:
Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. Compress Images:
Use services like TinyPNG or ImageOptim before deployment

### 3. Enable Gzip:
Render and Vercel enable this by default

### 4. Use CDN:
Vercel automatically uses CDN for static assets

### 5. Database Indexing:
Add indexes to frequently queried fields in MongoDB

---

## 📞 Support & Resources

### Documentation:
- **Vercel**: https://vercel.com/docs
- **Render**: https://render.com/docs
- **Railway**: https://docs.railway.app
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

### Community:
- **Vercel Discord**: https://vercel.com/discord
- **Render Community**: https://community.render.com
- **Stack Overflow**: Tag your questions with platform name

---

## 🎉 You're Ready to Deploy!

Choose your preferred option and follow the steps. The Vercel + Render combo is recommended for beginners.

**Estimated Time**: 30-45 minutes for first deployment

**Good luck! 🚀**
