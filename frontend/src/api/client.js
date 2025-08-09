import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function login(email, password) {
  const { data } = await api.post('/api/auth/login', { email, password });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export async function signup(payload) {
  const { data } = await api.post('/api/auth/signup', payload);
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export async function getMyReferralStats() {
  const { data } = await api.get('/api/referrals/me');
  return data;
}

export async function getAnalyticsSummary() {
  const { data } = await api.get('/api/analytics/summary');
  return data;
}

export async function getTimeSeries(days = 14) {
  const { data } = await api.get('/api/analytics/timeseries', { params: { days } });
  return data;
}

export async function getBestCTA() {
  const { data } = await api.get('/api/analytics/best-cta');
  return data;
}

export function getReferralLink(code) {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
  return `${base}/ref/${code}`;
}

export default api;


