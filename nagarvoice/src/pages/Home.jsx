import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { issueService, authService, notificationService } from '../services/issueService';
import { getSmartSuggestions } from '../services/ai';
import { categories } from '../data/categories';
import { getTierForScore } from '../data/sampleUsers';
import './Home.css';

function AnimatedNumber({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
    const step = (timestamp) => {
      if (!ref.current) ref.current = timestamp;
      const progress = Math.min((timestamp - ref.current) / duration, 1);
      setDisplay(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    return () => { ref.current = null; };
  }, [value, duration]);
  return <span className="anim-counter">{display}</span>;
}

function IssueCard({ issue, onClick }) {
  const cat = categories.find(c => c.id === issue.category);
  const statusClass = issue.status.replace(' ', '-');
  const whatsappText = encodeURIComponent(`🚨 Civic Issue in ${issue.ward}: ${issue.title}\n📍 ${issue.location.address}\n\nTrack it on NagarVoice: ${window.location.origin}/issue/${issue.id}`);

  return (
    <div className="issue-card glass-card glass-card-hover" onClick={() => onClick(issue.id)}>
      <div className={`issue-card-strip strip-${statusClass}`}></div>
      <div className="issue-card-body">
        <div className="issue-card-top">
          <span className="issue-card-cat-icon">{cat?.icon}</span>
          <div className="issue-card-meta">
            <span className="issue-card-id">{issue.id}</span>
            <span className={`badge badge-${issue.priority}`}>{issue.priority}</span>
          </div>
        </div>
        <h3 className="issue-card-title">{issue.title}</h3>
        <p className="issue-card-location">📍 {issue.location.address}</p>
        <div className="issue-card-bottom">
          <span className={`badge badge-${statusClass}`}>{issue.status.replace('-', ' ')}</span>
          <div className="issue-card-actions">
            <span className="issue-card-upvote">👍 {issue.upvotes}</span>
            <a href={`https://wa.me/?text=${whatsappText}`} target="_blank" rel="noopener" className="whatsapp-btn" onClick={e => e.stopPropagation()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.625-1.456A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-2.16 0-4.16-.68-5.803-1.835l-.416-.275-3.085.971.926-3.2-.288-.44C2.004 15.34 1.25 13.727 1.25 12 1.25 6.063 6.063 1.25 12 1.25S22.75 6.063 22.75 12 17.937 22.75 12 22.75z"/></svg>
              Share
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [stats, setStats] = useState({});
  const [issues, setIssues] = useState([]);
  const [trending, setTrending] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confetti, setConfetti] = useState(false);
  const unreadCount = notificationService.getUnreadCount();
  const tierInfo = user ? getTierForScore(user.civicScore || 0) : null;

  useEffect(() => {
    setTimeout(() => {
      setStats(issueService.getStats());
      setIssues(issueService.getAll().slice(0, 6));
      setTrending(issueService.getTrendingIssues(5));
      setNotifications(notificationService.getAll());
      if (user) setSuggestions(getSmartSuggestions(user.ward, issueService.getAll()));
      setLoading(false);
    }, 400);
    // Check for confetti
    const confettiId = localStorage.getItem('nagarvoice_confetti');
    if (confettiId) { setConfetti(true); localStorage.removeItem('nagarvoice_confetti'); setTimeout(() => setConfetti(false), 3500); }
  }, []);

  if (loading) {
    return (
      <div className="page home-page">
        <div className="skeleton skeleton-title" style={{width:'60%',marginBottom:24}}></div>
        <div className="skeleton skeleton-card"></div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div className="skeleton skeleton-stat"></div>
          <div className="skeleton skeleton-stat"></div>
          <div className="skeleton skeleton-stat"></div>
          <div className="skeleton skeleton-stat"></div>
        </div>
        <div className="skeleton skeleton-title" style={{width:'40%',marginTop:24}}></div>
        <div className="skeleton skeleton-card"></div>
        <div className="skeleton skeleton-card"></div>
      </div>
    );
  }

  return (
    <div className="page home-page">
      {/* Confetti */}
      {confetti && (
        <div className="confetti-container">
          {Array.from({length: 50}).map((_, i) => (
            <div key={i} className="confetti-piece" style={{
              left: `${Math.random()*100}%`,
              background: ['#4361ee','#f7b801','#06d6a0','#ef233c','#7209b7','#4cc9f0'][i % 6],
              animationDelay: `${Math.random()*2}s`,
              width: `${6 + Math.random()*8}px`,
              height: `${6 + Math.random()*8}px`,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}></div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="home-header">
        <div>
          <p className="home-greeting">{t('home.greeting')}, {user?.name || 'Citizen'} 👋</p>
          <p className="home-ward">{user?.ward || 'Bangalore'} • <span className="tier-label" style={{color: tierInfo?.color}}>{tierInfo?.icon} {user?.tier || 'Citizen'}</span></p>
        </div>
        <button className="home-notif-btn btn btn-icon" onClick={() => { setShowNotif(!showNotif); if (!showNotif) notificationService.markAllRead(); }}>
          🔔
          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </button>
      </div>

      {/* Notification Panel */}
      {showNotif && (
        <>
          <div className="bottom-sheet-backdrop" onClick={() => setShowNotif(false)}></div>
          <div className="notif-panel glass-card-heavy" style={{position:'fixed',top:0,left:0,right:0,maxWidth:'var(--max-width)',margin:'0 auto',marginTop:'60px',zIndex:999}}>
            <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border-light)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h3 style={{fontSize:'var(--font-size-base)',fontWeight:700}}>🔔 Notifications</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowNotif(false)}>✕</button>
            </div>
            {notifications.length === 0 ? (
              <div className="empty-state" style={{padding:24}}>
                <span className="empty-state-icon">🔕</span>
                <p className="empty-state-text">No notifications yet</p>
              </div>
            ) : notifications.slice(0,8).map(n => (
              <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`} onClick={() => n.issueId && navigate(`/issue/${n.issueId}`)}>
                <span className="notif-icon">{n.type === 'status' ? '📋' : n.type === 'upvote' ? '👍' : n.type === 'ward' ? '🏘️' : '⚡'}</span>
                <div className="notif-content">
                  <p className="notif-title">{n.title}</p>
                  <p className="notif-msg">{n.message}</p>
                  <p className="notif-time">{new Date(n.time).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Hero Stats */}
      <div className="home-hero hero-gradient">
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-value"><AnimatedNumber value={stats.total || 0} /></span>
            <span className="hero-stat-label">{t('home.totalReported')}</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <span className="hero-stat-value"><AnimatedNumber value={(stats.inProgress || 0) + (stats.acknowledged || 0)} /></span>
            <span className="hero-stat-label">{t('home.inProgress')}</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <span className="hero-stat-value"><AnimatedNumber value={stats.resolved || 0} /></span>
            <span className="hero-stat-label">{t('home.resolved')}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section">
        <h2 className="section-title">⚡ {t('home.quickActions')}</h2>
        <div className="quick-actions-grid">
          <button className="qa-btn" onClick={() => navigate('/report')}>
            <span className="qa-icon qa-icon-report">📸</span>
            <span className="qa-label">{t('home.reportIssue')}</span>
          </button>
          <button className="qa-btn qa-btn-sos" onClick={() => navigate('/sos')}>
            <span className="qa-icon qa-icon-sos">🚨</span>
            <span className="qa-label">{t('home.sos')}</span>
          </button>
          <button className="qa-btn" onClick={() => navigate('/chat')}>
            <span className="qa-icon qa-icon-ai">🤖</span>
            <span className="qa-label">{t('home.aiAssistant')}</span>
          </button>
          <button className="qa-btn" onClick={() => navigate('/map')}>
            <span className="qa-icon qa-icon-map">🗺️</span>
            <span className="qa-label">{t('home.viewMap')}</span>
          </button>
        </div>
      </div>

      {/* Trending Issues */}
      {trending.length > 0 && (
        <div className="section">
          <h2 className="section-title">🔥 Trending Issues This Week</h2>
          <div className="trending-scroll">
            {trending.map(issue => {
              const cat = categories.find(c => c.id === issue.category);
              return (
                <div key={issue.id} className="trending-card glass-card" onClick={() => navigate(`/issue/${issue.id}`)}>
                  <div className="trending-top">
                    <span>{cat?.icon}</span>
                    <span className="trending-upvotes">👍 {issue.upvotes}</span>
                  </div>
                  <p className="trending-title">{issue.title}</p>
                  <p className="trending-ward">📍 {issue.ward}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <div className="section">
          <h2 className="section-title">💡 {t('home.smartSuggestions')}</h2>
          <div className="suggestion-chips">
            {suggestions.map(s => (
              <button key={s.category} className="chip" onClick={() => navigate('/report', { state: { category: s.category } })}>
                {s.info?.icon} {s.category} ({s.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Issues */}
      <div className="section">
        <div className="flex-between mb-4">
          <h2 className="section-title" style={{marginBottom:0}}>📋 {t('home.recentIssues')}</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/map')}>View all →</button>
        </div>
        {issues.map(issue => (
          <IssueCard key={issue.id} issue={issue} onClick={id => navigate(`/issue/${id}`)} />
        ))}
      </div>
    </div>
  );
}
