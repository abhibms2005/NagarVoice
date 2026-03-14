import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { issueService } from '../services/issueService';
import { aiWardInsight, hasApiKey } from '../services/ai/claude';
import './Leaderboard.css';

export default function Leaderboard() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [wardStats, setWardStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState({});
  const [loadingInsight, setLoadingInsight] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setWardStats(issueService.getWardStats());
      setLoading(false);
    }, 400);
  }, []);

  const getWardInsight = async (ward) => {
    if (insights[ward.ward]) return;
    setLoadingInsight(ward.ward);
    try {
      if (hasApiKey()) {
        const insight = await aiWardInsight(ward.ward, ward);
        setInsights(prev => ({ ...prev, [ward.ward]: insight }));
      } else {
        await new Promise(res => setTimeout(res, 800));
        const rate = ward.score;
        const insight = rate > 70
          ? `${ward.ward} shows strong civic governance with ${ward.score}% resolution rate. ${ward.resolved} of ${ward.total} issues resolved with avg ${ward.avgDays}-day turnaround. Top performing ward!`
          : rate > 40
          ? `${ward.ward} has moderate performance at ${ward.score}%. ${ward.total - ward.resolved} issues remain open. Average resolution takes ${ward.avgDays} days — room for improvement.`
          : `${ward.ward} needs urgent attention with only ${ward.score}% resolution rate. ${ward.total - ward.resolved} unresolved issues pending. Consider escalating to ward committee.`;
        setInsights(prev => ({ ...prev, [ward.ward]: insight }));
      }
    } catch (err) {
      setInsights(prev => ({ ...prev, [ward.ward]: 'Unable to generate insight.' }));
    } finally {
      setLoadingInsight(null);
    }
  };

  const top3 = wardStats.slice(0, 3);
  const rest = wardStats.slice(3);

  if (loading) {
    return (
      <div className="page lb-page">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-card" style={{height:200}}></div>
        {[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-card" style={{height:60}}></div>)}
      </div>
    );
  }

  return (
    <div className="page lb-page">
      <header className="page-header">
        <h1 className="page-title">🏆 {t('leaderboard.title')}</h1>
        <p className="page-subtitle">{t('leaderboard.subtitle')}</p>
      </header>

      {/* Podium */}
      <div className="lb-podium">
        {top3[1] && (
          <div className="podium-item podium-2" onClick={() => getWardInsight(top3[1])}>
            <div className="podium-medal">🥈</div>
            <span className="podium-name">{top3[1].ward}</span>
            <span className="podium-score">{top3[1].score}%</span>
            <div className="podium-bar bar-2"></div>
          </div>
        )}
        {top3[0] && (
          <div className="podium-item podium-1" onClick={() => getWardInsight(top3[0])}>
            <div className="podium-crown">👑</div>
            <div className="podium-medal">🥇</div>
            <span className="podium-name">{top3[0].ward}</span>
            <span className="podium-score">{top3[0].score}%</span>
            <div className="podium-bar bar-1"></div>
          </div>
        )}
        {top3[2] && (
          <div className="podium-item podium-3" onClick={() => getWardInsight(top3[2])}>
            <div className="podium-medal">🥉</div>
            <span className="podium-name">{top3[2].ward}</span>
            <span className="podium-score">{top3[2].score}%</span>
            <div className="podium-bar bar-3"></div>
          </div>
        )}
      </div>

      {/* AI Insights */}
      {Object.keys(insights).length > 0 && (
        <div className="section">
          {Object.entries(insights).map(([ward, insight]) => (
            <div key={ward} className="ai-insight glass-card" style={{marginBottom:12}}>
              <div className="flex-between mb-2">
                <span className="fw-600 text-sm">{ward} AI Insight</span>
                <span className="ai-powered-badge">{hasApiKey() ? 'Claude AI' : 'Heuristic'}</span>
              </div>
              <p className="text-sm text-secondary">{insight}</p>
            </div>
          ))}
        </div>
      )}

      {/* All Wards Table */}
      <div className="section">
        <h2 className="section-title">📊 All Ward Rankings</h2>
        <div className="lb-table glass-card" style={{padding:0,overflow:'hidden'}}>
          <div className="lb-table-header">
            <span className="lb-col-rank">#</span>
            <span className="lb-col-name">Ward</span>
            <span className="lb-col-score">Rate</span>
            <span className="lb-col-total">Issues</span>
            <span className="lb-col-ai">AI</span>
          </div>
          {wardStats.map((w, i) => (
            <div key={w.ward} className={`lb-table-row ${i % 2 === 0 ? 'even' : 'odd'}`}>
              <span className="lb-col-rank fw-700">{i + 1}</span>
              <span className="lb-col-name">
                <span className="fw-600">{w.ward}</span>
                <span className="lb-bar-container">
                  <span className="lb-bar-fill" style={{
                    width: `${w.score}%`,
                    background: w.score > 70 ? 'var(--color-success)' : w.score > 40 ? 'var(--color-warning)' : 'var(--color-danger)'
                  }}></span>
                </span>
              </span>
              <span className="lb-col-score fw-700" style={{
                color: w.score > 70 ? 'var(--color-success)' : w.score > 40 ? 'var(--color-warning)' : 'var(--color-danger)'
              }}>{w.score}%</span>
              <span className="lb-col-total text-secondary">{w.resolved}/{w.total}</span>
              <span className="lb-col-ai">
                <button className="btn btn-ghost btn-sm" onClick={() => getWardInsight(w)} disabled={loadingInsight === w.ward} title="Get AI Insight">
                  {loadingInsight === w.ward ? <span className="spinner spinner-primary" style={{width:14,height:14}}></span> : '✨'}
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
