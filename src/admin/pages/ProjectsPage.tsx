import { useCallback, useEffect, useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import ProjectRegistrationView from "../components/ProjectRegistrationView";
import TableRowActions from "../components/TableRowActions";
import {
  approveAdminProjectRegistration,
  getAdminProjects,
  rejectAdminProjectRegistration,
  type AdminProjectItem,
} from "../lib/adminApi";

const registrationLabel = (status: string) => {
  switch (status) {
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "in-review":
      return "In Review";
    case "draft":
      return "Draft";
    default:
      return "Pending";
  }
};

const ProjectsPage = () => {
  const [viewProjectId, setViewProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [projects, setProjects] = useState<AdminProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const tabs = ["Submitted Projects", "Approved", "Rejected"];

  const registrationFilter = useMemo(() => {
    if (activeTab === 1) return "approved";
    if (activeTab === 2) return "rejected";
    return undefined;
  }, [activeTab]);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminProjects(
        registrationFilter ? { registrationStatus: registrationFilter } : undefined,
      );
      const filtered =
        activeTab === 0
          ? data.filter((p) => p.registrationStatus === "pending" || p.registrationStatus === "in-review")
          : data;
      setProjects(filtered);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load projects");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [registrationFilter, activeTab]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      await approveAdminProjectRegistration(id);
      await loadProjects();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionId(id);
    try {
      await rejectAdminProjectRegistration(id);
      await loadProjects();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reject failed");
    } finally {
      setActionId(null);
    }
  };

  const selectedProject = projects.find((p) => p.id === viewProjectId) ?? null;

  if (viewProjectId && selectedProject) {
    return (
      <ProjectRegistrationView
        project={selectedProject}
        onBack={() => setViewProjectId(null)}
        onApprove={() => void handleApprove(selectedProject.id)}
        onReject={() => void handleReject(selectedProject.id)}
        busy={actionId === selectedProject.id}
      />
    );
  }

  const columns = [
    {
      key: "projectName",
      label: "Project Details",
      sortable: true,
      render: (_: unknown, row: AdminProjectItem) => (
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-foreground">{row.projectName}</p>
          <p className="text-[11px] text-muted-foreground">{row.ratingTypeName}</p>
          <p className="text-[11px] text-muted-foreground">{row.projectCode}</p>
        </div>
      ),
    },
    {
      key: "ownerDetails",
      label: "Owner Details",
      render: (_: unknown, row: AdminProjectItem) => (
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-foreground">{row.ownerName ?? "—"}</p>
          <p className="text-[11px] text-muted-foreground">{row.ownerMobile ?? "—"}</p>
          <p className="text-[11px] text-muted-foreground">{row.ownerEmail ?? "—"}</p>
          <p className="text-[11px] text-muted-foreground">{row.ownerOrg ?? "—"}</p>
        </div>
      ),
    },
    { key: "paymentMode", label: "Payment", sortable: true },
    {
      key: "registrationStatus",
      label: "Status",
      render: (_: unknown, row: AdminProjectItem) => (
        <span
          className={`status-badge ${
            row.registrationStatus === "approved"
              ? "status-approved"
              : row.registrationStatus === "rejected"
                ? "status-rejected"
                : "status-pending"
          }`}
        >
          {registrationLabel(row.registrationStatus)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Action",
      render: (_: unknown, row: AdminProjectItem) => {
        const busy = actionId === row.id;
        const canModerate = row.registrationStatus === "pending" || row.registrationStatus === "in-review";
        return (
          <TableRowActions
            actions={[
              { label: "View", onClick: () => setViewProjectId(row.id), variant: "primary" },
              ...(canModerate
                ? [
                    {
                      label: "Approve",
                      onClick: () => void handleApprove(row.id),
                      variant: "success" as const,
                      disabled: busy,
                    },
                    {
                      label: "Reject",
                      onClick: () => void handleReject(row.id),
                      variant: "danger" as const,
                      disabled: busy,
                    },
                  ]
                : []),
            ]}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-5 border-b border-border">
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setActiveTab(i)}
            className={`border-b-2 pb-2.5 text-xs font-medium transition-colors ${
              i === activeTab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="kpi-card py-10 text-center text-xs text-muted-foreground">Loading projects…</div>
      ) : (
        <DataTable columns={columns} data={projects} title="Project Registrations" showEmail />
      )}
    </div>
  );
};

export default ProjectsPage;
