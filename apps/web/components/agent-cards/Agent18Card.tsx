"use client";

import { useState } from "react";

interface ChecklistItem {
  category: string;
  item: string;
  completed: boolean;
}

interface PipelineStats {
  total_cost_usd: number;
  total_duration_ms: number;
  distinct_agent_calls: number;
  agents_with_failures: string[];
  bugs_found: number;
  bugs_resolved: number;
  bugs_escalated: number;
}

interface Agent18Output {
  project_summary?: string;
  delivery_checklist?: ChecklistItem[];
  next_steps?: string[];
  file_index?: Record<string, string[]>;
  pipeline_stats?: PipelineStats;
}

interface AgentOutput {
  agent_name: string;
  status: string;
  structured_output?: Agent18Output;
  model_used?: string;
  duration_ms?: number;
}

interface Agent18CardProps {
  agent: AgentOutput;
}

type Tab = "summary" | "checklist" | "files" | "stats" | "next";

export function Agent18Card({ agent }: Agent18CardProps) {
  const out = agent.structured_output;

  if (!out) {
    if (agent.status === "running") {
      return (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-gray-700">
              Compiling final delivery summary...
            </span>
          </div>
        </div>
      );
    }
    return null;
  }

  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({});

  const checklist = out.delivery_checklist || [];
  const completedCount = checklist.filter((i) => i.completed).length;
  const stats = out.pipeline_stats;
  const fileIndex = out.file_index || {};
  const totalFiles = Object.values(fileIndex).reduce((sum, files) => sum + files.length, 0);

  const byCategory: Record<string, ChecklistItem[]> = {};
  for (const item of checklist) {
    byCategory[item.category] = byCategory[item.category] || [];
    byCategory[item.category].push(item);
  }

  return (
    <div className="p-4 space-y-4 text-sm">
      {/* Summary stats bar */}
      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
        <span className={`px-2 py-0.5 rounded-full font-medium ${
          completedCount === checklist.length
            ? "bg-green-100 text-green-700"
            : "bg-amber-100 text-amber-700"
        }`}>
          {completedCount}/{checklist.length} checklist items done
        </span>
        {stats && (
          <>
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {totalFiles} files
            </span>
            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
              ${stats.total_cost_usd}
            </span>
            {stats.bugs_escalated > 0 && (
              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                {stats.bugs_escalated} escalated
              </span>
            )}
          </>
        )}
        {agent.duration_ms && (
          <span>{(agent.duration_ms / 1000).toFixed(1)}s</span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {[
          { key: "summary" as Tab, label: "Summary" },
          { key: "checklist" as Tab, label: `Checklist (${completedCount}/${checklist.length})` },
          { key: "files" as Tab, label: `Files (${totalFiles})` },
          { key: "stats" as Tab, label: "Stats" },
          { key: "next" as Tab, label: "Next Steps" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Summary Tab */}
      {activeTab === "summary" && out.project_summary && (
        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Project Summary
          </h4>
          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
            {out.project_summary}
          </p>
        </div>
      )}

      {/* Checklist Tab */}
      {activeTab === "checklist" && (
        <div className="space-y-4">
          {Object.entries(byCategory).map(([category, items]) => (
            <div key={category} className="border rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b">
                <span className="text-xs font-semibold text-gray-700">{category}</span>
              </div>
              <div className="divide-y">
                {items.map((item, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-start gap-2.5">
                    <span className={`mt-0.5 text-xs ${item.completed ? "text-green-600" : "text-red-500"}`}>
                      {item.completed ? "\u2713" : "\u2717"}
                    </span>
                    <span className={`text-xs ${item.completed ? "text-gray-700" : "text-red-700"}`}>
                      {item.item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Files Tab */}
      {activeTab === "files" && (
        <div className="space-y-2">
          {Object.entries(fileIndex).map(([agentFolder, files]) => {
            const isExpanded = expandedAgents[agentFolder] || false;
            return (
              <div key={agentFolder} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedAgents((prev) => ({ ...prev, [agentFolder]: !prev[agentFolder] }))}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium text-gray-700">{agentFolder}</span>
                    <span className="text-[10px] text-gray-400 bg-white px-1.5 py-0.5 rounded">
                      {files.length} files
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isExpanded && (
                  <div className="divide-y border-t">
                    {files.map((f) => (
                      <div key={f} className="px-4 py-1.5">
                        <span className="font-mono text-[11px] text-gray-600">{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && stats && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Agents Run", value: "18", color: "blue" },
              { label: "Agent Calls", value: String(stats.distinct_agent_calls), color: "blue" },
              { label: "Files Generated", value: String(totalFiles), color: "green" },
              { label: "Total Cost", value: `$${stats.total_cost_usd}`, color: "purple" },
              { label: "Total Time", value: `${(stats.total_duration_ms / 1000).toFixed(1)}s`, color: "gray" },
              { label: "Bugs Found", value: String(stats.bugs_found), color: stats.bugs_found > 0 ? "amber" : "gray" },
              { label: "Bugs Resolved", value: String(stats.bugs_resolved), color: "green" },
              { label: "Bugs Escalated", value: String(stats.bugs_escalated), color: stats.bugs_escalated > 0 ? "red" : "green" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border rounded-lg p-3">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-lg font-bold mt-1 text-${stat.color}-600`}>{stat.value}</p>
              </div>
            ))}
          </div>
          {stats.agents_with_failures.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800 font-medium">
                {stats.agents_with_failures.length} agent call(s) failed during this run:
              </p>
              <ul className="mt-1 space-y-0.5">
                {stats.agents_with_failures.map((name) => (
                  <li key={name} className="text-[11px] text-amber-700 font-mono">{name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Next Steps Tab */}
      {activeTab === "next" && out.next_steps && (
        <div className="bg-white border rounded-lg p-4">
          <ol className="space-y-3">
            {out.next_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
                  {i + 1}
                </span>
                <span className="text-xs text-gray-700 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
