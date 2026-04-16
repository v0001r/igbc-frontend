import { useEffect, useState } from "react";
import { Download, Filter, Search, X } from "lucide-react";
import {
  getAdminApExamDetails,
  getAdminApExamList,
  getAdminApExamManageCertificateList,
  updateAdminApExamResult,
  uploadAdminApExamReport,
  type AdminApExamDetails,
  type AdminApExamItem,
} from "../lib/adminApi";
import { toast } from "../components/ui/use-toast";
import TableRowActions from "../components/TableRowActions";

const APExamsPage = () => {
  const [items, setItems] = useState<AdminApExamItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [tab, setTab] = useState<"manage" | "certificates">("manage");
  const [loading, setLoading] = useState(false);
  const [selectedExam, setSelectedExam] = useState<AdminApExamDetails | null>(null);
  const [uploadTarget, setUploadTarget] = useState<AdminApExamItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [scoreInput, setScoreInput] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [updatingResultKey, setUpdatingResultKey] = useState<string | null>(null);

  const displayValue = (value: unknown): string => {
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    return JSON.stringify(value);
  };

  const toSentenceCase = (input: string): string => {
    const withSpaces = input
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .trim()
      .toLowerCase();
    if (!withSpaces) return "";
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
  };

  useEffect(() => {
    void loadList();
  }, [limit, page, search, tab]);

  const applySearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const loadList = async () => {
    setLoading(true);
    try {
      const response =
        tab === "certificates"
          ? await getAdminApExamManageCertificateList({ page, limit, search })
          : await getAdminApExamList({ page, limit, search });
      setItems(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      toast({
        title: "Unable to load AP exams",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openExamDetails = async (row: AdminApExamItem) => {
    setDetailLoading(true);
    try {
      const details = await getAdminApExamDetails(row.registrationId);
      setSelectedExam(details);
    } catch (err) {
      toast({
        title: "Unable to load AP exam details",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const submitReport = async () => {
    if (!uploadTarget) return;
    const id = String(uploadTarget.registrationId);
    const score = Number(scoreInput);
    if (!id || !reportFile || Number.isNaN(score) || score < 0 || score > 100) {
      toast({
        title: "Invalid report upload data",
        description: "Report file and valid score (0-100) are required.",
        variant: "destructive",
      });
      return;
    }
    setSubmittingReport(true);
    try {
      await uploadAdminApExamReport(id, { report: reportFile, score });
      setUploadTarget(null);
      setReportFile(null);
      setScoreInput("");
      await loadList();
      toast({
        title: "Report uploaded",
        description: "Report and score have been saved successfully.",
      });
    } catch (err) {
      toast({
        title: "Unable to upload report",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingReport(false);
    }
  };

  const submitResult = async (id: string, result: "pass" | "fail") => {
    if (!id) return;
    setUpdatingResultKey(`${id}:${result}`);
    try {
      await updateAdminApExamResult(id, { result });
      await loadList();
      toast({
        title: "Result updated",
        description: `Exam marked as ${result.toUpperCase()}.`,
      });
    } catch (err) {
      toast({
        title: "Unable to update result",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingResultKey(null);
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
    link.download = tab === "certificates" ? "ap-exam-certificates.csv" : "ap-exams.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: "examDetails", label: "Exam Details",
      render: (_: any, row: any) => (
        <div className="text-xs space-y-0.5">
          <p className="text-muted-foreground">Exam id: {row.examId}</p>
          <p className="text-muted-foreground">Exam Date: {row.examDate}</p>
          <p className="text-muted-foreground">Time: {row.examTime}</p>
        </div>
      ),
    },
    {
      key: "details", label: "Details",
      render: (_: any, row: any) => (
        <div className="text-xs space-y-0.5">
          <p className="font-medium text-foreground">{row.fullName}</p>
          <p className="text-muted-foreground">{row.email}</p>
          <p className="text-muted-foreground">{row.mobileNumber}</p>
        </div>
      ),
    },
    {
      key: "paymentDetails", label: "Score",
      render: (_: any, row: any) =>
        tab === "certificates" ? (
          <div className="text-xs space-y-0.5">
            <p className="text-muted-foreground">Score: {row.score ?? row.examScore ?? "-"}</p>
            <p className="text-muted-foreground">Result: {row.resultStatus ?? "-"}</p>
            <p className="text-muted-foreground">Updated At: {row.resultUpdatedAt ?? "-"}</p>
          </div>
        ) : (
          <div className="text-xs space-y-0.5">
            <p className="font-semibold text-foreground">
              Amount: ₹{Number(row.feeAmount ?? 0).toLocaleString("en-IN")}
            </p>
            <p className="text-muted-foreground">
              Status: <span className="font-medium">{row.paymentStatus ?? "-"}</span>
            </p>
            <p className="text-muted-foreground">Reschedules: {row.rescheduleCount ?? "-"}</p>
            <p className="text-muted-foreground">Score: {row.score ?? row.examScore ?? "-"}</p>
            <p className="text-muted-foreground">Result: {row.resultStatus ?? "-"}</p>
          </div>
        ),
    },
    {
      key: "paymentStatus", label: "Status",
      render: (v: any, row: any) => {
        if (tab === "certificates") {
          const result = String(row.resultStatus ?? "").toLowerCase();
          return (
            <span className={`status-badge ${result === "pass" ? "status-approved" : result === "fail" ? "status-rejected" : "status-pending"}`}>
              {result === "pass" ? "Pass" : result === "fail" ? "Fail" : "-"}
            </span>
          );
        }
        return (
          <span className={`status-badge ${String(v).toLowerCase() === "success" ? "status-approved" : "status-pending"}`}>
            {String(v).toLowerCase() === "success" ? "Paid" : "Pending"}
          </span>
        );
      },
    },
    {
      key: "actions", label: "Action",
      render: (_: any, row: any) => {
        const actions = [
          { label: "View", onClick: () => void openExamDetails(row), variant: "primary" as const },
          ...(tab === "manage" && !row.reportUrl
            ? [{
                label: "Upload Report",
                onClick: () => {
                  setUploadTarget(row);
                  setReportFile(null);
                  setScoreInput(
                    row.examScore !== null && row.examScore !== undefined ? String(row.examScore) : "",
                  );
                },
                variant: "success" as const,
              }]
            : []),
          ...(row.reportUrl
            ? [{ label: "Report", href: row.reportUrl, variant: "success" as const }]
            : []),
          ...(tab === "manage" && row.reportUrl
            ? [
                {
                  label:
                    updatingResultKey === `${row.registrationId}:pass` ? "Saving..." : "Pass",
                  onClick: () => void submitResult(row.registrationId, "pass"),
                  variant: "success" as const,
                  disabled: updatingResultKey !== null,
                },
                {
                  label:
                    updatingResultKey === `${row.registrationId}:fail` ? "Saving..." : "Fail",
                  onClick: () => void submitResult(row.registrationId, "fail"),
                  variant: "danger" as const,
                  disabled: updatingResultKey !== null,
                },
              ]
            : []),
        ];
        return <TableRowActions actions={actions} />;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-4 border-b border-border">
          <button
            className={`text-sm font-medium pb-2 border-b-2 ${tab === "manage" ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"}`}
            onClick={() => {
              setTab("manage");
              setPage(1);
            }}
          >
            Manage AP
          </button>
          <button
            className={`text-sm font-medium pb-2 border-b-2 ${tab === "certificates" ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"}`}
            onClick={() => {
              setTab("certificates");
              setPage(1);
            }}
          >
            Manage Certificates
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="action-btn action-btn-outline" onClick={exportList}>
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button className="action-btn action-btn-primary" onClick={() => setShowFilters(true)}>
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
        </div>
      </div>
      <div className="kpi-card p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">
            {tab === "certificates" ? "AP Exam Certificates" : "AP Exams"}
          </h3>
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
                items.map((row) => (
                  <tr key={row.registrationId}>
                    {columns.map((col) => (
                      <td key={col.key}>
                        {col.render
                          ? col.render((row as Record<string, unknown>)[col.key], row)
                          : String((row as Record<string, unknown>)[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
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

      {(selectedExam || detailLoading) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40" onClick={() => setSelectedExam(null)}>
          <div
            className="bg-card rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            style={{ boxShadow: "var(--shadow-modal)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-foreground rounded-t-xl">
              <h2 className="text-sm font-semibold text-card">AP Exam Details</h2>
              <button onClick={() => setSelectedExam(null)} className="text-card hover:opacity-80"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              {detailLoading && <div className="text-sm text-muted-foreground">Loading exam details...</div>}
              {!detailLoading && selectedExam && (
                <>
                  <div className="rounded-lg border border-border p-4">
                    <h4 className="mb-2 text-sm font-semibold text-foreground">Exam ID</h4>
                    <p className="text-sm font-medium text-foreground">{String(selectedExam.examId ?? "-")}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <h4 className="mb-3 text-sm font-semibold text-foreground">Stored Data</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {Object.entries(selectedExam).map(([key, value]) => {
                        if (key === "examId" || key === "registrationId" || key === "id") return null;
                        if (value && typeof value === "object" && !Array.isArray(value)) {
                          return (
                            <div key={key} className="col-span-2 rounded-md border border-border p-3">
                              <p className="mb-2 text-xs font-semibold text-foreground">{toSentenceCase(key)}</p>
                              <div className="grid grid-cols-2 gap-3">
                                {Object.entries(value as Record<string, unknown>).map(([nestedKey, nestedValue]) => (
                                  <div key={`${key}-${nestedKey}`}>
                                    <p className="text-muted-foreground">{toSentenceCase(nestedKey)}</p>
                                    <p className="font-medium text-foreground break-all">{displayValue(nestedValue)}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div key={key}>
                            <p className="text-muted-foreground">{toSentenceCase(key)}</p>
                            <p className="font-medium text-foreground break-all">{displayValue(value)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </>
              )}
            </div>
          </div>
        </div>
      )}

      {uploadTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-foreground/40" onClick={() => setUploadTarget(null)}>
          <div
            className="w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-card"
            style={{ boxShadow: "var(--shadow-modal)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between rounded-t-xl bg-foreground px-6 py-4">
              <h2 className="text-sm font-semibold text-card">Upload AP Exam Report</h2>
              <button onClick={() => setUploadTarget(null)} className="text-card hover:opacity-80">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <p className="text-sm text-muted-foreground">
                Candidate: <span className="font-medium text-foreground">{uploadTarget.fullName}</span>
              </p>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-foreground">Report File</label>
                <input
                  id="ap-exam-report-file"
                  className="hidden"
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={(e) => setReportFile(e.target.files?.[0] ?? null)}
                />
                <label
                  htmlFor="ap-exam-report-file"
                  className="flex min-h-[120px] w-full cursor-pointer items-center justify-center rounded-2xl border border-primary bg-background px-4 py-6 text-center transition-colors hover:bg-muted/40"
                >
                  <p className="text-sm text-muted-foreground">
                    Drag &amp; Drop your files or{" "}
                    <span className="font-semibold text-amber-700">Browse</span>
                  </p>
                </label>
                {reportFile && (
                  <p className="text-xs font-medium text-foreground">
                    Selected file: <span className="text-muted-foreground">{reportFile.name}</span>
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Allowed: PDF, DOC, DOCX, PNG, JPG, JPEG
                </p>
              </div>
              <input
                className="filter-input w-full"
                placeholder="Score (0-100)"
                type="number"
                min={0}
                max={100}
                value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  className="action-btn action-btn-outline"
                  onClick={() => {
                    setUploadTarget(null);
                    setReportFile(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => void submitReport()}
                  className="action-btn action-btn-primary"
                  disabled={submittingReport}
                >
                  {submittingReport ? "Uploading..." : "Upload Report"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFilters && (
        <div className="fixed inset-0 z-[120] flex items-start justify-end bg-foreground/10 px-6 pt-24" onClick={() => setShowFilters(false)}>
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <input
                className="filter-input w-full"
                placeholder="Search by name/email/mobile..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applySearch()}
              />
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
    </div>
  );
};

export default APExamsPage;
