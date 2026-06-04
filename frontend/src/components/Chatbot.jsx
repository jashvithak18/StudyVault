import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import api from '../api/axios';
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! Ask me anything about StudyVault.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const response = await api.post('/user-api/ai/chat', { message: userMessage.text });
      setMessages((prev) => [...prev, { sender: 'bot', text: response.data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Sorry, I am having trouble connecting right now.' },
      ]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={`chatbot-floating-container ${isOpen ? 'open' : ''}`}>
      {!isOpen && (
        <button className="chatbot-toggle-btn" onClick={() => setIsOpen(true)} aria-label="Open Chat">
          <MessageSquare size={24} />
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>StudyVault Assistant</h3>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-bubble ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {loading && <div className="message-bubble bot loading-bubble">AI is thinking...</div>}
          </div>
          <form className="chatbot-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
