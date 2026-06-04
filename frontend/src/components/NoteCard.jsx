import React from 'react';
import { FileText, Download, Calendar, Tag, ChevronUp, ChevronDown, User, Sparkles } from 'lucide-react';
import { formatBytes, formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const NoteCard = ({ note, onDownload, onViewSummary, onVote }) => {
  const { user } = useAuth();
  
  // Safe array lengths
  const upvotesCount = note.upvotes?.length || 0;
  const downvotesCount = note.downvotes?.length || 0;
  const voteScore = upvotesCount - downvotesCount;

  // Check if current user has voted
  const currentUserId = user?._id || user?.id;
  const hasUpvoted = note.upvotes?.includes(currentUserId);
  const hasDownvoted = note.downvotes?.includes(currentUserId);

  return (
    <div className="note-card">
      {/* Badge Row */}
      <div className="badge-row">
        <span style={{
          fontSize: '0.725rem',
          padding: '2px 8px',
          borderRadius: '4px',
          backgroundColor: 'var(--accent-primary-glow)',
          color: 'var(--accent-primary)',
          fontWeight: 700,
          textTransform: 'uppercase'
        }}>
          {note.subject || 'General'}
        </span>
        <span style={{
          fontSize: '0.725rem',
          padding: '2px 8px',
          borderRadius: '4px',
          backgroundColor: 'var(--accent-secondary-glow)',
          color: 'var(--accent-secondary)',
          fontWeight: 700,
          textTransform: 'uppercase'
        }}>
          {note.semester || 'Semester 1'}
        </span>
        <span style={{
          fontSize: '0.725rem',
          padding: '2px 8px',
          borderRadius: '4px',
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-secondary)',
          fontWeight: 700,
          textTransform: 'uppercase'
        }}>
          {note.topic || 'Notes'}
        </span>
      </div>

      <div className="note-card-header" style={{ marginTop: '8px' }}>
        <FileText size={20} className="note-icon" style={{ color: 'var(--text-muted)' }} />
        <h3 className="note-title">{note.title}</h3>
      </div>
      
      <p className="note-description">{note.description || 'No description provided.'}</p>
      
      <div className="note-metadata">
        <div className="meta-item">
          <User size={13} />
          <span>{note.user ? `${note.user.firstName || ''} ${note.user.lastName || ''}`.trim() || 'Anonymous' : 'Anonymous'}</span>
        </div>
        <div className="meta-item">
          <Calendar size={13} />
          <span>{formatDate(note.createdAt)}</span>
        </div>
        <div className="meta-item">
          <Tag size={13} />
          <span>{formatBytes(note.size || 0)}</span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 'auto',
        paddingTop: '16px',
        borderTop: '1px solid var(--border-color)'
      }}>
        {/* Vote Widget */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '6px',
          padding: '2px 6px'
        }}>
          <button
            onClick={() => onVote(note._id, 'upvote')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: hasUpvoted ? 'var(--accent-primary)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
            title="Upvote"
          >
            <ChevronUp size={18} strokeWidth={hasUpvoted ? 3 : 2} />
          </button>
          
          <span style={{
            fontSize: '0.825rem',
            fontWeight: 700,
            minWidth: '16px',
            textAlign: 'center',
            color: hasUpvoted ? 'var(--accent-primary)' : hasDownvoted ? '#ef4444' : 'var(--text-primary)'
          }}>
            {voteScore}
          </span>

          <button
            onClick={() => onVote(note._id, 'downvote')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: hasDownvoted ? '#ef4444' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
            title="Downvote"
          >
            <ChevronDown size={18} strokeWidth={hasDownvoted ? 3 : 2} />
          </button>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => onViewSummary(note)}>
            <Sparkles size={13} style={{ color: 'var(--accent-warning)' }} /> AI Summary
          </button>
          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => onDownload(note)}>
            <Download size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
