# Deployment Guide - URL Shortener Pro

This guide outlines steps to host your **URL Shortener Pro** application in production using MongoDB Atlas, Render, and Vercel.

---

## 1. Database: MongoDB Atlas Setup

1. **Sign Up / Log In**: Access [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. **Create Cluster**: Select the free shared tier (M0) and pick a cloud region near your target users.
3. **Database User**: Create a database user with read/write access. Write down the username and password securely.
4. **Network Access**: Add IP address `0.0.0.0/30` or `0.0.0.0/0` (allow access from anywhere) so Render server IPs can query the database.
5. **Get Connection String**: Under Cluster -> Connect -> Drivers, copy the application connection string:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/url_shortener_pro?retryWrites=true&w=majority`
   Replace `<username>` and `<password>` with your database user credentials.

---

## 2. Backend Server: Render Deployment

1. **Create Account**: Go to [Render](https://render.com) and link your GitHub repository.
2. **Create New Web Service**:
   * Click **New** -> **Web Service**.
   * Link your repository.
3. **Configure Service**:
   * **Name**: `url-shortener-pro-api`
   * **Root Directory**: `server`
   * **Language / Environment**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
4. **Configure Environment Variables**:
   Under **Environment**, click **Add Environment Variable**:
   * `PORT`: `10000` (or leave default, Render sets this automatically)
   * `MONGODB_URI`: `<Your MongoDB Atlas connection URI>`
   * `JWT_SECRET`: `<A random, cryptographically secure string>`
   * `CLIENT_URL`: `https://your-frontend-app.vercel.app` (Add Vercel domain once created)
   * `BASE_URL`: `https://your-backend-app.onrender.com` (Render service URL)
5. **Deploy**: Click **Create Web Service**. Wait for the logs to show `MongoDB Connected` and server running.

---

## 3. Frontend Client: Vercel Deployment

1. **Create Account**: Go to [Vercel](https://vercel.com) and import your GitHub repository.
2. **Import Project**:
   * Link the repository.
   * **Root Directory**: Select `client`.
   * **Framework Preset**: `Vite`.
3. **Configure Environment Variables**:
   Under **Environment Variables**, configure the connection parameter:
   * `VITE_API_URL`: `https://your-backend-app.onrender.com/api` (Copy Render web service URL)
4. **Build Settings**:
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
5. **Deploy**: Click **Deploy**. Vercel will build the frontend files and deploy them.

---

## 4. Post-Deployment Updates

Once both domains are active:
1. Go back to your **Render Web Service Settings**.
2. Update the `CLIENT_URL` environment variable to match your new Vercel domain, e.g., `https://url-shortener-pro.vercel.app`.
3. Trigger a redeploy on Render to load the updated CORS origin value.
