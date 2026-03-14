// Re-export everything from claude.js as the primary AI service
export { 
  aiRewriteComplaint,
  aiCategorize,
  aiChat,
  aiDetectDuplicate,
  aiWardInsight,
  fallbackCategorize,
  fallbackChatResponse,
  hasApiKey,
  setApiKey,
} from './claude.js';

import { categories } from '../../data/categories';
import { fallbackCategorize as _fallbackCategorize, fallbackChatResponse as _fallbackChatResponse } from './claude.js';

// Legacy compatibility exports
export function categorizeIssue(text, filename = '') {
  const result = _fallbackCategorize(text, filename);
  const cat = categories.find(c => c.id === result.category);
  return { ...result, categoryInfo: cat };
}

export function scorePriority(category, description = '', upvotes = 0) {
  let score = 50;
  const highSev = ['electricalHazard', 'sewage', 'waterLeak'];
  const critical = ['electricalHazard'];
  const low = ['noise', 'encroachment'];
  if (critical.includes(category)) score += 30;
  else if (highSev.includes(category)) score += 20;
  else if (low.includes(category)) score -= 10;
  const urgentWords = ['danger', 'urgent', 'emergency', 'accident', 'child', 'hospital', 'school'];
  const desc = description.toLowerCase();
  for (const w of urgentWords) { if (desc.includes(w)) score += 10; }
  if (upvotes > 100) score += 20;
  else if (upvotes > 50) score += 10;
  else if (upvotes > 20) score += 5;
  if (score >= 80) return 'critical';
  if (score >= 65) return 'high';
  if (score >= 45) return 'medium';
  return 'low';
}

export function detectDuplicate(newIssue, existingIssues, radiusKm = 0.3) {
  const R = 6371;
  const toRad = deg => deg * Math.PI / 180;
  return existingIssues.filter(existing => {
    if (existing.category !== newIssue.category) return false;
    if (existing.status === 'resolved') return false;
    if (!existing.location || !newIssue.location) return false;
    const dLat = toRad(existing.location.lat - newIssue.location.lat);
    const dLng = toRad(existing.location.lng - newIssue.location.lng);
    const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(newIssue.location.lat)) * Math.cos(toRad(existing.location.lat)) * Math.sin(dLng/2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) <= radiusKm;
  });
}

export function getSmartSuggestions(ward, issues) {
  const wardIssues = issues.filter(i => i.ward === ward && i.status !== 'resolved');
  const catCount = {};
  wardIssues.forEach(i => { catCount[i.category] = (catCount[i.category] || 0) + 1; });
  return Object.entries(catCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, count]) => ({ category: cat, count, info: categories.find(c => c.id === cat) }));
}

export function getChatResponse(message, context = {}) {
  return _fallbackChatResponse(message, context);
}
