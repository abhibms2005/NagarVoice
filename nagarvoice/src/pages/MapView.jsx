import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useI18n } from '../i18n/I18nContext';
import { issueService } from '../services/issueService';
import { categories } from '../data/categories';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

const statusColors = {
  'reported': '#ef233c', 'acknowledged': '#fca311',
  'in-progress': '#4cc9f0', 'resolved': '#06d6a0', 'escalated': '#7209b7'
};

const wardCouncilors = {
  'Koramangala': { name: 'Rajesh Kumar', phone: '9876000001', party: 'INC' },
  'Indiranagar': { name: 'Meera Devi', phone: '9876000002', party: 'BJP' },
  'Jayanagar': { name: 'Siddaraju H', phone: '9876000003', party: 'JDS' },
  'Shivajinagar': { name: 'Ahmed Khan', phone: '9876000004', party: 'INC' },
  'Malleshwaram': { name: 'Geetha S', phone: '9876000005', party: 'BJP' },
  'Whitefield': { name: 'Ramesh Gowda', phone: '9876000006', party: 'BJP' },
  'HSR Layout': { name: 'Priyanka R', phone: '9876000007', party: 'AAP' },
  'BTM Layout': { name: 'Venkatesh M', phone: '9876000008', party: 'INC' },
};

function createMarkerIcon(status) {
  const color = statusColors[status] || '#999';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export default function MapView() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [loading, setLoading] = useState(true);
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  useEffect(() => {
    setTimeout(() => { setIssues(issueService.getAll()); setLoading(false); }, 300);
  }, []);

  const filtered = useMemo(() => {
    return issues.filter(i => {
      if (filter !== 'all' && i.status !== filter) return false;
      if (catFilter !== 'all' && i.category !== catFilter) return false;
      return true;
    });
  }, [issues, filter, catFilter]);

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  if (loading) {
    return (
      <div className="map-page">
        <div className="skeleton skeleton-card" style={{height:'100vh'}}></div>
      </div>
    );
  }

  return (
    <div className="map-page">
      {/* Header */}
      <div className="map-header">
        <button className="btn btn-icon btn-ghost" onClick={() => navigate(-1)}>←</button>
        <h2 className="map-title">🗺️ {t('map.title')}</h2>
        <span className="map-count badge badge-in-progress">{filtered.length} issues</span>
      </div>

      {/* Filters */}
      <div className="map-filters">
        <div className="filter-scroll">
          {['all','reported','acknowledged','in-progress','resolved','escalated'].map(s => (
            <button key={s} className={`chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s === 'all' ? '🔍 All' : `${s.replace('-',' ')}`}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="map-container">
        <MapContainer center={[12.9716, 77.5946]} zoom={12} scrollWheelZoom style={{width:'100%',height:'100%'}}>
          <TileLayer url={tileUrl} attribution='&copy; <a href="https://carto.com">CARTO</a>' />
          {filtered.map(issue => (
            <Marker key={issue.id} position={[issue.location.lat, issue.location.lng]} icon={createMarkerIcon(issue.status)}
              eventHandlers={{ click: () => {
                setSelectedIssue(issue);
                // Check if we know the ward info
                const ward = Object.keys(wardCouncilors).find(w => issue.ward.includes(w));
                setSelectedWard(ward ? { name: ward, ...wardCouncilors[ward], openIssues: issues.filter(i => i.ward === ward && i.status !== 'resolved').length } : null);
              }}}
            />
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="map-legend glass-card">
          {Object.entries(statusColors).map(([status, color]) => (
            <span key={status} className="legend-item">
              <span className="legend-dot" style={{background:color}}></span>
              <span className="legend-label">{status.replace('-',' ')}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Sheet */}
      {selectedIssue && (
        <>
          <div className="bottom-sheet-backdrop" onClick={() => { setSelectedIssue(null); setSelectedWard(null); }}></div>
          <div className="bottom-sheet">
            <div className="bottom-sheet-handle"></div>
            <div className="sheet-content">
              <div className="sheet-issue">
                <div className="flex-between mb-2">
                  <span className={`badge badge-${selectedIssue.status.replace(' ','-')}`}>{selectedIssue.status.replace('-',' ')}</span>
                  <span className={`badge badge-${selectedIssue.priority}`}>{selectedIssue.priority}</span>
                </div>
                <h3 className="sheet-title">{selectedIssue.title}</h3>
                <p className="sheet-location">📍 {selectedIssue.location.address}</p>
                <p className="sheet-meta">👍 {selectedIssue.upvotes} upvotes • 💬 {selectedIssue.comments.length} comments</p>
                <button className="btn btn-primary btn-sm" style={{marginTop:12}} onClick={() => navigate(`/issue/${selectedIssue.id}`)}>
                  View Details →
                </button>
              </div>

              {/* Ward Info */}
              {selectedWard && (
                <div className="ward-info-card glass-card" style={{marginTop:16}}>
                  <h4 className="fw-600">🏘️ {selectedWard.name} Ward</h4>
                  <p className="text-xs text-secondary mt-2">
                    👤 Councilor: <strong>{selectedWard.councilName || selectedWard.name}</strong> ({selectedWard.party})<br/>
                    📱 Contact: {selectedWard.phone}<br/>
                    📋 Open Issues: <strong>{selectedWard.openIssues}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
