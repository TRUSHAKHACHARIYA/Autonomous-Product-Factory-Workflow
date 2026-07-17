"use client";

import { useState } from "react";

interface FEModule {
  module_name: string;
  files: string[];
  dependencies: string[];
}

interface ComponentContract {
  component_name: string;
  props_interface: string;
}

interface BoilerplateSetup {
  setup_commands: string[];
  key_dependencies: string[];
  config_files: string[];
}

interface RouteEntry {
  path: string;
  component: string;
  protected: boolean;
  role_restriction?: string | null;
}

interface StateStrategy {
  global_state_tool: string;
  stores: string[];
  server_state_tool: string;
  form_state_tool: string;
}

interface Agent07Output {
  module_plan?: FEModule[];
  component_contracts?: ComponentContract[];
  boilerplate_setup?: BoilerplateSetup;
  routing_structure?: RouteEntry[];
  state_strategy?: StateStrategy;
}

interface AgentOutput {
  agent_name: string;
  status: string;
  structured_output?: Agent07Output;
  model_used?: string;
  duration_ms?: number;
}

interface Agent07CardProps {
  agent: AgentOutput;
}

type Tab = "modules" | "contracts" | "routing" | "state" | "boilerplate";

const TABS: { key: Tab; label: string }[] = [
  { key: "modules", label: "Module Plan" },
  { key: "contracts", label: "Contracts" },
  { key: "routing", label: "Routing" },
  { key: "state", label: "State" },
  { key: "boilerplate", label: "Boilerplate" },
];

export function Agent07Card({ agent }: Agent07CardProps) {
  const out = agent.structured_output;
  if (!out) return null;

  const [activeTab, setActiveTab] = useState<Tab>("modules");

  function renderTabContent() {
    switch (activeTab) {
      case "modules":
        return (
          <div className="space-y-3">
            {out!.module_plan?.map((m, i) => (
              <div key={i} className="border rounded-lg p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{m.module_name}</span>
                  {m.dependencies.length > 0 && (
                    <span className="text-xs text-gray-400">
                      depends on: {m.dependencies.join(", ")}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {m.files.map((f, j) => (
                    <span
                      key={j}
                      className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-mono"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case "contracts":
        return (
          <div className="space-y-4">
            {out!.component_contracts?.map((c, i) => (
              <div key={i} className="border rounded-lg p-3 bg-white">
                <h4 className="font-medium text-sm mb-2">{c.component_name}</h4>
                <pre className="bg-gray-50 border rounded p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap text-gray-800">
                  {c.props_interface}
                </pre>
              </div>
            ))}
          </div>
        );

      case "routing":
        return (
          <div className="space-y-2">
            {out!.routing_structure?.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border rounded-lg p-3 bg-white"
              >
                <span className="font-mono text-xs text-blue-600 min-w-[120px]">
                  {r.path}
                </span>
                <span className="text-xs text-gray-500">&rarr;</span>
                <span className="text-sm">{r.component}</span>
                {r.protected && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-amber-600">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    protected
                    {r.role_restriction && ` (${r.role_restriction})`}
                  </span>
                )}
              </div>
            ))}
          </div>
        );

      case "state":
        return out!.state_strategy ? (
          <div className="space-y-3">
            <div className="border rounded-lg p-3 bg-white">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Global State</span>
                  <p className="font-medium mt-0.5">
                    {out!.state_strategy!.global_state_tool}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Server State</span>
                  <p className="font-medium mt-0.5">
                    {out!.state_strategy!.server_state_tool}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Form State</span>
                  <p className="font-medium mt-0.5">
                    {out!.state_strategy!.form_state_tool}
                  </p>
                </div>
              </div>
            </div>
            <div className="border rounded-lg p-3 bg-white">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Stores
              </h4>
              <div className="flex flex-wrap gap-1">
                {out!.state_strategy!.stores.map((s, i) => (
                  <span
                    key={i}
                    className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : null;

      case "boilerplate":
        return out!.boilerplate_setup ? (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Setup Commands
              </h4>
              <pre className="bg-gray-50 border rounded p-3 text-xs font-mono whitespace-pre-wrap text-gray-800">
                {out!.boilerplate_setup!.setup_commands.join("\n")}
              </pre>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Key Dependencies
              </h4>
              <div className="flex flex-wrap gap-1">
                {out!.boilerplate_setup!.key_dependencies.map((d, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-mono"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Config Files
              </h4>
              <ul className="space-y-1">
                {out!.boilerplate_setup!.config_files.map((c, i) => (
                  <li
                    key={i}
                    className="text-xs text-gray-600 bg-white border rounded px-3 py-1.5"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null;
    }
  }

  return (
    <div className="p-4 space-y-4 text-sm">
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {TABS.map((tab) => (
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
      <div className="min-h-[200px]">{renderTabContent()}</div>
    </div>
  );
}
