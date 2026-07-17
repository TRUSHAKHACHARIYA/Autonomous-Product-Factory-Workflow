"use client";

import { useState } from "react";

interface GeneratedFile {
  path: string;
  content: string;
}

interface Agent17Output {
  docs?: GeneratedFile[];
}

interface AgentOutput {
  agent_name: string;
  status: string;
  structured_output?: Agent17Output;
  model_used?: string;
  duration_ms?: number;
}

interface Agent17CardProps {
  agent: AgentOutput;
}

type DocTab = "readme" | "api" | "architecture" | "database" | "deployment" | "onboarding" | "changelog";

const DOC_TABS: { key: DocTab; label: string; path: string }[] = [
  { key: "readme", label: "README", path: "README.md" },
  { key: "api", label: "API", path: "docs/api.md" },
  { key: "architecture", label: "Architecture", path: "docs/architecture.md" },
  { key: "database", label: "Database", path: "docs/database.md" },
  { key: "deployment", label: "Deployment", path: "docs/deployment_runbook.md" },
  { key: "onboarding", label: "Onboarding", path: "docs/onboarding.md" },
  { key: "changelog", label: "Changelog", path: "CHANGELOG.md" },
];

export function Agent17Card({ agent }: Agent17CardProps) {
  const out = agent.structured_output;

  if (!out) {
    if (agent.status === "running") {
      return (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-gray-700">
              Generating documentation set (7 files)...
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["README", "API Reference", "Architecture", "Database", "Deployment Runbook", "Onboarding", "Changelog"].map(
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

  const docs = out.docs || [];
  const [activeTab, setActiveTab] = useState<DocTab>("readme");

  const activeDoc = docs.find((d) => d.path === DOC_TABS.find((t) => t.key === activeTab)?.path);

  const presentDocs = DOC_TABS.filter((tab) => docs.some((d) => d.path === tab.path));
  const missingDocs = DOC_TABS.filter((tab) => !docs.some((d) => d.path === tab.path));

  return (
    <div className="p-4 space-y-4 text-sm">
      {/* Summary */}
      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
          {docs.length}/7 docs generated
        </span>
        {missingDocs.length > 0 && (
          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
            {missingDocs.length} missing
          </span>
        )}
        {agent.duration_ms && (
          <span>{(agent.duration_ms / 1000).toFixed(1)}s</span>
        )}
      </div>

      {/* Missing docs warning */}
      {missingDocs.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs text-red-700 font-medium">
            Missing required docs: {missingDocs.map((d) => d.label).join(", ")}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {presentDocs.map((tab) => (
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

      {/* Document content */}
      {activeDoc && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b flex items-center justify-between">
            <span className="font-mono text-xs text-gray-600">{activeDoc.path}</span>
            <button
              onClick={() => {
                const blob = new Blob([activeDoc.content], { type: "text/markdown" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = activeDoc.path.split("/").pop() || "doc.md";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Download
            </button>
          </div>
          <div className="p-4 overflow-x-auto max-h-[600px] overflow-y-auto">
            <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap leading-relaxed">
              {activeDoc.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
