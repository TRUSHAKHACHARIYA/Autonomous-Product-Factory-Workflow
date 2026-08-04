"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { getRun, submitClarification } from "@/lib/api";
import { Agent01Card } from "@/components/agent-cards/Agent01Card";
import { Agent02Card } from "@/components/agent-cards/Agent02Card";
import { Agent03Card } from "@/components/agent-cards/Agent03Card";
import { Agent04Card } from "@/components/agent-cards/Agent04Card";
import { Agent05Card } from "@/components/agent-cards/Agent05Card";
import { Agent06Card } from "@/components/agent-cards/Agent06Card";
import { Agent07Card } from "@/components/agent-cards/Agent07Card";
import { Agent08Card } from "@/components/agent-cards/Agent08Card";
import { Agent09Card } from "@/components/agent-cards/Agent09Card";
import { Agent10Card } from "@/components/agent-cards/Agent10Card";
import { Agent11Card } from "@/components/agent-cards/Agent11Card";
import { Agent12Card } from "@/components/agent-cards/Agent12Card";
import { Agent13Card } from "@/components/agent-cards/Agent13Card";
import { Agent14Card } from "@/components/agent-cards/Agent14Card";
import { Agent15Card } from "@/components/agent-cards/Agent15Card";
import { Agent16Card } from "@/components/agent-cards/Agent16Card";
import { Agent17Card } from "@/components/agent-cards/Agent17Card";
import { Agent18Card } from "@/components/agent-cards/Agent18Card";
import { Agent20Card } from "@/components/agent-cards/Agent20Card";

const AGENT_NAMES = [
  "agent_01_input_layer",
  "agent_02_requirement_analyst",
  "agent_03_project_manager",
  "agent_04_architecture",
  "agent_05_security",
  "agent_06_design",
  "agent_07_frontend_senior",
  "agent_08_frontend_junior",
  "agent_09_frontend_gate",
  "agent_10_backend_senior",
  "agent_11_backend_junior",
  "agent_12_backend_gate",
  "agent_13_integration",
  "agent_14_qa",
  "agent_20_test_executor",
  "agent_15_fixloop",
  "agent_16_devops",
  "agent_17_documentation",
  "agent_18_final_product",
];

interface AgentOutput {
  agent_name: string;
  status: string;
  structured_output?: Record<string, unknown>;
  duration_ms?: number;
  model_used?: string;
}

interface RunData {
  id: string;
  status: string;
  product_idea: string;
  current_agent?: string;
  error?: string;
}

function findAgent(agents: AgentOutput[], name: string): AgentOutput | undefined {
  return agents.find(
    (a) => a.agent_name === name || a.agent_name.startsWith(name + "::"),
  );
}

export default function RunDetailPage() {
  const params = useParams();
  const runId = params.id as string;
  const [run, setRun] = useState<RunData | null>(null);
  const [agents, setAgents] = useState<AgentOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const router = useRouter();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const storedOrgId = localStorage.getItem("selectedOrgId");
      if (storedOrgId) setOrgId(storedOrgId);

      async function fetchRun() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const oid = storedOrgId || localStorage.getItem("selectedOrgId");
        if (!oid) return;
        const data = await getRun(session.access_token, oid, runId);
        setRun(data.run);
        setAgents(data.agents);
        setLoading(false);
      }

      fetchRun();

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const es = new EventSource(`${API_URL}/runs/${runId}/stream`);
      eventSourceRef.current = es;

      es.addEventListener("agent_update", (e) => {
        const update = JSON.parse(e.data);
        setAgents((prev) => {
          const idx = prev.findIndex(
            (a) =>
              a.agent_name === update.agent_name ||
              (update.agent_name.startsWith(a.agent_name + "::")),
          );
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...update };
            return next;
          }
          return [...prev, update];
        });
        if (update.run_status) {
          setRun((prev) => (prev ? { ...prev, status: update.run_status } : prev));
        }
      });

      return () => {
        es.close();
      };
    }

    init();
  }, [runId, router]);

  async function handleClarify(answers: Record<string, string>) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !orgId) return;
    await submitClarification(session.access_token, orgId, runId, answers);
    setRun((prev) => (prev ? { ...prev, status: "running" } : prev));
    setAgents((prev) =>
      prev.map((a) =>
        a.agent_name === "agent_01_input_layer" ||
        a.agent_name.startsWith("agent_01_input_layer::")
          ? { ...a, status: "running" }
          : a,
      ),
    );
  }

  async function handleApprovalComplete() {
    setRun((prev) => (prev ? { ...prev, status: "running" } : prev));
    setAgents((prev) =>
      prev.map((a) =>
        a.agent_name === "agent_04_architecture"
          ? { ...a, status: "running" }
          : a,
      ),
    );
  }

  async function handleApprovalComplete06() {
    setRun((prev) => (prev ? { ...prev, status: "running" } : prev));
    setAgents((prev) =>
      prev.map((a) =>
        a.agent_name === "agent_06_design"
          ? { ...a, status: "running" }
          : a,
      ),
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading run...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => router.push("/dashboard")} className="text-blue-600">
            &larr; Back to Dashboard
          </button>
          <h1 className="text-xl font-bold">Run Detail</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {run && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">{run.product_idea}</h2>
                <p className="text-sm text-gray-500 mt-1">Run ID: {run.id}</p>
              </div>
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  run.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : run.status === "running"
                    ? "bg-blue-100 text-blue-800"
                    :                   run.status === "awaiting_clarification"
                    ? "bg-amber-100 text-amber-800"
                    : run.status === "awaiting_upgrade"
                    ? "bg-orange-100 text-orange-800"
                    : run.status === "awaiting_approval"
                    ? "bg-purple-100 text-purple-800"
                    : run.status === "failed"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {run.status}
              </span>
            </div>
            {run.error && (
              <p className="mt-3 text-red-600 text-sm">{run.error}</p>
            )}
          </div>
        )}

        <h3 className="text-lg font-semibold mb-4">Agent Timeline</h3>
        <div className="space-y-3">
          {AGENT_NAMES.map((name, idx) => {
            const agent = findAgent(agents, name);
            const status = agent?.status || "pending";

            if (name === "agent_01_input_layer") {
              return (
                <div
                  key={name}
                  className={`rounded-lg border ${
                    status === "completed"
                      ? "bg-green-50 border-green-200"
                      : status === "running"
                      ? "bg-blue-50 border-blue-200"
                      : status === "awaiting_clarification"
                      ? "bg-amber-50 border-amber-200"
                      : status === "failed"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="flex justify-between items-center px-4 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-6">{idx + 1}</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent?.model_used && (
                        <span className="text-xs text-gray-500">{agent.model_used}</span>
                      )}
                      {agent?.duration_ms && (
                        <span className="text-xs text-gray-500">
                          {(agent.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          status === "completed"
                            ? "bg-green-200 text-green-800"
                            : status === "running"
                            ? "bg-blue-200 text-blue-800"
                            : status === "awaiting_clarification"
                            ? "bg-amber-200 text-amber-800"
                            : status === "failed"
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <Agent01Card
                      agent={agent ?? { agent_name: name, status: "pending" }}
                      runId={runId}
                      onClarify={handleClarify}
                    />
                  </div>
                </div>
              );
            }

            if (name === "agent_02_requirement_analyst") {
              return (
                <div
                  key={name}
                  className={`rounded-lg border ${
                    status === "completed"
                      ? "bg-green-50 border-green-200"
                      : status === "running"
                      ? "bg-blue-50 border-blue-200"
                      : status === "failed"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="flex justify-between items-center px-4 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-6">{idx + 1}</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent?.model_used && (
                        <span className="text-xs text-gray-500">{agent.model_used}</span>
                      )}
                      {agent?.duration_ms && (
                        <span className="text-xs text-gray-500">
                          {(agent.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          status === "completed"
                            ? "bg-green-200 text-green-800"
                            : status === "running"
                            ? "bg-blue-200 text-blue-800"
                            : status === "failed"
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <Agent02Card
                      agent={agent ?? { agent_name: name, status: "pending" }}
                    />
                  </div>
                </div>
              );
            }

            if (name === "agent_03_project_manager") {
              return (
                <div
                  key={name}
                  className={`rounded-lg border ${
                    status === "completed"
                      ? "bg-green-50 border-green-200"
                      : status === "running"
                      ? "bg-blue-50 border-blue-200"
                      : status === "failed"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="flex justify-between items-center px-4 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-6">{idx + 1}</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent?.model_used && (
                        <span className="text-xs text-gray-500">{agent.model_used}</span>
                      )}
                      {agent?.duration_ms && (
                        <span className="text-xs text-gray-500">
                          {(agent.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          status === "completed"
                            ? "bg-green-200 text-green-800"
                            : status === "running"
                            ? "bg-blue-200 text-blue-800"
                            : status === "failed"
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <Agent03Card
                      agent={agent ?? { agent_name: name, status: "pending" }}
                    />
                  </div>
                </div>
              );
            }

            if (name === "agent_04_architecture") {
              const isApprovalPending = run?.status === "awaiting_approval";
              return (
                <div
                  key={name}
                  className={`rounded-lg border ${
                    status === "completed"
                      ? "bg-green-50 border-green-200"
                      : status === "running"
                      ? "bg-blue-50 border-blue-200"
                      : isApprovalPending
                      ? "bg-purple-50 border-purple-200"
                      : status === "failed"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="flex justify-between items-center px-4 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-6">{idx + 1}</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent?.model_used && (
                        <span className="text-xs text-gray-500">{agent.model_used}</span>
                      )}
                      {agent?.duration_ms && (
                        <span className="text-xs text-gray-500">
                          {(agent.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          status === "completed"
                            ? "bg-green-200 text-green-800"
                            : status === "running"
                            ? "bg-blue-200 text-blue-800"
                            : isApprovalPending
                            ? "bg-purple-200 text-purple-800"
                            : status === "failed"
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {isApprovalPending ? "awaiting_approval" : status}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <Agent04Card
                      agent={agent ?? { agent_name: name, status: "pending" }}
                      runId={runId}
                      attempt={agent?.structured_output ? 1 : 1}
                      onApprovalComplete={handleApprovalComplete}
                    />
                  </div>
                </div>
              );
            }

            if (name === "agent_05_security") {
              return (
                <div
                  key={name}
                  className={`rounded-lg border ${
                    status === "completed"
                      ? "bg-green-50 border-green-200"
                      : status === "running"
                      ? "bg-blue-50 border-blue-200"
                      : status === "failed"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="flex justify-between items-center px-4 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-6">{idx + 1}</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent?.model_used && (
                        <span className="text-xs text-gray-500">{agent.model_used}</span>
                      )}
                      {agent?.duration_ms && (
                        <span className="text-xs text-gray-500">
                          {(agent.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          status === "completed"
                            ? "bg-green-200 text-green-800"
                            : status === "running"
                            ? "bg-blue-200 text-blue-800"
                            : status === "failed"
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <Agent05Card
                      agent={agent ?? { agent_name: name, status: "pending" }}
                    />
                  </div>
                </div>
              );
            }

            if (name === "agent_06_design") {
              const isApprovalPending = run?.status === "awaiting_approval";
              return (
                <div
                  key={name}
                  className={`rounded-lg border ${
                    status === "completed"
                      ? "bg-green-50 border-green-200"
                      : status === "running"
                      ? "bg-blue-50 border-blue-200"
                      : isApprovalPending
                      ? "bg-purple-50 border-purple-200"
                      : status === "failed"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="flex justify-between items-center px-4 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-6">{idx + 1}</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent?.model_used && (
                        <span className="text-xs text-gray-500">{agent.model_used}</span>
                      )}
                      {agent?.duration_ms && (
                        <span className="text-xs text-gray-500">
                          {(agent.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          status === "completed"
                            ? "bg-green-200 text-green-800"
                            : status === "running"
                            ? "bg-blue-200 text-blue-800"
                            : isApprovalPending
                            ? "bg-purple-200 text-purple-800"
                            : status === "failed"
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {isApprovalPending ? "awaiting_approval" : status}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <Agent06Card
                      agent={agent ?? { agent_name: name, status: "pending" }}
                      runId={runId}
                      attempt={agent?.structured_output ? 1 : 1}
                      onApprovalComplete={handleApprovalComplete06}
                    />
                  </div>
                </div>
              );
            }

            if (name === "agent_07_frontend_senior") {
              return (
                <div
                  key={name}
                  className={`rounded-lg border ${
                    status === "completed"
                      ? "bg-green-50 border-green-200"
                      : status === "running"
                      ? "bg-blue-50 border-blue-200"
                      : status === "failed"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="flex justify-between items-center px-4 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-6">{idx + 1}</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent?.model_used && (
                        <span className="text-xs text-gray-500">{agent.model_used}</span>
                      )}
                      {agent?.duration_ms && (
                        <span className="text-xs text-gray-500">
                          {(agent.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          status === "completed"
                            ? "bg-green-200 text-green-800"
                            : status === "running"
                            ? "bg-blue-200 text-blue-800"
                            : status === "failed"
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <Agent07Card
                      agent={agent ?? { agent_name: name, status: "pending" }}
                    />
                  </div>
                </div>
              );
            }

            if (name === "agent_08_frontend_junior") {
              return (
                <div
                  key={name}
                  className={`rounded-lg border ${
                    status === "completed"
                      ? "bg-green-50 border-green-200"
                      : status === "running"
                      ? "bg-blue-50 border-blue-200"
                      : status === "failed"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="flex justify-between items-center px-4 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-6">{idx + 1}</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent?.model_used && (
                        <span className="text-xs text-gray-500">{agent.model_used}</span>
                      )}
                      {agent?.duration_ms && (
                        <span className="text-xs text-gray-500">
                          {(agent.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          status === "completed"
                            ? "bg-green-200 text-green-800"
                            : status === "running"
                            ? "bg-blue-200 text-blue-800"
                            : status === "failed"
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <Agent08Card
                      agent={agent ?? { agent_name: name, status: "pending" }}
                    />
                  </div>
                </div>
              );
            }

            if (name === "agent_09_frontend_gate") {
              return (
                <div
                  key={name}
                  className={`rounded-lg border ${
                    status === "completed"
                      ? "bg-green-50 border-green-200"
                      : status === "running"
                      ? "bg-blue-50 border-blue-200"
                      : status === "failed"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="flex justify-between items-center px-4 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-6">{idx + 1}</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent?.model_used && (
                        <span className="text-xs text-gray-500">{agent.model_used}</span>
                      )}
                      {agent?.duration_ms && (
                        <span className="text-xs text-gray-500">
                          {(agent.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          status === "completed"
                            ? "bg-green-200 text-green-800"
                            : status === "running"
                            ? "bg-blue-200 text-blue-800"
                            : status === "failed"
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <Agent09Card
                      agent={agent ?? { agent_name: name, status: "pending" }}
                    />
                  </div>
                </div>
              );
            }

            if (name === "agent_10_backend_senior") {
              return (
                <div
                  key={name}
                  className={`rounded-lg border ${
                    status === "completed"
                      ? "bg-green-50 border-green-200"
                      : status === "running"
                      ? "bg-blue-50 border-blue-200"
                      : status === "failed"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="flex justify-between items-center px-4 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-6">{idx + 1}</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent?.model_used && (
                        <span className="text-xs text-gray-500">{agent.model_used}</span>
                      )}
                      {agent?.duration_ms && (
                        <span className="text-xs text-gray-500">
                          {(agent.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          status === "completed"
                            ? "bg-green-200 text-green-800"
                            : status === "running"
                            ? "bg-blue-200 text-blue-800"
                            : status === "failed"
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <Agent10Card
                      agent={agent ?? { agent_name: name, status: "pending" }}
                    />
                  </div>
                </div>
              );
            }

            if (name === "agent_11_backend_junior") {
              return (
                <div
                  key={name}
                  className={`rounded-lg border ${
                    status === "completed"
                      ? "bg-green-50 border-green-200"
                      : status === "running"
                      ? "bg-blue-50 border-blue-200"
                      : status === "failed"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="flex justify-between items-center px-4 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-6">{idx + 1}</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent?.model_used && (
                        <span className="text-xs text-gray-500">{agent.model_used}</span>
                      )}
                      {agent?.duration_ms && (
                        <span className="text-xs text-gray-500">
                          {(agent.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          status === "completed"
                            ? "bg-green-200 text-green-800"
                            : status === "running"
                            ? "bg-blue-200 text-blue-800"
                            : status === "failed"
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <Agent11Card
                      agent={agent ?? { agent_name: name, status: "pending" }}
                    />
                  </div>
                </div>
              );
            }

            if (name === "agent_12_backend_gate") {
              return (
                <div
                  key={name}
                  className={`rounded-lg border ${
                    status === "completed"
                      ? "bg-green-50 border-green-200"
                      : status === "running"
                      ? "bg-blue-50 border-blue-200"
                      : status === "failed"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="flex justify-between items-center px-4 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-6">{idx + 1}</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent?.model_used && (
                        <span className="text-xs text-gray-500">{agent.model_used}</span>
                      )}
                      {agent?.duration_ms && (
                        <span className="text-xs text-gray-500">
                          {(agent.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          status === "completed"
                            ? "bg-green-200 text-green-800"
                            : status === "running"
                            ? "bg-blue-200 text-blue-800"
                            : status === "failed"
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <Agent12Card
                      agent={agent ?? { agent_name: name, status: "pending" }}
                    />
                  </div>
                </div>
              );
            }

            if (name === "agent_13_integration") {
              return (
                <div
                  key={name}
                  className={`rounded-lg border ${
                    status === "completed"
                      ? "bg-green-50 border-green-200"
                      : status === "running"
                      ? "bg-blue-50 border-blue-200"
                      : status === "failed"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="flex justify-between items-center px-4 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-6">{idx + 1}</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent?.model_used && (
                        <span className="text-xs text-gray-500">{agent.model_used}</span>
                      )}
                      {agent?.duration_ms && (
                        <span className="text-xs text-gray-500">
                          {(agent.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          status === "completed"
                            ? "bg-green-200 text-green-800"
                            : status === "running"
                            ? "bg-blue-200 text-blue-800"
                            : status === "failed"
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <Agent13Card
                      agent={agent ?? { agent_name: name, status: "pending" }}
                    />
                  </div>
                </div>
              );
            }

            if (name === "agent_14_qa") {
              return (
                <div
                  key={name}
                  className={`rounded-lg border ${
                    status === "completed"
                      ? "bg-green-50 border-green-200"
                      : status === "running"
                      ? "bg-blue-50 border-blue-200"
                      : status === "failed"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="flex justify-between items-center px-4 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-6">{idx + 1}</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent?.model_used && (
                        <span className="text-xs text-gray-500">{agent.model_used}</span>
                      )}
                      {agent?.duration_ms && (
                        <span className="text-xs text-gray-500">
                          {(agent.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          status === "completed"
                            ? "bg-green-200 text-green-800"
                            : status === "running"
                            ? "bg-blue-200 text-blue-800"
                            : status === "failed"
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <Agent14Card
                      agent={agent ?? { agent_name: name, status: "pending" }}
                    />
                  </div>
                </div>
              );
            }

            if (name === "agent_20_test_executor") {
              return (
                <div
                  key={name}
                  className={`rounded-lg border ${
                    status === "completed"
                      ? "bg-green-50 border-green-200"
                      : status === "running"
                      ? "bg-blue-50 border-blue-200"
                      : status === "failed"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="flex justify-between items-center px-4 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-6">{idx + 1}</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent?.duration_ms && (
                        <span className="text-xs text-gray-500">
                          {(agent.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          status === "completed"
                            ? "bg-green-200 text-green-800"
                            : status === "running"
                            ? "bg-blue-200 text-blue-800"
                            : status === "failed"
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <Agent20Card
                      agent={agent ?? { agent_name: name, status: "pending" }}
                    />
                  </div>
                </div>
              );
            }

            if (name === "agent_15_fixloop") {
              return (
                <div
                  key={name}
                  className={`rounded-lg border ${
                    status === "completed"
                      ? "bg-green-50 border-green-200"
                      : status === "running"
                      ? "bg-blue-50 border-blue-200"
                      : status === "failed"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="flex justify-between items-center px-4 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-6">{idx + 1}</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent?.model_used && (
                        <span className="text-xs text-gray-500">{agent.model_used}</span>
                      )}
                      {agent?.duration_ms && (
                        <span className="text-xs text-gray-500">
                          {(agent.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          status === "completed"
                            ? "bg-green-200 text-green-800"
                            : status === "running"
                            ? "bg-blue-200 text-blue-800"
                            : status === "failed"
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <Agent15Card
                      agent={agent ?? { agent_name: name, status: "pending" }}
                    />
                  </div>
                </div>
              );
            }

            if (name === "agent_16_devops") {
              return (
                <div
                  key={name}
                  className={`rounded-lg border ${
                    status === "completed"
                      ? "bg-green-50 border-green-200"
                      : status === "running"
                      ? "bg-blue-50 border-blue-200"
                      : status === "failed"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="flex justify-between items-center px-4 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-6">{idx + 1}</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent?.model_used && (
                        <span className="text-xs text-gray-500">{agent.model_used}</span>
                      )}
                      {agent?.duration_ms && (
                        <span className="text-xs text-gray-500">
                          {(agent.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          status === "completed"
                            ? "bg-green-200 text-green-800"
                            : status === "running"
                            ? "bg-blue-200 text-blue-800"
                            : status === "failed"
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <Agent16Card
                      agent={agent ?? { agent_name: name, status: "pending" }}
                    />
                  </div>
                </div>
              );
            }

            if (name === "agent_17_documentation") {
              return (
                <div
                  key={name}
                  className={`rounded-lg border ${
                    status === "completed"
                      ? "bg-green-50 border-green-200"
                      : status === "running"
                      ? "bg-blue-50 border-blue-200"
                      : status === "failed"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="flex justify-between items-center px-4 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-6">{idx + 1}</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent?.model_used && (
                        <span className="text-xs text-gray-500">{agent.model_used}</span>
                      )}
                      {agent?.duration_ms && (
                        <span className="text-xs text-gray-500">
                          {(agent.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          status === "completed"
                            ? "bg-green-200 text-green-800"
                            : status === "running"
                            ? "bg-blue-200 text-blue-800"
                            : status === "failed"
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <Agent17Card
                      agent={agent ?? { agent_name: name, status: "pending" }}
                    />
                  </div>
                </div>
              );
            }

            if (name === "agent_18_final_product") {
              return (
                <div
                  key={name}
                  className={`rounded-lg border ${
                    status === "completed"
                      ? "bg-green-50 border-green-200"
                      : status === "running"
                      ? "bg-blue-50 border-blue-200"
                      : status === "failed"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="flex justify-between items-center px-4 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-6">{idx + 1}</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent?.model_used && (
                        <span className="text-xs text-gray-500">{agent.model_used}</span>
                      )}
                      {agent?.duration_ms && (
                        <span className="text-xs text-gray-500">
                          {(agent.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          status === "completed"
                            ? "bg-green-200 text-green-800"
                            : status === "running"
                            ? "bg-blue-200 text-blue-800"
                            : status === "failed"
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <Agent18Card
                      agent={agent ?? { agent_name: name, status: "pending" }}
                    />
                  </div>
                </div>
              );
            }

            return (
              <div
                key={name}
                className={`p-4 rounded-lg border ${
                  status === "completed"
                    ? "bg-green-50 border-green-200"
                    : status === "running"
                    ? "bg-blue-50 border-blue-200"
                    : status === "failed"
                    ? "bg-red-50 border-red-200"
                    : "bg-gray-50 border-gray-200 opacity-50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-6">{idx + 1}</span>
                    <span className="font-medium">{name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {agent?.model_used && (
                      <span className="text-xs text-gray-500">{agent.model_used}</span>
                    )}
                    {agent?.duration_ms && (
                      <span className="text-xs text-gray-500">
                        {(agent.duration_ms / 1000).toFixed(1)}s
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        status === "completed"
                          ? "bg-green-200 text-green-800"
                          : status === "running"
                          ? "bg-blue-200 text-blue-800"
                          : status === "failed"
                          ? "bg-red-200 text-red-800"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
