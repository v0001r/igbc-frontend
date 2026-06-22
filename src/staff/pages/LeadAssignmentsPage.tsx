import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, FolderOpen, UserCheck } from "lucide-react";
import KPICard from "@/admin/components/KPICard";
import {
  fetchLeadAssignedProjects,
  fetchLeadDashboardStats,
  fetchLeadRegisteredProjects,
  fetchLeadTpaCoordinatorProjects,
  type LeadPanelTab,
  type LeadSubmittedProject,
} from "@/lib/certificationWorkflow";

const TABS: Array<{ id: LeadPanelTab; label: string }> = [
  { id: "registered", label: "Registered Projects" },
  { id: "tpa-coordinator", label: "TPA & Coordinator" },
  { id: "assigned", label: "Assigned" },
];

function statusBadge(status: string) {
  return (
    <span className="status-badge status-pending">{status.replace(/_/g, " ")}</span>
  );
}

function loadTab(tab: LeadPanelTab) {
  if (tab === "registered") return fetchLeadRegisteredProjects();
  if (tab === "assigned") return fetchLeadAssignedProjects();
  return fetchLeadTpaCoordinatorProjects();
}

export default function LeadAssignmentsPage() {
  const [activeTab, setActiveTab] = useState<LeadPanelTab>("registered");
  const [stats, setStats] = useState({
    registeredProjects: 0,
    tpaCoordinatorQueue: 0,
    fullyAssigned: 0,
  });
  const [items, setItems] = useState<LeadSubmittedProject[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = () => {
    void Promise.all([fetchLeadDashboardStats(), loadTab(activeTab)]).then(([s, list]) => {
      setStats({
        registeredProjects: s.registeredProjects ?? 0,
        tpaCoordinatorQueue: s.tpaCoordinatorQueue ?? s.submittedProjects ?? 0,
        fullyAssigned: s.fullyAssigned ?? s.assignedStaff ?? 0,
      });
      setItems(list.items);
    });
  };

  useEffect(() => {
    setLoading(true);
    void loadTab(activeTab)
      .then((list) => setItems(list.items))
      .finally(() => setLoading(false));
  }, [activeTab]);

  useEffect(() => {
    void fetchLeadDashboardStats().then((s) => {
      setStats({
        registeredProjects: s.registeredProjects ?? 0,
        tpaCoordinatorQueue: s.tpaCoordinatorQueue ?? s.submittedProjects ?? 0,
        fullyAssigned: s.fullyAssigned ?? s.assignedStaff ?? 0,
      });
    });
  }, []);

  const viewPath = useMemo(
    () => (projectId: number) => `/staff/lead/projects/${projectId}?context=${activeTab}`,
    [activeTab],
  );

  return (
    <div className="space-y-6">
      <section className="glass-section">
        <h2 className="glass-section-title mb-4">Overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KPICard
            title="Registered Projects"
            value={stats.registeredProjects}
            change={0}
            icon={FolderOpen}
            color="primary"
          />
          <KPICard
            title="TPA & Coordinator Queue"
            value={stats.tpaCoordinatorQueue}
            change={0}
            icon={ClipboardList}
            color="warning"
          />
          <KPICard
            title="Fully Assigned"
            value={stats.fullyAssigned}
            change={0}
            icon={UserCheck}
            color="success"
          />
        </div>
      </section>

      <section className="glass-section">
        <div className="mb-4 flex flex-wrap items-center gap-4 border-b border-border pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
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

        <div className="table-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Project ID</th>
                  <th>Project Details</th>
                  {activeTab === "registered" ? (
                    <>
                      <th>Owner Details</th>
                      <th>Payment</th>
                    </>
                  ) : (
                    <>
                      <th>Rating System</th>
                      <th>Submission</th>
                      <th>Status</th>
                    </>
                  )}
                  {activeTab === "assigned" ? (
                    <>
                      <th>Coordinator</th>
                      <th>TPA</th>
                      <th>Fee</th>
                      <th>Count</th>
                    </>
                  ) : null}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                      Loading…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                      No projects found for this tab.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.projectId}>
                      <td>{item.igbcProjectId}</td>
                      {activeTab === "registered" ? (
                        <td>
                          <div className="text-sm font-medium">{item.projectName}</div>
                          <div className="text-xs text-muted-foreground">{item.ratingType}</div>
                        </td>
                      ) : (
                        <td>{item.projectName}</td>
                      )}
                      {activeTab === "registered" ? (
                        <>
                          <td>
                            <div className="text-sm">{item.clientName}</div>
                            <div className="text-xs text-muted-foreground">{item.ownerEmail}</div>
                            <div className="text-xs text-muted-foreground">{item.ownerMobile}</div>
                          </td>
                          <td>
                            <div className="text-sm capitalize">{item.paymentStatus}</div>
                            <div className="text-xs text-muted-foreground">{item.paymentMode ?? "—"}</div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{item.ratingType}</td>
                          <td>
                            {item.submissionDate
                              ? new Date(item.submissionDate).toLocaleDateString("en-IN")
                              : "—"}
                          </td>
                          <td>{statusBadge(item.workflowStatus)}</td>
                        </>
                      )}
                      {activeTab === "assigned" ? (
                        <>
                          <td>{item.assignedStaff?.displayName ?? "—"}</td>
                          <td>{item.assignedTpa?.displayName ?? "—"}</td>
                          <td>{item.assignmentFee ?? "—"}</td>
                          <td>{item.assignmentCount ?? "—"}</td>
                        </>
                      ) : null}
                      <td>
                        <Link
                          to={viewPath(item.projectId)}
                          className="text-xs font-medium text-primary hover:underline"
                          onClick={() => refresh()}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
