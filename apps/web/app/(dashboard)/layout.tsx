"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [orgName, setOrgName] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const storedOrgId = localStorage.getItem("selectedOrgId");
      if (storedOrgId) {
        const { data } = await supabase.from("organizations").select("name").eq("id", storedOrgId).single();
        if (data) setOrgName(data.name);
      }
    }
    init();
  }, [router]);

  const links = [
    { href: "/dashboard", label: "Runs", icon: "M" },
    { href: "/dashboard/billing", label: "Billing", icon: "$" },
    { href: "/dashboard/team", label: "Team", icon: "U" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-sm font-bold text-gray-900">APF</h1>
          {orgName && <p className="text-xs text-gray-500 mt-0.5 truncate">{orgName}</p>}
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {links.map((link) => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href))
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={() => { supabase.auth.signOut(); router.push("/login"); }}
            className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-md"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
