"use client";

import { useState } from "react";

interface APIConnection {
  frontend_call: string;
  backend_endpoint: string;
  status: "Connected" | "Mismatch" | "Missing";
}

interface Mismatch {
  id: string;
  description: string;
  fix: string;
}

interface EnvConfigFile {
  filename: string;
  content: string;
}

interface MockDataRemoval {
  file: string;
  description: string;
}

interface GeneratedFile {
  path: string;
  content: string;
}

interface Agent13Output {
  api_connections?: APIConnection[];
  mismatches?: Mismatch[];
  api_client_files?: GeneratedFile[];
  env_configs?: EnvConfigFile[];
  mock_data_removed?: MockDataRemoval[];
}

interface AgentOutput {
  agent_name: string;
  status: string;
  structured_output?: Agent13Output;
  model_used?: string;
  duration_ms?: number;
}

interface Agent13CardProps {
  agent: AgentOutput;
}

type Tab = "connections" | "mismatches" | "client" | "env" | "mocks";

function getStatusIcon(status: string): string {
  switch (status) {
    case "Connected":
      return "✅";
    case "Mismatch":
      return "⚠️";
    case "Missing":
      return "❌";
    default:
      return "—";
  }
}

function getStatusRowColor(status: string): string {
  switch (status) {
    case "Mismatch":
      return "bg-yellow-50";
    case "Missing":
      return "bg-red-50";
    default:
      return "";
  }
}

function CodeViewer({ file }: { file: GeneratedFile }) {
  const lines = file.content.split("\n");
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono">{file.path}</span>
        <span className="ml-auto text-[10px] text-gray-500">
          {lines.length} lines
        </span>
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

export function Agent13Card({ agent }: Agent13CardProps) {
  const out = agent.structured_output;
  const connections = out?.api_connections;

  if (!connections || connections.length === 0) {
    if (agent.status === "running") {
      return (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-gray-700">
              Cross-referencing frontend API calls with backend endpoints...
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["Matching contracts", "Building HTTP client", "Writing env configs"].map(
              (name) => (
                <div key={name} className="flex items-center gap-3 p-4 bg-white border rounded-lg">
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

  const [activeTab, setActiveTab] = useState<Tab>("connections");
  const [selectedEnvIdx, setSelectedEnvIdx] = useState(0);
  const [selectedClientIdx, setSelectedClientIdx] = useState(0);

  const mismatches = out?.mismatches || [];
  const mockDataRemoved = out?.mock_data_removed || [];
  const envConfigs = out?.env_configs || [];
  const apiClientFiles = out?.api_client_files || [];

  const connectedCount = connections.filter((c) => c.status === "Connected").length;
  const mismatchCount = connections.filter((c) => c.status === "Mismatch").length;
  const missingCount = connections.filter((c) => c.status === "Missing").length;

  return (
    <div className="p-4 space-y-4 text-sm">
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
          {connections.length} connections
        </span>
        <span className="text-green-600 font-medium">{connectedCount} matched</span>
        {mismatchCount > 0 && (
          <span className="text-yellow-600 font-medium">{mismatchCount} mismatched</span>
        )}
        {missingCount > 0 && (
          <span className="text-red-600 font-medium">{missingCount} missing</span>
        )}
        {agent.duration_ms && (
          <span>{(agent.duration_ms / 1000).toFixed(1)}s</span>
        )}
      </div>

      <div className="flex border-b border-gray-200 overflow-x-auto">
        {([
          { key: "connections" as Tab, label: "API Connections", badge: connections.length },
          { key: "mismatches" as Tab, label: "Mismatches", badge: mismatches.length },
          { key: "client" as Tab, label: "HTTP Client", badge: apiClientFiles.length },
          { key: "env" as Tab, label: "Env Configs", badge: envConfigs.length },
          { key: "mocks" as Tab, label: "Mock Data Removed", badge: mockDataRemoved.length },
        ]).map((tab) => (
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
            <span className="ml-1.5 text-[10px] text-gray-400">{tab.badge}</span>
          </button>
        ))}
      </div>

      {activeTab === "connections" && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-gray-500">Frontend Call</th>
                <th className="text-left px-3 py-2 font-medium text-gray-500">Backend Endpoint</th>
                <th className="text-left px-3 py-2 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {connections.map((c, i) => (
                <tr key={i} className={getStatusRowColor(c.status)}>
                  <td className="px-3 py-2 font-mono text-gray-700">{c.frontend_call}</td>
                  <td className="px-3 py-2 font-mono text-gray-700">{c.backend_endpoint}</td>
                  <td className="px-3 py-2 font-medium">
                    {getStatusIcon(c.status)} {c.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "mismatches" && (
        <div className="space-y-3">
          {mismatches.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-sm text-green-700 font-medium">No mismatches found</p>
              <p className="text-xs text-green-600 mt-1">All API connections match their contracts.</p>
            </div>
          ) : (
            mismatches.map((m) => (
              <div
                key={m.id}
                className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-medium text-yellow-800">{m.id}</span>
                </div>
                <p className="text-xs text-gray-700 mb-2">{m.description}</p>
                <div className="bg-white border border-yellow-100 rounded p-2">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    Fix
                  </span>
                  <p className="text-xs text-gray-700 mt-0.5">{m.fix}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "client" && (
        <div className="space-y-3">
          {apiClientFiles.length > 1 && (
            <div className="flex gap-2">
              {apiClientFiles.map((f, i) => (
                <button
                  key={f.path}
                  onClick={() => setSelectedClientIdx(i)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    selectedClientIdx === i
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {f.path.split("/").pop()}
                </button>
              ))}
            </div>
          )}
          {apiClientFiles[selectedClientIdx] && (
            <CodeViewer file={apiClientFiles[selectedClientIdx]} />
          )}
        </div>
      )}

      {activeTab === "env" && (
        <div className="space-y-3">
          {envConfigs.length > 1 && (
            <div className="flex gap-2">
              {envConfigs.map((e, i) => (
                <button
                  key={e.filename}
                  onClick={() => setSelectedEnvIdx(i)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    selectedEnvIdx === i
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {e.filename}
                </button>
              ))}
            </div>
          )}
          {envConfigs[selectedEnvIdx] && (
            <div>
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
                  <span className="text-xs text-gray-400 font-mono">
                    {envConfigs[selectedEnvIdx].filename}
                  </span>
                </div>
                <pre className="p-4 text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap">
                  {envConfigs[selectedEnvIdx].content}
                </pre>
              </div>
              <p className="text-[10px] text-amber-600 mt-2 flex items-center gap-1">
                <span>⚠️</span>
                Replace placeholder values before deploying to production.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "mocks" && (
        <div className="space-y-3">
          {mockDataRemoved.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-sm text-green-700 font-medium">No mock data found</p>
              <p className="text-xs text-green-600 mt-1">No hardcoded fixtures or stub responses detected.</p>
            </div>
          ) : (
            mockDataRemoved.map((m, i) => (
              <div
                key={i}
                className="p-3 bg-amber-50 border border-amber-200 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-medium text-amber-800">{m.file}</span>
                </div>
                <p className="text-xs text-gray-700">{m.description}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
