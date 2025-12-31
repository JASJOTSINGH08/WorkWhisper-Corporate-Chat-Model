import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        login({ email: data.email, token: data.token, username: data.username });
        navigate(data.username ? '/chat' : '/set-username');
      } else {
        setError(data.message || 'Invalid email or password.');
      }
    } catch (err) {
      console.error('Email Login Error:', err);
      setError('Unable to connect to the server.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      console.log('Google Sign-In User:', user.email, 'Token:', idToken);

      const response = await fetch('http://localhost:8081/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
        credentials: 'include',
      });

      const data = await response.json();
      console.log('Backend Response:', data);

      if (response.ok) {
        login({ email: data.email, token: idToken, username: data.username });
        navigate(data.username ? '/chat' : '/set-username');
      } else {
        setError(data.message || 'Google sign-in failed on backend.');
      }
    } catch (err) {
      console.error('Google Sign-In Error:', err.message, err.code);
      let errorMessage = 'Google sign-in failed.';
      if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups and try again.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed. Please try again.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
    }
  };

  return (
    <div className={`login-container ${isDarkMode ? 'dark' : 'light'}`}>
      <button
        onClick={toggleDarkMode}
        className="dark-mode-toggle"
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>
      <div className="login-image">
        <img
          src="/chat-app.png"
          alt="Chat Application"
          className="chat-image"
          onError={() => console.log('Chat image failed to load')}
        />
      </div>
      <div className="login-form-container">
        <div className="login-card">
          <h1 className="login-title">Welcome to WorkWhisper</h1>
          <form onSubmit={handleEmailLogin} className="login-form">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                required
                autoComplete="email"
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                required
                autoComplete="current-password"
              />
            </div>
            {error && <p className="login-error">{error}</p>}
            <button type="submit" className="login-button">
              Sign In
            </button>
          </form>
          <div className="divider">
            <span>OR</span>
          </div>
          <button onClick={handleGoogleLogin} className="google-button">
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              className="google-icon"
            />
            Sign in with Google
          </button>
          <p className="signup-link">
            Don't have an account? <a href="/signup">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;