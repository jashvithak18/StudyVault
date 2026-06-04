import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';
import { ArrowUp, ArrowDown, Send, HelpCircle } from 'lucide-react';
const Forum = () => {
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
      setQuestions(res.data);
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
      setQuestions((prev) => [res.data, ...prev]);
      setNewTitle('');
      setNewContent('');
      setShowAskForm(false);
    } catch (err) {
      console.error('Failed to ask question', err);
    }
  };
 const handleSelectQuestion = async (question) => {
    setSelectedQuestion(question);
    try {
      const res = await api.get(`/forum/questions/${question._id}/answers`);
      setAnswers(res.data);
    } catch (err) {
      console.error('Failed to load answers', err);
    }
  };
  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim() || !selectedQuestion) return;
    try {
      const res = await api.post(`/forum/questions/${selectedQuestion._id}/answers`, {
        content: newAnswer,
      });
      setAnswers((prev) => [...prev, res.data]);
      setNewAnswer('');
    } catch (err) {
      console.error('Failed to post answer', err);
    }
  };
  const handleVoteQuestion = async (id, type) => {
    try {
      await api.post(`/forum/questions/${id}/vote`, { type });
      fetchQuestions();
      if (selectedQuestion && selectedQuestion._id === id) {
        setSelectedQuestion({
          ...selectedQuestion,
          votesScore: type === 'upvote' ? selectedQuestion.votesScore + 1 : selectedQuestion.votesScore - 1,
        });
      }
    } catch (err) {
      console.error('Voting failed', err);
    }
  };
  return (
    <div className="forum-page page-container">
      <div className="page-header forum-header">
        <div>
          <h1>Doubt Forum</h1>
          <p className="subtitle">Ask questions, share explanations, and learn together.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAskForm(!showAskForm)}>
          {showAskForm ? 'View Doubts' : 'Ask a Doubt'}
        </button>
      </div>

      <div className="forum-grid">
        {showAskForm ? (
          <div className="glassmorphic-panel ask-question-panel">
            <h2>Ask Your Doubt</h2>
            <form onSubmit={handleAskQuestion}>
              <div className="form-group">
                <label>Question Title</label>
                <input
                  type="text"
                  placeholder="What is your question? Be specific."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Explain in Detail</label>
                <textarea
                  rows={6}
                  placeholder="Provide context, formulas, or logs to clarify your query..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Post Doubt
              </button>
            </form>
          </div>
        ) : (
          <div className="questions-list-section">
            {loading ? (
              <Loader message="Fetching doubts list..." />
            ) : questions.length === 0 ? (
              <div className="empty-state glassmorphic-panel">
                <h3>No Doubts Posted Yet</h3>
                <p>Post a doubt to prompt solutions from the vault.</p>
              </div>
            ) : (
              <div className="questions-list">
                {questions.map((q) => (
                  <div
                    key={q._id}
                    className={`question-row glassmorphic-panel ${
                      selectedQuestion?._id === q._id ? 'active' : ''
                    }`}
                    onClick={() => handleSelectQuestion(q)}
                  >
                    <div className="vote-column">
                      <button
                        className="vote-btn up"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVoteQuestion(q._id, 'upvote');
                        }}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <span className="vote-score">{q.votesScore || 0}</span>
                      <button
                        className="vote-btn down"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVoteQuestion(q._id, 'downvote');
                        }}
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>
                    <div className="question-summary">
                      <h3>{q.title}</h3>
                      <p>{q.content.substring(0, 120)}...</p>
                      <div className="meta-footer">
                        <span>Asked by {q.user?.name || 'Student'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="question-details-section">
          {selectedQuestion ? (
            <div className="glassmorphic-panel selected-question-panel">
              <div className="question-view-header">
                <h2>{selectedQuestion.title}</h2>
                <div className="question-meta">
                  Asked by <strong>{selectedQuestion.user?.name || 'Student'}</strong>
                </div>
              </div>
              <div className="question-body">
                <p>{selectedQuestion.content}</p>
              </div>

              <div className="answers-section">
                <h3>Answers ({answers.length})</h3>
                <div className="answers-list">
                  {answers.map((ans) => (
                    <div key={ans._id} className="answer-item">
                      <p>{ans.content}</p>
                      <div className="answer-meta">
                        Answered by <strong>{ans.user?.name || 'Expert'}</strong>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handlePostAnswer} className="answer-form">
                  <textarea
                    rows={3}
                    placeholder="Write your explanation or solution here..."
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-secondary">
                    <Send size={14} /> Post Answer
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="glassmorphic-panel select-prompt">
              <HelpCircle size={48} className="prompt-icon" />
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
