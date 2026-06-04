import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import NoteCard from '../components/NoteCard';
import Loader from '../components/Loader';
import { Search, X } from 'lucide-react';
import { API_BASE_URL } from '../utils/constants';
const NotesFeed = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const fetchNotes = async () => {
    try {
      const res = await api.get('/user-api/notes');
      setNotes(res.data);
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
      const res = await api.get(`/notes/summary/${note._id}`);
      setSummaryText(res.data.summary);
    } catch (err) {
      setSummaryText('Failed to generate summary for this note.');
    } finally {
      setSummaryLoading(false);
    }
  };
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="notes-feed-page page-container">
      <div className="page-header feed-header">
        <div>
          <h1>Notes Repository</h1>
          <p className="subtitle">Browse lecture documents and study vaults shared by the community.</p>
        </div>
        <div className="search-bar-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search notes by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Loader message="Fetching notes vault..." />
      ) : filteredNotes.length === 0 ? (
        <div className="empty-state glassmorphic-panel">
          <h3>No Notes Found</h3>
          <p>Be the first to upload lecture documents and drafts to this directory.</p>
        </div>
      ) : (
        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onDownload={handleDownload}
              onViewSummary={handleViewSummary}
            />
          ))}
        </div>
      )}

      {selectedNote && (
        <div className="modal-overlay">
          <div className="modal-content glassmorphic-panel">
            <div className="modal-header">
              <h2>AI Note Summary</h2>
              <button className="modal-close" onClick={() => setSelectedNote(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <h3>{selectedNote.title}</h3>
              {summaryLoading ? (
                <div className="summary-loader">
                  <div className="loader-spinner small"></div>
                  <span>Reading document content and abstracting...</span>
                </div>
              ) : (
                <div className="summary-content">
                  <p>{summaryText}</p>
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
