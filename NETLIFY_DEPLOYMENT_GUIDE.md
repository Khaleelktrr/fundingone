# Netlify Deployment Guide

## Prerequisites

1. GitHub account with your code pushed to a repository
2. Netlify account (sign up at https://netlify.com)
3. Backend already deployed on Render

## Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

### 2. Deploy Frontend to Netlify

1. Log in to Netlify at https://app.netlify.com
2. Click **"Add new site"** -> **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Select your repository
5. Configure build settings:

   **Base directory**: `frontend`

   **Build command**: `npm install && npm run build`

   **Publish directory**: `frontend/dist`

   **Environment variables**:
   - Key: `VITE_API_URL`
   - Value: Your Render backend URL (e.g., `https://jamal-backend.onrender.com`)
     **IMPORTANT**: Do NOT add a trailing slash

6. Click **"Deploy site"**

### 3. Configure Custom Domain (Optional)

1. Go to **Site settings** -> **Domain management**
2. Click **"Add custom domain"**
3. Follow the DNS configuration instructions

### 4. Update Backend CORS

After deployment, you need to update your backend environment variable:

1. Go to your Render backend dashboard
2. Navigate to **Environment** settings
3. Update `FRONTEND_URL` to your new Netlify URL (e.g., `https://your-site-name.netlify.app`)
4. Save changes (Render will auto-redeploy)

## Netlify Configuration File

Your `frontend/netlify.toml` has been created with the following configuration:

```toml
[build]
  command = "npm install && npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

This configuration:
- Installs dependencies and builds the project
- Publishes the `dist` directory
- Uses Node.js v18
- Handles client-side routing by redirecting all routes to index.html

## Troubleshooting

### Build Fails on Netlify

If the build fails, check the build logs in Netlify dashboard:

1. Click on the failed deploy
2. Check the build logs for errors
3. Common issues:
   - Missing environment variables
   - Incorrect build command
   - Wrong publish directory

### API Connection Issues

If the frontend can't connect to the backend:

1. Verify `VITE_API_URL` environment variable is set correctly in Netlify
2. Verify backend `FRONTEND_URL` includes your Netlify domain
3. Check browser console for CORS errors
4. Ensure backend is running on Render

### Continuous Deployment

Every time you push to your GitHub repository, Netlify will automatically:
1. Pull the latest code
2. Run the build command
3. Deploy the new version

## Your Live URLs

After deployment:
- **Frontend**: `https://your-site-name.netlify.app`
- **Backend**: Your existing Render URL

## Manual Deployment (Alternative)

If you prefer to deploy without GitHub:

1. Build the project locally:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. Go to Netlify dashboard
3. Drag and drop the `dist` folder to the Netlify drop zone
4. Configure environment variables in Site settings

## Next Steps

1. Test all functionality after deployment
2. Update any documentation with your live URL
3. Share the Netlify URL with users
4. Consider setting up a custom domain for a professional look
