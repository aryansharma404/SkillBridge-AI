import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const SKILL_CATALOG = [
  { name: 'html', displayName: 'HTML', category: 'Frontend' },
  { name: 'css', displayName: 'CSS', category: 'Frontend' },
  { name: 'javascript', displayName: 'JavaScript', category: 'Frontend' },
  { name: 'typescript', displayName: 'TypeScript', category: 'Frontend' },
  { name: 'react', displayName: 'React', category: 'Frontend' },
  { name: 'tailwind css', displayName: 'Tailwind CSS', category: 'Frontend' },
  { name: 'node.js', displayName: 'Node.js', category: 'Backend' },
  { name: 'express', displayName: 'Express', category: 'Backend' },
  { name: 'sql', displayName: 'SQL', category: 'Database' },
  { name: 'postgresql', displayName: 'PostgreSQL', category: 'Database' },
  { name: 'mongodb', displayName: 'MongoDB', category: 'Database' },
  { name: 'rest apis', displayName: 'REST APIs', category: 'Backend' },
  { name: 'git', displayName: 'Git', category: 'Tools' },
  { name: 'python', displayName: 'Python', category: 'Programming' },
  { name: 'pandas', displayName: 'Pandas', category: 'Data' },
  { name: 'numpy', displayName: 'NumPy', category: 'Data' },
  { name: 'data visualization', displayName: 'Data Visualization', category: 'Data' },
  { name: 'excel', displayName: 'Excel', category: 'Data' },
  { name: 'scikit-learn', displayName: 'Scikit-Learn', category: 'ML' },
  { name: 'statistics', displayName: 'Statistics', category: 'Data' },
  { name: 'figma', displayName: 'Figma', category: 'Design' },
  { name: 'wireframing', displayName: 'Wireframing', category: 'Design' },
  { name: 'user research', displayName: 'User Research', category: 'Design' },
  { name: 'prototyping', displayName: 'Prototyping', category: 'Design' },
  { name: 'docker', displayName: 'Docker', category: 'Tools' },
  { name: 'unit testing', displayName: 'Unit Testing', category: 'Tools' }
];

export const SAMPLE_INTERNSHIPS = [
  {
    id: 'demo-intern-frontend-1',
    title: 'Frontend Web Developer Intern',
    company: 'NovaCraft Studio (Sample)',
    domain: 'Frontend',
    description: 'Build accessible, responsive student-facing dashboard components and interactive interfaces alongside product designers.',
    responsibilities: 'Implement reusable React components from Figma specs; ensure mobile responsiveness with CSS; collaborate using Git workflows; consume REST endpoints.',
    location: 'Bengaluru / Remote',
    workMode: 'Remote',
    experienceLevel: 'Beginner',
    stipend: '₹15,000 / month',
    stipendAmount: 15000,
    duration: '3 Months',
    deadline: '2026-11-30',
    applicationUrl: null,
    isDemo: true,
    isVerified: false,
    required: ['HTML', 'CSS', 'JavaScript', 'React'],
    preferred: ['Git', 'Tailwind CSS']
  },
  {
    id: 'demo-intern-frontend-2',
    title: 'UI Engineering Intern',
    company: 'PixelWave Labs (Sample)',
    domain: 'Frontend',
    description: 'Join the design-systems engineering pod to refine interactive web components and optimize page performance.',
    responsibilities: 'Develop clean semantic HTML and modern CSS layouts; write modular JavaScript; test components across desktop and mobile viewports.',
    location: 'Pune',
    workMode: 'Hybrid',
    experienceLevel: 'Beginner',
    stipend: '₹18,000 / month',
    stipendAmount: 18000,
    duration: '4 Months',
    deadline: '2026-12-10',
    applicationUrl: null,
    isDemo: true,
    isVerified: false,
    required: ['HTML', 'CSS', 'JavaScript', 'Git'],
    preferred: ['React', 'TypeScript']
  },
  {
    id: 'demo-intern-frontend-3',
    title: 'React Product Intern',
    company: 'Cloud Vista Technologies (Sample)',
    domain: 'Frontend',
    description: 'Work on single-page SaaS analytics views, state management, and client-side API integration.',
    responsibilities: 'Build stateful views in React; integrate REST APIs; write clean TypeScript interfaces and reusable hooks.',
    location: 'Hyderabad',
    workMode: 'Remote',
    experienceLevel: 'Intermediate',
    stipend: '₹22,000 / month',
    stipendAmount: 22000,
    duration: '6 Months',
    deadline: '2026-12-15',
    applicationUrl: null,
    isDemo: true,
    isVerified: false,
    required: ['HTML', 'CSS', 'JavaScript', 'React', 'REST APIs'],
    preferred: ['TypeScript', 'Unit Testing']
  },
  {
    id: 'demo-intern-backend-1',
    title: 'Backend API Engineering Intern',
    company: 'ScaleGrid Systems (Sample)',
    domain: 'Backend',
    description: 'Design and maintain Node.js microservices, relational database schemas, and secure authentication middleware.',
    responsibilities: 'Build Express REST APIs; write SQL queries and migrations; add input validation and unit tests.',
    location: 'Bengaluru',
    workMode: 'Hybrid',
    experienceLevel: 'Beginner',
    stipend: '₹20,000 / month',
    stipendAmount: 20000,
    duration: '3 Months',
    deadline: '2026-11-25',
    applicationUrl: null,
    isDemo: true,
    isVerified: false,
    required: ['JavaScript', 'Node.js', 'Express', 'SQL', 'REST APIs'],
    preferred: ['Git', 'Docker']
  },
  {
    id: 'demo-intern-backend-2',
    title: 'Junior Server & Database Intern',
    company: 'Veritas FinTech (Sample)',
    domain: 'Backend',
    description: 'Support core ledger reporting APIs, optimize relational queries, and write automated endpoint tests.',
    responsibilities: 'Assist in PostgreSQL schema tuning; build Node.js endpoints; document API payloads and status codes.',
    location: 'Mumbai',
    workMode: 'On-site',
    experienceLevel: 'Intermediate',
    stipend: '₹25,000 / month',
    stipendAmount: 25000,
    duration: '6 Months',
    deadline: '2026-12-05',
    applicationUrl: null,
    isDemo: true,
    isVerified: false,
    required: ['Node.js', 'Express', 'SQL', 'PostgreSQL', 'Git'],
    preferred: ['Unit Testing', 'Docker']
  },
  {
    id: 'demo-intern-fullstack-1',
    title: 'Full-Stack Web Developer Intern',
    company: 'EduSpark Learning (Sample)',
    domain: 'Full-Stack',
    description: 'End-to-end feature development across our React student portal and Express/SQLite backend.',
    responsibilities: 'Translate student user stories into React pages and Express routes; manage relational data models and authentication.',
    location: 'Remote',
    workMode: 'Remote',
    experienceLevel: 'Beginner',
    stipend: '₹18,000 / month',
    stipendAmount: 18000,
    duration: '3 Months',
    deadline: '2026-11-28',
    applicationUrl: null,
    isDemo: true,
    isVerified: false,
    required: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL'],
    preferred: ['Express', 'Git']
  },
  {
    id: 'demo-intern-fullstack-2',
    title: 'Software Engineering Intern (Full-Stack)',
    company: 'OrbitFlow Labs (Sample)',
    domain: 'Full-Stack',
    description: 'Ship collaborative workflow tools using modern JavaScript across client and server stacks.',
    responsibilities: 'Build responsive frontend views; connect REST APIs; maintain Express controllers and MongoDB/SQL stores.',
    location: 'Delhi NCR',
    workMode: 'Hybrid',
    experienceLevel: 'Intermediate',
    stipend: '₹24,000 / month',
    stipendAmount: 24000,
    duration: '6 Months',
    deadline: '2026-12-20',
    applicationUrl: null,
    isDemo: true,
    isVerified: false,
    required: ['JavaScript', 'React', 'Node.js', 'Express', 'REST APIs', 'Git'],
    preferred: ['TypeScript', 'MongoDB']
  },
  {
    id: 'demo-intern-python-1',
    title: 'Python Automation & Scripting Intern',
    company: 'DataPulse Solutions (Sample)',
    domain: 'Python',
    description: 'Write clean Python utilities for data ingestion, validation pipelines, and internal REST integrations.',
    responsibilities: 'Develop modular Python scripts; parse structured data files; query SQL databases and automate quality reports.',
    location: 'Remote',
    workMode: 'Remote',
    experienceLevel: 'Beginner',
    stipend: '₹15,000 / month',
    stipendAmount: 15000,
    duration: '3 Months',
    deadline: '2026-11-29',
    applicationUrl: null,
    isDemo: true,
    isVerified: false,
    required: ['Python', 'SQL', 'Git', 'REST APIs'],
    preferred: ['Unit Testing', 'Pandas']
  },
  {
    id: 'demo-intern-python-2',
    title: 'Junior Python Backend Intern',
    company: 'ArgoCloud Services (Sample)',
    domain: 'Python',
    description: 'Contribute to backend data services, REST API handlers, and automated testing suites in Python.',
    responsibilities: 'Maintain backend services; write unit tests; work with relational databases and Git.',
    location: 'Chennai',
    workMode: 'Hybrid',
    experienceLevel: 'Beginner',
    stipend: '₹16,000 / month',
    stipendAmount: 16000,
    duration: '4 Months',
    deadline: '2026-12-12',
    applicationUrl: null,
    isDemo: true,
    isVerified: false,
    required: ['Python', 'SQL', 'REST APIs', 'Unit Testing'],
    preferred: ['Docker', 'PostgreSQL']
  },
  {
    id: 'demo-intern-data-1',
    title: 'Data Analyst Intern',
    company: 'InsightMetric Retail (Sample)',
    domain: 'Data Analyst',
    description: 'Analyze product funnel metrics, clean datasets, and prepare actionable visual dashboards for product teams.',
    responsibilities: 'Write SQL queries to extract cohort metrics; clean datasets with Python and Pandas; create charts and Excel summaries.',
    location: 'Bengaluru',
    workMode: 'Hybrid',
    experienceLevel: 'Beginner',
    stipend: '₹18,000 / month',
    stipendAmount: 18000,
    duration: '3 Months',
    deadline: '2026-12-01',
    applicationUrl: null,
    isDemo: true,
    isVerified: false,
    required: ['SQL', 'Python', 'Pandas', 'Excel', 'Data Visualization'],
    preferred: ['Statistics', 'NumPy']
  },
  {
    id: 'demo-intern-data-2',
    title: 'Business Intelligence & SQL Intern',
    company: 'FinSight Analytics (Sample)',
    domain: 'Data Analyst',
    description: 'Support operations teams with reliable SQL reporting, statistical summaries, and KPI tracking.',
    responsibilities: 'Build repeatable SQL queries; validate data accuracy in Excel; present clear visual summaries.',
    location: 'Remote',
    workMode: 'Remote',
    experienceLevel: 'Beginner',
    stipend: '₹14,000 / month',
    stipendAmount: 14000,
    duration: '3 Months',
    deadline: '2026-12-08',
    applicationUrl: null,
    isDemo: true,
    isVerified: false,
    required: ['SQL', 'Excel', 'Statistics', 'Data Visualization'],
    preferred: ['Python', 'Pandas']
  },
  {
    id: 'demo-intern-ml-1',
    title: 'Applied Machine Learning Intern (Beginner)',
    company: 'CogniLabs AI (Sample)',
    domain: 'beginner ML',
    description: 'Train, evaluate, and document baseline supervised learning models on structured tabular datasets.',
    responsibilities: 'Preprocess datasets with Pandas and NumPy; build baseline classifiers in Scikit-Learn; evaluate precision/recall metrics.',
    location: 'Hyderabad / Remote',
    workMode: 'Remote',
    experienceLevel: 'Beginner',
    stipend: '₹20,000 / month',
    stipendAmount: 20000,
    duration: '4 Months',
    deadline: '2026-12-18',
    applicationUrl: null,
    isDemo: true,
    isVerified: false,
    required: ['Python', 'NumPy', 'Pandas', 'Scikit-Learn', 'Statistics'],
    preferred: ['Git', 'SQL']
  },
  {
    id: 'demo-intern-ml-2',
    title: 'Data Science & ML Research Intern',
    company: 'Quantive Health (Sample)',
    domain: 'beginner ML',
    description: 'Explore predictive features and assist senior data scientists with reproducible evaluation pipelines.',
    responsibilities: 'Perform exploratory data analysis; build Scikit-Learn pipelines; visualize model diagnostics.',
    location: 'Bengaluru',
    workMode: 'Hybrid',
    experienceLevel: 'Intermediate',
    stipend: '₹25,000 / month',
    stipendAmount: 25000,
    duration: '6 Months',
    deadline: '2026-12-22',
    applicationUrl: null,
    isDemo: true,
    isVerified: false,
    required: ['Python', 'Pandas', 'NumPy', 'Scikit-Learn', 'Data Visualization', 'Statistics'],
    preferred: ['SQL', 'Git']
  },
  {
    id: 'demo-intern-uiux-1',
    title: 'Product Design (UI/UX) Intern',
    company: 'Lumina Design Co. (Sample)',
    domain: 'UI/UX',
    description: 'Craft intuitive student workflows, wireframes, and interactive Figma prototypes for mobile and web apps.',
    responsibilities: 'Conduct structured user research; create low- and high-fidelity wireframes in Figma; build clickable prototypes.',
    location: 'Remote',
    workMode: 'Remote',
    experienceLevel: 'Beginner',
    stipend: '₹15,000 / month',
    stipendAmount: 15000,
    duration: '3 Months',
    deadline: '2026-11-27',
    applicationUrl: null,
    isDemo: true,
    isVerified: false,
    required: ['Figma', 'Wireframing', 'Prototyping', 'User Research'],
    preferred: ['HTML', 'CSS']
  },
  {
    id: 'demo-intern-uiux-2',
    title: 'Design Systems & Interaction Intern',
    company: 'Crestline Digital (Sample)',
    domain: 'UI/UX',
    description: 'Bridge product design and frontend handoff by organizing component libraries and accessibility specs.',
    responsibilities: 'Maintain Figma token libraries; design responsive web states; collaborate with frontend engineers.',
    location: 'Mumbai',
    workMode: 'Hybrid',
    experienceLevel: 'Beginner',
    stipend: '₹17,000 / month',
    stipendAmount: 17000,
    duration: '4 Months',
    deadline: '2026-12-14',
    applicationUrl: null,
    isDemo: true,
    isVerified: false,
    required: ['Figma', 'Wireframing', 'Prototyping', 'HTML', 'CSS'],
    preferred: ['User Research']
  },
  {
    id: 'demo-intern-edge-zero-req',
    title: 'Open Source Explorer Fellow (General)',
    company: 'Campus Community Guild (Sample)',
    domain: 'Frontend',
    description: 'Introductory mentorship fellowship open to first-year learners with no mandatory prerequisite technical stack.',
    responsibilities: 'Attend weekly workshops, document beginner bugs, and learn collaborative workflows.',
    location: 'Remote',
    workMode: 'Remote',
    experienceLevel: 'Beginner',
    stipend: 'Unpaid / Mentorship',
    stipendAmount: 0,
    duration: '2 Months',
    deadline: '2026-12-30',
    applicationUrl: null,
    isDemo: true,
    isVerified: false,
    required: [],
    preferred: ['Git', 'HTML']
  }
];

export async function seedDemoUserOnly(prismaClient = prisma) {
  const skillMap = new Map();
  const allSkills = await prismaClient.skill.findMany();
  for (const s of allSkills) {
    skillMap.set(s.name, s);
  }

  const demoEmail = 'demo@skillbridge.local';
  const existingDemo = await prismaClient.user.findUnique({ where: { email: demoEmail } });
  if (existingDemo) {
    await prismaClient.user.delete({ where: { id: existingDemo.id } });
  }

  const passwordHash = await bcrypt.hash('demo-not-for-password-login', 10);
  const demoUser = await prismaClient.user.create({
    data: {
      id: 'demo-student-user',
      name: 'Demo Student',
      email: demoEmail,
      passwordHash,
      isDemo: true,
      profile: {
        create: {
          college: 'State Institute of Technology (Sample)',
          course: 'B.Tech Computer Science',
          studyYear: '3rd Year',
          targetRole: 'Frontend',
          workMode: 'Remote or Hybrid',
          location: 'Bengaluru / Remote',
          weeklyHours: 5,
          resumeUrl: 'https://example.com/demo-student-resume-preview',
          onboarded: true
        }
      }
    }
  });

  // Seed initial Demo Student skills per Section 11:
  // HTML — Intermediate; CSS — Intermediate; JavaScript — Beginner
  const initialDemoSkills = [
    { name: 'html', proficiency: 'Intermediate', status: 'Completed' },
    { name: 'css', proficiency: 'Intermediate', status: 'Completed' },
    { name: 'javascript', proficiency: 'Beginner', status: 'Active' }
  ];

  for (const item of initialDemoSkills) {
    const sk = skillMap.get(item.name);
    if (sk) {
      await prismaClient.studentSkill.create({
        data: {
          userId: demoUser.id,
          skillId: sk.id,
          proficiency: item.proficiency,
          status: item.status
        }
      });
    }
  }

  // Save 2 sample internships for the demo user
  await prismaClient.savedInternship.createMany({
    data: [
      { userId: demoUser.id, internshipId: 'demo-intern-frontend-1' },
      { userId: demoUser.id, internshipId: 'demo-intern-frontend-2' }
    ]
  });

  // Seed 2 initial applications for the demo user
  await prismaClient.application.create({
    data: {
      id: 'demo-app-1',
      userId: demoUser.id,
      internshipId: 'demo-intern-frontend-1',
      title: 'Frontend Web Developer Intern',
      company: 'NovaCraft Studio (Sample)',
      status: 'Interested',
      deadline: '2026-11-30',
      notes: '75% skill match — need to build a small React project before applying.'
    }
  });

  await prismaClient.application.create({
    data: {
      id: 'demo-app-2',
      userId: demoUser.id,
      internshipId: 'demo-intern-frontend-2',
      title: 'UI Engineering Intern',
      company: 'PixelWave Labs (Sample)',
      status: 'Applied',
      appliedAt: new Date('2026-10-20T10:00:00Z'),
      deadline: '2026-12-10',
      notes: 'Submitted portfolio with responsive HTML/CSS case study.'
    }
  });

  // Seed initial rule-based roadmap for Demo Student
  await prismaClient.learningRoadmap.create({
    data: {
      id: 'demo-roadmap-1',
      userId: demoUser.id,
      targetRole: 'Frontend',
      source: 'rule-based',
      steps: {
        create: [
          {
            sequence: 1,
            title: 'Week 1: Modern JavaScript ES6+ & DOM Essentials',
            objective: 'Strengthen JavaScript from Beginner to Intermediate before diving into React.',
            task: 'Build an interactive task filter widget using array methods (map, filter, reduce) and async fetch.',
            estimatedHours: 5,
            completedAt: new Date('2026-10-22T12:00:00Z')
          },
          {
            sequence: 2,
            title: 'Week 2: React Components, Props & State Fundamentals',
            objective: 'Close your primary missing skill gap (React) for Frontend internships.',
            task: 'Create a multi-card Internship Bookmark viewer with useState and controlled filter inputs.',
            estimatedHours: 5,
            completedAt: null
          },
          {
            sequence: 3,
            title: 'Week 3: Git Version Control & Collaborative Workflow',
            objective: 'Learn branching, commits, and pull requests required by engineering teams.',
            task: 'Push your React project to a public repository with a clean README and 5 atomic commits.',
            estimatedHours: 5,
            completedAt: null
          },
          {
            sequence: 4,
            title: 'Week 4: Consuming REST APIs & Capstone Polish',
            objective: 'Connect React UI with live loading/error states and deploy a shareable preview.',
            task: 'Add dynamic search, loading skeletons, and error handling to your portfolio project.',
            estimatedHours: 5,
            completedAt: null
          }
        ]
      }
    }
  });

  return demoUser;
}

export async function runSeed(prismaClient = prisma) {
  console.log('Seeding SkillBridge AI catalog & sample internships...');

  const skillMap = new Map();
  for (const sk of SKILL_CATALOG) {
    const record = await prismaClient.skill.upsert({
      where: { name: sk.name },
      update: { displayName: sk.displayName, category: sk.category },
      create: sk
    });
    skillMap.set(sk.name, record);
  }

  for (const item of SAMPLE_INTERNSHIPS) {
    const { required, preferred, ...internshipData } = item;
    await prismaClient.internship.upsert({
      where: { id: item.id },
      update: internshipData,
      create: internshipData
    });

    await prismaClient.internshipRequiredSkill.deleteMany({
      where: { internshipId: item.id }
    });

    for (const reqName of required) {
      const sk = skillMap.get(reqName.toLowerCase());
      if (sk) {
        await prismaClient.internshipRequiredSkill.create({
          data: {
            internshipId: item.id,
            skillId: sk.id,
            requiredLevel: 'Intermediate',
            isRequired: true
          }
        });
      }
    }

    for (const prefName of preferred) {
      const sk = skillMap.get(prefName.toLowerCase());
      if (sk) {
        await prismaClient.internshipRequiredSkill.create({
          data: {
            internshipId: item.id,
            skillId: sk.id,
            requiredLevel: 'Beginner',
            isRequired: false
          }
        });
      }
    }
  }

  await seedDemoUserOnly(prismaClient);
  console.log('Seed completed successfully.');
}

// Run directly if invoked from CLI
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed()
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
