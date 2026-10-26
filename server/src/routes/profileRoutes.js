import express from 'express';
import prisma from '../lib/prisma.js';
import { sendSuccess, sendError } from '../lib/response.js';
import { requireAuthOrDemo } from '../middleware/auth.js';
import { computeProfileCompletion } from '../services/profileService.js';
import { normalizeSkillName, ROLE_REQUIREMENTS } from '../services/matchService.js';

const router = express.Router();

const VALID_PROFICIENCIES = ['Beginner', 'Intermediate', 'Advanced'];
const VALID_SKILL_STATUSES = ['Active', 'Learning', 'Completed'];

async function ensureSkillCatalogItem(rawName) {
  const cleanDisplay = String(rawName || '').trim();
  const norm = normalizeSkillName(cleanDisplay);
  if (!norm) return null;

  let skill = await prisma.skill.findUnique({ where: { name: norm } });
  if (!skill) {
    skill = await prisma.skill.create({
      data: {
        name: norm,
        displayName: cleanDisplay,
        category: 'Custom'
      }
    });
  }
  return skill;
}

router.get('/', requireAuthOrDemo, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true,
        skills: {
          include: { skill: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!user) {
      return sendError(res, 'NOT_FOUND', 'User profile not found.', 404);
    }

    const catalog = await prisma.skill.findMany({
      orderBy: [{ category: 'asc' }, { displayName: 'asc' }]
    });

    const formattedSkills = user.skills.map((s) => ({
      id: s.id,
      skillId: s.skillId,
      name: s.skill.displayName,
      category: s.skill.category,
      proficiency: s.proficiency,
      status: s.status
    }));

    const completion = computeProfileCompletion(user, user.profile, formattedSkills);

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isDemo: Boolean(user.isDemo),
          dataLabel: user.isDemo ? 'DEMO PROFILE — sample data, not a real student' : null
        },
        profile: user.profile,
        skills: formattedSkills,
        completion,
        catalog: catalog.map((c) => ({
          id: c.id,
          name: c.displayName,
          category: c.category
        })),
        availableRoles: Object.keys(ROLE_REQUIREMENTS)
      },
      'Profile fetched.'
    );
  } catch (err) {
    console.error('Get profile error:', err);
    return sendError(res, 'SERVER_ERROR', 'Failed to load profile.', 500);
  }
});

router.put('/', requireAuthOrDemo, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      college,
      course,
      studyYear,
      targetRole,
      workMode,
      location,
      weeklyHours,
      resumeUrl,
      onboarded,
      skills
    } = req.body || {};

    const details = [];
    if (name !== undefined && String(name).trim().length < 2) {
      details.push({ field: 'name', message: 'Name must be at least 2 characters.' });
    }
    if (weeklyHours !== undefined) {
      const hrs = Number(weeklyHours);
      if (Number.isNaN(hrs) || hrs < 1 || hrs > 60) {
        details.push({ field: 'weeklyHours', message: 'Weekly hours must be between 1 and 60.' });
      }
    }
    if (resumeUrl && String(resumeUrl).trim() !== '') {
      const urlStr = String(resumeUrl).trim();
      if (!/^https?:\/\/.+/i.test(urlStr)) {
        details.push({ field: 'resumeUrl', message: 'Resume URL must start with http:// or https://' });
      }
    }

    if (details.length > 0) {
      return sendError(res, 'VALIDATION_ERROR', 'Check the highlighted fields.', 400, details);
    }

    if (name !== undefined && !req.user.isDemo) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: String(name).trim() }
      });
    } else if (name !== undefined && req.user.isDemo) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: String(name).trim() }
      });
    }

    const profileUpdateData = {};
    if (college !== undefined) profileUpdateData.college = String(college).trim();
    if (course !== undefined) profileUpdateData.course = String(course).trim();
    if (studyYear !== undefined) profileUpdateData.studyYear = String(studyYear).trim();
    if (targetRole !== undefined) profileUpdateData.targetRole = String(targetRole).trim();
    if (workMode !== undefined) profileUpdateData.workMode = String(workMode).trim();
    if (location !== undefined) profileUpdateData.location = String(location).trim();
    if (weeklyHours !== undefined) profileUpdateData.weeklyHours = Number(weeklyHours);
    if (resumeUrl !== undefined) profileUpdateData.resumeUrl = String(resumeUrl).trim();
    if (onboarded !== undefined) profileUpdateData.onboarded = Boolean(onboarded);

    await prisma.studentProfile.upsert({
      where: { userId },
      update: profileUpdateData,
      create: {
        userId,
        ...profileUpdateData
      }
    });

    // If skills array is provided, synchronize the user's skills
    if (Array.isArray(skills)) {
      const resolvedSkills = [];
      for (const item of skills) {
        const rawName = typeof item === 'string' ? item : item?.name;
        const skillRecord = await ensureSkillCatalogItem(rawName);
        if (!skillRecord) continue;

        const proficiency = VALID_PROFICIENCIES.includes(item?.proficiency)
          ? item.proficiency
          : 'Beginner';
        const status = VALID_SKILL_STATUSES.includes(item?.status)
          ? item.status
          : 'Active';

        resolvedSkills.push({
          skillId: skillRecord.id,
          proficiency,
          status
        });
      }

      // Deduplicate by skillId
      const uniqueBySkillId = new Map();
      for (const rs of resolvedSkills) {
        uniqueBySkillId.set(rs.skillId, rs);
      }

      await prisma.studentSkill.deleteMany({ where: { userId } });
      for (const rs of uniqueBySkillId.values()) {
        await prisma.studentSkill.create({
          data: {
            userId,
            skillId: rs.skillId,
            proficiency: rs.proficiency,
            status: rs.status
          }
        });
      }
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        skills: { include: { skill: true }, orderBy: { createdAt: 'asc' } }
      }
    });

    const formattedSkills = updatedUser.skills.map((s) => ({
      id: s.id,
      skillId: s.skillId,
      name: s.skill.displayName,
      category: s.skill.category,
      proficiency: s.proficiency,
      status: s.status
    }));

    const completion = computeProfileCompletion(updatedUser, updatedUser.profile, formattedSkills);

    return sendSuccess(
      res,
      {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          isDemo: Boolean(updatedUser.isDemo),
          dataLabel: updatedUser.isDemo ? 'DEMO PROFILE — sample data, not a real student' : null,
          onboarded: Boolean(updatedUser.profile?.onboarded)
        },
        profile: updatedUser.profile,
        skills: formattedSkills,
        completion
      },
      'Profile updated'
    );
  } catch (err) {
    console.error('Update profile error:', err);
    return sendError(res, 'SERVER_ERROR', 'Failed to update profile.', 500);
  }
});

// Quick action for Skill-Gap Analyzer to mark a skill as Learning or Completed (Section 4.7)
router.post('/skills/status', requireAuthOrDemo, async (req, res) => {
  try {
    const userId = req.user.id;
    const { skillName, status, proficiency } = req.body || {};

    if (!skillName || !String(skillName).trim()) {
      return sendError(res, 'VALIDATION_ERROR', 'Skill name is required.', 400);
    }

    const skillRecord = await ensureSkillCatalogItem(skillName);
    if (!skillRecord) {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid skill name.', 400);
    }

    if (status === 'Remove') {
      await prisma.studentSkill.deleteMany({
        where: { userId, skillId: skillRecord.id }
      });
    } else {
      const nextStatus = VALID_SKILL_STATUSES.includes(status) ? status : 'Learning';
      const nextProf = VALID_PROFICIENCIES.includes(proficiency) ? proficiency : 'Beginner';

      await prisma.studentSkill.upsert({
        where: {
          userId_skillId: {
            userId,
            skillId: skillRecord.id
          }
        },
        update: {
          status: nextStatus,
          ...(proficiency ? { proficiency: nextProf } : {})
        },
        create: {
          userId,
          skillId: skillRecord.id,
          proficiency: nextProf,
          status: nextStatus
        }
      });
    }

    const updatedSkills = await prisma.studentSkill.findMany({
      where: { userId },
      include: { skill: true },
      orderBy: { createdAt: 'asc' }
    });

    return sendSuccess(
      res,
      {
        skills: updatedSkills.map((s) => ({
          id: s.id,
          skillId: s.skillId,
          name: s.skill.displayName,
          category: s.skill.category,
          proficiency: s.proficiency,
          status: s.status
        }))
      },
      `Skill "${skillRecord.displayName}" updated.`
    );
  } catch (err) {
    console.error('Skill status update error:', err);
    return sendError(res, 'SERVER_ERROR', 'Failed to update skill status.', 500);
  }
});

export default router;
