"use client";

import { useState } from "react";
import {
  ApprovalGateCardWithApi,
  type TabDef,
} from "./ApprovalGateCard";

interface ColorToken {
  token: string;
  value: string;
  usage: string;
}

interface TypographyRole {
  role: string;
  font: string;
  size: string;
  weight: string;
}

interface DesignSystem {
  color_tokens: ColorToken[];
  typography: TypographyRole[];
  spacing_scale: string[];
}

interface ComponentSpec {
  name: string;
  variants: string[];
  sizes: string[];
  states: string[];
  notes: string;
}

interface UserFlow {
  name: string;
  steps: string[];
}

interface WireframePage {
  page_name: string;
  elements: string[];
}

interface Agent06Output {
  design_system?: DesignSystem;
  component_specs?: ComponentSpec[];
  user_flows?: UserFlow[];
  wireframes?: WireframePage[];
  responsive_breakpoints?: string[];
  accessibility_guidelines?: string[];
}

interface AgentOutput {
  agent_name: string;
  status: string;
  structured_output?: Agent06Output;
  model_used?: string;
  duration_ms?: number;
}

interface Agent06CardProps {
  agent: AgentOutput;
  runId: string;
  attempt?: number;
  onApprovalComplete?: () => void;
}

type Tab = "design_system" | "components" | "user_flows" | "wireframes" | "accessibility";

const TABS: TabDef[] = [
  { key: "design_system", label: "Design System" },
  { key: "components", label: "Components" },
  { key: "user_flows", label: "User Flows" },
  { key: "wireframes", label: "Wireframes" },
  { key: "accessibility", label: "Accessibility" },
];

function isValidHex(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
}

function ColorSwatch({ token, value, usage }: ColorToken) {
  const valid = isValidHex(value);
  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-white">
      <div
        className="w-10 h-10 rounded-lg border border-gray-200 shrink-0"
        style={valid ? { backgroundColor: value } : { backgroundColor: "#ccc" }}
        title={value}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <code className="text-xs font-mono text-gray-800">{token}</code>
          <span className="text-xs text-gray-400">{value}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{usage}</p>
      </div>
    </div>
  );
}

function TypographySample({ role, font, size, weight }: TypographyRole) {
  return (
    <div className="p-3 border rounded-lg bg-white space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">{role}</span>
        <span className="text-xs text-gray-400">
          {size} / {weight}
        </span>
      </div>
      <p
        style={{ fontFamily: font, fontSize: size, fontWeight: weight }}
        className="text-gray-900 leading-tight truncate"
      >
        The quick brown fox jumps over the lazy dog
      </p>
      <p className="text-xs text-gray-400 font-mono">{font}</p>
    </div>
  );
}

export function Agent06Card({ agent, runId, attempt = 1, onApprovalComplete }: Agent06CardProps) {
  const out = agent.structured_output;
  if (!out) return null;

  const isAwaitingApproval = agent.status === "awaiting_approval";
  const [activeTab, setActiveTab] = useState<Tab>("design_system");
  const [editedOutput, setEditedOutput] = useState<Agent06Output>({ ...out });

  const ds = editedOutput.design_system;

  function renderTabContent() {
    switch (activeTab) {
      case "design_system":
        if (!ds) return null;
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                Color Tokens
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ds.color_tokens.map((c, i) => (
                  <ColorSwatch key={i} {...c} />
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                Typography
              </h4>
              <div className="space-y-2">
                {ds.typography.map((t, i) => (
                  <TypographySample key={i} {...t} />
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Spacing Scale
              </h4>
              <div className="flex flex-wrap gap-2">
                {ds.spacing_scale.map((s, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case "components":
        return (
          <div className="space-y-3">
            {editedOutput.component_specs?.map((c, i) => (
              <div key={i} className="border rounded-lg p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{c.name}</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="text-gray-500">Variants:</span>{" "}
                    {c.variants.join(", ")}
                  </div>
                  {c.sizes.length > 0 && (
                    <div>
                      <span className="text-gray-500">Sizes:</span>{" "}
                      {c.sizes.join(", ")}
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">States:</span>{" "}
                    {c.states.join(", ")}
                  </div>
                  {c.notes && (
                    <p className="text-gray-400 mt-1 italic">{c.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case "user_flows":
        return (
          <div className="space-y-4">
            {editedOutput.user_flows?.map((f, i) => (
              <div key={i} className="border rounded-lg p-3 bg-white">
                <h4 className="font-medium text-sm mb-2">{f.name}</h4>
                <div className="flex flex-wrap items-center gap-1">
                  {f.steps.map((step, j) => (
                    <span key={j} className="flex items-center gap-1">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                        {step}
                      </span>
                      {j < f.steps.length - 1 && (
                        <span className="text-gray-300 text-xs">&rarr;</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case "wireframes":
        return (
          <div className="space-y-4">
            {editedOutput.wireframes?.map((w, i) => (
              <div key={i} className="border rounded-lg p-3 bg-white">
                <h4 className="font-medium text-sm mb-2">{w.page_name}</h4>
                <ol className="space-y-1">
                  {w.elements.map((el, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="text-gray-300 shrink-0 mt-0.5">
                        {j + 1}.
                      </span>
                      {el}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        );

      case "accessibility":
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Accessibility Guidelines
              </h4>
              <ul className="space-y-2">
                {editedOutput.accessibility_guidelines?.map((g, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-gray-700 bg-white border rounded-lg p-3"
                  >
                    <span className="text-green-500 shrink-0 mt-0.5">&#10003;</span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Responsive Breakpoints
              </h4>
              <div className="flex flex-wrap gap-2">
                {editedOutput.responsive_breakpoints?.map((b, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-mono"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
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
      agentName="agent_06_design"
      onApprovalComplete={onApprovalComplete}
      editedOutput={editedOutput as unknown as Record<string, unknown>}
      onResetEditedOutput={() => setEditedOutput({ ...out })}
    >
      {renderTabContent()}
    </ApprovalGateCardWithApi>
  );
}
