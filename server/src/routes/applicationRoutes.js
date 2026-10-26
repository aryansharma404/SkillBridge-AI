import express from 'express';
import prisma from '../lib/prisma.js';
import { sendSuccess, sendError } from '../lib/response.js';
import { requireAuthOrDemo } from '../middleware/auth.js';

const router = express.Router();

export const VALID_APPLICATION_STATUSES = [
  'Interested',
  'Applied',
  'Interview',
  'Offer',
  'Rejected'
];

function computeApplicationStats(applications = []) {
  const countsByStatus = {
    Interested: 0,
    Applied: 0,
    Interview: 0,
    Offer: 0,
    Rejected: 0
  };
  for (const app of applications) {
    if (countsByStatus[app.status] !== undefined) {
      countsByStatus[app.status] += 1;
    }
  }
  const activeCount =
    countsByStatus.Interested +
    countsByStatus.Applied +
    countsByStatus.Interview +
    countsByStatus.Offer;

  return {
    total: applications.length,
    activeCount,
    countsByStatus
  };
}

// GET /api/applications
router.get('/', requireAuthOrDemo, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status = '', search = '' } = req.query || {};

    const allUserApps = await prisma.application.findMany({
      where: { userId },
      include: { internship: true },
      orderBy: { updatedAt: 'desc' }
    });

    const stats = computeApplicationStats(allUserApps);

    let filtered = [...allUserApps];
    if (status && status !== 'All') {
      filtered = filtered.filter((a) => a.status === status);
    }

    const q = String(search || '').trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.company.toLowerCase().includes(q) ||
          (a.notes && a.notes.toLowerCase().includes(q))
      );
    }

    return sendSuccess(
      res,
      {
        applications: filtered,
        stats,
        statuses: VALID_APPLICATION_STATUSES
      },
      'Applications loaded.'
    );
  } catch (err) {
    console.error('Get applications error:', err);
    return sendError(res, 'SERVER_ERROR', 'Failed to load applications.', 500);
  }
});

// POST /api/applications
router.post('/', requireAuthOrDemo, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      internshipId = null,
      title,
      company,
      status = 'Interested',
      appliedAt = null,
      deadline = null,
      notes = ''
    } = req.body || {};

    let resolvedTitle = String(title || '').trim();
    let resolvedCompany = String(company || '').trim();
    let resolvedDeadline = deadline ? String(deadline).trim() : null;

    if (internshipId) {
      const intern = await prisma.internship.findUnique({ where: { id: internshipId } });
      if (!intern) {
        return sendError(res, 'NOT_FOUND', 'Referenced internship not found.', 404);
      }
      if (!resolvedTitle) resolvedTitle = intern.title;
      if (!resolvedCompany) resolvedCompany = intern.company;
      if (!resolvedDeadline && intern.deadline) resolvedDeadline = intern.deadline;

      // Prevent duplicate tracker entry for the same internship
      const duplicate = await prisma.application.findFirst({
        where: { userId, internshipId }
      });
      if (duplicate) {
        return sendError(
          res,
          'CONFLICT',
          'This internship is already in your Application Tracker.',
          409
        );
      }
    }

    const details = [];
    if (!resolvedTitle) {
      details.push({ field: 'title', message: 'Role title is required.' });
    }
    if (!resolvedCompany) {
      details.push({ field: 'company', message: 'Company name is required.' });
    }
    if (!VALID_APPLICATION_STATUSES.includes(status)) {
      details.push({
        field: 'status',
        message: `Status must be one of: ${VALID_APPLICATION_STATUSES.join(', ')}`
      });
    }

    if (details.length > 0) {
      return sendError(res, 'VALIDATION_ERROR', 'Check the highlighted fields.', 400, details);
    }

    const resolvedAppliedAt =
      appliedAt
        ? new Date(appliedAt)
        : status === 'Applied'
          ? new Date()
          : null;

    const created = await prisma.application.create({
      data: {
        userId,
        internshipId: internshipId || null,
        title: resolvedTitle,
        company: resolvedCompany,
        status,
        appliedAt: resolvedAppliedAt,
        deadline: resolvedDeadline,
        notes: String(notes || '').trim()
      },
      include: { internship: true }
    });

    const allUserApps = await prisma.application.findMany({ where: { userId } });

    return sendSuccess(
      res,
      {
        application: created,
        stats: computeApplicationStats(allUserApps)
      },
      'Application added to your personal tracker.',
      201
    );
  } catch (err) {
    console.error('Create application error:', err);
    return sendError(res, 'SERVER_ERROR', 'Failed to create application record.', 500);
  }
});

// PATCH /api/applications/:id
router.patch('/:id', requireAuthOrDemo, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, company, status, appliedAt, deadline, notes } = req.body || {};

    const existing = await prisma.application.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'NOT_FOUND', 'Application record not found.', 404);
    }

    // Strict ownership check (Section 10)
    if (existing.userId !== userId) {
      return sendError(res, 'FORBIDDEN', 'You can only edit your own applications.', 403);
    }

    const updateData = {};
    if (title !== undefined) {
      if (!String(title).trim()) {
        return sendError(res, 'VALIDATION_ERROR', 'Role title cannot be empty.', 400);
      }
      updateData.title = String(title).trim();
    }
    if (company !== undefined) {
      if (!String(company).trim()) {
        return sendError(res, 'VALIDATION_ERROR', 'Company name cannot be empty.', 400);
      }
      updateData.company = String(company).trim();
    }
    if (status !== undefined) {
      if (!VALID_APPLICATION_STATUSES.includes(status)) {
        return sendError(res, 'VALIDATION_ERROR', 'Invalid application status.', 400);
      }
      updateData.status = status;
      if (status === 'Applied' && !existing.appliedAt && appliedAt === undefined) {
        updateData.appliedAt = new Date();
      }
    }
    if (appliedAt !== undefined) {
      updateData.appliedAt = appliedAt ? new Date(appliedAt) : null;
    }
    if (deadline !== undefined) {
      updateData.deadline = deadline ? String(deadline).trim() : null;
    }
    if (notes !== undefined) {
      updateData.notes = String(notes).trim();
    }

    const updated = await prisma.application.update({
      where: { id },
      data: updateData,
      include: { internship: true }
    });

    const allUserApps = await prisma.application.findMany({ where: { userId } });

    return sendSuccess(
      res,
      {
        application: updated,
        stats: computeApplicationStats(allUserApps)
      },
      'Application tracker updated. (Note: Updating status here tracks your progress and does not submit an external application.)'
    );
  } catch (err) {
    console.error('Update application error:', err);
    return sendError(res, 'SERVER_ERROR', 'Failed to update application.', 500);
  }
});

// DELETE /api/applications/:id
router.delete('/:id', requireAuthOrDemo, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await prisma.application.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'NOT_FOUND', 'Application record not found.', 404);
    }

    if (existing.userId !== userId) {
      return sendError(res, 'FORBIDDEN', 'You can only delete your own applications.', 403);
    }

    await prisma.application.delete({ where: { id } });
    const allUserApps = await prisma.application.findMany({ where: { userId } });

    return sendSuccess(
      res,
      {
        deletedId: id,
        stats: computeApplicationStats(allUserApps)
      },
      'Application removed from tracker.'
    );
  } catch (err) {
    console.error('Delete application error:', err);
    return sendError(res, 'SERVER_ERROR', 'Failed to delete application.', 500);
  }
});

export default router;
