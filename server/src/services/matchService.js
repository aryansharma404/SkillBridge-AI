/**
 * Role requirements and deterministic match & skill-gap service.
 * Follows Section 6 of the SkillBridge AI Structural Blueprint:
 * Match Score = (Number of matched required skills / Total required skills) * 100
 */

export const ROLE_REQUIREMENTS = {
  Frontend: {
    role: 'Frontend',
    label: 'Frontend Developer',
    description: 'Build responsive, accessible user interfaces and interactive web applications.',
    requiredSkills: [
      { name: 'HTML', priority: 'High', sequence: 1, projectSuggestion: 'Build a semantic, accessible personal portfolio layout with landmark regions.' },
      { name: 'CSS', priority: 'High', sequence: 2, projectSuggestion: 'Create a responsive multi-column dashboard grid using Flexbox and CSS Grid.' },
      { name: 'JavaScript', priority: 'High', sequence: 3, projectSuggestion: 'Build an interactive filterable list and modal component using vanilla ES6+.' },
      { name: 'React', priority: 'High', sequence: 4, projectSuggestion: 'Build an Internship Bookmark Manager with stateful filters and component props.' },
      { name: 'Git', priority: 'Medium', sequence: 5, projectSuggestion: 'Version your project on GitHub with feature branches and a clear README.' },
      { name: 'REST APIs', priority: 'Medium', sequence: 6, projectSuggestion: 'Connect your React app to an API with loading skeletons and error boundaries.' }
    ],
    preferredSkills: ['Tailwind CSS', 'TypeScript', 'Unit Testing']
  },
  Backend: {
    role: 'Backend',
    label: 'Backend Developer',
    description: 'Design reliable APIs, relational data models, authentication, and server business logic.',
    requiredSkills: [
      { name: 'JavaScript', priority: 'High', sequence: 1, projectSuggestion: 'Write modular async/await scripts and data transformation utilities in Node.js.' },
      { name: 'Node.js', priority: 'High', sequence: 2, projectSuggestion: 'Create a CLI or HTTP service that reads, validates, and processes structured JSON.' },
      { name: 'Express', priority: 'High', sequence: 3, projectSuggestion: 'Build a RESTful CRUD API with routing, middleware, and error handling.' },
      { name: 'SQL', priority: 'High', sequence: 4, projectSuggestion: 'Design a normalized relational schema with foreign keys and aggregate queries.' },
      { name: 'REST APIs', priority: 'Medium', sequence: 5, projectSuggestion: 'Add pagination, filtering, and HTTP status code contracts to your API.' },
      { name: 'Git', priority: 'Medium', sequence: 6, projectSuggestion: 'Maintain clean commit history and environment variable templates (.env.example).' }
    ],
    preferredSkills: ['PostgreSQL', 'Docker', 'Unit Testing']
  },
  'Full-Stack': {
    role: 'Full-Stack',
    label: 'Full-Stack Developer',
    description: 'Connect interactive frontend applications with database-backed server APIs.',
    requiredSkills: [
      { name: 'HTML', priority: 'High', sequence: 1, projectSuggestion: 'Structure accessible forms and semantic page layouts.' },
      { name: 'CSS', priority: 'High', sequence: 2, projectSuggestion: 'Style responsive cards, navigation drawers, and status badges.' },
      { name: 'JavaScript', priority: 'High', sequence: 3, projectSuggestion: 'Master async fetch calls, array transformations, and state updates.' },
      { name: 'React', priority: 'High', sequence: 4, projectSuggestion: 'Build a multi-page SPA with client routing and protected views.' },
      { name: 'Node.js', priority: 'High', sequence: 5, projectSuggestion: 'Create an Express + Node backend serving JSON endpoints.' },
      { name: 'SQL', priority: 'High', sequence: 6, projectSuggestion: 'Persist user records in SQLite or PostgreSQL using an ORM.' }
    ],
    preferredSkills: ['Express', 'REST APIs', 'Git', 'TypeScript']
  },
  Python: {
    role: 'Python',
    label: 'Python Developer',
    description: 'Develop clean Python applications, automation scripts, data pipelines, and backend services.',
    requiredSkills: [
      { name: 'Python', priority: 'High', sequence: 1, projectSuggestion: 'Write a modular Python CLI application with virtual environments and type hints.' },
      { name: 'SQL', priority: 'High', sequence: 2, projectSuggestion: 'Connect Python to a SQLite database to query and summarize records.' },
      { name: 'REST APIs', priority: 'High', sequence: 3, projectSuggestion: 'Build or consume REST endpoints in Python with structured validation.' },
      { name: 'Git', priority: 'Medium', sequence: 4, projectSuggestion: 'Publish your Python package structure with requirements.txt and README.' },
      { name: 'Unit Testing', priority: 'Medium', sequence: 5, projectSuggestion: 'Write automated unit tests covering edge cases and invalid inputs.' }
    ],
    preferredSkills: ['Pandas', 'Docker', 'PostgreSQL']
  },
  'Data Analyst': {
    role: 'Data Analyst',
    label: 'Data Analyst',
    description: 'Turn raw datasets into clean SQL queries, statistical insights, and clear visual stories.',
    requiredSkills: [
      { name: 'SQL', priority: 'High', sequence: 1, projectSuggestion: 'Write JOIN, GROUP BY, and window function queries on an e-commerce dataset.' },
      { name: 'Excel', priority: 'High', sequence: 2, projectSuggestion: 'Build a KPI summary workbook with pivot tables and data validation.' },
      { name: 'Python', priority: 'High', sequence: 3, projectSuggestion: 'Automate CSV cleaning and missing-value imputation in Python.' },
      { name: 'Pandas', priority: 'High', sequence: 4, projectSuggestion: 'Analyze cohort retention and trends using Pandas DataFrames.' },
      { name: 'Data Visualization', priority: 'Medium', sequence: 5, projectSuggestion: 'Create an executive chart report highlighting 3 actionable findings.' }
    ],
    preferredSkills: ['Statistics', 'NumPy']
  },
  'beginner ML': {
    role: 'beginner ML',
    label: 'Machine Learning (Beginner)',
    description: 'Prepare datasets, engineer features, and evaluate baseline machine learning models.',
    requiredSkills: [
      { name: 'Python', priority: 'High', sequence: 1, projectSuggestion: 'Write reproducible data preprocessing functions in Python.' },
      { name: 'NumPy', priority: 'High', sequence: 2, projectSuggestion: 'Implement vectorized array operations and summary statistics.' },
      { name: 'Pandas', priority: 'High', sequence: 3, projectSuggestion: 'Clean tabular data, encode categorical features, and handle outliers.' },
      { name: 'Statistics', priority: 'High', sequence: 4, projectSuggestion: 'Evaluate distributions, correlations, and train/validation splits.' },
      { name: 'Scikit-Learn', priority: 'High', sequence: 5, projectSuggestion: 'Train and compare Logistic Regression vs. Random Forest with confusion matrices.' }
    ],
    preferredSkills: ['Data Visualization', 'SQL', 'Git']
  },
  'UI/UX': {
    role: 'UI/UX',
    label: 'UI/UX Designer',
    description: 'Research user needs, design clear information architecture, and craft interactive prototypes.',
    requiredSkills: [
      { name: 'User Research', priority: 'High', sequence: 1, projectSuggestion: 'Conduct 3 student interviews and synthesize pain points into a journey map.' },
      { name: 'Wireframing', priority: 'High', sequence: 2, projectSuggestion: 'Sketch low-fidelity screen flows solving a campus onboarding problem.' },
      { name: 'Figma', priority: 'High', sequence: 3, projectSuggestion: 'Build a reusable Figma component library with color tokens and typography scales.' },
      { name: 'Prototyping', priority: 'High', sequence: 4, projectSuggestion: 'Link interactive states and transitions for usability testing.' }
    ],
    preferredSkills: ['HTML', 'CSS']
  }
};

export function normalizeSkillName(name) {
  return String(name || '').trim().toLowerCase();
}

/**
 * Deterministic match score computation per Section 6.1:
 * Match Score = (Number of matched required skills ÷ Total required skills) × 100
 */
export function computeInternshipMatch(studentSkills = [], internshipSkills = []) {
  const normalizedUserMap = new Map();
  for (const item of studentSkills) {
    const rawName = item.skill?.displayName || item.skill?.name || item.name || '';
    const norm = normalizeSkillName(rawName);
    if (norm) {
      normalizedUserMap.set(norm, {
        name: item.skill?.displayName || item.name || rawName,
        proficiency: item.proficiency || 'Beginner',
        status: item.status || 'Active'
      });
    }
  }

  const requiredList = [];
  const preferredList = [];

  for (const req of internshipSkills) {
    const displayName = req.skill?.displayName || req.name || req.skillName || '';
    const norm = normalizeSkillName(displayName);
    if (!norm) continue;
    const entry = {
      name: displayName,
      normalized: norm,
      requiredLevel: req.requiredLevel || 'Beginner',
      isRequired: req.isRequired !== false
    };
    if (entry.isRequired) {
      requiredList.push(entry);
    } else {
      preferredList.push(entry);
    }
  }

  const matchedRequired = [];
  const missingRequired = [];
  for (const req of requiredList) {
    if (normalizedUserMap.has(req.normalized)) {
      const userSk = normalizedUserMap.get(req.normalized);
      matchedRequired.push({
        name: req.name,
        requiredLevel: req.requiredLevel,
        userProficiency: userSk.proficiency
      });
    } else {
      missingRequired.push({
        name: req.name,
        requiredLevel: req.requiredLevel
      });
    }
  }

  const matchedPreferred = [];
  const missingPreferred = [];
  for (const pref of preferredList) {
    if (normalizedUserMap.has(pref.normalized)) {
      const userSk = normalizedUserMap.get(pref.normalized);
      matchedPreferred.push({
        name: pref.name,
        userProficiency: userSk.proficiency
      });
    } else {
      missingPreferred.push({
        name: pref.name
      });
    }
  }

  const hasUserSkills = normalizedUserMap.size > 0;
  const totalRequired = requiredList.length;
  const matchedCount = matchedRequired.length;

  // Edge case 1: Internship has zero required skills
  if (totalRequired === 0) {
    return {
      score: null,
      status: 'NO_REQUIREMENTS',
      formula: 'Match Score = (Matched Required Skills ÷ Total Required Skills) × 100',
      explanation: 'Not enough requirements to calculate a score.',
      hasUserSkills,
      totalRequired: 0,
      matchedCount: 0,
      matchedRequired,
      missingRequired,
      matchedPreferred,
      missingPreferred,
      nextAction: {
        type: 'EXPLORE',
        label: 'Review opportunity details',
        path: '/app/internships'
      }
    };
  }

  // Edge case 2: Student has no listed skills
  if (!hasUserSkills) {
    return {
      score: null,
      status: 'NO_PROFILE_SKILLS',
      formula: 'Match Score = (Matched Required Skills ÷ Total Required Skills) × 100',
      explanation: 'Add skills to your profile to see your personalized skill-fit score.',
      hasUserSkills: false,
      totalRequired,
      matchedCount: 0,
      matchedRequired: [],
      missingRequired: requiredList.map((r) => ({ name: r.name, requiredLevel: r.requiredLevel })),
      matchedPreferred: [],
      missingPreferred: preferredList.map((p) => ({ name: p.name })),
      nextAction: {
        type: 'UPDATE_PROFILE',
        label: 'Add your skills in Profile',
        path: '/app/profile'
      }
    };
  }

  const score = Math.round((matchedCount / totalRequired) * 100);

  let explanation = '';
  if (missingRequired.length === 0) {
    explanation = `You match all ${totalRequired} required skills (${matchedCount} ÷ ${totalRequired} × 100 = 100%). This is a skill-fit indicator, not a hiring probability.`;
  } else {
    const missingNames = missingRequired.map((m) => m.name).join(', ');
    explanation = `You have ${matchedCount} of ${totalRequired} required skills (${matchedCount} ÷ ${totalRequired} × 100 = ${score}%). Missing required: ${missingNames}. This is a skill-fit indicator, not a hiring probability.`;
  }

  const nextAction =
    missingRequired.length > 0
      ? {
          type: 'LEARN_SKILL',
          label: `Close gap: Learn ${missingRequired[0].name} in your Roadmap`,
          skill: missingRequired[0].name,
          path: '/app/roadmap'
        }
      : {
          type: 'TRACK_APPLICATION',
          label: 'Strong skill fit — add this role to your Application Tracker',
          path: '/app/applications'
        };

  return {
    score,
    status: 'CALCULATED',
    formula: 'Match Score = (Number of matched required skills ÷ Total required skills) × 100',
    explanation,
    hasUserSkills: true,
    totalRequired,
    matchedCount,
    matchedRequired,
    missingRequired,
    matchedPreferred,
    missingPreferred,
    nextAction
  };
}

/**
 * Compute role-based skill-gap analysis per Section 4.7
 */
export function computeSkillGapsForRole(targetRole, studentSkills = []) {
  const roleKey = Object.keys(ROLE_REQUIREMENTS).find(
    (k) => k.toLowerCase() === String(targetRole || '').trim().toLowerCase()
  );

  if (!roleKey) {
    return {
      role: null,
      availableRoles: Object.keys(ROLE_REQUIREMENTS),
      hasRole: false,
      message: 'Choose a target role to compare your skills against structured requirements.'
    };
  }

  const roleSpec = ROLE_REQUIREMENTS[roleKey];
  const userSkillMap = new Map();

  for (const s of studentSkills) {
    const name = s.skill?.displayName || s.skill?.name || s.name || '';
    const norm = normalizeSkillName(name);
    if (norm) {
      userSkillMap.set(norm, {
        id: s.id,
        skillId: s.skillId || s.skill?.id,
        name: s.skill?.displayName || s.name || name,
        proficiency: s.proficiency || 'Beginner',
        status: s.status || 'Active'
      });
    }
  }

  const comparison = roleSpec.requiredSkills.map((req) => {
    const norm = normalizeSkillName(req.name);
    const existing = userSkillMap.get(norm);
    const isMatched = Boolean(existing);
    return {
      name: req.name,
      isRequired: true,
      priority: req.priority,
      sequence: req.sequence,
      matched: isMatched,
      proficiency: existing ? existing.proficiency : null,
      status: existing ? existing.status : 'Missing',
      projectSuggestion: req.projectSuggestion
    };
  });

  const preferredComparison = roleSpec.preferredSkills.map((prefName, idx) => {
    const norm = normalizeSkillName(prefName);
    const existing = userSkillMap.get(norm);
    return {
      name: prefName,
      isRequired: false,
      priority: 'Low',
      sequence: roleSpec.requiredSkills.length + idx + 1,
      matched: Boolean(existing),
      proficiency: existing ? existing.proficiency : null,
      status: existing ? existing.status : 'Optional'
    };
  });

  const matchedSkills = comparison.filter((c) => c.matched);
  const missingSkills = comparison.filter((c) => !c.matched);
  const readinessScore =
    comparison.length > 0 ? Math.round((matchedSkills.length / comparison.length) * 100) : 0;

  const nextSkillRecommendation =
    missingSkills.length > 0
      ? {
          skill: missingSkills[0].name,
          priority: missingSkills[0].priority,
          activity: missingSkills[0].projectSuggestion
        }
      : {
          skill: 'Capstone Portfolio Polish',
          priority: 'Medium',
          activity: 'You have all core required skills for this role. Build and document an end-to-end capstone project.'
        };

  return {
    role: roleSpec.role,
    roleLabel: roleSpec.label,
    description: roleSpec.description,
    hasRole: true,
    availableRoles: Object.keys(ROLE_REQUIREMENTS),
    readinessScore,
    totalRequired: comparison.length,
    matchedCount: matchedSkills.length,
    missingCount: missingSkills.length,
    requiredComparison: comparison,
    preferredComparison,
    matchedSkills,
    missingSkills,
    nextSkillRecommendation
  };
}
