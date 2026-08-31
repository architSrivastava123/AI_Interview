/**
 * resumeService.js
 * REST API client calls for resumes.
 */

import api from './api.js';

export const resumeService = {
  upload: (formData) => api.post('/resumes', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  list: () => api.get('/resumes'),
  delete: (id) => api.delete(`/resumes/${id}`),
};
