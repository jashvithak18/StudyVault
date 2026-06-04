import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, error, setError } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setLoading(true);
    const success = await register(name, email, password);
    setLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left-pane">
        <div style={{ maxWidth: '440px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <BookOpen size={32} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-title)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              StudyVault
            </span>
          </div>
          
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-title)', lineHeight: 1.15, marginBottom: '16px', letterSpacing: '-0.03em' }}>
            Join your student community vault.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.5, marginBottom: '32px' }}>
            Sign up to share learning resources, collaborate, and access all features in your clean academic hub.
          </p>

          {/* SVG Illustration */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0 40px 0' }}>
            <svg width="280" height="200" viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="170" width="260" height="6" rx="3" fill="#cbd5e1" />
              <rect x="50" y="60" width="110" height="110" rx="8" fill="#475569" />
              <rect x="58" y="68" width="94" height="84" rx="4" fill="#f8fafc" />
              <rect x="66" y="78" width="40" height="5" rx="2" fill="#4f46e5" />
              <rect x="66" y="88" width="70" height="4" rx="2" fill="#cbd5e1" />
              <rect x="66" y="97" width="55" height="4" rx="2" fill="#cbd5e1" />
              <rect x="66" y="106" width="60" height="4" rx="2" fill="#06b6d4" />
              <path d="M30 160H250L240 170H40L30 160Z" fill="#94a3b8" />
              
              <rect x="180" y="100" width="70" height="14" rx="2" fill="#4f46e5" />
              <rect x="175" y="114" width="80" height="14" rx="2" fill="#06b6d4" />
              <rect x="170" y="128" width="90" height="14" rx="2" fill="#f59e0b" />
              <rect x="165" y="142" width="100" height="18" rx="3" fill="#1e293b" />
              <rect x="185" y="146" width="60" height="10" rx="1" fill="#f8fafc" opacity="0.3" />
              
              <path d="M125 15C125 15 130 5 140 10C150 15 145 35 125 35C105 35 100 15 110 10C120 5 125 15 125 15Z" fill="#10b981" opacity="0.8" />
            </svg>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              'Comprehensive subject and semester-wise note sharing',
              'Integrated student doubt forum with answer tracking',
              'Real-time collaborative whiteboard drawing rooms',
              'AskVault AI to instantly query, explain, and summarize notes'
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--accent-success)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="auth-right-pane">
        <div className="auth-card">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Get started with StudyVault platform</p>

          {error && (
            <div className="auth-error-alert" onClick={() => setError(null)}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="e.g. name@student.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
