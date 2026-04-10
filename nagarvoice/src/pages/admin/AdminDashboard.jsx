import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { issueService, authService, resolutionNotifService } from '../../services/issueService';
import { categories, wards } from '../../data/categories';
import './Admin.css';

const ADMIN_NOTIF_KEY = 'nagarvoice_admin_notifications';

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
    const step = (ts) => {
      if (!ref.current) ref.current = ts;
      const progress = Math.min((ts - ref.current) / 800, 1);
      setDisplay(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    return () => { ref.current = null; };
  }, [value]);
  return <span className="anim-counter">{display}</span>;
}

function getAdminNotifications() {
  try {
    const stored = localStorage.getItem(ADMIN_NOTIF_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function clearAdminNotifications() {
  localStorage.removeItem(ADMIN_NOTIF_KEY);
}

// Group wards by zone
function getWardsByZone() {
  const zones = {};
  wards.forEach(w => {
    if (!zones[w.zone]) zones[w.zone] = [];
    zones[w.zone].push(w);
  });
  return zones;
}

const ZONE_COLORS = {
  South: { bg: 'rgba(6, 214, 160, 0.08)', border: 'rgba(6, 214, 160, 0.25)', accent: '#06d6a0' },
  East: { bg: 'rgba(67, 97, 238, 0.08)', border: 'rgba(67, 97, 238, 0.25)', accent: '#4361ee' },
  West: { bg: 'rgba(252, 163, 17, 0.08)', border: 'rgba(252, 163, 17, 0.25)', accent: '#fca311' },
  North: { bg: 'rgba(114, 9, 183, 0.08)', border: 'rgba(114, 9, 183, 0.25)', accent: '#7209b7' },
};

const ZONE_ICONS = { South: '🌴', East: '🏙️', West: '🏛️', North: '🌿' };

export default function AdminDashboard() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [selectedWard, setSelectedWard] = useState(null);
  const [stats, setStats] = useState({});
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [aiNotifs, setAiNotifs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user?.isAdmin) { navigate('/home', { replace: true }); return; }
    setAiNotifs(getAdminNotifications());
    setTimeout(() => { setLoading(false); }, 400);
  }, []);

  useEffect(() => {
    if (selectedWard) {
      const wardIssues = issueService.getAll().filter(i => i.ward === selectedWard);
      setIssues(wardIssues);
      // Compute ward-specific stats
      setStats({
        total: wardIssues.length,
        reported: wardIssues.filter(i => i.status === 'reported').length,
        acknowledged: wardIssues.filter(i => i.status === 'acknowledged').length,
        inProgress: wardIssues.filter(i => i.status === 'in-progress').length,
        resolved: wardIssues.filter(i => i.status === 'resolved').length,
        escalated: wardIssues.filter(i => i.status === 'escalated').length,
      });
    }
  }, [selectedWard]);

  const handleStatusChange = (issueId, newStatus) => {
    // Get the issue before any changes
    const issue = issueService.getById(issueId);

    if (newStatus === 'resolved' && issue) {
      // Save resolution notification for the user who reported it
      const cat = categories.find(c => c.id === issue.category);
      resolutionNotifService.saveResolutionNotification(
        issue.reportedBy,
        issue.title,
        cat?.name || issue.category,
        issue.location?.address || issue.ward,
        issue.id
      );
      // Delete the issue from localStorage
      issueService.deleteIssue(issueId);
    } else {
      // For other status changes, just update
      issueService.updateStatus(issueId, newStatus, `Status updated to ${newStatus} by admin`);
    }

    // Refresh ward issues
    const wardIssues = issueService.getAll().filter(i => i.ward === selectedWard);
    setIssues(wardIssues);
    setStats({
      total: wardIssues.length,
      reported: wardIssues.filter(i => i.status === 'reported').length,
      acknowledged: wardIssues.filter(i => i.status === 'acknowledged').length,
      inProgress: wardIssues.filter(i => i.status === 'in-progress').length,
      resolved: wardIssues.filter(i => i.status === 'resolved').length,
      escalated: wardIssues.filter(i => i.status === 'escalated').length,
    });
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  const handleClearNotifs = () => {
    clearAdminNotifications();
    setAiNotifs([]);
  };

  const filtered = filter === 'all' ? issues : issues.filter(i => i.status === filter);

  if (loading) {
    return (
      <div className="admin-page page">
        <div className="skeleton skeleton-title"></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
          <div className="skeleton skeleton-stat"></div>
          <div className="skeleton skeleton-stat"></div>
          <div className="skeleton skeleton-stat"></div>
        </div>
        {[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-card" style={{height:60,marginTop:8}}></div>)}
      </div>
    );
  }

  // ─── Ward Selection Screen ───
  if (!selectedWard) {
    const wardsByZone = getWardsByZone();
    const allIssues = issueService.getAll();
    // Get issue counts per ward
    const wardIssueCounts = {};
    allIssues.forEach(i => {
      wardIssueCounts[i.ward] = (wardIssueCounts[i.ward] || 0) + 1;
    });

    // Filter wards by search
    const filteredWards = searchQuery.trim()
      ? wards.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : null;

    return (
      <div className="admin-page page" style={{maxWidth:'100%',paddingBottom:32}}>
        <div className="admin-header">
          <div>
            <h1 className="admin-title">🛡️ BBMP Admin</h1>
            <p className="admin-subtitle">{user?.name || 'Admin'} • Select your ward to begin</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
        </div>

        {/* AI Complaint Notifications */}
        {aiNotifs.length > 0 && (
          <div className="ai-notif-banner glass-card" style={{marginBottom: 'var(--space-5)'}}>
            <div className="ai-notif-banner-header">
              <span className="ai-notif-pulse"></span>
              <span className="fw-600">🤖 {aiNotifs.length} New complaint{aiNotifs.length > 1 ? 's' : ''} via AI</span>
            </div>
            <p className="text-xs text-secondary" style={{marginTop:4}}>Complaints filed through the AI Chat Assistant</p>
            <button className="btn btn-sm btn-ghost" onClick={handleClearNotifs} style={{marginTop:8,fontSize:11}}>Dismiss</button>
          </div>
        )}

        <div className="ward-select-header">
          <h2 className="section-title">📍 Select Your Ward / Zone</h2>
          <p className="text-sm text-secondary" style={{marginTop:-8, marginBottom: 16}}>Choose the ward you manage to view its issues</p>
        </div>

        {/* Search */}
        <div className="ward-search-bar">
          <input
            className="input-field"
            placeholder="🔍 Search wards..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* If searching, show flat list */}
        {filteredWards ? (
          <div className="ward-select-grid">
            {filteredWards.map(w => {
              const zc = ZONE_COLORS[w.zone] || ZONE_COLORS.South;
              const count = wardIssueCounts[w.name] || 0;
              return (
                <button
                  key={w.id}
                  className="ward-card glass-card"
                  style={{ '--zone-bg': zc.bg, '--zone-border': zc.border, '--zone-accent': zc.accent }}
                  onClick={() => setSelectedWard(w.name)}
                >
                  <div className="ward-card-zone-dot" style={{background: zc.accent}}></div>
                  <h3 className="ward-card-name">{w.name}</h3>
                  <div className="ward-card-meta">
                    <span className="ward-card-zone">{w.zone} Zone</span>
                    <span className="ward-card-count">{count} issues</span>
                  </div>
                </button>
              );
            })}
            {filteredWards.length === 0 && (
              <p className="text-sm text-secondary" style={{gridColumn:'1/-1',textAlign:'center',padding:24}}>No wards match "{searchQuery}"</p>
            )}
          </div>
        ) : (
          /* Group by zone */
          Object.entries(wardsByZone).map(([zone, zoneWards]) => {
            const zc = ZONE_COLORS[zone] || ZONE_COLORS.South;
            return (
              <div key={zone} className="ward-zone-section">
                <h3 className="ward-zone-title" style={{color: zc.accent}}>
                  {ZONE_ICONS[zone] || '📍'} {zone} Zone
                  <span className="ward-zone-count">{zoneWards.length} wards</span>
                </h3>
                <div className="ward-select-grid">
                  {zoneWards.map(w => {
                    const count = wardIssueCounts[w.name] || 0;
                    return (
                      <button
                        key={w.id}
                        className="ward-card glass-card"
                        style={{ '--zone-bg': zc.bg, '--zone-border': zc.border, '--zone-accent': zc.accent }}
                        onClick={() => setSelectedWard(w.name)}
                      >
                        <div className="ward-card-zone-dot" style={{background: zc.accent}}></div>
                        <h3 className="ward-card-name">{w.name}</h3>
                        <div className="ward-card-meta">
                          <span className="ward-card-zone">{zone}</span>
                          <span className="ward-card-count">{count} issues</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }

  // ─── Ward Dashboard (after selection) ───
  return (
    <div className="admin-page page" style={{maxWidth:'100%',paddingBottom:32}}>
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-title">🛡️ {selectedWard}</h1>
          <p className="admin-subtitle">{user?.name || 'Admin'} • {new Date().toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'long'})}</p>
        </div>
        <div className="admin-header-actions">
          <button className="btn btn-outline btn-sm" onClick={() => setSelectedWard(null)}>🔄 Change Ward</button>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* AI Complaint Notifications */}
      {aiNotifs.length > 0 && (
        <div className="ai-notif-banner glass-card" style={{marginBottom: 'var(--space-5)'}}>
          <div className="ai-notif-banner-header">
            <span className="ai-notif-pulse"></span>
            <span className="fw-600">🤖 {aiNotifs.length} New complaint{aiNotifs.length > 1 ? 's' : ''} via AI</span>
          </div>
          <div className="ai-notif-list">
            {aiNotifs.slice(0, 3).map((n, i) => (
              <div key={i} className="ai-notif-item text-xs">
                <span>#{n.issueId}</span> — <span>{n.title || 'AI Complaint'}</span>
                <span className="text-secondary" style={{marginLeft:'auto'}}>{new Date(n.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
              </div>
            ))}
          </div>
          <button className="btn btn-sm btn-ghost" onClick={handleClearNotifs} style={{marginTop:8,fontSize:11}}>Dismiss all</button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card stat-total">
          <span className="admin-stat-value"><AnimatedNumber value={stats.total || 0} /></span>
          <span className="admin-stat-label">Total</span>
        </div>
        <div className="admin-stat-card stat-active">
          <span className="admin-stat-value"><AnimatedNumber value={(stats.reported || 0) + (stats.acknowledged || 0)} /></span>
          <span className="admin-stat-label">Open</span>
        </div>
        <div className="admin-stat-card stat-progress">
          <span className="admin-stat-value"><AnimatedNumber value={stats.inProgress || 0} /></span>
          <span className="admin-stat-label">In Progress</span>
        </div>
        <div className="admin-stat-card stat-resolved">
          <span className="admin-stat-value"><AnimatedNumber value={stats.resolved || 0} /></span>
          <span className="admin-stat-label">Resolved</span>
        </div>
        <div className="admin-stat-card stat-escalated">
          <span className="admin-stat-value"><AnimatedNumber value={stats.escalated || 0} /></span>
          <span className="admin-stat-label">Escalated</span>
        </div>
      </div>

      {/* Resolution Rate */}
      {stats.total > 0 && (
        <div className="admin-resolution-bar glass-card" style={{marginBottom: 'var(--space-5)', padding: 'var(--space-4)'}}>
          <div className="flex-between" style={{marginBottom: 8}}>
            <span className="text-sm fw-600">Resolution Rate</span>
            <span className="text-sm fw-700" style={{color: 'var(--color-success)'}}>{Math.round(((stats.resolved || 0) / stats.total) * 100)}%</span>
          </div>
          <div className="lb-bar-container">
            <div className="lb-bar-fill" style={{width: `${Math.round(((stats.resolved || 0) / stats.total) * 100)}%`, background: 'var(--color-success)'}}></div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="admin-filter-bar">
        {['all','reported','acknowledged','in-progress','resolved','escalated'].map(s => (
          <button key={s} className={`chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s === 'all' ? 'All' : s.replace('-',' ')}
          </button>
        ))}
      </div>

      {/* Issues Table */}
      <div className="section">
        <h2 className="section-title">📋 Issue Management ({filtered.length})</h2>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{padding: 'var(--space-8)'}}>
            <span className="empty-state-icon">📭</span>
            <p className="empty-state-title">No issues found</p>
            <p className="empty-state-text">No {filter === 'all' ? '' : filter + ' '}issues in {selectedWard}</p>
          </div>
        ) : (
          <div className="admin-table glass-card" style={{padding:0,overflow:'hidden'}}>
            <div className="admin-table-header">
              <span className="ad-col-id">ID</span>
              <span className="ad-col-title">Issue</span>
              <span className="ad-col-ward">Ward</span>
              <span className="ad-col-status">Status</span>
            </div>
            {filtered.slice(0, 20).map((issue, i) => {
              const cat = categories.find(c => c.id === issue.category);
              return (
                <div key={issue.id} className={`admin-table-row ${i % 2 === 0 ? 'even' : 'odd'}`}>
                  <span className="ad-col-id">{issue.id}</span>
                  <span className="ad-col-title">
                    <span className="ad-issue-cat">{cat?.icon}</span>
                    <span className="ad-issue-name" onClick={() => navigate(`/issue/${issue.id}`)}>{issue.title}</span>
                  </span>
                  <span className="ad-col-ward">{issue.ward}</span>
                  <span className="ad-col-status">
                    <select className={`status-select select-${issue.status.replace(' ','-')}`} value={issue.status}
                      onChange={e => handleStatusChange(issue.id, e.target.value)}>
                      <option value="reported">Reported</option>
                      <option value="acknowledged">Acknowledged</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="escalated">Escalated</option>
                    </select>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
