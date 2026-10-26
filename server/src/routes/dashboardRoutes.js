import express from 'express';
import prisma from '../lib/prisma.js';
import { sendSuccess, sendError } from '../lib/response.js';
import { requireAuthOrDemo } from '../middleware/auth.js';
import { computeProfileCompletion } from '../services/profileService.js';
import {
  computeInternshipMatch,
  computeSkillGapsForRole
} from '../services/matchService.js';
import { formatRoadmapWithProgress } from '../services/roadmapService.js';

const router = express.Router();

router.get('/summary', requireAuthOrDemo, async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      user,
      studentSkills,
      savedInternships,
      applications,
      roadmap,
      allInternships
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
      }),
      prisma.studentSkill.findMany({
        where: { userId },
        include: { skill: true }
      }),
      prisma.savedInternship.findMany({
        where: { userId },
        include: { internship: true }
      }),
      prisma.application.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.learningRoadmap.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { steps: { orderBy: { sequence: 'asc' } } }
      }),
      prisma.internship.findMany({
        include: {
          requiredSkills: { include: { skill: true } }
        }
      })
    ]);

    if (!user) {
      return sendError(res, 'NOT_FOUND', 'User not found.', 404);
    }

    const formattedSkills = studentSkills.map((s) => ({
      id: s.id,
      skillId: s.skillId,
      name: s.skill.displayName,
      category: s.skill.category,
      proficiency: s.proficiency,
      status: s.status
    }));

    const completion = computeProfileCompletion(user, user.profile, formattedSkills);
    const savedSet = new Set(savedInternships.map((s) => s.internshipId));

    // Compute match scores for all internships and recommend top 4
    const scoredInternships = allInternships
      .map((intern) => {
        const match = computeInternshipMatch(studentSkills, intern.requiredSkills);
        return {
          id: intern.id,
          title: intern.title,
          company: intern.company,
          domain: intern.domain,
          location: intern.location,
          workMode: intern.workMode,
          stipend: intern.stipend,
          duration: intern.duration,
          deadline: intern.deadline,
          isDemo: intern.isDemo,
          dataLabel: intern.isDemo ? 'SAMPLE DATA' : 'Verified',
          isSaved: savedSet.has(intern.id),
          requiredSkills: intern.requiredSkills
            .filter((r) => r.isRequired)
            .map((r) => r.skill.displayName),
          match
        };
      })
      .filter((item) => item.match.status !== 'NO_REQUIREMENTS')
      .sort((a, b) => {
        const targetRole = (user.profile?.targetRole || '').toLowerCase();
        const aRoleMatch = a.domain.toLowerCase() === targetRole ? 1 : 0;
        const bRoleMatch = b.domain.toLowerCase() === targetRole ? 1 : 0;
        if (bRoleMatch !== aRoleMatch) return bRoleMatch - aRoleMatch;
        return (b.match.score ?? -1) - (a.match.score ?? -1);
      })
      .slice(0, 4);

    // Skill readiness for target role
    const targetRole = user.profile?.targetRole || 'Frontend';
    const skillReadiness = computeSkillGapsForRole(targetRole, studentSkills);

    // Roadmap summary & next incomplete step
    const formattedRoadmap = formatRoadmapWithProgress(roadmap);

    // Application counts by status
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
    const activeApplicationsCount =
      countsByStatus.Interested +
      countsByStatus.Applied +
      countsByStatus.Interview +
      countsByStatus.Offer;

    // Rule-based Next Action determination (Section 4.4)
    let nextAction = null;
    if (formattedSkills.length === 0) {
      nextAction = {
        title: 'Add your current skills to unlock match scores',
        description: 'Your profile has no skills listed yet. Add HTML, Python, SQL, or other skills to compute personalized internship match scores.',
        ctaLabel: 'Add Skills in Profile',
        ctaPath: '/app/profile'
      };
    } else if (!user.profile?.targetRole) {
      nextAction = {
        title: 'Select your target internship role',
        description: 'Choose Frontend, Backend, Full-Stack, Python, Data Analyst, ML, or UI/UX to see your skill-gap breakdown.',
        ctaLabel: 'Set Target Role',
        ctaPath: '/app/profile'
      };
    } else if (!formattedRoadmap) {
      nextAction = {
        title: `Generate your ${targetRole} Career Roadmap`,
        description: `Turn your ${skillReadiness.missingCount} missing role skills into a week-by-week action plan.`,
        ctaLabel: 'Generate My Roadmap',
        ctaPath: '/app/roadmap'
      };
    } else if (formattedRoadmap.nextStep) {
      nextAction = {
        title: `Continue Roadmap: ${formattedRoadmap.nextStep.title}`,
        description: formattedRoadmap.nextStep.objective,
        ctaLabel: 'Open Career Roadmap',
        ctaPath: '/app/roadmap'
      };
    } else if (applications.length === 0) {
      nextAction = {
        title: 'Shortlist and track your first internship',
        description: 'Explore matching internships and add an opportunity to your personal Application Tracker.',
        ctaLabel: 'Explore Internships',
        ctaPath: '/app/internships'
      };
    } else {
      nextAction = {
        title: 'Review your active internship applications',
        description: `You have ${activeApplicationsCount} active opportunity in your tracker. Keep notes and deadlines updated.`,
        ctaLabel: 'Open Application Tracker',
        ctaPath: '/app/applications'
      };
    }

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isDemo: Boolean(user.isDemo),
          dataLabel: user.isDemo ? 'DEMO PROFILE — sample data, not a real student' : null,
          targetRole: user.profile?.targetRole || '',
          college: user.profile?.college || '',
          studyYear: user.profile?.studyYear || '',
          workMode: user.profile?.workMode || 'Remote or Hybrid',
          weeklyHours: user.profile?.weeklyHours || 5
        },
        completion,
        quickStats: {
          savedInternshipsCount: savedInternships.length,
          activeApplicationsCount,
          totalApplicationsCount: applications.length,
          roadmapProgressPercentage: formattedRoadmap ? formattedRoadmap.progressPercentage : 0,
          roadmapCompletedSteps: formattedRoadmap ? formattedRoadmap.completedSteps : 0,
          roadmapTotalSteps: formattedRoadmap ? formattedRoadmap.totalSteps : 0
        },
        recommendedInternships: scoredInternships,
        skillReadiness,
        roadmap: formattedRoadmap,
        applicationSummary: {
          countsByStatus,
          activeApplicationsCount,
          total: applications.length,
          recentItems: applications.slice(0, 4)
        },
        nextAction
      },
      'Dashboard summary loaded.'
    );
  } catch (err) {
    console.error('Dashboard summary error:', err);
    return sendError(res, 'SERVER_ERROR', 'Failed to load dashboard summary.', 500);
  }
});

export default router;
