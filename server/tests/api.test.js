import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/lib/prisma.js';
import { runSeed } from '../prisma/seed.js';
import {
  computeInternshipMatch,
  computeSkillGapsForRole
} from '../src/services/matchService.js';

describe('SkillBridge AI — Unit & Integration Verification Suite', () => {
  before(async () => {
    await runSeed(prisma);
    // Clean up any test users from previous runs
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['usera@test.local', 'userb@test.local']
        }
      }
    });
  });

  after(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['usera@test.local', 'userb@test.local']
        }
      }
    });
    await prisma.$disconnect();
  });

  describe('1. Match Engine Deterministic Rules & Edge Cases (Section 6.1)', () => {
    it('calculates exact 75% match when student has HTML, CSS, JavaScript for a role requiring HTML, CSS, JavaScript, React', () => {
      const studentSkills = [
        { name: 'HTML', proficiency: 'Intermediate' },
        { name: 'css', proficiency: 'Intermediate' },
        { name: '  JavaScript ', proficiency: 'Beginner' }
      ];
      const internshipSkills = [
        { name: 'HTML', isRequired: true },
        { name: 'CSS', isRequired: true },
        { name: 'JavaScript', isRequired: true },
        { name: 'React', isRequired: true },
        { name: 'Tailwind CSS', isRequired: false }
      ];

      const result = computeInternshipMatch(studentSkills, internshipSkills);
      assert.equal(result.score, 75);
      assert.equal(result.status, 'CALCULATED');
      assert.equal(result.matchedCount, 3);
      assert.equal(result.totalRequired, 4);
      assert.equal(result.missingRequired.length, 1);
      assert.equal(result.missingRequired[0].name, 'React');
      assert.equal(result.missingPreferred.length, 1);
      assert.equal(result.missingPreferred[0].name, 'Tailwind CSS');
    });

    it('handles edge case: internship with zero required skills without dividing by zero', () => {
      const studentSkills = [{ name: 'HTML', proficiency: 'Beginner' }];
      const internshipSkills = [{ name: 'Git', isRequired: false }];

      const result = computeInternshipMatch(studentSkills, internshipSkills);
      assert.equal(result.score, null);
      assert.equal(result.status, 'NO_REQUIREMENTS');
      assert.match(result.explanation, /Not enough requirements to calculate a score/i);
    });

    it('handles edge case: student with zero listed skills prompts profile completion', () => {
      const studentSkills = [];
      const internshipSkills = [
        { name: 'Python', isRequired: true },
        { name: 'SQL', isRequired: true }
      ];

      const result = computeInternshipMatch(studentSkills, internshipSkills);
      assert.equal(result.score, null);
      assert.equal(result.status, 'NO_PROFILE_SKILLS');
      assert.equal(result.hasUserSkills, false);
    });

    it('computes skill-gap analysis priorities and missing skills accurately', () => {
      const studentSkills = [
        { name: 'HTML', proficiency: 'Intermediate' },
        { name: 'CSS', proficiency: 'Intermediate' }
      ];
      const gaps = computeSkillGapsForRole('Frontend', studentSkills);
      assert.equal(gaps.hasRole, true);
      assert.equal(gaps.matchedCount, 2);
      assert.ok(gaps.missingSkills.some((m) => m.name === 'React'));
    });
  });

  describe('2. Server Health & Demo Mode Journey (Section 11 & 12)', () => {
    it('GET /api/health returns 200 OK', async () => {
      const res = await request(app).get('/api/health');
      assert.equal(res.status, 200);
      assert.equal(res.body.data.status, 'ok');
    });

    it('Judge can access Demo dashboard, internships, match, roadmap, and reset without credentials', async () => {
      // Reset demo first to ensure clean starting state
      const resetRes = await request(app).post('/api/auth/demo-reset');
      assert.equal(resetRes.status, 200);

      // Dashboard summary in demo mode
      const dashRes = await request(app)
        .get('/api/dashboard/summary')
        .set('X-Demo-Mode', 'true');
      assert.equal(dashRes.status, 200);
      assert.equal(dashRes.body.data.user.isDemo, true);
      assert.match(dashRes.body.data.user.dataLabel, /DEMO PROFILE/i);

      // Internship match for Frontend Web Developer Intern (HTML, CSS, JS vs HTML, CSS, JS, React = 75%)
      const matchRes = await request(app)
        .post('/api/matches/demo-intern-frontend-1')
        .set('X-Demo-Mode', 'true');
      assert.equal(matchRes.status, 200);
      assert.equal(matchRes.body.data.match.score, 75);

      // Generate roadmap without Gemini API key (rule-based fallback)
      const roadmapRes = await request(app)
        .post('/api/roadmap/generate')
        .set('X-Demo-Mode', 'true')
        .send({ targetRole: 'Frontend', weeklyHours: 6 });
      assert.equal(roadmapRes.status, 201);
      assert.equal(roadmapRes.body.data.roadmap.source, 'rule-based');
      assert.ok(roadmapRes.body.data.roadmap.steps.length >= 3);

      // Complete a roadmap step and verify progress updates
      const firstStepId = roadmapRes.body.data.roadmap.steps[0].id;
      const stepPatch = await request(app)
        .patch(`/api/roadmap/steps/${firstStepId}`)
        .set('X-Demo-Mode', 'true')
        .send({ completed: true });
      assert.equal(stepPatch.status, 200);
      assert.ok(stepPatch.body.data.roadmap.progressPercentage > 0);
    });
  });

  describe('3. Authentication, Profile Persistence & Cross-User Authorization (Section 10 & 12)', () => {
    let agentA;
    let agentB;
    let userAAppId;

    it('registers User A and User B, hashes passwords, and blocks unauthenticated access', async () => {
      const unauthRes = await request(app).get('/api/profile');
      assert.equal(unauthRes.status, 401);

      agentA = request.agent(app);
      const regA = await agentA.post('/api/auth/register').send({
        name: 'Student Alpha',
        email: 'usera@test.local',
        password: 'password123',
        confirmPassword: 'password123'
      });
      assert.equal(regA.status, 201);
      assert.equal(regA.body.data.user.email, 'usera@test.local');

      agentB = request.agent(app);
      const regB = await agentB.post('/api/auth/register').send({
        name: 'Student Beta',
        email: 'userb@test.local',
        password: 'password123',
        confirmPassword: 'password123'
      });
      assert.equal(regB.status, 201);
    });

    it('persists User A profile skills and updates matching score accordingly', async () => {
      const updateRes = await agentA.put('/api/profile').send({
        college: 'Test Engineering College',
        course: 'B.Tech IT',
        studyYear: '3rd Year',
        targetRole: 'Frontend',
        workMode: 'Remote',
        weeklyHours: 8,
        onboarded: true,
        skills: [
          { name: 'HTML', proficiency: 'Advanced', status: 'Completed' },
          { name: 'CSS', proficiency: 'Intermediate', status: 'Completed' },
          { name: 'JavaScript', proficiency: 'Intermediate', status: 'Active' },
          { name: 'React', proficiency: 'Beginner', status: 'Learning' }
        ]
      });
      assert.equal(updateRes.status, 200);
      assert.equal(updateRes.body.data.skills.length, 4);

      // Now User A should match 100% on demo-intern-frontend-1 (HTML, CSS, JS, React)
      const matchRes = await agentA.post('/api/matches/demo-intern-frontend-1');
      assert.equal(matchRes.status, 200);
      assert.equal(matchRes.body.data.match.score, 100);
    });

    it('enforces record ownership: User B cannot edit or delete User A applications', async () => {
      const createApp = await agentA.post('/api/applications').send({
        title: 'Frontend Intern',
        company: 'Acme Corp',
        status: 'Applied',
        notes: 'User A private application'
      });
      assert.equal(createApp.status, 201);
      userAAppId = createApp.body.data.application.id;

      // User B tries to PATCH User A's application -> 403 Forbidden
      const forbiddenPatch = await agentB
        .patch(`/api/applications/${userAAppId}`)
        .send({ status: 'Rejected' });
      assert.equal(forbiddenPatch.status, 403);

      // User B tries to DELETE User A's application -> 403 Forbidden
      const forbiddenDelete = await agentB.delete(`/api/applications/${userAAppId}`);
      assert.equal(forbiddenDelete.status, 403);
    });
  });
});
