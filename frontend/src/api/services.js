import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/update-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
};

export const startupAPI = {
  create: (data) => api.post('/startups', data),
  getMy: () => api.get('/startups/my'),
  getById: (id) => api.get(`/startups/${id}`),
  update: (id, data) => api.put(`/startups/${id}`, data),
  delete: (id) => api.delete(`/startups/${id}`),
  getAll: (params) => api.get('/startups', { params }),
  save: (id) => api.post(`/startups/${id}/save`),
};

export const investorAPI = {
  create: (data) => api.post('/investors', data),
  getMe: () => api.get('/investors/me'),
  update: (data) => api.put('/investors/me', data),
  getSaved: () => api.get('/investors/saved'),
  save: (startupId) => api.post(`/investors/save/${startupId}`),
  getRecommendations: (startupId) => api.get(`/investors/recommendations/${startupId}`),
  getAll: () => api.get('/investors'),
  getAllForFounder: (params) => api.get('/investors/browse', { params }),
};

export const proposalAPI = {
  upload: (formData) => api.post('/proposals/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getByStartup: (startupId) => api.get(`/proposals/${startupId}`),
  delete: (id) => api.delete(`/proposals/${id}`),
};

export const aiAPI = {
  analyzeStartup: (startupId) => api.post(`/ai/analyze/${startupId}`),
  getAnalysis: (startupId) => api.get(`/ai/analysis/${startupId}`),
  getAnalysisById: (id) => api.get(`/ai/analysis/result/${id}`),
  generateFundingReadiness: (startupId) => api.post(`/ai/funding-readiness/${startupId}`),
  getFundingReadiness: (startupId) => api.get(`/ai/funding-readiness/${startupId}`),
  improveProposal: (proposalId, data) => api.post(`/ai/improve-proposal/${proposalId}`, data),
  chat: (message, history) => api.post('/ai/chat', { message, history }),
};

export const schemeAPI = {
  getAll: (params) => api.get('/government-schemes', { params }),
  getById: (id) => api.get(`/government-schemes/${id}`),
  match: (startupId) => api.get(`/government-schemes/match/${startupId}`),
  create: (data) => api.post('/government-schemes', data),
  update: (id, data) => api.put(`/government-schemes/${id}`, data),
  delete: (id) => api.delete(`/government-schemes/${id}`),
};

export const applicationAPI = {
  create: (data) => api.post('/applications', data),
  getMy: () => api.get('/applications/my'),
  getInvestor: (params) => api.get('/applications/investor', { params }),
  getAll: () => api.get('/applications'),
  getById: (id) => api.get(`/applications/${id}`),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data),
};

export const offerAPI = {
  create: (data) => api.post('/offers', data),
  getFounderOffers: () => api.get('/offers/founder'),
  getInvestorOffers: () => api.get('/offers/investor'),
  respond: (id, data) => api.put(`/offers/${id}/respond`, data),
};

export const dashboardAPI = {
  getFounder: () => api.get('/dashboard/founder'),
  getInvestor: () => api.get('/dashboard/investor'),
  getAdmin: () => api.get('/dashboard/admin'),
};

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getStartups: (params) => api.get('/admin/startups', { params }),
  getAIStats: () => api.get('/admin/ai-stats'),
  notify: (data) => api.post('/admin/notify', data),
};
