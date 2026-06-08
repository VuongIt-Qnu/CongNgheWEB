import api from './api';

export async function requestPasswordReset(email) {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
}

export async function resetPassword(token, newPassword, confirmPassword) {
  const { data } = await api.post('/auth/reset-password', {
    token,
    newPassword,
    confirmPassword,
  });
  return data;
}
