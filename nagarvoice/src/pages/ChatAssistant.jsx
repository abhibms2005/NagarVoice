import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { aiChat, hasApiKey, fallbackChatResponse } from '../services/ai/claude';
import './ChatAssistant.css';

export default function ChatAssistant() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: t('chat.welcome'), time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef();
  const isAI = hasApiKey();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || typing) return;
    const userMsg = { role: 'user', content: input, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    try {
      let response;
      if (isAI) {
        // Build Claude message history
        const history = [...messages, userMsg]
          .filter(m => m.role === 'user' || m.role === 'assistant')
          .map(m => ({ role: m.role, content: m.content }));
        response = await aiChat(history);
      } else {
        await new Promise(res => setTimeout(res, 600 + Math.random() * 800));
        response = fallbackChatResponse(input);
      }
      setMessages(prev => [...prev, { role: 'assistant', content: response, time: new Date() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Error: ${err.message}`, time: new Date() }]);
    } finally {
      setTyping(false);
    }
  };

  const quickPrompts = [
    "How do I report a pothole?",
    "What is the SLA for garbage collection?",
    "How to escalate a complaint?",
    "Which BBMP department handles water leaks?"
  ];

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button className="btn btn-icon btn-ghost" onClick={() => navigate(-1)}>←</button>
        <div className="chat-header-info">
          <div className="chat-bot-avatar">🤖</div>
          <div>
            <h2 className="chat-title">{t('chat.title')}</h2>
            <p className="chat-subtitle">{typing ? 'Thinking...' : t('chat.subtitle')}</p>
          </div>
        </div>
        <span className="ai-powered-badge">{isAI ? 'Claude AI' : 'Offline'}</span>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role === 'user' ? 'user' : 'bot'}`}>
            {msg.role === 'assistant' && <span className="msg-avatar">🤖</span>}
            <div className="msg-bubble">
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
              <div className="ai-typing"><span></span><span></span><span></span></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef}></div>
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="quick-prompts">
          {quickPrompts.map((p, i) => (
            <button key={i} className="chip" onClick={() => { setInput(p); }}>{p}</button>
          ))}
        </div>
      )}

      <form className="chat-input-bar" onSubmit={handleSend}>
        <input className="chat-input" value={input} onChange={e => setInput(e.target.value)} placeholder={t('chat.placeholder')} disabled={typing} />
        <button type="submit" className="chat-send-btn btn btn-primary btn-icon" disabled={!input.trim() || typing}>
          ➤
        </button>
      </form>
    </div>
  );
}
