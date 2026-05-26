import { useEffect, useMemo, useState } from "react";
import ProjectRegistrationView from "../components/ProjectRegistrationView";
import { ChevronLeft, ChevronRight, FileText, Search, X, CheckCircle2, Filter, RefreshCw, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAdminProjectsList, type AdminProjectListItem, type AdminProjectListTab } from "@/lib/projectRegistration";
import TableRowActions from "../components/TableRowActions";

const ProjectsPage = () => {
  const { toast } = useToast();
  const [viewProject, setViewProject] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AdminProjectListTab>("submitted");
  const [counts, setCounts] = useState({ saved: 0, submitted: 0, approved: 0, rejected: 0 });
  const [projects, setProjects] = useState<AdminProjectListItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filterProjectId, setFilterProjectId] = useState("");
  const [filterProjectName, setFilterProjectName] = useState("");
  const [filterOwnerName, setFilterOwnerName] = useState("");
  const [filterOwnerMobile, setFilterOwnerMobile] = useState("");
  const [filterOwnerEmail, setFilterOwnerEmail] = useState("");
  const [filterRatingSystem, setFilterRatingSystem] = useState("All");

  const tabs = [
    { id: "submitted", label: "Submitted Projects", icon: FileText },
    { id: "saved", label: "Saved Projects", icon: FileText },
    { id: "approved", label: "Approved", icon: CheckCircle2 },
    { id: "rejected", label: "Rejected", icon: X },
  ];

  useEffect(() => {
    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        const response = await getAdminProjectsList(statusFilter);
        setCounts(response.counts);
        setProjects(response.items ?? []);
      } catch (error) {
        toast({
          title: "Unable to load projects",
          description: error instanceof Error ? error.message : "Please retry.",
          variant: "destructive",
        });
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };
    void loadProjects();
  }, [statusFilter, toast]);

  const normalizedProjects = projects.map((p, index) => ({
    ...p,
    rowNumber: index + 1,
    apiProjectId: (() => {
      const rawCandidates: unknown[] = [
        p.id,
        p.projectId,
        (p as Record<string, unknown>).projectRegistrationId,
        (p as Record<string, unknown>).registrationId,
      ];
      for (const candidate of rawCandidates) {
        if (typeof candidate === "number" && Number.isFinite(candidate)) {
          return candidate;
        }
        if (typeof candidate === "string" && /^\d+$/.test(candidate.trim())) {
          return Number(candidate.trim());
        }
      }
      return null;
    })(),
    projectId: String(p.projectId ?? p.id ?? ""),
    entityId: String(
      p.id ??
      p.projectId ??
      (p as Record<string, unknown>).projectRegistrationId ??
      "",
    ),
    status: p.status ?? "submitted",
    approvalStatus: p.paymentStatus ?? p.status ?? "-",
    temporaryProjectId: p.temporaryProjectId ?? `P00${p.id}`,
    paymentStatus: p.paymentMethod ?? p.paymentStatus ?? "-",
    city: "-",
    state: "-",
    projectType: "-",
    constructionType: "-",
    adminViewId:
      typeof p.id === "number"
        ? String(p.id)
        : typeof p.projectId === "number"
        ? String(p.projectId)
        : typeof (p as Record<string, unknown>).projectRegistrationId === "number"
        ? String((p as Record<string, unknown>).projectRegistrationId)
        : typeof (p as Record<string, unknown>).registrationId === "number"
        ? String((p as Record<string, unknown>).registrationId)
        : "",
    displayIgbcProjectId:
      (p as Record<string, unknown>).igbcprojectid ??
      (p as Record<string, unknown>).igbcProjectId ??
      p.temporaryProjectId ??
      p.projectId ??
      "-",
  }));

  const filtered = useMemo(
    () =>
      normalizedProjects.filter((p) => {
        if (p.status !== statusFilter) return false;
        const s = search.toLowerCase();
        const baseSearchPass = !s || (
          String(p.projectName ?? "").toLowerCase().includes(s) ||
          p.projectId.toLowerCase().includes(s) ||
          String(p.ratingSystem ?? "").toLowerCase().includes(s) ||
          String(p.ownerName ?? "").toLowerCase().includes(s) ||
          String(p.ownerEmail ?? "").toLowerCase().includes(s)
        );
        if (!baseSearchPass) return false;
        if (filterProjectId && !p.projectId.toLowerCase().includes(filterProjectId.toLowerCase())) return false;
        if (filterProjectName && !String(p.projectName ?? "").toLowerCase().includes(filterProjectName.toLowerCase())) return false;
        if (filterOwnerName && !String(p.ownerName ?? "").toLowerCase().includes(filterOwnerName.toLowerCase())) return false;
        if (filterOwnerMobile && !String(p.ownerMobile ?? "").toLowerCase().includes(filterOwnerMobile.toLowerCase())) return false;
        if (filterOwnerEmail && !String(p.ownerEmail ?? "").toLowerCase().includes(filterOwnerEmail.toLowerCase())) return false;
        if (filterRatingSystem !== "All" && p.ratingSystem !== filterRatingSystem) return false;
        return true;
      }),
    [
      normalizedProjects,
      search,
      statusFilter,
      filterProjectId,
      filterProjectName,
      filterOwnerName,
      filterOwnerMobile,
      filterOwnerEmail,
      filterRatingSystem,
    ],
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const statusColor = (status: string) =>
    status === "approved"
      ? "bg-primary-muted text-primary"
      : status === "rejected"
      ? "bg-destructive/10 text-destructive"
      : status === "saved"
      ? "bg-peach/20 text-peach-foreground"
      : "bg-ocean/10 text-ocean";

  const resetFilters = () => {
    setFilterProjectId("");
    setFilterProjectName("");
    setFilterOwnerName("");
    setFilterOwnerMobile("");
    setFilterOwnerEmail("");
    setFilterRatingSystem("All");
    setCurrentPage(1);
  };

  const exportFilteredProjects = () => {
    const headers = ["Project ID", "Project Name", "Rating System", "Owner Name", "Owner Mobile", "Owner Email", "Organization", "Payment Mode", "Status"];
    const rows = filtered.map((p) => [
      p.projectId,
      p.projectName,
      p.ratingSystem,
      p.ownerName,
      p.ownerMobile,
      p.ownerEmail,
      p.organisation,
      p.paymentMode,
      p.approvalStatus,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `admin-project-registrations-${statusFilter}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const resolveAdminViewId = (row: Record<string, unknown>) => {
    const candidates = [
      row.apiProjectId,
      row.adminViewId,
      row.entityId,
      row.id,
      row.projectId,
      row.projectRegistrationId,
      row.registrationId,
    ];
    const firstValid = candidates.find((value) => {
      if (typeof value === "number" && Number.isFinite(value)) return true;
      if (typeof value === "string" && /^\d+$/.test(value.trim())) return true;
      return false;
    });
    if (typeof firstValid === "number") return String(firstValid);
    if (typeof firstValid === "string" && /^\d+$/.test(firstValid.trim())) return String(Number(firstValid.trim()));
    return "";
  };

  if (viewProject) {
    return <ProjectRegistrationView projectId={viewProject} onBack={() => setViewProject(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setStatusFilter(t.id);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                statusFilter === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" /> {t.label} ({counts[t.id as keyof typeof counts]})
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pb-2">
          <button
            onClick={exportFilteredProjects}
            className="flex items-center gap-1.5 rounded-xl border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-muted"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-muted"
          >
            <Filter className="h-3.5 w-3.5" /> Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FilterInput label="Project ID" value={filterProjectId} onChange={setFilterProjectId} placeholder="Project ID" />
            <FilterInput label="Project Name" value={filterProjectName} onChange={setFilterProjectName} placeholder="Project Name" />
            <FilterInput label="Owner Name" value={filterOwnerName} onChange={setFilterOwnerName} placeholder="Owner Name" />
            <FilterInput label="Owner Mobile" value={filterOwnerMobile} onChange={setFilterOwnerMobile} placeholder="Owner Mobile" />
            <FilterInput label="Owner Email" value={filterOwnerEmail} onChange={setFilterOwnerEmail} placeholder="Owner Email" />
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Rating System</label>
              <select
                value={filterRatingSystem}
                onChange={(e) => setFilterRatingSystem(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="All">All</option>
                <option>IGBC Green Factory Buildings</option>
                <option>IGBC Green Interiors</option>
                <option>IGBC Green Homes</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button onClick={() => setCurrentPage(1)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Search className="h-4 w-4" />
            </button>
            <button onClick={resetFilters} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Project Registrations</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search..."
              className="h-9 w-64 rounded-lg border border-input bg-background pl-8 pr-3 text-xs"
            />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-ghost text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 text-left">S No</th>
              <th className="px-4 py-3 text-left">Project Details</th>
              <th className="px-4 py-3 text-left">Owner Details</th>
              <th className="px-4 py-3 text-left">Payment Details</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row, index) => (
              <tr key={row.entityId || row.projectId} className="border-b border-border/50 hover:bg-muted/30">
                <td className="px-4 py-4 text-xs text-muted-foreground">{(currentPage - 1) * perPage + index + 1}</td>
                <td className="px-4 py-4">
                  <p className="text-sm font-medium text-foreground">{row.projectName ?? "-"}</p>
                  <p className="text-xs text-muted-foreground">{row.ratingSystem ?? "-"}</p>
                  {statusFilter === "approved" && (
                    <p className="text-xs font-mono text-muted-foreground">ID: {String((row as Record<string, unknown>).displayIgbcProjectId ?? "-")}</p>
                  )}
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm font-medium text-foreground">{row.ownerName ?? "-"}</p>
                  <p className="text-xs text-muted-foreground">{row.ownerMobile ?? "-"}</p>
                  <p className="text-xs text-muted-foreground">{row.ownerEmail ?? "-"}</p>
                  <p className="text-xs text-muted-foreground">{row.organisation ?? "-"}</p>
                </td>
                <td className="px-4 py-4 text-sm text-foreground">{String(row.paymentStatus ?? "-").toUpperCase()}</td>
                <td className="px-4 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(row.status)}`}>
                    {String(row.approvalStatus ?? "-").toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <TableRowActions
                    actions={[
                      {
                        label: "View",
                        variant: "primary",
                        onClick: () => {
                          const resolvedId = resolveAdminViewId(row as Record<string, unknown>);
                          if (!resolvedId) {
                            toast({
                              title: "Unable to open project",
                              description: "Numeric projectId not found in admin list response.",
                              variant: "destructive",
                            });
                            return;
                          }
                          setViewProject(resolvedId);
                        },
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {loadingProjects ? "Loading projects..." : "No results found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          Showing {paged.length} of {filtered.length} records
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-xs text-muted-foreground">Page {Math.max(currentPage, 1)} / {Math.max(totalPages, 1)}</span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages || 1, currentPage + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
