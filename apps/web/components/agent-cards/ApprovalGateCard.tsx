"use client";

import { useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase/client";
import { submitApproval } from "@/lib/api";

export interface TabDef {
  key: string;
  label: string;
}

interface ApprovalGateCardProps {
  tabs: TabDef[];
  activeTab: string;
  onTabChange: (key: string) => void;
  isAwaitingApproval: boolean;
  attempt: number;
  submitting: boolean;
  onApprove: () => void;
  onReject: (notes: string) => void;
  onSubmitEdit: () => void;
  editMode: boolean;
  onEditModeChange: (v: boolean) => void;
  children: ReactNode;
  editBanner?: ReactNode;
}

export function ApprovalGateCard({
  tabs,
  activeTab,
  onTabChange,
  isAwaitingApproval,
  attempt,
  submitting,
  onApprove,
  onReject,
  onSubmitEdit,
  editMode,
  onEditModeChange,
  children,
  editBanner,
}: ApprovalGateCardProps) {
  const [rejectNotes, setRejectNotes] = useState("");
  const [showReject, setShowReject] = useState(false);

  async function handleApprove() {
    onApprove();
  }

  function handleReject() {
    onReject(rejectNotes);
    setRejectNotes("");
    setShowReject(false);
  }

  function handleCancelEdit() {
    onEditModeChange(false);
  }

  return (
    <div className="p-4 space-y-4 text-sm">
      {attempt > 1 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-amber-800 text-xs">
          Revised based on your feedback (attempt {attempt}/3)
        </div>
      )}

      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[200px]">{children}</div>

      {isAwaitingApproval && (
        <div className="border-t pt-4 space-y-3">
          {editMode && editBanner}

          <div className="flex flex-wrap gap-2">
            {!editMode && !showReject && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Approve"}
                </button>
                <button
                  onClick={() => setShowReject(true)}
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  Reject with Feedback
                </button>
                <button
                  onClick={() => onEditModeChange(true)}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Edit Inline
                </button>
              </>
            )}

            {showReject && (
              <div className="w-full space-y-2">
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Explain what needs to change..."
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleReject}
                    disabled={submitting || !rejectNotes.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Rejection"}
                  </button>
                  <button
                    onClick={() => {
                      setShowReject(false);
                      setRejectNotes("");
                    }}
                    disabled={submitting}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {editMode && (
              <>
                <button
                  onClick={onSubmitEdit}
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Edit & Approve"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface ApprovalGateCardWithApiProps {
  tabs: TabDef[];
  activeTab: string;
  onTabChange: (key: string) => void;
  isAwaitingApproval: boolean;
  attempt: number;
  runId: string;
  agentName: string;
  onApprovalComplete?: () => void;
  editedOutput: Record<string, unknown>;
  onResetEditedOutput?: () => void;
  children: ReactNode;
  editBanner?: ReactNode;
}

export function ApprovalGateCardWithApi({
  tabs,
  activeTab,
  onTabChange,
  isAwaitingApproval,
  attempt,
  runId,
  agentName,
  onApprovalComplete,
  editedOutput,
  onResetEditedOutput,
  children,
  editBanner,
}: ApprovalGateCardWithApiProps) {
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleAction(
    action: "approve" | "edit" | "reject",
    notes?: string,
  ) {
    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const orgId = localStorage.getItem("selectedOrgId");
      if (!orgId) return;

      const decision: {
        action: "approve" | "edit" | "reject";
        edited_output?: Record<string, unknown>;
        notes?: string;
      } = { action };

      if (action === "edit") {
        decision.edited_output = editedOutput;
      }
      if (action === "reject") {
        decision.notes = notes;
      }

      await submitApproval(session.access_token, orgId, runId, decision);
      setEditMode(false);
      onApprovalComplete?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ApprovalGateCard
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      isAwaitingApproval={isAwaitingApproval}
      attempt={attempt}
      submitting={submitting}
      onApprove={() => handleAction("approve")}
      onReject={(notes) => handleAction("reject", notes)}
      onSubmitEdit={() => handleAction("edit")}
      editMode={editMode}
      onEditModeChange={(v) => {
        setEditMode(v);
        if (!v && onResetEditedOutput) onResetEditedOutput();
      }}
      editBanner={
        editBanner ?? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-800 text-xs">
            Editing mode — modify any field, then click &quot;Submit Edit&quot;
            to approve your changes.
          </div>
        )
      }
    >
      {children}
    </ApprovalGateCard>
  );
}
