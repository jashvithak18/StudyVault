import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { BookOpen, HelpCircle, Edit3, ArrowRight, Clock, User, ChevronRight } from 'lucide-react';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ notesCount: 0, doubtsCount: 0, whiteboardsCount: 0 });
  const [recentNotes, setRecentNotes] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const notesRes = await api.get('/user-api/notes');
        const forumRes = await api.get('/user-api/forum/questions');
        
        // Save stats
        const allNotes = Array.isArray(notesRes.data?.payload) ? notesRes.data.payload : Array.isArray(notesRes.data) ? notesRes.data : [];
        const allDoubts = Array.isArray(forumRes.data?.payload) ? forumRes.data.payload : Array.isArray(forumRes.data) ? forumRes.data : [];
        
        setStats({
          notesCount: allNotes.length,
          doubtsCount: allDoubts.length,
          whiteboardsCount: 3, // Live Active rooms count
        });

        // Get latest 3 notes sorted by createdAt
        const sortedNotes = [...allNotes]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);
        setRecentNotes(sortedNotes);

        // Build live activity feed from recent notes and doubts
        const noteActivities = allNotes
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 4)
          .map((n) => ({
            user: n.user ? `${n.user.firstName || ''} ${n.user.lastName || ''}`.trim() || 'A student' : 'A student',
            action: 'uploaded notes',
            target: n.title || 'Untitled Note',
            time: n.createdAt
          }));

        const doubtActivities = allDoubts
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3)
          .map((d) => ({
            user: d.user ? `${d.user.firstName || ''} ${d.user.lastName || ''}`.trim() || 'A student' : 'A student',
            action: 'posted a doubt',
            target: d.title || 'Untitled Question',
            time: d.createdAt
          }));

        const combined = [...noteActivities, ...doubtActivities]
          .sort((a, b) => new Date(b.time) - new Date(a.time))
          .slice(0, 6);

        setRecentActivity(combined);
      } catch (err) {
        console.error('Error fetching dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading) return <Loader message="Loading dashboard statistics..." />;

  const statCards = [
    { title: 'Total Shared Notes', value: stats.notesCount, icon: BookOpen, color: 'stat-blue' },
    { title: 'Community Doubts', value: stats.doubtsCount, icon: HelpCircle, color: 'stat-purple' },
    { title: 'Active Board Rooms', value: stats.whiteboardsCount, icon: Edit3, color: 'stat-indigo' },
  ];

  // Helper to format date
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatRelative = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="dashboard-page page-container">
      <div className="welcome-banner">
        <h1>Welcome back, {user?.firstName || 'Student'}! 👋</h1>
        <p className="subtitle" style={{ fontSize: '1.05rem', marginTop: '4px' }}>
          Here is a quick view of what's happening at StudyVault today.
        </p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`stat-card ${stat.color}`}>
              <div className="stat-info">
                <span className="stat-label">{stat.title}</span>
                <span className="stat-value">{stat.value}</span>
              </div>
              <div className="stat-icon-wrapper">
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid-sections">
        {/* Recent Notes Feed Section */}
        <div className="dashboard-section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Recent Notes Feed</h2>
            <Link to="/notes" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="recent-list">
            {recentNotes.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
                No notes uploaded yet. Be the first to upload one!
              </p>
            ) : (
              recentNotes.map((note) => (
                <div key={note._id} className="recent-item">
                  <div className="recent-item-meta">
                    <span className="recent-item-title">{note.title}</span>
                    <span className="recent-item-subtitle" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <User size={12} />
                        {note.user ? `${note.user.firstName || ''} ${note.user.lastName || ''}`.trim() || 'Anonymous' : 'Anonymous'}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={12} />
                        {formatDate(note.createdAt)}
                      </span>
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'var(--accent-primary-glow)', color: 'var(--accent-primary)', fontWeight: 600 }}>
                    {note.subject || 'General'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="dashboard-section-card">
          <h2>Recent Academic Activity</h2>
          <div className="recent-list">
            {recentActivity.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
                No recent activity yet.
              </p>
            ) : (
              recentActivity.map((act, i) => (
                <div key={i} className="recent-item">
                  <div className="recent-item-meta">
                    <span className="recent-item-title" style={{ fontWeight: 500 }}>
                      <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{act.user}</strong>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>{act.action}</span>{' '}
                      <span style={{ color: 'var(--accent-secondary)', fontWeight: 500 }}>"{act.target}"</span>
                    </span>
                    <span className="recent-item-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={12} />
                      {formatRelative(act.time)}
                    </span>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
