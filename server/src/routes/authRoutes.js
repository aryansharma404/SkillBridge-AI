import express from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import prisma from '../lib/prisma.js';
import { sendSuccess, sendError } from '../lib/response.js';
import {
  AUTH_COOKIE_NAME,
  signAuthToken,
  requireAuth,
  requireAuthOrDemo
} from '../middleware/auth.js';
import { computeProfileCompletion } from '../services/profileService.js';
import { seedDemoUserOnly } from '../../prisma/seed.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many authentication attempts. Please try again in a few minutes.',
      details: []
    }
  }
});

function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body || {};
    const details = [];

    if (!name || String(name).trim().length < 2) {
      details.push({ field: 'name', message: 'Name must be at least 2 characters.' });
    }
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      details.push({ field: 'email', message: 'Enter a valid email address.' });
    }
    if (!password || String(password).length < 6) {
      details.push({ field: 'password', message: 'Password must be at least 6 characters.' });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      details.push({ field: 'confirmPassword', message: 'Passwords do not match.' });
    }

    if (details.length > 0) {
      return sendError(res, 'VALIDATION_ERROR', 'Check the highlighted fields.', 400, details);
    }

    if (normalizedEmail === 'demo@skillbridge.local') {
      return sendError(res, 'CONFLICT', 'This email is reserved for the isolated Demo Mode.', 409);
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return sendError(
        res,
        'CONFLICT',
        'An account with this email already exists. Please sign in instead.',
        409
      );
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        passwordHash,
        isDemo: false,
        profile: {
          create: {
            onboarded: false,
            weeklyHours: 5,
            workMode: 'Remote or Hybrid'
          }
        }
      },
      include: { profile: true, skills: { include: { skill: true } } }
    });

    const token = signAuthToken(user);
    setAuthCookie(res, token);

    const completion = computeProfileCompletion(user, user.profile, user.skills);

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isDemo: false,
          onboarded: Boolean(user.profile?.onboarded)
        },
        profile: user.profile,
        completion
      },
      'Account created successfully.',
      201
    );
  } catch (err) {
    console.error('Register error:', err);
    return sendError(res, 'SERVER_ERROR', 'Unable to create account right now.', 500);
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        'Email and password are required.',
        400,
        [{ field: 'email', message: 'Provide both email and password.' }]
      );
    }

    if (normalizedEmail === 'demo@skillbridge.local') {
      return sendError(
        res,
        'INVALID_CREDENTIALS',
        'Use the "Try Demo" button to explore the isolated Demo workspace.',
        401
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { profile: true, skills: { include: { skill: true } } }
    });

    // Generic error message so we do not disclose whether an account exists unnecessarily (Section 4.2)
    if (!user || user.isDemo) {
      return sendError(res, 'INVALID_CREDENTIALS', 'Invalid email or password.', 401);
    }

    const valid = await bcrypt.compare(String(password), user.passwordHash);
    if (!valid) {
      return sendError(res, 'INVALID_CREDENTIALS', 'Invalid email or password.', 401);
    }

    const token = signAuthToken(user);
    setAuthCookie(res, token);

    const completion = computeProfileCompletion(user, user.profile, user.skills);

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isDemo: false,
          onboarded: Boolean(user.profile?.onboarded)
        },
        profile: user.profile,
        completion
      },
      'Signed in successfully.'
    );
  } catch (err) {
    console.error('Login error:', err);
    return sendError(res, 'SERVER_ERROR', 'Unable to sign in right now.', 500);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME);
  return sendSuccess(res, { loggedOut: true }, 'Signed out successfully.');
});

router.get('/me', requireAuthOrDemo, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true,
        skills: { include: { skill: true } }
      }
    });

    if (!user) {
      return sendError(res, 'NOT_FOUND', 'User not found.', 404);
    }

    const completion = computeProfileCompletion(user, user.profile, user.skills);

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isDemo: Boolean(user.isDemo),
          dataLabel: user.isDemo ? 'DEMO PROFILE — sample data, not a real student' : null,
          onboarded: Boolean(user.profile?.onboarded)
        },
        profile: user.profile,
        skills: user.skills.map((s) => ({
          id: s.id,
          skillId: s.skillId,
          name: s.skill.displayName,
          category: s.skill.category,
          proficiency: s.proficiency,
          status: s.status
        })),
        completion
      },
      'Current user profile loaded.'
    );
  } catch (err) {
    console.error('Auth me error:', err);
    return sendError(res, 'SERVER_ERROR', 'Unable to load current user.', 500);
  }
});

// Reset Demo Data only (Section 11: "Provide a demo reset action only for demo state, not for real user data.")
router.post('/demo-reset', async (req, res) => {
  try {
    await seedDemoUserOnly(prisma);
    return sendSuccess(
      res,
      { reset: true },
      'Demo profile, skills, roadmap, and applications reset to initial sample state.'
    );
  } catch (err) {
    console.error('Demo reset error:', err);
    return sendError(res, 'SERVER_ERROR', 'Unable to reset demo data.', 500);
  }
});

export default router;
