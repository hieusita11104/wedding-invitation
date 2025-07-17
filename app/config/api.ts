const API_PORT = process.env.SERVER_PORT || 3001;
export const API_BASE_URL = `http://localhost:${API_PORT}/api`;

export const API_ENDPOINTS = {
  users: `${API_BASE_URL}/users`,
  templates: `${API_BASE_URL}/templates`,
  weddingInvitations: `${API_BASE_URL}/wedding-invitations`,
  login: `${API_BASE_URL}/auth/login`,
  logout: `${API_BASE_URL}/auth/logout`,
  register: `${API_BASE_URL}/auth/register`,
  dashboard: `${API_BASE_URL}/dashboard`,
  forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
  verifyOtp: `${API_BASE_URL}/auth/verify-otp`,
  resetPassword: `${API_BASE_URL}/auth/reset-password`,
  getUserDetails: `${API_BASE_URL}/users`,
  googleAuth: `${API_BASE_URL}/auth/google`,
  getCurrentUser: `${API_BASE_URL}/auth/me`,
} as const;