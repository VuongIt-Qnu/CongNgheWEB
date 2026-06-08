import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import api from '../services/api';
import { storageGet, storageRemove, storageSet } from '../utils/storage';

const AuthContext = createContext(null);

function parseStoredUser() {
  const raw = storageGet('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => storageGet('token'));
  const [user, setUser] = useState(parseStoredUser);

  const isAuthenticated = !!token;

  const login = useCallback(({ token: nextToken, user: nextUser }) => {
    storageSet('token', nextToken);
    storageSet('user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    storageRemove('token');
    storageRemove('user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    const response = await api.get('/auth/me');
    const me = response.data;
    storageSet('user', JSON.stringify(me));
    setUser(me);
    return me;
  }, []);

  const updateProfile = useCallback(async ({ name, phone, address }) => {
    const response = await api.put('/auth/me', { name, phone, address });
    storageSet('user', JSON.stringify(response.data));
    setUser(response.data);
    return response.data;
  }, []);

  const uploadAvatar = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/auth/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    storageSet('user', JSON.stringify(response.data));
    setUser(response.data);
    return response.data;
  }, []);

  const changePassword = useCallback(async ({ current_password, new_password }) => {
    const response = await api.put('/auth/me/password', { current_password, new_password });
    return response.data;
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      role: user?.role || null,
      login,
      logout,
      refreshMe,
      updateProfile,
      uploadAvatar,
      changePassword,
    }),
    [token, user, isAuthenticated, login, logout, refreshMe, updateProfile, uploadAvatar, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
