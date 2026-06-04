import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';

import { useState } from 'react';

const AppLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`app-container ${user ? 'authenticated' : 'unauthenticated'}`}>
      <div className="main-layout" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {user && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
        {user && sidebarOpen && (
          <div 
            className="sidebar-backdrop" 
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {user && <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />}
          <main className="content-area">
            <AppRoutes />
          </main>
        </div>
      </div>
      {user && <Chatbot />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
