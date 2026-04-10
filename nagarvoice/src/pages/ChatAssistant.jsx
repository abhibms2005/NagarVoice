import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { issueService, authService } from '../services/issueService';
import { categories, wardsList } from '../data/categories';
import { hasApiKey } from '../services/ai/claude';
import './ChatAssistant.css';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const ADMIN_NOTIF_KEY = 'nagarvoice_admin_notifications';

// ─── System prompt for guided complaint flow ───
const COMPLAINT_SYSTEM_PROMPT = `You are NagarVoice AI — a warm, intelligent civic complaint assistant for Bangalore (Bengaluru) citizens.

YOUR JOB: Guide the user step-by-step to file a civic complaint. You collect 4 pieces of information:
1. **Issue Type** — the category of civic issue (pothole, garbage, streetlight, waterLeak, sewage, encroachment, roadDamage, treeFall, illegalDumping, electricalHazard, drainage, noise, other)
2. **Location/Ward** — which area/ward in Bangalore (valid wards: ${wardsList.join(', ')})
3. **Description** — a clear description of the problem
4. **Severity** — low, medium, high, or critical

CONVERSATION RULES:
- Start by warmly greeting the user and asking what issue they want to report
- Ask for ONE piece of information at a time. Do NOT ask for everything at once.
- Be conversational and natural, not robotic. Use a mix of English and occasional Kannada greetings.
- If the user mentions a photo was attached, acknowledge it warmly (e.g., "Thanks for the photo! That helps us document the issue.")
- After collecting ALL 4 details, confirm the summary with the user
- When the user confirms, output the complaint in this EXACT format on a NEW LINE:

[COMPLAINT_READY]{"category":"<category_id>","ward":"<ward_name>","title":"<short_title>","description":"<full_description>","priority":"<severity>"}[/COMPLAINT_READY]

- The JSON must be valid. category must be one of the valid IDs listed above.
- After outputting the complaint block, add a friendly message like "I'm filing your complaint now! 🎉"
- NEVER repeat the same response. Each message must be unique and progress the conversation.
- Keep responses concise (2-4 sentences max per turn).
- If the user asks general questions about BBMP, SLA timelines, or departments, answer helpfully. BBMP SLA: potholes 48hrs, garbage 24hrs, streetlights 72hrs, water leaks 24hrs.`;

// ─── Fallback state machine for offline mode ───
const STEPS = ['greeting', 'type', 'location', 'description', 'severity', 'confirm', 'done'];

function getStepResponse(step, data = {}) {
  switch (step) {
    case 'greeting':
      return "Namaskara! 🙏 I'm NagarVoice AI. I'll help you file a civic complaint step by step.\n\nWhat type of issue would you like to report? For example: pothole, garbage, streetlight, water leak, etc.";
    case 'type':
      return `Got it — I'll categorize this as **${data.category}**. 📝\n\nNow, which area/ward in Bangalore is this issue located? (e.g., Koramangala, Indiranagar, HSR Layout)`;
    case 'location':
      return `📍 Location noted: **${data.ward}**.\n\nPlease describe the issue in detail — what does it look like, how long has it been there, and how is it affecting people?`;
    case 'description':
      return `Thanks for the details! 🙏\n\nHow severe is this issue?\n• 🟢 **Low** — minor inconvenience\n• 🟡 **Medium** — noticeable problem\n• 🟠 **High** — significant disruption\n• 🔴 **Critical** — dangerous, needs immediate attention`;
    case 'severity':
      return `Here's a summary of your complaint:\n\n📋 **Type:** ${categories.find(c => c.id === data.category)?.icon || '📋'} ${data.category}\n📍 **Location:** ${data.ward}\n📝 **Description:** ${data.description}\n⚡ **Severity:** ${data.priority}\n\nShall I file this complaint? (Yes/No)`;
    case 'done':
      return null; // Handled in component
    default:
      return "I'm here to help you file a complaint. What civic issue would you like to report?";
  }
}

function detectCategory(msg) {
  const m = msg.toLowerCase();
  const map = {
    pothole: ['pothole', 'hole', 'pit', 'crater'],
    garbage: ['garbage', 'trash', 'waste', 'dump', 'litter', 'rubbish'],
    streetlight: ['light', 'lamp', 'streetlight', 'bulb', 'dark'],
    waterLeak: ['water leak', 'pipe burst', 'water pipe', 'leaking pipe', 'tap leak', 'water supply'],
    sewage: ['sewage', 'sewer', 'manhole', 'sewage overflow'],
    encroachment: ['encroach', 'footpath', 'pavement', 'sidewalk'],
    roadDamage: ['road damage', 'road broken', 'crack', 'asphalt'],
    treeFall: ['tree', 'fallen tree', 'branch', 'uprooted'],
    illegalDumping: ['illegal dump', 'construction debris', 'rubble'],
    electricalHazard: ['electric', 'wire', 'shock', 'transformer', 'spark'],
    drainage: ['drain', 'flood', 'waterlog', 'gutter', 'clog'],
    noise: ['noise', 'loud', 'horn', 'music'],
  };
  for (const [cat, keywords] of Object.entries(map)) {
    if (keywords.some(kw => m.includes(kw))) return cat;
  }
  return 'other';
}

function detectWard(msg) {
  const m = msg.toLowerCase();
  return wardsList.find(w => m.includes(w.toLowerCase())) || null;
}

function detectSeverity(msg) {
  const m = msg.toLowerCase();
  if (m.includes('critical') || m.includes('dangerous') || m.includes('emergency')) return 'critical';
  if (m.includes('high') || m.includes('severe') || m.includes('significant')) return 'high';
  if (m.includes('low') || m.includes('minor') || m.includes('small')) return 'low';
  if (m.includes('medium') || m.includes('moderate') || m.includes('noticeable')) return 'medium';
  return null;
}

export default function ChatAssistant() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const isAI = hasApiKey();
  const user = authService.getCurrentUser();

  const [messages, setMessages] = useState([
    { role: 'assistant', content: t('chat.welcome'), time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null); // base64
  const [attachedImageFile, setAttachedImageFile] = useState(null);
  const [complaintFiled, setComplaintFiled] = useState(false);

  // Fallback state machine
  const [fbStep, setFbStep] = useState('greeting');
  const [fbData, setFbData] = useState({ category: '', ward: '', description: '', priority: '' });

  const chatEndRef = useRef();
  const imageInputRef = useRef();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // ─── Handle image attachment ───
  const handleImageAttach = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAttachedImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAttachedImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeAttachedImage = () => {
    setAttachedImage(null);
    setAttachedImageFile(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  // ─── Create complaint from AI data ───
  const fileComplaint = (data) => {
    const newIssue = {
      title: data.title || `${data.category} issue in ${data.ward}`,
      description: data.description || '',
      category: data.category || 'other',
      location: {
        lat: 12.9352 + (Math.random() - 0.5) * 0.1,
        lng: 77.6245 + (Math.random() - 0.5) * 0.1,
        address: `${data.ward}, Bangalore`
      },
      ward: data.ward || 'Koramangala',
      zone: 'South',
      priority: data.priority || 'medium',
      anonymous: false,
      reportedBy: user?.id || 'guest',
      reporterName: user?.name || 'Citizen',
      photo: attachedImage || null,
    };

    const created = issueService.create(newIssue);

    // Save admin notification
    try {
      const existing = JSON.parse(localStorage.getItem(ADMIN_NOTIF_KEY) || '[]');
      existing.push({
        issueId: created.id,
        title: newIssue.title,
        ward: newIssue.ward,
        time: new Date().toISOString(),
        source: 'ai_chat'
      });
      localStorage.setItem(ADMIN_NOTIF_KEY, JSON.stringify(existing));
    } catch (e) { console.error(e); }

    setComplaintFiled(true);
    return created;
  };

  // ─── Process AI response for complaint markers ───
  const processAIResponse = (responseText) => {
    const match = responseText.match(/\[COMPLAINT_READY\](.*?)\[\/COMPLAINT_READY\]/s);
    if (match) {
      try {
        const complaintData = JSON.parse(match[1]);
        const created = fileComplaint(complaintData);
        // Remove the JSON block from displayed message
        const cleanMessage = responseText
          .replace(/\[COMPLAINT_READY\].*?\[\/COMPLAINT_READY\]/s, '')
          .trim();
        return {
          message: cleanMessage + `\n\n✅ **Complaint Filed Successfully!**\n🆔 Tracking ID: **${created.id}**\n📍 Ward: ${complaintData.ward}\n\nYou can track your complaint from the home page.`,
          complaintCreated: true,
          issueId: created.id
        };
      } catch (e) {
        console.error('Failed to parse complaint JSON:', e);
      }
    }
    return { message: responseText, complaintCreated: false };
  };

  // ─── Send message (AI mode) ───
  const sendAI = async (userContent) => {
    const apiKey = localStorage.getItem('nagarvoice_claude_key') || '';
    const history = [...messages.filter(m => m.role !== 'system')]
      .map(m => ({ role: m.role, content: m.content }));
    history.push({ role: 'user', content: userContent });

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
        max_tokens: 600,
        system: COMPLAINT_SYSTEM_PROMPT,
        messages: history,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  };

  // ─── Send message (Fallback mode) ───
  const sendFallback = (userMsg) => {
    let nextStep = fbStep;
    let updatedData = { ...fbData };

    switch (fbStep) {
      case 'greeting': {
        const cat = detectCategory(userMsg);
        updatedData.category = cat;
        nextStep = 'type';
        break;
      }
      case 'type': {
        const ward = detectWard(userMsg);
        if (ward) {
          updatedData.ward = ward;
          nextStep = 'location';
        } else {
          // Try to use the raw text as ward
          const trimmed = userMsg.trim();
          if (trimmed.length > 2 && trimmed.length < 50) {
            updatedData.ward = trimmed;
            nextStep = 'location';
          } else {
            return "I couldn't identify the ward. Please enter a valid Bangalore locality (e.g., Koramangala, HSR Layout, Indiranagar).";
          }
        }
        break;
      }
      case 'location': {
        updatedData.description = userMsg;
        nextStep = 'description';
        break;
      }
      case 'description': {
        const sev = detectSeverity(userMsg) || 'medium';
        updatedData.priority = sev;
        nextStep = 'severity';
        break;
      }
      case 'severity': {
        const m = userMsg.toLowerCase();
        if (m.includes('yes') || m.includes('confirm') || m.includes('ok') || m.includes('file') || m.includes('submit')) {
          const created = fileComplaint(updatedData);
          nextStep = 'done';
          setFbStep(nextStep);
          setFbData(updatedData);
          return `✅ **Complaint Filed Successfully!** 🎉\n\n🆔 Tracking ID: **${created.id}**\n📋 Type: ${categories.find(c => c.id === updatedData.category)?.icon || '📋'} ${updatedData.category}\n📍 Ward: ${updatedData.ward}\n⚡ Severity: ${updatedData.priority}\n\nYou can track your complaint from the home page. Thank you for being an active citizen! 🙏`;
        } else {
          nextStep = 'greeting';
          updatedData = { category: '', ward: '', description: '', priority: '' };
          setFbStep(nextStep);
          setFbData(updatedData);
          return "No problem! Let's start over. What type of issue would you like to report?";
        }
      }
      default:
        nextStep = 'greeting';
    }

    setFbStep(nextStep);
    setFbData(updatedData);
    return getStepResponse(nextStep, updatedData);
  };

  // ─── Handle send ───
  const handleSend = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !attachedImage) || typing) return;

    let userContent = input.trim();
    const hasImage = !!attachedImage;

    // Build user message with optional image
    const userMsg = {
      role: 'user',
      content: userContent || (hasImage ? '📷 [Photo attached]' : ''),
      time: new Date(),
      image: hasImage ? attachedImage : null,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const tempImage = attachedImage;
    removeAttachedImage();
    setTyping(true);

    try {
      let response;
      if (isAI) {
        // If image was attached, mention it in the message to Claude
        let fullContent = userContent;
        if (hasImage) {
          fullContent = (userContent ? userContent + '\n\n' : '') + '[User attached a photo of the issue]';
        }
        response = await sendAI(fullContent);
        const processed = processAIResponse(response);
        response = processed.message;
      } else {
        // Fallback mode
        await new Promise(res => setTimeout(res, 500 + Math.random() * 700));
        if (hasImage) {
          // Acknowledge photo in fallback
          const photoAck = "📷 Thanks for attaching a photo! That helps us document the issue better.\n\n";
          response = photoAck + sendFallback(userContent || 'photo attached');
        } else {
          response = sendFallback(userContent);
        }
      }
      setMessages(prev => [...prev, { role: 'assistant', content: response, time: new Date() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Error: ${err.message}. Please try again.`, time: new Date() }]);
    } finally {
      setTyping(false);
    }
  };

  const quickPrompts = [
    "I want to report a pothole",
    "There's garbage piling up in my area",
    "A streetlight is broken near my house",
    "Water pipe burst on my street"
  ];

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button className="btn btn-icon btn-ghost" onClick={() => navigate(-1)}>←</button>
        <div className="chat-header-info">
          <div className="chat-bot-avatar">🤖</div>
          <div>
            <h2 className="chat-title">{t('chat.title')}</h2>
            <p className="chat-subtitle">
              {typing ? (
                <span className="chat-status-typing">
                  <span className="typing-dot-inline"></span>
                  <span className="typing-dot-inline"></span>
                  <span className="typing-dot-inline"></span>
                  Thinking...
                </span>
              ) : t('chat.subtitle')}
            </p>
          </div>
        </div>
        <span className="ai-powered-badge">{isAI ? 'Claude AI' : 'Offline'}</span>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role === 'user' ? 'user' : 'bot'}`}>
            {msg.role === 'assistant' && <span className="msg-avatar">🤖</span>}
            <div className="msg-bubble">
              {/* Image attachment in bubble */}
              {msg.image && (
                <div className="msg-image-container">
                  <img src={msg.image} alt="Attached" className="msg-image" />
                </div>
              )}
              <div className="msg-text" dangerouslySetInnerHTML={{
                __html: msg.content
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n/g, '<br/>')
              }}></div>
              <span className="msg-time">{msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}
        {typing && (
          <div className="chat-message bot">
            <span className="msg-avatar">🤖</span>
            <div className="msg-bubble typing-bubble">
              <div className="chat-loading-spinner">
                <div className="spinner-orb"></div>
                <div className="spinner-orb"></div>
                <div className="spinner-orb"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef}></div>
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && !complaintFiled && (
        <div className="quick-prompts">
          {quickPrompts.map((p, i) => (
            <button key={i} className="chip quick-chip" onClick={() => { setInput(p); }}>{p}</button>
          ))}
        </div>
      )}

      {/* Attached image preview */}
      {attachedImage && (
        <div className="chat-image-preview">
          <img src={attachedImage} alt="Attached" className="chat-image-thumb" />
          <button className="chat-image-remove" onClick={removeAttachedImage}>✕</button>
        </div>
      )}

      <form className="chat-input-bar" onSubmit={handleSend}>
        {/* Photo attach button */}
        <button
          type="button"
          className="chat-attach-btn"
          onClick={() => imageInputRef.current?.click()}
          disabled={typing}
          title="Attach photo"
        >
          📎
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageAttach}
          hidden
        />
        <input
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={complaintFiled ? "Complaint filed! Type to ask more..." : t('chat.placeholder')}
          disabled={typing}
        />
        <button type="submit" className="chat-send-btn btn btn-primary btn-icon" disabled={(!input.trim() && !attachedImage) || typing}>
          ➤
        </button>
      </form>
    </div>
  );
}
