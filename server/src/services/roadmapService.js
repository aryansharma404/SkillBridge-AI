/**
 * Roadmap Generation Service (Section 6.2 & 6.3)
 * - Uses deterministic rule-based generator by default.
 * - If GEMINI_API_KEY is configured on the server, attempts a structured Gemini API call
 *   with timeout and schema validation, falling back gracefully to rule-based generation.
 * - Never claims an AI call occurred when rule-based fallback ran.
 */

import { ROLE_REQUIREMENTS, normalizeSkillName } from './matchService.js';

export function buildRuleBasedSteps({ targetRole, studentSkills = [], weeklyHours = 5, previousSteps = [] }) {
  const roleKey =
    Object.keys(ROLE_REQUIREMENTS).find(
      (k) => k.toLowerCase() === String(targetRole || '').trim().toLowerCase()
    ) || 'Frontend';

  const roleSpec = ROLE_REQUIREMENTS[roleKey];
  const hours = Math.max(2, Math.min(40, Number(weeklyHours) || 5));

  const userSkillMap = new Map();
  for (const s of studentSkills) {
    const name = s.skill?.displayName || s.skill?.name || s.name || '';
    const norm = normalizeSkillName(name);
    if (norm) {
      userSkillMap.set(norm, {
        name,
        proficiency: s.proficiency || 'Beginner',
        status: s.status || 'Active'
      });
    }
  }

  // Preserve completed steps by normalized title if regenerating
  const completedTitleMap = new Map();
  for (const prev of previousSteps) {
    if (prev.completedAt) {
      completedTitleMap.set(prev.title.toLowerCase().trim(), prev.completedAt);
    }
  }

  const steps = [];
  let seq = 1;

  // 1. Beginner existing skills that need strengthening
  const beginnerExisting = roleSpec.requiredSkills.filter((req) => {
    const u = userSkillMap.get(normalizeSkillName(req.name));
    return u && u.proficiency === 'Beginner';
  });

  if (beginnerExisting.length > 0) {
    const focus = beginnerExisting[0];
    const title = `Week ${seq}: Strengthen ${focus.name} Fundamentals`;
    steps.push({
      sequence: seq,
      title,
      objective: `Move your ${focus.name} proficiency from Beginner to Intermediate for ${roleSpec.label} roles.`,
      task: focus.projectSuggestion,
      estimatedHours: hours,
      completedAt: completedTitleMap.get(title.toLowerCase()) || null
    });
    seq++;
  }

  // 2. Missing required skills in prerequisite sequence order
  const missingRequired = roleSpec.requiredSkills.filter(
    (req) => !userSkillMap.has(normalizeSkillName(req.name))
  );

  for (const missing of missingRequired) {
    const title = `Week ${seq}: Learn ${missing.name} (${missing.priority} Priority)`;
    steps.push({
      sequence: seq,
      title,
      objective: `Close the required ${missing.name} skill gap for ${roleSpec.label} internships.`,
      task: missing.projectSuggestion,
      estimatedHours: hours,
      completedAt: completedTitleMap.get(title.toLowerCase()) || null
    });
    seq++;
  }

  // 3. Preferred skill enrichment if plan is short
  if (steps.length < 3 && roleSpec.preferredSkills.length > 0) {
    const missingPref = roleSpec.preferredSkills.find(
      (p) => !userSkillMap.has(normalizeSkillName(p))
    );
    if (missingPref) {
      const title = `Week ${seq}: Bonus Differentiator — ${missingPref}`;
      steps.push({
        sequence: seq,
        title,
        objective: `Add ${missingPref} as a preferred skill to stand out in ${roleSpec.label} applications.`,
        task: `Integrate ${missingPref} into your practice project and document it in your portfolio.`,
        estimatedHours: hours,
        completedAt: completedTitleMap.get(title.toLowerCase()) || null
      });
      seq++;
    }
  }

  // 4. Final capstone & application readiness step
  const capstoneTitle = `Week ${seq}: ${roleSpec.label} Capstone & Application Readiness`;
  steps.push({
    sequence: seq,
    title: capstoneTitle,
    objective: `Combine your ${roleSpec.label} skills into a clean, verifiable project for internship reviewers.`,
    task: `Publish your project code with a clear README, update your SkillBridge profile skills, and shortlist 3 matching internships.`,
    estimatedHours: hours,
    completedAt: completedTitleMap.get(capstoneTitle.toLowerCase()) || null
  });

  return {
    targetRole: roleSpec.role,
    source: 'rule-based',
    steps
  };
}

async function tryGeminiGeneration({ targetRole, studentSkills, weeklyHours }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6500);

  try {
    const existingNames = studentSkills.map(
      (s) => `${s.skill?.displayName || s.name} (${s.proficiency || 'Beginner'})`
    );

    const prompt = `You are a practical student career mentor. Create a 4 to 5 step weekly learning roadmap for a college student targeting "${targetRole}" internships.
Student's current skills: ${existingNames.length ? existingNames.join(', ') : 'None yet'}.
Available study time: ${weeklyHours || 5} hours per week.
Return ONLY valid JSON matching this schema:
{
  "steps": [
    {
      "sequence": 1,
      "title": "Week 1: ...",
      "objective": "...",
      "task": "...",
      "estimatedHours": 5
    }
  ]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText);
    if (!Array.isArray(parsed?.steps) || parsed.steps.length === 0) {
      return null;
    }

    const validSteps = parsed.steps
      .slice(0, 6)
      .map((s, idx) => ({
        sequence: idx + 1,
        title: String(s.title || `Week ${idx + 1}`).slice(0, 140),
        objective: String(s.objective || '').slice(0, 300),
        task: String(s.task || '').slice(0, 400),
        estimatedHours: Math.max(1, Math.min(40, Number(s.estimatedHours) || Number(weeklyHours) || 5)),
        completedAt: null
      }))
      .filter((s) => s.title && s.objective && s.task);

    if (validSteps.length === 0) return null;

    return {
      targetRole,
      source: 'ai-assisted',
      steps: validSteps
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateRoadmapPlan({ targetRole, studentSkills = [], weeklyHours = 5, previousSteps = [] }) {
  const aiResult = await tryGeminiGeneration({ targetRole, studentSkills, weeklyHours });
  if (aiResult) {
    return aiResult;
  }
  return buildRuleBasedSteps({ targetRole, studentSkills, weeklyHours, previousSteps });
}

export function formatRoadmapWithProgress(roadmap) {
  if (!roadmap) {
    return null;
  }
  const steps = Array.isArray(roadmap.steps)
    ? [...roadmap.steps].sort((a, b) => a.sequence - b.sequence)
    : [];
  const totalSteps = steps.length;
  const completedSteps = steps.filter((s) => Boolean(s.completedAt)).length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const nextStep = steps.find((s) => !s.completedAt) || null;

  return {
    ...roadmap,
    steps,
    totalSteps,
    completedSteps,
    progressPercentage,
    nextStep
  };
}
