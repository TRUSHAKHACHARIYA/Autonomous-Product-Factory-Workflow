"use client";

import { useState } from "react";

interface Epic {
  id: string;
  name: string;
  user_story: string;
  task_ids: string[];
  story_points: number;
  sprint: number;
}

interface Task {
  id: string;
  epic_id: string;
  title: string;
  points: number;
  sprint: number;
  depends_on: string[];
}

interface Milestone {
  milestone: string;
  sprint: number;
  deliverable: string;
}

interface RiskEntry {
  risk: string;
  probability: string;
  impact: string;
  mitigation: string;
}

interface SprintPlanEntry {
  sprint: number;
  task_ids: string[];
  total_points: number;
}

interface Agent03Output {
  epics?: Epic[];
  tasks?: Task[];
  mvp_scope?: { in_mvp: string[]; in_v2: string[] };
  timeline?: Milestone[];
  acceptance_criteria?: { epic_id: string; criteria: string[] }[];
  risk_register?: RiskEntry[];
  sprint_plan?: SprintPlanEntry[];
}

interface AgentOutput {
  agent_name: string;
  status: string;
  structured_output?: Agent03Output;
  model_used?: string;
  duration_ms?: number;
}

interface Agent03CardProps {
  agent: AgentOutput;
}

const TASKS_PER_PAGE = 8;

const BADGE_COLORS: Record<string, string> = {
  Low: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800",
};

function EpicKanban({ epics, tasks }: { epics: Epic[]; tasks: Task[] }) {
  const bySprint = new Map<number, Epic[]>();
  for (const e of epics) {
    const list = bySprint.get(e.sprint) || [];
    list.push(e);
    bySprint.set(e.sprint, list);
  }
  const sprints = [...bySprint.keys()].sort((a, b) => a - b);

  return (
    <div className="mb-6">
      <h5 className="text-sm font-semibold text-gray-700 mb-3">Epics by Sprint</h5>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {sprints.map((s) => (
          <div key={s} className="min-w-[220px] flex-shrink-0">
            <div className="text-xs font-bold text-gray-500 uppercase mb-2">
              Sprint {s}
            </div>
            <div className="space-y-2">
              {bySprint.get(s)!.map((e) => (
                <div
                  key={e.id}
                  className="border rounded-lg p-3 bg-white shadow-sm"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{e.name}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                      {e.story_points} pts
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {e.task_ids.length} tasks
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TasksTable({ tasks }: { tasks: Task[] }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(tasks.length / TASKS_PER_PAGE);
  const sliced = tasks.slice(page * TASKS_PER_PAGE, (page + 1) * TASKS_PER_PAGE);

  return (
    <div className="mb-6">
      <h5 className="text-sm font-semibold text-gray-700 mb-3">
        Tasks ({tasks.length})
      </h5>
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium text-gray-600">ID</th>
              <th className="px-3 py-2 font-medium text-gray-600">Title</th>
              <th className="px-3 py-2 font-medium text-gray-600">Points</th>
              <th className="px-3 py-2 font-medium text-gray-600">Sprint</th>
              <th className="px-3 py-2 font-medium text-gray-600">Depends On</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sliced.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-mono text-xs text-blue-600">
                  {t.id}
                </td>
                <td className="px-3 py-2">{t.title}</td>
                <td className="px-3 py-2">{t.points}</td>
                <td className="px-3 py-2">{t.sprint}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {t.depends_on.length === 0 ? (
                      <span className="text-gray-400 text-xs">None</span>
                    ) : (
                      t.depends_on.map((d) => (
                        <span
                          key={d}
                          className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {d}
                        </span>
                      ))
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2 py-1 border rounded disabled:opacity-40"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-2 py-1 border rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MvpScopeColumns({
  in_mvp,
  in_v2,
}: {
  in_mvp: string[];
  in_v2: string[];
}) {
  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <h5 className="text-sm font-semibold text-green-700 mb-2">
          In MVP
        </h5>
        <ul className="space-y-1">
          {in_mvp.map((f, i) => (
            <li key={i} className="text-sm pl-3 relative">
              <span className="absolute left-0 text-green-500">&#10003;</span>
              {f}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h5 className="text-sm font-semibold text-gray-500 mb-2">In V2</h5>
        <ul className="space-y-1">
          {in_v2.map((f, i) => (
            <li key={i} className="text-sm pl-3 text-gray-500 relative">
              <span className="absolute left-0">&#10005;</span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Timeline({ milestones }: { milestones: Milestone[] }) {
  const sorted = [...milestones].sort((a, b) => a.sprint - b.sprint);
  return (
    <div className="mb-6">
      <h5 className="text-sm font-semibold text-gray-700 mb-3">Timeline</h5>
      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        {sorted.map((m, i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center min-w-[120px]">
              <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow" />
              <div className="mt-2 text-center">
                <div className="text-xs font-bold text-blue-700">
                  Sprint {m.sprint}
                </div>
                <div className="text-xs font-medium text-gray-700">
                  {m.milestone}
                </div>
                <div className="text-xs text-gray-500">{m.deliverable}</div>
              </div>
            </div>
            {i < sorted.length - 1 && (
              <div className="h-0.5 w-8 bg-blue-300 flex-shrink-0 mt-[-20px]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskTable({ risks }: { risks: RiskEntry[] }) {
  return (
    <div className="mb-6">
      <h5 className="text-sm font-semibold text-gray-700 mb-3">Risk Register</h5>
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium text-gray-600">Risk</th>
              <th className="px-3 py-2 font-medium text-gray-600">Probability</th>
              <th className="px-3 py-2 font-medium text-gray-600">Impact</th>
              <th className="px-3 py-2 font-medium text-gray-600">Mitigation</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {risks.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-3 py-2">{r.risk}</td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-medium ${BADGE_COLORS[r.probability] || "bg-gray-100 text-gray-800"}`}
                  >
                    {r.probability}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-medium ${BADGE_COLORS[r.impact] || "bg-gray-100 text-gray-800"}`}
                  >
                    {r.impact}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-600">{r.mitigation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SprintSummary({
  sprint_plan,
  tasks,
}: {
  sprint_plan: SprintPlanEntry[];
  tasks: Task[];
}) {
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  return (
    <div className="mb-6">
      <h5 className="text-sm font-semibold text-gray-700 mb-3">Sprint Plan</h5>
      <div className="space-y-3">
        {sprint_plan
          .sort((a, b) => a.sprint - b.sprint)
          .map((s) => (
            <div
              key={s.sprint}
              className="border rounded-lg p-3 bg-gray-50"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">
                  Sprint {s.sprint}
                </span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  {s.total_points} pts
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {s.task_ids.map((tid) => (
                  <span
                    key={tid}
                    className="text-xs bg-white border rounded px-1.5 py-0.5"
                  >
                    {tid}
                    {taskMap.get(tid) && (
                      <span className="text-gray-400 ml-1">
                        {taskMap.get(tid)!.title}
                      </span>
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

function AcceptanceCriteria({
  criteria,
}: {
  criteria: { epic_id: string; criteria: string[] }[];
}) {
  return (
    <div className="mb-6">
      <h5 className="text-sm font-semibold text-gray-700 mb-3">
        Acceptance Criteria
      </h5>
      <div className="space-y-3">
        {criteria.map((ac) => (
          <div key={ac.epic_id} className="border rounded-lg p-3">
            <div className="font-medium text-sm mb-2">{ac.epic_id}</div>
            <ul className="space-y-1">
              {ac.criteria.map((c, i) => (
                <li key={i} className="text-xs text-gray-600">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Agent03Card({ agent }: Agent03CardProps) {
  const out = agent.structured_output;
  if (!out) return null;

  return (
    <div className="p-4 space-y-2 text-sm">
      {out.epics && out.epics.length > 0 && out.tasks && (
        <EpicKanban epics={out.epics} tasks={out.tasks} />
      )}
      {out.tasks && out.tasks.length > 0 && (
        <TasksTable tasks={out.tasks} />
      )}
      {out.mvp_scope && (
        <MvpScopeColumns
          in_mvp={out.mvp_scope.in_mvp}
          in_v2={out.mvp_scope.in_v2}
        />
      )}
      {out.timeline && out.timeline.length > 0 && (
        <Timeline milestones={out.timeline} />
      )}
      {out.risk_register && out.risk_register.length > 0 && (
        <RiskTable risks={out.risk_register} />
      )}
      {out.sprint_plan && out.sprint_plan.length > 0 && out.tasks && (
        <SprintSummary sprint_plan={out.sprint_plan} tasks={out.tasks} />
      )}
      {out.acceptance_criteria && out.acceptance_criteria.length > 0 && (
        <AcceptanceCriteria criteria={out.acceptance_criteria} />
      )}
    </div>
  );
}
