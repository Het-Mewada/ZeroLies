import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Dashboard
export const getDashboard = () => api.get('/dashboard');
export const getDailyLog = (date) => api.get(`/dashboard/daily/${date}`);
export const getDayDetail = (date) => api.get(`/dashboard/daily/${date}`);

// Tasks
export const submitTask = (data) => api.post('/tasks/submit', data);
export const wakeCheckin = () => api.post('/tasks/wake-checkin');
export const sleepCheck = () => api.get('/tasks/sleep-check');
export const sleepSuccess = () => api.post('/tasks/sleep-success');

// Study
export const startStudy = () => api.post('/study/start');
export const stopStudy = () => api.post('/study/stop');
export const addSnapshot = (data) => api.post('/study/snapshot', data);
export const getStudyToday = () => api.get('/study/today');

// Upload
export const uploadImage = (formData) =>
  api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export default api;
