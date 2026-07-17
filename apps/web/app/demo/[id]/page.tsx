"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Agent01Card } from "@/components/agent-cards/Agent01Card";
import { Agent02Card } from "@/components/agent-cards/Agent02Card";
import { Agent03Card } from "@/components/agent-cards/Agent03Card";
import { Agent04Card } from "@/components/agent-cards/Agent04Card";
import { Agent05Card } from "@/components/agent-cards/Agent05Card";
import { Agent06Card } from "@/components/agent-cards/Agent06Card";
import { Agent07Card } from "@/components/agent-cards/Agent07Card";
import { Agent08Card } from "@/components/agent-cards/Agent08Card";
import { Agent09Card } from "@/components/agent-cards/Agent09Card";
import { Agent10Card } from "@/components/agent-cards/Agent10Card";
import { Agent11Card } from "@/components/agent-cards/Agent11Card";
import { Agent12Card } from "@/components/agent-cards/Agent12Card";
import { Agent13Card } from "@/components/agent-cards/Agent13Card";
import { Agent14Card } from "@/components/agent-cards/Agent14Card";
import { Agent15Card } from "@/components/agent-cards/Agent15Card";
import { Agent16Card } from "@/components/agent-cards/Agent16Card";
import { Agent17Card } from "@/components/agent-cards/Agent17Card";
import { Agent18Card } from "@/components/agent-cards/Agent18Card";

// ============================================================================
// PROJECT CONFIG
// ============================================================================

interface ProjectConfig {
  name: string;
  description: string;
  budget: string;
  timeline: string;
  category: string;
  tech_stack: string[];
}

const PROJECTS: Record<string, ProjectConfig> = {
  datapulse: { name: "DataPulse", description: "SaaS analytics platform for product teams — real-time dashboards, AI insights, usage-based billing", budget: "$120K", timeline: "16 weeks", category: "SaaS", tech_stack: ["Next.js 15", "FastAPI", "ClickHouse", "Kafka", "Redis"] },
  healthbridge: { name: "HealthBridge", description: "Telemedicine platform — video consultations, e-prescriptions, insurance integration", budget: "$95K", timeline: "14 weeks", category: "Healthcare", tech_stack: ["Next.js 15", "Go", "PostgreSQL", "WebRTC", "Stripe"] },
  fleetops: { name: "FleetOps", description: "Logistics management — route optimization, driver tracking, real-time delivery updates", budget: "$75K", timeline: "12 weeks", category: "Logistics", tech_stack: ["React", "Python", "PostgreSQL", "Mapbox", "Redis"] },
  artivault: { name: "ArtiVault", description: "NFT marketplace — minting, auctions, royalty tracking, creator portfolios", budget: "$60K", timeline: "10 weeks", category: "Web3", tech_stack: ["Next.js", "Solidity", "IPFS", "The Graph", "Tailwind"] },
  learnpath: { name: "LearnPath", description: "Adaptive learning platform — personalized recommendations, AI tutor, certificates", budget: "$45K", timeline: "8 weeks", category: "EdTech", tech_stack: ["Next.js", "FastAPI", "MongoDB", "OpenAI", "Stripe"] },
  paystream: { name: "PayStream", description: "B2B invoicing — automated billing, multi-currency, accounting integrations", budget: "$85K", timeline: "13 weeks", category: "FinTech", tech_stack: ["Next.js", "Node.js", "PostgreSQL", "Stripe", "Plaid"] },
};

// ============================================================================
// MOCK DATA — DataPulse (Agents 01-12)
// ============================================================================

const MOCK_AGENT_01 = { agent_name: "agent_01_input_layer", status: "completed", model_used: "claude-haiku-4-5-20251001", duration_ms: 1840, structured_output: { user_input: { project_name: "DataPulse", description: "A SaaS analytics platform that lets product teams track user behavior, funnel conversions, and retention cohorts in real time.", platform: "Web Application (Responsive)", tech_preferences: ["Next.js 15", "FastAPI", "ClickHouse", "Redis", "Kafka", "React 19"], constraints: ["Must handle 10B+ events/month", "Sub-second query latency", "SOC 2 Type II compliant", "Multi-tenant data isolation", "Self-serve onboarding"], budget: "$120,000", timeline: "16 weeks" }, validation_report: { project_name_present: true, description_present: true, platform_identified: true, overall_readiness: "READY" } } };
const MOCK_AGENT_02 = { agent_name: "agent_02_requirement_analyst", status: "completed", model_used: "claude-sonnet-5", duration_ms: 9420, structured_output: { functional_requirements: [{ id: "FR-01", description: "User registration with email, Google, and GitHub OAuth" }, { id: "FR-02", description: "Workspace creation with invite-by-email and RBAC" }, { id: "FR-03", description: "Event ingestion API with Kafka queue" }, { id: "FR-04", description: "Drag-and-drop dashboard builder" }, { id: "FR-05", description: "Real-time dashboard updates via SSE" }, { id: "FR-06", description: "AI Insights engine for anomaly detection" }, { id: "FR-07", description: "Alert system with Slack/email notifications" }, { id: "FR-08", description: "SQL query runner for power users" }, { id: "FR-09", description: "Data source connectors (SDK, Segment, Amplitude)" }, { id: "FR-10", description: "Usage-based billing with Stripe" }], non_functional_requirements: [{ id: "NFR-01", category: "Performance", description: "Dashboard queries under 500ms, ingestion at 50K events/sec" }, { id: "NFR-02", category: "Scalability", description: "Horizontal scaling, ClickHouse sharding" }, { id: "NFR-03", category: "Security", description: "SOC 2 Type II, AES-256, TLS 1.3" }, { id: "NFR-04", category: "Availability", description: "99.95% uptime SLA" }, { id: "NFR-05", category: "Observability", description: "OpenTelemetry, Prometheus, Grafana" }], personas: [{ name: "Priya", role: "Product Manager", goal: "Track feature adoption", pain_point: "Manual data pulls", tech_comfort: "High" }, { name: "Marcus", role: "Data Analyst", goal: "Run cohort analyses", pain_point: "Slow tools", tech_comfort: "High" }, { name: "Elena", role: "Startup Founder", goal: "Understand user behavior", pain_point: "Expensive tools", tech_comfort: "Medium" }], user_journeys: [{ name: "Onboarding", steps: ["Sign up via Google", "Create workspace", "Install SDK", "Verify first event", "Explore dashboard"] }], ambiguities: [], complexity_score: { score: "XL", reason: "Enterprise-grade multi-tenant analytics" } } };
const MOCK_AGENT_03 = { agent_name: "agent_03_project_manager", status: "completed", model_used: "claude-sonnet-5", duration_ms: 14800, structured_output: { epics: [{ id: "EP-01", name: "Auth & Workspace", user_story: "Sign up and create workspace", task_ids: ["T-01", "T-02", "T-03"], story_points: 21, sprint: 1 }, { id: "EP-02", name: "Event Ingestion", user_story: "Send events via SDK", task_ids: ["T-04", "T-05", "T-06"], story_points: 34, sprint: 2 }, { id: "EP-03", name: "Dashboard Builder", user_story: "Build custom dashboards", task_ids: ["T-07", "T-08", "T-09", "T-10"], story_points: 55, sprint: 3 }, { id: "EP-04", name: "AI Insights", user_story: "AI-generated insights", task_ids: ["T-11", "T-12"], story_points: 21, sprint: 4 }, { id: "EP-05", name: "Billing & Alerts", user_story: "Usage-based billing and alerts", task_ids: ["T-13", "T-14", "T-15"], story_points: 34, sprint: 4 }], tasks: [{ id: "T-01", epic_id: "EP-01", title: "Supabase Auth setup", points: 8, sprint: 1, depends_on: [] }, { id: "T-02", epic_id: "EP-01", title: "Workspace CRUD with RBAC", points: 8, sprint: 1, depends_on: ["T-01"] }, { id: "T-03", epic_id: "EP-01", title: "Team invite flow", points: 5, sprint: 1, depends_on: ["T-02"] }, { id: "T-04", epic_id: "EP-02", title: "Event ingestion API", points: 13, sprint: 2, depends_on: [] }, { id: "T-05", epic_id: "EP-02", title: "Kafka pipeline", points: 13, sprint: 2, depends_on: ["T-04"] }, { id: "T-06", epic_id: "EP-02", title: "ClickHouse schema", points: 8, sprint: 2, depends_on: [] }, { id: "T-07", epic_id: "EP-03", title: "Dashboard CRUD API", points: 8, sprint: 3, depends_on: ["T-02"] }, { id: "T-08", epic_id: "EP-03", title: "Widget canvas", points: 13, sprint: 3, depends_on: ["T-07"] }, { id: "T-09", epic_id: "EP-03", title: "Chart components", points: 13, sprint: 3, depends_on: ["T-08"] }, { id: "T-10", epic_id: "EP-03", title: "SSE endpoint", points: 8, sprint: 3, depends_on: ["T-05"] }, { id: "T-11", epic_id: "EP-04", title: "Anomaly detection", points: 13, sprint: 4, depends_on: ["T-05"] }, { id: "T-12", epic_id: "EP-04", title: "AI summary generation", points: 8, sprint: 4, depends_on: ["T-11"] }, { id: "T-13", epic_id: "EP-05", title: "Stripe billing", points: 13, sprint: 4, depends_on: ["T-04"] }, { id: "T-14", epic_id: "EP-05", title: "Alert rule engine", points: 8, sprint: 4, depends_on: ["T-05"] }, { id: "T-15", epic_id: "EP-05", title: "Slack + email dispatchers", points: 5, sprint: 4, depends_on: ["T-14"] }], mvp_scope: { in_mvp: ["Auth", "Workspace", "Event ingestion", "Dashboard builder", "Real-time SSE", "Stripe billing", "Slack alerts"], in_v2: ["AI Insights", "SQL runner", "Segment connectors", "White-label"] }, timeline: [{ milestone: "Alpha", sprint: 1, deliverable: "Auth + ingestion" }, { milestone: "Beta", sprint: 2, deliverable: "ClickHouse + basic dashboard" }, { milestone: "Open Beta", sprint: 3, deliverable: "Full dashboard + alerts" }, { milestone: "GA", sprint: 4, deliverable: "Billing + AI + production" }], acceptance_criteria: [{ epic_id: "EP-01", criteria: ["User signs up", "Workspace created", "Invite works"] }, { epic_id: "EP-02", criteria: ["1K events/sec", "ClickHouse in 5s", "Invalid → 422"] }, { epic_id: "EP-03", criteria: ["4-widget dashboard in 3min", "6 chart types work", "Layout persists"] }, { epic_id: "EP-04", criteria: ["Anomaly flagged", "AI summary in 5s"] }, { epic_id: "EP-05", criteria: ["Usage metering correct", "Stripe checkout works", "Slack fires in 30s"] }], risk_register: [{ risk: "ClickHouse perf at scale", probability: "Medium", impact: "High", mitigation: "Materialized views" }, { risk: "Kafka backpressure", probability: "Medium", impact: "Medium", mitigation: "Consumer autoscaling" }, { risk: "SOC 2 delays", probability: "High", impact: "Critical", mitigation: "Start early, use Vanta" }, { risk: "Multi-tenant leakage", probability: "Low", impact: "Critical", mitigation: "RLS + tenant_id filter" }, { risk: "Stripe complexity", probability: "Medium", impact: "High", mitigation: "Metered billing SDK" }, { risk: "SSE drops", probability: "Medium", impact: "Medium", mitigation: "Redis pub/sub reconnect" }], sprint_plan: [{ sprint: 1, task_ids: ["T-01", "T-02", "T-03"], total_points: 21 }, { sprint: 2, task_ids: ["T-04", "T-05", "T-06"], total_points: 34 }, { sprint: 3, task_ids: ["T-07", "T-08", "T-09", "T-10"], total_points: 42 }, { sprint: 4, task_ids: ["T-11", "T-12", "T-13", "T-14", "T-15"], total_points: 47 }] } };
const MOCK_AGENT_04 = { agent_name: "agent_04_architecture", status: "completed", model_used: "claude-sonnet-5", duration_ms: 17600, structured_output: { tech_stack: [{ layer: "Frontend", technology: "Next.js 15 + React 19 + Tailwind", why: "RSC, App Router, rapid UI" }, { layer: "State", technology: "Zustand + React Query", why: "UI state + server cache" }, { layer: "API", technology: "FastAPI + Pydantic v2", why: "Async, auto-docs, validation" }, { layer: "Pipeline", technology: "Kafka + Faust workers", why: "Event streaming, exactly-once" }, { layer: "Analytics DB", technology: "ClickHouse", why: "Sub-second OLAP on billions" }, { layer: "Cache", technology: "Redis Cluster", why: "Query cache, rate limit, SSE" }, { layer: "Auth", technology: "Supabase Auth", why: "JWT, RBAC, RLS" }, { layer: "Billing", technology: "Stripe", why: "Usage-based billing" }, { layer: "Notifications", technology: "Resend + Slack", why: "Email + webhook" }, { layer: "Observability", technology: "OpenTelemetry + Grafana", why: "Tracing + metrics" }], system_architecture: { pattern: "Event-Driven Microservices", components: ["Next.js", "FastAPI", "Kafka", "Faust", "ClickHouse", "Redis", "Supabase", "Stripe"], data_flow: "Client → Next.js → FastAPI → Kafka → Workers → ClickHouse → API → Next.js" }, database_schema_sql: "CREATE TABLE workspaces (id UUID PRIMARY KEY, name TEXT, slug TEXT UNIQUE, owner_id UUID, plan TEXT DEFAULT 'free'); CREATE TABLE workspace_members (workspace_id UUID, user_id UUID, role TEXT); CREATE TABLE dashboards (id UUID PRIMARY KEY, workspace_id UUID, name TEXT, layout JSONB); CREATE TABLE events (event_id UUID, tenant_id UUID, event_name String, timestamp DateTime64) ENGINE MergeTree PARTITION BY toYYYYMM(timestamp);", auth_strategy: { method: "Supabase Auth", access_token_ttl: "1 hour", refresh_token_ttl: "7 days", oauth_providers: ["Google", "GitHub"], rbac: "workspace_members table" }, folder_structure: "datapulse/\n├── apps/web/ (Next.js)\n├── apps/api/ (FastAPI)\n├── packages/sdk/\n└── docker-compose.yml" } };
const MOCK_AGENT_05 = { agent_name: "agent_05_security", status: "completed", model_used: "claude-sonnet-5", duration_ms: 11200, structured_output: { owasp_review: [{ risk_id: "A01", risk_name: "Broken Access Control", status: "Covered", mitigation: "RBAC + tenant_id filter" }, { risk_id: "A02", risk_name: "Cryptographic Failures", status: "Covered", mitigation: "AES-256, TLS 1.3, RS256" }, { risk_id: "A03", risk_name: "Injection", status: "Covered", mitigation: "Pydantic validation, parameterized queries" }, { risk_id: "A04", risk_name: "Insecure Design", status: "Covered", mitigation: "Threat modeling completed" }, { risk_id: "A05", risk_name: "Security Misconfiguration", status: "Risk", mitigation: "Hardening checklist" }, { risk_id: "A06", risk_name: "Vulnerable Components", status: "Risk", mitigation: "Dependabot + Snyk" }, { risk_id: "A07", risk_name: "Auth Failures", status: "Covered", mitigation: "Rate limiting, MFA" }, { risk_id: "A08", risk_name: "Data Integrity", status: "Covered", mitigation: "Webhook signatures, signed commits" }, { risk_id: "A09", risk_name: "Logging Failures", status: "Risk", mitigation: "OpenTelemetry in progress" }, { risk_id: "A10", risk_name: "SSRF", status: "Covered", mitigation: "No user URLs fetched" }], security_checklist: ["Pydantic validation on all endpoints", "Parameterized queries only", "JWT 1hr TTL, refresh 7d", "Rate limiting: 5/100/1000 req/min", "CORS restricted", "No secrets in code", "Sensitive data never logged", "Webhook HMAC verification", "HTTPS enforced", "Container scanning"], compliance_requirements: { gdpr_applicable: true, gdpr_requirements: ["Consent at registration", "Right to erasure", "DPA with providers", "Privacy policy", "Cookie consent", "Data export endpoint"], data_retention_days: 365, pii_fields: ["email", "full_name", "ip_address"], pii_encryption_notes: "AES-256 at rest, TLS 1.3 transit" } } };
const MOCK_AGENT_06 = { agent_name: "agent_06_design", status: "completed", model_used: "claude-sonnet-5", duration_ms: 13400, structured_output: { design_system: { color_tokens: [{ token: "brand-500", value: "#6366F1", usage: "Primary" }, { token: "success-500", value: "#22C55E", usage: "Positive" }, { token: "warning-500", value: "#F59E0B", usage: "Alerts" }, { token: "danger-500", value: "#EF4444", usage: "Errors" }], typography: [{ role: "Heading", font: "Inter", size: "1.5rem", weight: "600" }, { role: "Body", font: "Inter", size: "0.875rem", weight: "400" }, { role: "Metric", font: "JetBrains Mono", size: "2rem", weight: "700" }], spacing_scale: ["4px", "8px", "16px", "24px", "32px"] }, component_specs: [{ name: "Button", variants: ["primary", "secondary", "ghost", "danger"], sizes: ["sm", "md", "lg"] }, { name: "MetricCard", variants: ["default", "highlighted", "alert"] }, { name: "ChartWidget", variants: ["line", "bar", "funnel", "cohort", "table", "number"] }], user_flows: [{ name: "Onboarding", steps: ["Sign up", "Create workspace", "Install SDK", "Verify event", "Explore dashboard"] }, { name: "Dashboard Builder", steps: ["New dashboard", "Drag widget", "Configure data", "Add filters", "Save & share"] }], wireframes: [{ page_name: "Dashboard", elements: ["Nav", "Sidebar", "4 metric cards", "2 charts", "AI insights panel"] }, { page_name: "Builder", elements: ["Widget picker", "Grid canvas", "Config panel", "Time range"] }], responsive_breakpoints: ["640px", "768px", "1024px", "1280px"], accessibility_guidelines: ["WCAG 2.1 AA", "Focus indicators", "4.5:1 contrast", "Keyboard nav", "Screen reader labels"] } };
const MOCK_AGENT_07 = { agent_name: "agent_07_frontend_senior", status: "completed", model_used: "claude-sonnet-5", duration_ms: 15800, structured_output: { module_plan: [{ module_name: "Auth Module", files: ["login/page.tsx", "register/page.tsx", "useAuth.ts"], dependencies: ["Shared"] }, { module_name: "Dashboard Module", files: ["dashboards/page.tsx", "[id]/page.tsx", "WidgetPicker.tsx", "DashboardCanvas.tsx"], dependencies: ["Shared", "Charts"] }, { module_name: "Chart Components", files: ["LineChart.tsx", "BarChart.tsx", "FunnelChart.tsx", "CohortTable.tsx", "MetricNumber.tsx", "ChartWrapper.tsx"], dependencies: ["Shared"] }, { module_name: "Alert Module", files: ["alerts/page.tsx", "AlertRuleForm.tsx", "AlertHistory.tsx"], dependencies: ["Shared"] }, { module_name: "Shared Components", files: ["Button.tsx", "Card.tsx", "Modal.tsx", "Sidebar.tsx", "TopNav.tsx"], dependencies: [] }], component_contracts: [{ component_name: "Button", props_interface: "variant, size, onClick, disabled, loading, icon" }, { component_name: "MetricCard", props_interface: "title, value, change, format, status, loading" }, { component_name: "ChartWrapper", props_interface: "title, type, data, loading, error, onRefresh, onExport" }], routing_structure: [{ path: "/login", component: "LoginPage", protected: false }, { path: "/dashboard", component: "OverviewPage", protected: true }, { path: "/dashboards/:id", component: "DashboardDetailPage", protected: true }, { path: "/alerts", component: "AlertsPage", protected: true }], state_strategy: { global_state_tool: "Zustand", stores: ["authStore", "dashboardStore", "alertStore", "uiStore"], server_state_tool: "React Query", form_state_tool: "React Hook Form + Zod" } } };
const MOCK_AGENT_08 = { agent_name: "agent_08_frontend_junior", status: "completed", model_used: "claude-sonnet-5", duration_ms: 34200, structured_output: { modules: [{ module_name: "Auth Module", files: [{ path: "login/page.tsx", content: "'use client'; export default function LoginPage() { return <div>Login</div>; }" }, { path: "useAuth.ts", content: "export function useAuthGuard() { /* ... */ }" }] }, { module_name: "Dashboard Module", files: [{ path: "DashboardCanvas.tsx", content: "export function DashboardCanvas({ widgets, editing }) { /* ... */ }" }, { path: "ChartWrapper.tsx", content: "export function ChartWrapper({ title, type, data }) { /* ... */ }" }] }] } };
const MOCK_AGENT_09 = { agent_name: "agent_09_frontend_gate", status: "completed", model_used: "claude-sonnet-5", duration_ms: 21400, structured_output: { overall_result: "PASS", cycle: 1, module_reviews: [{ module_name: "Auth Module", module_result: "Pass", file_reviews: [{ file: "login/page.tsx", status: "Pass", issues: "none" }, { file: "useAuth.ts", status: "Pass", issues: "none" }], fix_tasks: [] }, { module_name: "Dashboard Module", module_result: "Pass", file_reviews: [{ file: "DashboardCanvas.tsx", status: "Pass", issues: "none" }, { file: "ChartWrapper.tsx", status: "Pass", issues: "none" }], fix_tasks: [] }] } };
const MOCK_AGENT_10 = { agent_name: "agent_10_backend_senior", status: "completed", model_used: "claude-sonnet-5", duration_ms: 16200, structured_output: { module_plan: [{ module_name: "Auth Service", endpoints: ["/auth/register", "/auth/login", "/auth/refresh"], dependencies: ["Supabase SDK"] }, { module_name: "Workspace Module", endpoints: ["/workspaces", "/workspaces/:id", "/workspaces/:id/members"], dependencies: ["Auth"] }, { module_name: "Event Ingestion", endpoints: ["/events/ingest", "/events/batch"], dependencies: ["Kafka"] }, { module_name: "Dashboard Module", endpoints: ["/dashboards", "/dashboards/:id", "/dashboards/:id/query"], dependencies: ["ClickHouse"] }, { module_name: "Alert Module", endpoints: ["/alerts", "/alerts/:id", "/alerts/:id/test"], dependencies: ["Auth", "ClickHouse", "Notifications"] }], middleware_chain: { chain: ["RequestID", "CORS", "RateLimit", "TenantExtractor", "Auth", "RBAC", "Validation", "Controller", "ErrorHandler", "Logger"] }, error_strategy: { standard_response_shape: '{ "success": boolean, "data": T, "error": { "code": string, "message": string } }', error_codes: ["VALIDATION_ERROR", "UNAUTHORIZED", "FORBIDDEN", "NOT_FOUND", "RATE_LIMITED", "TENANT_MISMATCH", "QUOTA_EXCEEDED", "INTERNAL_ERROR"] } } };
const MOCK_AGENT_11 = { agent_name: "agent_11_backend_junior", status: "completed", model_used: "claude-sonnet-5", duration_ms: 42800, structured_output: { modules: [{ module_name: "Auth Service", files: [{ path: "routers/auth.py", content: "from fastapi import APIRouter\nrouter = APIRouter(prefix='/auth')\n\n@router.post('/register')\nasync def register(body: RegisterRequest): ..." }, { path: "services/auth_service.py", content: "class AuthService:\n    async def register(self, email, password, workspace_name): ..." }] }, { module_name: "Event Ingestion", files: [{ path: "routers/events.py", content: "@router.post('/ingest')\nasync def ingest_event(events: list[EventPayload], workspace=Depends(require_api_key)): ..." }] }, { module_name: "Dashboard Query", files: [{ path: "routers/dashboards.py", content: "@router.post('/{id}/query')\nasync def dashboard_query(id: str, body: QueryRequest, workspace=Depends(require_workspace)): ..." }] }] } };
const MOCK_AGENT_12 = { agent_name: "agent_12_backend_gate", status: "completed", model_used: "claude-sonnet-5", duration_ms: 24600, structured_output: { overall_result: "PASS", cycle: 1, module_reviews: [{ module_name: "Auth Service", module_result: "Pass", file_reviews: [{ file: "routers/auth.py", status: "Pass", issues: "none" }, { file: "services/auth_service.py", status: "Pass", issues: "none" }], fix_tasks: [] }, { module_name: "Event Ingestion", module_result: "Pass", file_reviews: [{ file: "routers/events.py", status: "Pass", issues: "none" }], fix_tasks: [] }, { module_name: "Dashboard Query", module_result: "Pass", file_reviews: [{ file: "routers/dashboards.py", status: "Pass", issues: "none" }], fix_tasks: [] }] } };

// ============================================================================
// MOCK DATA — Agents 13-18 + Phase 0
// ============================================================================

const MOCK_AGENT_00 = { agent_name: "agent_00_foundation", status: "completed", model_used: "claude-sonnet-5", duration_ms: 8200, structured_output: { monorepo_structure: { package_manager: "pnpm workspaces", apps: ["apps/web (Next.js 15)", "apps/api (FastAPI)", "apps/worker (Arq)"], packages: ["packages/shared (types)", "packages/ui (components)"] }, database_schema: { supabase_tables: ["organizations", "users", "pipelines", "pipeline_runs", "agent_outputs", "generated_files"], rls_policies: ["org_isolation on all tables", "user_can_read_own_org", "service_role_bypass"], indexes: ["pipeline_runs_org_id", "agent_outputs_run_id", "generated_files_run_id"] }, docker_setup: { services: ["postgres (Supabase local)", "redis", "fastapi", "nextjs", "worker"], compose_file: "docker-compose.yml", env_template: ".env.example" }, langgraph_skeleton: { state_type: "PipelineState (TypedDict)", checkpointing: "PostgresSaver", nodes: ["input_layer", "requirement_analyst", "project_manager", "architecture", "security", "design", "fe_senior", "fe_junior", "fe_gate", "be_senior", "be_junior", "be_gate", "integration", "qa", "fixloop", "devops", "documentation", "final_product"], edges: "conditional (gate re-entry loops)" }, acceptance_checklist: ["Monorepo builds with pnpm install", "Supabase schema migrations run", "RLS policies enforced", "Docker compose up starts all services", "LangGraph skeleton compiles", "Base agent node pattern works", "Frontend shell renders"] } };

const MOCK_AGENT_13 = { agent_name: "agent_13_integration", status: "completed", model_used: "claude-sonnet-5", duration_ms: 19800, structured_output: { api_connections: [{ frontend_call: "POST /api/auth/register", backend_endpoint: "/auth/register", status: "Connected" }, { frontend_call: "POST /api/auth/login", backend_endpoint: "/auth/login", status: "Connected" }, { frontend_call: "GET /api/dashboards", backend_endpoint: "/dashboards", status: "Connected" }, { frontend_call: "POST /api/dashboards/:id/query", backend_endpoint: "/dashboards/:id/query", status: "Connected" }, { frontend_call: "POST /api/events/ingest", backend_endpoint: "/events/ingest", status: "Connected" }, { frontend_call: "POST /api/alerts", backend_endpoint: "/alerts", status: "Connected" }], mismatches: [], api_client_files: [{ path: "lib/api.ts", content: "import { supabase } from './supabase/client';\n\nconst API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';\n\nasync function request(path: string, options: RequestInit = {}) {\n  const { data: { session } } = await supabase.auth.getSession();\n  const res = await fetch(`${API_URL}${path}`, {\n    ...options,\n    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}`, ...options.headers },\n  });\n  if (!res.ok) throw new Error(`API error ${res.status}`);\n  return res.json();\n}\n\nexport const getDashboards = () => request('/dashboards');\nexport const createDashboard = (name: string) => request('/dashboards', { method: 'POST', body: JSON.stringify({ name }) });\nexport const queryDashboard = (id: string, sql: string) => request(`/dashboards/${id}/query`, { method: 'POST', body: JSON.stringify({ sql }) });" }], env_configs: [{ filename: ".env.local", content: "NEXT_PUBLIC_API_URL=http://localhost:8000\nNEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key" }], mock_data_removed: [{ file: "app/page.tsx", description: "Replaced hardcoded demo data with live API calls to /dashboards endpoint" }, { file: "lib/mock-data.ts", description: "Deleted entirely — all dashboard data now fetched from backend" }] } };

const MOCK_AGENT_14 = { agent_name: "agent_14_qa", status: "completed", model_used: "claude-sonnet-5", duration_ms: 28400, structured_output: { test_type_results: [{ test_type: "Unit", files: [{ path: "tests/unit/auth.test.ts", content: "describe('Auth', () => { ... })" }, { path: "tests/unit/events.test.ts", content: "describe('Events', () => { ... })" }], bugs_found: [{ id: "BUG-01", severity: "Medium", title: "Widget resize snaps to wrong grid position", steps_to_reproduce: "Open dashboard, add widget, resize to 3x2, release", expected: "Widget stays at 3x2", actual: "Snaps to 4x2", file: "components/dashboard/DashboardCanvas.tsx", module: "Dashboard Builder" }], coverage_estimates: [{ module: "Auth Service", estimated_coverage_percent: 92 }, { module: "Event Ingestion", estimated_coverage_percent: 87 }], notes: "Unit tests cover core auth flows and event processing" }, { test_type: "Integration", files: [{ path: "tests/integration/api.test.ts", content: "describe('API Endpoints', () => { ... })" }], bugs_found: [{ id: "BUG-03", severity: "High", title: "Batch endpoint drops events when payload > 500 items", steps_to_reproduce: "Send 600 events in batch", expected: "All 600 processed", actual: "Only 500 processed, no error", file: "app/routers/events.py", module: "Event Ingestion" }], coverage_estimates: [{ module: "API Routes", estimated_coverage_percent: 78 }], notes: "Integration tests reveal batch processing limit issue" }, { test_type: "E2E", files: [{ path: "tests/e2e/onboarding.spec.ts", content: "test('user onboarding', async ({ page }) => { ... })" }], bugs_found: [], coverage_estimates: [{ module: "Onboarding Flow", estimated_coverage_percent: 65 }], notes: "E2E tests pass for core user flows" }, { test_type: "Performance", files: [{ path: "tests/performance/ingestion.k6.ts", content: "export default function () { ... }" }], bugs_found: [], coverage_estimates: [], notes: "Ingestion throughput meets 50K/sec target" }, { test_type: "Accessibility", files: [{ path: "tests/a11y/dashboard.a11y.ts", content: "describe('Dashboard A11y', () => { ... })" }], bugs_found: [], coverage_estimates: [], notes: "WCAG AA compliance verified for main pages" }, { test_type: "Security", files: [{ path: "tests/security/owasp.test.ts", content: "describe('OWASP Top 10', () => { ... })" }], bugs_found: [{ id: "BUG-02", severity: "Low", title: "Timestamp shows UTC instead of user timezone", steps_to_reproduce: "Create alert, trigger it, view history", expected: "Local timezone", actual: "UTC", file: "components/alerts/AlertHistory.tsx", module: "Alert History" }], coverage_estimates: [], notes: "Security scan clean except minor timezone display issue" }, { test_type: "CrossBrowser", files: [{ path: "tests/crossbrowser/chrome.spec.ts", content: "test('chrome smoke', async () => { ... })" }], bugs_found: [], coverage_estimates: [], notes: "All core flows pass in Chrome, Firefox, Safari" }, { test_type: "Regression", files: [{ path: "tests/regression/dashboard.spec.ts", content: "test('dashboard regression', async () => { ... })" }], bugs_found: [{ id: "BUG-04", severity: "Medium", title: "OAuth redirect loses workspace context on mobile Safari", steps_to_reproduce: "Click Google OAuth on mobile Safari, complete auth", expected: "Redirect to workspace", actual: "Redirect to /dashboard (no workspace)", file: "app/auth/callback/route.ts", module: "Auth" }], coverage_estimates: [], notes: "Mobile Safari OAuth redirect needs Supabase config update" }] } };

const MOCK_AGENT_15 = { agent_name: "agent_15_fixloop", status: "completed", model_used: "claude-sonnet-5", duration_ms: 15600, structured_output: { fix_results: [{ bug_id: "BUG-01", status: "RESOLVED", attempts: [{ attempt_number: 1, approach_notes: "Recalculate grid position from pixel offset", fixed_file: { path: "components/dashboard/DashboardCanvas.tsx", content: "export function DashboardCanvas({ widgets, editing }) {\n  const handleDragStop = (id, position) => {\n    const col = Math.round(position.x / (GRID_WIDTH + Gutter));\n    const row = Math.round(position.y / (ROW_HEIGHT + Gutter));\n    updateWidget(id, { col: Math.max(0, Math.min(col, COLS - 1)), row });\n  };\n}" }, self_assessed_resolved: true, sandbox_retest_passed: true, sandbox_retest_error: "", explanation: "Grid calculation was using Math.floor instead of Math.round, causing off-by-one snapping. Fixed by using round and clamping to valid range." }], root_cause: "Math.floor in grid position calculation caused off-by-one error", final_fix_summary: "Changed to Math.round with clamping to valid column range" }, { bug_id: "BUG-02", status: "RESOLVED", attempts: [{ attempt_number: 1, approach_notes: "Add Intl.DateTimeFormat for timezone conversion", fixed_file: { path: "components/alerts/AlertHistory.tsx", content: "export function AlertHistory({ alerts }) {\n  return alerts.map(a => (\n    <span>{new Intl.DateTimeFormat(undefined, { timeZone: userTimezone, dateStyle: 'medium', timeStyle: 'short' }).format(new Date(a.timestamp))}</span>\n  ));\n}" }, self_assessed_resolved: true, sandbox_retest_passed: true, sandbox_retest_error: "", explanation: "Added Intl.DateTimeFormat with user's timezone preference to display alert timestamps correctly." }], root_cause: "Timestamp displayed in UTC without timezone conversion", final_fix_summary: "Added Intl.DateTimeFormat with user timezone for alert history display" }, { bug_id: "BUG-03", status: "RESOLVED", attempts: [{ attempt_number: 1, approach_notes: "Add chunking logic for large batch payloads", fixed_file: { path: "app/routers/events.py", content: "@router.post('/batch')\nasync def batch_ingest(events: list[EventPayload], workspace=Depends(require_api_key)):\n    CHUNK_SIZE = 500\n    results = []\n    for i in range(0, len(events), CHUNK_SIZE):\n        chunk = events[i:i+CHUNK_SIZE]\n        results.extend(await process_events(chunk, workspace.id))\n    return { 'processed': len(results) }" }, self_assessed_resolved: true, sandbox_retest_passed: true, sandbox_retest_error: "", explanation: "Added chunking logic that splits payloads > 500 items into smaller chunks before processing." }], root_cause: "Batch endpoint had a hard 500-item limit with no chunking", final_fix_summary: "Added automatic chunking for batch payloads exceeding 500 items" }], v2_backlog: [{ id: "BUG-04", severity: "Medium", title: "OAuth redirect loses workspace context on mobile Safari" }] } };

const MOCK_AGENT_16 = { agent_name: "agent_16_devops", status: "completed", model_used: "claude-sonnet-5", duration_ms: 22100, structured_output: { dockerfiles: [{ path: "Dockerfile.web", content: "FROM node:20-alpine AS deps\nWORKDIR /app\nCOPY package.json package-lock.json ./\nRUN npm ci\n\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY --from=deps /app/node_modules ./node_modules\nCOPY . .\nRUN npm run build\n\nFROM node:20-alpine AS runner\nWORKDIR /app\nCOPY --from=builder /app/.next/standalone .\nCOPY --from=builder /app/.next/static ./.next/static\nEXPOSE 3000\nCMD [\"node\", \"server.js\"]" }, { path: "Dockerfile.api", content: "FROM python:3.12-slim AS builder\nWORKDIR /app\nCOPY pyproject.toml ./\nRUN pip install --no-cache-dir .\nCOPY . .\n\nFROM python:3.12-slim AS runner\nWORKDIR /app\nCOPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages\nCOPY --from=builder /app ./\nEXPOSE 8000\nCMD [\"uvicorn\", \"app.main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]" }], docker_compose: { path: "docker-compose.yml", content: "version: '3.8'\nservices:\n  web:\n    build: ./apps/web\n    ports: ['3000:3000']\n  api:\n    build: ./apps/api\n    ports: ['8000:8000']\n    depends_on: [redis]\n  redis:\n    image: redis:7-alpine\n    ports: ['6379:6379']" }, ci_cd_pipeline: { path: ".github/workflows/deploy.yml", content: "name: Deploy\non:\n  push:\n    branches: [main]\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Build & Push\n        run: docker compose build\n      - name: Deploy to Railway\n        run: railway up" }, terraform_files: [], rollback_strategy: "Rollback via Railway dashboard — redeploy previous deployment tag. Health checks confirm service recovery within 60s.", health_check_endpoints: [{ service: "web", endpoint: "/health", expected_response: "{\"status\":\"ok\"}" }, { service: "api", endpoint: "/health", expected_response: "{\"status\":\"ok\"}" }], pre_deploy_warnings: ["Set STRIPE_WEBHOOK_SECRET before enabling billing", "Ensure REDIS_URL points to production Redis instance"] } };

const MOCK_AGENT_17 = { agent_name: "agent_17_documentation", status: "completed", model_used: "claude-haiku-4-5-20251001", duration_ms: 6800, structured_output: { docs: [{ path: "README.md", content: "# DataPulse\n\nSaaS analytics platform for product teams — real-time dashboards, AI insights, usage-based billing.\n\n## Quick Start\n\n```bash\ngit clone https://github.com/your-org/datapulse.git\ncd datapulse\ncp .env.example .env\ndocker compose up\n```\n\nVisit http://localhost:3000\n\n## Architecture\n\n- **Frontend**: Next.js 15 + React 19 + Tailwind\n- **API**: FastAPI + Pydantic v2\n- **Database**: Supabase (Postgres) + ClickHouse\n- **Queue**: Kafka + Faust workers\n- **Auth**: Supabase Auth (Google, GitHub OAuth)\n- **Billing**: Stripe usage-based" }, { path: "docs/api.md", content: "# API Reference\n\n## Authentication\nAll endpoints require `Authorization: Bearer <token>` header.\n\n## Endpoints\n\n### POST /auth/register\nRegister a new user and workspace.\n\n### POST /auth/login\nLogin with email and password.\n\n### GET /dashboards\nList all dashboards for the current workspace.\n\n### POST /dashboards/:id/query\nRun a SQL query against the dashboard's data source.\n\n### POST /events/ingest\nIngest a single event. Max payload: 1MB.\n\n### POST /events/batch\nIngest multiple events. Max 500 per request (auto-chunked)." }, { path: "docs/deployment.md", content: "# Deployment Guide\n\n## Prerequisites\n- Node.js 20+\n- Python 3.12+\n- Docker & Docker Compose\n\n## Production Deployment\n\n1. Set up Supabase project at supabase.com\n2. Create Stripe account and get API keys\n3. Deploy to Railway: `railway up`\n4. Configure environment variables in Railway dashboard\n5. Set up DNS and SSL via Cloudflare" }] } };

const MOCK_AGENT_18 = { agent_name: "agent_18_final_product", status: "completed", model_used: "claude-haiku-4-5-20251001", duration_ms: 4200, structured_output: { project_summary: "DataPulse v1.0.0 — A SaaS analytics platform with real-time dashboards, AI-powered insights, and usage-based billing. Built with Next.js 15, FastAPI, ClickHouse, and Kafka. 247 files generated across 19 phases with 3 of 4 bugs fixed and 1 escalated to DevOps.", delivery_checklist: [{ category: "Infrastructure", item: "Docker files built and tested", completed: true }, { category: "Infrastructure", item: "CI/CD pipeline configured", completed: true }, { category: "Infrastructure", item: "Health check endpoints verified", completed: true }, { category: "Application", item: "All 19 pipeline phases completed", completed: true }, { category: "Application", item: "4 bugs found, 3 fixed, 1 escalated", completed: true }, { category: "Application", item: "Performance benchmarks met (52K events/sec)", completed: true }, { category: "Documentation", item: "README and API docs generated", completed: true }, { category: "Documentation", item: "Deployment guide included", completed: true }, { category: "Security", item: "OWASP Top 10 reviewed", completed: true }, { category: "Security", item: "RLS policies enforced", completed: true }], next_steps: ["Set up production Supabase project and run schema migrations", "Configure Stripe live-mode API keys and webhook endpoints", "Deploy to Railway with environment variables", "Run end-to-end smoke test with real Stripe checkout", "Set up Sentry alerting and uptime monitoring"], file_index: { "apps/web": ["app/(dashboard)/dashboards/[id]/page.tsx", "app/(dashboard)/alerts/page.tsx", "components/dashboard/DashboardCanvas.tsx", "components/charts/LineChart.tsx", "lib/api.ts", "lib/supabase/client.ts"], "apps/api": ["app/routers/auth.py", "app/routers/dashboards.py", "app/routers/events.py", "app/services/auth_service.py", "app/models/state.py", "app/graph/pipeline.py"], "apps/worker": ["app/worker/tasks.py", "app/agents/agent_01.py", "app/agents/agent_14.py"], "infrastructure": ["docker-compose.yml", "Dockerfile.web", "Dockerfile.api", ".github/workflows/deploy.yml"] }, pipeline_stats: { total_cost_usd: 3.42, total_duration_ms: 284000, distinct_agent_calls: 47, agents_with_failures: [], bugs_found: 4, bugs_resolved: 3, bugs_escalated: 1 } } };

const MOCK_FOUNDATION = MOCK_AGENT_00;

// ============================================================================
// ALL MOCKS
// ============================================================================

const ALL_MOCKS: Record<string, unknown[]> = {
  datapulse: [
    MOCK_FOUNDATION, MOCK_AGENT_01, MOCK_AGENT_02, MOCK_AGENT_03, MOCK_AGENT_04, MOCK_AGENT_05, MOCK_AGENT_06,
    MOCK_AGENT_07, MOCK_AGENT_08, MOCK_AGENT_09, MOCK_AGENT_10, MOCK_AGENT_11, MOCK_AGENT_12,
    MOCK_AGENT_13, MOCK_AGENT_14, MOCK_AGENT_15, MOCK_AGENT_16, MOCK_AGENT_17, MOCK_AGENT_18,
  ],
};

// ============================================================================
// AGENT CONFIG — 19 Phases
// ============================================================================

const AGENTS = [
  { name: "agent_00_foundation", label: "Foundation", phase: "Phase 0", category: "Foundation" },
  { name: "agent_01_input_layer", label: "Input Layer", phase: "Phase 1", category: "Discovery" },
  { name: "agent_02_requirement_analyst", label: "Requirements", phase: "Phase 2", category: "Discovery" },
  { name: "agent_03_project_manager", label: "Project Plan", phase: "Phase 3", category: "Discovery" },
  { name: "agent_04_architecture", label: "Architecture", phase: "Phase 4", category: "Discovery" },
  { name: "agent_05_security", label: "Security", phase: "Phase 5", category: "Discovery" },
  { name: "agent_06_design", label: "Design System", phase: "Phase 6", category: "Discovery" },
  { name: "agent_07_frontend_senior", label: "FE Senior", phase: "Phase 7", category: "Code Gen — FE" },
  { name: "agent_08_frontend_junior", label: "FE Junior", phase: "Phase 8", category: "Code Gen — FE" },
  { name: "agent_09_frontend_gate", label: "FE Gate", phase: "Phase 9", category: "Review" },
  { name: "agent_10_backend_senior", label: "BE Senior", phase: "Phase 10", category: "Code Gen — BE" },
  { name: "agent_11_backend_junior", label: "BE Junior", phase: "Phase 11", category: "Code Gen — BE" },
  { name: "agent_12_backend_gate", label: "BE Gate", phase: "Phase 12", category: "Review" },
  { name: "agent_13_integration", label: "Integration", phase: "Phase 13", category: "Integration" },
  { name: "agent_14_qa", label: "QA Testing", phase: "Phase 14", category: "QA & Fix" },
  { name: "agent_15_fixloop", label: "Fix Loop", phase: "Phase 15", category: "QA & Fix" },
  { name: "agent_16_devops", label: "DevOps", phase: "Phase 16", category: "Deploy" },
  { name: "agent_17_documentation", label: "Documentation", phase: "Phase 17", category: "Deploy" },
  { name: "agent_18_final_product", label: "Final Delivery", phase: "Phase 18", category: "Deploy" },
];

const AGENT_CARDS = [
  // Phase 0 uses Agent01Card as placeholder (no dedicated Foundation card)
  Agent01Card,
  Agent01Card, Agent02Card, Agent03Card, Agent04Card, Agent05Card, Agent06Card,
  Agent07Card, Agent08Card, Agent09Card, Agent10Card, Agent11Card, Agent12Card,
  Agent13Card, Agent14Card, Agent15Card, Agent16Card, Agent17Card, Agent18Card,
];

const CATEGORY_COLORS: Record<string, { dot: string; badge: string }> = {
  "Foundation": { dot: "bg-gray-400", badge: "bg-gray-50 text-gray-600 border-gray-200" },
  "Discovery": { dot: "bg-violet-400", badge: "bg-violet-50 text-violet-600 border-violet-200" },
  "Code Gen — FE": { dot: "bg-cyan-500", badge: "bg-cyan-50 text-cyan-600 border-cyan-200" },
  "Code Gen — BE": { dot: "bg-blue-500", badge: "bg-blue-50 text-blue-600 border-blue-200" },
  "Review": { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-600 border-amber-200" },
  "Integration": { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  "QA & Fix": { dot: "bg-rose-500", badge: "bg-rose-50 text-rose-600 border-rose-200" },
  "Deploy": { dot: "bg-orange-500", badge: "bg-orange-50 text-orange-600 border-orange-200" },
};

// ============================================================================
// PAGE
// ============================================================================

export default function ProjectPipelinePage() {
  const params = useParams();
  const id = params.id as string;
  const project = PROJECTS[id];
  const mocks = ALL_MOCKS[id];

  const [activePhase, setActivePhase] = useState(0);

  const categories = [...new Set(AGENTS.map((a) => a.category))];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); setActivePhase((p) => Math.min(AGENTS.length - 1, p + 1)); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); setActivePhase((p) => Math.max(0, p - 1)); }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
          <p className="text-gray-400 mb-6">The project &quot;{id}&quot; doesn&apos;t exist.</p>
          <Link href="/demo" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (!mocks) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
            <Link href="/demo" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
              Dashboard
            </Link>
            <div className="h-4 w-px bg-gray-200" />
            <span className="text-sm font-semibold text-gray-800">{project.name}</span>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pipeline Running
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{project.name}</h1>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">{project.description}</p>
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
            <div className="bg-white rounded-xl border p-4"><div className="text-xs text-gray-400 mb-1">Budget</div><div className="font-bold text-gray-900">{project.budget}</div></div>
            <div className="bg-white rounded-xl border p-4"><div className="text-xs text-gray-400 mb-1">Timeline</div><div className="font-bold text-gray-900">{project.timeline}</div></div>
            <div className="bg-white rounded-xl border p-4"><div className="text-xs text-gray-400 mb-1">Category</div><div className="font-bold text-gray-900">{project.category}</div></div>
          </div>
          <p className="text-sm text-gray-400">Full pipeline output will appear here once generation completes.</p>
        </div>
      </div>
    );
  }

  const agent = AGENTS[activePhase];
  const mockData = mocks[activePhase] as any;
  const CardComponent = AGENT_CARDS[activePhase];
  const catColor = CATEGORY_COLORS[agent.category] || CATEGORY_COLORS["Discovery"];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/demo" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
              Projects
            </Link>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-[9px]">APF</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{project.name}</span>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-gray-400 font-medium">19-Phase Pipeline</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden md:inline font-medium">{project.budget} · {project.timeline}</span>
            <div className="h-4 w-px bg-gray-200 hidden md:block" />
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold text-emerald-700">19/19 Complete</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto flex">
        {/* Sidebar */}
        <aside className="w-64 xl:w-72 shrink-0 border-r border-gray-200/80 bg-white/60 backdrop-blur-sm sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <div className="p-4">
            {categories.map((cat) => {
              const catAgents = AGENTS.filter((a) => a.category === cat);
              const color = CATEGORY_COLORS[cat] || CATEGORY_COLORS["Discovery"];
              return (
                <div key={cat} className="mb-5">
                  <div className="flex items-center gap-2 mb-2 px-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{cat}</span>
                  </div>
                  <div className="space-y-0.5">
                    {catAgents.map((a) => {
                      const idx = AGENTS.indexOf(a);
                      const isActive = activePhase === idx;
                      return (
                        <button key={a.name} onClick={() => setActivePhase(idx)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive ? "bg-indigo-50 text-indigo-700 font-medium border border-indigo-100 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
                          <div className="flex items-center gap-2.5">
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-emerald-50 text-emerald-500"}`}>✓</span>
                            <div>
                              <div className="text-xs leading-tight">{a.label}</div>
                              <div className={`text-[10px] ${isActive ? "text-indigo-400" : "text-gray-300"}`}>{a.phase}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-0.5 text-[11px] rounded-md font-semibold border ${catColor.badge}`}>{agent.category}</span>
                <span className="text-xs text-gray-400 font-medium">{agent.phase}</span>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400 font-medium">{mockData.model_used}</span>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400 font-medium">{(mockData.duration_ms / 1000).toFixed(1)}s</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">{mockData.agent_name}</h2>
            </div>

            <div className="rounded-xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-medium text-sm text-gray-700 font-mono text-[13px]">{mockData.agent_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-mono">{mockData.model_used}</span>
                  <span className="px-2 py-0.5 text-[11px] rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">completed</span>
                </div>
              </div>
              <div className="p-5">
                <CardComponent agent={mockData} runId={`demo-${id}`} />
              </div>
            </div>

            {/* Nav */}
            <div className="mt-6 flex items-center justify-between">
              <button onClick={() => setActivePhase((p) => Math.max(0, p - 1))} disabled={activePhase === 0} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-white hover:text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed transition-all shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                Previous
              </button>
              <div className="flex items-center gap-1">
                {AGENTS.map((_, idx) => (
                  <button key={idx} onClick={() => setActivePhase(idx)} className={`h-1.5 rounded-full transition-all duration-300 ${idx === activePhase ? "bg-indigo-500 w-5 shadow-sm" : idx < activePhase ? "bg-emerald-400 w-1.5" : "bg-gray-200 w-1.5 hover:bg-gray-300"}`} />
                ))}
              </div>
              <button onClick={() => setActivePhase((p) => Math.min(AGENTS.length - 1, p + 1))} disabled={activePhase === AGENTS.length - 1} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg hover:shadow-lg disabled:opacity-25 disabled:cursor-not-allowed transition-all">
                Next
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </div>
            <div className="mt-4 text-center text-[11px] text-gray-300 font-medium">Use ← → arrow keys to navigate</div>
          </div>
        </main>
      </div>
    </div>
  );
}
