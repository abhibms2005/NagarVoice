import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import './Onboarding.css';

const slides = [
  {
    icon: '📸',
    iconBg: 'linear-gradient(135deg, #4361ee, #3a0ca3)',
    illustration: '🏙️',
    decorIcons: ['🕳️', '🗑️', '💡', '💧'],
  },
  {
    icon: '📍',
    iconBg: 'linear-gradient(135deg, #06d6a0, #048a65)',
    illustration: '🗺️',
    decorIcons: ['📱', '⏱️', '🔔', '✅'],
  },
  {
    icon: '🏆',
    iconBg: 'linear-gradient(135deg, #f7b801, #e5a800)',
    illustration: '🎖️',
    decorIcons: ['👍', '🏅', '📊', '⭐'],
  },
  {
    icon: '🤖',
    iconBg: 'linear-gradient(135deg, #7209b7, #560a86)',
    illustration: '💬',
    decorIcons: ['✨', '📝', '🔍', '💡'],
  },
];

export default function Onboarding() {
  const { t, language, switchLanguage } = useI18n();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState('next');

  useEffect(() => {
    if (localStorage.getItem('nagarvoice_onboarded')) {
      navigate('/home', { replace: true });
    }
  }, []);

  const slidesData = t('onboarding.slides');
  const isLast = current === slides.length - 1;

  const next = () => {
    if (isLast) {
      localStorage.setItem('nagarvoice_onboarded', 'true');
      navigate('/login');
    } else {
      setDirection('next');
      setCurrent(current + 1);
    }
  };

  const skip = () => {
    localStorage.setItem('nagarvoice_onboarded', 'true');
    navigate('/login');
  };

  return (
    <div className="onboarding-page">
      {/* Language Toggle */}
      <div className="ob-top-bar">
        <div className="ob-lang-toggle">
          <button className={`lang-btn ${language === 'en' ? 'active' : ''}`} onClick={() => switchLanguage('en')}>EN</button>
          <button className={`lang-btn ${language === 'kn' ? 'active' : ''}`} onClick={() => switchLanguage('kn')}>ಕನ್ನಡ</button>
        </div>
        {!isLast && <button className="btn btn-ghost btn-sm" onClick={skip}>{t('onboarding.skip')} →</button>}
      </div>

      {/* Slide Content */}
      <div className="ob-slide" key={current}>
        {/* Animated Decorations */}
        <div className="ob-decor">
          {slides[current].decorIcons.map((icon, i) => (
            <span key={i} className="ob-float-icon" style={{
              '--delay': `${i * 0.5}s`,
              '--x': `${20 + i * 20}%`,
              '--y': `${10 + (i % 3) * 25}%`,
            }}>{icon}</span>
          ))}
        </div>

        {/* Main Icon */}
        <div className="ob-icon-container">
          <div className="ob-icon-circle" style={{background: slides[current].iconBg}}>
            <span className="ob-main-icon">{slides[current].icon}</span>
          </div>
          <span className="ob-illustration">{slides[current].illustration}</span>
        </div>

        {/* Text */}
        <h2 className="ob-title">{slidesData[current]?.title || ''}</h2>
        <p className="ob-desc">{slidesData[current]?.desc || ''}</p>
      </div>

      {/* Bottom Section */}
      <div className="ob-bottom">
        <div className="ob-dots">
          {slides.map((_, i) => (
            <span key={i} className={`ob-dot ${i === current ? 'active' : ''} ${i < current ? 'done' : ''}`}></span>
          ))}
        </div>
        <button className="btn btn-primary btn-lg btn-full ob-next-btn" onClick={next}>
          {isLast ? t('onboarding.getStarted') : t('onboarding.next')} →
        </button>
      </div>
    </div>
  );
}
