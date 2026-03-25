import { createContext, useContext, useEffect, useState } from 'react';
import { AUTH_TOKEN_KEY, USER_STORAGE_KEY, apiClient, publicClient } from '../api/client.js';

const AuthContext = createContext(null);

const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (_error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem(AUTH_TOKEN_KEY));
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(AUTH_TOKEN_KEY)));
  const [requiresBootstrap, setRequiresBootstrap] = useState(false);

  const syncStorage = (nextToken, nextUser) => {
    if (nextToken && nextUser) {
      localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  const refreshBootstrapStatus = async () => {
    try {
      const { data } = await publicClient.get('/auth/bootstrap-status');
      setRequiresBootstrap(data.requiresBootstrap);
    } catch (_error) {
      setRequiresBootstrap(false);
    }
  };

  const logout = () => {
    syncStorage(null, null);
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  useEffect(() => {
    refreshBootstrapStatus();
  }, []);

  useEffect(() => {
    let ignore = false;

    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data } = await apiClient.get('/auth/me');

        if (!ignore) {
          setUser(data.user);
          syncStorage(token, data.user);
        }
      } catch (_error) {
        if (!ignore) {
          logout();
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchCurrentUser();

    return () => {
      ignore = true;
    };
  }, [token]);

  const login = async (credentials) => {
    const { data } = await publicClient.post('/auth/login', credentials);

    setToken(data.token);
    setUser(data.user);
    syncStorage(data.token, data.user);
    setRequiresBootstrap(false);
    return data.user;
  };

  const bootstrapAdmin = async (payload) => {
    const { data } = await publicClient.post('/auth/bootstrap', payload);

    setToken(data.token);
    setUser(data.user);
    syncStorage(data.token, data.user);
    setRequiresBootstrap(false);
    return data.user;
  };

  const registerUser = async (payload) => {
    const { data } = await apiClient.post('/auth/register', payload);
    return data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: Boolean(token && user),
        requiresBootstrap,
        login,
        logout,
        bootstrapAdmin,
        registerUser,
        refreshBootstrapStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
