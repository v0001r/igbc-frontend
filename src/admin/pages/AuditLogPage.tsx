import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Loader2,
  RefreshCw,
  ScrollText,
  Search,
  User,
  X,
} from "lucide-react";
import AdminModal from "../components/AdminModal";
import { toast } from "../components/ui/use-toast";
import {
  fetchActivityLogs,
  type ActivityLogItem,
  type ActivityLogQuery,
} from "../lib/activityLogApi";
import {
  ACTIVITY_TYPE_GROUPS,
  activityIconColor,
  MODULE_OPTIONS,
  USER_ROLE_OPTIONS,
} from "../lib/activityLogLabels";

const PAGE_SIZE = 15;

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function JsonBlock({ data, title }: { data: Record<string, unknown> | null; title: string }) {
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <div className="mt-3">
      <p className="detail-label mb-1">{title}</p>
      <pre className="max-h-48 overflow-auto rounded-xl border bg-slate-50/80 p-3 text-[11px] leading-relaxed text-slate-700">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function RoleBadge({ label }: { label: string | null }) {
  if (!label) return <span className="text-muted-foreground">—</span>;
  const tone =
    label === "Admin"
      ? "bg-violet-100 text-violet-700 border-violet-200"
      : label === "Client"
        ? "bg-sky-100 text-sky-700 border-sky-200"
        : label === "Staff"
          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
          : label === "TPA"
            ? "bg-amber-100 text-amber-800 border-amber-200"
            : "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tone}`}>
      {label}
    </span>
  );
}

export default function AuditLogPage() {
  const [items, setItems] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({ totalAll: 0, todayCount: 0 });
  const [showFilters, setShowFilters] = useState(true);
  const [selected, setSelected] = useState<ActivityLogItem | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activityType, setActivityType] = useState("");
  const [userRole, setUserRole] = useState("");
  const [module, setModule] = useState("");
  const [projectIdInput, setProjectIdInput] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const activeFilters = useMemo(() => {
    const chips: string[] = [];
    if (search) chips.push(`Search: "${search}"`);
    if (activityType) chips.push(`Type: ${activityType.replace(/_/g, " ")}`);
    if (userRole) chips.push(`Role: ${USER_ROLE_OPTIONS.find((r) => r.value === userRole)?.label}`);
    if (module) chips.push(`Module: ${module}`);
    if (projectIdInput) chips.push(`Project: ${projectIdInput}`);
    if (fromDate) chips.push(`From: ${fromDate}`);
    if (toDate) chips.push(`To: ${toDate}`);
    return chips;
  }, [search, activityType, userRole, module, projectIdInput, fromDate, toDate]);

  const buildQuery = useCallback((): ActivityLogQuery => {
    const q: ActivityLogQuery = { page, limit: PAGE_SIZE };
    if (search.trim()) q.search = search.trim();
    if (activityType) q.activityType = activityType;
    if (userRole) q.userRole = userRole;
    if (module) q.module = module;
    if (projectIdInput.trim() && /^\d+$/.test(projectIdInput.trim())) {
      q.projectId = Number(projectIdInput.trim());
    }
    if (fromDate) q.from = new Date(`${fromDate}T00:00:00`).toISOString();
    if (toDate) q.to = new Date(`${toDate}T23:59:59`).toISOString();
    return q;
  }, [page, search, activityType, userRole, module, projectIdInput, fromDate, toDate]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchActivityLogs(buildQuery());
      setItems(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setSummary(response.summary);
    } catch (err) {
      toast({
        title: "Unable to load audit logs",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    void load();
  }, [load]);

  const applyFilters = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setActivityType("");
    setUserRole("");
    setModule("");
    setProjectIdInput("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const kpiCards = [
    {
      label: "Total events",
      value: summary.totalAll,
      icon: ScrollText,
      color: "#1F7A63",
    },
    {
      label: "Today's activity",
      value: summary.todayCount,
      icon: Activity,
      color: "#3B82F6",
    },
    {
      label: "Matching filters",
      value: total,
      icon: Filter,
      color: "#7C3AED",
    },
  ];

  return (
    <div className="space-y-5 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Audit Log</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Track logins, form saves, project actions, and admin activity in one place.
          </p>
        </div>
        <button
          type="button"
          className="action-btn"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </button>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            className="kpi-card flex items-center gap-4"
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ background: `${card.color}14` }}
            >
              <card.icon className="h-5 w-5" style={{ color: card.color }} />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {card.label}
              </p>
              <p className="text-2xl font-semibold tabular-nums text-foreground">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="table-card overflow-hidden"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
          <button
            type="button"
            className="action-btn"
            onClick={() => setShowFilters((v) => !v)}
          >
            <Filter className="h-3.5 w-3.5" />
            {showFilters ? "Hide filters" : "Show filters"}
          </button>
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activeFilters.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-medium text-primary"
                >
                  {chip}
                </span>
              ))}
              <button type="button" onClick={clearFilters} className="text-[11px] text-muted-foreground hover:text-foreground">
                Clear all
              </button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-b border-border/60"
            >
              <div className="grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-4">
                <label className="block">
                  <span className="detail-label">Search</span>
                  <div className="relative mt-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      className="filter-input w-full pl-9"
                      placeholder="Title or description…"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="detail-label">Activity type</span>
                  <select
                    className="filter-input mt-1 w-full"
                    value={activityType}
                    onChange={(e) => {
                      setActivityType(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All activities</option>
                    {ACTIVITY_TYPE_GROUPS.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="detail-label">User role</span>
                  <select
                    className="filter-input mt-1 w-full"
                    value={userRole}
                    onChange={(e) => {
                      setUserRole(e.target.value);
                      setPage(1);
                    }}
                  >
                    {USER_ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value || "all"} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="detail-label">Module</span>
                  <select
                    className="filter-input mt-1 w-full"
                    value={module}
                    onChange={(e) => {
                      setModule(e.target.value);
                      setPage(1);
                    }}
                  >
                    {MODULE_OPTIONS.map((opt) => (
                      <option key={opt.value || "all"} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="detail-label">Project ID</span>
                  <input
                    className="filter-input mt-1 w-full"
                    placeholder="e.g. 10"
                    value={projectIdInput}
                    onChange={(e) => setProjectIdInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                  />
                </label>

                <label className="block">
                  <span className="detail-label">From date</span>
                  <input
                    type="date"
                    className="filter-input mt-1 w-full"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setPage(1);
                    }}
                  />
                </label>

                <label className="block">
                  <span className="detail-label">To date</span>
                  <input
                    type="date"
                    className="filter-input mt-1 w-full"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setPage(1);
                    }}
                  />
                </label>

                <div className="flex items-end gap-2">
                  <button type="button" className="action-btn-primary action-btn flex-1" onClick={applyFilters}>
                    Apply
                  </button>
                  <button type="button" className="action-btn flex-1" onClick={clearFilters}>
                    <X className="h-3.5 w-3.5" />
                    Clear
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & time</th>
                <th>Activity</th>
                <th>User</th>
                <th>Project</th>
                <th>Summary</th>
                <th className="text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-muted-foreground">
                    <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-primary" />
                    Loading audit trail…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-muted-foreground">
                    No activity found for the selected filters.
                  </td>
                </tr>
              ) : (
                items.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.25 }}
                  >
                    <td className="whitespace-nowrap text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 shrink-0 opacity-60" />
                        {formatDateTime(row.createdAt)}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: activityIconColor(row.activityType) }}
                        />
                        <span className="font-medium text-foreground">{row.activityTypeLabel}</span>
                      </div>
                      {row.module && (
                        <p className="mt-0.5 text-[10px] text-muted-foreground">{row.module}</p>
                      )}
                    </td>
                    <td>
                      <div className="flex items-start gap-2">
                        <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">
                            {row.userDisplayName ?? "System"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{row.userEmail ?? "—"}</p>
                          <div className="mt-1">
                            <RoleBadge label={row.userRoleLabel} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {row.projectLabel ? (
                        <div>
                          <p className="font-medium text-foreground">{row.projectLabel}</p>
                          {row.projectName && (
                            <p className="text-[10px] text-muted-foreground">{row.projectName}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="max-w-xs">
                      <p className="line-clamp-2 text-foreground">
                        {row.activityDescription ?? row.activityTitle}
                      </p>
                      {row.tabName && (
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {row.tabName}
                          {row.subtabName ? ` › ${row.subtabName}` : ""}
                        </p>
                      )}
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="action-btn ml-auto"
                        onClick={() => setSelected(row)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} · {total} result{total === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="action-btn"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              type="button"
              className="action-btn"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <AdminModal
        open={!!selected}
        title={selected?.activityTypeLabel ?? "Activity details"}
        onClose={() => setSelected(null)}
        maxWidthClass="max-w-2xl"
      >
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="detail-grid">
              <div>
                <p className="detail-label">When</p>
                <p className="detail-value">{formatDateTime(selected.createdAt)}</p>
              </div>
              <div>
                <p className="detail-label">User</p>
                <p className="detail-value">{selected.userDisplayName ?? "System"}</p>
                <p className="text-[11px] text-muted-foreground">{selected.userEmail ?? "—"}</p>
              </div>
              <div>
                <p className="detail-label">Role</p>
                <RoleBadge label={selected.userRoleLabel} />
              </div>
              <div>
                <p className="detail-label">Project</p>
                <p className="detail-value">
                  {selected.projectLabel ?? "—"}
                  {selected.projectName ? ` · ${selected.projectName}` : ""}
                </p>
              </div>
              {selected.tabName && (
                <div>
                  <p className="detail-label">Location</p>
                  <p className="detail-value">
                    {selected.tabName}
                    {selected.subtabName ? ` › ${selected.subtabName}` : ""}
                  </p>
                </div>
              )}
              {selected.documentName && (
                <div>
                  <p className="detail-label">Document</p>
                  <p className="detail-value">{selected.documentName}</p>
                </div>
              )}
              {selected.submissionCount != null && (
                <div>
                  <p className="detail-label">Submission #</p>
                  <p className="detail-value">{selected.submissionCount}</p>
                </div>
              )}
              {selected.ipAddress && (
                <div>
                  <p className="detail-label">IP address</p>
                  <p className="detail-value font-mono text-[11px]">{selected.ipAddress}</p>
                </div>
              )}
            </div>

            <div className="mt-4 rounded-xl border bg-emerald-50/50 p-3">
              <p className="detail-label">Description</p>
              <p className="detail-value">{selected.activityDescription ?? selected.activityTitle}</p>
            </div>

            <JsonBlock data={selected.oldValue} title="Previous values" />
            <JsonBlock data={selected.newValue} title="New values" />

            {selected.userAgent && (
              <div className="mt-3">
                <p className="detail-label">User agent</p>
                <p className="break-all text-[11px] text-muted-foreground">{selected.userAgent}</p>
              </div>
            )}
          </motion.div>
        )}
      </AdminModal>
    </div>
  );
}
