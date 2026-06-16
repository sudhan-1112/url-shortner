# URL Shortener Pro

URL Shortener Pro is a production-ready, full-stack web application designed for shortening URLs with custom alias configurations, QR Code generation, CSV bulk upload, link expiration limits, and advanced visitor analytics (such as geolocation, device type, browser breakdown, and daily traffic charts).

## Tech Stack

* **Frontend**: React (Vite), React Router, Axios, Tailwind CSS, Chart.js, Framer Motion
* **Backend**: Node.js, Express.js, JWT Authentication, Bcrypt Password Hashing, User-Agent Parsers
* **Database**: MongoDB with Mongoose ORM

---

## Directory Structure

```
URL Shortener Pro/
├── client/                      # React Frontend App
│   ├── src/
│   │   ├── components/          # Modals (Create, CSV, Navbar, Route check)
│   │   ├── context/             # AuthContext, ThemeContext
│   │   ├── pages/               # Landing, Auth, Dashboard, Stats, Profile, 404
│   │   ├── services/            # Axios API config
│   │   └── index.css            # Custom design tokens, glassmorphism, scrollbars
│   ├── tailwind.config.js       # Tailwind system configuration
│   └── postcss.config.js
│
├── server/                      # Express Backend Server
│   ├── config/                  # Mongoose DB connector
│   ├── controllers/             # Auth, URL CRUD, Analytics aggregations
│   ├── middleware/              # JWT validations, error handlers
│   ├── models/                  # User, URL, and Visit schemas
│   └── routes/                  # Express Router mount endpoints
│
├── README.md                    # Project overview & scripts (This file)
├── architecture.md              # Architecture diagram & security overview
├── api_docs.md                  # Rest API documentation
└── deployment_guide.md          # Guide for Vercel, Render & MongoDB Atlas
```

---

## Getting Started

### Prerequisites
* **Node.js** (v18+ recommended)
* **MongoDB** (Local instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### Local Configuration Setup

#### 1. Configure Server Environment
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/url_shortener_pro
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
BASE_URL=http://localhost:5000
```

#### 2. Run Database
Ensure a local MongoDB server is running:
```powershell
mongod
```

---

## Installation & Running

### Option A: Running the Backend
From the root workspace directory:
```powershell
cd server
npm install
npm run dev
```
The server will boot on `http://localhost:5000`.

### Option B: Running the Frontend
From the root workspace directory:
```powershell
cd client
npm install
npm run dev
```
The Vite client will launch on `http://localhost:5173`.

---

## Features

1. **User Authentication**: Secure user register, login, and token-based route protections.
2. **Dynamic Dashboard**: Full search query filters, click/date sorting, paginated list view, QR display modal, destination editing, and link deletion.
3. **Advanced Analytics**: Line charts for daily trends, browser doughnut segments, device distribution trackers, and country/city visit lists.
4. **Custom Aliases**: Option to define a unique vanity alias for shortened links.
5. **Bulk Imports**: Upload `.csv` spreadsheets to create hundreds of links in one click.
6. **QR Code Utility**: Automatically generates Base64 high-resolution QR codes.
7. **Link Expiration**: Restricts visit traffic to custom deadlines.
