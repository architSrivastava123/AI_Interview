/**
 * interviewService.js
 * REST API client calls for mock interviews.
 */

import api from './api.js';

export const interviewService = {
  create: (data) => api.post('/interviews', data),
  list: () => api.get('/interviews'),
  getById: (id) => api.get(`/interviews/${id}`),
  delete: (id) => api.delete(`/interviews/${id}`),
  start: (id) => api.post(`/interviews/${id}/start`),
  submitAnswer: (id, payload) => api.post(`/interviews/${id}/answer`, payload),
  nextQuestion: (id) => api.post(`/interviews/${id}/next-question`),
  complete: (id) => api.post(`/interviews/${id}/complete`),
};
