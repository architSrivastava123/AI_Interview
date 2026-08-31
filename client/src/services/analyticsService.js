/**
 * analyticsService.js
 * REST API client calls for analytics.
 */

import api from './api.js';

export const analyticsService = {
  get: () => api.get('/analytics'),
};
