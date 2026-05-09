# 🏛️ NagarVoice — Civic Issue Reporting & Tracking for Bangalore

> **Your Voice for a Better Bangalore** / **ಉತ್ತಮ ಬೆಂಗಳೂರಿಗಾಗಿ ನಿಮ್ಮ ಧ್ವನಿ**

NagarVoice is a comprehensive **Progressive Web App (PWA) + Mobile App** that empowers Bangalore citizens to report, track, and resolve civic issues — potholes, garbage, broken streetlights, water leaks, and more. Built with React (Frontend) + Node.js/Express (Backend) + Supabase PostgreSQL.

---

## ✨ Key Features

### 👤 Citizen Features
- 📸 **Photo-based Issue Reporting** with location auto-detect
- 🤖 **AI Chat Assistant** for guided complaint creation
- 🗺️ **Interactive Map View** showing 50+ color-coded issues
- 🔥 **Ward Heatmap** visualizing issue density
- ⏱️ **Real-Time Status Timeline** (courier-style tracking)
- 👍 **Upvote System** — higher upvotes = faster resolution
- 🏆 **Ward Leaderboard** — gamified citizen rankings
- 🔒 **Anonymous Reporting** for sensitive issues
- 🚨 **SOS Emergency Mode** — one-tap urgent reporting
- 🎖️ **Citizen Rewards** — badges and points system
- 🌐 **Bilingual UI** — English + Kannada
- 📱 **Mobile App** via Capacitor (iOS/Android)

### 🛡️ Admin Features
- **Ward-wise Dashboard** — each admin manages specific ward(s)
- **Issue Status Management** — reported → acknowledged → in-progress → resolved
- **Bulk Operations** — mark issues resolved with photos
- **Resolution Metrics** — track resolution rate per ward
- **AI Complaint Tracking** — see complaints filed via chatbot
- **Escalation System** — mark issues for higher authority

### 🤖 AI Integration (Azure OpenAI)
- Auto-categorize issues from photos
- Detect duplicate complaints using distance algorithms
- Smart priority scoring (Low/Medium/High/Critical)
- Guided complaint chatbot

---

## 🏗️ Project Architecture

```
nagarvoice/
├── src/                          # Frontend React code
│   ├── pages/                    # Page components
│   │   ├── Home.jsx              # Citizen home dashboard
│   │   ├── Login.jsx             # Auth with floating admin button
│   │   ├── ReportIssue.jsx       # Issue submission form
│   │   ├── MapView.jsx           # Interactive map
│   │   ├── ChatAssistant.jsx     # AI chatbot
│   │   ├── IssueDetail.jsx       # Issue tracking
│   │   ├── Leaderboard.jsx       # Citizen rankings
│   │   ├── Profile.jsx           # User profile
│   │   └── admin/
│   │       └── AdminDashboard.jsx # Ward-wise admin panel
│   ├── components/               # Reusable UI components
│   ├── services/                 # API & business logic
│   ├── data/                     # Sample data & categories
│   ├── i18n/                     # Internationalization
│   ├── styles/                   # Global CSS
│   └── App.jsx                   # Main router
├── backend/                      # Node.js Express API
│   ├── src/
│   │   ├── server.js             # Express entry point
│   │   ├── config/
│   │   │   ├── database.js       # PostgreSQL connection
│   │   │   └── database-schema.sql # SQL schema
│   │   ├── controllers/
│   │   │   ├── authController.js # Login/registration
│   │   │   └── issueController.js # Issue CRUD
│   │   ├── routes/
│   │   │   ├── auth.js           # Auth endpoints
│   │   │   └── issues.js         # Issue endpoints
│   │   └── middleware/
│   │       └── auth.js           # JWT auth middleware
│   ├── package.json              # Backend dependencies
│   └── .env.example              # Config template
├── android/                      # Android app (Capacitor)
├── public/                       # Static assets
├── package.json                  # Frontend dependencies
├── vite.config.js                # Vite build config
├── capacitor.config.json         # Capacitor config
└── README.md                     # This file
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Supabase Account** (free at https://supabase.com)
- **Azure OpenAI Account** (for AI features, optional)

### Step 1: Clone & Install

```bash
# Navigate to project
cd d:\MAD\nagarvoice

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### Step 2: Configure Database (Supabase)

#### 2.1 Create Supabase Project
1. Go to https://supabase.com → Click "Start your project"
2. Sign up with email/GitHub
3. Create new project:
   - **Project name:** nagarvoice
   - **Database password:** Create strong password (save it!)
   - **Region:** Southeast Asia (closest to India)
4. Wait 5-10 minutes for project creation

#### 2.2 Get Connection String
1. Project Settings → Database → Connection string
2. Copy the **PostgreSQL Connection String (URI)**
3. Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

#### 2.3 Create Database Tables
1. In Supabase Dashboard → SQL Editor → New Query
2. Copy entire content from `backend/src/config/database-schema.sql`
3. Paste and click **Run**

Tables created:
- `users` — User profiles, civic scores
- `issues` — Issue reports, status tracking
- `comments` — Issue discussions
- `issue_timeline` — Status history
- `upvotes` — Citizen upvotes
- `notifications` — User alerts

### Step 3: Configure Environment Variables

#### Frontend Config
Create `.env` in root:
```env
# Azure OpenAI (for AI chat assistant)
VITE_AZURE_OPENAI_API_KEY=your-api-key-here
VITE_AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
VITE_AZURE_OPENAI_DEPLOYMENT=gpt-4o
VITE_AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Backend API
VITE_API_BASE_URL=http://localhost:5000/api
```

#### Backend Config
Create `backend/.env`:
```env
# Supabase
DATABASE_URL=postgresql://postgres:PASSWORD@db.REGION.supabase.co:5432/postgres

# Server
PORT=5000
NODE_ENV=development
```

### Step 4: Run the App

#### Terminal 1 - Start Backend (Port 5000)
```bash
cd backend
npm start
```

Expected output:
```
✅ Supabase PostgreSQL connected successfully
🚀 NagarVoice Backend running on http://localhost:5000
```

#### Terminal 2 - Start Frontend (Port 5173)
```bash
npm run dev
```

Expected output:
```
VITE v4.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser! 🎉

---

## 🔐 Demo Credentials

### Citizen Users
| Name | Phone | OTP | Ward | Tier |
|------|-------|-----|------|------|
| Arjun Sharma | 9876543210 | 1234 | Koramangala | Gold |
| Kavitha Reddy | 6543210987 | 1234 | Jayanagar | Platinum |

### Admin Access
| User | Phone | OTP | Access |
|------|-------|-----|--------|
| Admin User | 9999999999 | 1234 | 🔐 All Wards |

**How to Access Admin:**
1. On login page, look for **floating 👨‍💼 Admin button** (bottom-right)
2. Click it → Select "Admin User"
3. Enter OTP: **1234**
4. ✅ Redirected to Admin Dashboard
5. Select a ward to view its issues
6. Use quick action buttons to manage issues

---

## 📱 Mobile App Setup (Capacitor)

### Build for iOS/Android

```bash
# Build web assets
npm run build

# Sync to native projects
npx cap sync

# Open iOS
npx cap open ios

# Open Android
npx cap open android
```

---

## 🔧 Available Commands

### Frontend
```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint check
```

### Backend
```bash
cd backend
npm start            # Start API server (port 5000)
npm run dev          # Dev mode with nodemon
```

---

## 📊 Database Schema Overview

### Users Table
```sql
user_id | phone | name | ward | civic_score | tier | is_admin | badges | last_login
```

### Issues Table
```sql
issue_id | category | title | ward | status | reported_by | upvotes | priority | created_at
```

### Issue Status Workflow
```
reported → acknowledged → in-progress → resolved
              ↓
           escalated → (higher authority)
```

---

## 🎨 Design System

- **Primary**: Civic Blue (#4361ee)
- **Secondary**: Amber (#f7b801)
- **Accent**: Purple (#7209b7)
- **Success**: Green (#06d6a0)
- **Danger**: Red (#ef233c)
- **Dark theme** with full glassmorphism support

---

## 🚨 Troubleshooting

### Backend won't connect to Supabase
```
❌ Error: ECONNREFUSED / Connection failed
✅ Fix: Check DATABASE_URL in backend/.env
✅ Make sure Supabase project is active
✅ Verify IP whitelisting in Supabase settings
```

### Frontend can't reach backend
```
❌ Error: Failed to fetch from /api/...
✅ Fix: Check VITE_API_BASE_URL in .env
✅ Ensure backend is running on port 5000
✅ Check CORS is enabled in backend
```

### Admin login redirects to home
```
❌ Issue: Not redirecting to /admin after login
✅ Fix: Backend will reinitialize admin on next login
✅ Run: http://localhost:5000/api/auth/init-admin
```

---

## 📄 License

MIT License — Built for Bangalore, by Bangaloreans.

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with ❤️ for Bangalore** 🇮🇳
