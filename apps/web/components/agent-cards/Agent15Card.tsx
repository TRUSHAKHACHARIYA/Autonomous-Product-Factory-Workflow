"use client";

import { useState } from "react";

interface GeneratedFile {
  path: string;
  content: string;
}

interface FixAttempt {
  attempt_number: number;
  approach_notes: string;
  fixed_file: GeneratedFile;
  self_assessed_resolved: boolean;
  sandbox_retest_passed: boolean;
  sandbox_retest_error: string;
  explanation: string;
}

interface BugFixResult {
  bug_id: string;
  status: "RESOLVED" | "ESCALATED" | "SKIPPED_FILE_NOT_FOUND";
  attempts: FixAttempt[];
  root_cause: string;
  final_fix_summary: string;
  escalation_reason: string | null;
}

interface V2BacklogItem {
  id: string;
  severity: string;
  title: string;
}

interface Agent15Output {
  fix_results?: BugFixResult[];
  v2_backlog?: V2BacklogItem[];
}

interface AgentOutput {
  agent_name: string;
  status: string;
  structured_output?: Agent15Output;
  model_used?: string;
  duration_ms?: number;
}

interface Agent15CardProps {
  agent: AgentOutput;
}

type Tab = "results" | "v2backlog";

function getStatusIcon(status: string): string {
  switch (status) {
    case "RESOLVED":
      return "✅";
    case "ESCALATED":
      return "🚨";
    case "SKIPPED_FILE_NOT_FOUND":
      return "⏭️";
    default:
      return "—";
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "RESOLVED":
      return "bg-green-100 text-green-700 border-green-200";
    case "ESCALATED":
      return "bg-red-100 text-red-700 border-red-200";
    case "SKIPPED_FILE_NOT_FOUND":
      return "bg-gray-100 text-gray-600 border-gray-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

function getSeverityBadge(severity: string): string {
  switch (severity) {
    case "Critical":
      return "bg-red-600 text-white";
    case "High":
      return "bg-red-100 text-red-700";
    case "Medium":
      return "bg-yellow-100 text-yellow-700";
    case "Low":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function DiffView({
  original,
  fixed,
}: {
  original: string;
  fixed: string;
}) {
  const origLines = original.split("\n");
  const fixedLines = fixed.split("\n");
  const maxLen = Math.max(origLines.length, fixedLines.length);

  const rows: { orig: string; fixed: string; changed: boolean }[] = [];
  for (let i = 0; i < maxLen; i++) {
    const orig = origLines[i] || "";
    const fixed = fixedLines[i] || "";
    rows.push({ orig, fixed, changed: orig !== fixed });
  }

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden text-xs">
      <div className="flex divide-x divide-gray-700">
        <div className="flex-1 px-3 py-1.5 bg-gray-800 text-gray-400 font-medium">
          Original
        </div>
        <div className="flex-1 px-3 py-1.5 bg-gray-800 text-gray-400 font-medium">
          Fixed
        </div>
      </div>
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full">
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={row.changed ? "bg-yellow-900/20" : ""}
              >
                <td className="px-3 py-0 font-mono text-gray-400 whitespace-pre w-1/2 border-r border-gray-700">
                  {row.orig || " "}
                </td>
                <td className="px-3 py-0 font-mono text-gray-300 whitespace-pre w-1/2">
                  {row.fixed || " "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Agent15Card({ agent }: Agent15CardProps) {
  const out = agent.structured_output;
  const fixResults = out?.fix_results;

  if (!fixResults || fixResults.length === 0) {
    if (agent.status === "running") {
      return (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-gray-700">
              Processing Critical/High bugs with up to 3 fix attempts each...
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["Analyzing root causes", "Applying fixes", "Self-assessing resolution"].map(
              (name) => (
                <div key={name} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-600">{name}...</span>
                </div>
              )
            )}
          </div>
        </div>
      );
    }
    return null;
  }

  const [activeTab, setActiveTab] = useState<Tab>("results");
  const [expandedBug, setExpandedBug] = useState<string | null>(null);

  const v2Backlog = out?.v2_backlog || [];

  // Sort: ESCALATED first, then SKIPPED, then RESOLVED
  const sortedResults = [...fixResults].sort((a, b) => {
    const order = { ESCALATED: 0, SKIPPED_FILE_NOT_FOUND: 1, RESOLVED: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  const resolvedCount = fixResults.filter((r) => r.status === "RESOLVED").length;
  const escalatedCount = fixResults.filter((r) => r.status === "ESCALATED").length;
  const skippedCount = fixResults.filter((r) => r.status === "SKIPPED_FILE_NOT_FOUND").length;

  return (
    <div className="p-4 space-y-4 text-sm">
      {/* Disclaimer banner */}
      <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 flex items-start gap-2">
        <span className="text-blue-600 text-sm mt-0.5">ℹ</span>
        <p className="text-xs text-blue-800">
          &quot;Resolved&quot; means the fix was verified by re-running the specific test in
          the sandbox (Phase 20). Escalated bugs failed sandbox retest after 3 attempts and
          need your review.
        </p>
      </div>

      {/* Summary badges */}
      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
          {fixResults.length} bugs processed
        </span>
        {resolvedCount > 0 && (
          <span className="text-green-600 font-medium">{resolvedCount} resolved</span>
        )}
        {escalatedCount > 0 && (
          <span className="text-red-600 font-medium">{escalatedCount} escalated</span>
        )}
        {skippedCount > 0 && (
          <span className="text-gray-600 font-medium">{skippedCount} skipped</span>
        )}
        {v2Backlog.length > 0 && (
          <span className="text-yellow-600 font-medium">{v2Backlog.length} deferred to v2</span>
        )}
        {agent.duration_ms && (
          <span>{(agent.duration_ms / 1000).toFixed(1)}s</span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("results")}
          className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "results"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Fix Results
          {escalatedCount > 0 && (
            <span className="ml-1.5 text-[10px] text-red-500">{escalatedCount}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("v2backlog")}
          className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "v2backlog"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          V2 Backlog ({v2Backlog.length})
        </button>
      </div>

      {/* Fix Results Tab */}
      {activeTab === "results" && (
        <div className="space-y-3">
          {sortedResults.map((result) => {
            const isExpanded = expandedBug === result.bug_id;
            return (
              <div
                key={result.bug_id}
                className={`rounded-lg border overflow-hidden ${
                  result.status === "ESCALATED"
                    ? "border-red-300 bg-red-50"
                    : result.status === "SKIPPED_FILE_NOT_FOUND"
                    ? "border-gray-200 bg-gray-50"
                    : "border-green-200 bg-green-50"
                }`}
              >
                <button
                  onClick={() =>
                    setExpandedBug(isExpanded ? null : result.bug_id)
                  }
                  className="w-full px-4 py-3 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{getStatusIcon(result.status)}</span>
                    <span className="font-mono text-xs font-medium">
                      {result.bug_id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(
                        result.status
                      )}`}
                    >
                      {result.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {result.attempts.length} attempt{result.attempts.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-200/50">
                    {/* Root cause */}
                    {result.root_cause && (
                      <div className="mt-3">
                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                          Root Cause
                        </span>
                        <p className="text-xs text-gray-700 mt-1">{result.root_cause}</p>
                      </div>
                    )}

                    {/* Attempts timeline */}
                    <div>
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        Fix Attempts ({result.attempts.length})
                      </span>
                      <div className="mt-2 space-y-3">
                        {result.attempts.map((attempt) => (
                          <div
                            key={attempt.attempt_number}
                            className="bg-white border rounded-lg p-3"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${
                                  attempt.sandbox_retest_passed
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {attempt.attempt_number}
                              </span>
                              <span className="text-xs font-medium text-gray-700">
                                Attempt {attempt.attempt_number}
                              </span>
                              {attempt.sandbox_retest_passed && (
                                <span className="text-[10px] text-green-600 font-medium">
                                  Sandbox retest: passed
                                </span>
                              )}
                              {!attempt.sandbox_retest_passed &&
                                attempt.attempt_number < result.attempts.length && (
                                  <span className="text-[10px] text-gray-500">
                                    Sandbox retest: failed, retrying...
                                  </span>
                                )}
                              {!attempt.sandbox_retest_passed &&
                                attempt.attempt_number === result.attempts.length && (
                                  <span className="text-[10px] text-red-500">
                                    Sandbox retest: failed
                                  </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-600 mb-2">
                              {attempt.explanation}
                            </p>
                            {attempt.approach_notes && (
                              <p className="text-[10px] text-gray-500 italic">
                                Approach: {attempt.approach_notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Before/After diff for resolved bugs */}
                    {result.status === "RESOLVED" &&
                      result.attempts.length > 0 &&
                      result.attempts[0].fixed_file && (
                        <div>
                          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                            Final Fix ({result.attempts[result.attempts.length - 1].fixed_file.path})
                          </span>
                          <div className="mt-2">
                            <DiffView
                              original={
                                result.attempts[0].fixed_file.content
                              }
                              fixed={
                                result.attempts[result.attempts.length - 1]
                                  .fixed_file.content
                              }
                            />
                          </div>
                        </div>
                      )}

                    {/* Escalation reason */}
                    {result.escalation_reason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <span className="text-[10px] font-semibold text-red-700 uppercase tracking-wider">
                          Escalation Reason
                        </span>
                        <p className="text-xs text-red-800 mt-1">
                          {result.escalation_reason}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* V2 Backlog Tab */}
      {activeTab === "v2backlog" && (
        <div className="space-y-3">
          {v2Backlog.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-sm text-green-700 font-medium">No bugs deferred</p>
              <p className="text-xs text-green-600 mt-1">
                All bugs were Critical or High severity.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-600">
                These Medium/Low priority bugs are deferred to v2 and were not processed
                in this fix loop.
              </p>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-500">ID</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-500">Severity</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-500">Title</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {v2Backlog.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 font-mono text-gray-700">{item.id}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getSeverityBadge(
                              item.severity
                            )}`}
                          >
                            {item.severity}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-700">{item.title}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
