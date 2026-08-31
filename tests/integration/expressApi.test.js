import { jest, describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../server/src/app.js';
import { Interview } from '../../server/src/models/Interview.js';
import { Report } from '../../server/src/models/Report.js';

describe('Express REST API Endpoints', () => {
  beforeAll(() => {
    // Stub Mongoose model methods for offline unit/integration test speed
    jest.spyOn(Interview, 'find').mockReturnValue({
      sort: () => ({
        populate: () => ({
          lean: () => Promise.resolve([]),
        }),
      }),
    });

    jest.spyOn(Interview, 'countDocuments').mockResolvedValue(0);

    jest.spyOn(Report, 'find').mockReturnValue({
      sort: () => ({
        lean: () => Promise.resolve([]),
        populate: () => ({
          lean: () => Promise.resolve([]),
        }),
      }),
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/health', () => {
    test('returns 200 OK with server health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('Authentication Enforcement', () => {
    test('rejects unauthenticated requests to protected route with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/interviews');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    test('accepts valid Authorization Bearer token', async () => {
      const res = await request(app)
        .get('/api/interviews')
        .set('Authorization', 'Bearer test_user_456');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/analytics', () => {
    test('returns analytics object for authenticated user', async () => {
      const res = await request(app)
        .get('/api/analytics')
        .set('Authorization', 'Bearer test_user_456');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('readinessScore');
      expect(res.body.data).toHaveProperty('averageScores');
    });
  });
});
