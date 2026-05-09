import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { loginUser, getCurrentUser } from '../services/api/authService';
import sampleUsers from '../data/sampleUsers';
import './Login.css';

export default function Login() {
  const { t, language, switchLanguage } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [phone, setPhone] = useState(location.state?.phone || '');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [step, setStep] = useState('phone'); // phone | otp | loading
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phone.length !== 10) { setError('Enter a valid 10-digit number'); return; }
    setError('');
    setStep('otp');
  };

  const handleOtpChange = (idx, val) => {
    if (val.length > 1) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 3) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
    if (newOtp.every(d => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const handleVerify = async (otpCode) => {
    try {
      setStep('loading');
      const result = await loginUser(phone, otpCode || otp.join(''));
      
      console.log('Login result:', result);
      console.log('User object:', result.user);
      console.log('is_admin field:', result.user?.is_admin);
      console.log('is_admin type:', typeof result.user?.is_admin);
      console.log('is_admin truthy:', !!result.user?.is_admin);
      
      // Check if user is admin - handle both boolean and string values
      const isAdmin = result.user?.is_admin === true || result.user?.is_admin === 'true' || result.user?.is_admin === 1;
      
      if (isAdmin) {
        console.log('🔐 Redirecting to Admin Dashboard');
        navigate('/admin', { replace: true });
      } else {
        console.log('👤 Redirecting to Home (Citizen)');
        localStorage.setItem('nagarvoice_onboarded', 'true');
        navigate('/home', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid OTP. Use 1234');
      setStep('otp');
    }
  };

  const handleGuestLogin = async () => {
    try {
      setStep('loading');
      await loginUser('0000000000', '1234');
      localStorage.setItem('nagarvoice_onboarded', 'true');
      navigate('/home', { replace: true });
    } catch (err) {
      setError('Guest login failed');
      setStep('phone');
    }
  };

  const handleDemoLogin = (ph) => {
    setPhone(ph);
    setStep('otp');
  };

  if (step === 'loading') {
    return (
      <div className="login-page login-loading">
        <div className="login-loader">
          <div className="loader-ring"></div>
          <p className="loader-text">{t('login.verifying')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      {/* Gradient Header */}
      <div className="login-hero hero-gradient">
        <div className="login-hero-content">
          <div className="login-logo">🏛️</div>
          <h1 className="login-app-name">NagarVoice</h1>
          <p className="login-tagline">{t('login.subtitle')}</p>
        </div>
        <div className="login-lang-toggle">
          <button className={`lang-btn ${language === 'en' ? 'active' : ''}`} onClick={() => switchLanguage('en')}>EN</button>
          <button className={`lang-btn ${language === 'kn' ? 'active' : ''}`} onClick={() => switchLanguage('kn')}>ಕನ್ನಡ</button>
        </div>
      </div>

      {/* Form */}
      <div className="login-form-container">
        {step === 'phone' ? (
          <form className="login-form" onSubmit={handleSendOtp}>
            <h2 className="login-form-title">{t('login.title')}</h2>
            <p className="login-form-desc">{t('login.otpInfo')}</p>

            <div className="phone-input-group">
              <span className="phone-prefix">+91</span>
              <input
                type="tel"
                className="phone-input"
                maxLength={10}
                value={phone}
                onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
                placeholder="Enter phone number"
                autoFocus
              />
            </div>
            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={phone.length !== 10}>
              {t('login.sendOtp')} →
            </button>

            <button type="button" className="btn btn-ghost btn-full" onClick={handleGuestLogin} style={{marginTop: 12}}>
              {t('login.guestLogin')}
            </button>

            <button type="button" className="btn btn-secondary btn-full" onClick={() => navigate('/register')} style={{marginTop: 10}}>
              New in Bengaluru? Register Account
            </button>
          </form>
        ) : (
          <div className="login-form">
            <h2 className="login-form-title">{t('login.enterOtp')}</h2>
            <p className="login-form-desc">OTP sent to +91 {phone} <button className="btn-text" onClick={() => { setStep('phone'); setOtp(['','','','']); }}>Change</button></p>

            <div className="otp-input-row">
              {otp.map((d, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="tel"
                  maxLength={1}
                  className="otp-box"
                  value={d}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  autoFocus={i === 0}
                />
              ))}
            </div>
            {error && <p className="login-error">{error}</p>}

            <p className="otp-hint">Demo OTP: <strong>1234</strong></p>

            <button className="btn btn-primary btn-full btn-lg" onClick={() => handleVerify()} disabled={otp.some(d => d === '')}>
              {t('login.verify')} ✓
            </button>
          </div>
        )}

        {/* Demo Credentials Card */}
        <div className="demo-credentials">
          <button className="demo-toggle" onClick={() => setShowDemo(!showDemo)}>
            <span>🎓 Demo Credentials for Evaluators</span>
            <span className={`demo-chevron ${showDemo ? 'open' : ''}`}>▼</span>
          </button>
          {showDemo && (
            <div className="demo-list">
              <p className="demo-otp-note">OTP for all: <strong>1234</strong></p>
              {sampleUsers.filter(u => !u.isAdmin).map(u => (
                <button key={u.phone} className="demo-user-card" onClick={() => handleDemoLogin(u.phone)}>
                  <div className="demo-avatar" style={{background: u.avatarColor}}>{u.avatar}</div>
                  <div className="demo-info">
                    <span className="demo-name">{u.name}</span>
                    <span className="demo-meta">{u.ward} • {u.tier}{u.civicScore ? ` • Score: ${u.civicScore}` : ''}</span>
                  </div>
                  <span className="demo-phone">{u.phone}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Floating Admin Button */}
        <button 
          className="floating-admin-btn" 
          onClick={() => setShowAdminModal(true)}
          title="Administrator Access"
        >
          <span className="admin-float-icon">👨‍💼</span>
          <span className="admin-float-label">Admin</span>
        </button>

        {/* Admin Modal */}
        {showAdminModal && (
          <div className="admin-modal-overlay" onClick={() => setShowAdminModal(false)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <button className="admin-modal-close" onClick={() => setShowAdminModal(false)}>✕</button>
              
              <div className="admin-modal-header">
                <div className="admin-modal-icon">🔐</div>
                <h2 className="admin-modal-title">Administrator Access</h2>
                <p className="admin-modal-subtitle">Privileged Portal for BBMP Officials</p>
              </div>

              <div className="admin-modal-content">
                {sampleUsers.filter(u => u.isAdmin).map(u => (
                  <button
                    key={u.phone}
                    className="admin-modal-card"
                    onClick={() => {
                      handleDemoLogin(u.phone);
                      setShowAdminModal(false);
                    }}
                  >
                    <div className="admin-modal-avatar" style={{background: u.avatarColor}}>
                      {u.avatar}
                    </div>
                    <div className="admin-modal-info">
                      <span className="admin-modal-name">{u.name}</span>
                      <span className="admin-modal-desc">{u.bio}</span>
                      <span className="admin-modal-phone">+91 {u.phone}</span>
                    </div>
                    <div className="admin-modal-unlock">🔓</div>
                  </button>
                ))}
              </div>

              <p className="admin-modal-note">OTP: <strong>1234</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
