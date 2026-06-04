import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Send, Bot, User, Sparkles, HelpCircle } from 'lucide-react';

const AskVault = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your StudyVault AI assistant. Select a document on the left to ask contextual questions about it, or ask me anything globally.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(true);

  const suggestedQuestions = [
    'Summarize this document',
    'What are the core equations or theorems?',
    'Explain the key concepts in simple terms',
    'Generate 3 sample exam questions'
  ];

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get('/user-api/notes');
        setNotes(res.data.payload || res.data || []);
      } catch (err) {
        console.error('Failed to load notes', err);
      } finally {
        setNotesLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;
    const textToSend = input;
    setInput('');
    await submitQuery(textToSend);
  };

  const submitQuery = async (queryText) => {
    const userMessage = { sender: 'user', text: queryText };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    try {
      const res = await api.post('/user-api/ai/chat-with-note', {
        message: queryText,
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

      <div className="ask-vault-grid" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', height: 'calc(100vh - 180px)', minHeight: '500px' }}>
        {/* Left Side: Context Selector */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px', fontFamily: 'var(--font-title)' }}>Study Context</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.775rem', lineHeight: 1.4, marginBottom: '16px' }}>
            Select a document to constrain AI queries, or search the entire vault.
          </p>
          
          {notesLoading ? (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading notes list...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => setSelectedNoteId('')}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  backgroundColor: !selectedNoteId ? 'var(--accent-primary-glow)' : 'transparent',
                  border: '1px solid',
                  borderColor: !selectedNoteId ? 'var(--accent-primary)' : 'var(--border-color)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Global Vault Context</div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Query all uploaded materials</div>
              </button>

              {notes.map((note) => (
                <button
                  key={note._id}
                  onClick={() => setSelectedNoteId(note._id)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    backgroundColor: selectedNoteId === note._id ? 'var(--accent-primary-glow)' : 'transparent',
                    border: '1px solid',
                    borderColor: selectedNoteId === note._id ? 'var(--accent-primary)' : 'var(--border-color)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {note.title}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Constrain queries to this file
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Chat Panel */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Suggested Prompts Header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <HelpCircle size={13} /> Ask AI:
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {suggestedQuestions.map((qText, idx) => (
                <button
                  key={idx}
                  onClick={() => submitQuery(qText)}
                  disabled={loading}
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontWeight: 500
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.color = 'var(--accent-primary)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                >
                  {qText}
                </button>
              ))}
            </div>
          </div>

          {/* Chat thread */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {messages.map((msg, index) => {
              const isBot = msg.sender === 'bot';
              return (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  alignSelf: isBot ? 'flex-start' : 'flex-end',
                  maxWidth: '75%'
                }}>
                  {isBot && (
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-primary-glow)',
                      color: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Bot size={15} />
                    </div>
                  )}
                  
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    backgroundColor: isBot ? '#ffffff' : 'var(--bg-tertiary)',
                    border: isBot ? '1px solid var(--border-color)' : 'none',
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.text}
                  </div>

                  {!isBot && (
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: '1px solid var(--border-color)',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}>
                      {user ? `${user.firstName?.[0] || 'U'}${user.lastName?.[0] || ''}` : 'U'}
                    </div>
                  )}
                </div>
              );
            })}
            
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', alignSelf: 'flex-start' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-primary-glow)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={15} />
                </div>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div className="loader-spinner small" style={{ width: '14px', height: '14px' }}></div>
                  <span>Scanning notes and formulating response...</span>
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSendMessage} style={{
            display: 'flex',
            padding: '14px',
            backgroundColor: 'var(--bg-primary)',
            borderTop: '1px solid var(--border-color)',
            gap: '10px'
          }}>
            <input
              type="text"
              placeholder={selectedNoteId ? "Ask AI a question about this note..." : "Ask AI a general study question..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              style={{
                flex: 1,
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '10px 14px',
                fontSize: '0.875rem'
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 16px', height: '40px' }} disabled={loading}>
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AskVault;
