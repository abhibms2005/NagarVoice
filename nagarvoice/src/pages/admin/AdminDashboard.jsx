import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { issueService, authService } from '../../services/issueService';
import { categories } from '../../data/categories';
import './Admin.css';

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

export default function AdminDashboard() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [stats, setStats] = useState({});
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState('all');
  const [wardStats, setWardStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.isAdmin) { navigate('/home', { replace: true }); return; }
    setTimeout(() => {
      setStats(issueService.getStats());
      setIssues(issueService.getAll());
      setWardStats(issueService.getWardStats().slice(0, 8));
      setLoading(false);
    }, 400);
  }, []);

  const handleStatusChange = (issueId, newStatus) => {
    issueService.updateStatus(issueId, newStatus, `Status updated to ${newStatus} by admin`);
    setIssues(issueService.getAll());
    setStats(issueService.getStats());
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
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

  return (
    <div className="admin-page page" style={{maxWidth:'100%',paddingBottom:32}}>
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-title">🛡️ BBMP Admin Dashboard</h1>
          <p className="admin-subtitle">{user?.name || 'Admin'} • {new Date().toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'long'})}</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
      </div>

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
      </div>

      {/* Ward Summary */}
      <div className="section">
        <h2 className="section-title">🏘️ Ward Performance</h2>
        <div className="ward-summary-grid">
          {wardStats.map(w => (
            <div key={w.ward} className="ward-summary-card glass-card">
              <h4 className="fw-600 text-sm">{w.ward}</h4>
              <div className="ward-mini-stats">
                <span className="text-xs">{w.total} issues</span>
                <span className="text-xs fw-700" style={{color: w.score > 70 ? 'var(--color-success)' : w.score > 40 ? 'var(--color-warning)' : 'var(--color-danger)'}}>{w.score}%</span>
              </div>
              <div className="lb-bar-container" style={{marginTop:8}}>
                <div className="lb-bar-fill" style={{width:`${w.score}%`, background: w.score > 70 ? 'var(--color-success)' : w.score > 40 ? 'var(--color-warning)' : 'var(--color-danger)'}}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
