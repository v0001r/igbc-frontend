import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, MapPin, Calendar, Plus, Search, Eye, FileText, CheckCircle2, Clock,
  AlertTriangle, Award, ChevronRight, ChevronLeft, Users, X,
  Filter, Download, Mail, RefreshCw, RotateCcw, ArrowUpDown
} from "lucide-react";
import { getMyProjectsList, getProjectResume, type MyProjectListItem } from "@/lib/projectRegistration";
import { useToast } from "@/hooks/use-toast";
const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  approved: { label: "Approved", color: "bg-primary-muted text-primary", icon: CheckCircle2 },
  submitted: { label: "Submitted", color: "bg-ocean/10 text-ocean", icon: Clock },
  saved: { label: "Saved", color: "bg-peach/20 text-peach-foreground", icon: AlertTriangle },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
};

const tabs = [
  { id: "submitted", label: "Submitted Projects", icon: FileText },
  { id: "saved", label: "Saved Projects", icon: FileText },
  { id: "approved", label: "Approved", icon: CheckCircle2 },
  { id: "rejected", label: "Rejected", icon: X },
];

const Projects = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("saved");
  const [counts, setCounts] = useState({ saved: 0, submitted: 0, approved: 0, rejected: 0 });
  const [projects, setProjects] = useState<MyProjectListItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortCol, setSortCol] = useState("");
  const [resumingProjectId, setResumingProjectId] = useState<number | null>(null);

  // Filter fields
  const [filterProjectId, setFilterProjectId] = useState("");
  const [filterInvoice, setFilterInvoice] = useState("");
  const [filterProjectName, setFilterProjectName] = useState("");
  const [filterOwnerName, setFilterOwnerName] = useState("");
  const [filterOwnerMobile, setFilterOwnerMobile] = useState("");
  const [filterOwnerEmail, setFilterOwnerEmail] = useState("");
  const [filterRatingSystem, setFilterRatingSystem] = useState("All");
  const [filterTxnId, setFilterTxnId] = useState("");

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl === "saved" || tabFromUrl === "submitted" || tabFromUrl === "approved" || tabFromUrl === "rejected") {
      setStatusFilter(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        const response = await getMyProjectsList(statusFilter as "saved" | "submitted" | "approved" | "rejected");
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

  const filtered = useMemo(() => projects.filter((p) => {
    const s = search.toLowerCase();
    const pid = String(p.temporaryProjectId ?? p.id ?? "").toLowerCase();
    const pname = String(p.projectName ?? "").toLowerCase();
    const rating = String(p.ratingSystem ?? "").toLowerCase();
    const location = `${p.city ?? ""} ${p.state ?? ""}`.toLowerCase();
    if (s && !pname.includes(s) && !pid.includes(s) && !rating.includes(s) && !location.includes(s)) return false;
    if (filterProjectId && !pid.includes(filterProjectId.toLowerCase())) return false;
    if (filterProjectName && !pname.includes(filterProjectName.toLowerCase())) return false;
    if (filterRatingSystem !== "All" && p.ratingSystem !== filterRatingSystem) return false;
    return true;
  }), [projects, search, filterProjectId, filterProjectName, filterRatingSystem]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const tableColSpan =
    7 + (statusFilter === "approved" ? 1 : 0) + (statusFilter === "rejected" ? 1 : 0);

  const resetFilters = () => {
    setFilterProjectId(""); setFilterInvoice(""); setFilterProjectName(""); setFilterOwnerName("");
    setFilterOwnerMobile(""); setFilterOwnerEmail(""); setFilterRatingSystem("All"); setFilterTxnId("");
  };

  const handleResumeProject = async (project: MyProjectListItem) => {
    setResumingProjectId(project.id);
    try {
      const response = await getProjectResume(project.id);
      const nextStep = response.nextStep;
      const message = response.message ?? "Project draft loaded.";
      const isComplete = nextStep === null;

      toast({
        title: isComplete ? "Project already completed" : "Resuming registration",
        description: message,
        ...(isComplete ? {} : { variant: "default" as const }),
      });

      if (isComplete) {
        return;
      }

      const params = new URLSearchParams();
      params.set("projectId", String(project.id));
      if (typeof nextStep === "number") {
        params.set("step", String(nextStep));
      }
      navigate(`/register-project?${params.toString()}`);
    } catch (error) {
      toast({
        title: "Unable to resume registration",
        description: error instanceof Error ? error.message : "Please retry.",
        variant: "destructive",
      });
    } finally {
      setResumingProjectId(null);
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your green building projects and certifications</p>
        </div>
        <button
          onClick={() => navigate("/register-project")}
          className="flex items-center gap-2 self-start rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="h-4 w-4" /> Register New Project
        </button>
      </motion.div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
          { label: "Total Projects", value: counts.saved + counts.submitted + counts.approved + counts.rejected, color: "text-foreground" },
          { label: "Approved", value: counts.approved, color: "text-primary" },
          { label: "Submitted", value: counts.submitted, color: "text-ocean" },
          { label: "Saved", value: counts.saved, color: "text-peach-foreground" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-card p-4 text-center shadow-card">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center justify-between border-b border-border">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setStatusFilter(t.id);
                setCurrentPage(1);
                const params = new URLSearchParams(searchParams);
                params.set("tab", t.id);
                setSearchParams(params);
              }}
              className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                statusFilter === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
            showFilters ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground shadow-card hover:text-foreground"
          }`}
        >
          <Filter className="h-3.5 w-3.5" /> FILTERS
        </button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FilterInput label="Project ID" value={filterProjectId} onChange={setFilterProjectId} placeholder="Project id" />
                <FilterInput label="Performa Invoice No." value={filterInvoice} onChange={setFilterInvoice} placeholder="Performa Invoice No." />
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
                    <option>IGBC Green New Buildings</option>
                    <option>IGBC Green Existing Buildings</option>
                  </select>
                </div>
                <FilterInput label="Transaction Id" value={filterTxnId} onChange={setFilterTxnId} placeholder="Transaction id" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <label className="text-xs font-medium text-muted-foreground">Action</label>
                <button onClick={() => setCurrentPage(1)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <Search className="h-4 w-4" />
                </button>
                <button onClick={resetFilters} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Controls */}
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Show
          <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }} className="rounded-lg border border-input bg-card px-2 py-1 text-sm">
            {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-primary px-3 py-2 text-xs font-medium text-primary hover:bg-primary-muted transition">
            <Mail className="h-3.5 w-3.5" /> Send Email
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-primary px-3 py-2 text-xs font-medium text-primary hover:bg-primary-muted transition">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="mt-3 overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-ghost text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 text-left"><input type="checkbox" className="rounded border-input" /></th>
              <th className="px-4 py-3 text-left cursor-pointer hover:text-foreground" onClick={() => setSortCol("id")}>
                <span className="flex items-center gap-1">Project ID <ArrowUpDown className="h-3 w-3" /></span>
              </th>
              <th className="px-4 py-3 text-left cursor-pointer hover:text-foreground">
                <span className="flex items-center gap-1">Project Details <ArrowUpDown className="h-3 w-3" /></span>
              </th>
              <th className="px-4 py-3 text-left cursor-pointer hover:text-foreground">
                <span className="flex items-center gap-1">Owner Details <ArrowUpDown className="h-3 w-3" /></span>
              </th>
              <th className="px-4 py-3 text-left cursor-pointer hover:text-foreground">
                <span className="flex items-center gap-1">Payment Mode <ArrowUpDown className="h-3 w-3" /></span>
              </th>
              <th className="px-4 py-3 text-left cursor-pointer hover:text-foreground">
                <span className="flex items-center gap-1">Approval Status <ArrowUpDown className="h-3 w-3" /></span>
              </th>
              {statusFilter === "approved" && (
                <th className="px-4 py-3 text-left">Certificate Applied</th>
              )}
              {statusFilter === "rejected" && (
                <th className="px-4 py-3 text-left">Rejection Reason</th>
              )}
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((project, i) => {
              const sc = statusConfig[project.status ?? "saved"] ?? statusConfig.saved;
              const canApplyCertification =
                statusFilter === "approved" &&
                (String(project.certificateAppliedStatus ?? "").toLowerCase() === "no" ||
                  project.certificateAppliedStatus === false);
              const canReapplyCertification =
                statusFilter === "rejected" && project.canReapplyCertification === true;
              const certPaymentPending =
                statusFilter === "approved" &&
                String(project.certificationPaymentStatus ?? "").toLowerCase() === "pending";
              const certPaymentApproved =
                statusFilter === "approved" && project.isCertificationWorkspaceReady === true;
              const rejectionRemark =
                project.rejectionType === "certification"
                  ? project.certificationRejectRemark
                  : project.rejectRemark;
              const approvalBadge =
                statusFilter === "rejected"
                  ? {
                      label:
                        project.rejectionType === "certification"
                          ? "Certification rejected"
                          : "Registration rejected",
                      color: "bg-destructive/10 text-destructive",
                    }
                  : certPaymentPending
                    ? { label: "Certification under review", color: "bg-ocean/10 text-ocean" }
                    : certPaymentApproved
                      ? { label: "Certification approved", color: "bg-primary-muted text-primary" }
                      : { label: sc.label, color: sc.color };
              const displayListProjectId =
                statusFilter === "approved" || statusFilter === "rejected"
                  ? String(project.igbcprojectid ?? project.igbcProjectId ?? project.temporaryProjectId ?? `P00${project.id}`)
                  : String(project.temporaryProjectId ?? `P00${project.id}`);
              return (
                <motion.tr
                  key={project.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/50 transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-4"><input type="checkbox" className="rounded border-input" /></td>
                  <td className="px-4 py-4 font-mono text-xs text-muted-foreground">{displayListProjectId}</td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-foreground">Project Name : {project.projectName ?? "-"}</p>
                    <p className="text-xs text-muted-foreground">Rating System : {project.ratingSystem ?? "-"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-foreground">City: {project.city ?? "-"}</p>
                    <p className="text-xs text-muted-foreground">State: {project.state ?? "-"}</p>
                    <p className="text-xs text-muted-foreground">Project Type: {project.projectType ?? "-"}</p>
                    <p className="text-xs text-muted-foreground">Construction: {project.constructionType ?? "-"}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground">{project.paymentStatus ?? "-"}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${approvalBadge.color}`}
                    >
                      {approvalBadge.label}
                    </span>
                  </td>
                  {statusFilter === "approved" && (
                    <td className="px-4 py-4 text-sm text-foreground">
                      {String(project.certificateAppliedStatus ?? "").toLowerCase() === "yes" ||
                      project.certificateAppliedStatus === true
                        ? "Yes"
                        : "No"}
                    </td>
                  )}
                  {statusFilter === "rejected" && (
                    <td className="max-w-xs px-4 py-4 text-sm text-foreground">
                      {rejectionRemark?.trim() ? rejectionRemark : "—"}
                    </td>
                  )}
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="group relative inline-flex">
                        <button
                          onClick={() => navigate(`/project/${project.id}`)}
                          className="rounded-lg border border-primary bg-transparent p-2.5 text-primary transition hover:bg-primary-muted"
                          aria-label="View project"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                          View
                        </span>
                      </div>
                      {statusFilter === "saved" && (
                        <div className="group relative inline-flex">
                          <button
                            onClick={() => void handleResumeProject(project)}
                            disabled={resumingProjectId === project.id}
                            className="rounded-lg border border-primary p-2.5 text-primary transition hover:bg-primary-muted disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label="Resume project"
                            title="Resume"
                          >
                            {resumingProjectId === project.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <RotateCcw className="h-4 w-4" />
                            )}
                          </button>
                          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                            Resume
                          </span>
                        </div>
                      )}
                      {canApplyCertification && (
                        <div className="group relative inline-flex">
                          <button
                            onClick={() => {
                              navigate(`/projects/apply-certification/${project.id}`, {
                                state: { project },
                              });
                            }}
                            className="rounded-lg border border-primary bg-transparent p-2.5 text-primary transition hover:bg-primary-muted"
                            aria-label="Apply for certification"
                            title="Apply for certification"
                          >
                            <Award className="h-4 w-4" />
                          </button>
                          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                            Apply for certification
                          </span>
                        </div>
                      )}
                      {canReapplyCertification && (
                        <div className="group relative inline-flex">
                          <button
                            onClick={() => {
                              navigate(`/projects/apply-certification/${project.id}`, {
                                state: { project, reapply: true },
                              });
                            }}
                            className="rounded-lg border border-primary bg-transparent p-2.5 text-primary transition hover:bg-primary-muted"
                            aria-label="Re-apply for certification"
                            title="Re-apply for certification"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                            Re-apply
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
            {!loadingProjects && paged.length === 0 && (
              <tr>
                <td colSpan={tableColSpan} className="px-4 py-12 text-center text-sm text-muted-foreground">No projects found matching your criteria.</td>
              </tr>
            )}
            {loadingProjects && (
              <tr>
                <td colSpan={tableColSpan} className="px-4 py-12 text-center text-sm text-muted-foreground">Loading projects...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <p>Showing {filtered.length === 0 ? 0 : ((currentPage - 1) * perPage) + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length} projects</p>
        <div className="flex gap-1">
          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted disabled:opacity-40">
            <ChevronLeft className="h-3 w-3" />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`rounded-lg px-3 py-2 text-xs font-medium ${p === currentPage ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}
            >
              {p}
            </button>
          ))}
          <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted disabled:opacity-40">
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

    </DashboardLayout>
  );
};

function FilterInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

export default Projects;
