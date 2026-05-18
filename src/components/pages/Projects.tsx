import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { fetchMyProjects, type ProjectDto } from "@/lib/projects";
import { isAuthenticated } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, MapPin, Calendar, Plus, Search, Eye, FileText, CheckCircle2, Clock,
  AlertTriangle, Award, ChevronRight, ChevronLeft, X, Check, CreditCard, Users,
  Filter, Download, Mail, RefreshCw, ArrowUpDown
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  approved: { label: "Approved", color: "bg-primary-muted text-primary", icon: CheckCircle2 },
  "in-review": { label: "In Review", color: "bg-ocean/10 text-ocean", icon: Clock },
  pending: { label: "Pending", color: "bg-peach/20 text-peach-foreground", icon: AlertTriangle },
};

const tabs = [
  { id: "submitted", label: "Submitted Projects", icon: FileText },
  { id: "saved", label: "Saved Projects", icon: FileText },
  { id: "approved", label: "Approved", icon: CheckCircle2 },
  { id: "rejected", label: "Rejected", icon: X },
];

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) return;
    fetchMyProjects()
      .then(setProjects)
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Failed to load projects"));
  }, []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("submitted");
  const [showFilters, setShowFilters] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortCol, setSortCol] = useState("");

  // Filter fields
  const [filterProjectId, setFilterProjectId] = useState("");
  const [filterInvoice, setFilterInvoice] = useState("");
  const [filterProjectName, setFilterProjectName] = useState("");
  const [filterOwnerName, setFilterOwnerName] = useState("");
  const [filterOwnerMobile, setFilterOwnerMobile] = useState("");
  const [filterOwnerEmail, setFilterOwnerEmail] = useState("");
  const [filterRatingSystem, setFilterRatingSystem] = useState("All");
  const [filterTxnId, setFilterTxnId] = useState("");

  // Cert modal state
  const [certProject, setCertProject] = useState<ProjectDto | null>(null);
  const [certStep, setCertStep] = useState(1);
  const [certType, setCertType] = useState("");
  const [expedite, setExpedite] = useState(false);

  const filtered = projects.filter((p) => {
    const reg = p.registrationStatus;
    if (statusFilter === "approved" && reg !== "approved") return false;
    if (statusFilter === "rejected" && reg !== "rejected") return false;
    if (statusFilter === "saved" && reg !== "draft") return false;
    if (statusFilter === "submitted" && (reg === "approved" || reg === "rejected" || reg === "draft")) return false;
    const s = search.toLowerCase();
    const owner = p.ownerName ?? "";
    if (
      s &&
      !p.projectName.toLowerCase().includes(s) &&
      !p.projectCode.toLowerCase().includes(s) &&
      !owner.toLowerCase().includes(s)
    ) {
      return false;
    }
    if (filterProjectId && !p.projectCode.toLowerCase().includes(filterProjectId.toLowerCase())) return false;
    if (filterProjectName && !p.projectName.toLowerCase().includes(filterProjectName.toLowerCase())) return false;
    if (filterOwnerName && !owner.toLowerCase().includes(filterOwnerName.toLowerCase())) return false;
    if (filterRatingSystem !== "All" && p.ratingTypeName !== filterRatingSystem) return false;
    return true;
  });

  const ratingSystemOptions = [...new Set(projects.map((p) => p.ratingTypeName).filter(Boolean))].sort();

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const resetFilters = () => {
    setFilterProjectId(""); setFilterInvoice(""); setFilterProjectName(""); setFilterOwnerName("");
    setFilterOwnerMobile(""); setFilterOwnerEmail(""); setFilterRatingSystem("All"); setFilterTxnId("");
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

      {loadError ? (
        <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm text-destructive">
          {loadError}
        </p>
      ) : null}

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Projects", value: projects.length, color: "text-foreground" },
          { label: "Approved", value: projects.filter((p) => p.registrationStatus === "approved").length, color: "text-primary" },
          { label: "In Review", value: projects.filter((p) => p.registrationStatus === "in-review").length, color: "text-ocean" },
          { label: "Pending", value: projects.filter((p) => p.registrationStatus === "pending").length, color: "text-peach-foreground" },
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
              onClick={() => { setStatusFilter(t.id); setCurrentPage(1); }}
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
                    {ratingSystemOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
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
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((project, i) => {
              const sc = statusConfig[project.registrationStatus] ?? statusConfig.pending;
              return (
                <motion.tr
                  key={project.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/50 transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-4"><input type="checkbox" className="rounded border-input" /></td>
                  <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                    {project.projectCode || "—"}
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-foreground">Project Name : {project.projectName}</p>
                    <p className="text-xs text-muted-foreground">Rating System : {project.ratingTypeName}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-foreground">Name:{project.ownerName ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">Mobile No:{project.ownerMobile ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">Email: {project.ownerEmail ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">Organisation: {project.ownerOrg ?? "—"}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground">{project.paymentMode}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${sc.color}`}>
                      {sc.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => navigate(`/project/${project.id}`)}
                      className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition"
                    >
                      View
                    </button>
                  </td>
                </motion.tr>
              );
            })}
            {paged.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">No projects found matching your criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <p>Showing {((currentPage - 1) * perPage) + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length} projects</p>
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

      {/* Certification Modal (kept from original) */}
      <AnimatePresence>
        {certProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={() => setCertProject(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card p-6 shadow-premium sm:p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Apply for Certification</h2>
                <button onClick={() => setCertProject(null)} className="rounded-lg p-2 hover:bg-muted"><X className="h-4 w-4" /></button>
              </div>
              <div className="mt-4 rounded-xl bg-ghost p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Project:</span> <span className="font-medium text-foreground">{certProject.projectName}</span></div>
                  <div><span className="text-muted-foreground">ID:</span> <span className="font-mono font-medium text-foreground">{certProject.projectCode || certProject.id}</span></div>
                </div>
              </div>
              {certStep === 1 && (
                <div className="mt-6 space-y-5">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Certification Type</h3>
                    <div className="mt-3 flex gap-3">
                      {["Pre-Certification", "Certification"].map((t) => (
                        <button key={t} onClick={() => setCertType(t)} className={`flex-1 rounded-xl border-2 p-4 text-left transition-all ${certType === t ? "border-primary bg-primary-muted" : "border-border hover:border-primary/30"}`}>
                          <p className="text-sm font-semibold text-foreground">{t}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{t === "Pre-Certification" ? "Preliminary review at design stage" : "Full certification after construction"}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border p-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Expedite Review</p>
                      <p className="text-xs text-muted-foreground">Fast-track processing</p>
                    </div>
                    <button onClick={() => setExpedite(!expedite)} className={`relative h-6 w-11 rounded-full transition-colors ${expedite ? "bg-primary" : "bg-muted"}`}>
                      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform ${expedite ? "translate-x-5" : ""}`} />
                    </button>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setCertProject(null)} className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted">Cancel</button>
                    <button onClick={() => setCertStep(2)} disabled={!certType} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40">Continue</button>
                  </div>
                </div>
              )}
              {certStep === 2 && (
                <div className="mt-6 space-y-5">
                  <div className="rounded-xl border border-border p-4">
                    <h3 className="text-sm font-semibold text-foreground">Fee Summary</h3>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">{certType} Fee</span><span className="font-mono font-semibold">₹2,36,000</span></div>
                      {expedite && <div className="flex justify-between"><span className="text-muted-foreground">Expedite Charges</span><span className="font-mono font-semibold">₹50,000</span></div>}
                      <div className="flex justify-between"><span className="text-muted-foreground">GST (18%)</span><span className="font-mono font-semibold">₹{expedite ? "51,480" : "42,480"}</span></div>
                      <div className="flex justify-between border-t border-border pt-2 font-semibold"><span>Total</span><span className="font-mono text-primary">₹{expedite ? "3,37,480" : "2,78,480"}</span></div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button onClick={() => setCertStep(1)} className="flex items-center gap-1 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted"><ChevronLeft className="h-3 w-3" /> Back</button>
                    <button onClick={() => setCertStep(3)} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"><CreditCard className="h-4 w-4" /> Proceed to Pay</button>
                  </div>
                </div>
              )}
              {certStep === 3 && (
                <div className="mt-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"><Check className="h-8 w-8 text-primary" /></div>
                  <h3 className="mt-4 text-lg font-bold text-foreground">Application Submitted!</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Your {certType} application for <strong>{certProject.projectName}</strong> has been submitted.</p>
                  <button onClick={() => setCertProject(null)} className="mt-5 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">Done</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
