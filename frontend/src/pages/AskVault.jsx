import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Send, Bot, User } from 'lucide-react';
const AskVault = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your StudyVault AI assistant. Select a document below to ask contextual questions about it.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(true);
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get('/user-api/notes');
        setNotes(res.data);
      } catch (err) {
        console.error('Failed to load notes', err);
      } finally {
        setNotesLoading(false);
      }
    };
    fetchNotes();
  }, []);
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/user-api/ai/chat-with-note', {
        message: userMessage.text,
        noteId: selectedNoteId || null
      });
      setMessages((prev) => [...prev, { sender: 'bot', text: res.data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'I encountered an error querying the vault index. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="ask-vault-page page-container">
      <div className="page-header">
        <h1>AskVault AI Assistant</h1>
        <p className="subtitle">Ask questions about your uploaded documents or explore topics using semantic context lookup.</p>
      </div>

      <div className="ask-vault-grid">
        <div className="glassmorphic-panel context-selector-panel">
          <h2>Select Study Context</h2>
          <p className="context-desc">Select a specific uploaded note to constrain the AI answers to that document, or chat globally.</p>
          
          {notesLoading ? (
            <div className="mini-loader">Loading notes...</div>
          ) : (
            <div className="notes-radio-group">
              <label className={`radio-label ${!selectedNoteId ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="context-note"
                  value=""
                  checked={!selectedNoteId}
                  onChange={() => setSelectedNoteId('')}
                />
                <div className="radio-content">
                  <span className="radio-title">Global Vault Context</span>
                  <span className="radio-subtitle">Ask questions across all study subjects</span>
                </div>
              </label>

              {notes.map((note) => (
                <label key={note._id} className={`radio-label ${selectedNoteId === note._id ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="context-note"
                    value={note._id}
                    checked={selectedNoteId === note._id}
                    onChange={() => setSelectedNoteId(note._id)}
                  />
                  <div className="radio-content">
                    <span className="radio-title">{note.title}</span>
                    <span className="radio-subtitle">Constrain AI queries to this file</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="glassmorphic-panel ask-chat-panel">
          <div className="chat-thread">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-row ${msg.sender}`}>
                <div className="chat-avatar">
                  {msg.sender === 'bot' ? <Bot size={18} /> : <User size={18} />}
                </div>
                <div className="chat-content-bubble">
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-row bot loading">
                <div className="chat-avatar"><Bot size={18} /></div>
                <div className="chat-content-bubble">Scanning note indexes and abstracting an answer...</div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-bar">
            <input
              type="text"
              placeholder={selectedNoteId ? "Ask a question about this note..." : "Ask a general study question..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AskVault;
