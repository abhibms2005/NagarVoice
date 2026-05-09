// ============================================
// NagarVoice — Main AI Service (Azure OpenAI)
// ============================================

// Re-export Azure functions as primary AI service
export { 
  azureCategorize,
  azureChat,
  setAzureOpenAIConfig,
  hasAzureOpenAIConfig,
} from './azure.js';

import { categories } from '../../data/categories';

// Legacy compatibility exports
export function categorizeIssue(text, filename = '') {
  const result = fallbackCategorize(text, filename);
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
  return fallbackChatResponse(message, context);
}

// ─── Fallback functions (when no Azure API key or for offline use) ───
export function fallbackCategorize(text, filename = '') {
  const input = (text + ' ' + filename).toLowerCase();
  const categoryKeywords = {
    pothole: ['pothole', 'hole', 'pit', 'crater', 'potholes'],
    garbage: ['garbage', 'trash', 'waste', 'dump', 'litter', 'rubbish', 'bin', 'pile'],
    streetlight: ['light', 'lamp', 'streetlight', 'bulb', 'dark', 'pole', 'LED'],
    waterLeak: ['water', 'leak', 'pipe', 'burst', 'flood', 'puddle', 'tap'],
    sewage: ['sewage', 'sewer', 'drain', 'smell', 'overflow', 'manhole'],
    encroachment: ['encroach', 'footpath', 'pavement', 'sidewalk', 'vendor', 'illegal'],
    roadDamage: ['road damage', 'road cracked', 'road broken', 'surface', 'cave', 'sinkhole', 'crack', 'asphalt'],
    treeFall: ['tree', 'treefall', 'tree-fall', 'fallen tree', 'falling tree', 'branch', 'branches', 'uprooted', 'storm', 'trunk', 'blocked by tree'],
    illegalDumping: ['dump', 'illegal', 'construction', 'debris', 'rubble'],
    electricalHazard: ['electric', 'wire', 'shock', 'transformer', 'cable', 'spark'],
    drainage: ['drain', 'waterlog', 'flood', 'gutter', 'clog', 'rainwater'],
    noise: ['noise', 'loud', 'construction', 'horn', 'music', 'night']
  };

  let bestMatch = 'other', bestScore = 0;
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    let score = keywords.filter(kw => input.includes(kw)).length;
    if (score > bestScore) { bestScore = score; bestMatch = cat; }
  }
  // If we have no signal, do not guess a wrong category.
  if (bestScore === 0) bestMatch = 'other';

  return {
    category: bestMatch,
    confidence: bestScore === 0 ? 0.35 : Math.min(0.95, 0.6 + bestScore * 0.1),
  };
}

export function fallbackChatResponse(message, context = {}) {
  const msg = message.toLowerCase();
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('help') || msg.includes('namaskara')) {
    return "Namaskara! 🙏 I'm NagarVoice AI. I can help you report civic issues, track complaints, or guide you through the BBMP complaint process. What would you like help with?";
  }
  if (msg.includes('pothole') || msg.includes('road')) {
    return "I'll categorize this as a **Pothole/Road Damage** issue. Road complaints go to BBMP Roads Division.\n\nCould you share:\n1. Approximate size?\n2. Main road or side road?\n3. Has it caused accidents?";
  }
  if (msg.includes('garbage') || msg.includes('waste') || msg.includes('trash')) {
    return "This sounds like a **Garbage/Waste** issue handled by BBMP Solid Waste Management.\n\nSLA: 24 hours for collection.\n\nCan you tell me:\n1. How long has it been uncollected?\n2. Is it near a school, hospital, or water body?";
  }
  if (msg.includes('water') || msg.includes('leak') || msg.includes('pipe')) {
    return "I'll log this as a **Water Supply** issue. BWSSB handles water-related complaints.\n\nEmergency helpline: 1916\n\nDetails needed:\n1. Pipe burst or tap leak?\n2. Is water supply affected in your area?";
  }
  if (msg.includes('submit') || msg.includes('report') || msg.includes('complaint')) {
    return "To submit your complaint:\n1. Tap **Report Issue** (📸)\n2. Upload a photo\n3. AI will auto-detect the category\n4. Confirm location & submit\n\nYour complaint gets a tracking ID instantly!";
  }
  return `I understand you want to report: "${message}"\n\nLet me help format this as an official complaint. Could you tell me:\n1. **Where** exactly is this problem? (road name, landmark)\n2. **How long** has it been like this?\n3. **How** is it affecting people?`;
}
