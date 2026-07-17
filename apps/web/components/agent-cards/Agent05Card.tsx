"use client";

import { useState } from "react";

interface OwaspReviewEntry {
  risk_id: string;
  risk_name: string;
  status: "Covered" | "Risk" | "Not Applicable";
  mitigation: string;
}

interface ComplianceRequirements {
  gdpr_applicable: boolean;
  gdpr_requirements: string[];
  data_retention_days: number;
  pii_fields: string[];
  pii_encryption_notes: string;
}

interface SecretsManagement {
  tool: string;
  rotation_policy: string;
  notes: string;
}

interface Agent05Output {
  owasp_review?: OwaspReviewEntry[];
  auth_audit_notes?: string;
  encryption_requirements?: string;
  input_validation_rules?: string[];
  security_checklist?: string[];
  compliance_requirements?: ComplianceRequirements;
  secrets_management?: SecretsManagement;
}

interface AgentOutput {
  agent_name: string;
  status: string;
  structured_output?: Agent05Output;
  model_used?: string;
  duration_ms?: number;
}

interface Agent05CardProps {
  agent: AgentOutput;
}

type SortMode = "risk_first" | "id";

const STATUS_ICON: Record<string, string> = {
  Covered: "✅",
  Risk: "⚠️",
  "Not Applicable": "➖",
};

const STATUS_ROW: Record<string, string> = {
  Risk: "bg-red-50",
  Covered: "",
  "Not Applicable": "bg-gray-50",
};

function OwaspTable({ entries }: { entries: OwaspReviewEntry[] }) {
  const [sort, setSort] = useState<SortMode>("risk_first");

  const sorted = [...entries].sort((a, b) => {
    if (sort === "risk_first") {
      const order = { Risk: 0, Covered: 1, "Not Applicable": 2 };
      return order[a.status] - order[b.status];
    }
    return a.risk_id.localeCompare(b.risk_id);
  });

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h5 className="text-sm font-semibold text-gray-700">OWASP Top 10 Review</h5>
        <button
          onClick={() => setSort(sort === "risk_first" ? "id" : "risk_first")}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          {sort === "risk_first" ? "Sort by ID" : "Sort: Risks first"}
        </button>
      </div>
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium text-gray-600 w-20">ID</th>
              <th className="px-3 py-2 font-medium text-gray-600">Risk</th>
              <th className="px-3 py-2 font-medium text-gray-600 w-32">Status</th>
              <th className="px-3 py-2 font-medium text-gray-600">Mitigation</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sorted.map((entry) => (
              <tr key={entry.risk_id} className={`${STATUS_ROW[entry.status]} hover:bg-opacity-80`}>
                <td className="px-3 py-2 font-mono text-xs font-medium">{entry.risk_id}</td>
                <td className="px-3 py-2 font-medium">{entry.risk_name}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1 text-xs font-medium">
                    {STATUS_ICON[entry.status]} {entry.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-600 text-xs">{entry.mitigation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuthAudit({ notes }: { notes: string }) {
  return (
    <div className="mb-6">
      <h5 className="text-sm font-semibold text-gray-700 mb-2">Auth Audit</h5>
      <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white border rounded-lg p-4">
        {notes}
      </p>
    </div>
  );
}

function EncryptionSection({ requirements }: { requirements: string }) {
  return (
    <div className="mb-6">
      <h5 className="text-sm font-semibold text-gray-700 mb-2">Encryption Requirements</h5>
      <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white border rounded-lg p-4">
        {requirements}
      </p>
    </div>
  );
}

function SecurityChecklist({ items }: { items: string[] }) {
  return (
    <div className="mb-6">
      <h5 className="text-sm font-semibold text-gray-700 mb-3">Security Checklist</h5>
      <div className="bg-white border rounded-lg p-4 space-y-2">
        {items.map((item, i) => (
          <label key={i} className="flex items-start gap-3 text-sm cursor-default">
            <span className="mt-0.5 flex-shrink-0 w-4 h-4 border-2 border-gray-300 rounded" />
            <span className="text-gray-700">{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function InputValidationRules({ rules }: { rules: string[] }) {
  return (
    <div className="mb-6">
      <h5 className="text-sm font-semibold text-gray-700 mb-3">Input Validation Rules</h5>
      <div className="bg-white border rounded-lg p-4">
        <ul className="space-y-1">
          {rules.map((rule, i) => (
            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">-</span>
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ComplianceSection({ compliance }: { compliance: ComplianceRequirements }) {
  return (
    <div className="mb-6">
      <h5 className="text-sm font-semibold text-gray-700 mb-3">Compliance</h5>
      <div className="bg-white border rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">GDPR:</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              compliance.gdpr_applicable
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {compliance.gdpr_applicable ? "Applicable" : "Not Applicable"}
          </span>
        </div>
        {compliance.gdpr_requirements.length > 0 && (
          <div>
            <span className="text-xs text-gray-500 block mb-1">Requirements:</span>
            <ul className="space-y-1">
              {compliance.gdpr_requirements.map((r, i) => (
                <li key={i} className="text-sm text-gray-700">- {r}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Data retention:</span>{" "}
            {compliance.data_retention_days} days
          </div>
          <div>
            <span className="text-gray-500">PII fields:</span>{" "}
            {compliance.pii_fields.length > 0
              ? compliance.pii_fields.join(", ")
              : "None identified"}
          </div>
        </div>
        <div className="text-sm">
          <span className="text-gray-500">PII encryption:</span>{" "}
          {compliance.pii_encryption_notes}
        </div>
      </div>
    </div>
  );
}

function SecretsSection({ secrets }: { secrets: SecretsManagement }) {
  return (
    <div className="mb-6">
      <h5 className="text-sm font-semibold text-gray-700 mb-3">Secrets Management</h5>
      <div className="bg-white border rounded-lg p-4 space-y-2 text-sm">
        <div>
          <span className="text-gray-500">Tool:</span>{" "}
          <span className="font-medium">{secrets.tool}</span>
        </div>
        <div>
          <span className="text-gray-500">Rotation:</span> {secrets.rotation_policy}
        </div>
        <div>
          <span className="text-gray-500">Notes:</span> {secrets.notes}
        </div>
      </div>
    </div>
  );
}

export function Agent05Card({ agent }: Agent05CardProps) {
  const out = agent.structured_output;
  if (!out) return null;

  return (
    <div className="p-4 space-y-2 text-sm">
      {out.owasp_review && out.owasp_review.length > 0 && (
        <OwaspTable entries={out.owasp_review} />
      )}
      {out.auth_audit_notes && <AuthAudit notes={out.auth_audit_notes} />}
      {out.encryption_requirements && (
        <EncryptionSection requirements={out.encryption_requirements} />
      )}
      {out.security_checklist && out.security_checklist.length > 0 && (
        <SecurityChecklist items={out.security_checklist} />
      )}
      {out.input_validation_rules && out.input_validation_rules.length > 0 && (
        <InputValidationRules rules={out.input_validation_rules} />
      )}
      {out.compliance_requirements && (
        <ComplianceSection compliance={out.compliance_requirements} />
      )}
      {out.secrets_management && <SecretsSection secrets={out.secrets_management} />}
    </div>
  );
}
