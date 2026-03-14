import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { authService, issueService } from '../services/issueService';
import { hasApiKey, setApiKey } from '../services/ai/claude';
import { getTierForScore, civicTiers } from '../data/sampleUsers';
import './Profile.css';

const allBadges = [
  { id: 'first_report', name: 'First Report', icon: '🌟', desc: 'Submitted your first civic issue' },
  { id: 'active_citizen', name: 'Active Citizen', icon: '🏆', desc: 'Reported 5+ issues' },
  { id: 'community_voice', name: 'Community Voice', icon: '📢', desc: '10+ upvotes on a single report' },
  { id: 'watchdog', name: 'Watchdog', icon: '👁️', desc: 'Report resolved within 3 days' },
  { id: 'local_hero', name: 'Local Hero', icon: '🦸', desc: '50+ total upvotes received' },
  { id: 'anonymous_tip', name: 'Anonymous Tip', icon: '🔒', desc: 'First anonymous report' },
];

function CivicScoreRing({ score, tier }) {
  const tierInfo = getTierForScore(score);
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 1000) * circumference;

  return (
    <div className="civic-score-ring">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle className="ring-bg" cx="60" cy="60" r="52" />
        <circle className="ring-fill" cx="60" cy="60" r="52"
          stroke={tierInfo.color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="civic-score-value">
        <span className="civic-score-number" style={{color: tierInfo.color}}>{score}</span>
        <span className="civic-score-tier" style={{color: tierInfo.color}}>{tierInfo.icon} {tier}</span>
      </div>
    </div>
  );
}

export default function Profile() {
  const { t, language, switchLanguage } = useI18n();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('nagarvoice_theme') || 'light');
  const [highContrast, setHighContrast] = useState(false);
  const [myIssues, setMyIssues] = useState([]);
  const [apiKey, setApiKeyState] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const u = authService.getCurrentUser();
      setUser(u);
      if (u) setMyIssues(issueService.getUserIssues(u.id));
      setLoading(false);
    }, 300);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('nagarvoice_theme', next);
  };

  const toggleContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    document.documentElement.setAttribute('data-contrast', next ? 'high' : 'normal');
  };

  const handleSaveApiKey = () => {
    setApiKey(apiKey);
    setShowApiKey(false);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="page profile-page">
        <div className="skeleton skeleton-card" style={{height:200}}></div>
        <div className="skeleton skeleton-title"></div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
          <div className="skeleton skeleton-stat"></div>
          <div className="skeleton skeleton-stat"></div>
          <div className="skeleton skeleton-stat"></div>
        </div>
      </div>
    );
  }

  if (!user) return <div className="page"><p>{t('common.loading')}</p></div>;

  const resolvedCount = myIssues.filter(i => i.status === 'resolved').length;
  const tierInfo = getTierForScore(user.civicScore || 0);
  const nextTier = civicTiers.find(t => t.name === tierInfo.next);

  return (
    <div className="page profile-page">
      {/* Profile Card */}
      <div className="profile-card glass-card">
        <div className="profile-avatar-container">
          <div className="profile-avatar" style={{background: `linear-gradient(135deg, ${user.avatarColor}, ${user.avatarColor}aa)`}}>
            {user.avatar || user.name[0]}
          </div>
          <div className="profile-avatar-ring" style={{borderColor: tierInfo.color}}></div>
        </div>
        <h2 className="profile-name">{user.name}</h2>
        <p className="profile-phone">+91 {user.phone}</p>
        {user.bio && <p className="profile-bio">{user.bio}</p>}
        <p className="profile-joined">📅 Member since {new Date(user.joinedAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Civic Score */}
      <div className="section">
        <h2 className="section-title">🎯 Civic Score</h2>
        <div className="civic-score-card glass-card">
          <CivicScoreRing score={user.civicScore || 0} tier={user.tier || 'Bronze'} />
          <div className="civic-score-info">
            <div className="civic-score-stats">
              <div className="cs-stat"><span className="cs-stat-value">{myIssues.length}</span><span className="cs-stat-label">Reported</span></div>
              <div className="cs-stat"><span className="cs-stat-value">{resolvedCount}</span><span className="cs-stat-label">Resolved</span></div>
              <div className="cs-stat"><span className="cs-stat-value">{user.totalUpvotesReceived || 0}</span><span className="cs-stat-label">Upvotes</span></div>
            </div>
            {nextTier && (
              <div className="civic-next-tier">
                <p className="next-tier-text">
                  {nextTier.min - (user.civicScore || 0)} points to <span style={{color: nextTier.color}}>{nextTier.icon} {nextTier.name}</span>
                </p>
                <div className="next-tier-bar">
                  <div className="next-tier-fill" style={{
                    width: `${((user.civicScore - tierInfo.min) / (tierInfo.max - tierInfo.min)) * 100}%`,
                    background: tierInfo.color
                  }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="section">
        <h2 className="section-title">🎖️ {t('profile.rewards')}</h2>
        <div className="badges-grid">
          {allBadges.map(b => {
            const earned = user.badges?.includes(b.name);
            return (
              <div key={b.id} className={`badge-item ${earned ? 'earned' : 'locked'}`}>
                <span className="badge-item-icon">{b.icon}</span>
                <span className="badge-item-name">{b.name}</span>
                {earned && <span className="badge-glow"></span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings */}
      <div className="section">
        <h2 className="section-title">⚙️ {t('profile.settings')}</h2>
        <div className="settings-list glass-card">
          <div className="setting-item">
            <span>🌐 {t('profile.language')}</span>
            <button className="lang-switch-btn" onClick={() => switchLanguage(language === 'en' ? 'kn' : 'en')}>
              {language === 'en' ? 'English' : 'ಕನ್ನಡ'}
            </button>
          </div>
          <div className="setting-item">
            <span>🌙 {t('profile.theme')}</span>
            <label className="toggle-label">
              <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
              <span className="toggle-switch"></span>
            </label>
          </div>
          <div className="setting-item">
            <span>🔲 {t('profile.highContrast')}</span>
            <label className="toggle-label">
              <input type="checkbox" checked={highContrast} onChange={toggleContrast} />
              <span className="toggle-switch"></span>
            </label>
          </div>
          <div className="setting-item">
            <span>🔔 {t('profile.notifications')}</span>
            <label className="toggle-label">
              <input type="checkbox" defaultChecked />
              <span className="toggle-switch"></span>
            </label>
          </div>
          <div className="setting-item" onClick={() => setShowApiKey(!showApiKey)} style={{cursor:'pointer'}}>
            <span>🤖 Claude API Key</span>
            <span className="text-xs" style={{color: hasApiKey() ? 'var(--color-success)' : 'var(--text-tertiary)'}}>
              {hasApiKey() ? '✓ Connected' : 'Not set'}
            </span>
          </div>
        </div>
        {showApiKey && (
          <div className="api-key-form glass-card" style={{marginTop:12}}>
            <input className="input-field" type="password" placeholder="sk-ant-..." value={apiKey} onChange={e => setApiKeyState(e.target.value)} />
            <button className="btn btn-primary btn-sm" onClick={handleSaveApiKey} style={{marginTop:8}}>Save Key</button>
            <p className="text-xs text-secondary" style={{marginTop:4}}>Key is stored locally and never shared.</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="profile-actions">
        <p className="version-text">{t('profile.version')}</p>
        <button className="btn btn-danger btn-full" onClick={handleLogout}>
          {t('profile.logout')}
        </button>
      </div>
    </div>
  );
}
