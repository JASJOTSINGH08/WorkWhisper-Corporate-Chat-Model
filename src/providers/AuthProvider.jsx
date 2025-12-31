import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();

  // ✅ Fix: define login function
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Optional: logout if needed
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setLoading(true);
        setError(null);

        try {
          const token = await firebaseUser.getIdToken();
const response = await fetch('http://localhost:8081/verify-session', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
});
if (!response.ok) throw new Error('Session verification failed');
if (isTokenExpired(token)) throw new Error('Token has expired');

const data = await response.json(); // ✅ this returns { username, email }
setUser({ username: data.username, email: data.email, idToken: token });


         // setUser({ username: firebaseUser.displayName || firebaseUser.email, idToken: token });
        } catch (err) {
          setError(err.message);
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() > payload.exp * 1000;
    } catch {
      return true;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {loading ? <p>Verifying authentication...</p> : children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
