import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { BookOpen, HelpCircle, Edit } from 'lucide-react';
import Loader from '../components/Loader';
const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ notesCount: 0, doubtsCount: 0, whiteboardsCount: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const notesRes = await api.get('/user-api/notes');
        const forumRes = await api.get('/user-api/forum/questions');
        setStats({
          notesCount: notesRes.data.length || 0,
          doubtsCount: forumRes.data.length || 0,
          whiteboardsCount: 1,
        });
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
    { title: 'Study Notes', value: stats.notesCount, icon: BookOpen, color: 'stat-blue' },
    { title: 'Asked Doubts', value: stats.doubtsCount, icon: HelpCircle, color: 'stat-purple' },
    { title: 'Active Board Rooms', value: stats.whiteboardsCount, icon: Edit, color: 'stat-indigo' },
  ];
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}! 👋</h1>
        <p className="subtitle">Here is a quick view of what's happening at StudyVault.</p>
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
                <Icon size={28} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-box glassmorphic-panel">
          <h2>Getting Started</h2>
          <div className="getting-started-steps">
            <div className="step">
              <span className="step-num">1</span>
              <div>
                <h3>Upload Notes</h3>
                <p>Upload lecture slides, drafts, and notes as PDF or text files to build your vault.</p>
              </div>
            </div>
            <div className="step">
              <span className="step-num">2</span>
              <div>
                <h3>Ask AI</h3>
                <p>Use AskVault AI to automatically extract key concepts or ask queries directly from uploads.</p>
              </div>
            </div>
            <div className="step">
              <span className="step-num">3</span>
              <div>
                <h3>Sketch Ideas</h3>
                <p>Launch or join collaborative whiteboard rooms with peers over WebSockets.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
