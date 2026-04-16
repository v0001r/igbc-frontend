import { useEffect, useMemo, useState } from "react";
import { Download, Filter, Plus, Search, X } from "lucide-react";
import {
  createAdminSupport,
  deleteAdminSupport,
  getAdminSupportDetails,
  getAdminSupportList,
  updateAdminSupport,
  type AdminSupportItem,
  type AdminSupportStatus,
} from "../lib/adminApi";
import { toast } from "../components/ui/use-toast";
import TableRowActions from "../components/TableRowActions";

type Mode = "create" | "edit" | "view";

type SupportForm = {
  name: string;
  designation: string;
  department: string;
  phone: string;
  email: string;
  status: AdminSupportStatus;
};

const defaultForm: SupportForm = {
  name: "",
  designation: "",
  department: "",
  phone: "",
  email: "",
  status: "active",
};

const SupportAssistancePage = () => {
  const [items, setItems] = useState<AdminSupportItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [departmentInput, setDepartmentInput] = useState("");
  const [department, setDepartment] = useState("");
  const [statusInput, setStatusInput] = useState<AdminSupportStatus | "">("");
  const [status, setStatus] = useState<AdminSupportStatus | "">("");
  const [sortBy, setSortBy] = useState<"name" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [showFilters, setShowFilters] = useState(false);

  const [modalMode, setModalMode] = useState<Mode | null>(null);
  const [activeItem, setActiveItem] = useState<AdminSupportItem | null>(null);
  const [form, setForm] = useState<SupportForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await getAdminSupportList({
        page,
        limit,
        search,
        department,
        status,
        sortBy,
        sortOrder,
      });
      setItems(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      toast({
        title: "Unable to load support entries",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [page, limit, search, department, status, sortBy, sortOrder]);

  const applyFilters = () => {
    setPage(1);
    setSearch(searchInput.trim());
    setDepartment(departmentInput.trim());
    setStatus(statusInput);
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setDepartmentInput("");
    setDepartment("");
    setStatusInput("");
    setStatus("");
    setSortBy("createdAt");
    setSortOrder("DESC");
    setPage(1);
  };

  const openCreate = () => {
    setForm(defaultForm);
    setActiveItem(null);
    setModalMode("create");
  };

  const openView = async (id: string) => {
    try {
      const details = await getAdminSupportDetails(id);
      setActiveItem(details);
      setModalMode("view");
    } catch (err) {
      toast({
        title: "Unable to load details",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEdit = async (id: string) => {
    try {
      const details = await getAdminSupportDetails(id);
      setActiveItem(details);
      setForm({
        name: details.name ?? "",
        designation: details.designation ?? "",
        department: details.department ?? "",
        phone: details.phone ?? "",
        email: details.email ?? "",
        status: details.status ?? "active",
      });
      setModalMode("edit");
    } catch (err) {
      toast({
        title: "Unable to load details",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveItem(null);
    setForm(defaultForm);
  };

  const validate = () => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      toast({ title: "Invalid name", description: "Name is required (min 2 chars).", variant: "destructive" });
      return false;
    }
    if (!form.designation.trim() || !form.department.trim()) {
      toast({ title: "Missing fields", description: "Designation and department are required.", variant: "destructive" });
      return false;
    }
    if (!/^\d{10,15}$/.test(form.phone)) {
      toast({ title: "Invalid phone", description: "Phone must be numeric and 10-15 digits.", variant: "destructive" });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (modalMode === "create") {
        await createAdminSupport(form);
        toast({ title: "Support entry created" });
      } else if (modalMode === "edit" && activeItem?.id) {
        await updateAdminSupport(activeItem.id, form);
        toast({ title: "Support entry updated" });
      }
      closeModal();
      await load();
    } catch (err) {
      toast({
        title: "Unable to save entry",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteAdminSupport(id);
      toast({ title: "Support entry deleted" });
      await load();
    } catch (err) {
      toast({
        title: "Unable to delete entry",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const exportList = () => {
    if (!items.length) return;
    const headers = Object.keys(items[0] as Record<string, unknown>);
    const escapeCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const lines = [
      headers.join(","),
      ...items.map((row) =>
        headers.map((key) => escapeCell((row as Record<string, unknown>)[key])).join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "support-assistance-list.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const modalTitle = useMemo(() => {
    if (modalMode === "create") return "Create Support Entry";
    if (modalMode === "edit") return "Edit Support Entry";
    if (modalMode === "view") return "Support Details";
    return "";
  }, [modalMode]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <button className="action-btn action-btn-outline" onClick={exportList}>
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button className="action-btn action-btn-success" onClick={openCreate}>
            <Plus className="w-3.5 h-3.5" /> Add Support
          </button>
          <button className="action-btn action-btn-primary" onClick={() => setShowFilters(true)}>
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-[120] flex items-start justify-end bg-foreground/10 px-6 pt-24" onClick={() => setShowFilters(false)}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 gap-3 p-4">
              <input className="filter-input w-full" placeholder="Search name/email/phone/department" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
              <input className="filter-input w-full" placeholder="Department" value={departmentInput} onChange={(e) => setDepartmentInput(e.target.value)} />
              <select className="filter-input w-full" value={statusInput} onChange={(e) => setStatusInput(e.target.value as AdminSupportStatus | "")}>
                <option value="">All status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select className="filter-input w-full" value={sortBy} onChange={(e) => setSortBy(e.target.value as "name" | "createdAt")}>
                <option value="createdAt">Sort by created date</option>
                <option value="name">Sort by name</option>
              </select>
              <select className="filter-input w-full" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as "ASC" | "DESC")}>
                <option value="DESC">DESC</option>
                <option value="ASC">ASC</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 border-t border-border bg-background/60 px-4 py-3">
              <button className="action-btn action-btn-outline" onClick={resetFilters}>Reset</button>
              <button className="action-btn action-btn-primary" onClick={() => { applyFilters(); setShowFilters(false); }}>Apply</button>
            </div>
          </div>
        </div>
      )}

      <div className="kpi-card p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">Support / Assistance</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="filter-input w-64 py-1.5 pl-9 text-xs"
              name="search"
              aria-label="Search"
              title="Search"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
                setSearchInput(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Department</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                items.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="text-xs space-y-0.5">
                        <p className="font-medium text-foreground">{row.name}</p>
                        <p className="text-muted-foreground">{row.designation}</p>
                      </div>
                    </td>
                    <td className="text-xs">
                      <p>{row.email}</p>
                      <p className="text-muted-foreground">{row.phone}</p>
                    </td>
                    <td className="text-xs">{row.department}</td>
                    <td>
                      <span className={`status-badge ${row.status === "active" ? "status-approved" : "status-rejected"}`}>{row.status}</span>
                    </td>
                    <td>
                      <TableRowActions
                        actions={[
                          { label: "View Details", onClick: () => void openView(row.id), variant: "primary" },
                          { label: "Edit", onClick: () => void openEdit(row.id), variant: "success" },
                          {
                            label: deletingId === row.id ? "Removing..." : "Remove",
                            onClick: () => void remove(row.id),
                            variant: "danger",
                            disabled: deletingId === row.id,
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              {loading && (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Loading...</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No support entries found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border px-5 py-3">
          <span className="text-xs text-muted-foreground">Showing {items.length} of {total} records</span>
          <div className="flex items-center gap-2">
            <button className="action-btn action-btn-outline disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
            <span className="text-xs text-muted-foreground">Page {page} / {totalPages || 1}</span>
            <button className="action-btn action-btn-outline disabled:opacity-40" disabled={page >= (totalPages || 1)} onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))}>Next</button>
          </div>
        </div>
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40" onClick={closeModal}>
          <div className="bg-card rounded-xl w-full max-w-xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 bg-foreground rounded-t-xl">
              <h2 className="text-sm font-semibold text-card">{modalTitle}</h2>
              <button onClick={closeModal} className="text-card hover:opacity-80"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-3">
              {modalMode === "view" && activeItem && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><p className="text-muted-foreground">Name</p><p className="font-medium">{activeItem.name}</p></div>
                  <div><p className="text-muted-foreground">Designation</p><p className="font-medium">{activeItem.designation}</p></div>
                  <div><p className="text-muted-foreground">Department</p><p className="font-medium">{activeItem.department}</p></div>
                  <div><p className="text-muted-foreground">Status</p><p className="font-medium">{activeItem.status}</p></div>
                  <div><p className="text-muted-foreground">Email</p><p className="font-medium">{activeItem.email}</p></div>
                  <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{activeItem.phone}</p></div>
                </div>
              )}

              {(modalMode === "create" || modalMode === "edit") && (
                <>
                  <input className="filter-input w-full" placeholder="Name*" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                  <input className="filter-input w-full" placeholder="Designation*" value={form.designation} onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))} />
                  <input className="filter-input w-full" placeholder="Department*" value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} />
                  <input className="filter-input w-full" placeholder="Phone*" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))} />
                  <input className="filter-input w-full" placeholder="Email*" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                  <select className="filter-input w-full" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as AdminSupportStatus }))}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <div className="flex justify-end gap-2">
                    <button className="action-btn action-btn-outline" onClick={closeModal}>Cancel</button>
                    <button className="action-btn action-btn-primary" onClick={() => void submit()} disabled={saving}>
                      {saving ? "Saving..." : modalMode === "create" ? "Create" : "Update"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportAssistancePage;
