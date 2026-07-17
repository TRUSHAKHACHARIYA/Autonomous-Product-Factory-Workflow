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

export default function DashboardPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Org | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [productIdea, setProductIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [showNewOrg, setShowNewOrg] = useState(false);
  const [quotaError, setQuotaError] = useState<string | null>(null);
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

  async function handleNewRun() {
    if (!selectedOrg || !productIdea.trim()) return;
    setLoading(true);
    setQuotaError(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    try {
      const result = await createRun(session.access_token, selectedOrg.id, productIdea);
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
          <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">New Run</h2>
            {quotaError && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-center justify-between">
                <p className="text-sm text-amber-800">{quotaError}</p>
                <button
                  onClick={() => router.push("/dashboard/billing")}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Upgrade Plan
                </button>
              </div>
            )}
            <textarea
              value={productIdea}
              onChange={(e) => setProductIdea(e.target.value)}
              placeholder="Describe your product idea..."
              className="w-full border rounded px-4 py-3 mb-4 h-32 resize-none"
            />
            <button
              onClick={handleNewRun}
              disabled={loading || !productIdea.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Start Run"}
            </button>
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
