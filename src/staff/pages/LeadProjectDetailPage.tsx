import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CertificationReadOnlyWorkspace } from "@/components/greenHomes/CertificationReadOnlyWorkspace";
import { AssignTeamModal } from "@/staff/components/AssignTeamModal";
import { LeadRegistrationOverview } from "@/staff/components/LeadRegistrationOverview";
import type { LeadPanelTab } from "@/lib/certificationWorkflow";

type DetailTab = "overview" | "submittals" | "assign";

export default function LeadProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const context = (searchParams.get("context") ?? "registered") as LeadPanelTab;
  const projectId = Number(id);
  const [detailTab, setDetailTab] = useState<DetailTab>("overview");
  const [assignOpen, setAssignOpen] = useState(false);

  const showAssignmentTabs = context === "tpa-coordinator" || context === "assigned";
  const activeTab: DetailTab = showAssignmentTabs ? detailTab : "overview";

  const backTo = "/staff/lead";

  if (!id || Number.isNaN(projectId)) {
    return <p className="text-sm text-muted-foreground">Project not found.</p>;
  }

  return (
    <div className="space-y-4">
      <Link to={backTo} className="text-sm font-medium text-primary hover:underline">
        ← Back to list
      </Link>

      {showAssignmentTabs ? (
        <div className="flex flex-wrap gap-4 border-b border-border pb-2">
          {(
            [
              { id: "overview", label: "Project Overview" },
              { id: "submittals", label: "View Submittals" },
              { id: "assign", label: "Assign" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDetailTab(tab.id)}
              className={`border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : (
        <h2 className="text-lg font-semibold text-foreground">Project Overview</h2>
      )}

      {activeTab === "overview" ? <LeadRegistrationOverview projectId={projectId} /> : null}

      {activeTab === "submittals" ? (
        <CertificationReadOnlyWorkspace projectId={id} />
      ) : null}

      {activeTab === "assign" ? (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-base font-semibold text-foreground">Assign Coordinator & TPA</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Assign both coordinator (staff) and TPA in one step. Notification emails are sent automatically.
          </p>
          <button
            type="button"
            className="action-btn action-btn-primary mt-4"
            onClick={() => setAssignOpen(true)}
          >
            Open Assignment Form
          </button>
        </div>
      ) : null}

      <AssignTeamModal
        projectId={projectId}
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onAssigned={() => setAssignOpen(false)}
      />
    </div>
  );
}
