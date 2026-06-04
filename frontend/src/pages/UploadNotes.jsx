import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
const UploadNotes = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!title) {
        const nameWithoutExt = e.target.files[0].name.replace(/\.[^/.]+$/, "");
        setTitle(nameWithoutExt);
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      setStatus({ type: 'error', message: 'Title and file are required.' });
      return;
    }

setLoading(true);
    setStatus({ type: '', message: '' });
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('note', file);
    try {
      await api.post('/user-api/notes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus({ type: 'success', message: 'Note uploaded successfully! Redirecting to feed...' });
      setTimeout(() => {
        navigate('/notes');
      }, 1500);
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to upload note.',
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="upload-page page-container">
      <div className="page-header">
        <h1>Upload Study Notes</h1>
        <p className="subtitle">Add PDFs, textbooks, or notes. StudyVault AI will auto-summarize them.</p>
      </div>

      <div className="glassmorphic-panel upload-form-container">
        {status.message && (
          <div className={`alert-box ${status.type}`}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="title">Note Title</label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Chemistry Lecture 4 - Thermodynamics"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Short Description</label>
            <textarea
              id="description"
              rows={3}
              placeholder="Brief summary of what these notes cover..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="file-upload-zone">
            <input
              type="file"
              id="file-input"
              className="hidden-file-input"
              onChange={handleFileChange}
              accept=".pdf,.txt"
              required
            />
            <label htmlFor="file-input" className="file-upload-label">
              <Upload size={36} className="upload-icon" />
              {file ? (
                <div className="selected-file-info">
                  <FileText size={18} />
                  <span>{file.name}</span>
                </div>
              ) : (
                <div className="upload-instructions">
                  <span className="upload-main-text">Click to choose a file</span>
                  <span className="upload-sub-text">Supports PDF and TXT documents</span>
                </div>
              )}
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Uploading file & generating AI summary...' : 'Upload Notes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadNotes;
