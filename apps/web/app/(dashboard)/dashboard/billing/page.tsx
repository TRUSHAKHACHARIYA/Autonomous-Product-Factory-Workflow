"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { getUsage, createCheckout, createPortal, listOrgs } from "@/lib/api";

interface Usage {
  plan: string;
  runs_used: number;
  runs_limit: number | null;
  period_start: string;
}

interface Org {
  id: string;
  name: string;
  plan: string;
  billing_status?: string;
}

const PLANS = [
  { key: "free", name: "Free", price: "$0/mo", runs: "3 runs/mo", seats: "1 seat" },
  { key: "pro", name: "Pro", price: "$49/mo", runs: "50 runs/mo", seats: "10 seats" },
  { key: "enterprise", name: "Enterprise", price: "Custom", runs: "Unlimited", seats: "Unlimited" },
];

export default function BillingPage() {
  const router = useRouter();
  const [org, setOrg] = useState<Org | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const storedOrgId = localStorage.getItem("selectedOrgId");
      const orgsData = await listOrgs(session.access_token);
      const currentOrg = orgsData.find((o: Org) => o.id === storedOrgId) || orgsData[0];
      if (currentOrg) {
        setOrg(currentOrg);
        const usageData = await getUsage(session.access_token, currentOrg.id);
        setUsage(usageData);
      }
      setLoading(false);
    }
    init();
  }, [router]);

  async function handleUpgrade(plan: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !org) return;
    const result = await createCheckout(session.access_token, org.id, plan);
    window.location.href = result.checkout_url;
  }

  async function handleManageBilling() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !org) return;
    const result = await createPortal(session.access_token, org.id);
    window.location.href = result.portal_url;
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading billing...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-blue-600 text-sm">&larr; Dashboard</button>
          <h1 className="text-xl font-bold">Billing</h1>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Past due banner */}
        {org?.billing_status === "past_due" && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex items-start gap-3">
            <span className="text-red-600 text-lg mt-0.5">!</span>
            <div>
              <p className="text-sm font-medium text-red-800">Payment failed</p>
              <p className="text-xs text-red-700 mt-1">
                Your latest payment could not be processed. Please update your payment method
                to avoid service interruption.
              </p>
              <button
                onClick={handleManageBilling}
                className="mt-2 text-xs font-medium text-red-800 underline hover:text-red-900"
              >
                Update payment method &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Current usage */}
        {usage && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Current Usage</h2>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <p className="text-2xl font-bold capitalize">{usage.plan}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Runs this period</p>
                <p className="text-2xl font-bold">
                  {usage.runs_used}
                  {usage.runs_limit ? ` / ${usage.runs_limit}` : " (unlimited)"}
                </p>
              </div>
              {usage.runs_limit && (
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${usage.runs_used / usage.runs_limit > 0.8 ? "bg-red-500" : "bg-blue-500"}`}
                      style={{ width: `${Math.min(100, (usage.runs_used / usage.runs_limit) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            {usage.plan !== "free" && (
              <button onClick={handleManageBilling} className="mt-4 text-sm text-blue-600 hover:text-blue-800">
                Manage billing &rarr;
              </button>
            )}
          </div>
        )}

        {/* Plan cards */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                className={`bg-white rounded-lg shadow-sm p-6 border-2 ${
                  usage?.plan === plan.key ? "border-blue-500" : "border-transparent"
                }`}
              >
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <p className="text-2xl font-bold mt-2">{plan.price}</p>
                <p className="text-sm text-gray-500 mt-1">{plan.runs}</p>
                <p className="text-sm text-gray-500">{plan.seats}</p>
                {usage?.plan === plan.key ? (
                  <p className="mt-4 text-sm text-blue-600 font-medium">Current plan</p>
                ) : plan.key === "free" ? (
                  <button disabled className="mt-4 px-4 py-2 border rounded text-sm text-gray-400 cursor-not-allowed">
                    Downgrade
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.key)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
