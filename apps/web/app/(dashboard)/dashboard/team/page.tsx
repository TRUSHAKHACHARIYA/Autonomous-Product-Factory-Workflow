"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { listMembers, listInvitations, inviteMember, listOrgs } from "@/lib/api";

interface Member {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface Org {
  id: string;
  name: string;
  plan: string;
}

export default function TeamPage() {
  const router = useRouter();
  const [org, setOrg] = useState<Org | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const storedOrgId = localStorage.getItem("selectedOrgId");
      const orgsData = await listOrgs(session.access_token);
      const currentOrg = orgsData.find((o: Org) => o.id === storedOrgId) || orgsData[0];
      if (currentOrg) {
        setOrg(currentOrg);
        const [membersData, invitesData] = await Promise.all([
          listMembers(session.access_token, currentOrg.id),
          listInvitations(session.access_token, currentOrg.id),
        ]);
        setMembers(membersData);
        setInvitations(invitesData);
      }
      setLoading(false);
    }
    init();
  }, [router]);

  async function handleInvite() {
    if (!org || !inviteEmail.trim()) return;
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await inviteMember(session.access_token, org.id, inviteEmail, inviteRole);
      setInviteEmail("");
      const updated = await listInvitations(session.access_token, org.id);
      setInvitations(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send invitation");
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading team...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-blue-600 text-sm">&larr; Dashboard</button>
          <h1 className="text-xl font-bold">Team</h1>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Invite form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Invite Member</h2>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <div className="flex gap-2">
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address"
              type="email"
              className="border rounded px-3 py-2 flex-1"
            />
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="border rounded px-3 py-2">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={handleInvite} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Invite
            </button>
          </div>
        </div>

        {/* Members */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Members ({members.length})</h2>
          <div className="divide-y">
            {members.map((m) => (
              <div key={m.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{m.user_id}</p>
                  <p className="text-xs text-gray-500">Joined {new Date(m.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                  m.role === "owner" ? "bg-purple-100 text-purple-700" :
                  m.role === "admin" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending invitations */}
        {invitations.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Pending Invitations</h2>
            <div className="divide-y">
              {invitations.map((inv) => (
                <div key={inv.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{inv.email}</p>
                    <p className="text-xs text-gray-500">Invited {new Date(inv.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{inv.role}</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 font-medium">
                      pending
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
