/**
 * tests/utils/db.test.js
 *
 * Tests the database connection factory in utils/db.js.
 * Since real DB connections are not available in CI, we mock the
 * Neon + Drizzle adapters and verify the module wires them correctly.
 */

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockDrizzleInstance = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockResolvedValue([]),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn().mockResolvedValue([{ id: 1 }]),
  delete: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
};

jest.mock('@neondatabase/serverless', () => ({
  neon: jest.fn().mockReturnValue(jest.fn()),
}));

jest.mock('drizzle-orm/neon-http', () => ({
  drizzle: jest.fn().mockReturnValue(mockDrizzleInstance),
}));

jest.mock('../../utils/schema', () => ({
  MockInterview: { mockId: 'mockId' },
  UserAnswer: { mockIdRef: 'mockId' },
}));

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('utils/db — database connection factory', () => {
  let neonMock, drizzleMock, db;

  beforeEach(() => {
    jest.resetModules();

    // Re-register mocks after resetModules
    jest.mock('@neondatabase/serverless', () => ({
      neon: jest.fn().mockReturnValue(jest.fn()),
    }));
    jest.mock('drizzle-orm/neon-http', () => ({
      drizzle: jest.fn().mockReturnValue(mockDrizzleInstance),
    }));
    jest.mock('../../utils/schema', () => ({
      MockInterview: { mockId: 'mockId' },
    }));

    neonMock = require('@neondatabase/serverless');
    drizzleMock = require('drizzle-orm/neon-http');
    db = require('../../utils/db').db;
  });

  test('neon() is called with the DB URL environment variable', () => {
    expect(neonMock.neon).toHaveBeenCalledWith(process.env.NEXT_PUBLIC_DRIZZLE_DB_URL);
  });

  test('drizzle() is called with the neon SQL connection', () => {
    const sqlConnection = neonMock.neon.mock.results[0].value;
    expect(drizzleMock.drizzle).toHaveBeenCalledWith(sqlConnection, expect.objectContaining({ schema: expect.any(Object) }));
  });

  test('db export is the drizzle instance', () => {
    expect(db).toBe(mockDrizzleInstance);
  });

  test('db.select is callable', () => {
    const result = db.select();
    expect(result).toBe(mockDrizzleInstance);
  });

  test('db.insert is callable and chainable', () => {
    const result = db.insert('table');
    expect(result).toBe(mockDrizzleInstance);
  });

  test('db.delete is callable', () => {
    expect(db.delete).toBeDefined();
    expect(typeof db.delete).toBe('function');
  });

  test('db.update is callable', () => {
    expect(db.update).toBeDefined();
    expect(typeof db.update).toBe('function');
  });

  test('db supports async .where() call after .select().from()', async () => {
    const chain = db.select().from('table').where('condition');
    // where() returns a Promise (mocked to resolve with []), not the drizzle instance
    expect(chain).toBeInstanceOf(Promise);
    const result = await chain;
    expect(Array.isArray(result)).toBe(true);
  });

  test('missing DB URL does not throw at import time', () => {
    const originalEnv = process.env.NEXT_PUBLIC_DRIZZLE_DB_URL;
    delete process.env.NEXT_PUBLIC_DRIZZLE_DB_URL;
    expect(() => require('../../utils/db')).not.toThrow();
    process.env.NEXT_PUBLIC_DRIZZLE_DB_URL = originalEnv;
  });
});
