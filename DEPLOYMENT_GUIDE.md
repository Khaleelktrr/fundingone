# Deployment Guide for Jamal Ustha Admin Panel

This guide will help you publish your website online using **Vercel** (for the frontend) and **Render** (for the backend and database).

## Prerequisites

1.  **GitHub Account**: You need to push your code to a GitHub repository.
2.  **Render Account**: Sign up at [render.com](https://render.com).
3.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).

---

## Step 1: Push Code to GitHub

1.  Create a new repository on GitHub.
2.  Open your terminal in the project folder (`c:\Users\khale\Downloads\jamal ustha`).
3.  Run the following commands:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin <YOUR_GITHUB_REPO_URL>
    git push -u origin main
    ```

---

## Step 2: Deploy Database & Backend (Render)

1.  **Create Database**:
    *   Log in to Render.
    *   Click **New +** -> **PostgreSQL**.
    *   Name: `jamal-ustha-db`.
    *   Region: Choose one close to you (e.g., Singapore).
    *   Plan: **Free**.
    *   Click **Create Database**.
    *   **Copy the "Internal Database URL"** (for backend) and **"External Database URL"** (for your local testing if needed).

2.  **Deploy Backend**:
    *   Click **New +** -> **Web Service**.
    *   Connect your GitHub repository.
    *   **Root Directory**: `backend`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
    *   **Environment Variables** (Click "Advanced" or "Environment"):
        *   `DATABASE_URL`: Paste the **Internal Database URL** from the database you just created.
        *   `JWT_SECRET`: Enter a secure random string (e.g., `mysecretkey123`).
        *   `NODE_ENV`: `production`
        *   `ADMIN_USERNAME`: Set your desired admin username (e.g., `admin`).
        *   `ADMIN_PASSWORD`: Set your desired admin password (e.g., `admin123`).
    *   Click **Create Web Service**.
    *   Wait for deployment to finish. **Copy the Backend URL** (e.g., `https://jamal-backend.onrender.com`).

---

## Step 3: Deploy Frontend (Vercel)

1.  Log in to Vercel.
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Framework Preset**: It should auto-detect **Vite**.
5.  **Root Directory**: Click "Edit" and select `frontend`.
6.  **Environment Variables**:
    *   Key: `VITE_API_URL`
    *   Value: Paste your **Render Backend URL** (e.g., `https://jamal-backend.onrender.com`). **IMPORTANT**: Do not add a trailing slash `/`.
7.  Click **Deploy**.

---

## Step 4: Final Configuration

1.  Go back to your **Render Backend Dashboard**.
2.  Add a new Environment Variable:
    *   Key: `FRONTEND_URL`
    *   Value: Your new **Vercel Frontend URL** (e.g., `https://jamal-frontend.vercel.app`).
3.  Render will auto-redeploy the backend.

## 🎉 Done!
Your website is now live!
-   **Frontend**: `https://jamal-frontend.vercel.app` (Share this link)
-   **Backend**: `https://jamal-backend.onrender.com` (API only)
