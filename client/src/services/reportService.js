/**
 * reportService.js
 * REST API client calls for reports.
 */

import api from './api.js';

export const reportService = {
  list: () => api.get('/reports'),
  getById: (id) => api.get(`/reports/${id}`),
};
