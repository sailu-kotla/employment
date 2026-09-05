# NearWork

> **"Find the right opportunity, closer to you."**

NearWork is a lightweight, student-first employment discovery platform built for college students, fresh engineering graduates, and entry-level job seekers. It centralizes internships, apprenticeships, part-time roles, and fresher opportunities based on geographical proximity, skill compatibility, and career category.

---

## Problem Statement

Students and entry-level job seekers frequently struggle to discover nearby internships, part-time jobs, and apprenticeships because opportunity postings are fragmented across unverified portals, social media groups, and generic corporate boards. Relocation costs and mismatched skill expectations further impede freshers from securing their first job.

## Solution

NearWork unites these opportunities into a unified, clean discovery engine where candidates can:
1. Filter openings across regional tier-1 and tier-2 hubs (e.g. Visakhapatnam, Vizianagaram, Vijayawada, Hyderabad, Bengaluru, Chennai, Remote).
2. Calculate immediate **percentage match scores** comparing candidate skills against employer requirements.
3. Track and update application lifecycles from Saved to Applied, Interview, Selected, and Rejected.
4. Consult the **NearWork Smart Assistant** for personalized interview prep, skill gap analysis, and tailored recommendations.

---

## 5 Core Features

### 1. Job & Opportunity Search
- Real-time search across job titles, required skills, company names, and descriptive keywords.
- Instant dynamic result counters (e.g., *"5 opportunities found"*).

### 2. Location Filter
- Filter by key local tech and industrial hubs:
  - **Vizianagaram**
  - **Visakhapatnam**
  - **Vijayawada**
  - **Hyderabad**
  - **Bengaluru**
  - **Chennai**
  - **Remote**
- Fast location-specific aggregation without complex GPS battery drains.

### 3. Skill & Category Matching
- Standardized skill matching engine comparing candidate profiles against required competencies:
  $$\text{Match Percentage} = \left(\frac{\text{Matched Skills}}{\text{Total Required Skills}}\right) \times 100$$
- Visual breakdown:
  - **80–100%**: Excellent Match
  - **60–79%**: Good Match
  - **40–59%**: Partial Match
  - **Below 40%**: Low Match
- Distinct lists of **Matched Skills** (✓) and **Missing Skills** (✗).

### 4. Opportunity Details & Instant Apply
- Deep dive on every role: Title, Company, Location, Employment Type, Salary/Stipend, Required Skills, Experience, Eligibility, Full Description, and Deadline.
- Direct external application forwarding with instant status synchronization.

### 5. Application Tracker & Dashboard
- Visual metrics tracking: **Saved**, **Applied**, **Interview**, **Selected**, **Rejected**.
- Interactive status dropdown permitting candidates to update application progress directly.
- Personalized recommendation feed tailored to student location and skill sets.

---

## AI Implementation: NearWork Smart Assistant

Designed with a strict **Zero-Cost & Free-Tier First Architecture**:
- **Dual-Mode AI Engine**:
  1. **Gemini 3.8 Flash** via Google AI Studio (`@google/genai`) when an API key is provided server-side.
  2. **Deterministic Smart Rule Engine**: High-fidelity algorithmic career coach fallback that operates 100% offline and free of cost when no API key is set.
- **Key Capabilities**:
  - *"Why is this job suitable for me?"*
  - *"What skills am I missing?"*
  - *"What should I learn before applying?"*
  - *"How can I prepare for this interview?"*
  - *"Am I a good match for this job?"*
- Structured response schema: Match Analysis, Strengths, Skill Gaps, Actionable Recommendations, and Interview Checklist.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Motion
- **Backend**: Node.js, Express.js (REST API architecture)
- **Database**: MongoDB & Mongoose ORM (with in-memory persistence fallback for offline demo readiness)
- **AI**: Google Gen AI SDK (`@google/genai`, `gemini-3.8-flash`) + Smart Rule Engine fallback
- **Build / Packaging**: esbuild, tsx, Vite

---

## Architecture

```
                                  [ Browser / Client (React + Vite) ]
                                                   │
                                      REST API Calls (/api/*)
                                                   ▼
                                  [ Express Backend (server.ts) ]
                                                   │
                   ┌───────────────────────────────┴───────────────────────────────┐
                   ▼                                                               ▼
        [ Database Router ]                                             [ AI Service Engine ]
         ├── MongoDB / Mongoose (if MONGODB_URI set)                     ├── Gemini 3.8 Flash (if GEMINI_API_KEY set)
         └── In-Memory Store (Instant Hackathon Demo Fallback)           └── Smart Rule Engine (100% Free Fallback)
```

---

## Database Structure (Mongoose Models)

### 1. User
- `name` (String, required)
- `email` (String, required)
- `education` (String, required)
- `skills` ([String])
- `preferredLocation` (String)
- `preferredCategory` (String)
- `createdAt` (Date)

### 2. Opportunity
- `title` (String, required)
- `company` (String, required)
- `location` (String, required)
- `category` (String, required)
- `type` (String: 'Internship' | 'Full-time' | 'Part-time' | 'Apprenticeship')
- `skills` ([String])
- `salary` (String)
- `experience` (String)
- `eligibility` (String)
- `description` (String)
- `deadline` (String)
- `applyLink` (String)
- `featured` (Boolean)
- `createdAt` (Date)

### 3. SavedJob
- `userId` (String, required, indexed)
- `opportunityId` (String, required)
- `createdAt` (Date)

### 4. Application
- `userId` (String, required, indexed)
- `opportunityId` (String, required)
- `status` (Enum: 'Saved' | 'Applied' | 'Interview' | 'Selected' | 'Rejected')
- `appliedAt` (Date)
- `updatedAt` (Date)

---

## Project Structure

```
├── .env.example                     # Environment template (no secrets committed)
├── index.html                       # HTML entry point with metadata and fonts
├── metadata.json                    # AI Studio app metadata
├── package.json                     # Scripts and dependencies
├── server.ts                        # Main Express server entry point with Vite middleware
├── server/
│   ├── config/
│   │   └── db.ts                    # MongoDB connection & auto-seeder
│   ├── data/
│   │   └── sampleOpportunities.ts   # 14 realistic starter opportunities & categories
│   ├── models/                      # Mongoose models (User, Opportunity, SavedJob, Application)
│   ├── routes/                      # REST endpoints (/api/opportunities, /api/users, etc.)
│   ├── services/
│   │   └── aiService.ts             # Gemini AI integration + Rule-based fallback
│   └── store/
│       └── inMemoryStore.ts         # High-fidelity in-memory demo store
├── src/
│   ├── App.tsx                      # App root with state management & routing
│   ├── main.tsx                     # React DOM entry
│   ├── types.ts                     # Shared TypeScript interfaces
│   ├── components/                  # Navbar, OpportunityCard, SearchBar, FilterPanel,
│   │                                # MatchScore, AIAssistant, ApplicationTracker, etc.
│   ├── pages/                       # Home, Opportunities, OpportunityDetails, Dashboard, Profile
│   ├── services/
│   │   └── api.ts                   # Fetch API wrapper
│   └── utils/
│       └── matching.ts              # Skill percentage and rating computation
└── README.md
```

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Define the variables:

```env
# Optional: Gemini API key from Google AI Studio. If blank, the smart rule engine is used.
GEMINI_API_KEY=""

# Optional: MongoDB connection string (e.g. mongodb+srv://<user>:<password>@cluster.mongodb.net/nearwork)
# If blank or unreachable, NearWork automatically uses its demo in-memory persistence.
MONGODB_URI=""
```

---

## How to Run Locally

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The application will start on **http://localhost:3000** with the full Express API and React client ready for demonstration.

---

## How to Run Frontend & Backend

- **Development Mode**: `npm run dev` boots the Express backend using `tsx server.ts` and attaches Vite's middleware pipeline.
- **Production Build**: `npm run build` compiles both the Vite client into `dist/` and bundles `server.ts` into a standalone CommonJS file `dist/server.cjs` via `esbuild`.
- **Production Start**: `npm start` executes `node dist/server.cjs`.

---

## MongoDB Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Under **Database Access**, create a database user and password.
3. Under **Network Access**, allow access from your IP or `0.0.0.0/0` for cloud deployment.
4. Copy the connection URI into your `.env` as `MONGODB_URI`.
5. When the application starts, it automatically seeds 14 realistic regional opportunities.

---

## GitHub Setup

1. Initialize git and verify `.gitignore` excludes `node_modules` and `.env`:
```bash
git init
git add .
git commit -m "feat: initial NearWork MVP with 5 core features and dual-mode AI"
```
2. Link your remote repository and push:
```bash
git remote add origin https://github.com/<your-username>/nearwork.git
git branch -M main
git push -u origin main
```

---

## Vercel Deployment

1. Import the repository into your Vercel dashboard.
2. In Project Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Under **Environment Variables**, add `MONGODB_URI` and optionally `GEMINI_API_KEY`.
4. Deploy!

---

## Future Enhancements

- Verified Employer Portal for local businesses to post apprenticeships directly.
- WhatsApp & SMS alerts for application interview milestones.
- Multilingual interface supporting Telugu, Hindi, and regional languages.
- Campus placement cell integration with bulk college roster matching.

---

*NearWork — Built with craftsmanship for the AI Vibe Coding Hackathon.*
