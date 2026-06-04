import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Upload, FileText, MessageSquare, Bot, Edit3, BookOpen } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/upload', label: 'Upload Notes', icon: Upload },
    { path: '/notes', label: 'Notes Feed', icon: FileText },
    { path: '/forum', label: 'Doubt Forum', icon: MessageSquare },
    { path: '/ask', label: 'AskVault AI', icon: Bot },
    { path: '/whiteboard', label: 'Whiteboard', icon: Edit3 },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-logo-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start', padding: '0 8px', marginBottom: '16px' }}>
        <BookOpen size={36} className="sidebar-logo-icon" />
        <span className="sidebar-brand-name">StudyVault</span>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={18} className="sidebar-icon" />
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
