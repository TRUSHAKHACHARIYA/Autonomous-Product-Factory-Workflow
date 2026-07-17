"use client";

import { useState } from "react";
import Link from "next/link";

const PROJECTS = [
  {
    id: "datapulse",
    name: "DataPulse",
    description: "SaaS analytics platform for product teams — real-time dashboards, AI insights, usage-based billing",
    status: "completed",
    budget: "$120,000",
    timeline: "16 weeks",
    phases_completed: 19,
    total_phases: 19,
    created_at: "2026-07-10",
    tech_stack: ["Next.js 15", "FastAPI", "ClickHouse", "Kafka", "Redis"],
    category: "SaaS",
  },
  {
    id: "healthbridge",
    name: "HealthBridge",
    description: "Telemedicine platform connecting patients with specialists — video consultations, e-prescriptions, insurance integration",
    status: "completed",
    budget: "$95,000",
    timeline: "14 weeks",
    phases_completed: 19,
    total_phases: 19,
    created_at: "2026-07-08",
    tech_stack: ["Next.js 15", "Go", "PostgreSQL", "WebRTC", "Stripe"],
    category: "Healthcare",
  },
  {
    id: "fleetops",
    name: "FleetOps",
    description: "Logistics management system — route optimization, driver tracking, real-time delivery updates, fleet analytics",
    status: "in_progress",
    budget: "$75,000",
    timeline: "12 weeks",
    phases_completed: 12,
    total_phases: 19,
    created_at: "2026-07-12",
    tech_stack: ["React", "Python", "PostgreSQL", "Mapbox", "Redis"],
    category: "Logistics",
  },
  {
    id: "artivault",
    name: "ArtiVault",
    description: "NFT marketplace for digital artists — minting, auctions, royalty tracking, creator portfolios",
    status: "completed",
    budget: "$60,000",
    timeline: "10 weeks",
    phases_completed: 19,
    total_phases: 19,
    created_at: "2026-07-05",
    tech_stack: ["Next.js", "Solidity", "IPFS", "The Graph", "Tailwind"],
    category: "Web3",
  },
  {
    id: "learnpath",
    name: "LearnPath",
    description: "Adaptive learning platform — personalized course recommendations, progress tracking, AI tutor, certificate generation",
    status: "planning",
    budget: "$45,000",
    timeline: "8 weeks",
    phases_completed: 6,
    total_phases: 19,
    created_at: "2026-07-14",
    tech_stack: ["Next.js", "FastAPI", "MongoDB", "OpenAI", "Stripe"],
    category: "EdTech",
  },
  {
    id: "paystream",
    name: "PayStream",
    description: "B2B invoicing and payment platform — automated billing, multi-currency, accounting integrations, fraud detection",
    status: "in_progress",
    budget: "$85,000",
    timeline: "13 weeks",
    phases_completed: 9,
    total_phases: 19,
    created_at: "2026-07-11",
    tech_stack: ["Next.js", "Node.js", "PostgreSQL", "Stripe", "Plaid"],
    category: "FinTech",
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  completed: { label: "Completed", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  in_progress: { label: "In Progress", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  planning: { label: "Planning", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  failed: { label: "Failed", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
};

const CATEGORY_DOT: Record<string, string> = {
  SaaS: "bg-violet-500",
  Healthcare: "bg-pink-500",
  Logistics: "bg-orange-500",
  Web3: "bg-cyan-500",
  EdTech: "bg-green-500",
  FinTech: "bg-blue-500",
};

export default function DashboardPage() {
  const [filter, setFilter] = useState<string>("all");
  const statuses = ["all", "completed", "in_progress", "planning"];
  const filtered = filter === "all" ? PROJECTS : PROJECTS.filter((p) => p.status === filter);

  const totalBudget = PROJECTS.reduce((sum, p) => sum + parseInt(p.budget.replace(/[$,]/g, "")), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <span className="text-white font-bold text-[11px]">APF</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">Autonomous Product Factory</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-xs text-gray-400 font-medium">
              <span>19 Phases</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>18 AI Agents</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>LangGraph + FastAPI</span>
            </div>
            <div className="h-4 w-px bg-gray-200 hidden md:block" />
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold text-emerald-700">System Online</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Projects</h1>
          <p className="text-sm text-gray-400 font-medium">
            {PROJECTS.length} projects · {PROJECTS.filter((p) => p.status === "completed").length} completed · 19-phase pipeline
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Projects", value: PROJECTS.length, sub: "active" },
            { label: "Completed", value: PROJECTS.filter((p) => p.status === "completed").length, sub: "pipelines" },
            { label: "In Progress", value: PROJECTS.filter((p) => p.status === "in_progress").length, sub: "running" },
            { label: "Pipeline Phases", value: "19", sub: "per project" },
            { label: "Total Budget", value: `$${(totalBudget / 1000).toFixed(0)}K`, sub: "across projects" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm">
              <div className="text-xs text-gray-400 font-medium mb-1">{s.label}</div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-[10px] text-gray-300 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Pipeline Overview */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 mb-8 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Pipeline Overview — 19 Phases</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { phase: "0", name: "Foundation", color: "bg-gray-100 text-gray-600 border-gray-200" },
              { phase: "1-6", name: "Discovery & Planning", color: "bg-violet-50 text-violet-600 border-violet-200" },
              { phase: "7-8", name: "Frontend Code Gen", color: "bg-cyan-50 text-cyan-600 border-cyan-200" },
              { phase: "9", name: "FE Review Gate", color: "bg-amber-50 text-amber-600 border-amber-200" },
              { phase: "10-11", name: "Backend Code Gen", color: "bg-blue-50 text-blue-600 border-blue-200" },
              { phase: "12", name: "BE Review Gate", color: "bg-amber-50 text-amber-600 border-amber-200" },
              { phase: "13", name: "Integration", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
              { phase: "14-15", name: "QA & Bug Fixing", color: "bg-rose-50 text-rose-600 border-rose-200" },
              { phase: "16", name: "DevOps & CI/CD", color: "bg-orange-50 text-orange-600 border-orange-200" },
              { phase: "17", name: "Documentation", color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
              { phase: "18", name: "Final Delivery", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
            ].map((p) => (
              <div key={p.phase} className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border ${p.color}`}>
                Phase {p.phase}: {p.name}
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filter === s
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const status = STATUS_CONFIG[project.status];
            const progress = Math.round((project.phases_completed / project.total_phases) * 100);
            return (
              <Link
                key={project.id}
                href={`/demo/${project.id}`}
                className="group bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200"
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${CATEGORY_DOT[project.category]}`} />
                    <span className="text-xs text-gray-400 font-medium">{project.category}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[11px] rounded-md font-semibold ${status.color} ${status.bg} border ${status.border}`}>
                    {status.label}
                  </span>
                </div>

                {/* Name & Description */}
                <h3 className="text-base font-semibold text-gray-900 mb-1.5 group-hover:text-indigo-600 transition-colors">
                  {project.name}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tech_stack.slice(0, 4).map((tech) => (
                    <span key={tech} className="px-2 py-0.5 text-[10px] font-medium bg-gray-50 text-gray-500 border border-gray-100 rounded-md">
                      {tech}
                    </span>
                  ))}
                  {project.tech_stack.length > 4 && (
                    <span className="px-2 py-0.5 text-[10px] font-medium text-gray-400">
                      +{project.tech_stack.length - 4}
                    </span>
                  )}
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-400 font-medium">Pipeline Progress</span>
                    <span className="font-semibold text-gray-600">{project.phases_completed}/{project.total_phases} phases</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        progress === 100 ? "bg-emerald-500" : "bg-indigo-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-[11px] text-gray-300 pt-3 border-t border-gray-100">
                  <span>{project.budget} · {project.timeline}</span>
                  <span className="text-indigo-400 font-medium group-hover:text-indigo-600 transition-colors">
                    View Pipeline →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
