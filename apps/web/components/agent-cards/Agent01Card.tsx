"use client";

import { useState } from "react";

const MAX_ROUNDS = 3;

interface ClarificationFormProps {
  questions: string[];
  round: number;
  onSubmit: (answers: Record<string, string>) => void;
}

function ClarificationForm({ questions, round, onSubmit }: ClarificationFormProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(question: string, value: string) {
    setAnswers((prev) => ({ ...prev, [question]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(answers);
    } finally {
      setSubmitting(false);
    }
  }

  const allAnswered = questions.every((q) => answers[q]?.trim());

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-3">
      <div className="flex items-center gap-2 text-xs text-amber-600">
        <span className="font-medium">Round {round} of {MAX_ROUNDS} max</span>
      </div>
      {questions.map((q, i) => (
        <div key={i}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {q}
          </label>
          <textarea
            value={answers[q] || ""}
            onChange={(e) => handleChange(q, e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
            required
          />
        </div>
      ))}
      <button
        type="submit"
        disabled={submitting || !allAnswered}
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Answers"}
      </button>
    </form>
  );
}

interface Agent01Output {
  user_input?: {
    project_name?: string;
    description?: string;
    platform?: string;
    tech_preferences?: string[];
    constraints?: string[];
    budget?: string | null;
    timeline?: string | null;
    missing_info?: string[];
    clarifying_questions?: string[];
  };
  validation_report?: {
    project_name_present?: boolean;
    description_present?: boolean;
    platform_identified?: boolean;
    overall_readiness?: string;
    readiness_reason?: string;
  };
  clarification_round?: number;
  clarification_history?: Array<{
    round: number;
    questions: string[];
    answers: Record<string, string>;
  }>;
  pending_questions?: string[];
  pending_readiness_reason?: string;
}

interface AgentOutput {
  agent_name: string;
  status: string;
  structured_output?: Agent01Output;
  model_used?: string;
  duration_ms?: number;
}

interface Agent01CardProps {
  agent: AgentOutput;
  runId: string;
  onClarify?: (answers: Record<string, string>) => void;
}

export function Agent01Card({ agent, runId, onClarify }: Agent01CardProps) {
  const output = agent.structured_output;
  const userInput = output?.user_input;
  const validation = output?.validation_report;
  const isAwaiting = agent.status === "awaiting_clarification";
  const isCompleted = agent.status === "completed";
  const history = output?.clarification_history ?? [];
  const currentRound = output?.clarification_round ?? 0;
  const pendingQuestions = output?.pending_questions ?? [];
  const pendingReason = output?.pending_readiness_reason ?? "";

  if (!isAwaiting && !isCompleted && !userInput) {
    return null;
  }

  return (
    <div className="space-y-3">
      {(isAwaiting || history.length > 0) && (
        <div className="space-y-2">
          {history.map((round) => (
            <div key={round.round} className="border rounded-md p-3 bg-gray-50">
              <div className="text-xs font-medium text-gray-500 mb-2">
                Round {round.round}
              </div>
              <div className="space-y-2">
                {round.questions.map((q, i) => (
                  <div key={i}>
                    <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-1">
                      {q}
                    </div>
                    <div className="text-sm text-gray-700 bg-white border border-gray-200 rounded px-2 py-1 ml-4">
                      {round.answers[q] || "(no answer)"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {isAwaiting && pendingQuestions.length > 0 && (
            <div className="border rounded-md p-3 bg-amber-50 border-amber-200">
              {pendingReason && (
                <p className="text-sm text-amber-700 mb-2">{pendingReason}</p>
              )}
              <ClarificationForm
                questions={pendingQuestions}
                round={currentRound + 1}
                onSubmit={(a) => onClarify?.(a)}
              />
            </div>
          )}
        </div>
      )}

      {isCompleted && userInput && (
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Project:</span> {userInput.project_name}
          </div>
          <div>
            <span className="font-medium">Platform:</span>{" "}
            <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
              {userInput.platform}
            </span>
          </div>
          {userInput.tech_preferences && userInput.tech_preferences.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="font-medium">Tech:</span>
              {userInput.tech_preferences.map((t, i) => (
                <span
                  key={i}
                  className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          {userInput.constraints && userInput.constraints.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="font-medium">Constraints:</span>
              {userInput.constraints.map((c, i) => (
                <span
                  key={i}
                  className="inline-block px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
          {userInput.budget && (
            <div>
              <span className="font-medium">Budget:</span> {userInput.budget}
            </div>
          )}
          {userInput.timeline && (
            <div>
              <span className="font-medium">Timeline:</span> {userInput.timeline}
            </div>
          )}
          {validation && (
            <div className="mt-2 text-xs text-gray-500">
              Readiness:{" "}
              <span
                className={
                  validation.overall_readiness === "READY"
                    ? "text-green-600"
                    : "text-amber-600"
                }
              >
                {validation.overall_readiness}
              </span>
              {validation.readiness_reason && (
                <span className="ml-1 text-gray-400">
                  — {validation.readiness_reason}
                </span>
              )}
            </div>
          )}
          {userInput.missing_info && userInput.missing_info.length > 0 && (
            <div className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
              Proceeding with documented gaps: {userInput.missing_info.join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
