# 🏛️ NagarVoice — Civic Issue Reporting & Tracking for Bangalore

> **Your Voice for a Better Bangalore** / **ಉತ್ತಮ ಬೆಂಗಳೂರಿಗಾಗಿ ನಿಮ್ಮ ಧ್ವನಿ**

NagarVoice is a next-generation Progressive Web App (PWA) that empowers Bangalore citizens to report, track, and resolve civic issues — potholes, garbage, broken streetlights, water leaks, and more — with a dramatically better experience than existing solutions.

## ✨ Features

### Citizen Features
- 📸 **Photo-based Issue Reporting** with AI auto-categorization
- 🤖 **AI Complaint Assistant** chatbot to help frame complaints
- 🗺️ **Interactive Map View** with 50+ color-coded issue markers across Bangalore
- 📍 **Auto-detect Location** via GPS
- 🔥 **Heatmap View** for issue density visualization
- ⏱️ **Real-Time Status Timeline** (courier-style tracking)
- 👍 **Citizen Upvote System** — more upvotes = faster escalation
- 🏆 **Ward Leaderboard** — gamified accountability dashboard
- 🔒 **Anonymous Reporting Mode** for sensitive issues
- 🚨 **SOS Emergency Mode** — one-tap reporting for urgent hazards
- 🎖️ **Citizen Rewards** — points and badges for active reporters
- 🌙 **Dark Mode / Light Mode** with high contrast accessibility
- 🌐 **Bilingual UI** — Kannada + English

### Admin Features
- 📊 **Admin Dashboard** with real-time stats
- 📋 **Issue Management** — assign, update status, resolve
- 📈 **Ward Reports** with resolution metrics

### AI Capabilities (Simulated)
- Auto-categorization of issues from photos
- Priority scoring (Low / Medium / High / Critical)
- Duplicate detection using Haversine distance
- Smart suggestions based on ward data
- Guided chatbot complaint assistant

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
cd d:\MAD\nagarvoice
npm install
```

### Run Development Server
```bash
npm run dev
```
Open **http://localhost:5173** in your browser.

### Build for Production
```bash
npm run build
```

## 📱 Usage

1. **Onboarding** — Swipe through 4 illustrated slides (switch to Kannada with the language toggle)
2. **Login** — Enter phone number + OTP, or click "Continue as Guest"
3. **Home** — View stats, quick actions, and recent issues
4. **Report** — Upload a photo, AI auto-detects the category, fill details, submit
5. **Map** — View all issues on an interactive map, toggle heatmap, apply filters
6. **Leaderboard** — See which wards resolve issues fastest
7. **Profile** — View rewards, change language, toggle dark mode
8. **SOS** — One-tap emergency reporting for urgent hazards
9. **AI Chat** — Get help framing your complaint
10. **Admin** — Login as admin to manage issues (click "Login as Admin" on login page)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router v7 |
| Maps | Leaflet.js + React-Leaflet |
| Styling | Vanilla CSS with CSS Variables |
| Data | localStorage-backed mock services |
| AI | Heuristic-based categorization + chatbot |
| i18n | Custom context-based (Kannada + English) |
| PWA | Manifest + meta tags |

## 📂 Project Structure

```
nagarvoice/
├── public/
│   └── manifest.json           # PWA manifest
├── src/
│   ├── components/
│   │   ├── BottomNav.jsx       # Bottom tab navigation
│   │   └── BottomNav.css
│   ├── data/
│   │   ├── categories.js       # Issue categories, wards, priorities
│   │   └── mockIssues.js       # 50+ realistic Bangalore issues
│   ├── i18n/
│   │   ├── translations.js     # EN + KN translations
│   │   └── I18nContext.jsx     # Language context provider
│   ├── pages/
│   │   ├── Onboarding.jsx/css  # 4-slide onboarding
│   │   ├── Login.jsx/css       # OTP-based login
│   │   ├── Home.jsx/css        # Dashboard with stats
│   │   ├── ReportIssue.jsx/css # Photo + AI report form
│   │   ├── IssueDetail.jsx/css # Timeline tracker
│   │   ├── MapView.jsx/css     # Leaflet interactive map
│   │   ├── Leaderboard.jsx/css # Ward rankings
│   │   ├── Profile.jsx/css     # Settings & rewards
│   │   ├── SOSMode.jsx/css     # Emergency mode
│   │   ├── ChatAssistant.jsx/css # AI chatbot
│   │   └── admin/
│   │       ├── AdminDashboard.jsx  # Admin panel
│   │       └── Admin.css
│   ├── services/
│   │   ├── issueService.js     # CRUD + auth services
│   │   └── ai/
│   │       └── index.js        # AI categorization, priority, chatbot
│   ├── styles/
│   │   ├── variables.css       # Design tokens (light/dark)
│   │   └── global.css          # Global styles + animations
│   ├── App.jsx                 # Routes + layout
│   └── main.jsx                # Entry point
└── index.html                  # HTML shell
```

## 🎨 Design System

- **Primary**: Civic Blue (#4361ee)
- **Secondary**: Amber (#f7b801)
- **Accent**: Purple (#7209b7)
- **Success**: Green (#06d6a0)
- **Danger**: Red (#ef233c)
- **Dark theme** with full glassmorphism support

## 📄 License

MIT License — Built for Bangalore, by Bangaloreans.
