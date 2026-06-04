import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';

const AppLayout = () => {
  const { user } = useAuth();

  return (
    <div className={`app-container ${user ? 'authenticated' : 'unauthenticated'}`}>
      {user && <Navbar />}
      <div className="main-layout">
        {user && <Sidebar />}
        <main className="content-area">
          <AppRoutes />
        </main>
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
