"use client";

import { useState } from "react";

interface GeneratedFile {
  path: string;
  content: string;
}

interface HealthCheckEndpoint {
  service: string;
  endpoint: string;
  expected_response: string;
}

interface Agent16Output {
  dockerfiles?: GeneratedFile[];
  docker_compose?: GeneratedFile;
  ci_cd_pipeline?: GeneratedFile;
  terraform_files?: GeneratedFile[];
  rollback_strategy?: string;
  health_check_endpoints?: HealthCheckEndpoint[];
  pre_deploy_warnings?: string[];
}

interface AgentOutput {
  agent_name: string;
  status: string;
  structured_output?: Agent16Output;
  model_used?: string;
  duration_ms?: number;
}

interface Agent16CardProps {
  agent: AgentOutput;
}

type Tab = "docker" | "ci-cd" | "terraform" | "rollback" | "health";

function getLanguage(path: string): string {
  if (path.endsWith(".tf")) return "hcl";
  if (path.endsWith(".yml") || path.endsWith(".yaml")) return "yaml";
  if (path.endsWith(".md")) return "markdown";
  if (path.endsWith("Dockerfile")) return "dockerfile";
  return "text";
}

export function Agent16Card({ agent }: Agent16CardProps) {
  const out = agent.structured_output;

  if (!out) {
    if (agent.status === "running") {
      return (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-gray-700">
              Generating Dockerfiles, CI/CD pipeline, Terraform, and health checks...
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["Dockerfiles", "docker-compose", "GitHub Actions CI/CD", "Terraform", "Rollback runbook"].map(
              (name) => (
                <div key={name} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-spin animate-spin" />
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

  const [activeTab, setActiveTab] = useState<Tab>("docker");
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  const warnings = out.pre_deploy_warnings || [];
  const hasEscalated = warnings.some((w) => w.includes("ESCALATED"));

  const allFiles: GeneratedFile[] = [
    ...(out.dockerfiles || []),
    ...(out.docker_compose ? [out.docker_compose] : []),
  ];
  const ciCdFiles: GeneratedFile[] = out.ci_cd_pipeline ? [out.ci_cd_pipeline] : [];
  const terraformFiles: GeneratedFile[] = out.terraform_files || [];

  return (
    <div className="p-4 space-y-4 text-sm">
      {/* Pre-deploy warnings banner */}
      {warnings.length > 0 && (
        <div
          className={`border rounded-lg p-3 flex items-start gap-2 ${
            hasEscalated
              ? "bg-red-50 border-red-300"
              : "bg-amber-50 border-amber-300"
          }`}
        >
          <span className={`text-sm mt-0.5 ${hasEscalated ? "text-red-600" : "text-amber-600"}`}>
            {hasEscalated ? "!" : "!"}
          </span>
          <div>
            <p className={`text-xs font-semibold ${hasEscalated ? "text-red-800" : "text-amber-800"}`}>
              Pre-Deploy Warnings
            </p>
            <ul className="mt-1 space-y-1">
              {warnings.map((w, i) => (
                <li key={i} className={`text-xs ${hasEscalated ? "text-red-700" : "text-amber-700"}`}>
                  - {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Summary badges */}
      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
          {out.dockerfiles?.length || 0} Dockerfiles
        </span>
        {out.docker_compose && (
          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            docker-compose.yml
          </span>
        )}
        {ciCdFiles.length > 0 && (
          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
            CI/CD Pipeline
          </span>
        )}
        {terraformFiles.length > 0 && (
          <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
            {terraformFiles.length} Terraform files
          </span>
        )}
        {agent.duration_ms && (
          <span>{(agent.duration_ms / 1000).toFixed(1)}s</span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("docker")}
          className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "docker"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Docker ({allFiles.length})
        </button>
        <button
          onClick={() => setActiveTab("ci-cd")}
          className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "ci-cd"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          CI/CD
        </button>
        {terraformFiles.length > 0 && (
          <button
            onClick={() => setActiveTab("terraform")}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === "terraform"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Terraform ({terraformFiles.length})
          </button>
        )}
        <button
          onClick={() => setActiveTab("rollback")}
          className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "rollback"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Rollback
        </button>
        <button
          onClick={() => setActiveTab("health")}
          className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "health"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Health Checks
        </button>
      </div>

      {/* Docker Tab */}
      {activeTab === "docker" && (
        <div className="space-y-3">
          {allFiles.map((file) => {
            const isExpanded = expandedFile === file.path;
            return (
              <div key={file.path} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFile(isExpanded ? null : file.path)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium text-gray-700">
                      {file.path}
                    </span>
                    <span className="text-[10px] text-gray-400 bg-white px-1.5 py-0.5 rounded">
                      {getLanguage(file.path)}
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
                  <div className="bg-gray-900 overflow-x-auto">
                    <pre className="p-4 text-xs text-gray-300 font-mono whitespace-pre overflow-x-auto max-h-[500px] overflow-y-auto">
                      {file.content}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CI/CD Tab */}
      {activeTab === "ci-cd" && (
        <div className="space-y-3">
          {ciCdFiles.map((file) => {
            const isExpanded = expandedFile === file.path;
            return (
              <div key={file.path} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFile(isExpanded ? null : file.path)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium text-gray-700">
                      {file.path}
                    </span>
                    <span className="text-[10px] text-gray-400 bg-white px-1.5 py-0.5 rounded">
                      yaml
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
                  <div className="bg-gray-900 overflow-x-auto">
                    <pre className="p-4 text-xs text-gray-300 font-mono whitespace-pre overflow-x-auto max-h-[500px] overflow-y-auto">
                      {file.content}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Terraform Tab */}
      {activeTab === "terraform" && (
        <div className="space-y-3">
          {terraformFiles.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">No Terraform files generated.</p>
            </div>
          ) : (
            terraformFiles.map((file) => {
              const isExpanded = expandedFile === file.path;
              return (
                <div key={file.path} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFile(isExpanded ? null : file.path)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-gray-700">
                        {file.path}
                      </span>
                      <span className="text-[10px] text-gray-400 bg-white px-1.5 py-0.5 rounded">
                        hcl
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
                    <div className="bg-gray-900 overflow-x-auto">
                      <pre className="p-4 text-xs text-gray-300 font-mono whitespace-pre overflow-x-auto max-h-[500px] overflow-y-auto">
                        {file.content}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Rollback Tab */}
      {activeTab === "rollback" && (
        <div className="space-y-3">
          {out.rollback_strategy ? (
            <div className="bg-white border rounded-lg p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Rollback Strategy
              </h4>
              <div className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                {out.rollback_strategy}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">No rollback strategy defined.</p>
            </div>
          )}
        </div>
      )}

      {/* Health Checks Tab */}
      {activeTab === "health" && (
        <div className="space-y-3">
          {out.health_check_endpoints && out.health_check_endpoints.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-gray-500">Service</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-500">Endpoint</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-500">Expected Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {out.health_check_endpoints.map((hc, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 font-medium text-gray-700">{hc.service}</td>
                      <td className="px-3 py-2 font-mono text-gray-600">{hc.endpoint}</td>
                      <td className="px-3 py-2 font-mono text-gray-600 text-[11px]">
                        {hc.expected_response}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">No health check endpoints defined.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
