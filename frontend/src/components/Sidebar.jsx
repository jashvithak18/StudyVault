import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Upload, FileText, MessageSquare, Bot, Edit3 } from 'lucide-react';
const Sidebar = () => {
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/upload', label: 'Upload Notes', icon: Upload },
    { path: '/notes', label: 'Notes Feed', icon: FileText },
    { path: '/forum', label: 'Doubt Forum', icon: MessageSquare },
    { path: '/ask', label: 'AskVault AI', icon: Bot },
    { path: '/whiteboard', label: 'Whiteboard', icon: Edit3 },
  ];
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} className="sidebar-icon" />
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
