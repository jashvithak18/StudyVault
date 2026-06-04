import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bell } from 'lucide-react';
const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <span className="navbar-logo-text">StudyVault</span>
      </div>
      <div className="navbar-right">
        <button className="icon-button" aria-label="Notifications">
          <Bell size={20} />
        </button>
        {user && (
          <div className="navbar-user">
            <span className="user-name">{user.name}</span>
            <button className="logout-button" onClick={logout} title="Log Out">
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
