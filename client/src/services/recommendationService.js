/**
 * recommendationService.js
 * REST API client calls for practice recommendations.
 */

import api from './api.js';

export const recommendationService = {
  list: () => api.get('/recommendations'),
  toggle: (id) => api.patch(`/recommendations/${id}/toggle`),
};
