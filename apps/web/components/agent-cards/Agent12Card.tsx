"use client";

import { useState } from "react";

interface FileReviewResult {
  file: string;
  status: "Pass" | "Fail";
  issues: string;
}

interface FixTask {
  id: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  file: string;
  line?: number;
  fix: string;
}

interface ModuleReviewOutput {
  module_name: string;
  module_result: "Pass" | "Fail";
  file_reviews: FileReviewResult[];
  fix_tasks: FixTask[];
}

interface Agent12Output {
  overall_result?: "PASS" | "FAIL";
  module_reviews?: ModuleReviewOutput[];
}

interface AgentOutput {
  agent_name: string;
  status: string;
  structured_output?: Agent12Output;
  model_used?: string;
  duration_ms?: number;
}

interface Agent12CardProps {
  agent: AgentOutput;
}

const MAX_GATE_CYCLES = 2;

function getSeverityColor(severity: string): string {
  switch (severity) {
    case "Critical":
      return "bg-red-600 text-white border-red-700";
    case "High":
      return "bg-red-100 text-red-700 border-red-200";
    case "Medium":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "Low":
      return "bg-gray-100 text-gray-600 border-gray-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "Pass":
      return "text-green-600";
    case "Fail":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

export function Agent12Card({ agent }: Agent12CardProps) {
  const out = agent.structured_output;
  const moduleReviews = out?.module_reviews;

  if (!moduleReviews || moduleReviews.length === 0) {
    if (agent.status === "running") {
      return (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-gray-700">
              Reviewing backend code across modules...
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["Auth Service", "User Module", "Payments Module", "Notifications Module"].map(
              (name) => (
                <div key={name} className="flex items-center gap-3 p-4 bg-white border rounded-lg">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-600">
                    Reviewing <span className="font-medium">{name}</span>...
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      );
    }
    return null;
  }

  const [activeTab, setActiveTab] = useState<string>(moduleReviews[0].module_name);
  const activeModule = moduleReviews.find((m) => m.module_name === activeTab) || moduleReviews[0];

  const overallPass = out?.overall_result === "PASS";
  const totalFiles = moduleReviews.reduce((acc, m) => acc + m.file_reviews.length, 0);
  const failedFiles = moduleReviews.reduce(
    (acc, m) => acc + m.file_reviews.filter((f) => f.status === "Fail").length,
    0
  );
  const allFixTasks = moduleReviews.flatMap((m) => m.fix_tasks);
  const criticalSeverity = allFixTasks.filter((t) => t.severity === "Critical");
  const highSeverity = allFixTasks.filter((t) => t.severity === "High");
  const mediumSeverity = allFixTasks.filter((t) => t.severity === "Medium");
  const lowSeverity = allFixTasks.filter((t) => t.severity === "Low");

  return (
    <div className="p-4 space-y-4 text-sm">
      {/* Overall verdict */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              overallPass
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {overallPass ? "✅ PASS" : "❌ FAIL"}
          </span>
          <span className="text-xs text-gray-500">
            {totalFiles} files reviewed, {failedFiles} failed
          </span>
          {agent.duration_ms && (
            <span className="text-xs text-gray-500">
              {(agent.duration_ms / 1000).toFixed(1)}s
            </span>
          )}
        </div>
      </div>

      {/* Module tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {moduleReviews.map((m) => (
          <button
            key={m.module_name}
            onClick={() => setActiveTab(m.module_name)}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === m.module_name
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {m.module_name}
            <span
              className={`ml-1.5 text-[10px] ${
                m.module_result === "Fail" ? "text-red-500" : "text-gray-400"
              }`}
            >
              {m.module_result === "Fail" ? "❌" : "✅"}
            </span>
          </button>
        ))}
      </div>

      {/* Active module review */}
      <div className="space-y-4">
        {/* File review table */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            File Reviews
          </h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-gray-500">File</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-500">Status</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-500">Issues</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {activeModule.file_reviews.map((fr) => (
                  <tr
                    key={fr.file}
                    className={
                      fr.status === "Fail" ? "bg-red-50" : ""
                    }
                  >
                    <td className="px-3 py-2 font-mono text-gray-700">{fr.file}</td>
                    <td className={`px-3 py-2 font-medium ${getStatusColor(fr.status)}`}>
                      {fr.status}
                    </td>
                    <td className="px-3 py-2 text-gray-600">{fr.issues}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fix tasks */}
        {activeModule.fix_tasks.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Fix Tasks ({activeModule.fix_tasks.length})
            </h4>
            <div className="space-y-2">
              {activeModule.fix_tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg border ${
                    task.severity === "Critical"
                      ? "bg-red-50 border-red-300 ring-1 ring-red-200"
                      : getSeverityColor(task.severity)
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-medium">{task.id}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getSeverityColor(
                        task.severity
                      )}`}
                    >
                      {task.severity}
                    </span>
                    <span className="text-xs opacity-75">{task.file}</span>
                    {task.line && <span className="text-xs opacity-75">L{task.line}</span>}
                  </div>
                  <p className="text-xs">{task.fix}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Exhausted retries banner */}
      {out?.overall_result === "FAIL" && agent.status === "completed" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            ⚠️ Backend review didn&apos;t fully pass after {MAX_GATE_CYCLES} fix cycles — proceeding
            to integration with known issues flagged. Review{" "}
            <span className="font-mono">be_review_report_cycle_{MAX_GATE_CYCLES}.md</span> manually
            before deploying.
          </p>
        </div>
      )}

      {/* Summary of all modules */}
      {moduleReviews.length > 1 && (
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>
              Critical: <span className="font-medium text-red-700">{criticalSeverity.length}</span>
            </span>
            <span>
              High: <span className="font-medium text-red-600">{highSeverity.length}</span>
            </span>
            <span>
              Medium: <span className="font-medium text-yellow-600">{mediumSeverity.length}</span>
            </span>
            <span>
              Low: <span className="font-medium text-gray-600">{lowSeverity.length}</span>
            </span>
            <span className="ml-auto">
              Total fix tasks: <span className="font-medium">{allFixTasks.length}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
