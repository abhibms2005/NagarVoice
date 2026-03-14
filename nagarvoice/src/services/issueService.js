import mockIssuesData from '../data/mockIssues';
import { getUserByPhone } from '../data/sampleUsers';

const STORAGE_KEY = 'nagarvoice_issues';
const USER_KEY = 'nagarvoice_user';
const NOTIF_KEY = 'nagarvoice_notifications';
const OTP_CODE = '1234';

function getIssues() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { /* ignore */ }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockIssuesData));
  return [...mockIssuesData];
}

function saveIssues(issues) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
}

export const issueService = {
  getAll() { return getIssues(); },
  getById(id) { return getIssues().find(i => i.id === id) || null; },
  getByWard(ward) { return getIssues().filter(i => i.ward === ward); },
  getByStatus(status) { return getIssues().filter(i => i.status === status); },
  getByCategory(category) { return getIssues().filter(i => i.category === category); },

  getUserIssues(userId) {
    return getIssues().filter(i => i.reportedBy === userId);
  },

  getStats() {
    const issues = getIssues();
    return {
      total: issues.length,
      reported: issues.filter(i => i.status === 'reported').length,
      acknowledged: issues.filter(i => i.status === 'acknowledged').length,
      inProgress: issues.filter(i => i.status === 'in-progress').length,
      resolved: issues.filter(i => i.status === 'resolved').length,
      escalated: issues.filter(i => i.status === 'escalated').length,
    };
  },

  getWardStats() {
    const issues = getIssues();
    const wardMap = {};
    issues.forEach(issue => {
      if (!wardMap[issue.ward]) {
        wardMap[issue.ward] = { ward: issue.ward, total: 0, resolved: 0, avgDays: 0, score: 0, topCategories: {} };
      }
      wardMap[issue.ward].total++;
      wardMap[issue.ward].topCategories[issue.category] = (wardMap[issue.ward].topCategories[issue.category] || 0) + 1;
      if (issue.status === 'resolved') {
        wardMap[issue.ward].resolved++;
        const created = new Date(issue.createdAt);
        const updated = new Date(issue.updatedAt);
        const days = Math.max(1, Math.ceil((updated - created) / (1000 * 60 * 60 * 24)));
        wardMap[issue.ward].avgDays += days;
      }
    });
    return Object.values(wardMap).map(w => {
      w.avgDays = w.resolved > 0 ? Math.round(w.avgDays / w.resolved) : 0;
      w.score = w.total > 0 ? Math.round((w.resolved / w.total) * 100) : 0;
      const cats = Object.entries(w.topCategories).sort((a,b) => b[1] - a[1]).slice(0,3).map(e => e[0]);
      w.topCategories = cats.join(', ');
      return w;
    }).sort((a, b) => b.score - a.score);
  },

  getTrendingIssues(limit = 5) {
    const issues = getIssues();
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return issues
      .filter(i => new Date(i.createdAt).getTime() > oneWeekAgo && i.status !== 'resolved')
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, limit);
  },

  create(issue) {
    const issues = getIssues();
    const newIssue = {
      ...issue,
      id: 'ISS' + String(issues.length + 1).padStart(3, '0'),
      status: 'reported',
      upvotes: 0,
      upvotedBy: [],
      comments: [],
      timeline: [{ status: 'reported', time: new Date().toISOString(), note: 'Issue reported by citizen' }],
      assignedTo: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      afterPhoto: null,
    };
    issues.unshift(newIssue);
    saveIssues(issues);
    // Award civic score points
    authService.addCivicScore(10, 'Reported a new issue');
    // Add notification
    notificationService.add({ type: 'report', title: 'Issue Reported!', message: `Your issue "${newIssue.title}" has been submitted. Track ID: ${newIssue.id}`, time: new Date().toISOString() });
    return newIssue;
  },

  upvote(issueId, userId) {
    const issues = getIssues();
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return null;
    if (issue.upvotedBy.includes(userId)) {
      issue.upvotedBy = issue.upvotedBy.filter(id => id !== userId);
      issue.upvotes = Math.max(0, issue.upvotes - 1);
    } else {
      issue.upvotedBy.push(userId);
      issue.upvotes++;
      authService.addCivicScore(2, 'Upvoted an issue');
    }
    saveIssues(issues);
    return issue;
  },

  addComment(issueId, comment) {
    const issues = getIssues();
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return null;
    issue.comments.push({ id: 'c' + Date.now(), user: comment.user, text: comment.text, time: new Date().toISOString() });
    issue.updatedAt = new Date().toISOString();
    saveIssues(issues);
    authService.addCivicScore(3, 'Added a comment');
    return issue;
  },

  updateStatus(issueId, newStatus, note) {
    const issues = getIssues();
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return null;
    const oldStatus = issue.status;
    issue.status = newStatus;
    issue.timeline.push({ status: newStatus, time: new Date().toISOString(), note });
    issue.updatedAt = new Date().toISOString();
    saveIssues(issues);
    // Notify user
    notificationService.add({ type: 'status', title: 'Issue Updated', message: `"${issue.title}" moved from ${oldStatus} → ${newStatus}`, time: new Date().toISOString(), issueId });
    // Check if resolved — trigger confetti flag
    if (newStatus === 'resolved') {
      const user = authService.getCurrentUser();
      if (user && issue.reportedBy === user.id) {
        localStorage.setItem('nagarvoice_confetti', issueId);
      }
    }
    return issue;
  },

  assignIssue(issueId, assignee) {
    const issues = getIssues();
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return null;
    issue.assignedTo = assignee;
    issue.updatedAt = new Date().toISOString();
    saveIssues(issues);
    return issue;
  },

  addAfterPhoto(issueId, afterPhoto) {
    const issues = getIssues();
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return null;
    issue.afterPhoto = afterPhoto;
    saveIssues(issues);
    return issue;
  },

  search(query) {
    const q = query.toLowerCase();
    return getIssues().filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.ward.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q)
    );
  },

  reset() { localStorage.removeItem(STORAGE_KEY); }
};

export const authService = {
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  },

  verifyOtp(otp) {
    return otp === OTP_CODE;
  },

  login(phone, isAdmin = false) {
    // Check if it's a sample user
    const sampleUser = getUserByPhone(phone);
    if (sampleUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(sampleUser));
      return sampleUser;
    }
    // Generic user
    const user = {
      id: 'user_' + phone,
      phone,
      name: 'Citizen',
      ward: 'Koramangala',
      zone: 'South',
      avatar: 'C',
      avatarColor: '#4361ee',
      civicScore: 100,
      tier: 'Bronze',
      points: 100,
      isAdmin,
      badges: ['First Report'],
      joinedAt: new Date().toISOString(),
      issuesReported: 0,
      issuesResolved: 0,
      totalUpvotesReceived: 0,
      bio: '',
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  logout() { localStorage.removeItem(USER_KEY); },

  updateProfile(updates) {
    const user = this.getCurrentUser();
    if (!user) return null;
    const updated = { ...user, ...updates };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
  },

  addCivicScore(points, reason = '') {
    const user = this.getCurrentUser();
    if (!user || user.isAdmin) return;
    user.civicScore = Math.min(1000, (user.civicScore || 0) + points);
    user.points = user.civicScore;
    // Update tier
    if (user.civicScore >= 900) user.tier = 'Platinum';
    else if (user.civicScore >= 600) user.tier = 'Gold';
    else if (user.civicScore >= 300) user.tier = 'Silver';
    else user.tier = 'Bronze';
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  addPoints(points) { return this.addCivicScore(points); }
};

export const notificationService = {
  getAll() {
    try {
      const stored = localStorage.getItem(NOTIF_KEY);
      return stored ? JSON.parse(stored) : this._getDefaults();
    } catch { return this._getDefaults(); }
  },

  _getDefaults() {
    const defaults = [
      { id: 'n1', type: 'status', title: 'Issue Resolved! 🎉', message: 'Broken streetlight on MG Road has been fixed.', time: '2026-03-13T16:00:00', read: false },
      { id: 'n2', type: 'upvote', title: 'Upvote Milestone! 👍', message: 'Your pothole report crossed 50 upvotes!', time: '2026-03-13T12:00:00', read: false },
      { id: 'n3', type: 'ward', title: 'Ward Alert', message: 'BBMP is conducting road repair in Koramangala this week.', time: '2026-03-12T10:00:00', read: true },
      { id: 'n4', type: 'escalation', title: 'Auto-Escalated ⚡', message: 'Sewage overflow in Jayanagar escalated to Zonal Commissioner.', time: '2026-03-11T08:00:00', read: true },
    ];
    localStorage.setItem(NOTIF_KEY, JSON.stringify(defaults));
    return defaults;
  },

  add(notification) {
    const all = this.getAll();
    all.unshift({ id: 'n' + Date.now(), ...notification, read: false });
    localStorage.setItem(NOTIF_KEY, JSON.stringify(all.slice(0, 20)));
  },

  markRead(id) {
    const all = this.getAll();
    const n = all.find(x => x.id === id);
    if (n) n.read = true;
    localStorage.setItem(NOTIF_KEY, JSON.stringify(all));
  },

  markAllRead() {
    const all = this.getAll();
    all.forEach(n => n.read = true);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(all));
  },

  getUnreadCount() {
    return this.getAll().filter(n => !n.read).length;
  }
};
