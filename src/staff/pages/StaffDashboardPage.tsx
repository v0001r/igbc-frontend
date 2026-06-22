import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, CheckCircle2, Clock, FolderOpen } from "lucide-react";
import KPICard from "@/admin/components/KPICard";
import { getAccessToken } from "@/lib/auth";
import { fetchStaffDashboardStats } from "@/lib/certificationWorkflow";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type AssignedProject = {
  projectId: number;
  igbcProjectId: string;
  ratingSystem: string;
  workflowStatus: string;
  isSubmitted: boolean;
  isPending?: boolean;
  certificateStatus?: string;
};

export default function StaffDashboardPage() {
  const [stats, setStats] = useState({
    assignedProjects: 0,
    pendingProjects: 0,
    assignedToTpa: 0,
    completedProjects: 0,
  });
  const [projects, setProjects] = useState<AssignedProject[]>([]);

  const load = () => {
    const token = getAccessToken();
    void Promise.all([
      fetchStaffDashboardStats(),
      fetch(`${API_URL}/projects/assigned`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).then((r) => r.json()),
    ]).then(([s, p]) => {
      setStats(s);
      const payload = p as { items: AssignedProject[] };
      setProjects(payload.items ?? []);
    });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <section className="glass-section">
        <h2 className="glass-section-title mb-4">Overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard
            title="Total Assigned Projects"
            value={stats.assignedProjects}
            change={0}
            icon={FolderOpen}
            color="primary"
          />
          <KPICard
            title="Pending Projects"
            value={stats.pendingProjects}
            change={0}
            icon={Clock}
            color="warning"
          />
          <KPICard
            title="Projects Assigned to TPA"
            value={stats.assignedToTpa}
            change={0}
            icon={Award}
            color="info"
          />
          <KPICard
            title="Completed Projects"
            value={stats.completedProjects}
            change={0}
            icon={CheckCircle2}
            color="success"
          />
        </div>
      </section>

      <section className="glass-section">
        <h2 className="glass-section-title mb-4">Assigned Projects</h2>
        <div className="table-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Project ID</th>
                  <th>Rating Type</th>
                  <th>Status</th>
                  <th>Pending</th>
                  <th>Certificate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      No projects assigned yet.
                    </td>
                  </tr>
                ) : (
                  projects.map((p) => (
                    <tr key={p.projectId}>
                      <td>{p.igbcProjectId}</td>
                      <td>{p.ratingSystem}</td>
                      <td>{p.workflowStatus?.replace(/_/g, " ") ?? "—"}</td>
                      <td>{p.isPending ? "Yes" : "No"}</td>
                      <td>{p.certificateStatus ?? "—"}</td>
                      <td className="whitespace-nowrap">
                        <Link
                          to={`/staff/projects/${p.projectId}`}
                          className="text-xs font-medium text-primary hover:underline"
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
