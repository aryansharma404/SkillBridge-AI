import express from 'express';
import rateLimit from 'express-rate-limit';
import prisma from '../lib/prisma.js';
import { sendSuccess, sendError } from '../lib/response.js';
import { requireAuthOrDemo } from '../middleware/auth.js';
import {
  generateRoadmapPlan,
  formatRoadmapWithProgress
} from '../services/roadmapService.js';

const router = express.Router();

const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false
});

// GET /api/roadmap — read current user's roadmap
router.get('/', requireAuthOrDemo, async (req, res) => {
  try {
    const userId = req.user.id;
    const roadmap = await prisma.learningRoadmap.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        steps: {
          orderBy: { sequence: 'asc' }
        }
      }
    });

    const profile = await prisma.studentProfile.findUnique({ where: { userId } });

    return sendSuccess(
      res,
      {
        roadmap: formatRoadmapWithProgress(roadmap),
        targetRole: profile?.targetRole || 'Frontend',
        weeklyHours: profile?.weeklyHours || 5
      },
      roadmap ? 'Roadmap loaded.' : 'No roadmap generated yet.'
    );
  } catch (err) {
    console.error('Get roadmap error:', err);
    return sendError(res, 'SERVER_ERROR', 'Failed to load roadmap.', 500);
  }
});

// POST /api/roadmap/generate — generate or regenerate roadmap
router.post('/generate', requireAuthOrDemo, generateLimiter, async (req, res) => {
  try {
    const userId = req.user.id;
    const [profile, studentSkills, existingRoadmap] = await Promise.all([
      prisma.studentProfile.findUnique({ where: { userId } }),
      prisma.studentSkill.findMany({
        where: { userId },
        include: { skill: true }
      }),
      prisma.learningRoadmap.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { steps: true }
      })
    ]);

    const targetRole = req.body?.targetRole || profile?.targetRole || 'Frontend';
    const weeklyHours = Number(req.body?.weeklyHours || profile?.weeklyHours || 5);

    const plan = await generateRoadmapPlan({
      targetRole,
      studentSkills,
      weeklyHours,
      previousSteps: existingRoadmap?.steps || []
    });

    // Replace existing user roadmaps cleanly
    await prisma.learningRoadmap.deleteMany({ where: { userId } });

    const created = await prisma.learningRoadmap.create({
      data: {
        userId,
        targetRole: plan.targetRole,
        source: plan.source,
        steps: {
          create: plan.steps.map((s) => ({
            sequence: s.sequence,
            title: s.title,
            objective: s.objective,
            task: s.task,
            estimatedHours: s.estimatedHours,
            completedAt: s.completedAt || null
          }))
        }
      },
      include: {
        steps: {
          orderBy: { sequence: 'asc' }
        }
      }
    });

    // Also update profile targetRole if user generated for a specific role
    if (req.body?.targetRole && profile) {
      await prisma.studentProfile.update({
        where: { userId },
        data: { targetRole: plan.targetRole }
      });
    }

    return sendSuccess(
      res,
      {
        roadmap: formatRoadmapWithProgress(created)
      },
      plan.source === 'ai-assisted'
        ? 'AI-assisted learning roadmap generated.'
        : 'Rule-based learning roadmap generated.',
      201
    );
  } catch (err) {
    console.error('Generate roadmap error:', err);
    return sendError(res, 'SERVER_ERROR', 'Failed to generate roadmap.', 500);
  }
});

// PATCH /api/roadmap/steps/:id — update completion or editable step fields
router.patch('/steps/:id', requireAuthOrDemo, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { completed, title, objective, task, estimatedHours } = req.body || {};

    const step = await prisma.roadmapStep.findUnique({
      where: { id },
      include: { roadmap: true }
    });

    if (!step) {
      return sendError(res, 'NOT_FOUND', 'Roadmap step not found.', 404);
    }

    // Strict ownership verification (Section 10)
    if (step.roadmap.userId !== userId) {
      return sendError(res, 'FORBIDDEN', 'You do not have access to this roadmap step.', 403);
    }

    const updateData = {};
    if (completed !== undefined) {
      updateData.completedAt = completed ? new Date() : null;
    }
    if (title !== undefined) {
      if (!String(title).trim()) {
        return sendError(res, 'VALIDATION_ERROR', 'Step title cannot be empty.', 400);
      }
      updateData.title = String(title).trim();
    }
    if (objective !== undefined) {
      updateData.objective = String(objective).trim();
    }
    if (task !== undefined) {
      updateData.task = String(task).trim();
    }
    if (estimatedHours !== undefined) {
      const hrs = Number(estimatedHours);
      if (Number.isNaN(hrs) || hrs < 1 || hrs > 60) {
        return sendError(res, 'VALIDATION_ERROR', 'Estimated hours must be between 1 and 60.', 400);
      }
      updateData.estimatedHours = hrs;
    }

    const updatedStep = await prisma.roadmapStep.update({
      where: { id },
      data: updateData
    });

    const fullRoadmap = await prisma.learningRoadmap.findUnique({
      where: { id: step.roadmapId },
      include: {
        steps: { orderBy: { sequence: 'asc' } }
      }
    });

    return sendSuccess(
      res,
      {
        step: updatedStep,
        roadmap: formatRoadmapWithProgress(fullRoadmap)
      },
      'Roadmap step updated.'
    );
  } catch (err) {
    console.error('Update roadmap step error:', err);
    return sendError(res, 'SERVER_ERROR', 'Failed to update roadmap step.', 500);
  }
});

export default router;
