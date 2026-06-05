import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Send, Bot, Sparkles, HelpCircle, Trash2 } from 'lucide-react';

const AskVault = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I\'m **StudyVault AI**, powered by Groq Llama 3. 🎓\n\nI can help you with:\n- Answering academic questions across any subject\n- Summarizing and explaining your uploaded notes\n- Generating practice questions\n- Debugging code\n\nSelect a document from the left to ask questions about it, or just type anything to get started!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    'Summarize this document',
    'What are the key concepts?',
    'Generate 5 practice questions',
    'Explain in simple terms',
  ];

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get('/user-api/notes');
        setNotes(Array.isArray(res.data?.payload) ? res.data.payload : Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load notes', err);
      } finally {
        setNotesLoading(false);
      }
    };
    fetchNotes();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;
    const textToSend = input.trim();
    setInput('');
    await submitQuery(textToSend);
  };

  const submitQuery = async (queryText) => {
    const userMessage = { sender: 'user', text: queryText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);
    try {
      const res = await api.post('/user-api/ai/chat-with-note', {
        message: queryText,
        noteId: selectedNoteId || null,
        history: messages // send full conversation history
      });
      const reply = res.data.reply || res.data.payload?.reply || 'No response received.';
      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: '⚠️ I encountered an error. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      { sender: 'bot', text: 'Chat cleared! I\'m ready for your next question. 🎓' }
    ]);
  };

  // Simple markdown renderer for bold, code blocks, and bullet lists
  const renderMarkdown = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Code block
      if (line.startsWith('```')) {
        const lang = line.slice(3).trim();
        const codeLines = [];
        i++;
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        elements.push(
          <pre key={i} style={{
            backgroundColor: '#1e293b',
            color: '#e2e8f0',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            overflowX: 'auto',
            margin: '8px 0',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}>
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
      }
      // Bullet points
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        const items = [];
        while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
          items.push(lines[i].slice(2));
          i++;
        }
        elements.push(
          <ul key={i} style={{ paddingLeft: '20px', margin: '6px 0' }}>
            {items.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '3px' }} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            ))}
          </ul>
        );
        continue;
      }
      // Numbered list
      else if (/^\d+\.\s/.test(line)) {
        const items = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
          items.push(lines[i].replace(/^\d+\.\s/, ''));
          i++;
        }
        elements.push(
          <ol key={i} style={{ paddingLeft: '20px', margin: '6px 0' }}>
            {items.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '3px' }} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            ))}
          </ol>
        );
        continue;
      }
      // Headings
      else if (line.startsWith('### ')) {
        elements.push(<h4 key={i} style={{ fontWeight: 700, margin: '10px 0 4px', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{line.slice(4)}</h4>);
      }
      else if (line.startsWith('## ')) {
        elements.push(<h3 key={i} style={{ fontWeight: 700, margin: '12px 0 4px', color: 'var(--text-primary)', fontSize: '1rem' }}>{line.slice(3)}</h3>);
      }
      else if (line.startsWith('# ')) {
        elements.push(<h2 key={i} style={{ fontWeight: 700, margin: '12px 0 6px', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{line.slice(2)}</h2>);
      }
      // Empty line
      else if (line.trim() === '') {
        elements.push(<div key={i} style={{ height: '6px' }} />);
      }
      // Normal paragraph
      else {
        elements.push(
          <p key={i} style={{ margin: '3px 0', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        );
      }
      i++;
    }

    return elements;
  };

  // Format inline markdown: **bold**, *italic*, `code`
  const formatInline = (text) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code style="background:#f1f5f9;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:0.85em">$1</code>');
  };

  const userInitials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U'
    : 'U';

  const selectedNote = notes.find(n => n._id === selectedNoteId);

  return (
    <div className="ask-vault-page page-container">
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <h1>AskVault AI Assistant</h1>
        <p className="subtitle">Powered by Groq Llama 3 · Ask anything academic, or chat about your uploaded documents.</p>
      </div>

      <div className="ask-vault-grid">
        {/* Left Side: Context Selector */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflowY: 'auto'
        }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Study Context</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.73rem', lineHeight: 1.4, marginBottom: '8px' }}>
            Select a note to focus the AI on it. Leave unselected for general questions.
          </p>

          {notesLoading ? (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '8px 0' }}>Loading notes...</div>
          ) : notes.length === 0 ? (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '8px 0' }}>No notes uploaded yet.</div>
          ) : (
            notes.map((note) => (
              <button
                key={note._id}
                onClick={() => setSelectedNoteId(selectedNoteId === note._id ? '' : note._id)}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  backgroundColor: selectedNoteId === note._id ? 'var(--accent-primary-glow)' : 'transparent',
                  border: '1px solid',
                  borderColor: selectedNoteId === note._id ? 'var(--accent-primary)' : 'var(--border-color)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: selectedNoteId === note._id ? 'var(--accent-primary)' : 'var(--text-primary)',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}>
                  📄 {note.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {note.subject || 'General'} {selectedNoteId === note._id ? '· active' : ''}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Right Side: Chat Panel */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Top bar */}
          <div style={{
            padding: '10px 16px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', flex: 1 }}>
              <span style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <HelpCircle size={13} /> Quick Ask:
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
                {suggestedQuestions.map((qText, idx) => (
                  <button
                    key={idx}
                    onClick={() => submitQuery(qText)}
                    disabled={loading}
                    style={{
                      fontSize: '0.72rem',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                      fontWeight: 500
                    }}
                    onMouseOver={(e) => { if (!loading) { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)'; } }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    {qText}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={clearChat}
              title="Clear chat"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '4px', flexShrink: 0 }}
              onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <Trash2 size={15} />
            </button>
          </div>

          {/* Selected note banner */}
          {selectedNote && (
            <div style={{
              padding: '6px 16px',
              backgroundColor: 'var(--accent-primary-glow)',
              borderBottom: '1px solid var(--border-color)',
              fontSize: '0.75rem',
              color: 'var(--accent-primary)',
              fontWeight: 600
            }}>
              📄 Context: {selectedNote.title} ({selectedNote.subject || 'General'})
            </div>
          )}

          {/* Chat thread */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {messages.map((msg, index) => {
              const isBot = msg.sender === 'bot';
              return (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  alignSelf: isBot ? 'flex-start' : 'flex-end',
                  maxWidth: '80%',
                  flexDirection: isBot ? 'row' : 'row-reverse',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: isBot ? 'var(--accent-primary-glow)' : 'var(--accent-secondary)',
                    color: isBot ? 'var(--accent-primary)' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    border: isBot ? '1px solid var(--accent-primary)' : 'none',
                  }}>
                    {isBot ? <Bot size={15} /> : userInitials}
                  </div>

                  {/* Bubble */}
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: isBot ? '2px 8px 8px 8px' : '8px 2px 8px 8px',
                    fontSize: '0.875rem',
                    lineHeight: '1.6',
                    backgroundColor: isBot ? '#ffffff' : 'var(--accent-primary)',
                    border: isBot ? '1px solid var(--border-color)' : 'none',
                    color: isBot ? 'var(--text-primary)' : '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}>
                    {isBot ? renderMarkdown(msg.text) : msg.text}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', alignSelf: 'flex-start' }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  backgroundColor: 'var(--accent-primary-glow)', color: 'var(--accent-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  border: '1px solid var(--accent-primary)',
                }}>
                  <Bot size={15} />
                </div>
                <div style={{
                  padding: '12px 16px', borderRadius: '2px 8px 8px 8px',
                  backgroundColor: '#ffffff', border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '0.875rem',
                }}>
                  <div className="loader-spinner small" style={{ width: '14px', height: '14px' }} />
                  <span>Gemini is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form onSubmit={handleSendMessage} style={{
            display: 'flex',
            padding: '12px 14px',
            backgroundColor: 'var(--bg-primary)',
            borderTop: '1px solid var(--border-color)',
            gap: '10px',
            alignItems: 'flex-end',
          }}>
            <textarea
              placeholder={selectedNoteId ? 'Ask AI about this document...' : 'Ask me anything academic...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(null);
                }
              }}
              disabled={loading}
              rows={1}
              style={{
                flex: 1,
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '10px 14px',
                fontSize: '0.875rem',
                resize: 'none',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.5,
                outline: 'none',
                minHeight: '42px',
                maxHeight: '120px',
                overflowY: 'auto',
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0 16px', height: '42px', flexShrink: 0 }}
              disabled={loading || !input.trim()}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AskVault;
