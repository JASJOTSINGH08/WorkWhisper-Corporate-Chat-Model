import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import './SetUsername.css';

const SetUsername = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, login } = useAuth();

  useEffect(() => {
    console.log('User in SetUsername:', user);
    if (!user || !user.email) {
      setError('Please sign in with Google first or refresh the page.');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username.trim()) {
      setError('Please enter a username.');
      setLoading(false);
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      setLoading(false);
      return;
    }
    if (username.length > 20) {
      setError('Username must be 20 characters or less.');
      setLoading(false);
      return;
    }

    if (!user || !user.email) {
      setError('User data is missing. Please sign in again.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/set-username`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, username }),
        credentials: 'include',
      });

      const data = await response.json();
      console.log('Set username response:', data);

      if (response.ok) {
        login({ ...user, username: data.username });
        navigate('/chat');
      } else {
        setError(data.message || 'Failed to set username.');
      }
    } catch (err) {
      console.error('Set Username Error:', err);
      setError('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="set-username-container">
        <p>Please sign in with Google to set your username.</p>
      </div>
    );
  }

  return (
    <div className="set-username-container">
      <div className="set-username-card" role="form">
        <h1 className="set-username-title">Choose Your Username</h1>
        <form onSubmit={handleSubmit} className="set-username-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.slice(0, 20));
                setError('');
              }}
              required
              autoComplete="username"
              disabled={loading}
              aria-label="Enter your username"
            />
          </div>
          {error && <p className="set-username-error">{error}</p>}
          {loading && <p>Setting username...</p>}
          <button
            type="submit"
            className="set-username-button"
            disabled={loading}
            aria-label="Set username"
          >
            Set Username
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetUsername;