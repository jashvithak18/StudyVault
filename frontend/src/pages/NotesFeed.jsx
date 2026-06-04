import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import NoteCard from '../components/NoteCard';
import Loader from '../components/Loader';
import { Search, X, Sparkles, Filter } from 'lucide-react';
import { API_BASE_URL } from '../utils/constants';

const NotesFeed = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterSemester, setFilterSemester] = useState('All');
  const [filterTopic, setFilterTopic] = useState('All');
  const [selectedNote, setSelectedNote] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryText, setSummaryText] = useState('');

  const fetchNotes = async () => {
    try {
      const res = await api.get('/user-api/notes');
      setNotes(Array.isArray(res.data?.payload) ? res.data.payload : Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load notes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDownload = (note) => {
    const url = `${API_BASE_URL}/user-api/notes/download/${note._id}`;
    window.open(url, '_blank');
  };

  const handleViewSummary = async (note) => {
    setSelectedNote(note);
    setSummaryLoading(true);
    setSummaryText('');
    try {
      const res = await api.get(`/user-api/notes/summary/${note._id}`);
      setSummaryText(res.data.payload || res.data.summary || 'No summary available.');
    } catch (err) {
      setSummaryText('Failed to generate summary for this note.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleVote = async (noteId, type) => {
    try {
      const res = await api.post(`/user-api/notes/${noteId}/vote`, { type });
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === noteId ? { ...note, upvotes: res.data.payload.upvotes, downvotes: res.data.payload.downvotes } : note
        )
      );
    } catch (err) {
      console.error('Failed to register vote', err);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'All' || note.subject === filterSubject;
    const matchesSemester = filterSemester === 'All' || note.semester === filterSemester;
    const matchesTopic = filterTopic === 'All' || note.topic === filterTopic;
    return matchesSearch && matchesSubject && matchesSemester && matchesTopic;
  });

  return (
    <div className="notes-feed-page page-container">
      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h1>Notes Repository</h1>
          <p className="subtitle">Browse lecture documents and study vaults shared by the community.</p>
        </div>
        
        {/* Search and Filters Panel */}
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          width: '100%',
          padding: '12px 16px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px'
        }}>
          <div className="search-bar-container" style={{ flex: 1, minWidth: '220px' }}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.8rem', marginRight: '4px' }}>
              <Filter size={14} />
              <span>Filters:</span>
            </div>
            
            <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} style={{ width: 'auto', minWidth: '130px', padding: '8px 12px' }}>
              <option value="All">All Subjects</option>
              <option value="DSA">DSA</option>
              <option value="Math">Math</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Computer Networks">Computer Networks</option>
              <option value="Operating Systems">Operating Systems</option>
              <option value="General">General</option>
            </select>

            <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)} style={{ width: 'auto', minWidth: '130px', padding: '8px 12px' }}>
              <option value="All">All Semesters</option>
              {Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`).map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>

            <select value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)} style={{ width: 'auto', minWidth: '130px', padding: '8px 12px' }}>
              <option value="All">All Types</option>
              <option value="notes">Notes</option>
              <option value="pdfs">PDFs & Books</option>
              <option value="past-papers">Past Papers</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader message="Fetching notes vault..." />
      ) : filteredNotes.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px'
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>No Notes Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
            No study materials match your search filters. Try updating your selection.
          </p>
        </div>
      ) : (
        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onDownload={handleDownload}
              onViewSummary={handleViewSummary}
              onVote={handleVote}
            />
          ))}
        </div>
      )}

      {selectedNote && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '24px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '540px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)'
            }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-title)' }}>
                <Sparkles size={18} style={{ color: 'var(--accent-warning)' }} /> AI Study Assistant
              </h2>
              <button
                onClick={() => setSelectedNote(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <span style={{
                fontSize: '0.725rem',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'var(--accent-primary-glow)',
                color: 'var(--accent-primary)',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                {selectedNote.subject || 'General'}
              </span>
              
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px', marginBottom: '16px' }}>
                {selectedNote.title}
              </h3>
              
              {summaryLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '32px 0' }}>
                  <div className="loader-spinner small"></div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Reading document content and abstracting...</span>
                </div>
              ) : (
                <div style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '16px',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  color: 'var(--text-secondary)',
                  maxHeight: '240px',
                  overflowY: 'auto'
                }}>
                  {summaryText}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesFeed;
