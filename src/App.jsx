import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import { SocketProvider } from './providers/SocketProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import Login from './components/Login';
import Signup from './components/Signup';
import SetUsername from './components/SetUsername';
import ChatApp from './components/ChatApp';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/set-username" element={<SetUsername />} />
              <Route path="/chat" element={<ProtectedRoute><ChatApp /></ProtectedRoute>} />
              <Route
                path="/"
                element={
                  <RedirectBasedOnUser />
                }
              />
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

const RedirectBasedOnUser = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  if (user.username === user.email) return <Navigate to="/set-username" />;

  return <Navigate to="/chat" />;
};

export default App;
