# NagarVoice Backend API - Complete Setup Guide

## 🎯 Overview

NagarVoice Backend is a **Node.js Express API** connected to **Supabase PostgreSQL** (free tier). This guide covers everything from database setup to API deployment.

---

## 📋 Prerequisites

- ✅ Node.js 16+ installed
- ✅ npm package manager
- ✅ Supabase account (free tier available at https://supabase.com)

---

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── server.js                    # Main Express server
│   ├── config/
│   │   ├── database.js              # PostgreSQL connection
│   │   └── database-schema.sql      # SQL schema (create in Supabase)
│   ├── controllers/
│   │   ├── authController.js        # User auth logic
│   │   └── issueController.js       # Issue management
│   ├── routes/
│   │   ├── auth.js                  # /api/auth endpoints
│   │   └── issues.js                # /api/issues endpoints
│   └── middleware/
│       └── auth.js                  # JWT authentication
├── package.json                     # Dependencies
└── .env.example                     # Configuration template
```

---

## 🚀 Step 1: Create Supabase Database

### 1.1 Sign Up / Login to Supabase
- Go to https://supabase.com
- Click "Start your project"
- Sign up with email or GitHub

### 1.2 Create Project
1. Click "New Project"
2. Fill in:
   - **Project name:** `nagarvoice`
   - **Database password:** Create strong password (save it!)
   - **Region:** Select region closest to India (preferably Southeast Asia)
3. Click "Create new project" (wait 5-10 minutes)

### 1.3 Get Connection String
1. Go to Project Settings → Database → Connection string
2. Copy the **PostgreSQL Connection String** (URI)
3. Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

---

## 🔐 Step 2: Create Database Tables

### 2.1 Access SQL Editor
1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**

### 2.2 Run Schema
1. Copy entire content from `backend/src/config/database-schema.sql`
2. Paste into Supabase SQL editor
3. Click **"Run"** button
4. Wait for completion ✅

**Tables created:**
- ✅ `users` — User profiles & civic scores
- ✅ `issues` — Civic issue reports
- ✅ `comments` — Issue discussions
- ✅ `issue_timeline` — Status history
- ✅ `upvotes` — User upvotes
- ✅ `notifications` — User alerts
- ✅ `user_badges` — Achievements

---

## 🛠️ Step 3: Configure Backend

### 3.1 Copy Environment Template
```bash
cd backend
cp .env.example .env
```

### 3.2 Edit `.env` File
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_API_KEY=your-anon-public-key
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.REGION.supabase.co:5432/postgres

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (change in production!)
JWT_SECRET=your-super-secret-jwt-key-2024
```

**Where to find these:**
- `SUPABASE_URL` → Project Settings → API
- `SUPABASE_API_KEY` → Project Settings → API (anon public)
- `DATABASE_URL` → Project Settings → Database → Connection string (PostgreSQL)

### 3.3 Install Dependencies
```bash
npm install
```

---

## ✅ Step 4: Test Backend

### 4.1 Start Development Server
```bash
npm run dev
```

You should see:
```
✅ Supabase PostgreSQL connected successfully
🚀 NagarVoice Backend running on http://localhost:5000
```

### 4.2 Test Health Check
```bash
curl http://localhost:5000/health
```

Response:
```json
{ "status": "API is running ✅" }
```

### 4.3 Test Login API
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","otp":"1234"}'
```

---

## 📡 API Endpoints Reference

### Authentication Routes

#### **Login / Create User**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "phone": "9876543210",
  "otp": "1234"
}

Response: { "success": true, "token": "jwt...", "user": {...} }
```

#### **Register New User**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "phone": "9876543210",
  "name": "John Doe",
  "email": "john@example.com",
  "ward": "Koramangala",
  "area": "Koramangala",
  "address": "123 Main St",
  "pincode": "560034"
}
```

#### **Get User Profile** (Protected)
```bash
GET /api/auth/profile/user_9876543210
Authorization: Bearer JWT_TOKEN
```

---

### Issue Routes

#### **Get All Issues** (with filters)
```bash
GET /api/issues?ward=Koramangala&status=reported&category=pothole&limit=10&offset=0
```

#### **Get Single Issue**
```bash
GET /api/issues/ISS1234567890
```

Response includes: issue details, comments, timeline

#### **Create New Issue** (Protected)
```bash
POST /api/issues/user_9876543210
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "category": "pothole",
  "title": "Large pothole on Main Road",
  "description": "Deep pothole near bus stop",
  "ward": "Koramangala",
  "address": "Main Road, Koramangala",
  "latitude": 12.9352,
  "longitude": 77.6245,
  "priority": "high",
  "photo_url": "https://..."
}
```

#### **Update Issue Status** (Protected)
```bash
PATCH /api/issues/ISS1234567890/status
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "status": "in-progress",
  "note": "Repair crew dispatched"
}
```

#### **Upvote Issue** (Protected)
```bash
POST /api/issues/ISS1234567890/upvote
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "userId": "user_9876543210"
}
```

---

## 🎯 OTP for Testing

Use this OTP for all login tests:
```
OTP: 1234
```

---

## 📱 Frontend Integration

### Update Frontend `.env`
```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

### Update Frontend API Calls
```javascript
// Before (localStorage):
const issues = JSON.parse(localStorage.getItem('nagarvoice_issues'));

// After (API):
const response = await fetch(`${API_BASE_URL}/issues`);
const { issues } = await response.json();
```

---

## 🌐 Deploy Backend to Azure App Service

### Step 1: Build for Production
```bash
cd backend
npm install --production
```

### Step 2: Create Azure App Service
```bash
az appservice plan create \
  --name nagarvoice-plan \
  --resource-group your-rg \
  --sku B1

az webapp create \
  --resource-group your-rg \
  --plan nagarvoice-plan \
  --name nagarvoice-api \
  --runtime "node|18"
```

### Step 3: Deploy
```bash
cd backend
zip -r deploy.zip . -x "node_modules/*" ".git/*"

az webapp deployment source config-zip \
  --resource-group your-rg \
  --name nagarvoice-api \
  --src-path deploy.zip
```

### Step 4: Set Environment Variables
```bash
az webapp config appsettings set \
  --resource-group your-rg \
  --name nagarvoice-api \
  --settings \
  DATABASE_URL="postgresql://..." \
  NODE_ENV="production" \
  JWT_SECRET="your-secret"
```

### API URL
```
https://nagarvoice-api.azurewebsites.net/api
```

---

## 🐛 Troubleshooting

### Error: `connect ECONNREFUSED`
**Solution:** Check DATABASE_URL is correct and Supabase is running

### Error: `Invalid OTP`
**Solution:** Use OTP `1234` for testing

### Error: `Unauthorized - Invalid token`
**Solution:** Include `Authorization: Bearer JWT_TOKEN` header

### Error: `User already exists`
**Solution:** Register with different phone number

### Database Query Fails
**Solution:** Ensure all tables exist in Supabase SQL editor

---

## 📊 Database Schema Overview

### Users Table
- `user_id` (TEXT, PRIMARY KEY)
- `phone` (VARCHAR 10, UNIQUE)
- `name`, `email`, `ward`, `zone`
- `civic_score`, `tier`, `points`
- `issues_reported`, `issues_resolved`, `total_upvotes_received`
- Timestamps: `joined_at`, `last_login`, `created_at`, `updated_at`

### Issues Table
- `issue_id` (TEXT, PRIMARY KEY)
- `category`, `title`, `description`, `ward`
- `status` (reported/acknowledged/in-progress/resolved/escalated)
- `priority` (critical/high/medium/low)
- `location` (latitude, longitude, address)
- `reported_by`, `reporter_name`, `anonymous`
- `upvotes`, `photo_url`, `after_photo_url`
- `assigned_to`
- Timestamps: `created_at`, `updated_at`

### Comments Table
- `comment_id`, `issue_id`, `user_id`
- `user_name`, `text`
- `created_at`

### Issue Timeline Table
- `timeline_id`, `issue_id`
- `status`, `note`
- `created_at`

### Upvotes Table
- `upvote_id`, `issue_id`, `user_id`
- `created_at`
- Unique constraint on (issue_id, user_id)

### Notifications Table
- `notification_id`, `user_id`, `issue_id`
- `type`, `title`, `message`
- `is_read`
- `created_at`

### User Badges Table
- `badge_id`, `user_id`
- `badge_name`
- `earned_at`

---

## 💰 Cost Breakdown

### Supabase Pricing (Free Tier)
✅ **FREE FOREVER**
- 500 MB database storage
- 1 GB bandwidth per month
- Up to 50,000 monthly active users
- Real-time features included

### Production Tier
- $50/month for Pro
- Includes 8 GB storage, 250 GB bandwidth
- Paid features only when needed

---

## 🔒 Security Best Practices

1. **JWT Secret:** Use strong random string in production
2. **Environment Variables:** Never commit `.env` to git
3. **Database Password:** Store securely, never share
4. **API Key:** Use Supabase RLS (Row Level Security) for frontend calls
5. **CORS:** Configure proper origins in production

---

## 📚 Useful Commands

```bash
# Start development server
npm run dev

# Start production server
npm start

# Check backend is running
curl http://localhost:5000/health

# View all issues
curl http://localhost:5000/api/issues

# Create issue (needs JWT)
curl -X POST http://localhost:5000/api/issues/user_123 \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## 📞 Support

For issues or questions:
1. Check Supabase docs: https://supabase.com/docs
2. Check API error messages in terminal
3. Review database schema in SQL editor

---

**✅ You're all set!** Your NagarVoice backend is ready to receive requests from the mobile app.

