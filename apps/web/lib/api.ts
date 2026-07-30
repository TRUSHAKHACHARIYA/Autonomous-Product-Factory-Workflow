const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json();
}

export async function createRun(
  token: string,
  orgId: string,
  formData: {
    project_name: string;
    one_liner: string;
    platform: "Web" | "Mobile" | "API" | "All";
    target_audience: string;
    problem_statement: string;
    must_have_features: string[];
    nice_to_have_features?: string[];
    tech_preferences?: string[];
    integration_requirements?: string[];
    compliance_requirements?: string[];
    budget_range?: string | null;
    timeline?: string | null;
    team_context?: string | null;
  },
) {
  return apiFetch("/runs", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Organization-Id": orgId,
    },
    body: JSON.stringify(formData),
  });
}

export async function getRun(token: string, orgId: string, runId: string) {
  return apiFetch(`/runs/${runId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Organization-Id": orgId,
    },
  });
}

export async function createOrg(token: string, name: string, slug: string) {
  return apiFetch("/orgs", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, slug }),
  });
}

export async function listOrgs(token: string) {
  return apiFetch("/orgs", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function submitClarification(
  token: string,
  orgId: string,
  runId: string,
  answers: Record<string, string>,
) {
  return apiFetch(`/runs/${runId}/clarify`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Organization-Id": orgId,
    },
    body: JSON.stringify(answers),
  });
}

export async function submitApproval(
  token: string,
  orgId: string,
  runId: string,
  decision: { action: "approve" | "edit" | "reject"; edited_output?: Record<string, unknown>; notes?: string },
) {
  return apiFetch(`/runs/${runId}/approve`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Organization-Id": orgId,
    },
    body: JSON.stringify(decision),
  });
}

export async function getUsage(token: string, orgId: string) {
  return apiFetch("/billing/usage", {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Organization-Id": orgId,
    },
  });
}

export async function createCheckout(token: string, orgId: string, plan: string) {
  return apiFetch(`/billing/checkout?plan=${plan}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Organization-Id": orgId,
    },
  });
}

export async function createPortal(token: string, orgId: string) {
  return apiFetch("/billing/portal", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Organization-Id": orgId,
    },
  });
}

export async function listMembers(token: string, orgId: string) {
  return apiFetch(`/orgs/${orgId}/members`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Organization-Id": orgId,
    },
  });
}

export async function listInvitations(token: string, orgId: string) {
  return apiFetch(`/orgs/${orgId}/invitations`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Organization-Id": orgId,
    },
  });
}

export async function inviteMember(token: string, orgId: string, email: string, role: string) {
  return apiFetch(`/orgs/${orgId}/invitations?email=${encodeURIComponent(email)}&role=${role}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Organization-Id": orgId,
    },
  });
}

export async function acceptInvitation(token: string, invitationToken: string) {
  return apiFetch(`/invitations/${invitationToken}/accept`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
