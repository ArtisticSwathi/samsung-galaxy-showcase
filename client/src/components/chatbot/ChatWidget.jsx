import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hello! I am your Galaxy Assistant. Ask me anything about the Galaxy S26 Ultra configuration, specs, or order process!' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputValue
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await axios.post('/api/chatbot', { message: userMessage.text });
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.data.reply
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      // Mock response if backend is offline
      setTimeout(() => {
        const mockBotMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          text: `Thanks for asking about "${userMessage.text}". The Galaxy S26 Ultra features Titanium body frame, standard 256GB/512GB/1TB storage options, and an updated Snapdragon chip.`
        };
        setMessages((prev) => [...prev, mockBotMessage]);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
      {/* Trigger Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            fontSize: '1.8rem',
            cursor: 'pointer',
            boxShadow: '0 8px 30px var(--primary-glow)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'var(--transition-smooth)'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
          💬
        </button>
      )}

      {/* Chat Box */}
      {isOpen && (
        <div className="glass-panel" style={{
          width: '360px',
          height: '500px',
          background: 'rgba(12, 12, 18, 0.95)',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
          border: '1px solid var(--border-color)'
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem',
            background: 'rgba(45, 98, 255, 0.1)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
              <span style={{ fontWeight: 600 }}>Galaxy Support</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem' }}>
              ✕
            </button>
          </div>

          {/* Messages body */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  padding: '0.8rem 1rem',
                  borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.sender === 'user' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  lineHeight: '1.4'
                }}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question..."
              style={{
                flex: 1,
                padding: '0.8rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                outline: 'none'
              }}
            />
            <button 
              type="submit"
              style={{
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                padding: '0 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ChatWidget;
