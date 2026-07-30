"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { createRun, listOrgs, createOrg } from "@/lib/api";

interface Org {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

interface Run {
  id: string;
  product_idea: string;
  status: string;
  created_at: string;
}

interface OnboardingForm {
  project_name: string;
  one_liner: string;
  platform: "Web" | "Mobile" | "API" | "All" | "";
  target_audience: string;
  problem_statement: string;
  must_have_features: string[];
  nice_to_have_features: string[];
  tech_preferences: string[];
  integration_requirements: string[];
  compliance_requirements: string[];
  budget_range: string;
  timeline: string;
  team_context: string;
}

const EMPTY_FORM: OnboardingForm = {
  project_name: "",
  one_liner: "",
  platform: "",
  target_audience: "",
  problem_statement: "",
  must_have_features: [""],
  nice_to_have_features: [],
  tech_preferences: [],
  integration_requirements: [],
  compliance_requirements: [],
  budget_range: "",
  timeline: "",
  team_context: "",
};

const STEPS = [
  { id: "basics", title: "Project Basics" },
  { id: "audience", title: "Audience & Problem" },
  { id: "features", title: "Features" },
  { id: "tech", title: "Tech & Integrations" },
  { id: "constraints", title: "Constraints" },
  { id: "business", title: "Business Context" },
  { id: "review", title: "Review & Submit" },
] as const;

const TECH_OPTIONS = [
  "React", "Next.js", "Vue", "Angular", "Svelte",
  "Node.js", "Python", "Go", "Rust", "Java", "C#/.NET",
  "PostgreSQL", "MySQL", "MongoDB", "Redis",
  "AWS", "GCP", "Azure", "Vercel", "Supabase",
  "No preference",
];

const INTEGRATION_OPTIONS = [
  "Stripe", "Gmail", "Slack", "Twilio", "SendGrid",
  "Auth0", "Firebase", "AWS S3", "Cloudinary",
  "Google Maps", "OpenAI", "Salesforce",
];

const COMPLIANCE_OPTIONS = ["GDPR", "HIPAA", "SOC 2", "None"];

const BUDGET_OPTIONS = ["<$5k", "$5k-$20k", "$20k-$100k", ">$100k", "Not sure"];
const TIMELINE_OPTIONS = ["ASAP (<1 month)", "1-3 months", "3-6 months", "6+ months", "Not sure"];

export default function DashboardPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Org | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [form, setForm] = useState<OnboardingForm>(EMPTY_FORM);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [showNewOrg, setShowNewOrg] = useState(false);
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [otherIntegration, setOtherIntegration] = useState("");
  const [customTech, setCustomTech] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      const orgsData = await listOrgs(session.access_token);
      setOrgs(orgsData);
      if (orgsData.length > 0) {
        setSelectedOrg(orgsData[0]);
      }
    }
    init();
  }, [router]);

  async function handleCreateOrg() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const slug = newOrgName.toLowerCase().replace(/\s+/g, "-");
    const org = await createOrg(session.access_token, newOrgName, slug);
    setOrgs([...orgs, { id: org.org_id, name: newOrgName, slug, plan: "free" }]);
    setNewOrgName("");
    setShowNewOrg(false);
  }

  function updateForm<K extends keyof OnboardingForm>(key: K, value: OnboardingForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleListItem(key: "tech_preferences" | "integration_requirements" | "compliance_requirements", value: string) {
    setForm((prev) => {
      const list = prev[key];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...prev, [key]: next };
    });
  }

  function addFeature(listKey: "must_have_features" | "nice_to_have_features") {
    setForm((prev) => ({ ...prev, [listKey]: [...prev[listKey], ""] }));
  }

  function updateFeature(listKey: "must_have_features" | "nice_to_have_features", index: number, value: string) {
    setForm((prev) => {
      const list = [...prev[listKey]];
      list[index] = value;
      return { ...prev, [listKey]: list };
    });
  }

  function removeFeature(listKey: "must_have_features" | "nice_to_have_features", index: number) {
    setForm((prev) => ({
      ...prev,
      [listKey]: prev[listKey].filter((_, i) => i !== index),
    }));
  }

  function addOtherIntegration() {
    if (otherIntegration.trim()) {
      updateForm("integration_requirements", [...form.integration_requirements, `Other: ${otherIntegration.trim()}`]);
      setOtherIntegration("");
    }
  }

  function addCustomTech() {
    if (customTech.trim()) {
      updateForm("tech_preferences", [...form.tech_preferences, customTech.trim()]);
      setCustomTech("");
    }
  }

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return form.project_name.trim() !== "" && form.one_liner.trim() !== "" && form.platform !== "";
      case 1:
        return form.target_audience.trim() !== "" && form.problem_statement.trim() !== "";
      case 2:
        return form.must_have_features.some((f) => f.trim() !== "");
      default:
        return true;
    }
  };

  const isLastStep = step === STEPS.length - 1;

  async function handleSubmit() {
    if (!selectedOrg) return;
    setLoading(true);
    setQuotaError(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    try {
      const payload = {
        ...form,
        platform: form.platform as "Web" | "Mobile" | "API" | "All",
        must_have_features: form.must_have_features.filter((f) => f.trim() !== ""),
        nice_to_have_features: form.nice_to_have_features.filter((f) => f.trim() !== ""),
        budget_range: form.budget_range || null,
        timeline: form.timeline || null,
        team_context: form.team_context || null,
      };
      const result = await createRun(session.access_token, selectedOrg.id, payload);
      router.push(`/runs/${result.run_id}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.startsWith("API error 402")) {
        const detail = msg.replace(/^API error 402:\s*/, "");
        setQuotaError(detail || "Monthly run limit reached. Upgrade your plan to continue.");
      } else {
        setQuotaError("Failed to create run. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">APF Dashboard</h1>
          <div className="flex items-center gap-4">
            {selectedOrg && (
              <select
                value={selectedOrg.id}
                onChange={(e) => {
                  const org = orgs.find((o) => o.id === e.target.value);
                  if (org) setSelectedOrg(org);
                }}
                className="border rounded px-3 py-1"
              >
                {orgs.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            )}
            <button onClick={() => setShowNewOrg(true)} className="text-sm text-blue-600">
              + New Org
            </button>
            <button onClick={handleLogout} className="text-sm text-gray-500">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {showNewOrg && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm flex gap-2">
            <input
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="Organization name"
              className="border rounded px-3 py-2 flex-1"
            />
            <button onClick={handleCreateOrg} className="px-4 py-2 bg-blue-600 text-white rounded">
              Create
            </button>
            <button onClick={() => setShowNewOrg(false)} className="px-4 py-2 border rounded">
              Cancel
            </button>
          </div>
        )}

        {selectedOrg && (
          <div className="mb-8 bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">New Run</h2>
            </div>

            {quotaError && (
              <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-center justify-between">
                <p className="text-sm text-amber-800">{quotaError}</p>
                <button
                  onClick={() => router.push("/dashboard/billing")}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Upgrade Plan
                </button>
              </div>
            )}

            <div className="px-6 py-4">
              {/* Step indicators */}
              <div className="flex items-center gap-1 mb-6 overflow-x-auto">
                {STEPS.map((s, i) => (
                  <div key={s.id} className="flex items-center">
                    <button
                      onClick={() => setStep(i)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                        i === step
                          ? "bg-blue-600 text-white"
                          : i < step
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-white/20">
                        {i < step ? "\u2713" : i + 1}
                      </span>
                      {s.title}
                    </button>
                    {i < STEPS.length - 1 && <div className="w-4 h-px bg-gray-300 mx-0.5" />}
                  </div>
                ))}
              </div>

              {/* Step content */}
              <div className="min-h-[320px]">
                {step === 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Project Basics</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                      <input
                        value={form.project_name}
                        onChange={(e) => updateForm("project_name", e.target.value)}
                        placeholder="e.g. TaskFlow"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">One-liner *</label>
                      <input
                        value={form.one_liner}
                        onChange={(e) => updateForm("one_liner", e.target.value)}
                        placeholder="e.g. A project management tool for small teams"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Platform *</label>
                      <div className="flex gap-2">
                        {(["Web", "Mobile", "API", "All"] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => updateForm("platform", p)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                              form.platform === p
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Audience & Problem</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience *</label>
                      <input
                        value={form.target_audience}
                        onChange={(e) => updateForm("target_audience", e.target.value)}
                        placeholder="e.g. Freelance designers and small creative agencies"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Problem Statement *</label>
                      <textarea
                        value={form.problem_statement}
                        onChange={(e) => updateForm("problem_statement", e.target.value)}
                        placeholder="e.g. Freelancers struggle to track project hours and send invoices on time, leading to delayed payments and lost revenue."
                        rows={4}
                        className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Features</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Must-Have Features * <span className="text-gray-400 font-normal">(at least 1)</span></label>
                      <div className="space-y-2">
                        {form.must_have_features.map((f, i) => (
                          <div key={i} className="flex gap-2">
                            <input
                              value={f}
                              onChange={(e) => updateFeature("must_have_features", i, e.target.value)}
                              placeholder={`Feature ${i + 1}`}
                              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {form.must_have_features.length > 1 && (
                              <button
                                onClick={() => removeFeature("must_have_features", i)}
                                className="px-2 py-2 text-gray-400 hover:text-red-500"
                              >
                                \u2715
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => addFeature("must_have_features")}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        + Add feature
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nice-to-Have Features <span className="text-gray-400 font-normal">(optional)</span></label>
                      <div className="space-y-2">
                        {form.nice_to_have_features.map((f, i) => (
                          <div key={i} className="flex gap-2">
                            <input
                              value={f}
                              onChange={(e) => updateFeature("nice_to_have_features", i, e.target.value)}
                              placeholder={`Feature ${i + 1}`}
                              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                              onClick={() => removeFeature("nice_to_have_features", i)}
                              className="px-2 py-2 text-gray-400 hover:text-red-500"
                            >
                              \u2715
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => addFeature("nice_to_have_features")}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        + Add feature
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Tech & Integrations</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tech Preferences <span className="text-gray-400 font-normal">(multi-select)</span></label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {TECH_OPTIONS.map((t) => (
                          <button
                            key={t}
                            onClick={() => toggleListItem("tech_preferences", t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                              form.tech_preferences.includes(t)
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={customTech}
                          onChange={(e) => setCustomTech(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTech(); } }}
                          placeholder="Add custom tech..."
                          className="flex-1 border rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button onClick={addCustomTech} className="px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200">
                          Add
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Integration Requirements <span className="text-gray-400 font-normal">(multi-select)</span></label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {INTEGRATION_OPTIONS.map((s) => (
                          <button
                            key={s}
                            onClick={() => toggleListItem("integration_requirements", s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                              form.integration_requirements.includes(s)
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={otherIntegration}
                          onChange={(e) => setOtherIntegration(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOtherIntegration(); } }}
                          placeholder="Other integration..."
                          className="flex-1 border rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button onClick={addOtherIntegration} className="px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200">
                          Add
                        </button>
                      </div>
                      {form.integration_requirements.some((r) => r.startsWith("Other:")) && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {form.integration_requirements.filter((r) => r.startsWith("Other:")).map((r, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {r}
                              <button
                                onClick={() => updateForm("integration_requirements", form.integration_requirements.filter((v) => v !== r))}
                                className="text-gray-400 hover:text-red-500"
                              >
                                \u2715
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Constraints</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Compliance Requirements</label>
                      <div className="flex flex-wrap gap-2">
                        {COMPLIANCE_OPTIONS.map((c) => (
                          <button
                            key={c}
                            onClick={() => {
                              if (c === "None") {
                                updateForm("compliance_requirements", ["None"]);
                              } else {
                                const filtered = form.compliance_requirements.filter((v) => v !== "None");
                                toggleListItem("compliance_requirements", c);
                                if (!form.compliance_requirements.includes(c)) {
                                  updateForm("compliance_requirements", [...filtered, c]);
                                } else {
                                  updateForm("compliance_requirements", filtered);
                                }
                              }
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                              form.compliance_requirements.includes(c)
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Business Context</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                      <div className="flex flex-wrap gap-2">
                        {BUDGET_OPTIONS.map((b) => (
                          <button
                            key={b}
                            onClick={() => updateForm("budget_range", form.budget_range === b ? "" : b)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                              form.budget_range === b
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                      <div className="flex flex-wrap gap-2">
                        {TIMELINE_OPTIONS.map((t) => (
                          <button
                            key={t}
                            onClick={() => updateForm("timeline", form.timeline === t ? "" : t)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                              form.timeline === t
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Team Context <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input
                        value={form.team_context}
                        onChange={(e) => updateForm("team_context", e.target.value)}
                        placeholder="e.g. Solo founder, team of 5 engineers, etc."
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Review & Submit</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                      <ReviewRow label="Project Name" value={form.project_name} onEdit={() => setStep(0)} />
                      <ReviewRow label="One-liner" value={form.one_liner} onEdit={() => setStep(0)} />
                      <ReviewRow label="Platform" value={form.platform || "Not selected"} onEdit={() => setStep(0)} />
                      <ReviewRow label="Target Audience" value={form.target_audience} onEdit={() => setStep(1)} />
                      <ReviewRow label="Problem Statement" value={form.problem_statement} onEdit={() => setStep(1)} multiline />
                      <ReviewRow
                        label="Must-Have Features"
                        value={form.must_have_features.filter((f) => f.trim()).join(", ") || "None"}
                        onEdit={() => setStep(2)}
                      />
                      <ReviewRow
                        label="Nice-to-Have Features"
                        value={form.nice_to_have_features.filter((f) => f.trim()).join(", ") || "None"}
                        onEdit={() => setStep(2)}
                      />
                      <ReviewRow
                        label="Tech Preferences"
                        value={form.tech_preferences.join(", ") || "No preference"}
                        onEdit={() => setStep(3)}
                      />
                      <ReviewRow
                        label="Integrations"
                        value={form.integration_requirements.join(", ") || "None"}
                        onEdit={() => setStep(3)}
                      />
                      <ReviewRow
                        label="Compliance"
                        value={form.compliance_requirements.join(", ") || "None"}
                        onEdit={() => setStep(4)}
                      />
                      <ReviewRow label="Budget" value={form.budget_range || "Not specified"} onEdit={() => setStep(5)} />
                      <ReviewRow label="Timeline" value={form.timeline || "Not specified"} onEdit={() => setStep(5)} />
                      <ReviewRow label="Team Context" value={form.team_context || "Not specified"} onEdit={() => setStep(5)} />
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setStep((s) => s - 1)}
                  disabled={step === 0}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                {isLastStep ? (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? "Creating Run..." : "Start Run"}
                  </button>
                ) : (
                  <button
                    onClick={() => setStep((s) => s + 1)}
                    disabled={!canProceed()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Runs</h2>
          {runs.length === 0 ? (
            <p className="text-gray-500">No runs yet. Create one above!</p>
          ) : (
            <div className="space-y-2">
              {runs.map((run) => (
                <div
                  key={run.id}
                  className="p-4 bg-white rounded-lg shadow-sm flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/runs/${run.id}`)}
                >
                  <span className="truncate flex-1">{run.product_idea}</span>
                  <span
                    className={`ml-4 px-2 py-1 text-xs rounded-full ${
                      run.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : run.status === "running"
                        ? "bg-blue-100 text-blue-800"
                        : run.status === "failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {run.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  onEdit,
  multiline = false,
}: {
  label: string;
  value: string;
  onEdit: () => void;
  multiline?: boolean;
}) {
  return (
    <div className={`flex ${multiline ? "flex-col" : "items-start"} gap-2`}>
      <span className="font-medium text-gray-600 min-w-[140px] shrink-0">{label}</span>
      <span className={`text-gray-900 flex-1 ${multiline ? "whitespace-pre-wrap" : "truncate"}`}>{value}</span>
      <button onClick={onEdit} className="text-xs text-blue-600 hover:text-blue-800 shrink-0">
        Edit
      </button>
    </div>
  );
}
