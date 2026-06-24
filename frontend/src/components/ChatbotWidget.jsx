import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User, Sparkles, AlertCircle, Trash2 } from 'lucide-react';
import { api } from '../services/api';

/**
 * ChatbotWidget renders a floating chatbot interface in the bottom-right corner.
 * It manages real-time messaging, typing states, and fallback prompts for unauthenticated sessions.
 *
 * @param {Object} props
 * @param {Object|null} props.user Current logged-in user profile.
 * @param {Object|null} props.socket Socket.IO client instance (unused since chatbot uses HTTP, but kept for signature compatibility).
 * @param {Function} props.onAuthClick Callback triggered if a user needs to log in to chat.
 */
export default function ChatbotWidget({ user, socket, onAuthClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState(() => {
    // Attempt to retrieve previous conversation from localStorage
    const saved = localStorage.getItem('chatbot_history');
    return saved ? JSON.parse(saved) : [
      {
        senderId: 'ai-chatbot',
        message: '👋 Welcome! I am your store AI Assistant. Ask me about products, tracking your orders, or store support details!',
        createdAt: new Date().toISOString()
      }
    ];
  });
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  // Sync conversation history with localStorage
  useEffect(() => {
    localStorage.setItem('chatbot_history', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to the bottom of the conversation on message update or typing state change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /**
   * Sends the user's message to the backend HTTP AI service.
   * 
   * @param {string} textToSend Text content of the message.
   */
  const handleSendMessage = async (textToSend) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    // 1. Add user's message locally
    const newUserMessage = {
      senderId: user ? (user.id || user._id) : 'guest',
      message: trimmed,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setMessageText('');
    setIsTyping(true);

    try {
      // 2. Call the backend HTTP AI service
      const response = await api.ai.chat(trimmed);
      
      // 3. Add bot's response locally
      const botResponse = {
        senderId: 'ai-chatbot',
        message: response.reply || 'Sorry, I did not understand that.',
        isAi: true,
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorResponse = {
        senderId: 'ai-chatbot',
        message: 'Sorry, I am having trouble connecting to my brain right now.',
        isAi: false,
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  /**
   * Resets the conversation history to the initial state.
   */
  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear chat history?")) {
      const initialMessage = [
        {
          senderId: 'ai-chatbot',
          message: '🧹 Chat cleared! How can I assist you with your shopping experience today?',
          createdAt: new Date().toISOString()
        }
      ];
      setMessages(initialMessage);
      localStorage.setItem('chatbot_history', JSON.stringify(initialMessage));
    }
  };

  // Pre-configured suggestions to speed up client search
  const suggestions = [
    { label: '📦 Track My Orders', query: 'track orders' },
    { label: '🔍 Search Products', query: 'search products' },
    { label: '💬 General Help', query: 'help' }
  ];

  return (
    <div className="chatbot-widget-container">
      {/* Floating launcher button */}
      <button 
        className={`chatbot-launcher-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Chatbot Support"
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
        {!isOpen && <span className="online-dot-pulse"></span>}
      </button>

      {/* Chat Drawer/Overlay Window */}
      {isOpen && (
        <div className="chatbot-window glass-panel">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar-circle">
                <Bot size={18} className="chatbot-avatar-icon" />
              </div>
              <div>
                <h4>Store Assistant</h4>
                <div className="connection-status">
                  <span className="status-label connected">
                    <span className="status-dot green"></span> AI Support Live
                  </span>
                </div>
              </div>
            </div>
            
            <div className="chatbot-header-actions">
              {messages.length > 1 && (
                <button className="btn-header-action" onClick={handleClearChat} title="Clear Chat History">
                  <Trash2 size={16} />
                </button>
              )}
              <button className="btn-header-action" onClick={() => setIsOpen(false)}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Conversation Area */}
          <div className="chatbot-body">
            {/* Chat conversation timeline */}
            <div className="chatbot-messages-list">
              {messages.map((msg, idx) => {
                const isBot = msg.senderId === 'ai-chatbot';
                return (
                  <div key={idx} className={`chat-message-bubble-wrapper ${isBot ? 'incoming' : 'outgoing'}`}>
                    <div className="message-avatar">
                      {isBot ? <Bot size={14} /> : <User size={14} />}
                    </div>
                    
                    <div className="message-bubble-content">
                      <div className="message-bubble">
                        <p className="message-text">
                          {msg.message}
                        </p>
                        {isBot && msg.isAi && (
                          <span className="ai-badge">
                            <Sparkles size={8} /> AI
                          </span>
                        )}
                      </div>
                      <span className="message-time">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator bubble */}
              {isTyping && (
                <div className="chat-message-bubble-wrapper incoming typing">
                  <div className="message-avatar">
                    <Bot size={14} />
                  </div>
                  <div className="message-bubble-content">
                    <div className="message-bubble typing-bubble">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area / Suggestions */}
          <div className="chatbot-footer">
            {/* Suggestion Chips */}
            {messages.length < 5 && (
              <div className="suggestion-chips-container">
                {suggestions.map((chip, idx) => (
                  <button 
                    key={idx}
                    className="suggestion-chip"
                    onClick={() => handleSendMessage(chip.query)}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* Chat Input Form */}
            <form 
              className="chatbot-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(messageText);
              }}
            >
              <input 
                type="text"
                placeholder="Type a store question..."
                className="chatbot-input-field"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <button 
                type="submit" 
                className="chatbot-send-btn"
                disabled={!messageText.trim()}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .chatbot-widget-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 999;
          font-family: var(--font-sans);
        }

        /* Launcher Floating Button */
        .chatbot-launcher-btn {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%);
          color: #fff;
          box-shadow: 0 4px 20px var(--primary-glow);
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          position: relative;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .chatbot-launcher-btn:hover {
          transform: scale(1.08) translateY(-2px);
          box-shadow: 0 8px 24px var(--primary-glow);
        }

        .chatbot-launcher-btn:active {
          transform: scale(0.95);
        }

        .chatbot-launcher-btn.active {
          background: #1e1f29;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          border: 1px solid var(--border-color);
        }

        .launcher-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--action-orange);
          color: #000;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }

        .online-dot-pulse {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          background: #10b981;
          border: 2px solid #08090e;
          border-radius: 50%;
        }

        /* Chat window */
        .chatbot-window {
          position: absolute;
          bottom: 72px;
          right: 0;
          width: 360px;
          height: 480px;
          display: flex;
          flex-direction: column;
          background: rgba(10, 11, 16, 0.95);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          box-shadow: var(--shadow-lg), 0 0 30px rgba(139, 92, 246, 0.1);
          overflow: hidden;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: bottom right;
        }

        @keyframes slideUp {
          from {
            transform: scale(0.9) translateY(20px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        /* Header styling */
        .chatbot-header {
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .chatbot-header-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .chatbot-avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--primary-glow);
          border: 1px solid var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chatbot-avatar-icon {
          color: var(--primary);
        }

        .chatbot-header-info h4 {
          font-size: 0.9rem;
          font-weight: 700;
          margin: 0;
          color: #fff;
        }

        .connection-status {
          font-size: 0.7rem;
          margin-top: 1px;
        }

        .status-label {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-weight: 500;
        }
        
        .status-label.connected {
          color: #10b981;
        }
        
        .status-label.disconnected {
          color: var(--text-muted);
        }

        .status-label.guest {
          color: var(--action-orange);
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        }

        .status-dot.green {
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
        }

        .status-dot.red {
          background: var(--danger);
          box-shadow: 0 0 6px var(--danger);
        }

        .chatbot-header-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .btn-header-action {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-header-action:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
        }

        /* Body Timeline */
        .chatbot-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.15) 100%);
        }

        .chatbot-messages-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .chat-message-bubble-wrapper {
          display: flex;
          gap: 8px;
          max-width: 85%;
        }

        .chat-message-bubble-wrapper.incoming {
          align-self: flex-start;
        }

        .chat-message-bubble-wrapper.outgoing {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .incoming .message-avatar {
          border-color: rgba(139, 92, 246, 0.2);
          color: var(--primary);
        }

        .message-bubble-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .incoming .message-bubble-content {
          align-items: flex-start;
        }

        .outgoing .message-bubble-content {
          align-items: flex-end;
        }

        .message-bubble {
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 0.85rem;
          line-height: 1.4;
          white-space: pre-line;
          position: relative;
        }

        .incoming .message-bubble {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          border-top-left-radius: 2px;
        }

        .outgoing .message-bubble {
          background: var(--primary);
          color: #fff;
          border-top-right-radius: 2px;
          box-shadow: 0 2px 8px var(--primary-glow);
        }

        .message-text {
          margin: 0;
          word-break: break-word;
        }

        .ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 0.6rem;
          font-weight: 700;
          color: var(--primary);
          background: var(--primary-glow);
          border: 1px solid rgba(139, 92, 246, 0.3);
          padding: 1px 5px;
          border-radius: 4px;
          position: absolute;
          bottom: -10px;
          left: 8px;
          z-index: 2;
        }

        .message-time {
          font-size: 0.65rem;
          color: var(--text-muted);
          margin-top: 4px;
          padding: 0 4px;
        }

        /* Unauthenticated Auth Fallback */
        .chatbot-auth-fallback {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 24px;
        }

        .fallback-icon {
          color: var(--action-orange);
          margin-bottom: 16px;
          filter: drop-shadow(0 0 8px var(--action-orange-glow));
        }

        .chatbot-auth-fallback h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }

        .chatbot-auth-fallback p {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 24px;
          line-height: 1.5;
        }

        /* Footer styling */
        .chatbot-footer {
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.01);
          border-top: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* Suggestion chips */
        .suggestion-chips-container {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .suggestion-chips-container::-webkit-scrollbar {
          height: 2px;
        }

        .suggestion-chip {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          padding: 6px 12px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
        }

        .suggestion-chip:hover {
          background: var(--primary-glow);
          color: var(--primary);
          border-color: var(--primary);
        }

        /* Input form controls */
        .chatbot-input-form {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xs);
          padding: 4px 6px;
          transition: all 0.2s;
        }

        .chatbot-input-form:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px var(--primary-glow);
        }

        .chatbot-input-field {
          flex: 1;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 0.85rem;
          font-family: var(--font-sans);
          height: 32px;
          outline: none;
          padding: 0 6px;
        }

        .chatbot-input-field:disabled {
          color: var(--text-muted);
          cursor: not-allowed;
        }

        .chatbot-send-btn {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-xs);
          background: var(--primary);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          padding: 0;
        }

        .chatbot-send-btn:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        .chatbot-send-btn:disabled {
          background: rgba(255,255,255,0.05);
          color: var(--text-muted);
          cursor: not-allowed;
        }

        /* Typing indicator animation */
        .typing-bubble {
          display: flex;
          align-items: center;
          gap: 4px;
          height: 30px;
          padding: 0 14px !important;
        }

        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--text-muted);
          animation: typingPulse 1.4s infinite ease-in-out;
        }

        .typing-dot:nth-child(1) {
          animation-delay: -0.32s;
        }

        .typing-dot:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes typingPulse {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
            background: var(--primary);
          }
        }

        @media (max-width: 480px) {
          .chatbot-window {
            width: calc(100vw - 32px);
            right: 0;
            bottom: 72px;
          }
        }
      `}</style>
    </div>
  );
}
