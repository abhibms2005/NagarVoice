import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { issueService, authService } from '../services/issueService';
import { categories } from '../data/categories';
import './IssueDetail.css';

function BeforeAfterSlider() {
  const [pos, setPos] = useState(50);
  const containerRef = useRef(null);
  const handleDrag = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(5, Math.min(95, x)));
  };
  return (
    <div className="ba-slider-container" ref={containerRef}
      onMouseMove={e => e.buttons === 1 && handleDrag(e)}
      onTouchMove={handleDrag}>
      <div className="ba-after" style={{background: 'linear-gradient(135deg, #06d6a044, #06d6a022)', display:'flex',alignItems:'center',justifyContent:'center'}}>
        <span style={{fontSize:'3rem',opacity:0.3}}>✅</span>
      </div>
      <div className="ba-before" style={{background: 'linear-gradient(135deg, #ef233c44, #ef233c22)', display:'flex',alignItems:'center',justifyContent:'center', clipPath: `inset(0 ${100-pos}% 0 0)`}}>
        <span style={{fontSize:'3rem',opacity:0.3}}>⚠️</span>
      </div>
      <div className="ba-handle" style={{'--handle-pos': `${pos}%`}}></div>
      <span className="ba-label ba-label-before">Before</span>
      <span className="ba-label ba-label-after">After</span>
    </div>
  );
}

export default function IssueDetail() {
  const { t } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [issue, setIssue] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIssue(issueService.getById(id));
      setLoading(false);
    }, 300);
  }, [id]);

  const handleUpvote = () => {
    const updated = issueService.upvote(issue.id, user?.id || 'guest');
    setIssue({...updated});
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const updated = issueService.addComment(issue.id, { user: user?.name || 'Citizen', text: comment });
    setIssue({...updated});
    setComment('');
  };

  const handleEscalate = () => {
    const updated = issueService.updateStatus(issue.id, 'escalated', 'Escalated by citizen due to delayed response');
    setIssue({...updated});
  };

  // ─── Delete complaint logic ───
  const handleDeleteConfirm = () => {
    setDeleting(true);
    setTimeout(() => {
      issueService.deleteIssue(issue.id);
      setDeleting(false);
      setShowDeleteModal(false);
      setDeleteSuccess(true);
      // Redirect after showing success toast
      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 1800);
    }, 800);
  };

  const isOwner = user && issue && !user.isAdmin && issue.reportedBy === user.id;

  const whatsappText = issue ? encodeURIComponent(`🚨 ${issue.title}\n📍 ${issue.location.address}\n\nTrack: ${window.location.href}`) : '';
  const cat = issue ? categories.find(c => c.id === issue.category) : null;
  const isUpvoted = issue?.upvotedBy?.includes(user?.id || 'guest');

  if (loading) {
    return (
      <div className="page detail-page">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-card" style={{height:200}}></div>
        <div className="skeleton skeleton-card" style={{height:160}}></div>
      </div>
    );
  }

  if (!issue) return (
    <div className="page detail-page">
      <div className="empty-state">
        <span className="empty-state-icon">🔍</span>
        <p className="empty-state-title">Issue not found</p>
        <p className="empty-state-text">ಸಮಸ್ಯೆ ಕಂಡುಬಂದಿಲ್ಲ</p>
        <button className="btn btn-primary" style={{marginTop:16}} onClick={() => navigate('/home')}>Go Home</button>
      </div>
    </div>
  );

  return (
    <div className="page detail-page">
      {/* Delete Success Toast */}
      {deleteSuccess && (
        <div className="delete-toast">
          <span className="delete-toast-icon">✅</span>
          <span>Complaint deleted successfully</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          <div className="modal-backdrop" onClick={() => !deleting && setShowDeleteModal(false)}></div>
          <div className="modal-container">
            <div className="delete-modal glass-card-heavy">
              <div className="delete-modal-icon">🗑️</div>
              <h3 className="delete-modal-title">Delete Complaint?</h3>
              <p className="delete-modal-text">
                Are you sure you want to delete this complaint? This cannot be undone.
              </p>
              <p className="delete-modal-text-kn">
                ನೀವು ಈ ದೂರನ್ನು ಅಳಿಸಲು ಬಯಸುತ್ತೀರಾ? ಇದನ್ನು ರದ್ದುಗೊಳಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.
              </p>
              <div className="delete-modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                >
                  {deleting ? <><span className="spinner"></span> Deleting...</> : '🗑️ Delete'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Top Bar */}
      <div className="detail-topbar">
        <button className="btn btn-icon btn-ghost" onClick={() => navigate(-1)}>←</button>
        <span className="detail-id">{issue.id}</span>
        <a href={`https://wa.me/?text=${whatsappText}`} target="_blank" rel="noopener" className="whatsapp-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
          Share
        </a>
      </div>

      {/* Issue Header */}
      <div className="detail-header glass-card">
        <div className="detail-badges">
          <span className={`badge badge-${issue.status.replace(' ','-')}`}>{issue.status.replace('-',' ')}</span>
          <span className={`badge badge-${issue.priority}`}>{issue.priority}</span>
          <span className="detail-cat">{cat?.icon} {cat?.name || issue.category}</span>
        </div>
        <h1 className="detail-title">{issue.title}</h1>
        <p className="detail-location">📍 {issue.location.address}</p>
        <p className="detail-date">📅 {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        {!issue.anonymous && <p className="detail-reporter">👤 {issue.reporterName} • {issue.ward} Ward</p>}
      </div>

      {/* Description */}
      <div className="section">
        <h2 className="section-title">📝 Description</h2>
        <p className="detail-desc">{issue.description}</p>
      </div>

      {/* Before/After Slider (for resolved issues) */}
      {issue.status === 'resolved' && (
        <div className="section">
          <h2 className="section-title">📸 Before / After</h2>
          <BeforeAfterSlider />
        </div>
      )}

      {/* Action Buttons */}
      <div className="detail-actions">
        <button className={`detail-action-btn ${isUpvoted ? 'upvoted' : ''}`} onClick={handleUpvote}>
          <span className="action-icon">{isUpvoted ? '👍' : '👍'}</span>
          <span className="action-count">{issue.upvotes}</span>
          <span className="action-label">Upvote</span>
        </button>
        {issue.status !== 'resolved' && issue.status !== 'escalated' && (
          <button className="detail-action-btn escalate" onClick={handleEscalate}>
            <span className="action-icon">⚡</span>
            <span className="action-label">Escalate</span>
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="section">
        <h2 className="section-title">⏱️ Status Timeline</h2>
        <div className="timeline">
          {(issue.timeline || []).map((entry, i) => (
            <div key={i} className={`timeline-item ${i === issue.timeline.length - 1 ? 'active' : 'done'}`}>
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <span className={`badge badge-${entry.status.replace(' ','-')}`}>{entry.status.replace('-',' ')}</span>
                <p className="timeline-note">{entry.note}</p>
                <p className="timeline-time">{new Date(entry.time).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div className="section">
        <h2 className="section-title">💬 Comments ({(issue.comments || []).length})</h2>
        {(issue.comments || []).length === 0 ? (
          <div className="empty-state" style={{padding:'24px 0'}}>
            <span className="empty-state-icon" style={{fontSize:'2rem'}}>💬</span>
            <p className="empty-state-text">No comments yet. Be the first!</p>
          </div>
        ) : (
          <div className="comments-list">
            {issue.comments.map(c => (
              <div key={c.id} className="comment-item">
                <div className="comment-avatar">{c.user[0]}</div>
                <div className="comment-body">
                  <span className="comment-user">{c.user}</span>
                  <p className="comment-text">{c.text}</p>
                  <span className="comment-time">{new Date(c.time).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <form className="comment-form" onSubmit={handleComment}>
          <input className="comment-input input-field" value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." />
          <button type="submit" className="btn btn-primary btn-sm" disabled={!comment.trim()}>Post</button>
        </form>
      </div>

      {/* Meta */}
      <div className="section">
        <h2 className="section-title">ℹ️ Issue Info</h2>
        <div className="meta-grid glass-card">
          <div className="meta-item"><span className="meta-label">Ward</span><span className="meta-value">{issue.ward}</span></div>
          <div className="meta-item"><span className="meta-label">Zone</span><span className="meta-value">{issue.zone}</span></div>
          <div className="meta-item"><span className="meta-label">Assigned To</span><span className="meta-value">{issue.assignedTo || 'Unassigned'}</span></div>
          <div className="meta-item"><span className="meta-label">Last Updated</span><span className="meta-value">{new Date(issue.updatedAt).toLocaleDateString()}</span></div>
        </div>
      </div>

      {/* Delete Button — Only visible to the original reporter */}
      {isOwner && (
        <div className="section delete-section">
          <button
            className="btn btn-delete-complaint"
            onClick={() => setShowDeleteModal(true)}
          >
            🗑️ Delete Complaint
          </button>
          <p className="delete-hint">Only you (the original reporter) can delete this complaint</p>
        </div>
      )}
    </div>
  );
}
