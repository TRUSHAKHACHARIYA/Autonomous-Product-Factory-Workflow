"use client";

import { useMemo } from "react";

interface TestResult {
  test_type: string;
  total_tests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration_seconds: number;
  raw_output_excerpt: string;
}

interface Agent20Output {
  build_succeeded?: boolean;
  build_error?: string;
  test_results?: TestResult[];
  real_bugs?: { id: string; severity: string; file: string; error_message: string }[];
  real_coverage_percent?: number;
}

interface AgentOutput {
  agent_name: string;
  status: string;
  structured_output?: Agent20Output;
  model_used?: string;
  duration_ms?: number;
}

interface Agent20CardProps {
  agent: AgentOutput;
}

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "bg-red-100 text-red-800",
  High: "bg-orange-100 text-orange-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-blue-100 text-blue-800",
};

export function Agent20Card({ agent }: Agent20CardProps) {
  const output = agent.structured_output as Agent20Output | undefined;

  const totalTests = useMemo(() => {
    if (!output?.test_results) return { total: 0, passed: 0, failed: 0 };
    return output.test_results.reduce(
      (acc, r) => ({
        total: acc.total + r.total_tests,
        passed: acc.passed + r.passed,
        failed: acc.failed + r.failed,
      }),
      { total: 0, passed: 0, failed: 0 }
    );
  }, [output?.test_results]);

  if (!output) {
    return (
      <div className="text-sm text-gray-500 italic">
        No sandbox execution data yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            output.build_succeeded
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          Build: {output.build_succeeded ? "Passed" : "Failed"}
        </div>
        {output.real_coverage_percent !== undefined && (
          <span className="text-sm text-gray-600">
            Coverage: {output.real_coverage_percent.toFixed(1)}%
          </span>
        )}
      </div>

      {!output.build_succeeded && output.build_error && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-xs font-medium text-red-700 mb-1">Build Error</p>
          <pre className="text-xs text-red-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
            {output.build_error}
          </pre>
        </div>
      )}

      {output.test_results && output.test_results.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Test Results</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-1">Type</th>
                <th className="pb-1">Total</th>
                <th className="pb-1">Passed</th>
                <th className="pb-1">Failed</th>
                <th className="pb-1">Skipped</th>
                <th className="pb-1">Duration</th>
              </tr>
            </thead>
            <tbody>
              {output.test_results.map((r) => (
                <tr key={r.test_type} className="border-b last:border-0">
                  <td className="py-1 font-medium">{r.test_type}</td>
                  <td className="py-1">{r.total_tests}</td>
                  <td className="py-1 text-green-600">{r.passed}</td>
                  <td className="py-1 text-red-600">{r.failed}</td>
                  <td className="py-1 text-gray-400">{r.skipped}</td>
                  <td className="py-1">{r.duration_seconds.toFixed(1)}s</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">{totalTests.passed}</span> /{" "}
            {totalTests.total} passed
            {totalTests.failed > 0 && (
              <span className="text-red-600 ml-2">
                ({totalTests.failed} failed)
              </span>
            )}
          </div>
        </div>
      )}

      {output.real_bugs && output.real_bugs.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">
            Real Bugs Found ({output.real_bugs.length})
          </h4>
          <div className="space-y-2">
            {output.real_bugs.map((bug) => (
              <div
                key={bug.id}
                className="border rounded p-2 bg-gray-50 text-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-gray-500">
                    {bug.id}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                      SEVERITY_COLORS[bug.severity] || "bg-gray-100"
                    }`}
                  >
                    {bug.severity}
                  </span>
                  <span className="text-xs text-gray-500">{bug.file}</span>
                </div>
                <p className="text-xs text-gray-700 truncate">
                  {bug.error_message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {output.real_bugs && output.real_bugs.length === 0 && output.build_succeeded && (
        <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-700">
          All tests passed. No real bugs found in sandbox execution.
        </div>
      )}
    </div>
  );
}
