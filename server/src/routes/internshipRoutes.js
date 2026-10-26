import express from 'express';
import prisma from '../lib/prisma.js';
import { sendSuccess, sendError } from '../lib/response.js';
import { requireAuthOrDemo } from '../middleware/auth.js';
import {
  computeInternshipMatch,
  computeSkillGapsForRole
} from '../services/matchService.js';

const router = express.Router();

function formatInternshipWithMatch(internship, studentSkills, savedIdsSet) {
  const match = computeInternshipMatch(studentSkills, internship.requiredSkills || []);
  const requiredSkills = (internship.requiredSkills || [])
    .filter((r) => r.isRequired)
    .map((r) => ({
      id: r.skill.id,
      name: r.skill.displayName,
      requiredLevel: r.requiredLevel
    }));
  const preferredSkills = (internship.requiredSkills || [])
    .filter((r) => !r.isRequired)
    .map((r) => ({
      id: r.skill.id,
      name: r.skill.displayName,
      requiredLevel: r.requiredLevel
    }));

  return {
    id: internship.id,
    title: internship.title,
    company: internship.company,
    domain: internship.domain,
    description: internship.description,
    responsibilities: internship.responsibilities,
    location: internship.location,
    workMode: internship.workMode,
    experienceLevel: internship.experienceLevel,
    stipend: internship.stipend,
    stipendAmount: internship.stipendAmount,
    duration: internship.duration,
    deadline: internship.deadline,
    applicationUrl: internship.applicationUrl,
    isDemo: Boolean(internship.isDemo),
    isVerified: Boolean(internship.isVerified),
    dataLabel: internship.isDemo ? 'SAMPLE DATA — Seeded Demo Opportunity' : 'Verified Listing',
    isSaved: savedIdsSet.has(internship.id),
    requiredSkills,
    preferredSkills,
    match
  };
}

// GET /api/internships — search, filter, sort
router.get('/internships', requireAuthOrDemo, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      search = '',
      domain = '',
      workMode = '',
      location = '',
      experienceLevel = '',
      minStipend = '',
      savedOnly = '',
      sort = 'match'
    } = req.query || {};

    const [internships, studentSkills, savedRecords] = await Promise.all([
      prisma.internship.findMany({
        include: {
          requiredSkills: {
            include: { skill: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.studentSkill.findMany({
        where: { userId },
        include: { skill: true }
      }),
      prisma.savedInternship.findMany({
        where: { userId }
      })
    ]);

    const savedIdsSet = new Set(savedRecords.map((s) => s.internshipId));

    let items = internships.map((intern) =>
      formatInternshipWithMatch(intern, studentSkills, savedIdsSet)
    );

    // Search across title, role/domain, company, and skill keywords
    const q = String(search || '').trim().toLowerCase();
    if (q) {
      items = items.filter((item) => {
        const inTitle = item.title.toLowerCase().includes(q);
        const inCompany = item.company.toLowerCase().includes(q);
        const inDomain = item.domain.toLowerCase().includes(q);
        const inDesc = item.description.toLowerCase().includes(q);
        const inSkills =
          item.requiredSkills.some((s) => s.name.toLowerCase().includes(q)) ||
          item.preferredSkills.some((s) => s.name.toLowerCase().includes(q));
        return inTitle || inCompany || inDomain || inDesc || inSkills;
      });
    }

    if (domain && domain !== 'All') {
      items = items.filter(
        (item) => item.domain.toLowerCase() === String(domain).trim().toLowerCase()
      );
    }

    if (workMode && workMode !== 'All') {
      items = items.filter(
        (item) => item.workMode.toLowerCase() === String(workMode).trim().toLowerCase()
      );
    }

    if (location && location !== 'All') {
      const locQ = String(location).trim().toLowerCase();
      items = items.filter((item) => item.location.toLowerCase().includes(locQ));
    }

    if (experienceLevel && experienceLevel !== 'All') {
      items = items.filter(
        (item) =>
          item.experienceLevel.toLowerCase() === String(experienceLevel).trim().toLowerCase()
      );
    }

    if (minStipend && !Number.isNaN(Number(minStipend))) {
      const minVal = Number(minStipend);
      items = items.filter((item) => (item.stipendAmount ?? 0) >= minVal);
    }

    if (savedOnly === 'true') {
      items = items.filter((item) => item.isSaved);
    }

    // Sorting: match score (default), title, or stipend
    if (sort === 'title') {
      items.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'stipend') {
      items.sort((a, b) => (b.stipendAmount ?? -1) - (a.stipendAmount ?? -1));
    } else {
      items.sort((a, b) => (b.match.score ?? -1) - (a.match.score ?? -1));
    }

    const filterMeta = {
      domains: ['Frontend', 'Backend', 'Full-Stack', 'Python', 'Data Analyst', 'beginner ML', 'UI/UX'],
      workModes: ['Remote', 'Hybrid', 'On-site'],
      experienceLevels: ['Beginner', 'Intermediate'],
      locations: ['Remote', 'Bengaluru', 'Hyderabad', 'Pune', 'Mumbai', 'Chennai', 'Delhi NCR']
    };

    return sendSuccess(
      res,
      {
        internships: items,
        total: items.length,
        activeSort: sort,
        hasUserSkills: studentSkills.length > 0,
        filterMeta
      },
      'Internships loaded.'
    );
  } catch (err) {
    console.error('List internships error:', err);
    return sendError(res, 'SERVER_ERROR', 'Failed to load internships.', 500);
  }
});

// GET /api/internships/:id — opportunity details & match analysis
router.get('/internships/:id', requireAuthOrDemo, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [internship, studentSkills, savedRecord, existingApplication] = await Promise.all([
      prisma.internship.findUnique({
        where: { id },
        include: {
          requiredSkills: {
            include: { skill: true }
          }
        }
      }),
      prisma.studentSkill.findMany({
        where: { userId },
        include: { skill: true }
      }),
      prisma.savedInternship.findUnique({
        where: {
          userId_internshipId: {
            userId,
            internshipId: id
          }
        }
      }),
      prisma.application.findFirst({
        where: { userId, internshipId: id }
      })
    ]);

    if (!internship) {
      return sendError(res, 'NOT_FOUND', 'Internship listing not found.', 404);
    }

    const savedSet = new Set(savedRecord ? [id] : []);
    const formatted = formatInternshipWithMatch(internship, studentSkills, savedSet);

    return sendSuccess(
      res,
      {
        internship: {
          ...formatted,
          existingApplication: existingApplication || null
        }
      },
      'Internship details loaded.'
    );
  } catch (err) {
    console.error('Get internship detail error:', err);
    return sendError(res, 'SERVER_ERROR', 'Failed to load internship details.', 500);
  }
});

// POST /api/internships/:id/save — toggle save/unsave opportunity
router.post('/internships/:id/save', requireAuthOrDemo, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const internship = await prisma.internship.findUnique({ where: { id } });
    if (!internship) {
      return sendError(res, 'NOT_FOUND', 'Internship not found.', 404);
    }

    const existing = await prisma.savedInternship.findUnique({
      where: {
        userId_internshipId: {
          userId,
          internshipId: id
        }
      }
    });

    let isSaved = false;
    if (existing) {
      await prisma.savedInternship.delete({ where: { id: existing.id } });
      isSaved = false;
    } else {
      await prisma.savedInternship.create({
        data: { userId, internshipId: id }
      });
      isSaved = true;
    }

    return sendSuccess(
      res,
      { internshipId: id, isSaved },
      isSaved ? 'Internship saved to your shortlist.' : 'Internship removed from saved list.'
    );
  } catch (err) {
    console.error('Save internship error:', err);
    return sendError(res, 'SERVER_ERROR', 'Failed to update saved state.', 500);
  }
});

// POST /api/matches/:internshipId — compute explainable skill match
router.post('/matches/:internshipId', requireAuthOrDemo, async (req, res) => {
  try {
    const userId = req.user.id;
    const { internshipId } = req.params;

    const [internship, studentSkills] = await Promise.all([
      prisma.internship.findUnique({
        where: { id: internshipId },
        include: {
          requiredSkills: {
            include: { skill: true }
          }
        }
      }),
      prisma.studentSkill.findMany({
        where: { userId },
        include: { skill: true }
      })
    ]);

    if (!internship) {
      return sendError(res, 'NOT_FOUND', 'Internship not found.', 404);
    }

    const match = computeInternshipMatch(studentSkills, internship.requiredSkills);

    return sendSuccess(
      res,
      {
        internshipId: internship.id,
        title: internship.title,
        company: internship.company,
        match
      },
      'Skill match computed.'
    );
  } catch (err) {
    console.error('Compute match error:', err);
    return sendError(res, 'SERVER_ERROR', 'Failed to compute skill match.', 500);
  }
});

// GET /api/skill-gaps?role=... — compare role requirements and student skills
router.get('/skill-gaps', requireAuthOrDemo, async (req, res) => {
  try {
    const userId = req.user.id;
    const [profile, studentSkills] = await Promise.all([
      prisma.studentProfile.findUnique({ where: { userId } }),
      prisma.studentSkill.findMany({
        where: { userId },
        include: { skill: true }
      })
    ]);

    const roleToAnalyze = req.query.role || profile?.targetRole || 'Frontend';
    const analysis = computeSkillGapsForRole(roleToAnalyze, studentSkills);

    return sendSuccess(
      res,
      {
        ...analysis,
        userTargetRole: profile?.targetRole || '',
        studentSkills: studentSkills.map((s) => ({
          id: s.id,
          skillId: s.skillId,
          name: s.skill.displayName,
          proficiency: s.proficiency,
          status: s.status
        }))
      },
      'Skill-gap analysis computed.'
    );
  } catch (err) {
    console.error('Skill gaps error:', err);
    return sendError(res, 'SERVER_ERROR', 'Failed to compute skill gaps.', 500);
  }
});

export default router;
