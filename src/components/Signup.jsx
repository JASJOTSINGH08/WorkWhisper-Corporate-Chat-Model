import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import './Signup.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !username.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password.length > 50) {
      setError('Password must be 50 characters or less.');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (username.length > 20) {
      setError('Username must be 20 characters or less.');
      return;
    }
    if (email.length > 100) {
      setError('Email must be 100 characters or less.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login({ email: data.email, token: data.token, username: data.username });
        navigate('/chat');
      } else {
        setError(data.message || 'Failed to create account.');
      }
    } catch (err) {
      console.error('Email Signup Error:', err);
      setError('Unable to connect to the server.');
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      console.log('Google Sign-Up User:', user.email, 'Token:', idToken);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Backend Response:', data);
        login({ email: data.email, token: data.token, username: data.username });
        navigate(data.username ? '/chat' : '/set-username');
      } else {
        console.error('Backend Error:', data.message);
        setError(data.message || 'Google sign-up failed.');
      }
    } catch (err) {
      console.error('Google Sign-Up Error:', err.message, err.code);
      let errorMessage = 'Google sign-up failed.';
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
    <div className="signup-container">
      <button
        onClick={toggleDarkMode}
        className="dark-mode-toggle"
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>
      <div className="signup-image">
        <img
          src="/chat-app1.webp"
          alt="Chat Application"
          className="chat-image"
          onError={() => console.log('Chat image failed to load')}
        />
      </div>
      <div className="signup-form-container">
        <div className="signup-card" role="form">
          <h1 className="signup-title">Join WorkWhisper</h1>
          <form onSubmit={handleEmailSignup} className="signup-form">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value.slice(0, 100));
                  setError('');
                }}
                required
                autoComplete="email"
                aria-label="Enter your email"
              />
            </div>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.slice(0, 20));
                  setError('');
                }}
                required
                autoComplete="username"
                aria-label="Choose a username"
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value.slice(0, 50));
                  setError('');
                }}
                required
                autoComplete="new-password"
                aria-label="Create a password"
              />
            </div>
            <div className="input-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value.slice(0, 50));
                  setError('');
                }}
                required
                autoComplete="new-password"
                aria-label="Confirm your password"
              />
            </div>
            {error && <p className="signup-error">{error}</p>}
            <button type="submit" className="signup-button" aria-label="Sign up">
              Sign Up
            </button>
          </form>
          <div className="divider">
            <span>OR</span>
          </div>
          <button
            onClick={handleGoogleSignup}
            className="google-button"
            aria-label="Sign up with Google"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              className="google-icon"
            />
            Sign up with Google
          </button>
          <p className="login-link">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;