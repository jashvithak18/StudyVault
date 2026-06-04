import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bell, User, Menu } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <button 
        className="icon-button mobile-toggle-btn" 
        onClick={onToggleSidebar}
        aria-label="Toggle navigation"
        style={{ display: 'none' }}
      >
        <Menu size={22} />
      </button>

      <div className="navbar-right">
        <button className="icon-button" aria-label="Notifications" style={{ marginRight: '8px' }}>
          <Bell size={20} />
        </button>
        {user && (
          <div className="navbar-user">
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)'
            }}>
              <User size={16} />
            </div>
            <span className="user-name">{user.firstName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.name || 'Student'}</span>
            <button className="logout-button" onClick={logout} title="Log Out">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
