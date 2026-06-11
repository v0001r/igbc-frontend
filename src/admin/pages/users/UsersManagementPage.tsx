import { useEffect, useMemo, useState } from "react";
import { Download, Filter, Loader2, Plus, Search } from "lucide-react";
import AdminModal from "../../components/AdminModal";
import RatingTypeMultiSelect from "../../components/RatingTypeMultiSelect";
import TableRowActions from "../../components/TableRowActions";
import { toast } from "../../components/ui/use-toast";
import {
  bulkUpdateAdminUserStatus,
  createAdminUser,
  exportAdminUsers,
  fetchRatingTypes,
  getAdminUserById,
  getAdminUsers,
  updateAdminUser,
  updateAdminUserStatus,
  type AdminUserDetail,
  type AdminUserListItem,
  type AdminUserRole,
  type RatingTypeOption,
} from "../../lib/usersApi";

type Props = {
  roleFilter: AdminUserRole;
  title: string;
};

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  address: string;
  ratingTypeIds: number[];
  status: "active" | "inactive";
  isLead: boolean;
};

const defaultForm = (): FormState => ({
  fullName: "",
  email: "",
  phone: "",
  organization: "",
  address: "",
  ratingTypeIds: [],
  status: "active",
  isLead: false,
});

const isStaffPage = (role: AdminUserRole) => role === "IGBC_STAFF";

export default function UsersManagementPage({ roleFilter, title }: Props) {
  const [items, setItems] = useState<AdminUserListItem[]>([]);
  const [ratingTypes, setRatingTypes] = useState<RatingTypeOption[]>([]);
  const [ratingTypesLoading, setRatingTypesLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [statusInput, setStatusInput] = useState<"" | "active" | "inactive">("");
  const [ratingTypeInput, setRatingTypeInput] = useState<number | "">("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"" | "active" | "inactive">("");
  const [ratingTypeId, setRatingTypeId] = useState<number | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  const [modal, setModal] = useState<"create" | "edit" | "view" | null>(null);
  const [activeUser, setActiveUser] = useState<AdminUserDetail | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      setRatingTypesLoading(true);
      try {
        setRatingTypes(await fetchRatingTypes());
      } catch (err) {
        toast({
          title: "Failed to load rating types",
          description: err instanceof Error ? err.message : "Please try again.",
          variant: "destructive",
        });
      } finally {
        setRatingTypesLoading(false);
      }
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const response = await getAdminUsers({
        page,
        limit,
        role: roleFilter,
        name,
        email,
        phone,
        status,
        ratingTypeId,
        sortBy: "createdAt",
        sortOrder: "DESC",
      });
      setItems(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      toast({
        title: "Unable to load users",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [page, limit, name, email, phone, status, ratingTypeId, roleFilter]);

  const applyFilters = () => {
    setPage(1);
    setName(nameInput.trim());
    setEmail(emailInput.trim());
    setPhone(phoneInput.trim());
    setStatus(statusInput);
    setRatingTypeId(ratingTypeInput === "" ? undefined : ratingTypeInput);
  };

  const resetFilters = () => {
    setNameInput("");
    setEmailInput("");
    setPhoneInput("");
    setStatusInput("");
    setRatingTypeInput("");
    setName("");
    setEmail("");
    setPhone("");
    setStatus("");
    setRatingTypeId(undefined);
    setPage(1);
  };

  const allSelected = useMemo(
    () => items.length > 0 && items.every((i) => selected.has(i.id)),
    [items, selected],
  );

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i.id)));
  };

  const openCreate = () => {
    setForm(defaultForm());
    setActiveUser(null);
    setModal("create");
  };

  const openView = async (id: string) => {
    try {
      setActiveUser(await getAdminUserById(id));
      setModal("view");
    } catch (err) {
      toast({ title: "Unable to load user", description: String(err), variant: "destructive" });
    }
  };

  const openEdit = async (id: string) => {
    try {
      const user = await getAdminUserById(id);
      setActiveUser(user);
      setForm({
        fullName: user.displayName,
        email: user.email,
        phone: user.phone ?? "",
        organization: user.organization ?? "",
        address: user.address ?? "",
        ratingTypeIds: user.assignedRatingTypes.map((r) => r.id),
        status: user.status,
        isLead: user.isLead,
      });
      setModal("edit");
    } catch (err) {
      toast({ title: "Unable to load user", description: String(err), variant: "destructive" });
    }
  };

  const saveUser = async () => {
    if (!form.fullName || !form.email || !form.phone || !form.organization) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    if (!form.ratingTypeIds.length) {
      toast({ title: "Select at least one rating type", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        organization: form.organization,
        address: form.address,
        ratingTypeIds: form.ratingTypeIds,
        status: form.status,
        role: roleFilter,
        ...(isStaffPage(roleFilter) ? { isLead: form.isLead } : {}),
      };
      if (modal === "create") {
        await createAdminUser(payload);
        toast({ title: "User created successfully" });
      } else if (modal === "edit" && activeUser) {
        await updateAdminUser(activeUser.id, payload);
        toast({ title: "User updated successfully" });
      }
      setModal(null);
      void load();
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (id: string, next: "active" | "inactive") => {
    try {
      await updateAdminUserStatus(id, next);
      toast({ title: `User ${next === "active" ? "activated" : "deactivated"}` });
      void load();
    } catch (err) {
      toast({ title: "Status update failed", description: String(err), variant: "destructive" });
    }
  };

  const handleBulkStatus = async (next: "active" | "inactive") => {
    if (!selected.size) return;
    try {
      await bulkUpdateAdminUserStatus([...selected], next);
      toast({ title: `Bulk ${next} completed` });
      setSelected(new Set());
      void load();
    } catch (err) {
      toast({ title: "Bulk update failed", description: String(err), variant: "destructive" });
    }
  };

  const statusBadge = (value: string) => {
    const cls =
      value === "active"
        ? "status-badge status-approved"
        : value === "inactive"
          ? "status-badge status-rejected"
          : "status-badge status-pending";
    return <span className={cls}>{value}</span>;
  };

  const closeModal = () => setModal(null);

  return (
    <div className="space-y-4">
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-md">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{total} users</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="action-btn action-btn-outline" onClick={() => setShowFilters(true)}>
            <Filter className="h-3.5 w-3.5" /> Filters
          </button>
          <button
            type="button"
            className="action-btn action-btn-outline"
            onClick={() =>
              void exportAdminUsers({
                role: roleFilter,
                name,
                email,
                phone,
                status,
                ratingTypeId,
              })
            }
          >
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button type="button" className="action-btn action-btn-primary" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" /> Add User
          </button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap gap-2 rounded-xl border bg-white/80 p-3">
          <span className="self-center text-xs text-muted-foreground">{selected.size} selected</span>
          <button type="button" className="action-btn action-btn-outline text-xs" onClick={() => void handleBulkStatus("active")}>
            Activate
          </button>
          <button type="button" className="action-btn action-btn-outline text-xs" onClick={() => void handleBulkStatus("inactive")}>
            Deactivate
          </button>
        </div>
      )}

      <div className="table-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading users…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th className="w-10">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                  </th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Organization</th>
                  {isStaffPage(roleFilter) && <th>Lead</th>}
                  <th>Assigned Rating Types</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={isStaffPage(roleFilter) ? 10 : 9} className="py-12 text-center text-sm text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.has(item.id)}
                          onChange={() => {
                            const next = new Set(selected);
                            if (next.has(item.id)) next.delete(item.id);
                            else next.add(item.id);
                            setSelected(next);
                          }}
                        />
                      </td>
                      <td className="font-medium">{item.displayName}</td>
                      <td>{item.phone ?? "—"}</td>
                      <td>{item.email}</td>
                      <td>{item.organization ?? "—"}</td>
                      {isStaffPage(roleFilter) && (
                        <td>
                          {item.isLead ? (
                            <span className="status-badge status-approved">Lead</span>
                          ) : (
                            "—"
                          )}
                        </td>
                      )}
                      <td className="max-w-[220px] truncate" title={item.assignedRatingTypes.map((r) => r.ratingName).join(", ")}>
                        {item.assignedRatingTypes.map((r) => r.ratingName).join(", ") || "—"}
                      </td>
                      <td>{statusBadge(item.status)}</td>
                      <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                      <td>
                        <TableRowActions
                          actions={[
                            { label: "View", onClick: () => void openView(item.id), variant: "outline" },
                            { label: "Edit", onClick: () => void openEdit(item.id), variant: "primary" },
                            {
                              label: item.status === "active" ? "Deactivate" : "Activate",
                              onClick: () =>
                                void handleStatus(item.id, item.status === "active" ? "inactive" : "active"),
                              variant: "outline",
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button type="button" className="action-btn action-btn-outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <button type="button" className="action-btn action-btn-outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>

      <AdminModal open={showFilters} title="Search & Filters" onClose={() => setShowFilters(false)}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-muted-foreground">Name</label>
            <input className="filter-input mt-1 w-full" placeholder="Name" value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Email</label>
            <input className="filter-input mt-1 w-full" placeholder="Email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Phone</label>
            <input className="filter-input mt-1 w-full" placeholder="Phone" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Status</label>
            <select className="filter-input mt-1 w-full" value={statusInput} onChange={(e) => setStatusInput(e.target.value as typeof statusInput)}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground">Rating Type</label>
            <select
              className="filter-input mt-1 w-full"
              value={ratingTypeInput}
              onChange={(e) => setRatingTypeInput(e.target.value ? Number(e.target.value) : "")}
              disabled={ratingTypesLoading}
            >
              <option value="">All rating types</option>
              {ratingTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>{rt.ratingName}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="action-btn action-btn-outline" onClick={resetFilters}>Reset</button>
          <button
            type="button"
            className="action-btn action-btn-primary"
            onClick={() => {
              applyFilters();
              setShowFilters(false);
            }}
          >
            <Search className="h-3.5 w-3.5" /> Search
          </button>
        </div>
      </AdminModal>

      <AdminModal
        open={modal !== null}
        title={modal === "create" ? "Create User" : modal === "edit" ? "Edit User" : "User Details"}
        onClose={closeModal}
        maxWidthClass="max-w-xl"
      >
        {modal === "view" && activeUser ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-muted-foreground">Name</dt><dd className="font-medium">{activeUser.displayName}</dd></div>
            <div><dt className="text-muted-foreground">Email</dt><dd className="font-medium">{activeUser.email}</dd></div>
            <div><dt className="text-muted-foreground">Phone</dt><dd className="font-medium">{activeUser.phone ?? "—"}</dd></div>
            <div><dt className="text-muted-foreground">Organization</dt><dd className="font-medium">{activeUser.organization ?? "—"}</dd></div>
            <div className="sm:col-span-2"><dt className="text-muted-foreground">Address</dt><dd className="font-medium">{activeUser.address ?? "—"}</dd></div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Rating Types</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {activeUser.assignedRatingTypes.map((r) => (
                  <span key={r.id} className="rounded-md bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                    {r.ratingName}
                  </span>
                ))}
              </dd>
            </div>
            {isStaffPage(roleFilter) && (
              <div>
                <dt className="text-muted-foreground">Lead</dt>
                <dd className="font-medium">{activeUser.isLead ? "Yes" : "No"}</dd>
              </div>
            )}
            <div><dt className="text-muted-foreground">Status</dt><dd>{statusBadge(activeUser.status)}</dd></div>
          </dl>
        ) : modal ? (
          <div className="space-y-3">
            {[
              ["fullName", "Full Name *", "text"],
              ["email", "Email *", "email"],
              ["phone", "Phone *", "tel"],
              ["organization", "Organization *", "text"],
              ["address", "Address", "text"],
            ].map(([key, label, type]) => (
              <div key={key}>
                <label className="text-xs text-muted-foreground">{label}</label>
                <input
                  type={type}
                  className="filter-input mt-1 w-full"
                  value={form[key as keyof FormState] as string}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
            <RatingTypeMultiSelect
              required
              options={ratingTypes}
              value={form.ratingTypeIds}
              onChange={(ratingTypeIds) => setForm({ ...form, ratingTypeIds })}
              loading={ratingTypesLoading}
            />
            {isStaffPage(roleFilter) && (
              <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.isLead}
                  onChange={(e) => setForm({ ...form, isLead: e.target.checked })}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                Staff is a Lead
              </label>
            )}
            <div>
              <label className="text-xs text-muted-foreground">Status</label>
              <select className="filter-input mt-1 w-full" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as FormState["status"] })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button type="button" className="action-btn action-btn-primary w-full" disabled={saving} onClick={() => void saveUser()}>
              {saving ? "Saving…" : modal === "create" ? "Create User" : "Save Changes"}
            </button>
          </div>
        ) : null}
      </AdminModal>
    </div>
  );
}
