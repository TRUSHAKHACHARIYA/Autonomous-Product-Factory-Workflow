# AI Agent Pipeline — Product Requirements & Development Plan
> Version 1.0 | June 2026
> Status: Pre-development — Requirements & Planning Phase
> This file is the single source of truth for the entire product. Every decision lives here.

---

## TABLE OF CONTENTS

1. [Product Vision & Overview](#1-product-vision--overview)
2. [Target Users & Personas](#2-target-users--personas)
3. [Product Modes — What Users Actually Do](#3-product-modes--what-users-actually-do)
4. [The 18-Agent Pipeline — Complete Specification](#4-the-18-agent-pipeline--complete-specification)
5. [Monetization & Pricing](#5-monetization--pricing)
6. [Full Feature List by Phase](#6-full-feature-list-by-phase)
7. [System Architecture](#7-system-architecture)
8. [Database Schema — Complete](#8-database-schema--complete)
9. [API Design](#9-api-design)
10. [Frontend — Pages & Components](#10-frontend--pages--components)
11. [Tech Stack — Final Decisions](#11-tech-stack--final-decisions)
12. [Project Folder Structure](#12-project-folder-structure)
13. [Development Phases & Weekly Sprint Plan](#13-development-phases--weekly-sprint-plan)
14. [No-Code Validation Phase (Claude.ai Projects)](#14-no-code-validation-phase-claudeai-projects)
15. [Agent System Prompts — Complete Specification](#15-agent-system-prompts--complete-specification)
16. [Context Window Management Strategy](#16-context-window-management-strategy)
17. [Pipeline Orchestrator — Code Architecture](#17-pipeline-orchestrator--code-architecture)
18. [Authentication & Authorization](#18-authentication--authorization)
19. [Billing & Subscription System](#19-billing--subscription-system)
20. [Missing Parts — Resolved](#20-missing-parts--resolved)
21. [Risk Register & Mitigation](#21-risk-register--mitigation)
22. [Non-Functional Requirements](#22-non-functional-requirements)
23. [Success Metrics & KPIs](#23-success-metrics--kpis)
24. [Launch Strategy](#24-launch-strategy)
25. [Immediate Next Steps](#25-immediate-next-steps)

---

## 1. PRODUCT VISION & OVERVIEW

### What This Product Is

An AI-powered SaaS platform that automates the entire software development lifecycle using a sequential pipeline of 18 specialized AI agents, each powered by Claude. A user describes what they want — a software idea, a business problem, or an existing project to manage — and the pipeline produces complete, professional-grade outputs: full codebases, architecture documents, test suites, deployment configurations, and documentation.

The product operates in three distinct modes to serve the widest possible market, and is built to serve both non-technical founders who have never written code and experienced developers who want to accelerate their workflow.

### The Core Loop (What Happens Every Time)

```
User types a description
        ↓
Agent #1 parses and classifies the input
        ↓
Agents #2–18 run sequentially (some in parallel)
        ↓
Each agent reads previous outputs, produces new structured files
        ↓
User sees live progress as each agent completes
        ↓
Final output: ZIP of all files, organized by category
        ↓
User downloads, uses, extends
```

### What Makes This Different

- **Not a chatbot.** Users describe once; the system runs autonomously to completion.
- **Not a code generator.** The pipeline covers requirements, planning, architecture, security, design, frontend code, backend code, tests, DevOps, monitoring, and documentation — the full stack.
- **Not technical-only.** A non-technical founder gets everything they need to hand to a developer or deploy directly. A developer gets everything they need to skip setup and go straight to customization.
- **Transparent by design.** Users see every agent's output, every decision made, every file produced. Nothing is a black box.

### Product Name Placeholder
> Working name: **PipelineAI** — finalize before launch

---

## 2. TARGET USERS & PERSONAS

### Persona 1 — The Non-Technical Founder
**Name:** Priya, 32, Ahmedabad
**Situation:** Has a validated business idea for a B2B SaaS. Can't code. Can't afford a dev team. Has tried no-code tools but hits their limits.
**Goal:** Get a working MVP she can show to investors or early customers within 2 weeks.
**Pain points:** Doesn't know where to start, what tech stack means, how to write requirements, or how to manage a developer.
**How she uses the product:** Fills in the input form in plain English. Clicks Run. Gets a complete output including requirements, architecture, code, and docs. Hands the ZIP to a freelancer to deploy. Done.
**Willingness to pay:** $29–99/month if it saves her $5,000+ in freelance costs.

### Persona 2 — The Freelance Developer
**Name:** Ravi, 27, Bangalore
**Situation:** Takes 3–5 client projects per month. Spends 30–40% of time on boilerplate, requirements extraction, and documentation he hates writing.
**Goal:** Complete projects faster, take on more clients, charge higher rates.
**How he uses the product:** Runs the pipeline on each new client brief. Takes the generated codebase, customizes it, and delivers to client in half the usual time. Uses the generated docs as client-facing deliverables.
**Willingness to pay:** $99/month easily. Saves him 15+ hours per project.

### Persona 3 — The Product Manager
**Name:** Anjali, 35, Mumbai
**Situation:** Works at a 50-person startup. Manages 2 developers. Spends huge amounts of time writing PRDs, creating sprint plans, and doing code reviews she's not fully qualified for.
**Goal:** Produce professional-grade technical specifications quickly. Reduce back-and-forth with developers.
**How she uses the product:** Uses Strategy Mode and Manage Mode. Generates requirements documents, sprint plans, and risk registers automatically. Feeds them to her dev team.
**Willingness to pay:** $99/month on company card. Easy expense.

### Persona 4 — The Agency Owner
**Name:** Mehul, 41, Surat
**Situation:** Runs a 5-person web agency. Wants to take on more clients without hiring.
**Goal:** Use the pipeline as the backbone of every client project. Reduce billable hours on repetitive setup work.
**How he uses the product:** Team workspaces. Each project gets its own pipeline run. Uses the output as the foundation, then charges clients for customization.
**Willingness to pay:** $499/month for team plan. ROI is obvious.

### Persona 5 — The Enterprise Tech Lead
**Name:** Vikram, 45, Hyderabad
**Situation:** CTO of a 200-person company. Needs to spin up internal tools quickly without pulling core team off product.
**Goal:** Rapid internal prototyping. Standardized architecture across all tools.
**How he uses the product:** Runs pipelines for internal tools. Wants white-labeling, API access, and the ability to define custom agents matching company standards.
**Willingness to pay:** $499–2000/month. Budget is not the constraint.

---

## 3. PRODUCT MODES — WHAT USERS ACTUALLY DO

### Mode 1: BUILD MODE
**Trigger:** User wants to create a new software product from scratch.
**Input examples:**
- "Build me a SaaS todo app with team collaboration and Stripe payments"
- "I need a mobile app for booking home services with an admin panel"
- "Create an e-commerce platform with vendor management"

**What the pipeline produces:**
- Functional requirements + non-functional requirements
- User personas and user journey maps
- Epic breakdown, user stories, task list, sprint plan
- Complete tech stack recommendation with justification
- Full database schema (SQL or Prisma)
- OpenAPI spec for all endpoints
- Complete frontend code (React/Next.js)
- Complete backend code (Node.js/Express or similar)
- Unit tests, integration tests, E2E tests
- Docker + docker-compose + CI/CD pipeline config
- Monitoring and alerting setup
- Full documentation (README, API docs, architecture docs, user guide)

**Agents active:** All 18

### Mode 2: STRATEGY MODE
**Trigger:** User has a business problem or idea and needs a plan, not code.
**Input examples:**
- "I want to launch a digital product agency targeting e-commerce brands in India"
- "Our customer churn is 8% monthly. What should we do?"
- "Should I build a mobile app or a web app first for my SaaS?"

**What the pipeline produces:**
- Problem analysis and decomposition
- Market and competitive landscape
- User research framework and personas
- Strategic options with pros/cons
- Recommended action plan with milestones
- Risk analysis
- Financial model outline
- Go-to-market strategy

**Agents active:** 1, 2, 3, 5, 6 (adapted for strategy), 17, 18
**Agents skipped:** Code generation agents (7–16 in build mode) are replaced with strategy-specific agents

### Mode 3: MANAGE MODE
**Trigger:** User has an existing project and needs management support.
**Input examples:**
- "Here is my current codebase. Review it and create a sprint plan."
- "We have 3 developers and 6 months to launch. Here's our spec."
- "Our project is 4 months behind. Help us recover."

**What the pipeline produces:**
- Codebase audit and tech debt assessment
- Refactored architecture recommendations
- Sprint plan based on remaining work
- Risk register with mitigation strategies
- Team capacity analysis
- Task assignments and story point estimates
- Code quality report
- Updated documentation

**Agents active:** 1, 2, 3, 4, 5, 9 (audit), 12 (audit), 14, 17, 18
**Note:** Agents 7, 8, 10, 11 are adapted to audit mode rather than build mode

### Mode Detection
Agent #1 (InputLayer) is responsible for classifying mode based on user input and optionally asking one clarifying question if mode is ambiguous. The mode is stored in `user_input.json` and all subsequent agents read it to adapt their behavior.

---

## 4. THE 18-AGENT PIPELINE — COMPLETE SPECIFICATION

This is the canonical, authoritative definition of every agent. All code, prompts, and skill files must match this exactly.

---

### Agent 01 — InputLayer

**Trigger phrase (no-code):** `RUN: InputLayer`
**Role:** Senior Product Analyst / Input Validator
**Position in pipeline:** First — runs before anything else

**Reads from:**
- Raw user input (text typed into form)
- Any uploaded files (PDF, Word, images, existing code)

**Responsibilities:**
1. Parse the raw user description into structured fields
2. Detect the pipeline mode (Build / Strategy / Manage) — use the following logic:
   - Contains words like "build", "create", "develop", "make", "I want a" → BUILD
   - Contains words like "plan", "strategy", "should I", "how to", "problem", "solve" → STRATEGY
   - Contains words like "existing", "current", "review", "audit", "behind", "team of X" → MANAGE
3. Extract: project name, target platform (web/mobile/both/API), target users, key features listed, budget/timeline if mentioned, tech preferences if mentioned
4. Identify what information is MISSING and is critical — generate a list of 3–5 clarifying questions ranked by importance
5. Auto-fill reasonable defaults for non-critical missing fields (e.g., if no platform specified, default to web)
6. Score the input quality: Poor (< 3 features defined) / Fair (3–6 features) / Good (6+ features with context)
7. Validate that the input is a genuine software/business request, not gibberish or abuse

**Outputs (written to context store):**
```
user_input.json         — structured parsed input
validation_report.md    — quality score, missing fields, auto-filled defaults
clarifying_questions.md — ranked list of questions (shown to user in UI)
```

**`user_input.json` schema:**
```json
{
  "run_id": "string",
  "mode": "build | strategy | manage",
  "project_name": "string",
  "raw_description": "string",
  "platform": "web | mobile | both | api | desktop",
  "target_users": ["string"],
  "key_features": ["string"],
  "tech_preferences": {"frontend": "string", "backend": "string", "database": "string"},
  "timeline": "string | null",
  "budget": "string | null",
  "input_quality_score": "poor | fair | good",
  "auto_filled_fields": ["string"],
  "uploaded_files": ["filename"]
}
```

**HITL checkpoint:** Yes — after this agent, the UI shows the parsed input to the user and asks for confirmation before proceeding. The user can correct any misclassified fields.

---

### Agent 02 — RequirementAnalyst

**Trigger phrase (no-code):** `RUN: RequirementAnalyst`
**Role:** Senior Business Analyst
**Position in pipeline:** Second

**Reads from:**
- `user_input.json`
- `validation_report.md`
- Any uploaded PRD or spec documents

**Responsibilities:**
1. Extract all Functional Requirements (FR) — what the system must DO
2. Extract all Non-Functional Requirements (NFR) — performance, security, scalability, accessibility, compliance
3. Identify ambiguities in the requirements and resolve them using reasonable assumptions (document each assumption)
4. Create 2–3 detailed user personas with: name, role, goal, pain points, tech literacy level
5. Map 2–3 complete user journeys (step-by-step flows through the product)
6. Score complexity: S (< 1 week solo), M (1–4 weeks), L (1–3 months), XL (3+ months)
7. Identify regulatory/compliance requirements (GDPR, PCI-DSS for payments, HIPAA if health data, etc.)
8. Flag any requirements that are technically infeasible or extremely high-risk

**Outputs:**
```
requirements.md           — FR list (FR1–FRn) + NFR list (NFR1–NFRn)
personas.md               — 2–3 detailed personas
user_journeys.md          — 2–3 step-by-step user flow maps
ambiguities.md            — list of ambiguities + how each was resolved
complexity_score.json     — {score, reason, estimated_dev_weeks, team_size_needed}
compliance_flags.md       — any regulatory requirements identified
```

**No HITL checkpoint** — this agent runs automatically.

---

### Agent 03 — ProjectManager

**Trigger phrase (no-code):** `RUN: ProjectManager`
**Role:** Senior Project Manager / Scrum Master
**Position in pipeline:** Third

**Reads from:**
- `requirements.md`
- `complexity_score.json`
- `personas.md`
- `user_journeys.md`

**Responsibilities:**
1. Decompose requirements into Epics → User Stories → Tasks → Subtasks
2. Write acceptance criteria for every user story
3. Assign story points (Fibonacci: 1, 2, 3, 5, 8, 13) to every task
4. Define MVP scope vs V2 scope — be strict about what is truly MVP
5. Build a sprint plan (2-week sprints) with clear milestones
6. Create a timeline (Gantt-style: which epics run in which sprints)
7. Map dependencies between tasks (which tasks block which others)
8. Create a risk register with probability (Low/Med/High) and impact (Low/Med/High) for every identified risk
9. Define Definition of Done for the project overall

**Outputs:**
```
epics.md                   — list of all epics with descriptions
user_stories.md            — all user stories in "As a [persona], I want to [action] so that [goal]" format
tasks.json                 — structured task list with: id, epic_id, story_id, title, story_points, assignee_role, dependencies[], status
acceptance_criteria.md     — acceptance criteria per story
sprint_plan.md             — sprint-by-sprint breakdown with epics per sprint
timeline.md                — Gantt-style milestone timeline
mvp_scope.md               — explicit MVP vs V2 boundary with justification
risk_register.md           — risk table with probability, impact, mitigation
dependencies_graph.json    — task dependency map
definition_of_done.md      — project-wide definition of done
```

**HITL checkpoint:** Yes — after this agent, the user sees the MVP scope and sprint plan and must approve before code generation begins. This is CHECKPOINT #1.

---

### Agent 04 — Architecture

**Trigger phrase (no-code):** `RUN: Architecture`
**Role:** Senior Software Architect
**Position in pipeline:** Fourth

**Reads from:**
- `requirements.md`
- `complexity_score.json`
- `tasks.json`
- `mvp_scope.md`
- `compliance_flags.md`
- `user_input.json` (for tech preferences)

**Responsibilities:**
1. Select the full tech stack (frontend framework, backend framework, database, caching, message queue, file storage, CDN) with justification for each choice
2. Design the system architecture — choose between: Monolith / Modular Monolith / Microservices / Serverless based on complexity score
3. Design the complete database schema:
   - All tables/collections with full column definitions (name, type, constraints, indexes)
   - Foreign key relationships
   - Junction tables for many-to-many
   - Soft delete strategy
   - Audit trail fields (created_at, updated_at, created_by)
4. Define all API endpoints:
   - Full OpenAPI 3.0 spec
   - Request/response schemas for every endpoint
   - Authentication requirements per endpoint
   - Rate limiting rules per endpoint
5. Define the folder structure for both frontend and backend
6. Define authentication strategy: choose between JWT / Session / OAuth and explain why
7. Define caching strategy: what is cached, where (Redis/CDN/in-memory), TTL values
8. Define file storage strategy: where files are stored, how they are served
9. Define third-party integrations needed and how they connect
10. Define environment setup: Dev / Staging / Prod differences

**Outputs:**
```
tech_stack.md              — full stack with justification per layer
system_architecture.md     — architecture pattern choice + component diagram (ASCII)
database_schema.sql        — complete SQL schema OR schema.prisma
api_contracts.yaml         — full OpenAPI 3.0 spec
folder_structure.md        — complete directory tree for FE and BE
auth_strategy.md           — authentication and authorization approach
caching_strategy.md        — what, where, when to cache
storage_strategy.md        — file handling approach
integrations.md            — all third-party services and integration approach
environment_config.md      — env vars list for all environments
```

**HITL checkpoint:** Yes — after this agent, the user sees the tech stack and architecture and must approve before code is written. This is CHECKPOINT #2.

---

### Agent 05 — Security

**Trigger phrase (no-code):** `RUN: Security`
**Role:** Senior Security Engineer
**Position in pipeline:** Fifth

**Reads from:**
- `tech_stack.md`
- `system_architecture.md`
- `api_contracts.yaml`
- `auth_strategy.md`
- `compliance_flags.md`
- `database_schema.sql`

**Responsibilities:**
1. Review architecture against OWASP Top 10 — document risk level for each item
2. Define input validation rules for every API endpoint (types, length limits, allowed characters, sanitization)
3. Define authentication security rules: token expiry, refresh strategy, revocation, brute force protection
4. Define authorization rules: which roles can access which endpoints (RBAC matrix)
5. Define data encryption requirements: what is encrypted at rest, what in transit, key management
6. Define secrets management: where API keys/credentials are stored, how they're rotated
7. Define rate limiting rules: per IP, per user, per API key — with specific numbers
8. Review database schema for security issues: missing indexes on sensitive queries, PII fields, etc.
9. Check compliance requirements: GDPR data handling, PCI-DSS if payments involved, HIPAA if health data
10. Create a security coding standards document that ALL junior agents must follow when writing code
11. Define penetration testing checklist

**Outputs:**
```
security_audit.md          — OWASP Top 10 assessment, risk levels
security_checklist.md      — SHARED WITH ALL AGENTS — mandatory rules every agent reads
input_validation_rules.md  — per-endpoint validation specs
rbac_matrix.md             — role/permission matrix for all endpoints
encryption_spec.md         — what is encrypted, how, key management
secrets_management.md      — how secrets are stored, rotated, accessed
rate_limiting_spec.md      — specific numbers for all rate limits
compliance_report.md       — GDPR/PCI/HIPAA checklist
pentest_checklist.md       — security testing checklist for QA agent
```

**No HITL checkpoint** — runs automatically after Architecture approval.

---

### Agent 06 — Design

**Trigger phrase (no-code):** `RUN: Design`
**Role:** Senior UI/UX Designer
**Position in pipeline:** Sixth

**Reads from:**
- `user_input.json` (platform, target users)
- `personas.md`
- `user_journeys.md`
- `mvp_scope.md`
- `api_contracts.yaml` (to understand data available for UI)

**Responsibilities:**
1. Define the complete design system:
   - Color palette: primary, secondary, accent, neutral, semantic colors (success/warning/error/info) with hex values
   - Typography: font family, size scale (xs/sm/base/lg/xl/2xl/3xl/4xl), weight scale, line heights
   - Spacing scale (4px base system: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128)
   - Border radius scale
   - Shadow scale
   - Animation/transition standards
2. Define all UI components needed and their props/states:
   - For each component: name, variants, states (default/hover/active/disabled/loading/error), props
3. Map all screens/pages needed:
   - Screen name, purpose, URL route, which persona uses it, which user journey it belongs to
4. Create detailed wireframes for every screen (ASCII art or detailed text descriptions)
5. Define responsive breakpoints and behavior at each: mobile (< 768px), tablet (768–1024px), desktop (> 1024px)
6. Define empty states for every list/table (no data yet)
7. Define error states (network error, validation error, not found, server error)
8. Define loading states for every async operation
9. Define accessibility requirements: WCAG 2.1 AA minimum, keyboard navigation, screen reader labels
10. Define dark mode support (if applicable based on product type)
11. Define notification and toast patterns

**Outputs:**
```
design_system.md           — complete design tokens (colors, type, spacing, etc.)
component_spec.md          — all components with variants and states
screen_inventory.md        — all pages, routes, purposes
wireframes.md              — detailed wireframe per screen
responsive_spec.md         — breakpoint behavior
state_spec.md              — empty, error, loading states for all scenarios
accessibility_guide.md     — WCAG checklist and implementation notes
```

**HITL checkpoint:** Yes — user approves design system and wireframes before frontend code begins. This is CHECKPOINT #3.

---

### Agent 07 — FrontendSenior

**Trigger phrase (no-code):** `RUN: FrontendSenior`
**Role:** Senior Frontend Engineer / Tech Lead
**Position in pipeline:** Seventh

**Reads from:**
- `tech_stack.md`
- `folder_structure.md`
- `design_system.md`
- `component_spec.md`
- `screen_inventory.md`
- `wireframes.md`
- `api_contracts.yaml`
- `auth_strategy.md`
- `security_checklist.md`
- `tasks.json` (frontend tasks only)

**Responsibilities:**
1. Create the complete project boilerplate:
   - Package.json with all dependencies
   - TypeScript config (tsconfig.json)
   - ESLint config (.eslintrc)
   - Prettier config (.prettierrc)
   - Tailwind config (tailwind.config.js) with design tokens from design system
   - Environment variables template (.env.example)
   - Git hooks config (Husky + lint-staged)
2. Define the routing structure: all routes, layouts, and route guards
3. Define state management approach: global state (Zustand/Redux Toolkit), server state (React Query/TanStack Query), form state (React Hook Form)
4. Define the API client layer: how the frontend calls the backend (axios instance, error handling, token refresh)
5. Break down frontend work into 4 modules, one per Junior agent:
   - **Module A:** Authentication (login, signup, password reset, OAuth)
   - **Module B:** Core feature screens (main product functionality)
   - **Module C:** Admin/settings screens
   - **Module D:** Shared components library
6. Write the specification document each Junior agent will receive (their exact task list)
7. Define the merge strategy: how Junior code gets integrated, naming conventions, import paths

**Outputs:**
```
fe_boilerplate/            — all config files (package.json, tsconfig, .eslintrc, etc.)
fe_module_plan.md          — breakdown of 4 modules with responsibilities
fe_junior_a_spec.md        — exact spec for Frontend Junior A (Auth)
fe_junior_b_spec.md        — exact spec for Frontend Junior B (Core Features)
fe_junior_c_spec.md        — exact spec for Frontend Junior C (Admin/Settings)
fe_junior_d_spec.md        — exact spec for Frontend Junior D (Shared Components)
fe_routing_structure.md    — all routes and route guards
fe_state_management.md     — state architecture decisions
fe_api_client.md           — API client setup and patterns
```

---

### Agent 08 — FrontendJuniors (×4, Parallel)

**Trigger phrase (no-code):** `RUN: FrontendJuniors`
**Role:** Mid-level Frontend Engineers (4 running simultaneously)
**Position in pipeline:** Eighth
**Execution:** All 4 run in PARALLEL (Promise.all in API mode; sequentially in no-code mode)

Each Junior reads:
- Their specific spec file (`fe_junior_[a/b/c/d]_spec.md`)
- `design_system.md` (must follow tokens exactly)
- `api_contracts.yaml` (must match API shapes exactly)
- `security_checklist.md` (must follow security rules)
- `fe_boilerplate/` (must use the established patterns)
- `component_spec.md`

**Frontend Junior A — Authentication Module**
Produces: login page, signup page, forgot/reset password flow, OAuth buttons (Google/GitHub), auth context and hooks, protected route HOC, token storage and refresh logic, form validation with Zod

**Frontend Junior B — Core Feature Screens**
Produces: all main product screens as defined in screen_inventory.md, data fetching hooks (React Query), pagination/infinite scroll where applicable, real-time updates where required (WebSocket/SSE), search and filter UI

**Frontend Junior C — Admin / Settings Screens**
Produces: user management table, role/permissions UI, account settings page, billing/subscription page, notification preferences, audit log view (if applicable), system configuration UI

**Frontend Junior D — Shared Component Library**
Produces: ALL reusable components from component_spec.md — buttons, inputs, selects, modals, drawers, toasts, tables, pagination, skeleton loaders, error boundaries, layout components (Grid, Flex, Container), theme provider, icon system

**Each Junior outputs:**
```
src/modules/[module-name]/   — complete module code
  ├── components/            — React components
  ├── hooks/                 — custom hooks
  ├── pages/                 — page components
  ├── services/              — API calls for this module
  ├── types/                 — TypeScript types
  ├── utils/                 — utility functions
  └── index.ts               — public exports
```

---

### Agent 09 — FrontendGate

**Trigger phrase (no-code):** `RUN: FrontendGate`
**Role:** Senior Frontend Engineer (Code Reviewer)
**Position in pipeline:** Ninth

**Reads from:**
- All code produced by FrontendJuniors A, B, C, D
- `design_system.md` (compliance check)
- `api_contracts.yaml` (contract compliance check)
- `security_checklist.md` (security compliance check)
- `component_spec.md` (component API compliance check)
- `accessibility_guide.md` (accessibility check)

**Review checklist (checks every single item):**
- [ ] Every component follows design token values exactly (no hardcoded hex colors, no arbitrary px values)
- [ ] All TypeScript is strictly typed (no `any`, no `unknown` unhandled)
- [ ] All async operations have loading states, error states, and success states
- [ ] All forms use React Hook Form + Zod validation
- [ ] All API calls use the established API client (no raw fetch)
- [ ] All routes have appropriate guards (protected routes check auth)
- [ ] No hardcoded strings that should be constants or env vars
- [ ] No console.log statements left in code
- [ ] All components are accessible (keyboard navigable, ARIA labels, contrast ratios)
- [ ] All images have alt text
- [ ] No API keys or secrets in frontend code
- [ ] All pages are responsive (tested against breakpoints from spec)
- [ ] Unit tests exist for all hooks and utility functions
- [ ] Component tests exist for all interactive components

**Outputs:**
```
fe_review_report.md        — pass/fail per file, issues listed with line references
fe_fix_tasks.json          — structured list of fixes required, assigned to correct Junior
fe_gate_status.json        — {status: "pass" | "fail", critical_issues: n, warnings: n}
```

**Gate rule:** If `fe_gate_status.json` is `"fail"`, the relevant Junior runs again with the fix tasks. Max 2 review cycles. If still failing after 2 cycles → flag for human.

---

### Agent 10 — BackendSenior

**Trigger phrase (no-code):** `RUN: BackendSenior`
**Role:** Senior Backend Engineer / Tech Lead
**Position in pipeline:** Tenth

**Reads from:**
- `tech_stack.md`
- `folder_structure.md`
- `database_schema.sql`
- `api_contracts.yaml`
- `auth_strategy.md`
- `security_checklist.md`
- `caching_strategy.md`
- `rate_limiting_spec.md`
- `tasks.json` (backend tasks only)
- `integrations.md`
- `environment_config.md`

**Responsibilities:**
1. Create complete backend boilerplate:
   - package.json (or requirements.txt for Python) with all dependencies
   - TypeScript/Python config
   - ESLint/Pylint config
   - Environment variables template
   - Database connection setup
   - ORM initialization and configuration
   - Migration setup
2. Set up global middleware chain in correct order:
   - Request ID injection (every request gets a UUID for tracing)
   - CORS configuration (exact origins, methods, headers)
   - Rate limiting (using specs from rate_limiting_spec.md)
   - Authentication middleware (JWT verification)
   - Request logging (structured JSON logs)
   - Request body validation (Zod/Joi)
   - Error handling middleware (global catch-all)
3. Write base error handling system: custom error classes, error codes, HTTP status mapping
4. Write base logging system: structured logs, log levels, request/response logging
5. Assign modules to Backend Juniors:
   - **Module A:** Authentication Service
   - **Module B:** Core Domain Entities (main product data)
   - **Module C:** Payments & Billing
   - **Module D:** Notifications & Communication
6. Write exact spec for each Backend Junior

**Outputs:**
```
be_boilerplate/            — all config files and setup
be_module_plan.md          — breakdown of 4 backend modules
be_junior_a_spec.md        — spec for Backend Junior A (Auth)
be_junior_b_spec.md        — spec for Backend Junior B (Core Domain)
be_junior_c_spec.md        — spec for Backend Junior C (Payments)
be_junior_d_spec.md        — spec for Backend Junior D (Notifications)
be_middleware_setup.md     — complete middleware chain code
be_error_strategy.md       — error classes, codes, response formats
be_logging_setup.md        — logging configuration and patterns
```

---

### Agent 11 — BackendJuniors (×4, Parallel)

**Trigger phrase (no-code):** `RUN: BackendJuniors`
**Role:** Mid-level Backend Engineers (4 running simultaneously)
**Position in pipeline:** Eleventh
**Execution:** Parallel (same as FrontendJuniors)

**Backend Junior A — Authentication Service**
Produces: register endpoint, login endpoint, logout endpoint, JWT issue + refresh + revoke, OAuth2 (Google/GitHub), password hashing (bcrypt/argon2), email verification flow, password reset flow, rate limiting on auth routes, 2FA (TOTP) if required, session management, unit tests for all auth logic

**Backend Junior B — Core Domain Module**
Produces: all CRUD endpoints for the main product entities as defined in api_contracts.yaml, business logic services, database repository layer, input validation for all endpoints, pagination logic, search and filter logic, unit and integration tests

**Backend Junior C — Payments Module**
Produces: Stripe/Razorpay integration, subscription plan management, checkout session creation, webhook handler (with signature verification), invoice generation, payment history endpoints, refund flow, billing portal session, tax calculation, payment failure recovery, unit tests

**Backend Junior D — Notifications Module**
Produces: email service (SendGrid/SES/Resend), push notification service (FCM), in-app notification system (stored notifications, mark read/unread), notification preference API, notification template engine (HTML email templates), bulk notification sender, notification event hooks, unit tests

**Each Junior outputs:**
```
src/modules/[module-name]/
  ├── [module].controller.ts    — route handlers
  ├── [module].service.ts       — business logic
  ├── [module].repository.ts    — database queries
  ├── [module].routes.ts        — route definitions
  ├── [module].validation.ts    — Zod/Joi schemas
  ├── [module].types.ts         — TypeScript interfaces
  └── [module].test.ts          — unit + integration tests
```

---

### Agent 12 — BackendGate

**Trigger phrase (no-code):** `RUN: BackendGate`
**Role:** Senior Backend Engineer (Code Reviewer)
**Position in pipeline:** Twelfth

**Review checklist:**
- [ ] All endpoints match OpenAPI spec exactly (URL, method, request body, response shape)
- [ ] All endpoints have authentication middleware where required (per RBAC matrix)
- [ ] All inputs validated with Zod/Joi schema before processing
- [ ] No SQL injection risk: all queries use parameterized statements or ORM
- [ ] No mass assignment vulnerabilities: explicit field whitelisting on all updates
- [ ] All errors use the standard error class and return correct HTTP status codes
- [ ] No sensitive data returned in error messages
- [ ] All database queries have appropriate indexes (check against schema)
- [ ] No N+1 query patterns (check all list endpoints with related data)
- [ ] Request logging present on all routes
- [ ] Rate limiting applied on all required endpoints (per rate_limiting_spec.md)
- [ ] Secrets accessed only via environment variables, never hardcoded
- [ ] File uploads validated: type, size, malware scan hook
- [ ] Pagination implemented on all list endpoints
- [ ] Unit tests present with > 80% coverage per module

**Outputs:**
```
be_review_report.md        — pass/fail per file with issues and line references
be_fix_tasks.json          — structured fix list assigned to correct Junior
be_gate_status.json        — {status: "pass" | "fail", critical_issues: n}
```

---

### Agent 13 — Integration

**Trigger phrase (no-code):** `RUN: Integration`
**Role:** Full-Stack Integration Engineer
**Position in pipeline:** Thirteenth

**Reads from:**
- All frontend module code
- All backend module code
- `api_contracts.yaml`
- `environment_config.md`
- `auth_strategy.md`

**Responsibilities:**
1. Wire up all frontend API calls to their corresponding backend endpoints
2. Verify request/response shapes match the OpenAPI contract exactly
3. Set up CORS configuration correctly (frontend origin in backend config)
4. Configure authentication headers: how the frontend sends tokens, how backend validates
5. Set up the API client interceptors: token refresh on 401, error normalization
6. Remove all mock data, stub responses, and hardcoded values from frontend
7. Configure all environment variables for all environments (dev/staging/prod)
8. Set up WebSocket / Server-Sent Events connections if real-time features required
9. Integrate all third-party SDKs (analytics, monitoring, error tracking)
10. Run an integration smoke test: verify each endpoint is reachable end-to-end
11. Document every integration point with example request/response

**Outputs:**
```
integration_report.md      — list of all wired integrations, any mismatches found and fixed
env_configs/
  ├── .env.development      — development environment variables (with safe values)
  ├── .env.staging          — staging environment variables (with placeholders)
  └── .env.production       — production environment variables (with placeholders)
integration_smoke_test.md  — checklist of integration tests run and results
```

---

### Agent 14 — QA

**Trigger phrase (no-code):** `RUN: QA`
**Role:** QA Lead + 8 Specialized QA Sub-Agents
**Position in pipeline:** Fourteenth

**Reads from:**
- All frontend and backend code
- `acceptance_criteria.md`
- `api_contracts.yaml`
- `security_checklist.md`
- `pentest_checklist.md`
- `performance_spec` (from architecture)
- `accessibility_guide.md`

**8 Sub-Agent Test Types:**

**QA-1: Unit Tests**
- Every function, hook, utility, service method
- Test framework: Jest (frontend + backend)
- Target: 80% line coverage minimum

**QA-2: Integration Tests**
- API ↔ Database integration
- Service ↔ Service calls
- Framework: Jest + Supertest

**QA-3: End-to-End Tests**
- All critical user journeys from acceptance_criteria.md
- Framework: Playwright
- Coverage: all happy paths + most critical error paths

**QA-4: Performance Tests**
- Frontend: Lighthouse score targets (Performance ≥ 85, Accessibility ≥ 90, SEO ≥ 90)
- Backend: k6 load test script — 100 concurrent users, measure p95 response time

**QA-5: Security Tests**
- Run through pentest_checklist.md systematically
- Check: SQL injection, XSS, CSRF, auth bypass, IDOR, rate limit bypass
- Dependency audit: npm audit / pip-audit

**QA-6: Accessibility Tests**
- axe-core automated scan on all pages
- Keyboard navigation test on all interactive elements
- Screen reader annotation check

**QA-7: Cross-Browser / Device Tests**
- Test matrix: Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile: iOS Safari, Android Chrome
- Document any browser-specific issues

**QA-8: Regression Tests**
- Verify all previously working features still work after integration
- Run full acceptance criteria checklist

**Outputs:**
```
test_suite/
  ├── unit/                   — all unit test files
  ├── integration/            — all integration test files
  ├── e2e/                    — all Playwright test files
  ├── performance/            — k6 load test scripts
  └── security/               — security test scripts
bug_report.md                — all bugs: severity (Critical/High/Medium/Low), description, steps to reproduce, expected vs actual
fix_tasks.json               — structured bug list for FixLoop agent
coverage_report.md           — coverage % per module
performance_report.md        — Lighthouse scores, load test results
security_report.md           — security test results
accessibility_report.md      — WCAG violations list
```

---

### Agent 15 — FixLoop

**Trigger phrase (no-code):** `RUN: FixLoop`
**Role:** Bug Fix Coordinator (loops until all Critical + High bugs resolved)
**Position in pipeline:** Fifteenth
**Execution:** Loops — runs until exit condition met

**Loop logic:**
```
1. Read bug_report.md and fix_tasks.json
2. Filter: Critical and High severity only
3. For each bug:
   a. Classify which module it belongs to (FE/BE + which Junior)
   b. Generate a specific fix with explanation
   c. Apply the fix to the codebase
   d. Run the specific test that covers this bug
   e. If test passes → mark bug as RESOLVED
   f. If test fails → try again with different approach (max 3 attempts)
   g. If 3 attempts fail → ESCALATE to human (flag in UI)
4. After all Critical/High bugs processed → run regression tests
5. Check: any new bugs introduced by fixes? → add to list
6. Repeat until: zero Critical bugs, zero High bugs remaining
7. Log all Medium/Low bugs to backlog (do not fix in this loop)
```

**Exit conditions:**
- ✅ PASS: All Critical and High bugs resolved, regression tests pass
- ⚠️ PARTIAL: Some Medium/Low bugs remain → log to backlog, proceed
- 🚨 BLOCKED: One or more Critical bugs cannot be resolved after 3 attempts → pause pipeline, notify human

**Outputs:**
```
fixed_patches.md           — description of every fix applied
resolved_bugs.json         — list of resolved bug IDs with fix descriptions
unresolved_bugs.json       — list of bugs that could not be resolved (escalated)
backlog_bugs.json          — Medium/Low bugs deferred to V2
retest_results.md          — results of regression run after fixes
```

**HITL checkpoint:** If any bugs in `unresolved_bugs.json` → human must resolve before pipeline continues.

---

### Agent 16 — Observability

**Trigger phrase (no-code):** `RUN: Observability`
**Role:** Site Reliability Engineer
**Position in pipeline:** Sixteenth

**Reads from:**
- `tech_stack.md`
- `system_architecture.md`
- `be_logging_setup.md`
- `environment_config.md`

**Responsibilities:**
1. Set up Application Performance Monitoring (APM): choose Sentry, Datadog, or New Relic based on tech stack; provide setup code
2. Set up error tracking: Sentry integration for both frontend and backend
3. Set up uptime monitoring: configuration for external uptime checker
4. Define monitoring dashboard requirements: key metrics to track (request rate, error rate, latency p50/p95/p99, active users, queue depth)
5. Write alerting rules: what triggers an alert, who gets notified, at what threshold
6. Set up distributed tracing: OpenTelemetry configuration for tracing requests across frontend and backend
7. Set up log aggregation: how logs flow from services to central store
8. Write post-deployment smoke test script: automated checks run after every deploy to verify health
9. Define on-call runbook: what to do when each alert fires

**Outputs:**
```
observability_setup.md     — complete setup instructions
monitoring_config/
  ├── sentry.config.ts     — Sentry frontend + backend config
  ├── otel.config.ts       — OpenTelemetry tracing setup
  └── alerts.yaml          — alert rule definitions
smoke_test_script.sh       — post-deploy health check script
runbook.md                 — on-call incident response guide
pipeline_cost_tracker.md   — Claude API token usage and cost per agent in this run
```

---

### Agent 17 — DevOps

**Trigger phrase (no-code):** `RUN: DevOps`
**Role:** Senior DevOps / Platform Engineer
**Position in pipeline:** Seventeenth

**Reads from:**
- `tech_stack.md`
- `system_architecture.md`
- `environment_config.md`
- `database_schema.sql`
- All service code (to understand what needs to be containerized)

**Responsibilities:**
1. Write Dockerfile for every service (multi-stage builds, minimal final image size)
2. Write docker-compose.yml for local development (all services + databases + Redis)
3. Write CI/CD pipeline (GitHub Actions):
   - On PR: lint → type-check → unit tests → build
   - On merge to main: full test suite → build → deploy to staging
   - On release tag: deploy to production with rollback capability
4. Write Infrastructure as Code (Terraform):
   - Cloud provider resources (choose cheapest appropriate option based on complexity)
   - Database setup (managed PostgreSQL)
   - Redis setup (managed)
   - CDN configuration
   - DNS configuration
5. Configure environment-specific deployments: dev, staging, production
6. Set up database migration strategy: how migrations run on deploy
7. Define backup strategy: frequency, retention, restore procedure
8. Define rollback strategy: how to rollback a failed deployment
9. Configure auto-scaling: when to scale up, when to scale down
10. Set up SSL/TLS certificates
11. Write deployment runbook

**Outputs:**
```
docker/
  ├── Dockerfile.frontend    — frontend container
  ├── Dockerfile.backend     — backend container
  └── docker-compose.yml     — local dev setup
.github/workflows/
  ├── ci.yml                 — PR checks pipeline
  ├── deploy-staging.yml     — staging deployment
  └── deploy-production.yml  — production deployment
infrastructure/
  ├── main.tf                — Terraform main config
  ├── variables.tf           — Terraform variables
  ├── outputs.tf             — Terraform outputs
  └── modules/               — Reusable Terraform modules
deployment_runbook.md        — step-by-step deployment guide
backup_strategy.md           — backup and restore procedures
rollback_runbook.md          — how to rollback any deployment
```

**HITL checkpoint:** Yes — user reviews DevOps config before any actual deployment. This is CHECKPOINT #4. Final checkpoint before production.

---

### Agent 18 — Documentation

**Trigger phrase (no-code):** `RUN: Documentation`
**Role:** Technical Writer
**Position in pipeline:** Eighteenth (final agent)

**Reads from:**
- EVERYTHING — all files in the context store

**Responsibilities:**
1. Write README.md: project overview, prerequisites, setup instructions (clone → install → env vars → run), testing instructions, deployment instructions
2. Generate full API documentation from OpenAPI spec (Swagger UI config)
3. Write architecture documentation: why each technical decision was made
4. Write frontend component documentation: storybook-ready format with usage examples
5. Write database documentation: table descriptions, column explanations, relationship diagrams
6. Write user guide: end-user documentation (non-technical), how to use the product
7. Write developer onboarding guide: for a new developer joining the project
8. Write CHANGELOG.md: version history (v1.0.0 → what was built)
9. Write CONTRIBUTING.md: how to contribute (for open-source projects)
10. Compile the final delivery summary: one-page overview of everything produced

**Outputs:**
```
README.md                  — complete project readme
docs/
  ├── api/                 — API documentation (Swagger config)
  ├── architecture.md      — Architecture decisions and rationale
  ├── components.md        — Frontend component library docs
  ├── database.md          — Database schema documentation
  ├── user_guide.md        — End-user documentation
  ├── developer_guide.md   — Developer onboarding
  └── deployment_runbook.md — How to deploy
CHANGELOG.md               — Version history
CONTRIBUTING.md            — Contribution guidelines
final_delivery_summary.md  — One-page project overview
```

**No HITL checkpoint** — this is the final agent. After this, the pipeline is complete.

---

## 5. MONETIZATION & PRICING

### Pricing Tiers — Full Definition

| Tier | Price | Runs/Month | Agents Available | Code Output | API Access | Support |
|---|---|---|---|---|---|---|
| **Free** | $0 | 2 | Agents 1–6 only | No (teaser view) | No | None |
| **Starter** | $29/mo | 15 | All 18 | Yes (ZIP download) | No | Email (48h) |
| **Pro** | $99/mo | 60 | All 18 + custom | Yes + GitHub push | Yes (REST API) | Email (24h) + chat |
| **Enterprise** | $499+/mo | Unlimited | All 18 + custom | Yes + all integrations | Yes + webhooks | Dedicated + SLA |

### Pay-Per-Use Credits (Alongside Subscriptions)
- 1 credit = 1 pipeline run
- Credits purchased via Stripe one-time payment
- Credit pack pricing: 5 credits = $12 ($2.40/run), 20 credits = $40 ($2/run), 50 credits = $90 ($1.80/run)
- Credits never expire
- Can be purchased by any tier including Free

### Freemium Conversion Funnel
```
Free user completes run (Agents 1–6)
         ↓
Sees teaser: "Your Architecture, Security & Design results are ready —
             plus 12 more agents including full code generation"
         ↓
[Preview blurred output] [Upgrade to see full results]
         ↓
Upgrade modal: Starter $29/mo — shows what they'd get
         ↓
Stripe checkout (< 60 seconds)
         ↓
Pipeline resumes from Agent 7
```

### Cost Per Run (Internal Calculation — for pricing validation)
Estimated Claude API cost per full 18-agent run:
- Average tokens per agent: ~15,000 input + ~8,000 output = ~23,000 tokens
- 18 agents × 23,000 = ~414,000 tokens per run
- claude-sonnet-4-6 pricing: ~$3/million input tokens, ~$15/million output tokens
- Estimated cost: (18 × 15K × $3/1M) + (18 × 8K × $15/1M) = $0.81 + $2.16 = ~$3/run
- At Starter ($29/15 runs): $29 revenue, ~$45 API cost at 15 runs → **LOSS**
- Fix: Starter = 10 runs max (not 15) → $29 revenue, ~$30 API cost → break even
- Pro ($99/60 runs): $99 revenue, ~$180 API cost → **LOSS**
- Fix: Pro = 30 runs/month → $99 revenue, ~$90 cost → profitable
- **REVISED PRICING:**

| Tier | Price | Runs/Month | API Cost Estimate | Gross Margin |
|---|---|---|---|---|
| Free | $0 | 2 (limited to Agent 1–6) | ~$0.50/run × 2 = $1 | -$1/user/month |
| Starter | $29 | 10 full runs | ~$3/run × 10 = $30 | ~-$1 (near break even) |
| Pro | $99 | 30 full runs | ~$3/run × 30 = $90 | ~$9 (9% margin) |
| Enterprise | $499 | 100 full runs | ~$3/run × 100 = $300 | ~$199 (40% margin) |

**Note:** Margins improve as: (a) prompts get optimized to use fewer tokens, (b) we use cheaper models for simpler agents, (c) volume grows and Anthropic offers better rates.

### Refund & Fair-Use Policies
- **Refund:** 7-day money-back guarantee, no questions asked, for Starter and Pro
- **Fair use (Pro):** Maximum 5 runs per day (to prevent abuse of "unlimited" claim)
- **Data retention:** Free runs deleted after 30 days. Paid runs stored for 1 year. Enterprise: unlimited.
- **Abuse prevention:** Email verification required before first run. Max 3 concurrent runs per account.

---

## 6. FULL FEATURE LIST BY PHASE

### Phase 1 — MVP (Weeks 1–8, Required for Beta Launch)

**Authentication & Accounts**
- [ ] Email + password signup with email verification
- [ ] Google OAuth login
- [ ] Clerk-managed sessions with automatic token refresh
- [ ] User profile (name, email, avatar)
- [ ] Password change flow
- [ ] Account deletion (GDPR compliant)

**Pipeline**
- [ ] Input form: text description (rich text), mode selection (Build/Strategy/Manage), optional file upload (PDF, DOCX, TXT, max 10MB)
- [ ] InputLayer runs immediately on submit; shows parsed input for user confirmation
- [ ] Full 18-agent pipeline execution via Inngest background job
- [ ] Live progress UI: agent status (pending/running/complete/failed), elapsed time per agent
- [ ] Output streaming: each agent's output appears as it completes (SSE or polling)
- [ ] Context store: all agent outputs saved to Supabase per run_id
- [ ] Per-agent output viewer: collapsible sections, syntax highlighting for code, markdown rendering for docs
- [ ] Full output download: ZIP of all files, organized by category
- [ ] HITL checkpoints: user approval required at agents 1, 3, 4, 6, 17 before next agent runs

**Run Management**
- [ ] Run history: list of all past runs with status, date, mode, project name
- [ ] Run detail page: full output of every agent for a past run
- [ ] Run resume: if pipeline is paused at HITL checkpoint, user can resume
- [ ] Run retry: if pipeline failed, user can retry from the failed agent

**Billing**
- [ ] Stripe integration: Free/Starter/Pro/Enterprise plans
- [ ] Upgrade/downgrade flow
- [ ] Usage counter: runs used vs. limit this month
- [ ] Billing portal: Stripe Customer Portal for invoice history, payment method change
- [ ] Usage alerts: email when 80% and 100% of monthly runs used

**Dashboard**
- [ ] Overview: recent runs, usage stats, plan info
- [ ] Empty state: guided CTA for first run
- [ ] Onboarding: 3-step guided tour on first login

**Infrastructure**
- [ ] Deployed to Vercel (auto-deploy on push to main)
- [ ] Supabase database (PostgreSQL)
- [ ] Inngest for background job execution
- [ ] PostHog for analytics
- [ ] Resend for transactional email
- [ ] Error tracking (Sentry)

### Phase 2 — Growth (Weeks 9–12, Post-Beta)

**Credits System**
- [ ] Credit pack purchase (Stripe one-time payment)
- [ ] Credit balance display in dashboard
- [ ] Credits consumed automatically when subscription runs exhausted

**API Access (Pro+)**
- [ ] API key management page (generate, revoke, view last used)
- [ ] REST API: `POST /api/v1/runs` to trigger pipeline programmatically
- [ ] REST API: `GET /api/v1/runs/:id` to poll status and get outputs
- [ ] API documentation page (interactive, Swagger UI)
- [ ] Webhook support: notify a URL when pipeline completes

**Custom Agents**
- [ ] Agent editor UI: view and edit the system prompt of any agent
- [ ] Save custom agent configuration per user account
- [ ] Reset to default agent configuration

**Pipeline Templates**
- [ ] Template library: 5+ pre-built templates (SaaS, mobile app, REST API, e-commerce, landing page)
- [ ] Template selection on run creation (pre-fills input form)
- [ ] Save a run as a template (Pro+)

**HITL Enhancement**
- [ ] HITL approval UI: rich display of agent output + approve/reject/edit buttons
- [ ] HITL notifications: email when pipeline is waiting for approval
- [ ] HITL skip option: Pro users can disable HITL and run fully automatically

**Integrations**
- [ ] GitHub integration: auto-push generated code to a new or existing repo
- [ ] Notion integration: push documentation to a Notion workspace
- [ ] Jira integration: push tasks to a Jira project

### Phase 3 — Scale (Month 3+)

**Team Features**
- [ ] Team workspaces: invite members, shared run history, shared templates
- [ ] Role-based access: Owner, Admin, Member, Viewer
- [ ] Team billing: one Stripe subscription covers all seats

**Enterprise Features**
- [ ] White-label: custom domain, custom logo, remove PipelineAI branding
- [ ] SSO/SAML integration
- [ ] Audit logs: who ran what pipeline when
- [ ] Data residency options (EU, US, India)
- [ ] Dedicated support Slack channel

**Custom Pipeline Builder**
- [ ] Visual pipeline editor: drag-and-drop agent sequencer
- [ ] Custom agent creation from scratch
- [ ] Pipeline sharing: share custom pipelines with team or publicly

**Marketplace**
- [ ] Community agent library: browse and install community-created agents
- [ ] Publish your custom agents to marketplace
- [ ] Revenue sharing for marketplace creators (Pro+)

**Analytics**
- [ ] Admin analytics dashboard: total runs, revenue, DAU/MAU, popular modes
- [ ] Per-user analytics: their usage patterns, most-used agents, success rates

---

## 7. SYSTEM ARCHITECTURE

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                       │
│                   Next.js React Frontend                    │
│         (pages, components, state management)               │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   NEXT.JS APP (Vercel)                      │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────────────────┐   │
│  │  React Pages    │    │     API Routes (/api/*)      │   │
│  │  & Components   │    │                             │   │
│  │                 │    │  /api/auth/*  → Clerk        │   │
│  │  App Router     │    │  /api/runs/*  → Run mgmt    │   │
│  │  Layouts        │    │  /api/billing/* → Stripe    │   │
│  │  Server Comps   │    │  /api/webhooks/* → Events   │   │
│  └─────────────────┘    └──────────────┬────────────┘   │
└───────────────────────────────────────┬┼────────────────────┘
                                        ││
           ┌────────────────────────────┘│
           │                             │
           ▼                             ▼
┌──────────────────┐         ┌───────────────────────┐
│      CLERK       │         │        INNGEST        │
│  (Auth Service)  │         │  (Background Jobs)    │
│                  │         │                       │
│  User sessions   │         │  Pipeline Orchestrator│
│  JWT tokens      │         │  Agent Runner (1→18)  │
│  OAuth providers │         │  Retry logic          │
└──────────────────┘         │  Event fan-out        │
                             └──────────┬────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
          ┌──────────────┐   ┌──────────────────┐  ┌──────────────┐
          │   SUPABASE   │   │  ANTHROPIC API   │  │    STRIPE    │
          │              │   │                  │  │              │
          │  PostgreSQL  │   │  claude-sonnet   │  │ Subscriptions│
          │  File Storage│   │  -4-6            │  │ Credits      │
          │  Real-time   │   │  /v1/messages    │  │ Webhooks     │
          └──────────────┘   └──────────────────┘  └──────────────┘
```

### Pipeline Job Architecture (Inngest)

```
HTTP POST /api/runs (user triggers)
         │
         ▼
Inngest Event: "pipeline/run.created"
         │
         ▼
Inngest Function: orchestratePipeline(runId)
         │
         ├── Step 1: runAgent(01, "InputLayer")
         │     ├── Load context files needed
         │     ├── Call Claude API with system prompt
         │     ├── Parse response → save files to Supabase
         │     ├── Update run status in DB
         │     └── Emit event: "pipeline/agent.completed" {agentNumber: 1}
         │
         ├── [UI: HITL Checkpoint — user confirms input parsing]
         │
         ├── Step 2: runAgent(02, "RequirementAnalyst")
         │     └── (same pattern)
         │
         ├── Step 3: runAgent(03, "ProjectManager")
         │     └── ...
         │
         ├── [UI: HITL Checkpoint #1 — user approves MVP scope]
         │
         ├── Step 4: runAgent(04, "Architecture")
         │     └── ...
         │
         ├── [UI: HITL Checkpoint #2 — user approves tech stack]
         │
         ├── Step 5: runAgent(05, "Security")      ─┐
         │                                           │ Sequential
         ├── Step 6: runAgent(06, "Design")         ─┘
         │
         ├── [UI: HITL Checkpoint #3 — user approves design]
         │
         ├── Step 7: runAgent(07, "FrontendSenior")
         │
         ├── [Summarization Checkpoint — compress context]
         │
         ├── Step 8: Parallel FrontendJuniors
         │     ├── runAgent(08a, "FrontendJuniorA")
         │     ├── runAgent(08b, "FrontendJuniorB")
         │     ├── runAgent(08c, "FrontendJuniorC")
         │     └── runAgent(08d, "FrontendJuniorD")
         │           (all run simultaneously via Promise.all)
         │
         ├── Step 9: runAgent(09, "FrontendGate")
         │     └── if fail → loop FrontendJuniors (max 2 times)
         │
         ├── Step 10: runAgent(10, "BackendSenior")
         │
         ├── Step 11: Parallel BackendJuniors (same as FE)
         │
         ├── Step 12: runAgent(12, "BackendGate")
         │     └── if fail → loop BackendJuniors (max 2 times)
         │
         ├── [Summarization Checkpoint — compress context]
         │
         ├── Step 13: runAgent(13, "Integration")
         │
         ├── Step 14: runAgent(14, "QA")
         │
         ├── Step 15: FixLoop (retries until no Critical/High bugs)
         │     └── max 3 iterations before human escalation
         │
         ├── Step 16: runAgent(16, "Observability")
         │
         ├── Step 17: runAgent(17, "DevOps")
         │
         ├── [UI: HITL Checkpoint #4 — user approves before final assembly]
         │
         ├── Step 18: runAgent(18, "Documentation")
         │
         └── Pipeline Complete → notify user → generate ZIP
```

---

## 8. DATABASE SCHEMA — COMPLETE

```sql
-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id      VARCHAR(255) UNIQUE NOT NULL,        -- Clerk's user ID
  email         VARCHAR(255) UNIQUE NOT NULL,
  name          VARCHAR(255),
  avatar_url    TEXT,
  plan          VARCHAR(50) DEFAULT 'free'           -- free | starter | pro | enterprise
                CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  credits       INTEGER DEFAULT 0,                  -- pay-per-use credits
  runs_this_month INTEGER DEFAULT 0,                -- reset on billing cycle
  runs_limit    INTEGER DEFAULT 2,                  -- based on plan
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ                         -- soft delete for GDPR
);

-- ============================================
-- PIPELINE RUNS
-- ============================================
CREATE TABLE runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(500),                     -- auto-generated from input
  mode            VARCHAR(50) NOT NULL              -- build | strategy | manage
                  CHECK (mode IN ('build', 'strategy', 'manage')),
  status          VARCHAR(50) DEFAULT 'pending'
                  CHECK (status IN ('pending', 'running', 'waiting_hitl', 'complete', 'failed', 'cancelled')),
  current_agent   INTEGER DEFAULT 0,               -- which agent is running (1-18)
  input_text      TEXT NOT NULL,
  input_files     JSONB DEFAULT '[]',              -- array of file references
  error_message   TEXT,                            -- if status = failed
  total_tokens    INTEGER DEFAULT 0,
  total_cost_usd  DECIMAL(10, 4) DEFAULT 0,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_runs_user_id ON runs(user_id);
CREATE INDEX idx_runs_status ON runs(status);
CREATE INDEX idx_runs_created_at ON runs(created_at DESC);

-- ============================================
-- AGENT EXECUTIONS (one row per agent per run)
-- ============================================
CREATE TABLE agent_executions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id          UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  agent_number    SMALLINT NOT NULL CHECK (agent_number BETWEEN 1 AND 18),
  agent_name      VARCHAR(100) NOT NULL,
  status          VARCHAR(50) DEFAULT 'pending'
                  CHECK (status IN ('pending', 'running', 'complete', 'failed', 'skipped')),
  input_tokens    INTEGER DEFAULT 0,
  output_tokens   INTEGER DEFAULT 0,
  cost_usd        DECIMAL(10, 4) DEFAULT 0,
  duration_ms     INTEGER,
  retry_count     SMALLINT DEFAULT 0,
  error_message   TEXT,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(run_id, agent_number)
);

CREATE INDEX idx_agent_execs_run_id ON agent_executions(run_id);

-- ============================================
-- CONTEXT FILES (agent outputs stored per run)
-- ============================================
CREATE TABLE context_files (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id            UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  filename          VARCHAR(500) NOT NULL,          -- e.g., "requirements.md"
  category          VARCHAR(100),                  -- e.g., "planning", "code", "docs"
  content           TEXT NOT NULL,                 -- file content (markdown, JSON, SQL, etc.)
  content_size_bytes INTEGER,
  created_by_agent  SMALLINT,                      -- which agent created this file
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(run_id, filename)                         -- one file per name per run
);

CREATE INDEX idx_context_files_run_id ON context_files(run_id);
CREATE INDEX idx_context_files_created_by ON context_files(run_id, created_by_agent);

-- ============================================
-- HITL CHECKPOINTS
-- ============================================
CREATE TABLE hitl_checkpoints (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id          UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  checkpoint_number SMALLINT NOT NULL,             -- 1, 2, 3, 4
  checkpoint_name VARCHAR(200),                    -- human-readable name
  agent_number    SMALLINT NOT NULL,               -- which agent triggered this checkpoint
  status          VARCHAR(50) DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected', 'edited')),
  user_edits      JSONB,                           -- any edits the user made before approving
  approved_by     UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ
);

-- ============================================
-- SUBSCRIPTIONS (Stripe sync)
-- ============================================
CREATE TABLE subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id      VARCHAR(255) UNIQUE NOT NULL,
  stripe_subscription_id  VARCHAR(255) UNIQUE,
  stripe_price_id         VARCHAR(255),
  plan                    VARCHAR(50) NOT NULL,
  status                  VARCHAR(50) NOT NULL,    -- active | past_due | cancelled | trialing
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN DEFAULT FALSE,
  cancelled_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

-- ============================================
-- CREDIT TRANSACTIONS
-- ============================================
CREATE TABLE credit_transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  run_id            UUID REFERENCES runs(id),       -- null if purchase, set if consumption
  type              VARCHAR(50) NOT NULL
                    CHECK (type IN ('purchase', 'consumption', 'refund', 'bonus')),
  amount            INTEGER NOT NULL,               -- positive = add credits, negative = use credits
  stripe_payment_id VARCHAR(255),                  -- for purchases
  description       TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_txns_user_id ON credit_transactions(user_id);

-- ============================================
-- API KEYS (for Pro users)
-- ============================================
CREATE TABLE api_keys (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,            -- user-given name e.g., "Production"
  key_hash        VARCHAR(255) UNIQUE NOT NULL,     -- bcrypt hash of the actual key
  key_prefix      VARCHAR(20) NOT NULL,             -- first 8 chars for display e.g., "pk_live_"
  last_used_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USAGE LOGS (for analytics + billing)
-- ============================================
CREATE TABLE usage_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  run_id          UUID REFERENCES runs(id),
  event_type      VARCHAR(100) NOT NULL,            -- run_started | run_completed | agent_completed | etc.
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at DESC);

-- ============================================
-- PIPELINE TEMPLATES
-- ============================================
CREATE TABLE templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),        -- null = system template
  title           VARCHAR(300) NOT NULL,
  description     TEXT,
  mode            VARCHAR(50) NOT NULL,
  input_template  TEXT NOT NULL,                    -- pre-filled input text
  is_public       BOOLEAN DEFAULT FALSE,
  use_count       INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOM AGENT CONFIGS (per user, per agent)
-- ============================================
CREATE TABLE custom_agent_configs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_number    SMALLINT NOT NULL,
  system_prompt   TEXT NOT NULL,                    -- customized system prompt
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, agent_number)
);
```

---

## 9. API DESIGN

### Internal API Routes (Next.js API Routes)

**Authentication** (handled by Clerk middleware, no custom routes needed)

**Runs**
```
POST   /api/runs                  — Create new run, trigger Inngest job
GET    /api/runs                  — List user's runs (paginated)
GET    /api/runs/:id              — Get run details + all agent outputs
DELETE /api/runs/:id              — Cancel a run
POST   /api/runs/:id/approve      — Approve HITL checkpoint
POST   /api/runs/:id/reject       — Reject HITL checkpoint (with edits)
GET    /api/runs/:id/download     — Generate and download ZIP of all outputs
GET    /api/runs/:id/stream       — SSE stream of live agent updates
```

**Billing**
```
POST   /api/billing/create-checkout   — Create Stripe checkout session
POST   /api/billing/create-portal     — Create Stripe customer portal session
GET    /api/billing/usage             — Get current usage stats
POST   /api/billing/buy-credits       — Purchase credit pack
```

**Webhooks**
```
POST   /api/webhooks/stripe       — Handle Stripe events (subscription changes, payments)
POST   /api/webhooks/inngest      — Handle Inngest job callbacks
POST   /api/webhooks/clerk        — Handle Clerk user events (user.created, user.deleted)
```

**Templates**
```
GET    /api/templates             — List all templates (system + user's)
POST   /api/templates             — Create custom template
DELETE /api/templates/:id         — Delete user's template
```

**External API (v1, for Pro users)**
```
POST   /api/v1/runs               — Trigger pipeline (API key auth)
GET    /api/v1/runs/:id           — Poll run status and get outputs
GET    /api/v1/runs               — List runs
```

### Request/Response Standards

All API responses follow this format:
```typescript
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": { "code": "RUNS_LIMIT_EXCEEDED", "message": "You have used all 10 runs this month." } }

// Paginated list
{ "success": true, "data": [...], "pagination": { "page": 1, "pageSize": 20, "total": 47, "hasMore": true } }
```

---

## 10. FRONTEND — PAGES & COMPONENTS

### Page Inventory

| Page | Route | Auth Required | Description |
|---|---|---|---|
| Landing | `/` | No | Marketing homepage |
| Sign In | `/sign-in` | No | Clerk sign-in |
| Sign Up | `/sign-up` | No | Clerk sign-up |
| Dashboard | `/dashboard` | Yes | Overview of runs, usage, quick start |
| New Run | `/runs/new` | Yes | Input form to start a new pipeline |
| Run Detail | `/runs/[id]` | Yes | Live pipeline progress + outputs |
| Run History | `/runs` | Yes | All past runs |
| Templates | `/templates` | Yes | Browse and select templates |
| Billing | `/billing` | Yes | Subscription info, upgrade, credits |
| Settings | `/settings` | Yes | Account, API keys, custom agents |
| API Docs | `/docs/api` | No | Public API documentation |
| Admin | `/admin` | Admin only | Internal analytics |

### Key Component List

```
components/
├── layout/
│   ├── Sidebar.tsx              — Left nav with links, usage meter, plan badge
│   ├── TopBar.tsx               — Breadcrumb, user menu, notifications
│   └── PageWrapper.tsx          — Standard page container with title
│
├── pipeline/
│   ├── InputForm.tsx            — Multi-step run creation form
│   │   ├── ModeSelector.tsx     — Build / Strategy / Manage tabs
│   │   ├── DescriptionInput.tsx — Rich text area with char counter
│   │   └── FileUploader.tsx     — Drag-and-drop file upload
│   │
│   ├── ProgressTracker.tsx      — Live agent progress (18 steps)
│   │   ├── AgentStep.tsx        — Single agent row (icon, name, status, duration)
│   │   └── ProgressBar.tsx      — Overall % complete
│   │
│   ├── HitlCheckpoint.tsx       — User approval UI at checkpoints
│   │   ├── CheckpointSummary.tsx — What the agent produced
│   │   └── ApproveRejectBar.tsx  — Approve / Edit / Reject buttons
│   │
│   ├── OutputViewer.tsx         — Full output display
│   │   ├── AgentOutputCard.tsx  — Collapsible card per agent
│   │   ├── FileTree.tsx         — Tree view of all generated files
│   │   ├── CodeBlock.tsx        — Syntax-highlighted code (Shiki)
│   │   └── MarkdownRenderer.tsx — Rendered markdown
│   │
│   └── DownloadButton.tsx       — ZIP download trigger
│
├── billing/
│   ├── PlanCard.tsx             — Pricing plan display card
│   ├── UsageMeter.tsx           — Runs used / limit visual
│   ├── CreditBalance.tsx        — Current credits display
│   └── UpgradeModal.tsx         — Upgrade prompt with freemium teaser
│
└── ui/                          — shadcn/ui components (installed, not modified)
```

### State Management Plan

```typescript
// Global state (Zustand)
useUserStore        — user profile, plan, credits, usage
useRunStore         — current run state, agent statuses, live outputs

// Server state (TanStack Query)
useRuns()           — list of user's runs
useRun(id)          — single run with all outputs
useTemplates()      — available templates
useBillingUsage()   — current billing usage

// Form state (React Hook Form + Zod)
RunInputSchema      — validation for new run form
```

---

## 11. TECH STACK — FINAL DECISIONS

| Layer | Tool | Version | Notes |
|---|---|---|---|
| Framework | Next.js | 14.x (App Router) | Full-stack. Server Components for data fetching. |
| Language | TypeScript | 5.x | Strict mode enabled. |
| Auth | Clerk | Latest | Handles sessions, OAuth, email verification. Webhooks sync to DB. |
| Database | Supabase | Latest | PostgreSQL. Use direct Prisma connection, not Supabase client for main queries. |
| ORM | Prisma | 5.x | schema.prisma matches SQL schema above. Migrations managed by Prisma. |
| AI SDK | @anthropic-ai/sdk | Latest | Node.js SDK. Used inside Inngest job functions only. |
| AI Model (primary) | claude-sonnet-4-6 | Current | Used for Agents 1–6, 9, 12, 13, 16, 17, 18. |
| AI Model (code generation) | claude-sonnet-4-6 | Current | Used for Agents 7–11 (heavy code output). May upgrade to Opus for quality. |
| Background Jobs | Inngest | Latest | Pipeline execution. Handles timeouts, retries, step functions. |
| Payments | Stripe | Latest | Subscriptions + one-time credit purchases. |
| File Storage | Supabase Storage | — | Store uploaded input files. Output ZIP files cached here. |
| Deployment | Vercel | — | Pro plan needed (function timeout: 300s max). |
| Analytics | PostHog | Latest | Product analytics. Self-hostable. |
| Email | Resend | Latest | Transactional email (verification, alerts, HITL notifications). |
| UI Components | shadcn/ui | Latest | Install components individually. Base for all UI. |
| Styling | Tailwind CSS | 3.x | Utility-first. Design tokens in tailwind.config.ts. |
| Code Highlighting | Shiki | Latest | Server-side syntax highlighting. Supports 100+ languages. |
| Markdown | react-markdown + remark-gfm | Latest | Render agent markdown outputs. |
| Forms | React Hook Form | 7.x | With Zod resolver. |
| Validation | Zod | 3.x | Used in both forms and API routes. |
| State Management | Zustand | 4.x | Lightweight global state. |
| Server State | TanStack Query | 5.x | Data fetching, caching, background refetch. |
| Error Tracking | Sentry | Latest | Frontend + backend error capture. |
| HTTP Client | ky | Latest | Lightweight fetch wrapper for API calls. |
| Date Handling | date-fns | 3.x | Lightweight date utilities. |
| Icons | Lucide React | Latest | Consistent icon library. |
| ZIP Generation | JSZip | 3.x | Generate download ZIPs in memory. |

---

## 12. PROJECT FOLDER STRUCTURE

```
/
├── app/                                    # Next.js App Router
│   ├── (auth)/                             # Auth route group (no sidebar layout)
│   │   ├── sign-in/[[...sign-in]]/
│   │   │   └── page.tsx                   # Clerk sign-in
│   │   └── sign-up/[[...sign-up]]/
│   │       └── page.tsx                   # Clerk sign-up
│   │
│   ├── (marketing)/                        # Public pages (no auth required)
│   │   ├── layout.tsx                     # Marketing layout (navbar, footer)
│   │   └── page.tsx                       # Landing page
│   │
│   ├── (dashboard)/                        # Protected app pages
│   │   ├── layout.tsx                     # Dashboard layout (sidebar + topbar)
│   │   ├── dashboard/
│   │   │   └── page.tsx                   # Main dashboard
│   │   ├── runs/
│   │   │   ├── page.tsx                   # Run history list
│   │   │   ├── new/
│   │   │   │   └── page.tsx               # New run form
│   │   │   └── [id]/
│   │   │       └── page.tsx               # Run detail / live progress
│   │   ├── templates/
│   │   │   └── page.tsx                   # Template library
│   │   ├── billing/
│   │   │   └── page.tsx                   # Subscription + credits
│   │   └── settings/
│   │       ├── page.tsx                   # Account settings
│   │       ├── api-keys/
│   │       │   └── page.tsx               # API key management
│   │       └── agents/
│   │           └── page.tsx               # Custom agent editor
│   │
│   └── api/                               # API Routes
│       ├── runs/
│       │   ├── route.ts                   # POST (create), GET (list)
│       │   └── [id]/
│       │       ├── route.ts               # GET (detail), DELETE (cancel)
│       │       ├── approve/route.ts       # POST (HITL approve)
│       │       ├── download/route.ts      # GET (ZIP download)
│       │       └── stream/route.ts        # GET (SSE stream)
│       ├── billing/
│       │   ├── checkout/route.ts
│       │   ├── portal/route.ts
│       │   ├── usage/route.ts
│       │   └── credits/route.ts
│       ├── webhooks/
│       │   ├── stripe/route.ts
│       │   ├── inngest/route.ts
│       │   └── clerk/route.ts
│       ├── templates/route.ts
│       └── v1/                            # External API
│           └── runs/
│               ├── route.ts
│               └── [id]/route.ts
│
├── components/
│   ├── ui/                                # shadcn/ui components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── PageWrapper.tsx
│   ├── pipeline/
│   │   ├── InputForm/
│   │   │   ├── index.tsx
│   │   │   ├── ModeSelector.tsx
│   │   │   ├── DescriptionInput.tsx
│   │   │   └── FileUploader.tsx
│   │   ├── ProgressTracker/
│   │   │   ├── index.tsx
│   │   │   └── AgentStep.tsx
│   │   ├── HitlCheckpoint/
│   │   │   ├── index.tsx
│   │   │   └── ApproveRejectBar.tsx
│   │   └── OutputViewer/
│   │       ├── index.tsx
│   │       ├── AgentOutputCard.tsx
│   │       ├── FileTree.tsx
│   │       ├── CodeBlock.tsx
│   │       └── MarkdownRenderer.tsx
│   └── billing/
│       ├── PlanCard.tsx
│       ├── UsageMeter.tsx
│       └── UpgradeModal.tsx
│
├── inngest/                               # Background job definitions
│   ├── client.ts                          # Inngest client setup
│   ├── pipeline/
│   │   ├── orchestrator.ts               # Main pipeline function (all 18 steps)
│   │   ├── runner.ts                     # Generic runAgent() function
│   │   ├── context.ts                    # Context store read/write helpers
│   │   ├── summarizer.ts                 # Context summarization logic
│   │   └── zip-generator.ts             # Final ZIP assembly
│   └── agents/                           # One file per agent
│       ├── 01-input-layer.ts
│       ├── 02-requirement-analyst.ts
│       ├── 03-project-manager.ts
│       ├── 04-architecture.ts
│       ├── 05-security.ts
│       ├── 06-design.ts
│       ├── 07-frontend-senior.ts
│       ├── 08a-frontend-junior-a.ts
│       ├── 08b-frontend-junior-b.ts
│       ├── 08c-frontend-junior-c.ts
│       ├── 08d-frontend-junior-d.ts
│       ├── 09-frontend-gate.ts
│       ├── 10-backend-senior.ts
│       ├── 11a-backend-junior-a.ts
│       ├── 11b-backend-junior-b.ts
│       ├── 11c-backend-junior-c.ts
│       ├── 11d-backend-junior-d.ts
│       ├── 12-backend-gate.ts
│       ├── 13-integration.ts
│       ├── 14-qa.ts
│       ├── 15-fix-loop.ts
│       ├── 16-observability.ts
│       ├── 17-devops.ts
│       └── 18-documentation.ts
│
├── lib/
│   ├── anthropic.ts                       # Anthropic SDK client + callClaude() helper
│   ├── prisma.ts                          # Prisma client singleton
│   ├── supabase.ts                        # Supabase client (for file storage)
│   ├── stripe.ts                          # Stripe client + plan config
│   ├── inngest.ts                         # Inngest client export
│   ├── resend.ts                          # Email client
│   ├── auth.ts                            # Clerk auth helpers (getCurrentUser etc.)
│   └── utils.ts                           # General utilities
│
├── hooks/
│   ├── useRun.ts                          # TanStack Query hook for single run
│   ├── useRuns.ts                         # TanStack Query hook for runs list
│   ├── useRunStream.ts                    # SSE hook for live pipeline updates
│   ├── useBilling.ts                      # Billing/usage data hook
│   └── useUser.ts                         # Current user + plan data
│
├── store/
│   ├── user.store.ts                      # Zustand user store
│   └── run.store.ts                       # Zustand active run store
│
├── prompts/                               # System prompt strings (plain text files)
│   ├── 01-input-layer.txt
│   ├── 02-requirement-analyst.txt
│   └── ... (one per agent)
│
├── types/
│   ├── index.ts                           # All shared TypeScript types
│   ├── agent.types.ts                     # Agent-specific types
│   ├── run.types.ts                       # Run and pipeline types
│   └── api.types.ts                       # API request/response types
│
├── prisma/
│   ├── schema.prisma                      # Prisma schema (matches SQL above)
│   └── migrations/                        # Auto-generated migrations
│
├── public/
│   └── assets/                            # Static assets
│
├── middleware.ts                           # Clerk auth middleware (protects routes)
├── next.config.ts                          # Next.js config
├── tailwind.config.ts                      # Tailwind + design tokens
├── tsconfig.json
├── .env.example                            # All required env vars documented
└── package.json
```

---

## 13. DEVELOPMENT PHASES & WEEKLY SPRINT PLAN

### Phase 0 — No-Code Validation (Week 1–2)
**Goal:** Validate that the 18-agent pipeline produces quality output before writing any product code.
**Team:** You + Claude.ai (no developer needed yet)

**Week 1:**
- Day 1: Write Agents 01–06 skill files based on specs in Section 4
- Day 2: Write Agents 07–12 skill files
- Day 3: Write Agents 13–18 skill files
- Day 4: Create Claude.ai Project, upload all 18 skill files, write master orchestrator prompt
- Day 5: Run Test Pipeline #1 (BUILD mode: "Build a SaaS project management tool with payments and team collaboration")
- Document: which agents produced good output, which produced poor output, which failed

**Week 2:**
- Day 1–2: Analyze Test #1 failures, rewrite problematic skill files
- Day 3: Run Test Pipeline #2 (STRATEGY mode: "Help me launch a digital agency")
- Day 4: Run Test Pipeline #3 (MANAGE mode: "Review this project and create a sprint plan")
- Day 5: Fix all remaining issues. Finalize all 18 system prompts — these become the `prompts/` files in the codebase.

**Exit criteria before moving to Phase 1:**
- ✅ All 18 agents produce structured, usable output
- ✅ All 3 modes (Build/Strategy/Manage) complete successfully
- ✅ System prompt for every agent is finalized and saved

### Phase 1 — Foundation (Week 3–4)
**Goal:** Working Next.js project deployed to Vercel with auth, database, and basic UI shell.

**Week 3:**
- [ ] Initialize Next.js 14 project with TypeScript, Tailwind, ESLint
- [ ] Install and configure Clerk (auth middleware, sign-in/sign-up pages)
- [ ] Set up Supabase project (database + storage)
- [ ] Set up Prisma (schema from Section 8, first migration)
- [ ] Deploy to Vercel (auto-deploy from GitHub main branch)
- [ ] Set up Inngest (account, client setup, webhook endpoint)
- [ ] Set up Stripe (products and prices for all 4 plans, webhook endpoint)
- [ ] Set up Resend (account, verify domain, email templates)
- [ ] Set up Sentry (frontend + backend error tracking)
- [ ] Set up PostHog (analytics tracking)
- [ ] Install all shadcn/ui components needed (button, card, dialog, input, select, table, tabs, badge, progress, skeleton)

**Week 4:**
- [ ] Build Sidebar component with navigation links, usage meter, plan badge
- [ ] Build TopBar component with breadcrumbs and user menu
- [ ] Build Dashboard page (empty state + usage stats)
- [ ] Build Run History page (table with mock data)
- [ ] Clerk webhook → sync user to DB on signup
- [ ] Stripe webhook → update user plan on subscription change
- [ ] Build Billing page (show current plan, Stripe portal link)
- [ ] Build Settings page (account info, danger zone)
- [ ] Write full `.env.example` with every variable documented

### Phase 2 — Pipeline Engine (Week 5–6)
**Goal:** The 18-agent pipeline runs end-to-end and saves outputs to the database.

**Week 5:**
- [ ] Write `lib/anthropic.ts` — `callClaude(systemPrompt, userMessage, options)` helper with error handling, retry on rate limit, token counting
- [ ] Write `inngest/pipeline/context.ts` — `loadContextFiles(runId, filenames[])` and `saveContextFile(runId, filename, content)` functions
- [ ] Write `inngest/pipeline/runner.ts` — `runAgent(runId, agentConfig)` generic function that: loads context, calls Claude, parses output, saves files, updates DB
- [ ] Write Agents 01–06 (each as their own file in `inngest/agents/`)
- [ ] Write the main `inngest/pipeline/orchestrator.ts` skeleton with Steps 1–6
- [ ] Test pipeline with Step.run() for first 6 agents end-to-end
- [ ] Implement HITL checkpoint logic: pause pipeline, update run status to `waiting_hitl`, send email

**Week 6:**
- [ ] Write Agents 07–12 (FrontendSenior, FrontendJuniors ×4, FrontendGate, BackendSenior, BackendJuniors ×4, BackendGate)
- [ ] Implement parallel execution: `await Promise.all([runAgent(08a), runAgent(08b), runAgent(08c), runAgent(08d)])`
- [ ] Implement Gate review loop (max 2 retry cycles)
- [ ] Write Agents 13–18 (Integration, QA, FixLoop, Observability, DevOps, Documentation)
- [ ] Implement FixLoop retry logic (max 3 iterations)
- [ ] Write `inngest/pipeline/summarizer.ts` — compress context at checkpoints
- [ ] Write `inngest/pipeline/zip-generator.ts` — assemble final ZIP from all context files
- [ ] Test full pipeline end-to-end (should complete all 18 agents for a simple input)
- [ ] Implement cost tracking: log tokens + cost per agent execution

### Phase 3 — Frontend UI (Week 7)
**Goal:** Users can run the pipeline and see live results in the UI.

- [ ] Build `InputForm` component with ModeSelector, DescriptionInput, FileUploader
- [ ] Build `POST /api/runs` endpoint — create run in DB, trigger Inngest job, return runId
- [ ] Build `GET /api/runs/[id]/stream` — SSE endpoint that streams agent status updates from DB
- [ ] Build `ProgressTracker` — shows all 18 agents, live status updates via SSE
- [ ] Build `HitlCheckpoint` — displays agent output and approve/reject/edit buttons
- [ ] Build `POST /api/runs/[id]/approve` — handle HITL approval, signal Inngest to resume
- [ ] Build `OutputViewer` — per-agent collapsible output cards with CodeBlock and MarkdownRenderer
- [ ] Build `FileTree` — shows all generated files organized by category
- [ ] Build `GET /api/runs/[id]/download` — generate and return ZIP file
- [ ] Build `DownloadButton` component — triggers ZIP download
- [ ] Connect Run History page to real data from `GET /api/runs`
- [ ] Connect Dashboard to real usage stats from DB

### Phase 4 — Billing, Limits & Polish (Week 8)
**Goal:** Subscription enforcement, limits, onboarding. Ready for beta users.

- [ ] Implement plan limit enforcement in `POST /api/runs` (check runs_this_month vs runs_limit)
- [ ] Build `UpgradeModal` — shown when limit hit or free user tries to access paid feature
- [ ] Build freemium teaser — free users see blurred output preview of Agents 7–18 outputs
- [ ] Build `POST /api/billing/checkout` — create Stripe checkout session
- [ ] Build `POST /api/billing/portal` — create Stripe customer portal session
- [ ] Build Usage alerts — email via Resend at 80% and 100% limit
- [ ] Build 3-step onboarding flow for new users (first login)
- [ ] Build empty states for all pages (no runs, no templates, etc.)
- [ ] Build error pages (404, 500, failed run)
- [ ] Loading states on all async operations
- [ ] Mobile responsive audit — fix all layout issues on 375px viewport
- [ ] Accessibility audit — keyboard navigation, focus states, ARIA labels
- [ ] Performance audit — Lighthouse score ≥ 85
- [ ] Beta launch — send invites to 20 test users

### Phase 5 — Growth Features (Week 9–12)
**Goal:** Credits, API access, integrations, public launch.

- [ ] Credits system (Stripe one-time payment + credit deduction on run)
- [ ] API key management page + external API endpoints
- [ ] Custom agent editor
- [ ] Pipeline templates (5 built-in + user-created)
- [ ] GitHub integration (OAuth + repo push)
- [ ] HITL enhancement (email notifications, skip option for Pro)
- [ ] Agent output versioning
- [ ] Team workspaces (Phase 2 start)
- [ ] Public launch preparation (landing page, Product Hunt draft, social content)
- [ ] Public launch

---

## 14. NO-CODE VALIDATION PHASE (CLAUDE.AI PROJECTS)

### What to Build in Claude.ai Projects

**Project Name:** `Pipeline AI — Development`

**Project Instructions (Master Orchestrator Prompt):**
```
You are a full-stack software development and strategy pipeline with 18 specialized agents.

You have 18 skill documents in your Project Knowledge — each defines one agent's exact role, inputs, responsibilities, and output format.

ACTIVATION RULES:
When I type "RUN: [AgentName]", you must:
1. Find and read the matching skill document for that agent from Project Knowledge
2. Read ALL previous outputs in this conversation as your context
3. Execute that agent's FULL responsibilities — do not abbreviate, do not skip sections
4. Output every file in the exact format specified in the skill document
5. Label every output section with ## filename.ext headers so future agents can find them
6. At the end of your output, list: ✅ Files produced: [filename1], [filename2], ...

CONTEXT RULES:
- This entire conversation is your shared context store
- Every agent can see every previous agent's outputs — reference them explicitly
- If a previous agent's output is unclear or missing, state that and proceed with reasonable defaults

QUALITY RULES:
- Never produce placeholder text like "[Add content here]" — generate the actual content
- Never abbreviate — produce full, professional, production-ready output
- If an output would be very long (e.g., full code files), still produce it completely

MODE AWARENESS:
- The pipeline has three modes: BUILD, STRATEGY, MANAGE
- Agent #1 (InputLayer) will determine the mode from the user's description
- All subsequent agents must adapt their outputs to the active mode
```

**18 Skill Files to Upload:**
Each file is named `skill_NN_agentname.md` and contains the agent specification from Section 4 formatted as a skill document.

### Test Pipeline Inputs

**Test 1 — BUILD mode:**
> "I want to build a SaaS project management tool. Teams can create projects, assign tasks to members, track progress on a kanban board, and pay for team seats (max 5 users on free, unlimited on paid). Need web + mobile. I want to use React and Node.js. Target users are small software agencies."

**Test 2 — STRATEGY mode:**
> "I am a freelance designer in Ahmedabad. I want to start selling digital products online — Figma UI kits and Notion templates. I have 2000 Instagram followers. What is my best strategy to make ₹1 lakh per month from this in 6 months?"

**Test 3 — MANAGE mode:**
> "Our startup has been building a mobile app for 4 months. We have 2 developers, a designer, and a PM. The app is 60% done — we have user auth, the main feed, and basic profile. Still need: notifications, payments, social sharing, and the admin panel. We launch in 2 months. The developers say we're 3 weeks behind. Help."

### Evaluation Criteria per Test
For each test, grade every agent output (1–5):
- 5: Complete, professional, production-ready, no gaps
- 4: Complete with minor issues, usable
- 3: Mostly complete, some sections missing or shallow
- 2: Significant gaps, needs major rewriting
- 1: Unusable, agent misunderstood its role

Target: All agents score 4 or 5 on all 3 tests before moving to code.

---

## 15. AGENT SYSTEM PROMPTS — COMPLETE SPECIFICATION

Each system prompt is stored in `prompts/NN-agent-name.txt` and loaded by the agent function at runtime.

### How Prompts Are Structured

Every agent prompt follows this template:
```
# AGENT: [Agent Name]
# NUMBER: [01–18]
# ROLE: [Professional title]

## WHO YOU ARE
[2–3 sentences describing the persona and expertise level]

## YOUR CONTEXT
You are part of an 18-agent software development pipeline. The run mode is: {mode}.
Previous agents have produced the following files which are available in your context:
{context_files_list}

## YOUR INPUTS
Read and use these files from the context store:
- [filename1]: [what it contains and how to use it]
- [filename2]: [what it contains and how to use it]

## YOUR RESPONSIBILITIES
You must complete ALL of the following — do not skip any:

1. [responsibility]
2. [responsibility]
...

## OUTPUT FORMAT
Produce your output as follows. Use ## filename.ext as the header for each file.
Do NOT produce placeholder text. Generate complete, production-ready content.

## [filename1.ext]
[exact format specification for this file]

## [filename2.ext]
[exact format specification for this file]

## QUALITY STANDARDS
- [specific quality rule for this agent]
- [specific quality rule]
- Never abbreviate. Produce the complete output every time.
- If you are uncertain about a detail, make a reasonable professional decision and note it.
```

The full prompt content for each agent matches the responsibilities and output formats defined in Section 4.

---

## 16. CONTEXT WINDOW MANAGEMENT STRATEGY

This is the most critical technical challenge of the entire product. Without solving this, pipelines will fail mid-run for complex projects.

### Problem Statement
By the time the pipeline reaches Agent 14 (QA), the context store contains outputs from 13 previous agents. If passed in full, this could be 200,000–500,000 tokens — exceeding Claude's context window.

### Solution: Layered Context Strategy

**Layer 1: Per-Agent Context Budgets**
Each agent only loads the specific files it needs — never the full context store. This is defined explicitly in each agent's specification in Section 4 under "Reads from:". This alone reduces per-agent context by 60–80%.

**Layer 2: Summarization Checkpoints**
After Agent 6, 12, and 15, run a `SummarizerAgent` (not user-facing) that:
1. Loads all context files produced so far
2. Produces a compressed `pipeline_summary.md` that captures: key decisions made, tech stack chosen, architecture decisions, key constraints, what was built/planned
3. From this point, later agents load `pipeline_summary.md` instead of all individual early-stage files
4. Early-stage files remain in Supabase for download but are no longer passed to agents

**Layer 3: Code File Handling**
Code files from Agents 8 and 11 (Junior agents) are very large. Strategy:
- Store full code in Supabase (context_files table)
- For later agents that need to review code (Gate agents, QA, Integration): pass only the file tree structure + first 200 lines of each file + any specific functions being asked about
- QA and Integration agents use targeted extraction, not full code

**Layer 4: Token Monitoring**
Before every Claude API call:
```typescript
const estimatedTokens = estimateTokens(systemPrompt + userMessage)
if (estimatedTokens > 150_000) {
  // Apply aggressive summarization before calling
  await summarizeContext(runId, agentNumber)
}
```

**Concrete Token Budget per Agent:**

| Agent | System Prompt | Context Loaded | Total Budget |
|---|---|---|---|
| 01 InputLayer | ~500 | user input only | ~2K |
| 02 RequirementAnalyst | ~800 | user_input.json | ~3K |
| 03 ProjectManager | ~1000 | requirements.md + personas.md | ~8K |
| 04 Architecture | ~1500 | requirements.md + tasks.json + complexity | ~12K |
| 05 Security | ~1200 | tech_stack + api_contracts + schema | ~15K |
| 06 Design | ~1000 | personas + journeys + mvp_scope | ~10K |
| [Summarizer A] | ~500 | All files from Agents 1–6 | ~30K |
| 07 FE Senior | ~1200 | pipeline_summary + design system | ~20K |
| 08a–d FE Juniors | ~2000 each | their spec + design tokens + api contracts | ~25K each |
| 09 FE Gate | ~1500 | code (file tree + samples) + specs | ~40K |
| 10 BE Senior | ~1200 | pipeline_summary + api_contracts + schema | ~20K |
| 11a–d BE Juniors | ~2000 each | their spec + schema + api contracts | ~25K each |
| 12 BE Gate | ~1500 | code (file tree + samples) + security spec | ~40K |
| [Summarizer B] | ~500 | Pipeline summary + all outputs so far | ~40K |
| 13 Integration | ~1000 | pipeline_summary + api_contracts + env_config | ~15K |
| 14 QA | ~2000 | acceptance_criteria + code samples + security | ~50K |
| 15 FixLoop | ~1000 | bug_report + relevant code sections | ~20K |
| 16 Observability | ~800 | tech_stack + logging_setup | ~10K |
| 17 DevOps | ~1500 | tech_stack + architecture + env_config | ~15K |
| 18 Documentation | ~1000 | pipeline_summary + all key outputs | ~30K |

All estimates well within 200K context window even with large outputs.

---

## 17. PIPELINE ORCHESTRATOR — CODE ARCHITECTURE

### Core Pattern (TypeScript)

```typescript
// lib/anthropic.ts
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  options?: { maxTokens?: number; model?: string }
): Promise<{ content: string; inputTokens: number; outputTokens: number }> {
  const model = options?.model ?? 'claude-sonnet-4-6'
  const maxTokens = options?.maxTokens ?? 8096

  let lastError: Error | null = null

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      })

      const content = response.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('\n')

      return {
        content,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      }
    } catch (error: any) {
      lastError = error
      if (error.status === 429) {
        // Rate limited — exponential backoff
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
        continue
      }
      throw error
    }
  }

  throw lastError
}
```

```typescript
// inngest/pipeline/context.ts
import { prisma } from '@/lib/prisma'

export async function loadContextFiles(
  runId: string,
  filenames: string[]
): Promise<Record<string, string>> {
  const files = await prisma.contextFile.findMany({
    where: { runId, filename: { in: filenames } },
  })

  return Object.fromEntries(files.map((f) => [f.filename, f.content]))
}

export async function saveContextFile(
  runId: string,
  filename: string,
  content: string,
  createdByAgent: number
): Promise<void> {
  await prisma.contextFile.upsert({
    where: { runId_filename: { runId, filename } },
    update: { content, updatedAt: new Date() },
    create: { runId, filename, content, createdByAgent },
  })
}

export function buildUserMessage(
  contextFiles: Record<string, string>,
  instruction: string
): string {
  const filesSections = Object.entries(contextFiles)
    .map(([filename, content]) => `## ${filename}\n\`\`\`\n${content}\n\`\`\``)
    .join('\n\n')

  return `${filesSections}\n\n---\n\n${instruction}`
}
```

```typescript
// inngest/pipeline/runner.ts
import { loadContextFiles, saveContextFile, buildUserMessage } from './context'
import { callClaude } from '@/lib/anthropic'
import { prisma } from '@/lib/prisma'
import { parseAgentOutput } from './parser'
import type { AgentConfig } from '@/types/agent.types'

export async function runAgent(runId: string, config: AgentConfig): Promise<Record<string, string>> {
  const startedAt = new Date()

  // Update agent execution status to running
  await prisma.agentExecution.update({
    where: { runId_agentNumber: { runId, agentNumber: config.number } },
    data: { status: 'running', startedAt },
  })

  try {
    // 1. Load context files this agent needs
    const contextFiles = await loadContextFiles(runId, config.contextFilesNeeded)

    // 2. Load system prompt
    const systemPrompt = config.systemPrompt

    // 3. Build user message (context + instruction)
    const userMessage = buildUserMessage(contextFiles, config.instruction)

    // 4. Call Claude
    const result = await callClaude(systemPrompt, userMessage, {
      maxTokens: config.maxOutputTokens ?? 8096,
    })

    // 5. Parse output into named files
    const outputFiles = parseAgentOutput(result.content)

    // 6. Save each file to context store
    for (const [filename, content] of Object.entries(outputFiles)) {
      await saveContextFile(runId, filename, content, config.number)
    }

    // 7. Update agent execution as complete
    const cost = calculateCost(result.inputTokens, result.outputTokens)
    await prisma.agentExecution.update({
      where: { runId_agentNumber: { runId, agentNumber: config.number } },
      data: {
        status: 'complete',
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        costUsd: cost,
        durationMs: Date.now() - startedAt.getTime(),
        completedAt: new Date(),
      },
    })

    // 8. Update run's total cost
    await prisma.run.update({
      where: { id: runId },
      data: {
        totalTokens: { increment: result.inputTokens + result.outputTokens },
        totalCostUsd: { increment: cost },
        currentAgent: config.number,
      },
    })

    return outputFiles
  } catch (error: any) {
    await prisma.agentExecution.update({
      where: { runId_agentNumber: { runId, agentNumber: config.number } },
      data: { status: 'failed', errorMessage: error.message, completedAt: new Date() },
    })
    throw error
  }
}

function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * 3.0   // $3/M input tokens
  const outputCost = (outputTokens / 1_000_000) * 15.0  // $15/M output tokens
  return inputCost + outputCost
}
```

```typescript
// inngest/pipeline/orchestrator.ts (simplified structure)
import { inngest } from '@/lib/inngest'
import { runAgent } from './runner'
import { AGENT_CONFIGS } from '../agents'

export const pipelineFunction = inngest.createFunction(
  { id: 'pipeline-orchestrator', retries: 0, timeout: '30m' },
  { event: 'pipeline/run.created' },
  async ({ event, step }) => {
    const { runId } = event.data

    // ── PHASE 1: INPUT & ANALYSIS ──────────────────────────────
    await step.run('agent-01-input-layer', () =>
      runAgent(runId, AGENT_CONFIGS[1])
    )

    // HITL: User confirms parsed input
    await step.waitForEvent('hitl-checkpoint-0', {
      event: 'pipeline/hitl.approved',
      match: 'data.runId',
      timeout: '7d',
    })

    await step.run('agent-02-requirement-analyst', () =>
      runAgent(runId, AGENT_CONFIGS[2])
    )

    await step.run('agent-03-project-manager', () =>
      runAgent(runId, AGENT_CONFIGS[3])
    )

    // HITL CHECKPOINT #1: User approves MVP scope
    await step.run('pause-for-hitl-1', () =>
      pausePipelineForHITL(runId, 1, 'Approve MVP scope and sprint plan')
    )
    await step.waitForEvent('hitl-checkpoint-1', {
      event: 'pipeline/hitl.approved',
      match: 'data.runId',
      timeout: '7d',
    })

    // ── PHASE 2: ARCHITECTURE & SECURITY ───────────────────────
    await step.run('agent-04-architecture', () =>
      runAgent(runId, AGENT_CONFIGS[4])
    )

    // HITL CHECKPOINT #2: User approves tech stack
    await step.run('pause-for-hitl-2', () =>
      pausePipelineForHITL(runId, 2, 'Approve tech stack and system architecture')
    )
    await step.waitForEvent('hitl-checkpoint-2', {
      event: 'pipeline/hitl.approved',
      match: 'data.runId',
      timeout: '7d',
    })

    await step.run('agent-05-security', () => runAgent(runId, AGENT_CONFIGS[5]))
    await step.run('agent-06-design', () => runAgent(runId, AGENT_CONFIGS[6]))

    // HITL CHECKPOINT #3: User approves design
    await step.run('pause-for-hitl-3', () =>
      pausePipelineForHITL(runId, 3, 'Approve design system and wireframes')
    )
    await step.waitForEvent('hitl-checkpoint-3', {
      event: 'pipeline/hitl.approved',
      match: 'data.runId',
      timeout: '7d',
    })

    // ── SUMMARIZATION CHECKPOINT A ─────────────────────────────
    await step.run('summarize-context-a', () => summarizeContext(runId, 'A'))

    // ── PHASE 3: FRONTEND ───────────────────────────────────────
    await step.run('agent-07-frontend-senior', () =>
      runAgent(runId, AGENT_CONFIGS[7])
    )

    // Parallel FE Juniors
    await step.run('agent-08-frontend-juniors', () =>
      Promise.all([
        runAgent(runId, AGENT_CONFIGS['08a']),
        runAgent(runId, AGENT_CONFIGS['08b']),
        runAgent(runId, AGENT_CONFIGS['08c']),
        runAgent(runId, AGENT_CONFIGS['08d']),
      ])
    )

    // FE Gate with retry loop
    let feGatePass = false
    for (let attempt = 0; attempt < 2 && !feGatePass; attempt++) {
      const gateResult = await step.run(`agent-09-fe-gate-attempt-${attempt}`, () =>
        runAgent(runId, AGENT_CONFIGS[9])
      )
      feGatePass = gateResult['fe_gate_status.json']?.includes('"pass"')

      if (!feGatePass && attempt < 1) {
        // Re-run relevant juniors with fix tasks
        await step.run(`agent-08-fe-junior-fix-${attempt}`, () =>
          runFrontendJuniorsWithFixes(runId)
        )
      }
    }

    // ── PHASE 4: BACKEND ────────────────────────────────────────
    await step.run('agent-10-backend-senior', () =>
      runAgent(runId, AGENT_CONFIGS[10])
    )

    // (Same pattern as frontend — parallel juniors, gate, retry)
    // ...

    // ── SUMMARIZATION CHECKPOINT B ─────────────────────────────
    await step.run('summarize-context-b', () => summarizeContext(runId, 'B'))

    // ── PHASE 5: INTEGRATION, QA, FIX ─────────────────────────
    await step.run('agent-13-integration', () => runAgent(runId, AGENT_CONFIGS[13]))
    await step.run('agent-14-qa', () => runAgent(runId, AGENT_CONFIGS[14]))

    // Fix Loop (max 3 iterations)
    for (let iteration = 0; iteration < 3; iteration++) {
      const fixResult = await step.run(`agent-15-fix-loop-${iteration}`, () =>
        runAgent(runId, AGENT_CONFIGS[15])
      )
      const hasUnresolved = fixResult['unresolved_bugs.json']?.length > 2 // '[]' = no bugs
      if (!hasUnresolved) break
    }

    // ── PHASE 6: DEVOPS, OBSERVABILITY, DOCS ──────────────────
    await step.run('agent-16-observability', () => runAgent(runId, AGENT_CONFIGS[16]))
    await step.run('agent-17-devops', () => runAgent(runId, AGENT_CONFIGS[17]))

    // HITL CHECKPOINT #4: Final approval before documentation
    await step.run('pause-for-hitl-4', () =>
      pausePipelineForHITL(runId, 4, 'Final review before generating documentation')
    )
    await step.waitForEvent('hitl-checkpoint-4', {
      event: 'pipeline/hitl.approved',
      match: 'data.runId',
      timeout: '7d',
    })

    await step.run('agent-18-documentation', () => runAgent(runId, AGENT_CONFIGS[18]))

    // ── PIPELINE COMPLETE ───────────────────────────────────────
    await step.run('finalize-pipeline', () => finalizePipeline(runId))
  }
)
```

---

## 18. AUTHENTICATION & AUTHORIZATION

### Auth Flow (Clerk)

```
New user signs up (email or Google OAuth)
         ↓
Clerk creates user account, sends verification email
         ↓
Clerk fires `user.created` webhook → /api/webhooks/clerk
         ↓
App creates user record in DB (plan=free, credits=0, runs_limit=2)
         ↓
User is redirected to /dashboard (empty state with onboarding)
```

### Route Protection (middleware.ts)

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',           // Landing page
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/docs/api',   // Public API docs
  '/api/webhooks/(.*)',  // Webhooks must be public
])

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect()
  }
})
```

### Role-Based Access

| Role | Who Has It | Access |
|---|---|---|
| `user` | All signed-in users | Their own runs, billing, settings |
| `admin` | Internal team | Admin analytics, all users' data |

Admin check in API routes:
```typescript
const user = await getCurrentUser()
if (user.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### API Key Authentication (for External API)

API keys are stored as bcrypt hashes. Verification:
```typescript
const apiKey = request.headers.get('x-api-key')
const keyPrefix = apiKey?.substring(0, 12)  // First 12 chars
const keyRecord = await prisma.apiKey.findFirst({
  where: { keyPrefix, isActive: true },
  include: { user: true },
})
const isValid = await bcrypt.compare(apiKey, keyRecord.keyHash)
```

---

## 19. BILLING & SUBSCRIPTION SYSTEM

### Stripe Products to Create

```
Product: PipelineAI Starter
  Price: $29/month (recurring) → stripe_price_id: price_starter_monthly

Product: PipelineAI Pro
  Price: $99/month (recurring) → stripe_price_id: price_pro_monthly

Product: PipelineAI Enterprise
  Price: $499/month (recurring) → stripe_price_id: price_enterprise_monthly

Product: Credit Pack - Small
  Price: $12 (one-time) → 5 credits

Product: Credit Pack - Medium
  Price: $40 (one-time) → 20 credits

Product: Credit Pack - Large
  Price: $90 (one-time) → 50 credits
```

### Plan Configuration (in code)

```typescript
// lib/stripe.ts
export const PLAN_CONFIG = {
  free: {
    name: 'Free',
    runsPerMonth: 2,
    agentsAvailable: [1, 2, 3, 4, 5, 6],
    codeOutput: false,
    apiAccess: false,
    customAgents: false,
  },
  starter: {
    name: 'Starter',
    runsPerMonth: 10,
    agentsAvailable: Array.from({ length: 18 }, (_, i) => i + 1),
    codeOutput: true,
    apiAccess: false,
    customAgents: false,
    stripePriceId: process.env.STRIPE_PRICE_STARTER!,
  },
  pro: {
    name: 'Pro',
    runsPerMonth: 30,
    agentsAvailable: Array.from({ length: 18 }, (_, i) => i + 1),
    codeOutput: true,
    apiAccess: true,
    customAgents: true,
    maxRunsPerDay: 5,
    stripePriceId: process.env.STRIPE_PRICE_PRO!,
  },
  enterprise: {
    name: 'Enterprise',
    runsPerMonth: 100,
    agentsAvailable: Array.from({ length: 18 }, (_, i) => i + 1),
    codeOutput: true,
    apiAccess: true,
    customAgents: true,
    whiteLabel: true,
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE!,
  },
}
```

### Stripe Webhook Events to Handle

| Event | Action |
|---|---|
| `customer.subscription.created` | Update user plan in DB, set runs_limit |
| `customer.subscription.updated` | Update user plan and runs_limit |
| `customer.subscription.deleted` | Downgrade user to free plan |
| `invoice.payment_succeeded` | Reset runs_this_month to 0 on new billing cycle |
| `invoice.payment_failed` | Email user about payment failure |
| `checkout.session.completed` | If credit purchase: add credits to user account |

---

## 20. MISSING PARTS — RESOLVED

All gaps identified in the original HTML files and subsequent analysis have been addressed:

| Gap | Status | Resolution |
|---|---|---|
| Context window overflow | ✅ Resolved | Section 16: Layered context strategy + summarization checkpoints |
| Agent naming inconsistency | ✅ Resolved | Section 4: Canonical 18-agent list, used everywhere |
| Parallel execution approach | ✅ Resolved | `Promise.all()` in Inngest step, with fallback sequential for no-code |
| Fix Loop exit condition | ✅ Resolved | Max 3 iterations, Critical/High must resolve, Medium/Low to backlog |
| Mode detection | ✅ Resolved | Agent 01 classifies mode, stored in user_input.json |
| File output format standards | ✅ Resolved | Section 4: Every agent has exact output file list with schemas |
| Cost per run calculation | ✅ Resolved | Section 5: Detailed cost analysis with revised pricing |
| Mobile experience | ✅ Resolved | Section 6: Mobile-first design requirement, 375px breakpoint |
| Error states | ✅ Resolved | Section 6 + Section 10: All error states defined |
| Onboarding flow | ✅ Resolved | Section 6 + Phase 4 sprint: 3-step guided first-run |
| Refund policy | ✅ Resolved | Section 5: 7-day money-back guarantee |
| Fair-use policy | ✅ Resolved | Section 5: Max 5 runs/day for Pro |
| Data retention | ✅ Resolved | Section 5: 30 days free, 1 year paid |
| Abuse prevention | ✅ Resolved | Email verification + max 3 concurrent runs |
| Model names outdated | ✅ Resolved | Using `claude-sonnet-4-6` throughout |
| Keyboard accessibility | ✅ Resolved | WCAG 2.1 AA requirement in Design agent spec |
| Copy buttons on code blocks | ✅ Resolved | Included in CodeBlock.tsx component spec |
| Inngest timeout risk | ✅ Resolved | Pipeline split into step.run() blocks, each independently retried |
| No inter-file navigation | ✅ Resolved | Not applicable to production app (was only relevant to HTML prototype) |

---

## 21. RISK REGISTER & MITIGATION

| # | Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| R1 | Claude API rate limits during parallel agent runs | High | High | Exponential backoff in callClaude(). Queue sequential if rate limited. Monitor via Sentry. | Dev |
| R2 | Context window exceeded mid-pipeline | High | High | Summarization checkpoints mandatory. Token monitoring before each call. | Dev |
| R3 | Inngest job timeout (>30 min) | Medium | High | Pipeline broken into step.run() blocks. Each step has independent timeout. Max 30m total. | Dev |
| R4 | Claude API output quality degrades on complex inputs | Medium | High | Quality validation in each agent (check for placeholder text, incomplete sections). Auto-retry with clarification prompt. | Dev |
| R5 | Stripe webhook processing failures | Low | High | Idempotent webhook handlers. Stripe retries automatically. Log all events. | Dev |
| R6 | Supabase downtime | Low | High | Supabase has 99.9% SLA. Add error handling and user-facing status messages. | Ops |
| R7 | Claude API cost overrun | Medium | High | Per-run cost cap: if cost > $10 → pause, notify user. Daily spend alert via Anthropic dashboard. | Dev |
| R8 | Users abuse free tier | High | Medium | Email verification before first run. Rate limit by IP. Fingerprint detection. | Dev |
| R9 | Poor pipeline output for strategy/manage modes | Medium | Medium | Dedicated test pipelines for each mode during Phase 0. Mode-specific agent adaptations. | Prompt Engineer |
| R10 | Vercel function timeout on heavy agents | Medium | Medium | Code generation agents produce large outputs. Use streaming. Move to Vercel Pro (300s timeout). | Dev |
| R11 | User drops off at HITL checkpoint | Medium | Medium | Email notification when pipeline waiting for approval. 7-day waitForEvent timeout. | Product |
| R12 | Database performance at scale | Low | Medium | Indexes on all foreign keys and query columns (defined in schema). Connection pooling via Prisma. | Dev |
| R13 | Key developer unavailability | Medium | High | Document everything in this file. Code written to be self-explanatory with comments. | Management |

---

## 22. NON-FUNCTIONAL REQUIREMENTS

### Performance
- Dashboard loads in < 1.5 seconds (LCP)
- Pipeline progress page updates within 2 seconds of agent completion
- API routes respond in < 500ms (excluding pipeline trigger)
- ZIP download generates in < 10 seconds for a completed run

### Reliability
- Application uptime: 99.5% monthly (Vercel SLA)
- Pipeline completion rate: > 90% (measure from Week 8)
- Failed pipelines automatically retry the failed agent once before marking as error

### Security
- All data in transit encrypted (HTTPS enforced by Vercel)
- All database connections encrypted
- No credentials in source code (environment variables only)
- Clerk handles authentication — no custom auth code
- Input sanitization on all user-provided content before passing to Claude
- Rate limiting on all API endpoints (per user and per IP)
- API keys stored as bcrypt hashes, never plain text

### Scalability
- Inngest handles job queue automatically — scales to hundreds of concurrent pipelines
- Supabase auto-scales storage
- Vercel auto-scales compute
- No manual scaling actions needed up to 1,000 concurrent users

### Accessibility
- WCAG 2.1 AA compliance on all pages
- All interactive elements keyboard navigable
- Screen reader compatible (ARIA labels on all icons, status updates announced)
- Minimum color contrast ratio 4.5:1 for text

### Browser Support
- Chrome 120+ (primary)
- Firefox 120+
- Safari 17+
- Edge 120+
- Mobile: iOS Safari 16+, Android Chrome 120+

---

## 23. SUCCESS METRICS & KPIS

### Technical Metrics (tracked from Day 1)
| Metric | Target Week 8 | Target Month 2 | Target Month 3 |
|---|---|---|---|
| Pipeline completion rate | > 80% | > 90% | > 95% |
| Average pipeline run time | < 12 minutes | < 10 minutes | < 8 minutes |
| Average agent output quality score | > 3.5/5 | > 4/5 | > 4.5/5 |
| API error rate | < 5% | < 2% | < 1% |
| P95 page load time | < 3s | < 2s | < 1.5s |
| Uptime | > 99% | > 99.5% | > 99.9% |

### Business Metrics
| Metric | Target Week 8 | Target Month 2 | Target Month 3 |
|---|---|---|---|
| Registered users | 20 (beta) | 200 | 1,000 |
| Paying customers | 0 (beta) | 30 | 100 |
| MRR | $0 | $1,200 | $5,000 |
| Free → Paid conversion rate | — | > 10% | > 15% |
| Run completion rate (users who finish) | > 60% | > 70% | > 75% |
| Weekly active users | 15 | 80 | 300 |
| NPS score | — | > 30 | > 45 |
| Average revenue per user (ARPU) | — | $40 | $50 |

### Product Metrics
| Metric | What It Tells Us |
|---|---|
| Most popular mode (Build/Strategy/Manage) | Where to invest feature effort |
| Most-run agent (failure point if low) | Which agents need prompt improvement |
| HITL checkpoint approval rate | If users are happy with agent outputs or rejecting them |
| Download rate after completion | Are users actually using the outputs? |
| Return run rate (users who run > 1 pipeline) | Core product value validation |

---

## 24. LAUNCH STRATEGY

### Beta Phase (End of Week 8)
**Target:** 20 handpicked beta users
**Channels:** Personal network, Twitter/X DMs, LinkedIn, IndieHackers, local startup communities (Ahmedabad/Surat/Bangalore)
**Offer:** Free Pro plan for 3 months in exchange for detailed feedback
**Feedback method:** Weekly 30-minute calls + in-app feedback widget

### Public Launch (End of Week 12)
**Primary channel:** Product Hunt (launch on Tuesday–Thursday for best visibility)
**Supporting channels:**
- Twitter/X thread showing a full pipeline run from input to output
- LinkedIn post targeting founders and PMs
- IndieHackers "Show IH" post
- Dev.to and Hashnode technical article (how the 18-agent pipeline works)
- YouTube demo video (5 minutes: input to full output)
- Reddit: r/SaaS, r/artificial, r/startups (no-spam, value-first posts)

**Launch week offer:** 30% off first 3 months on Starter and Pro for Product Hunt upvoters

### Content Strategy (pre-launch)
Start 4 weeks before public launch:
- Week 8: "Building an 18-agent AI pipeline" Twitter thread (behind-the-scenes)
- Week 9: Demo video of a complete Build mode run
- Week 10: "How I'm using AI agents to replace a 5-person dev team" blog post
- Week 11: Case study from a beta user
- Week 12: Launch day

### SEO Keywords to Target
- "AI code generator"
- "AI software development"
- "automated software development"
- "AI agent pipeline"
- "build app without code AI"
- "AI for non-technical founders"

---

## 25. IMMEDIATE NEXT STEPS

### This Week (Ordered by Priority)

**Day 1 — Write Agent 01–06 Skill Files**
Create these files locally (can use Notion or any text editor):
- `skill_01_input_layer.md`
- `skill_02_requirement_analyst.md`
- `skill_03_project_manager.md`
- `skill_04_architecture.md`
- `skill_05_security.md`
- `skill_06_design.md`

Each file: copy the responsibilities and output format from Section 4 of this document, formatted as a skill file using the template in Section 15.

**Day 2 — Write Agent 07–18 Skill Files**
- `skill_07_frontend_senior.md` through `skill_18_documentation.md`

**Day 3 — Set Up Claude.ai Project**
1. Go to Claude.ai → Projects → New Project
2. Name: "PipelineAI — Development"
3. Add custom instructions: copy the Master Orchestrator Prompt from Section 14
4. Upload all 18 skill files to Project Knowledge
5. Start a new conversation and test: type `RUN: InputLayer` with Test 1 input from Section 14

**Day 4 — Run Test Pipeline #1 (BUILD mode)**
- Use Test Input #1 from Section 14
- Run all 18 agents sequentially
- Score each agent output (1–5) using the evaluation criteria
- Document every issue found

**Day 5 — Fix and Rerun**
- Rewrite skill files for agents that scored < 4
- Rerun Test Pipeline #1 and verify improvements

**Next Week — Start the Codebase**
- Day 1: Developer sets up Next.js 14 project + Clerk + Supabase + Vercel deployment
- Day 2: Prisma schema + first migration + basic route structure
- Day 3: Stripe + Inngest setup
- Day 4: Dashboard shell + authentication flow
- Day 5: Review and deploy first working version to Vercel

---

*End of document. Version 1.0. Update this file whenever a decision changes.*
*Total sections: 25. Total agents specified: 18. Total database tables: 11.*
