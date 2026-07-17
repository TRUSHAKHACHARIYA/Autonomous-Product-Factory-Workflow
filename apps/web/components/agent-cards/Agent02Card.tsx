"use client";

interface FRItem {
  id: string;
  description: string;
}

interface NFRItem {
  id: string;
  category: string;
  description: string;
}

interface PersonaItem {
  name: string;
  role: string;
  goal: string;
  pain_point: string;
  tech_comfort: string;
}

interface JourneyStep {
  name: string;
  steps: string[];
}

interface Complexity {
  score: string;
  reason: string;
}

interface Agent02Output {
  functional_requirements?: FRItem[];
  non_functional_requirements?: NFRItem[];
  personas?: PersonaItem[];
  user_journeys?: JourneyStep[];
  ambiguities?: { ambiguity: string; resolution: string }[];
  complexity_score?: Complexity;
}

interface AgentOutput {
  agent_name: string;
  status: string;
  structured_output?: Agent02Output;
  model_used?: string;
  duration_ms?: number;
}

interface Agent02CardProps {
  agent: AgentOutput;
}

function ComplexityBadge({ score, reason }: { score: string; reason: string }) {
  const colorMap: Record<string, string> = {
    S: "bg-green-100 text-green-800",
    M: "bg-blue-100 text-blue-800",
    L: "bg-amber-100 text-amber-800",
    XL: "bg-red-100 text-red-800",
  };
  return (
    <div className="flex items-center gap-2 mb-4">
      <span
        className={`px-3 py-1 text-sm font-bold rounded-full ${colorMap[score] || "bg-gray-100 text-gray-800"}`}
        title={reason}
      >
        Complexity: {score}
      </span>
      <span className="text-xs text-gray-500">{reason}</span>
    </div>
  );
}

function FRList({ items }: { items: FRItem[] }) {
  return (
    <div className="mb-4">
      <h5 className="text-sm font-semibold text-gray-700 mb-2">Functional Requirements</h5>
      <ul className="space-y-1">
        {items.map((fr) => (
          <li key={fr.id} className="text-sm flex gap-2">
            <span className="font-mono text-xs text-blue-600 shrink-0">{fr.id}</span>
            <span>{fr.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const NFR_CATEGORY_COLORS: Record<string, string> = {
  Performance: "bg-purple-100 text-purple-800",
  Security: "bg-red-100 text-red-800",
  Scalability: "bg-blue-100 text-blue-800",
  Reliability: "bg-green-100 text-green-800",
  Usability: "bg-yellow-100 text-yellow-800",
  Other: "bg-gray-100 text-gray-800",
};

function NFRList({ items }: { items: NFRItem[] }) {
  return (
    <div className="mb-4">
      <h5 className="text-sm font-semibold text-gray-700 mb-2">Non-Functional Requirements</h5>
      <ul className="space-y-1">
        {items.map((nfr) => (
          <li key={nfr.id} className="text-sm flex items-start gap-2">
            <span className="font-mono text-xs shrink-0">{nfr.id}</span>
            <span
              className={`px-1.5 py-0.5 text-xs rounded ${NFR_CATEGORY_COLORS[nfr.category] || NFR_CATEGORY_COLORS.Other}`}
            >
              {nfr.category}
            </span>
            <span>{nfr.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PersonaGrid({ personas }: { personas: PersonaItem[] }) {
  return (
    <div className="mb-4">
      <h5 className="text-sm font-semibold text-gray-700 mb-2">Personas</h5>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {personas.map((p) => (
          <div key={p.name} className="border rounded-lg p-3 text-sm">
            <div className="font-medium">{p.name}</div>
            <div className="text-gray-500 text-xs mb-2">{p.role}</div>
            <div>
              <span className="font-medium">Goal:</span> {p.goal}
            </div>
            <div>
              <span className="font-medium">Pain point:</span> {p.pain_point}
            </div>
            <div className="mt-1">
              <span
                className={`inline-block px-2 py-0.5 text-xs rounded ${
                  p.tech_comfort === "High"
                    ? "bg-green-100 text-green-800"
                    : p.tech_comfort === "Medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                Tech: {p.tech_comfort}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function JourneyTimeline({ journeys }: { journeys: JourneyStep[] }) {
  return (
    <div className="mb-4">
      <h5 className="text-sm font-semibold text-gray-700 mb-2">User Journeys</h5>
      <div className="space-y-3">
        {journeys.map((j) => (
          <div key={j.name}>
            <div className="text-sm font-medium mb-1">{j.name}</div>
            <div className="flex flex-wrap items-center gap-1 text-xs">
              {j.steps.map((step, si) => (
                <span key={si} className="flex items-center gap-1">
                  <span className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-blue-800">
                    {step}
                  </span>
                  {si < j.steps.length - 1 && (
                    <span className="text-gray-400">→</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Agent02Card({ agent }: Agent02CardProps) {
  const out = agent.structured_output;
  if (!out) return <PendingCard />;

  return (
    <div className="p-4 space-y-2 text-sm">
      {out.complexity_score && (
        <ComplexityBadge score={out.complexity_score.score} reason={out.complexity_score.reason} />
      )}
      {out.functional_requirements && out.functional_requirements.length > 0 && (
        <FRList items={out.functional_requirements} />
      )}
      {out.non_functional_requirements && out.non_functional_requirements.length > 0 && (
        <NFRList items={out.non_functional_requirements} />
      )}
      {out.personas && out.personas.length > 0 && <PersonaGrid personas={out.personas} />}
      {out.user_journeys && out.user_journeys.length > 0 && (
        <JourneyTimeline journeys={out.user_journeys} />
      )}
      {out.ambiguities && out.ambiguities.length > 0 && (
        <div>
          <h5 className="text-sm font-semibold text-gray-700 mb-2">Ambiguities Resolved</h5>
          <ul className="space-y-1">
            {out.ambiguities.map((a, i) => (
              <li key={i} className="text-xs text-gray-600">
                <span className="font-medium">{a.ambiguity}</span> → {a.resolution}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function PendingCard() {
  return null;
}
