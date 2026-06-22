import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ClipboardList, FolderOpen } from "lucide-react";
import KPICard from "@/admin/components/KPICard";
import { getAccessToken } from "@/lib/auth";
import { fetchTpaDashboardStats } from "@/lib/certificationWorkflow";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type AssignedProject = {
  projectId: number;
  igbcProjectId: string;
  ratingSystem: string;
  workflowStatus: string;
};

export default function TpaDashboardPage() {
  const [stats, setStats] = useState({
    assignedProjects: 0,
    underReview: 0,
    completedProjects: 0,
  });
  const [projects, setProjects] = useState<AssignedProject[]>([]);

  useEffect(() => {
    const token = getAccessToken();
    void Promise.all([
      fetchTpaDashboardStats(),
      fetch(`${API_URL}/projects/assigned`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).then((r) => r.json()),
    ]).then(([s, p]) => {
      setStats(s);
      setProjects((p as { items: AssignedProject[] }).items ?? []);
    });
  }, []);

  return (
    <div className="space-y-6">
      <section className="glass-section">
        <h2 className="glass-section-title mb-4">Overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KPICard
            title="Assigned Projects"
            value={stats.assignedProjects}
            change={0}
            icon={FolderOpen}
            color="primary"
          />
          <KPICard
            title="Under Review"
            value={stats.underReview}
            change={0}
            icon={ClipboardList}
            color="warning"
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                      No projects assigned yet.
                    </td>
                  </tr>
                ) : (
                  projects.map((p) => (
                    <tr key={p.projectId}>
                      <td>{p.igbcProjectId}</td>
                      <td>{p.ratingSystem}</td>
                      <td>{p.workflowStatus?.replace(/_/g, " ") ?? "—"}</td>
                      <td>
                        <Link
                          to={`/tpa/projects/${p.projectId}`}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Review credits
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
