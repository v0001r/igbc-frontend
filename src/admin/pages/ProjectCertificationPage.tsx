import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Download, FileText, Filter, RefreshCw, Search, X } from "lucide-react";
import DataTable from "../components/DataTable";
import ProjectCertificationView from "../components/ProjectCertificationView";
import TableRowActions from "../components/TableRowActions";
import {
  getAdminCertificationApplicationList,
  type AdminCertificationApplicationTab,
} from "../lib/adminApi";

const ProjectCertificationPage = () => {
  const { toast } = useToast();
  const [viewCert, setViewCert] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminCertificationApplicationTab>("submitted");
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({ submitted: 0, approved: 0, rejected: 0 });
  const [items, setItems] = useState<Array<Record<string, string | number>>>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filterProjectId, setFilterProjectId] = useState("");
  const [filterProjectTitle, setFilterProjectTitle] = useState("");
  const [filterRatingSystem, setFilterRatingSystem] = useState("All");
  const [filterCertificateType, setFilterCertificateType] = useState("All");
  const [filterExpediteReview, setFilterExpediteReview] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [listRefreshKey, setListRefreshKey] = useState(0);

  const tabs: Array<{
    id: AdminCertificationApplicationTab;
    label: string;
    icon: typeof FileText;
  }> = [
    { id: "submitted", label: "Submitted", icon: FileText },
    { id: "approved", label: "Approved", icon: CheckCircle2 },
    { id: "rejected", label: "Rejected", icon: X },
  ];

  useEffect(() => {
    const loadCertifications = async () => {
      setLoading(true);
      try {
        const response = await getAdminCertificationApplicationList(activeTab);
        setCounts(response.counts ?? { submitted: 0, approved: 0, rejected: 0 });
        const mapped = (response.items ?? []).map((item) => {
          const certification = item.certificationApplication ?? {};
          const project = item.project ?? {};
          const projectId =
            String(
              certification.igbcProjectId ??
                project.igbcProjectId ??
                project.igbcprojectid ??
                project.id ??
                certification.projectId ??
                project.temporaryProjectId ??
                "-",
            );
          const paymentStatus = String(certification.paymentStatus ?? "").toLowerCase();
          const certStatus = String(certification.status ?? "").toLowerCase();
          const displayStatus =
            activeTab === "approved"
              ? "Approved"
              : activeTab === "rejected"
              ? "Rejected"
              : certStatus === "submitted"
              ? "Submitted"
              : certStatus || "-";
          const rawCertificationTypeLabel = String(
            certification.certificationTypeLabel ?? "",
          ).trim();
          const certificationTypeLabel =
            rawCertificationTypeLabel.length > 0
              ? rawCertificationTypeLabel
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (ch) => ch.toUpperCase())
              : "";
          return {
            projectId,
            projectTitle: String(
              certification.projectName ?? project.projectName ?? "-",
            ),
            ratingSystem: String(
              certification.ratingSystem ?? project.ratingSystem ?? "-",
            ),
            certificateType: String(
              certificationTypeLabel ||
                project.subRatingType ||
                project.projectType ||
                "-",
            ).toUpperCase(),
            expediteReview:
              certification.expediteReview === true
                ? "Yes"
                : certification.expediteReview === false
                ? "No"
                : "-",
            status: displayStatus,
            paymentStatus: paymentStatus || "-",
            rowId: String(
              certification.certificationApplicationId ??
                certification.id ??
                certification.projectId ??
                project.id ??
                projectId,
            ),
          };
        });
        setItems(mapped);
      } catch (error) {
        setItems([]);
        toast({
          title: "Unable to load certification applications",
          description: error instanceof Error ? error.message : "Please retry.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void loadCertifications();
  }, [activeTab, toast, listRefreshKey]);

  const columns = useMemo(() => [
    { key: "projectId", label: "Project ID", sortable: true },
    { key: "projectTitle", label: "Project Title", sortable: true },
    { key: "ratingSystem", label: "Rating System" },
    { key: "certificateType", label: "Certificate Type" },
    { key: "expediteReview", label: "Expedite Review" },
    { key: "status", label: "Status", render: (v: string) => {
      const normalized = String(v).toLowerCase();
      const cls =
        normalized === "approved"
          ? "status-approved"
          : normalized === "submitted"
          ? "status-pending"
          : "status-rejected";
      return <span className={`status-badge ${cls}`}>{v}</span>;
    }},
    { key: "actions", label: "Action", render: (_: any, row: any) => (
      <TableRowActions
        actions={[{ label: "View", onClick: () => setViewCert(String(row.rowId ?? row.projectId)), variant: "primary" }]}
      />
    )},
  ], []);

  const ratingSystemOptions = useMemo(
    () =>
      Array.from(
        new Set(
          items
            .map((row) => String(row.ratingSystem ?? "").trim())
            .filter((value) => value.length > 0 && value !== "-"),
        ),
      ),
    [items],
  );

  const certificateTypeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          [
            "PRE-CERTIFICATION",
            "CERTIFICATION",
            ...items
            .map((row) => String(row.certificateType ?? "").trim())
            .filter((value) => value.length > 0 && value !== "-"),
          ],
        ),
      ),
    [items],
  );

  const filteredItems = useMemo(
    () =>
      items.filter((row) => {
        const projectId = String(row.projectId ?? "").toLowerCase();
        const projectTitle = String(row.projectTitle ?? "").toLowerCase();
        const ratingSystem = String(row.ratingSystem ?? "");
        const certificateType = String(row.certificateType ?? "");
        const expediteReview = String(row.expediteReview ?? "");
        const status = String(row.status ?? "");

        if (filterProjectId && !projectId.includes(filterProjectId.toLowerCase())) return false;
        if (filterProjectTitle && !projectTitle.includes(filterProjectTitle.toLowerCase())) return false;
        if (filterRatingSystem !== "All" && ratingSystem !== filterRatingSystem) return false;
        if (filterCertificateType !== "All" && certificateType !== filterCertificateType) return false;
        if (filterExpediteReview !== "All" && expediteReview !== filterExpediteReview) return false;
        if (filterStatus !== "All" && status !== filterStatus) return false;
        return true;
      }),
    [
      items,
      filterProjectId,
      filterProjectTitle,
      filterRatingSystem,
      filterCertificateType,
      filterExpediteReview,
      filterStatus,
    ],
  );

  const resetFilters = () => {
    setFilterProjectId("");
    setFilterProjectTitle("");
    setFilterRatingSystem("All");
    setFilterCertificateType("All");
    setFilterExpediteReview("All");
    setFilterStatus("All");
  };

  if (viewCert) {
    return (
      <ProjectCertificationView
        applicationId={viewCert}
        onBack={() => setViewCert(null)}
        onReviewComplete={() => setListRefreshKey((key) => key + 1)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              t.id === activeTab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label} ({counts[t.id]})
          </button>
        ))}
        </div>
        <div className="flex items-center gap-2 pb-2">
          <button
            onClick={() => {
              const headers = ["Cert ID", "Project Title", "Category", "Rating System", "Type", "Status", "Payment Status"];
              const rows = filteredItems.map((row) => [
                String(row.projectId ?? ""),
                String(row.projectTitle ?? ""),
                String(row.ratingSystem ?? ""),
                String(row.certificateType ?? ""),
                String(row.expediteReview ?? ""),
                String(row.status ?? ""),
                String(row.paymentStatus ?? ""),
              ]);
              const csv = [headers, ...rows]
                .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
                .join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = `admin-project-certifications-${activeTab}.csv`;
              link.click();
              URL.revokeObjectURL(link.href);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-muted"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-xl border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-muted"
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>
        </div>
      </div>
      {showFilters && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FilterInput
              label="Project ID"
              value={filterProjectId}
              onChange={setFilterProjectId}
              placeholder="Project ID"
            />
            <FilterInput
              label="Project Title"
              value={filterProjectTitle}
              onChange={setFilterProjectTitle}
              placeholder="Project Title"
            />
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Rating System</label>
              <select
                value={filterRatingSystem}
                onChange={(e) => setFilterRatingSystem(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="All">All</option>
                {ratingSystemOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Certificate Type</label>
              <select
                value={filterCertificateType}
                onChange={(e) => setFilterCertificateType(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="All">All</option>
                {certificateTypeOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Expedite Review</label>
              <select
                value={filterExpediteReview}
                onChange={(e) => setFilterExpediteReview(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="All">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="All">All</option>
                <option value="Submitted">Submitted</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <DataTable
        columns={columns}
        data={loading ? [] : filteredItems}
        title={loading ? "Project Certifications (Loading...)" : "Project Certifications"}
      />
    </div>
  );
};

export default ProjectCertificationPage;

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
