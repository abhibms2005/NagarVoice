// ============================================
// NagarVoice — Claude AI Integration Service
// Model: claude-sonnet-4-20250514
// ============================================

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

function getApiKey() {
  return localStorage.getItem('nagarvoice_claude_key') || '';
}

export function setApiKey(key) {
  localStorage.setItem('nagarvoice_claude_key', key);
}

export function hasApiKey() {
  return !!getApiKey();
}

async function callClaude(systemPrompt, userMessage, maxTokens = 1024) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Claude API key not configured. Go to Profile → Settings to add your key.');
  }

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function callClaudeWithHistory(systemPrompt, messages, maxTokens = 1024) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Claude API key not configured.');
  }

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// ─── 1) AI Complaint Writer ───
export async function aiRewriteComplaint(rawDescription, category, location) {
  const system = `You are an expert civic complaint writer for BBMP (Bruhat Bengaluru Mahanagara Palike), Bangalore.
Your job is to take a citizen's rough description (which may be in broken English, Kannada transliteration, or informal language) and rewrite it into a formal, official civic complaint letter.

Format:
To: [Relevant BBMP Department]
Subject: [Clear, official subject line]
Respected Sir/Madam,

[2-3 paragraph formal complaint with specific details, location, urgency, and impact on citizens]

Yours faithfully,
[Citizen Name]

Keep it concise but impactful. Use the category and location provided.`;

  const userMsg = `Category: ${category}
Location: ${location}
Citizen's description: "${rawDescription}"

Rewrite this into a formal BBMP complaint letter.`;

  return callClaude(system, userMsg, 800);
}

// ─── 2) AI Auto-Categorizer ───
export async function aiCategorize(description, filename = '') {
  const system = `You are an AI that categorizes civic issues in Bangalore (BBMP jurisdiction).
Given a description and/or image filename, classify the issue.

RESPOND WITH ONLY VALID JSON — no markdown, no explanation:
{
  "category": "one of: pothole, garbage, streetlight, waterLeak, sewage, encroachment, roadDamage, treeFall, illegalDumping, electricalHazard, drainage, noise, other",
  "subcategory": "specific sub-type",
  "priority": "one of: low, medium, high, critical",
  "suggestedTitle": "short clear title under 60 chars",
  "suggestedDescription": "2-3 sentence official description"
}`;

  const userMsg = `Image filename: ${filename || 'none'}
User description: ${description || 'No description provided'}

Categorize this civic issue.`;

  const result = await callClaude(system, userMsg, 400);
  try {
    return JSON.parse(result);
  } catch {
    // Try to extract JSON from response
    const match = result.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return { category: 'other', subcategory: 'general', priority: 'medium', suggestedTitle: 'Civic Issue Report', suggestedDescription: description };
  }
}

// ─── 3) AI Chatbot (with history) ───
export async function aiChat(messages) {
  const system = `You are NagarVoice AI — a warm, intelligent civic complaint assistant for Bangalore (Bengaluru) citizens.

YOUR PRIMARY JOB: Guide the user step-by-step to file a civic complaint. Collect these 4 details ONE AT A TIME:
1. Issue Type (pothole, garbage, streetlight, waterLeak, sewage, encroachment, roadDamage, treeFall, illegalDumping, electricalHazard, drainage, noise, other)
2. Location/Ward in Bangalore
3. Description of the problem
4. Severity (low, medium, high, critical)

RULES:
- Ask for ONE piece of information at a time. Never ask for everything at once.
- Be conversational, warm, and natural. Mix English with occasional Kannada greetings.
- NEVER repeat the same response. Each reply must be unique and advance the conversation.
- Keep responses concise (2-4 sentences).
- When user attaches a photo, acknowledge it warmly.
- After collecting ALL 4 details, confirm the summary with the user.
- When confirmed, output on a new line: [COMPLAINT_READY]{"category":"<id>","ward":"<ward>","title":"<short_title>","description":"<description>","priority":"<severity>"}[/COMPLAINT_READY]

You also know:
- BBMP departments: Roads, Solid Waste, Storm Water Drains, Horticulture, Health
- Partner agencies: BWSSB (water/sewage), BESCOM (electricity), BDA, BMTC, BMRCL
- SLA: potholes 48hrs, garbage 24hrs, streetlights 72hrs, water leaks 24hrs, sewage 48hrs
- Escalation: Ward Engineer → Zonal Commissioner → Commissioner → Mayor`;

  return callClaudeWithHistory(system, messages, 600);
}

// ─── 4) AI Duplicate Detector ───
export async function aiDetectDuplicate(newIssue, nearbyIssues) {
  const system = `You are an AI that detects duplicate civic issue reports in Bangalore.
Given a new issue and a list of existing nearby issues, determine if the new issue is a duplicate.

RESPOND WITH ONLY VALID JSON:
{
  "isDuplicate": true/false,
  "matchedIssueId": "ISS___" or null,
  "confidence": 0.0 to 1.0,
  "reason": "brief explanation"
}`;

  const nearbyList = nearbyIssues.map(i => `- ${i.id}: ${i.title} (${i.category}, ${i.status}, ${i.location.address})`).join('\n');
  const userMsg = `NEW ISSUE:
Title: ${newIssue.title || 'Not provided'}
Category: ${newIssue.category}
Location: ${newIssue.location?.address || 'Unknown'}
Description: ${newIssue.description || ''}

EXISTING NEARBY ISSUES:
${nearbyList || 'None found'}

Is this new issue a duplicate of any existing one?`;

  const result = await callClaude(system, userMsg, 300);
  try {
    return JSON.parse(result);
  } catch {
    const match = result.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return { isDuplicate: false, matchedIssueId: null, confidence: 0, reason: 'Could not analyze' };
  }
}

// ─── 5) AI Ward Insight Generator ───
export async function aiWardInsight(wardName, stats) {
  const system = `You are a civic data analyst for Bangalore. Generate a brief, insightful analysis (exactly 3 lines) about a ward's civic issue resolution performance. Be specific and actionable. Reference actual numbers.`;

  const userMsg = `Ward: ${wardName}
Total Issues: ${stats.total}
Resolved: ${stats.resolved}
Resolution Rate: ${stats.score}%
Average Resolution Time: ${stats.avgDays} days
Top Issue Types: ${stats.topCategories || 'Mixed'}

Generate a 3-line AI insight about this ward's performance.`;

  return callClaude(system, userMsg, 200);
}

// ─── Fallback functions (when no API key) ───
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
