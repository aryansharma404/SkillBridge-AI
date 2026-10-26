import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { sendError } from '../lib/response.js';
import { seedDemoUserOnly } from '../../prisma/seed.js';

const JWT_SECRET = process.env.JWT_SECRET || 'skillbridge-local-dev-secret-key-2026';
export const AUTH_COOKIE_NAME = 'skillbridge_token';

export function signAuthToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, isDemo: Boolean(user.isDemo) },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function getOrEnsureDemoUser() {
  let demoUser = await prisma.user.findUnique({
    where: { email: 'demo@skillbridge.local' },
    include: { profile: true }
  });
  if (!demoUser) {
    await seedDemoUserOnly(prisma);
    demoUser = await prisma.user.findUnique({
      where: { email: 'demo@skillbridge.local' },
      include: { profile: true }
    });
  }
  return demoUser;
}

/**
 * Requires a real authenticated user session (via HTTP-only cookie or Authorization Bearer header).
 */
export async function requireAuth(req, res, next) {
  try {
    const token =
      req.cookies?.[AUTH_COOKIE_NAME] ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null);

    if (!token) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required. Please log in.', 401);
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { profile: true }
    });

    if (!user || user.isDemo) {
      return sendError(res, 'UNAUTHORIZED', 'Invalid or expired session.', 401);
    }

    req.user = user;
    req.isDemoMode = false;
    next();
  } catch {
    return sendError(res, 'UNAUTHORIZED', 'Invalid or expired session. Please log in again.', 401);
  }
}

/**
 * Allows either an authenticated student OR an explicit demo mode request (X-Demo-Mode: true).
 * Demo mode requests are strictly scoped to the isolated Demo Student record (`demo-student-user`),
 * never touching real user accounts.
 */
export async function requireAuthOrDemo(req, res, next) {
  try {
    const isDemoHeader =
      req.headers['x-demo-mode'] === 'true' || req.query?.demo === 'true';

    if (isDemoHeader) {
      const demoUser = await getOrEnsureDemoUser();
      req.user = demoUser;
      req.isDemoMode = true;
      return next();
    }

    const token =
      req.cookies?.[AUTH_COOKIE_NAME] ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null);

    if (!token) {
      return sendError(
        res,
        'UNAUTHORIZED',
        'Please sign in or use Try Demo mode to access this resource.',
        401
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { profile: true }
    });

    if (!user) {
      return sendError(res, 'UNAUTHORIZED', 'Session user not found.', 401);
    }

    req.user = user;
    req.isDemoMode = Boolean(user.isDemo);
    next();
  } catch {
    return sendError(res, 'UNAUTHORIZED', 'Invalid or expired session.', 401);
  }
}
