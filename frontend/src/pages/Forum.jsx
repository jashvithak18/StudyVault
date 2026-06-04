import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';
import { Send, HelpCircle, MessageSquare, Plus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Forum = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [showAskForm, setShowAskForm] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/user-api/forum/questions');
      setQuestions(Array.isArray(res.data?.payload) ? res.data.payload : Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load forum questions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const res = await api.post('/user-api/forum/questions', { title: newTitle, content: newContent });
      const postedQuestion = res.data.payload || res.data;
      setQuestions((prev) => [postedQuestion, ...prev]);
      setNewTitle('');
      setNewContent('');
      setShowAskForm(false);
      // Select the newly created question
      handleSelectQuestion(postedQuestion);
    } catch (err) {
      console.error('Failed to ask question', err);
    }
  };

  const handleSelectQuestion = async (question) => {
    setSelectedQuestion(question);
    setAnswers([]);
    try {
      const res = await api.get(`/user-api/forum/questions/${question._id}/answers`);
      setAnswers(Array.isArray(res.data?.payload) ? res.data.payload : Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load answers', err);
    }
  };

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim() || !selectedQuestion) return;
    try {
      const res = await api.post(`/user-api/forum/questions/${selectedQuestion._id}/answers`, {
        content: newAnswer,
      });
      const postedAns = res.data.payload || res.data;
      setAnswers((prev) => [...prev, postedAns]);
      
      // Update answersCount in questions list state
      setQuestions((prev) =>
        prev.map((q) =>
          q._id === selectedQuestion._id ? { ...q, answersCount: (q.answersCount || 0) + 1 } : q
        )
      );
      setNewAnswer('');
    } catch (err) {
      console.error('Failed to post answer', err);
    }
  };

  const getInitials = (userObj) => {
    if (!userObj) return 'S';
    const first = userObj.firstName?.[0] || userObj.name?.[0] || '';
    const last = userObj.lastName?.[0] || '';
    return `${first}${last}`.toUpperCase() || 'S';
  };

  return (
    <div className="forum-page page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Doubt Forum</h1>
          <p className="subtitle">Ask questions, share explanations, and learn together.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAskForm(!showAskForm)}>
          {showAskForm ? 'View Doubts list' : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Ask a Doubt
            </span>
          )}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px', height: 'calc(100vh - 180px)', minHeight: '500px' }} className={`forum-grid ${selectedQuestion ? 'has-selection' : ''}`}>
        {/* Left Side: Question List or Ask Form */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          borderRight: '1px solid var(--border-color)',
          paddingRight: '16px'
        }} className="forum-left-pane">
          {showAskForm ? (
            <div className="upload-form-container" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', fontFamily: 'var(--font-title)' }}>Ask Your Doubt</h2>
              <form onSubmit={handleAskQuestion}>
                <div className="form-group">
                  <label>Question Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Why is time complexity of Merge Sort O(n log n)?"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Explain in Detail</label>
                  <textarea
                    rows={6}
                    placeholder="Provide details about what you don't understand, mock inputs, or equations..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block" style={{ height: '40px' }}>
                  Post Doubt
                </button>
              </form>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {loading ? (
                <Loader message="Fetching doubts list..." />
              ) : questions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <HelpCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>No doubts yet</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Click "Ask a Doubt" to post a question.</p>
                </div>
              ) : (
                questions.map((q) => {
                  const isSolved = q.answersCount > 0;
                  return (
                    <div
                      key={q._id}
                      onClick={() => handleSelectQuestion(q)}
                      style={{
                        padding: '16px',
                        backgroundColor: selectedQuestion?._id === q._id ? 'var(--bg-secondary)' : '#ffffff',
                        border: '1px solid',
                        borderColor: selectedQuestion?._id === q._id ? 'var(--accent-primary)' : 'var(--border-color)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '12px',
                        transition: 'border-color 0.15s'
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {getInitials(q.user)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {q.title}
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {q.content}
                        </p>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            By {q.user ? `${q.user.firstName || ''} ${q.user.lastName || ''}`.trim() || 'Student' : 'Student'}
                          </span>
                          
                          {isSolved && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: 'var(--accent-success)',
                              backgroundColor: 'rgba(16, 185, 129, 0.08)',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              <CheckCircle2 size={10} /> Solved
                            </span>
                          )}
                          
                          {q.answersCount > 0 && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              color: 'var(--text-muted)',
                              backgroundColor: 'var(--bg-tertiary)',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              <MessageSquare size={10} /> {q.answersCount} answers
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Right Side: Question Details & Answers */}
        <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }} className="forum-right-pane">
          {selectedQuestion ? (
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              minHeight: '100%'
            }}>
              <button 
                onClick={() => setSelectedQuestion(null)}
                className="btn btn-secondary mobile-back-btn"
                style={{ display: 'none', alignSelf: 'flex-start', marginBottom: '16px', padding: '6px 12px' }}
              >
                ← Back to Doubts
              </button>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
                  {selectedQuestion.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-tertiary)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getInitials(selectedQuestion.user)}
                  </div>
                  <span>Asked by <strong>{selectedQuestion.user ? `${selectedQuestion.user.firstName || ''} ${selectedQuestion.user.lastName || ''}`.trim() || 'Student' : 'Student'}</strong></span>
                </div>
              </div>

              <div style={{
                fontSize: '0.925rem',
                lineHeight: '1.6',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                padding: '16px',
                borderRadius: '6px',
                whiteSpace: 'pre-wrap'
              }}>
                {selectedQuestion.content}
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={16} /> Answers ({answers.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {answers.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                      No solutions posted yet. Write an answer below to help out!
                    </p>
                  ) : (
                    answers.map((ans) => (
                      <div key={ans._id} style={{
                        padding: '14px 16px',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px'
                      }}>
                        <p style={{ fontSize: '0.875rem', lineHeight: '1.5', color: 'var(--text-primary)', margin: 0 }}>
                          {ans.content}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--bg-tertiary)',
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {getInitials(ans.user)}
                          </div>
                          <span>Answered by <strong>{ans.user ? `${ans.user.firstName || ''} ${ans.user.lastName || ''}`.trim() || 'Student' : 'Student'}</strong></span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handlePostAnswer} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <textarea
                    rows={3}
                    placeholder="Write a helpful explanation or solution..."
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', height: '36px', fontSize: '0.825rem' }}>
                    <Send size={12} /> Post Answer
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="select-prompt">
              <HelpCircle size={40} className="prompt-icon" />
              <h3>Select a Doubt</h3>
              <p>Choose a question from the left panel to read explanations or post solutions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Forum;
