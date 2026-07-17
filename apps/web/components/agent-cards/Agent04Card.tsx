"use client";

import { useState } from "react";
import {
  ApprovalGateCardWithApi,
  type TabDef,
} from "./ApprovalGateCard";

interface TechStackEntry {
  layer: string;
  technology: string;
  why: string;
}

interface SystemArchitecture {
  pattern: string;
  components: string[];
  data_flow: string;
}

interface AuthStrategy {
  method: string;
  access_token_ttl: string;
  refresh_token_ttl: string;
  oauth_providers: string[];
  password_hashing: string;
}

interface EnvironmentConfig {
  dev: string;
  staging: string;
  prod: string;
}

interface Agent04Output {
  tech_stack?: TechStackEntry[];
  system_architecture?: SystemArchitecture;
  database_schema_sql?: string;
  api_contracts_yaml?: string;
  folder_structure?: string;
  auth_strategy?: AuthStrategy;
  caching_strategy?: string;
  environment_config?: EnvironmentConfig;
}

interface AgentOutput {
  agent_name: string;
  status: string;
  structured_output?: Agent04Output;
  model_used?: string;
  duration_ms?: number;
}

interface Agent04CardProps {
  agent: AgentOutput;
  runId: string;
  attempt?: number;
  onApprovalComplete?: () => void;
}

type Tab = "tech_stack" | "architecture" | "db_schema" | "api_contracts" | "folder_structure" | "auth" | "environments";

const TABS: TabDef[] = [
  { key: "tech_stack", label: "Tech Stack" },
  { key: "architecture", label: "Architecture" },
  { key: "db_schema", label: "DB Schema" },
  { key: "api_contracts", label: "API Contracts" },
  { key: "folder_structure", label: "Folder Structure" },
  { key: "auth", label: "Auth" },
  { key: "environments", label: "Environments" },
];

function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="relative rounded-lg border bg-gray-950 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        <span className="text-xs text-gray-400 uppercase font-mono">{language}</span>
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-gray-100 font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function TechStackEditor({
  entries,
  onChange,
}: {
  entries: TechStackEntry[];
  onChange: (entries: TechStackEntry[]) => void;
}) {
  function updateEntry(idx: number, field: keyof TechStackEntry, value: string) {
    const next = entries.map((e, i) => (i === idx ? { ...e, [field]: value } : e));
    onChange(next);
  }
  function addEntry() {
    onChange([...entries, { layer: "", technology: "", why: "" }]);
  }
  function removeEntry(idx: number) {
    onChange(entries.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, idx) => (
        <div key={idx} className="border rounded-lg p-3 bg-white space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500">Layer {idx + 1}</span>
            <button onClick={() => removeEntry(idx)} className="text-xs text-red-500 hover:text-red-700">
              Remove
            </button>
          </div>
          <input
            className="w-full border rounded px-3 py-1.5 text-sm"
            placeholder="Layer (e.g. Frontend)"
            value={entry.layer}
            onChange={(e) => updateEntry(idx, "layer", e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-1.5 text-sm"
            placeholder="Technology"
            value={entry.technology}
            onChange={(e) => updateEntry(idx, "technology", e.target.value)}
          />
          <textarea
            className="w-full border rounded px-3 py-1.5 text-sm"
            placeholder="Justification"
            rows={2}
            value={entry.why}
            onChange={(e) => updateEntry(idx, "why", e.target.value)}
          />
        </div>
      ))}
      <button onClick={addEntry} className="text-sm text-blue-600 hover:text-blue-800">
        + Add layer
      </button>
    </div>
  );
}

function TextFieldEditor({
  label,
  value,
  onChange,
  rows = 1,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {rows === 1 ? (
        <input
          className="w-full border rounded px-3 py-1.5 text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <textarea
          className="w-full border rounded px-3 py-1.5 text-sm font-mono"
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

export function Agent04Card({ agent, runId, attempt = 1, onApprovalComplete }: Agent04CardProps) {
  const out = agent.structured_output;
  if (!out) return null;

  const isAwaitingApproval = agent.status === "awaiting_approval";
  const [activeTab, setActiveTab] = useState<Tab>("tech_stack");
  const [editedOutput, setEditedOutput] = useState<Agent04Output>({ ...out });

  function updateField<K extends keyof Agent04Output>(key: K, value: Agent04Output[K]) {
    setEditedOutput((prev) => ({ ...prev, [key]: value }));
  }

  const output = activeTab ? editedOutput : out;

  function renderTabContent() {
    switch (activeTab) {
      case "tech_stack":
        return (
          <TechStackEditor
            entries={editedOutput.tech_stack || []}
            onChange={(entries) => updateField("tech_stack", entries)}
          />
        );

      case "architecture":
        const arch = output.system_architecture;
        if (!arch) return null;
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Pattern:</span>
              <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs font-medium">
                {arch.pattern}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">Components:</span>
              <div className="flex flex-wrap gap-1">
                {arch.components.map((c, i) => (
                  <span key={i} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">Data Flow:</span>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{arch.data_flow}</p>
            </div>
          </div>
        );

      case "db_schema":
        return output.database_schema_sql ? (
          <CodeBlock code={output.database_schema_sql} language="sql" />
        ) : null;

      case "api_contracts":
        return output.api_contracts_yaml ? (
          <CodeBlock code={output.api_contracts_yaml} language="yaml" />
        ) : null;

      case "folder_structure":
        return output.folder_structure ? (
          <CodeBlock code={output.folder_structure} language="text" />
        ) : null;

      case "auth":
        const auth = output.auth_strategy;
        if (!auth) return null;
        return (
          <div className="space-y-2 text-sm">
            <div><span className="text-gray-500">Method:</span> <span className="font-medium">{auth.method}</span></div>
            <div><span className="text-gray-500">Access Token TTL:</span> {auth.access_token_ttl}</div>
            <div><span className="text-gray-500">Refresh Token TTL:</span> {auth.refresh_token_ttl}</div>
            <div><span className="text-gray-500">OAuth Providers:</span> {auth.oauth_providers.length > 0 ? auth.oauth_providers.join(", ") : "None"}</div>
            <div><span className="text-gray-500">Password Hashing:</span> {auth.password_hashing}</div>
          </div>
        );

      case "environments":
        const env = output.environment_config;
        if (!env) return null;
        return (
          <div className="space-y-3">
            {(["dev", "staging", "prod"] as const).map((key) => (
              <div key={key}>
                <span className="text-xs font-medium text-gray-500 uppercase">{key}</span>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{env[key]}</p>
              </div>
            ))}
            {output.caching_strategy && (
              <div className="mt-4 pt-3 border-t">
                <span className="text-xs font-medium text-gray-500">Caching Strategy</span>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{output.caching_strategy}</p>
              </div>
            )}
          </div>
        );
    }
  }

  return (
    <ApprovalGateCardWithApi
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={(k) => setActiveTab(k as Tab)}
      isAwaitingApproval={isAwaitingApproval}
      attempt={attempt}
      runId={runId}
      agentName="agent_04_architecture"
      onApprovalComplete={onApprovalComplete}
      editedOutput={editedOutput as unknown as Record<string, unknown>}
      onResetEditedOutput={() => setEditedOutput({ ...out })}
    >
      {renderTabContent()}
    </ApprovalGateCardWithApi>
  );
}
