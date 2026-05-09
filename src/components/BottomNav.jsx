import { NavLink, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { notificationService } from '../services/issueService';
import { useState } from 'react';
import './BottomNav.css';

const tabs = [
  { path: '/home', icon: '🏠', activeIcon: '🏠', key: 'home' },
  { path: '/map', icon: '🗺️', activeIcon: '🗺️', key: 'map' },
  { path: '/report', icon: '+', activeIcon: '+', key: 'report', isCenter: true },
  { path: '/leaderboard', icon: '🏆', activeIcon: '🏆', key: 'leaderboard' },
  { path: '/profile', icon: '👤', activeIcon: '👤', key: 'profile' },
];

export default function BottomNav() {
  const { t } = useI18n();
  const location = useLocation();
  const unread = notificationService.getUnreadCount();

  const handleTap = () => {
    if (navigator.vibrate) navigator.vibrate(5);
  };

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {tabs.map(tab => {
        const isActive = location.pathname === tab.path;
        if (tab.isCenter) {
          return (
            <NavLink key={tab.path} to={tab.path} className="nav-center-btn" onClick={handleTap} aria-label="Report Issue">
              <span className="nav-center-plus">+</span>
            </NavLink>
          );
        }
        return (
          <NavLink key={tab.path} to={tab.path} className={`nav-tab ${isActive ? 'active' : ''}`} onClick={handleTap}>
            <span className={`nav-tab-icon ${isActive ? 'icon-active' : ''}`}>
              {tab.icon}
              {tab.key === 'home' && unread > 0 && <span className="nav-notif-dot"></span>}
            </span>
            <span className="nav-tab-label">{t(`nav.${tab.key}`)}</span>
            {isActive && <span className="nav-active-pill"></span>}
          </NavLink>
        );
      })}
    </nav>
  );
}
