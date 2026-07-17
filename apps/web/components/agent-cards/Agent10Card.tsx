"use client";

import { useState } from "react";

interface BEModule {
  module_name: string;
  endpoints: string[];
  dependencies: string[];
}

interface MiddlewareChain {
  chain: string[];
}

interface ErrorStrategy {
  standard_response_shape: string;
  error_codes: string[];
}

interface BoilerplateSetup {
  setup_commands: string[];
  key_dependencies: string[];
  config_files: string[];
}

interface LoggingStrategy {
  tool: string;
  log_levels: string[];
  format_prod: string;
  format_dev: string;
  never_log: string[];
}

interface Agent10Output {
  module_plan?: BEModule[];
  middleware_chain?: MiddlewareChain;
  error_strategy?: ErrorStrategy;
  boilerplate_setup?: BoilerplateSetup;
  logging_strategy?: LoggingStrategy;
}

interface AgentOutput {
  agent_name: string;
  status: string;
  structured_output?: Agent10Output;
  model_used?: string;
  duration_ms?: number;
}

interface Agent10CardProps {
  agent: AgentOutput;
}

type Tab = "modules" | "middleware" | "errors" | "boilerplate" | "logging";

export function Agent10Card({ agent }: Agent10CardProps) {
  const out = agent.structured_output;

  if (!out) {
    if (agent.status === "running") {
      return (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-gray-700">
              Planning backend architecture...
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["Module Planning", "Middleware Chain", "Error Strategy", "Boilerplate Setup"].map(
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

  const [activeTab, setActiveTab] = useState<Tab>("modules");

  return (
    <div className="p-4 space-y-4 text-sm">
      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {(
          [
            ["modules", "Modules", out.module_plan?.length || 0],
            ["middleware", "Middleware", out.middleware_chain?.chain.length || 0],
            ["errors", "Errors", out.error_strategy?.error_codes.length || 0],
            ["boilerplate", "Boilerplate", out.boilerplate_setup?.key_dependencies.length || 0],
            ["logging", "Logging", null],
          ] as const
        ).map(([tab, label, count]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
            {count !== null && (
              <span className="ml-1.5 text-[10px] text-gray-400">{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Modules tab */}
      {activeTab === "modules" && out.module_plan && (
        <div>
          <table className="w-full text-xs border rounded-lg overflow-hidden">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-gray-500">Module</th>
                <th className="text-left px-3 py-2 font-medium text-gray-500">Endpoints</th>
                <th className="text-left px-3 py-2 font-medium text-gray-500">Dependencies</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {out.module_plan.map((m) => (
                <tr key={m.module_name}>
                  <td className="px-3 py-2 font-medium text-gray-700">{m.module_name}</td>
                  <td className="px-3 py-2 text-gray-600 font-mono text-[11px]">
                    {m.endpoints.join(", ")}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {m.dependencies.length > 0 ? m.dependencies.join(", ") : (
                      <span className="text-gray-400">none</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Middleware tab */}
      {activeTab === "middleware" && out.middleware_chain && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Execution Order
          </h4>
          <div className="flex items-center gap-2 flex-wrap">
            {out.middleware_chain.chain.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs font-medium text-blue-700">
                  {step}
                </div>
                {i < out.middleware_chain.chain.length - 1 && (
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Errors tab */}
      {activeTab === "errors" && out.error_strategy && (
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Standard Error Response
            </h4>
            <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg text-xs overflow-x-auto">
              {out.error_strategy.standard_response_shape}
            </pre>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Error Codes
            </h4>
            <div className="flex flex-wrap gap-2">
              {out.error_strategy.error_codes.map((code) => (
                <span
                  key={code}
                  className="px-2 py-1 bg-red-50 border border-red-200 rounded text-xs font-mono text-red-700"
                >
                  {code}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Boilerplate tab */}
      {activeTab === "boilerplate" && out.boilerplate_setup && (
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Setup Commands
            </h4>
            <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg text-xs overflow-x-auto">
              {out.boilerplate_setup.setup_commands.join("\n")}
            </pre>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Key Dependencies
            </h4>
            <div className="flex flex-wrap gap-2">
              {out.boilerplate_setup.key_dependencies.map((dep) => (
                <span
                  key={dep}
                  className="px-2 py-1 bg-green-50 border border-green-200 rounded text-xs font-mono text-green-700"
                >
                  {dep}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Config Files
            </h4>
            <div className="flex flex-wrap gap-2">
              {out.boilerplate_setup.config_files.map((file) => (
                <span
                  key={file}
                  className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-mono text-gray-700"
                >
                  {file}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Logging tab */}
      {activeTab === "logging" && out.logging_strategy && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 border rounded-lg">
              <h4 className="text-xs font-semibold text-gray-500 mb-1">Tool</h4>
              <p className="text-sm font-medium text-gray-700">{out.logging_strategy.tool}</p>
            </div>
            <div className="p-3 bg-gray-50 border rounded-lg">
              <h4 className="text-xs font-semibold text-gray-500 mb-1">Log Levels</h4>
              <p className="text-sm font-medium text-gray-700">
                {out.logging_strategy.log_levels.join(", ")}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 border rounded-lg">
              <h4 className="text-xs font-semibold text-gray-500 mb-1">Format (Dev)</h4>
              <p className="text-xs font-mono text-gray-700">{out.logging_strategy.format_dev}</p>
            </div>
            <div className="p-3 bg-gray-50 border rounded-lg">
              <h4 className="text-xs font-semibold text-gray-500 mb-1">Format (Prod)</h4>
              <p className="text-xs font-mono text-gray-700">{out.logging_strategy.format_prod}</p>
            </div>
          </div>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-xs font-semibold text-yellow-700 mb-2">
              ⚠️ Never Log
            </h4>
            <div className="flex flex-wrap gap-2">
              {out.logging_strategy.never_log.map((item) => (
                <span
                  key={item}
                  className="px-2 py-1 bg-red-100 border border-red-200 rounded text-xs font-mono text-red-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
