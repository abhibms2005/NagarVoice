import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { issueService, authService } from '../services/issueService';
import { aiCategorize, aiRewriteComplaint, aiDetectDuplicate, hasApiKey, fallbackCategorize } from '../services/ai/claude';
import { detectDuplicate } from '../services/ai';
import { categories, wardsList } from '../data/categories';
import './ReportIssue.css';

export default function ReportIssue() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const cameraRef = useRef();
  const galleryRef = useRef();

  const [step, setStep] = useState(1); // 3-step flow
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [category, setCategory] = useState(location.state?.category || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedWard, setSelectedWard] = useState(user?.ward || '');
  const [priority, setPriority] = useState('medium');
  const [anonymous, setAnonymous] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiWriting, setAiWriting] = useState(false);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
    // AI categorize
    runAI(file.name);
  };

  const runAI = async (filename) => {
    setAiAnalyzing(true);
    try {
      if (hasApiKey()) {
        const result = await aiCategorize(description || 'civic issue', filename);
        setAiResult(result);
        if (result.category) setCategory(result.category);
        if (result.suggestedTitle) setTitle(result.suggestedTitle);
        if (result.suggestedDescription) setDescription(result.suggestedDescription);
        if (result.priority) setPriority(result.priority);
      } else {
        await new Promise(r => setTimeout(r, 800));
        const result = fallbackCategorize(filename + ' ' + description);
        setCategory(result.category);
        setAiResult({ category: result.category, confidence: result.confidence });
      }
    } catch (err) { console.error(err); }
    setAiAnalyzing(false);
  };

  const handleAIRewrite = async () => {
    if (!description.trim()) return;
    setAiWriting(true);
    try {
      if (hasApiKey()) {
        const formal = await aiRewriteComplaint(description, category, selectedWard);
        setDescription(formal);
      }
    } catch (err) { console.error(err); }
    setAiWriting(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !category) return;
    setSubmitting(true);
    // Check duplicates
    const newIssue = {
      title, description, category,
      location: { lat: 12.9352 + (Math.random() - 0.5) * 0.1, lng: 77.6245 + (Math.random() - 0.5) * 0.1, address: `${selectedWard}, Bangalore` },
      ward: selectedWard, zone: user?.zone || 'South', priority, anonymous,
      reportedBy: user?.id || 'guest', reporterName: anonymous ? 'Anonymous' : (user?.name || 'Citizen'),
    };

    const existing = issueService.getAll();
    const nearby = detectDuplicate(newIssue, existing);
    if (nearby.length > 0) {
      setDuplicates(nearby);
    }

    const created = issueService.create(newIssue);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => navigate(`/issue/${created.id}`), 2000);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="page report-page report-success">
        <div className="success-anim"></div>
        <h2 className="success-title">Issue Reported! 🎉</h2>
        <p className="success-text">Your report has been submitted successfully. You can track it from your profile.</p>
        <p className="success-score">+10 Civic Score Points ⭐</p>
      </div>
    );
  }

  return (
    <div className="page report-page">
      <div className="report-topbar">
        <button className="btn btn-icon btn-ghost" onClick={() => navigate(-1)}>←</button>
        <h1 className="page-title">📸 {t('report.title')}</h1>
        <span className="report-step">Step {step}/3</span>
      </div>

      {/* Step Indicator */}
      <div className="step-indicator">
        {[1,2,3].map(s => (
          <div key={s} className={`step-dot ${s === step ? 'active' : s < step ? 'done' : ''}`}>
            {s < step ? '✓' : s}
          </div>
        ))}
        <div className="step-line"><div className="step-line-fill" style={{width:`${((step-1)/2)*100}%`}}></div></div>
      </div>

      {/* Step 1: Photo */}
      {step === 1 && (
        <div className="report-step-content">
          <h2 className="step-title">📷 Capture the Issue</h2>
          <p className="step-desc">Take a photo or select from gallery</p>

          {/* Photo preview area */}
          {photoPreview ? (
            <div className="photo-upload photo-upload-has-image">
              <img src={photoPreview} alt="Issue" className="photo-preview" />
              <div className="photo-overlay">
                <span className="photo-change-text">Tap buttons below to change</span>
              </div>
            </div>
          ) : (
            <div className="photo-upload">
              <div className="photo-placeholder">
                <span className="photo-icon">📷</span>
                <p>Use the buttons below to add a photo</p>
              </div>
            </div>
          )}

          {/* Two separate photo action buttons */}
          <div className="photo-actions">
            <button
              type="button"
              className="btn photo-action-btn photo-action-camera"
              onClick={() => cameraRef.current?.click()}
            >
              <span className="photo-action-icon">📷</span>
              <span>Take Photo</span>
            </button>
            <button
              type="button"
              className="btn photo-action-btn photo-action-gallery"
              onClick={() => galleryRef.current?.click()}
            >
              <span className="photo-action-icon">🖼️</span>
              <span>Choose from Gallery</span>
            </button>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhoto}
            hidden
          />
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            hidden
          />

          {aiAnalyzing && (
            <div className="ai-analyzing glass-card">
              <div className="ai-typing"><span></span><span></span><span></span></div>
              <p>AI is analyzing your photo...</p>
              <span className="ai-powered-badge">Powered by Claude AI</span>
            </div>
          )}

          {aiResult && !aiAnalyzing && (
            <div className="ai-result glass-card">
              <span className="ai-powered-badge">{hasApiKey() ? 'Claude AI' : 'Auto-detect'}</span>
              <p className="ai-detected">Detected: <strong>{categories.find(c => c.id === aiResult.category)?.icon} {aiResult.category}</strong></p>
              {aiResult.suggestedTitle && <p className="ai-suggested">Suggested: "{aiResult.suggestedTitle}"</p>}
            </div>
          )}

          <button className="btn btn-primary btn-full btn-lg" onClick={() => setStep(2)} style={{marginTop:16}}>
            Continue →
          </button>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="report-step-content">
          <h2 className="step-title">📝 Issue Details</h2>

          <div className="input-group">
            <label>{t('report.category')}</label>
            <div className="category-grid">
              {categories.map(c => (
                <button key={c.id} className={`cat-chip ${category === c.id ? 'active' : ''}`} onClick={() => setCategory(c.id)}>
                  <span>{c.icon}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label>{t('report.issueTitle')}</label>
            <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief issue title" />
          </div>

          <div className="input-group">
            <label>{t('report.description')} {hasApiKey() && <button className="btn-text" onClick={handleAIRewrite} disabled={aiWriting} style={{fontSize:11}}>{aiWriting ? 'Rewriting...' : '✨ AI Rewrite'}</button>}</label>
            <textarea className="input-field" rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the issue..." />
          </div>

          <div className="input-group">
            <label>{t('report.ward')}</label>
            <select className="input-field" value={selectedWard} onChange={e => setSelectedWard(e.target.value)}>
              <option value="">Select ward</option>
              {wardsList.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>

          <div className="flex gap-3" style={{marginBottom:16}}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(3)} disabled={!title.trim() || !category} style={{flex:1}}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3: Priority & Submit */}
      {step === 3 && (
        <div className="report-step-content">
          <h2 className="step-title">⚡ Priority & Submit</h2>

          <div className="input-group">
            <label>{t('report.priority')}</label>
            <div className="priority-btns">
              {['low','medium','high','critical'].map(p => (
                <button key={p} className={`priority-btn priority-${p} ${priority === p ? 'active' : ''}`} onClick={() => setPriority(p)}>
                  {p === 'low' ? '🟢' : p === 'medium' ? '🟡' : p === 'high' ? '🟠' : '🔴'} {p}
                </button>
              ))}
            </div>
          </div>

          <label className="anonymous-toggle">
            <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} />
            <span className="toggle-switch"></span>
            <span>🔒 Report Anonymously</span>
          </label>

          {duplicates.length > 0 && (
            <div className="duplicate-warn glass-card" style={{borderLeft:'3px solid var(--color-warning)',marginTop:16}}>
              <p className="fw-600">⚠️ Possible duplicate detected</p>
              <p className="text-xs text-secondary">{duplicates.length} similar issue(s) found nearby. You can still submit.</p>
            </div>
          )}

          <div className="flex gap-3" style={{marginTop:20}}>
            <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting} style={{flex:1}}>
              {submitting ? <><span className="spinner"></span> Submitting...</> : '✅ Submit Report'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
