"use client";

import { useState, useMemo } from "react";

interface GeneratedFile {
  path: string;
  content: string;
}

interface Bug {
  id: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  title: string;
  steps_to_reproduce: string;
  expected: string;
  actual: string;
  file: string;
  module: string;
}

interface CoverageEstimate {
  module: string;
  estimated_coverage_percent: number;
}

interface TestTypeOutput {
  test_type: string;
  files: GeneratedFile[];
  bugs_found: Bug[];
  coverage_estimates: CoverageEstimate[];
  notes: string;
}

interface Agent14Output {
  test_type_results?: TestTypeOutput[];
}

interface AgentOutput {
  agent_name: string;
  status: string;
  structured_output?: Agent14Output;
  model_used?: string;
  duration_ms?: number;
}

interface Agent14CardProps {
  agent: AgentOutput;
}

const TEST_TYPE_LABELS: Record<string, string> = {
  Unit: "Unit",
  Integration: "Integration",
  E2E: "E2E",
  Performance: "Performance",
  Accessibility: "Accessibility",
  Security: "Security",
  CrossBrowser: "Cross-Browser",
  Regression: "Regression",
};

function getFileExtension(path: string): string {
  const parts = path.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

function getFileIcon(ext: string): string {
  switch (ext) {
    case "tsx":
    case "ts":
      return "TS";
    case "jsx":
    case "js":
      return "JS";
    case "py":
      return "PY";
    case "json":
      return "{}";
    case "yml":
    case "yaml":
      return "YML";
    default:
      return "#";
  }
}

function getFileIconColor(ext: string): string {
  switch (ext) {
    case "tsx":
      return "bg-blue-100 text-blue-700";
    case "ts":
      return "bg-blue-100 text-blue-700";
    case "jsx":
    case "js":
      return "bg-sky-100 text-sky-700";
    case "py":
      return "bg-green-100 text-green-700";
    case "json":
      return "bg-yellow-100 text-yellow-700";
    case "yml":
    case "yaml":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

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

function FileTree({
  files,
  selectedFile,
  onSelectFile,
}: {
  files: GeneratedFile[];
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
}) {
  const tree = useMemo(() => {
    const root: Record<string, unknown> = {};
    for (const f of files) {
      const parts = f.path.split("/");
      let current = root;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          (current as Record<string, string>)[part] = f.path;
        } else {
          if (!current[part]) current[part] = {};
          current = current[part] as Record<string, unknown>;
        }
      }
    }
    return root;
  }, [files]);

  function renderNode(node: Record<string, unknown>, depth: number) {
    const entries = Object.entries(node).sort(([, a], [, b]) => {
      const aIsDir = typeof a === "object";
      const bIsDir = typeof b === "object";
      if (aIsDir !== bIsDir) return aIsDir ? -1 : 1;
      return a.toString().localeCompare(b.toString());
    });

    return entries.map(([name, value]) => {
      if (typeof value === "string") {
        const ext = getFileExtension(name);
        const isSelected = value === selectedFile;
        return (
          <button
            key={value}
            onClick={() => onSelectFile(value)}
            className={`w-full text-left flex items-center gap-2 px-2 py-1 rounded text-xs font-mono transition-colors ${
              isSelected
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            <span
              className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold ${getFileIconColor(ext)}`}
            >
              {getFileIcon(ext)}
            </span>
            {name}
          </button>
        );
      }

      return (
        <div key={name}>
          <div
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-500"
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
            {name}
          </div>
          {renderNode(value as Record<string, unknown>, depth + 1)}
        </div>
      );
    });
  }

  return <div className="space-y-0.5">{renderNode(tree, 0)}</div>;
}

function CodeViewer({ file }: { file: GeneratedFile }) {
  const lines = file.content.split("\n");
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono">{file.path}</span>
        <span className="ml-auto text-[10px] text-gray-500">{lines.length} lines</span>
      </div>
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-xs">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="hover:bg-gray-800/50">
                <td className="text-right pr-4 pl-4 py-0 text-gray-500 select-none font-mono w-[1%] whitespace-nowrap">
                  {i + 1}
                </td>
                <td className="pr-4 py-0 font-mono text-gray-300 whitespace-pre">
                  {line || " "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Agent14Card({ agent }: Agent14CardProps) {
  const out = agent.structured_output;
  const testTypeResults = out?.test_type_results;

  if (!testTypeResults || testTypeResults.length === 0) {
    if (agent.status === "running") {
      return (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-gray-700">
              Generating test suites across 8 categories in parallel...
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["Unit Tests", "Integration Tests", "E2E Tests", "Performance Tests",
              "Accessibility Tests", "Security Tests", "Cross-Browser Tests", "Regression Tests"].map(
              (name) => (
                <div key={name} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-600">
                    Writing <span className="font-medium">{name}</span>...
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

  type Tab = "report" | string;
  const [activeTab, setActiveTab] = useState<Tab>("report");
  const [selectedFileTab, setSelectedFileTab] = useState<string>(
    testTypeResults[0]?.test_type || "Unit"
  );
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const allBugs = testTypeResults.flatMap((r) => r.bugs_found);
  const criticalBugs = allBugs.filter((b) => b.severity === "Critical");
  const highBugs = allBugs.filter((b) => b.severity === "High");
  const mediumBugs = allBugs.filter((b) => b.severity === "Medium");
  const lowBugs = allBugs.filter((b) => b.severity === "Low");

  const totalFiles = testTypeResults.reduce((acc, r) => acc + r.files.length, 0);

  const unitResult = testTypeResults.find((r) => r.test_type === "Unit");
  const coverageEstimates = unitResult?.coverage_estimates || [];
  const overallCoverage = coverageEstimates.length > 0
    ? Math.round(coverageEstimates.reduce((a, c) => a + c.estimated_coverage_percent, 0) / coverageEstimates.length)
    : null;

  const activeTestResult = testTypeResults.find((r) => r.test_type === selectedFileTab);

  function handleFileTabSelect(testType: string) {
    setSelectedFileTab(testType);
    const result = testTypeResults.find((r) => r.test_type === testType);
    setSelectedFile(result?.files[0]?.path || null);
  }

  return (
    <div className="p-4 space-y-4 text-sm">
      {/* Disclaimer banner */}
      <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 flex items-start gap-2">
        <span className="text-blue-600 text-sm mt-0.5">ℹ</span>
        <p className="text-xs text-blue-800">
          Bugs listed here are from static code review while writing tests. Phase 20 will
          execute these tests in a sandbox to verify which bugs are real failures. Coverage
          figures are AI-estimated until measured in the sandbox.
        </p>
      </div>

      {/* Summary badges */}
      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
          8 test types
        </span>
        <span>{totalFiles} test files</span>
        {allBugs.length > 0 ? (
          <span className="text-red-600 font-medium">{allBugs.length} bugs found</span>
        ) : (
          <span className="text-green-600 font-medium">No bugs found</span>
        )}
        {overallCoverage !== null && (
          <span className="text-gray-600">Est. coverage: {overallCoverage}%</span>
        )}
        {agent.duration_ms && (
          <span>{(agent.duration_ms / 1000).toFixed(1)}s</span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("report")}
          className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "report"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Bug Report
          {allBugs.length > 0 && (
            <span className="ml-1.5 text-[10px] text-red-500">{allBugs.length}</span>
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab("coverage");
          }}
          className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "coverage"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Coverage
        </button>
        <button
          onClick={() => {
            setActiveTab("files");
            if (activeTab !== "files") {
              handleFileTabSelect(testTypeResults[0]?.test_type || "Unit");
            }
          }}
          className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "files"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Test Files ({totalFiles})
        </button>
        {testTypeResults.map((r) => (
          <button
            key={r.test_type}
            onClick={() => {
              setActiveTab(`type-${r.test_type}`);
            }}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === `type-${r.test_type}`
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {TEST_TYPE_LABELS[r.test_type] || r.test_type}
            {r.bugs_found.length > 0 && (
              <span className="ml-1 text-[10px] text-red-500">{r.bugs_found.length}</span>
            )}
            {r.bugs_found.length === 0 && (
              <span className="ml-1 text-[10px] text-green-500">✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Bug Report Tab */}
      {activeTab === "report" && (
        <div className="space-y-4">
          {allBugs.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-sm text-green-700 font-medium">No bugs found</p>
              <p className="text-xs text-green-600 mt-1">
                All code reviewed across 8 test types appears correct (static analysis only).
              </p>
            </div>
          ) : (
            <>
              {[
                { label: "Critical", bugs: criticalBugs, color: "border-red-300 bg-red-50" },
                { label: "High", bugs: highBugs, color: "border-red-200 bg-red-50/50" },
                { label: "Medium", bugs: mediumBugs, color: "border-yellow-200 bg-yellow-50/50" },
                { label: "Low", bugs: lowBugs, color: "border-gray-200 bg-gray-50" },
              ].map(
                ({ label, bugs, color }) =>
                  bugs.length > 0 && (
                    <div key={label}>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        {label} ({bugs.length})
                      </h4>
                      <div className="space-y-2">
                        {bugs.map((bug) => (
                          <div
                            key={bug.id}
                            className={`p-3 rounded-lg border ${
                              bug.severity === "Critical"
                                ? "bg-red-50 border-red-300 ring-1 ring-red-200"
                                : color
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-medium">{bug.id}</span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getSeverityColor(
                                  bug.severity
                                )}`}
                              >
                                {bug.severity}
                              </span>
                              <span className="text-xs font-medium text-gray-700">{bug.title}</span>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1 mt-1">
                              <p><span className="font-medium">File:</span> <span className="font-mono">{bug.file}</span></p>
                              <p><span className="font-medium">Module:</span> {bug.module}</p>
                              <p><span className="font-medium">Steps:</span> {bug.steps_to_reproduce}</p>
                              <p><span className="font-medium">Expected:</span> {bug.expected}</p>
                              <p><span className="font-medium">Actual:</span> {bug.actual}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
              )}
            </>
          )}
        </div>
      )}

      {/* Coverage Tab */}
      {activeTab === "coverage" && (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <span className="text-amber-600 text-xs mt-0.5">ℹ</span>
            <p className="text-xs text-amber-800">
              These are AI-estimated coverage figures based on test-writing review, not measured
              by running a coverage tool.
            </p>
          </div>
          {coverageEstimates.length === 0 ? (
            <p className="text-xs text-gray-500">No coverage estimates available.</p>
          ) : (
            <>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-500">Module</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-500">Estimated Coverage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {coverageEstimates.map((c) => (
                      <tr key={c.module}>
                        <td className="px-3 py-2 font-medium text-gray-700">{c.module}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  c.estimated_coverage_percent >= 80
                                    ? "bg-green-500"
                                    : c.estimated_coverage_percent >= 50
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${c.estimated_coverage_percent}%` }}
                              />
                            </div>
                            <span className="font-medium">{c.estimated_coverage_percent}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {overallCoverage !== null && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <span className="text-xs text-blue-700 font-medium">
                    Overall Estimated Coverage: {overallCoverage}%
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Test Files Tab (all files with sub-tabs) */}
      {activeTab === "files" && (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {testTypeResults.map((r) => (
              <button
                key={r.test_type}
                onClick={() => handleFileTabSelect(r.test_type)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  selectedFileTab === r.test_type
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {TEST_TYPE_LABELS[r.test_type] || r.test_type}
                <span className="ml-1 text-[10px] text-gray-400">{r.files.length}</span>
              </button>
            ))}
          </div>
          {activeTestResult && activeTestResult.files.length > 0 && (
            <div className="flex gap-4 min-h-[400px]">
              <div className="w-64 flex-shrink-0 border rounded-lg p-2 bg-gray-50 overflow-y-auto max-h-[600px]">
                <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
                  Files
                </h4>
                <FileTree
                  files={activeTestResult.files}
                  selectedFile={selectedFile}
                  onSelectFile={setSelectedFile}
                />
              </div>
              <div className="flex-1 min-w-0">
                {selectedFile ? (
                  (() => {
                    const file = activeTestResult.files.find((f) => f.path === selectedFile);
                    return file ? (
                      <CodeViewer file={file} />
                    ) : (
                      <div className="text-gray-400 text-xs p-8 text-center">File not found</div>
                    );
                  })()
                ) : (
                  <div className="text-gray-400 text-xs p-8 text-center">Select a file from the tree</div>
                )}
              </div>
            </div>
          )}
          {activeTestResult && activeTestResult.files.length === 0 && (
            <p className="text-xs text-gray-500">No test files generated for this type.</p>
          )}
        </div>
      )}

      {/* Individual Test Type Tabs */}
      {testTypeResults.map((r) =>
        activeTab === `type-${r.test_type}` ? (
          <div key={r.test_type} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-700">
                {TEST_TYPE_LABELS[r.test_type] || r.test_type} Tests
              </span>
              <span className="text-[10px] text-gray-500">
                {r.files.length} files, {r.bugs_found.length} bugs
              </span>
            </div>
            {r.notes && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-600">{r.notes}</p>
              </div>
            )}
            {r.bugs_found.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Bugs Found
                </h4>
                {r.bugs_found.map((bug) => (
                  <div
                    key={bug.id}
                    className={`p-3 rounded-lg border ${
                      bug.severity === "Critical"
                        ? "bg-red-50 border-red-300 ring-1 ring-red-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-medium">{bug.id}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getSeverityColor(bug.severity)}`}>
                        {bug.severity}
                      </span>
                      <span className="text-xs font-medium text-gray-700">{bug.title}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{bug.actual}</p>
                  </div>
                ))}
              </div>
            )}
            {r.files.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Generated Files
                </h4>
                <div className="space-y-1">
                  {r.files.map((f) => (
                    <div key={f.path} className="flex items-center gap-2 px-2 py-1 text-xs font-mono text-gray-600">
                      <span
                        className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold ${getFileIconColor(
                          getFileExtension(f.path)
                        )}`}
                      >
                        {getFileIcon(getFileExtension(f.path))}
                      </span>
                      {f.path}
                      <span className="text-[10px] text-gray-400 ml-auto">
                        {f.content.split("\n").length} lines
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null
      )}
    </div>
  );
}
