# SkillBridge AI — Student Career & Internship Assistant

SkillBridge AI is a full-stack student career preparation and internship skill-fit assistant built with **React (Vite) + Express + Prisma + SQLite**.

> **Winning Story:** *"SkillBridge AI doesn't just show students opportunities. It explains how their current skills fit a role, identifies the gaps, and turns those gaps into an actionable learning plan—while helping them keep track of applications."*

---

## 1. What Is Implemented

- **Public Marketing Landing Page (`/`)**: Value proposition, 3-step workflow, stylized interactive preview card, and instant **Try Demo** access alongside **Login (`/login`)** and **Registration (`/register`)**.
- **Isolated Judge Demo Mode (`/demo/*`)**:
  - Accessible in one click without registration or API credentials.
  - Preloaded with `Demo Student` (`HTML — Intermediate`, `CSS — Intermediate`, `JavaScript — Beginner`, Target Role: `Frontend`, 5 hrs/week).
  - Clearly labeled (`DEMO PROFILE — sample data, not a real student`) and isolated from real user accounts.
  - Includes a **Reset Demo Data** action (`POST /api/auth/demo-reset`) to restore the demo state reproducibly.
- **Authentication & Security**:
  - Password hashing with `bcryptjs`, HTTP-only session cookies (`jsonwebtoken`), `helmet` security headers, rate limiting on auth and roadmap generation, and strict server-side record ownership checks.
- **5-Step Student Onboarding (`/onboarding`) & Profile Editor (`/app/profile`)**:
  - `Basic Info → Career Goal → Skills → Preferences → Review` stepper.
  - Full skill management (`Beginner`, `Intermediate`, `Advanced`), profile completion indicator with missing-field hints, and unsaved-change warnings.
- **Internship Explorer (`/app/internships`) & Match Analysis (`/app/internships/:id`)**:
  - 16 seeded sample internships across `Frontend`, `Backend`, `Full-Stack`, `Python`, `Data Analyst`, `beginner ML`, and `UI/UX` (visibly labeled `SAMPLE DATA`).
  - Search by title, role, company, or skill; filter by domain, work mode, location, experience level, stipend, or saved state; sort by Skill Match Score, Highest Stipend, or Role Title.
  - **Deterministic Explainable Matching Engine**:
    $$\text{Match Score} = \left(\frac{\text{Number of matched required skills}}{\text{Total required skills}}\right) \times 100$$
  - Separates mandatory required skills from optional preferred skills and handles edge cases (`0` required skills or `0` profile skills) gracefully without dividing by zero or displaying misleading scores.
- **Skill-Gap Analyzer (`/app/skill-gaps`)**:
  - Benchmarks current student skills against any of the 7 target career roles with `High`, `Medium`, and `Low` priorities, project recommendations, and one-click actions to mark a skill as `Learning` or `Completed`.
- **Personalized Career Roadmap (`/app/roadmap`)**:
  - Deterministic rule-based weekly generator that sequences missing skills and beginner skill upgrades according to weekly study hours—works out of the box **without** an external API key.
  - Optional server-side Gemini adapter (`GEMINI_API_KEY`) that falls back gracefully to rule-based generation and labels the plan source (`rule-based` vs `ai-assisted`) honestly.
  - Supports step completion toggles, inline editing, and regeneration confirmation while preserving completed steps.
- **Personal Application Tracker (`/app/applications`) & Student Dashboard (`/app/dashboard`)**:
  - Kanban board and grouped list views across `Interested`, `Applied`, `Interview`, `Offer`, and `Rejected`.
  - Live derived counts on both the Tracker and Dashboard, plus a clear honesty notice that updating status tracks personal progress rather than submitting an external application.

---

## 2. Project Architecture

```text
zealous-nobel/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/ui.jsx   # Button, Card, Badge, ProgressBar, SkillChip, InternshipCard, etc.
│   │   ├── context/            # Auth & Demo Mode state + Toast notifications
│   │   ├── layouts/AppShell.jsx# Responsive sidebar, top bar, mobile drawer, demo banner
│   │   ├── lib/api.js          # Central fetch wrapper, credentials & X-Demo-Mode header
│   │   ├── pages/              # Landing, Auth, Onboarding, Dashboard, Internships, Detail, SkillGaps, Roadmap, Tracker, Profile
│   │   ├── App.jsx             # Public, Protected (/app/*), and Demo (/demo/*) routes
│   │   └── index.css           # Blueprint color tokens & responsive design system
│   └── package.json
├── server/                     # Express + Prisma + SQLite backend
│   ├── prisma/
│   │   ├── schema.prisma       # Relational data model (10 tables)
│   │   └── seed.js             # Repeatable seed script (26 skills, 16 sample internships, Demo Student)
│   ├── src/
│   │   ├── lib/                # Prisma client & standard JSON response helpers
│   │   ├── middleware/auth.js  # JWT cookie auth & isolated Demo Mode middleware
│   │   ├── routes/             # auth, profile, internships/matches/skill-gaps, roadmap, applications, dashboard
│   │   ├── services/           # matchService.js, roadmapService.js, profileService.js
│   │   ├── app.js              # Express app configuration
│   │   └── server.js           # HTTP server entry point
│   ├── tests/api.test.js       # Automated unit & integration test suite
│   └── package.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 3. Windows-Friendly Setup & Run Commands

### Prerequisites
- **Node.js** v18+ (tested with Node v24) and **npm**.

### Step 1 — Install Dependencies & Initialize SQLite Database
Run these commands from the project root (`c:\Users\JAYESH\Documents\antigravity\zealous-nobel`):

```powershell
# 1. Install root, backend, and frontend dependencies
npm install
npm --prefix server install
npm --prefix client install

# 2. Generate Prisma client, push SQLite schema, and seed sample data
npm --prefix server run db:setup
```

### Step 2 — Configure Environment Variables
`server/.env` is pre-configured for local development. You can also copy `.env.example` to `server/.env`:

```env
PORT=4000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=skillbridge-local-dev-secret-key-2026
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY=
```
*(Leave `GEMINI_API_KEY` blank to use the built-in deterministic rule-based roadmap generator.)*

### Step 3 — Start Backend & Frontend
You can run both servers together from the root directory:

```powershell
npm run dev
```

Or in two separate PowerShell terminals:

```powershell
# Terminal 1 — Start Express API Server (http://localhost:4000)
npm --prefix server run dev

# Terminal 2 — Start React Vite Client (http://localhost:5173)
npm --prefix client run dev
```

- **Frontend URL**: `http://localhost:5173`
- **Backend API URL**: `http://localhost:4000`
- **Health Check URL**: `http://localhost:4000/api/health`

---

## 4. Two-Minute Hackathon Judge Walkthrough (Demo Mode)

1. Open `http://localhost:5173` and click **Try Instant Judge Demo** (or **Try Demo** in the top navigation).
2. **Dashboard (`/demo/dashboard`)**: Observe `Demo Student`'s profile completion, quick stats, and recommended Frontend internships with a visible `DEMO PROFILE` notice.
3. **Explainable Match (`/demo/internships/demo-intern-frontend-1`)**: Click **Frontend Web Developer Intern** at *NovaCraft Studio (Sample)*. Inspect the **75% Skill-Fit Score** (`3 matched ÷ 4 required × 100 = 75%`), showing `HTML`, `CSS`, and `JavaScript` matched and `React` missing.
4. **Skill Gaps (`/demo/skill-gaps`)**: Open **Skill Gaps** from the sidebar. Mark `React` as **Learning** or **Completed** and watch the role readiness percentage update immediately.
5. **Career Roadmap (`/demo/roadmap`)**: Open **Career Roadmap**, toggle a weekly step to **Completed**, and watch the progress bar update.
6. **Application Tracker (`/demo/applications`)**: Move an application card from `Interested` to `Applied`, then return to **Dashboard** to see the updated pipeline counts.
7. **Reset Demo**: Click **Reset Demo Data** in the top banner at any time to restore the initial starting state.

---

## 5. Automated Tests & Verification

Run the automated backend & matching engine test suite:

```powershell
npm --prefix server test
```

Build the production frontend bundle:

```powershell
npm --prefix client run build
```

---

## 6. Known Limitations (MVP Boundary)

- **Local SQLite Storage**: Uses local SQLite (`server/prisma/dev.db`) for zero-config hackathon portability. If deploying to a stateless serverless host, switch `datasource db` in `schema.prisma` to PostgreSQL.
- **No External Job Scraping or Auto-Apply**: Seeded opportunities are explicitly labeled `SAMPLE DATA`. Changing an application status in the Tracker updates the student's personal organizer and does not submit external company forms.
- **Resume Link Instead of File Upload**: Uses a validated Resume/Portfolio URL field on `/app/profile` to avoid unverified binary uploads in the MVP.
