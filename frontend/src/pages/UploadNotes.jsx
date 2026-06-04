import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Upload, FileText, CheckCircle2, AlertCircle, BookOpen, GraduationCap, FileUp } from 'lucide-react';

const UploadNotes = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('notes');
  const [subject, setSubject] = useState('DSA');
  const [semester, setSemester] = useState('Semester 1');
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
    formData.append('topic', topic);
    formData.append('subject', subject);
    formData.append('semester', semester);
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
        <h1>Upload Study Materials</h1>
        <p className="subtitle">Add PDFs, textbooks, or notes. StudyVault AI will auto-summarize them.</p>
      </div>

      <div className="upload-split-layout">
        {/* Left Side - Upload Form */}
        <div className="upload-form-container">
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
                placeholder="e.g. Lecture 4 - Binary Trees"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Short Description</label>
              <textarea
                id="description"
                rows={2}
                placeholder="Brief summary of what these notes cover..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="topic">Resource Type</label>
                <select id="topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
                  <option value="notes">Notes</option>
                  <option value="pdfs">PDFs & Books</option>
                  <option value="past-papers">Past Papers</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <select id="subject" value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option value="DSA">DSA</option>
                  <option value="Math">Math</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Computer Networks">Computer Networks</option>
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="semester">Semester</label>
              <select id="semester" value={semester} onChange={(e) => setSemester(e.target.value)}>
                {Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`).map((sem) => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
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
                <Upload size={32} className="upload-icon" />
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

            <button type="submit" className="btn btn-primary btn-block" style={{ height: '44px' }} disabled={loading}>
              {loading ? 'Uploading & generating AI summary...' : 'Upload Study Materials'}
            </button>
          </form>
        </div>

        {/* Right Side - SVG illustration and guide info */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', fontFamily: 'var(--font-title)' }}>
            Knowledge Sharing Guidelines
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px', maxWidth: '280px' }}>
            Uploading your resources helps fellow students learn faster. Keep StudyVault clean and organized!
          </p>

          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '24px' }}>
            <circle cx="100" cy="100" r="90" fill="var(--bg-tertiary)" />
            <path d="M100 40L160 65L100 90L40 65L100 40Z" fill="var(--accent-primary)" />
            <path d="M60 74V110C60 118 78 126 100 126C122 118 140 110 140 110V74" fill="var(--accent-primary-hover)" />
            <path d="M160 65V115" stroke="var(--accent-warning)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="160" cy="115" r="4" fill="var(--accent-warning)" />
            
            <rect x="75" y="138" width="50" height="8" rx="2" fill="var(--accent-secondary)" />
            <rect x="70" y="148" width="60" height="8" rx="2" fill="var(--text-muted)" />
          </svg>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', textAlign: 'left' }}>
            {[
              {
                icon: BookOpen,
                title: 'Descriptive Titles',
                desc: 'Use clear names that mention both the topic and the lecture number.'
              },
              {
                icon: GraduationCap,
                title: 'Accurate Categorization',
                desc: 'Select the correct Subject and Semester so others can filter notes easily.'
              },
              {
                icon: FileUp,
                title: 'Instant AI Insights',
                desc: 'Once uploaded, StudyVault AI reads your file to generate standard key concepts.'
              }
            ].map((tip, i) => {
              const Icon = tip.icon;
              return (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{tip.title}</h4>
                    <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>{tip.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadNotes;
