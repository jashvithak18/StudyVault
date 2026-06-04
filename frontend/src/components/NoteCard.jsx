import React from 'react';
import { FileText, Download, Calendar, Tag } from 'lucide-react';
import { formatBytes, formatDate } from '../utils/helpers';
const NoteCard = ({ note, onDownload, onViewSummary }) => {
  return (
    <div className="note-card">
      <div className="note-card-header">
        <FileText size={24} className="note-icon" />
        <h3 className="note-title">{note.title}</h3>
      </div>
      <p className="note-description">{note.description || 'No description provided.'}</p>
      <div className="note-metadata">
        <div className="meta-item">
          <Calendar size={14} />
          <span>{formatDate(note.createdAt)}</span>
        </div>
        <div className="meta-item">
          <Tag size={14} />
          <span>{formatBytes(note.size || 0)}</span>
        </div>
      </div>
      <div className="note-actions">
        <button className="btn btn-secondary" onClick={() => onViewSummary(note)}>
          AI Summary
        </button>
        <button className="btn btn-primary" onClick={() => onDownload(note)}>
          <Download size={16} /> Download
        </button>
      </div>
    </div>
  );
};
export default NoteCard;
