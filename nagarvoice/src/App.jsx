import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from './i18n/I18nContext';
import BottomNav from './components/BottomNav';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ReportIssue from './pages/ReportIssue';
import IssueDetail from './pages/IssueDetail';
import MapView from './pages/MapView';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import SOSMode from './pages/SOSMode';
import ChatAssistant from './pages/ChatAssistant';
import AdminDashboard from './pages/admin/AdminDashboard';
import './styles/global.css';

function AppLayout({ children, hideNav }) {
  return (
    <div className="app-container">
      {children}
      {!hideNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          {/* No nav pages */}
          <Route path="/" element={<AppLayout hideNav><Onboarding /></AppLayout>} />
          <Route path="/onboarding" element={<AppLayout hideNav><Onboarding /></AppLayout>} />
          <Route path="/login" element={<AppLayout hideNav><Login /></AppLayout>} />
          <Route path="/register" element={<AppLayout hideNav><Register /></AppLayout>} />
          <Route path="/sos" element={<AppLayout hideNav><SOSMode /></AppLayout>} />
          <Route path="/chat" element={<AppLayout hideNav><ChatAssistant /></AppLayout>} />
          <Route path="/admin" element={<AppLayout hideNav><AdminDashboard /></AppLayout>} />

          {/* Nav pages */}
          <Route path="/home" element={<AppLayout><Home /></AppLayout>} />
          <Route path="/report" element={<AppLayout><ReportIssue /></AppLayout>} />
          <Route path="/issue/:id" element={<AppLayout><IssueDetail /></AppLayout>} />
          <Route path="/map" element={<AppLayout><MapView /></AppLayout>} />
          <Route path="/leaderboard" element={<AppLayout><Leaderboard /></AppLayout>} />
          <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}
