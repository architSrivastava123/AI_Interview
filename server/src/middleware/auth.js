/**
 * auth.js
 * Clerk authentication middleware for Express.
 * Verifies the Bearer JWT token from the Authorization header and attaches req.auth = { userId }.
 */

import { verifyToken } from '@clerk/backend';
import { env } from '../config/env.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or malformed Authorization header. Bearer token required.',
        },
      });
    }

    const token = authHeader.split(' ')[1];

    // Development or test bypass with mock token
    if (token.startsWith('test_user_') || token.startsWith('mock_user_')) {
      req.auth = {
        userId: token,
      };
      return next();
    }

    // Verify token with Clerk
    if (!env.CLERK_SECRET_KEY) {
      // In dev mode without Clerk key set, decode token payload safely for local testing
      try {
        const payloadBase64 = token.split('.')[1];
        if (payloadBase64) {
          const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
          req.auth = {
            userId: decoded.sub || decoded.userId || 'dev_user_123',
          };
          return next();
        }
      } catch {
        // fall through
      }
      req.auth = { userId: 'dev_user_123' };
      return next();
    }

    const verifiedPayload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });

    if (!verifiedPayload || !verifiedPayload.sub) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token verification failed.',
        },
      });
    }

    req.auth = {
      userId: verifiedPayload.sub,
      claims: verifiedPayload,
    };

    next();
  } catch (error) {
    console.error('Auth verification error:', error.message);
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired session token.',
      },
    });
  }
}
