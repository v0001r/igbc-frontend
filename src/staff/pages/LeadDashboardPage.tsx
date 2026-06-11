import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, FolderOpen, UserCheck } from "lucide-react";
import KPICard from "@/admin/components/KPICard";
import { fetchLeadDashboardStats, fetchLeadSubmittedProjects, type LeadSubmittedProject } from "@/lib/certificationWorkflow";
import { AssignStaffModal } from "../components/AssignStaffModal";

function statusBadge(status: string) {
  const cls =
    status === "completed"
      ? "status-badge status-approved"
      : status === "final_submitted"
        ? "status-badge status-pending"
        : "status-badge status-pending";
  return <span className={cls}>{status.replace(/_/g, " ")}</span>;
}

export default function LeadDashboardPage() {
  const [stats, setStats] = useState({ submittedProjects: 0, unassignedStaff: 0, assignedStaff: 0 });
  const [items, setItems] = useState<LeadSubmittedProject[]>([]);
  const [assignProjectId, setAssignProjectId] = useState<number | null>(null);

  const load = () => {
    void Promise.all([fetchLeadDashboardStats(), fetchLeadSubmittedProjects()]).then(([s, list]) => {
      setStats(s);
      setItems(list.items);
    });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <section className="glass-section">
        <h2 className="glass-section-title mb-4">Overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KPICard
            title="Submitted Projects"
            value={stats.submittedProjects}
            change={0}
            icon={FolderOpen}
            color="primary"
          />
          <KPICard
            title="Awaiting Staff Assignment"
            value={stats.unassignedStaff}
            change={0}
            icon={ClipboardList}
            color="warning"
          />
          <KPICard
            title="Staff Assigned"
            value={stats.assignedStaff}
            change={0}
            icon={UserCheck}
            color="success"
          />
        </div>
      </section>

      <section className="glass-section">
        <h2 className="glass-section-title mb-4">Projects Submitted</h2>
        <div className="table-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Project ID</th>
                  <th>Project Name</th>
                  <th>Client</th>
                  <th>Rating Type</th>
                  <th>Submission Date</th>
                  <th>Status</th>
                  <th>Assigned Staff</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                      No submitted projects in your rating types.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.projectId}>
                      <td>{item.igbcProjectId}</td>
                      <td>{item.projectName}</td>
                      <td>{item.clientName}</td>
                      <td>{item.ratingType}</td>
                      <td>
                        {item.submissionDate
                          ? new Date(item.submissionDate).toLocaleDateString("en-IN")
                          : "—"}
                      </td>
                      <td>{statusBadge(item.workflowStatus)}</td>
                      <td>{item.assignedStaff?.displayName ?? "—"}</td>
                      <td className="space-x-2 whitespace-nowrap">
                        <Link
                          to={`/staff/projects/${item.projectId}`}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          className="text-xs font-medium text-primary hover:underline"
                          onClick={() => setAssignProjectId(item.projectId)}
                        >
                          Assign Staff
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <AssignStaffModal
        projectId={assignProjectId ?? 0}
        open={assignProjectId !== null}
        onClose={() => setAssignProjectId(null)}
        onAssigned={load}
      />
    </div>
  );
}
