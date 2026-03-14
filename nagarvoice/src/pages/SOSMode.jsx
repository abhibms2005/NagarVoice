import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { issueService, authService } from '../services/issueService';
import './SOSMode.css';

const emergencyTypes = [
  { id: 'open_manhole', icon: '🕳️', label: 'Open Manhole', color: '#d00000' },
  { id: 'electric_wire', icon: '⚡', label: 'Dangling Wire', color: '#ef233c' },
  { id: 'road_cave_in', icon: '🚧', label: 'Road Cave-in', color: '#ff6b35' },
  { id: 'gas_leak', icon: '💨', label: 'Gas Leak', color: '#fca311' },
  { id: 'flood', icon: '🌊', label: 'Flooding', color: '#4cc9f0' },
  { id: 'building_collapse', icon: '🏚️', label: 'Building Collapse', color: '#7209b7' },
];

export default function SOSMode() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState('select'); // select | confirm | sending | done

  const handleSend = () => {
    setStep('sending');
    const type = emergencyTypes.find(e => e.id === selected);
    setTimeout(() => {
      issueService.create({
        title: `🚨 SOS: ${type?.label || 'Emergency'} in ${user?.ward || 'Bangalore'}`,
        description: `EMERGENCY: ${type?.label} reported via SOS mode. Immediate attention required.`,
        category: 'electricalHazard',
        location: { lat: 12.9352, lng: 77.6245, address: `${user?.ward || 'Unknown'}, Bangalore` },
        ward: user?.ward || 'Unknown',
        zone: user?.zone || 'South',
        priority: 'critical',
        reportedBy: user?.id || 'guest',
        reporterName: user?.name || 'Anonymous',
        anonymous: false,
      });
      setStep('done');
    }, 2500);
  };

  if (step === 'done') {
    return (
      <div className="sos-page sos-done">
        <div className="success-anim"></div>
        <h2 className="sos-done-title">Emergency Reported! 🚨</h2>
        <p className="sos-done-text">Emergency services have been alerted. Help is on the way.</p>
        <p className="sos-done-text" style={{fontSize:'var(--font-size-xs)',color:'var(--text-tertiary)'}}>
          BBMP Emergency: 080-22660000 | Fire: 101 | Police: 100
        </p>
        <button className="btn btn-primary btn-lg" style={{marginTop:24}} onClick={() => navigate('/home')}>
          Return Home
        </button>
      </div>
    );
  }

  if (step === 'sending') {
    return (
      <div className="sos-page sos-sending">
        <div className="sos-radar">
          <div className="radar-ring ring-1"></div>
          <div className="radar-ring ring-2"></div>
          <div className="radar-ring ring-3"></div>
          <span className="radar-icon">🚨</span>
        </div>
        <h2 className="sos-sending-title">Sending SOS Alert...</h2>
        <p className="sos-sending-text">Alerting emergency services and nearby officials</p>
      </div>
    );
  }

  return (
    <div className="sos-page">
      <div className="sos-header">
        <button className="btn btn-icon" style={{color:'white',background:'rgba(255,255,255,0.1)'}} onClick={() => navigate(-1)}>←</button>
        <h1 className="sos-title">🚨 {t('sos.title')}</h1>
      </div>

      {step === 'select' ? (
        <div className="sos-content">
          <p className="sos-desc">{t('sos.desc')}</p>
          <div className="sos-grid">
            {emergencyTypes.map(e => (
              <button key={e.id} className={`sos-type-btn ${selected === e.id ? 'selected' : ''}`}
                onClick={() => setSelected(e.id)} style={{'--sos-color': e.color}}>
                <span className="sos-type-icon">{e.icon}</span>
                <span className="sos-type-label">{e.label}</span>
              </button>
            ))}
          </div>
          <button className="btn btn-danger btn-full btn-lg sos-send-btn" disabled={!selected}
            onClick={() => setStep('confirm')}>
            ⚠️ Report Emergency
          </button>
        </div>
      ) : (
        <div className="sos-content sos-confirm-content">
          <div className="sos-confirm-icon">{emergencyTypes.find(e => e.id === selected)?.icon}</div>
          <h2 className="sos-confirm-title">Confirm Emergency</h2>
          <p className="sos-confirm-text">
            You are about to report a <strong>{emergencyTypes.find(e => e.id === selected)?.label}</strong> emergency in <strong>{user?.ward || 'Bangalore'}</strong>.
          </p>
          <p className="sos-confirm-warning">⚠️ False reports may result in penalties.</p>
          <div className="flex gap-3" style={{marginTop:24,width:'100%'}}>
            <button className="btn btn-secondary" onClick={() => setStep('select')}>Cancel</button>
            <button className="btn btn-danger btn-lg" style={{flex:1}} onClick={handleSend}>
              🚨 CONFIRM — Send SOS
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
