import { useEffect, useMemo, useState } from "react";
import { Download, Filter, Plus, Search, X } from "lucide-react";
import {
  createAdminEvent,
  deleteAdminEvent,
  getAdminEventDetails,
  getAdminEvents,
  updateAdminEvent,
  type AdminEventItem,
  type AdminEventStatus,
} from "../lib/adminApi";
import { toast } from "../components/ui/use-toast";
import TableRowActions from "../components/TableRowActions";

type Mode = "create" | "edit" | "view";

type EventForm = {
  title: string;
  description: string;
  location: string;
  startDateTime: string;
  endDateTime: string;
  status: AdminEventStatus;
};

const defaultForm: EventForm = {
  title: "",
  description: "",
  location: "",
  startDateTime: "",
  endDateTime: "",
  status: "draft",
};

const toDateTimeInput = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

const EventsPage = () => {
  const [items, setItems] = useState<AdminEventItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusInput, setStatusInput] = useState<AdminEventStatus | "">("");
  const [status, setStatus] = useState<AdminEventStatus | "">("");
  const [dateFromInput, setDateFromInput] = useState("");
  const [dateToInput, setDateToInput] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  const [modalMode, setModalMode] = useState<Mode | null>(null);
  const [activeEvent, setActiveEvent] = useState<AdminEventItem | null>(null);
  const [form, setForm] = useState<EventForm>(defaultForm);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await getAdminEvents({
        page,
        limit,
        search,
        status,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
      });
      setItems(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      toast({
        title: "Unable to load events",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, [page, limit, search, status, dateFrom, dateTo, sortBy, sortOrder]);

  const applyFilters = () => {
    setPage(1);
    setSearch(searchInput.trim());
    setStatus(statusInput);
    setDateFrom(dateFromInput);
    setDateTo(dateToInput);
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatusInput("");
    setStatus("");
    setDateFromInput("");
    setDateToInput("");
    setDateFrom("");
    setDateTo("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const openCreate = () => {
    setModalMode("create");
    setActiveEvent(null);
    setForm(defaultForm);
    setBannerFile(null);
  };

  const openView = async (id: string) => {
    try {
      const details = await getAdminEventDetails(id);
      setActiveEvent(details);
      setModalMode("view");
    } catch (err) {
      toast({
        title: "Unable to load event details",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEdit = async (id: string) => {
    try {
      const details = await getAdminEventDetails(id);
      setActiveEvent(details);
      setForm({
        title: details.title ?? "",
        description: details.description ?? "",
        location: details.location ?? "",
        startDateTime: toDateTimeInput(details.startDateTime),
        endDateTime: toDateTimeInput(details.endDateTime),
        status: details.status ?? "draft",
      });
      setBannerFile(null);
      setModalMode("edit");
    } catch (err) {
      toast({
        title: "Unable to load event details",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveEvent(null);
    setForm(defaultForm);
    setBannerFile(null);
  };

  const validateForm = () => {
    if (!form.title.trim() || !form.location.trim() || !form.startDateTime || !form.endDateTime) {
      toast({
        title: "Missing required fields",
        description: "Title, start date time, end date time and location are required.",
        variant: "destructive",
      });
      return false;
    }
    if (new Date(form.endDateTime).getTime() <= new Date(form.startDateTime).getTime()) {
      toast({
        title: "Invalid date range",
        description: "End date time must be after start date time.",
        variant: "destructive",
      });
      return false;
    }
    if (bannerFile) {
      const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(bannerFile.type);
      if (!isValidType) {
        toast({
          title: "Invalid banner format",
          description: "Banner must be jpeg, png or webp.",
          variant: "destructive",
        });
        return false;
      }
      if (bannerFile.size > 5 * 1024 * 1024) {
        toast({
          title: "Banner too large",
          description: "Banner max size is 5 MB.",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const buildEventFormData = () => {
    const payload = new FormData();
    payload.append("title", form.title.trim());
    payload.append("description", form.description.trim());
    payload.append("location", form.location.trim());
    payload.append("startDateTime", form.startDateTime);
    payload.append("endDateTime", form.endDateTime);
    payload.append("status", form.status);
    if (bannerFile) {
      payload.append("banner", bannerFile);
    }
    return payload;
  };

  const submitEvent = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = buildEventFormData();
      if (modalMode === "create") {
        await createAdminEvent(payload);
        toast({ title: "Event created successfully" });
      } else if (modalMode === "edit" && activeEvent?.id) {
        await updateAdminEvent(activeEvent.id, payload);
        toast({ title: "Event updated successfully" });
      }
      closeModal();
      await loadEvents();
    } catch (err) {
      toast({
        title: "Unable to save event",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteAdminEvent(id);
      toast({ title: "Event deleted successfully" });
      await loadEvents();
    } catch (err) {
      toast({
        title: "Unable to delete event",
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
    link.download = "events-list.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const modalTitle = useMemo(() => {
    if (modalMode === "create") return "Create Event";
    if (modalMode === "edit") return "Edit Event";
    if (modalMode === "view") return "Event Details";
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
            <Plus className="w-3.5 h-3.5" /> Create Event
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
              <input className="filter-input w-full" placeholder="Search by title/location" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
              <select className="filter-input w-full" value={statusInput} onChange={(e) => setStatusInput(e.target.value as AdminEventStatus | "")}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
              </select>
              <input className="filter-input w-full" type="date" value={dateFromInput} onChange={(e) => setDateFromInput(e.target.value)} />
              <input className="filter-input w-full" type="date" value={dateToInput} onChange={(e) => setDateToInput(e.target.value)} />
              <select className="filter-input w-full" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="createdAt">Created date</option>
                <option value="startDateTime">Start date</option>
                <option value="endDateTime">End date</option>
                <option value="title">Title</option>
              </select>
              <select className="filter-input w-full" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}>
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
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
          <h3 className="text-sm font-semibold text-foreground">Events</h3>
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
                <th>Title</th>
                <th>Location</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!loading && items.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="text-xs space-y-0.5">
                      <p className="font-medium text-foreground">{row.title}</p>
                      <p className="text-muted-foreground line-clamp-2">{row.description || "-"}</p>
                    </div>
                  </td>
                  <td className="text-xs">{row.location}</td>
                  <td className="text-xs">
                    <p>{new Date(row.startDateTime).toLocaleString("en-IN")}</p>
                    <p className="text-muted-foreground">to {new Date(row.endDateTime).toLocaleString("en-IN")}</p>
                  </td>
                  <td>
                    <span className={`status-badge ${row.status === "active" ? "status-approved" : row.status === "inactive" ? "status-rejected" : "status-pending"}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>
                    <TableRowActions
                      actions={[
                        { label: "View Details", onClick: () => void openView(row.id), variant: "primary" },
                        { label: "Edit", onClick: () => void openEdit(row.id), variant: "success" },
                        {
                          label: deletingId === row.id ? "Removing..." : "Remove",
                          onClick: () => void handleDelete(row.id),
                          variant: "danger",
                          disabled: deletingId === row.id,
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">Loading...</td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">No events found</td>
                </tr>
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
          <div className="bg-card rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 bg-foreground rounded-t-xl">
              <h2 className="text-sm font-semibold text-card">{modalTitle}</h2>
              <button onClick={closeModal} className="text-card hover:opacity-80"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {modalMode === "view" && activeEvent && (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div><p className="text-muted-foreground">Title</p><p className="font-medium">{activeEvent.title}</p></div>
                  <div><p className="text-muted-foreground">Status</p><p className="font-medium">{activeEvent.status}</p></div>
                  <div><p className="text-muted-foreground">Location</p><p className="font-medium">{activeEvent.location}</p></div>
                  <div><p className="text-muted-foreground">Banner</p><p className="font-medium break-all">{activeEvent.bannerUrl || "-"}</p></div>
                  <div><p className="text-muted-foreground">Start</p><p className="font-medium">{new Date(activeEvent.startDateTime).toLocaleString("en-IN")}</p></div>
                  <div><p className="text-muted-foreground">End</p><p className="font-medium">{new Date(activeEvent.endDateTime).toLocaleString("en-IN")}</p></div>
                  <div className="col-span-2"><p className="text-muted-foreground">Description</p><p className="font-medium">{activeEvent.description || "-"}</p></div>
                </div>
              )}

              {(modalMode === "create" || modalMode === "edit") && (
                <>
                  <input className="filter-input w-full" placeholder="Title*" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                  <textarea className="filter-input w-full min-h-[90px]" placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                  <input className="filter-input w-full" placeholder="Location*" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-3">
                    <input className="filter-input w-full" type="datetime-local" value={form.startDateTime} onChange={(e) => setForm((p) => ({ ...p, startDateTime: e.target.value }))} />
                    <input className="filter-input w-full" type="datetime-local" value={form.endDateTime} onChange={(e) => setForm((p) => ({ ...p, endDateTime: e.target.value }))} />
                  </div>
                  <select className="filter-input w-full" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as AdminEventStatus }))}>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <input className="filter-input w-full" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)} />

                  <div className="flex justify-end gap-2">
                    <button className="action-btn action-btn-outline" onClick={closeModal}>Cancel</button>
                    <button className="action-btn action-btn-primary" onClick={() => void submitEvent()} disabled={saving}>
                      {saving ? "Saving..." : modalMode === "create" ? "Create Event" : "Update Event"}
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

export default EventsPage;
