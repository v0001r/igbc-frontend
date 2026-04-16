import { useState } from "react";
import MembershipDetails from "../components/MembershipDetails";
import { Download, Filter, RotateCcw, Search } from "lucide-react";
import { useEffect } from "react";
import {
  approveMembershipPayment,
  getAdminMembershipApplicationDetails,
  getAdminMembershipTabList,
  type AdminMembershipItem,
} from "../lib/adminApi";
import TableRowActions from "../components/TableRowActions";

const MembershipsPage = () => {
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [tab, setTab] = useState("manage");
  const [items, setItems] = useState<AdminMembershipItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [organizationInput, setOrganizationInput] = useState("");
  const [membershipTypeInput, setMembershipTypeInput] = useState("");
  const [verificationStatusInput, setVerificationStatusInput] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    name: "",
    email: "",
    organization: "",
    membershipType: "",
    verificationStatus: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const tabs = [
    { key: "manage", label: "Manage Membership" },
    { key: "saved", label: "Saved Membership" },
    { key: "certificates", label: "Manage Certificates" },
    { key: "rejoin", label: "Rejoin Listing" },
  ];

  const resolveTabApi = () => {
    if (tab === "saved") return "saved";
    if (tab === "certificates") return "manage-certificate";
    if (tab === "rejoin") return null;
    return "manage-membership";
  };

  useEffect(() => {
    const load = async () => {
      const tabApi = resolveTabApi();
      if (!tabApi) {
        setItems([]);
        setTotal(0);
        setTotalPages(1);
        setLoading(false);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await getAdminMembershipTabList({
          tab: tabApi,
          page,
          limit,
          search,
          name: appliedFilters.name,
          email: appliedFilters.email,
          organization: appliedFilters.organization,
          membershipType: appliedFilters.membershipType,
          verificationStatus: appliedFilters.verificationStatus,
        });
        setItems(response.items);
        setTotal(response.total);
        setTotalPages(response.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load memberships");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [appliedFilters.email, appliedFilters.membershipType, appliedFilters.name, appliedFilters.organization, appliedFilters.verificationStatus, limit, page, search, tab]);

  const applySearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
    setAppliedFilters({
      name: nameInput.trim(),
      email: emailInput.trim(),
      organization: organizationInput.trim(),
      membershipType: membershipTypeInput.trim(),
      verificationStatus: verificationStatusInput.trim(),
    });
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setNameInput("");
    setEmailInput("");
    setOrganizationInput("");
    setMembershipTypeInput("");
    setVerificationStatusInput("");
    setAppliedFilters({
      name: "",
      email: "",
      organization: "",
      membershipType: "",
      verificationStatus: "",
    });
    setPage(1);
  };

  const handleApprovePayment = async (applicationId: string) => {
    setApprovingId(applicationId);
    setError(null);
    try {
      const tabApi = resolveTabApi();
      if (!tabApi) {
        return;
      }
      await approveMembershipPayment(applicationId);
      const response = await getAdminMembershipTabList({
        tab: tabApi,
        page,
        limit,
        search,
        name: appliedFilters.name,
        email: appliedFilters.email,
        organization: appliedFilters.organization,
        membershipType: appliedFilters.membershipType,
        verificationStatus: appliedFilters.verificationStatus,
      });
      setItems(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to approve membership payment");
    } finally {
      setApprovingId(null);
    }
  };

  const handleViewDetails = async (row: AdminMembershipItem) => {
    setDetailLoading(true);
    setError(null);
    try {
      const details = await getAdminMembershipApplicationDetails(row.applicationId);
      setSelectedMember(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load membership details");
    } finally {
      setDetailLoading(false);
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
    link.download = "membership-list.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: "sno", label: "SNO" },
    {
      key: "details",
      label: "Details",
      render: (_: any, row: any) => (
        <div className="text-xs space-y-0.5">
          <p className="font-medium text-foreground">{row.membershipType}</p>
          <p className="text-muted-foreground">User ID: {row.userId}</p>
          <p className="text-muted-foreground">Membership ID: {row.membershipId ?? "-"}</p>
        </div>
      ),
    },
    {
      key: "membershipInfo",
      label: "Membership Info",
      render: (_: any, row: any) => (
        <div className="text-xs space-y-0.5">
          <p className="text-muted-foreground">Type: {row.membershipType}</p>
          <p className="text-muted-foreground">Category: <span className="font-medium text-foreground">{row.membershipCategory}</span></p>
          <p className="text-muted-foreground">Plan: {row.membershipPlan || "-"}</p>
        </div>
      ),
    },
    {
      key: "payment",
      label: "Payment Details",
      render: (_: any, row: any) => (
        <div className="text-xs space-y-0.5">
          <p className="text-muted-foreground">Payment: {row.paymentStatus}</p>
          <p className="text-muted-foreground">Approval: {row.paymentApprovalStatus ?? "-"}</p>
          <p className="font-semibold text-foreground">Amount: ₹{Number(row.membershipFee || 0).toLocaleString("en-IN")}</p>
        </div>
      ),
    },
    {
      key: "timestamps",
      label: "Timeline",
      render: (_: any, row: any) => (
        <div className="text-xs space-y-0.5 text-muted-foreground">
          <p>Created: {new Date(row.createdAt).toLocaleDateString("en-IN")}</p>
          <p>Updated: {new Date(row.updatedAt).toLocaleDateString("en-IN")}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val: string) => (
        <span
          className={`status-badge ${
            val === "paid" || val === "submitted"
              ? "status-approved"
              : val === "invoice_generated" || val === "draft"
                ? "status-pending"
                : "status-rejected"
          }`}
        >
          {val}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Action",
      render: (_: any, row: any) => {
        const actions = [
          { label: "View", onClick: () => void handleViewDetails(row), variant: "primary" as const },
          ...(tab === "manage" && row.actions?.approvePayment
            ? [{
                label: approvingId === row.applicationId ? "..." : "Approve Payment",
                onClick: () => void handleApprovePayment(row.applicationId),
                variant: "success" as const,
                disabled: approvingId === row.applicationId,
              }]
            : []),
        ];
        return <TableRowActions actions={actions} />;
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-6 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setPage(1);
              }}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportList} className="action-btn action-btn-outline">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="action-btn action-btn-primary"
          >
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="fixed inset-0 z-[120] flex items-start justify-end bg-foreground/10 px-6 pt-24" onClick={() => setShowFilters(false)}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="text-muted-foreground hover:text-foreground">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 p-4">
              <input className="filter-input w-full" placeholder="Name" value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
              <input className="filter-input w-full" placeholder="Email Address" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
              <input className="filter-input w-full" placeholder="Organisation" value={organizationInput} onChange={(e) => setOrganizationInput(e.target.value)} />
              <select className="filter-input w-full" value={membershipTypeInput} onChange={(e) => setMembershipTypeInput(e.target.value)}>
                <option value="">All Membership Types</option>
                <option value="individual">Individual</option>
                <option value="institutional">Institutional</option>
                <option value="professional">Professional</option>
                <option value="student">Student</option>
              </select>
              <select className="filter-input w-full" value={verificationStatusInput} onChange={(e) => setVerificationStatusInput(e.target.value)}>
                <option value="">All Verification Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <input className="filter-input w-full" placeholder="Search by membership/user..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 border-t border-border bg-background/60 px-4 py-3">
              <button className="action-btn action-btn-outline" onClick={resetFilters}>Reset</button>
              <button className="action-btn action-btn-primary" onClick={() => { applySearch(); setShowFilters(false); }}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="kpi-card p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">Membership Applications</h3>
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
                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!loading &&
                items.map((row, idx) => {
                  const rowView = { ...row, sno: (page - 1) * limit + idx + 1 };
                  return (
                    <tr key={row.applicationId}>
                      {columns.map((col) => (
                        <td key={col.key}>
                          {col.render
                            ? col.render((rowView as Record<string, unknown>)[col.key], rowView)
                            : String((rowView as Record<string, unknown>)[col.key] ?? "")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              {loading && (
                <tr>
                  <td colSpan={columns.length} className="py-8 text-center text-muted-foreground">Loading...</td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="py-8 text-center text-muted-foreground">No results found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border px-5 py-3">
          <span className="text-xs text-muted-foreground">Showing {items.length} of {total} records</span>
          <div className="flex items-center gap-2">
            <button
              className="action-btn action-btn-outline disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span className="text-xs text-muted-foreground">Page {page} / {totalPages || 1}</span>
            <button
              className="action-btn action-btn-outline disabled:opacity-40"
              disabled={page >= (totalPages || 1)}
              onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {(selectedMember || detailLoading) && (
        <MembershipDetails
          member={selectedMember}
          loading={detailLoading}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
};

export default MembershipsPage;
