import { useEffect, useState } from "react";
import {
  Award,
  CheckCircle2,
  Clock,
  Download,
  FileBadge,
  Pencil,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ReportPdfViewer } from "@/components/review/ReportPdfViewer";
import {
  acceptCertificate,
  createPdfBlobUrl,
  downloadCertificate,
  downloadBase64File,
  editCertificate,
  fetchCertificateDetails,
  fetchCertificateLogs,
  previewCertificate,
  rejectCertificate,
  type CertificateDetails,
  type CertificateLogItem,
} from "@/lib/reviewApi";

type Props = {
  projectId: string;
  onUpdated?: () => void;
};

function statusBadgeClass(status: string) {
  switch (status) {
    case "accepted":
      return "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20";
    case "rejected":
      return "bg-destructive/10 text-destructive ring-destructive/20";
    default:
      return "bg-amber-500/10 text-amber-800 ring-amber-500/20";
  }
}

function actionIcon(action: string) {
  switch (action) {
    case "accepted":
      return CheckCircle2;
    case "rejected":
      return XCircle;
    case "downloaded":
      return Download;
    case "edited":
      return Pencil;
    default:
      return FileBadge;
  }
}

function CertificateStatusSummary({ details }: { details: CertificateDetails }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 shadow-sm">
      <div className="border-b border-border/60 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Certificate status
            </p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">{details.projectName}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{details.address}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusBadgeClass(details.certificateStatus)}`}
          >
            {details.certificateStatus}
          </span>
        </div>
      </div>

      <div className="grid gap-3 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/60 bg-background/80 px-4 py-3">
          <p className="text-xs text-muted-foreground">Certification level</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Award className="h-4 w-4 text-primary" />
            {details.level}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/80 px-4 py-3">
          <p className="text-xs text-muted-foreground">Awarded points</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{details.totalAwardedPoints}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/80 px-4 py-3">
          <p className="text-xs text-muted-foreground">Pending review</p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {details.isPending ? "Yes" : "No"}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/80 px-4 py-3">
          <p className="text-xs text-muted-foreground">Registration no.</p>
          <p className="mt-1 truncate text-sm font-semibold text-foreground">
            {details.registrationNo || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

function CertificateActivityTimeline({ logs }: { logs: CertificateLogItem[] }) {
  if (!logs.length) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Activity timeline
      </p>
      <ul className="space-y-3">
        {logs.map((log) => {
          const Icon = actionIcon(log.action);
          return (
            <li key={log.id} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium capitalize text-foreground">{log.action}</p>
                {log.remarks ? (
                  <p className="text-xs text-muted-foreground">{log.remarks}</p>
                ) : null}
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function CertificateWorkflowPanel({ projectId, onUpdated }: Props) {
  const { toast } = useToast();
  const [details, setDetails] = useState<CertificateDetails | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<CertificateLogItem[]>([]);

  const reload = async () => {
    const [d, l] = await Promise.all([
      fetchCertificateDetails(projectId),
      fetchCertificateLogs(projectId),
    ]);
    setDetails(d);
    setLogs(l.logs);
    setEditName(d.projectName);
    setEditAddress(d.address);
  };

  useEffect(() => {
    void reload().catch((e) =>
      toast({
        variant: "destructive",
        title: e instanceof Error ? e.message : "Failed to load certificate",
      }),
    );
  }, [projectId]);

  if (!details) {
    return <p className="text-sm text-muted-foreground">Loading certificate…</p>;
  }

  if (!details.canViewCertificateTab) {
    return (
      <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        Certificate will be available after you accept the coordinator report and all pending
        credits are resolved.
      </p>
    );
  }

  const handlePreview = async () => {
    setBusy(true);
    try {
      const result = await previewCertificate(projectId);
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(createPdfBlobUrl(result.fileContentBase64));
    } catch (e) {
      toast({
        variant: "destructive",
        title: e instanceof Error ? e.message : "Preview failed",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleAccept = async () => {
    setBusy(true);
    try {
      await acceptCertificate(projectId);
      toast({ title: "Certificate accepted" });
      await reload();
      onUpdated?.();
    } catch (e) {
      toast({
        variant: "destructive",
        title: e instanceof Error ? e.message : "Accept failed",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (!rejectRemarks.trim()) {
      toast({ variant: "destructive", title: "Rejection reason is required" });
      return;
    }
    setBusy(true);
    try {
      await rejectCertificate(projectId, rejectRemarks.trim());
      toast({ title: "Certificate rejected" });
      setShowReject(false);
      await reload();
      onUpdated?.();
    } catch (e) {
      toast({
        variant: "destructive",
        title: e instanceof Error ? e.message : "Reject failed",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = async () => {
    setBusy(true);
    try {
      await editCertificate(projectId, { projectName: editName, address: editAddress });
      toast({ title: "Certificate details updated" });
      setShowEdit(false);
      await reload();
    } catch (e) {
      toast({
        variant: "destructive",
        title: e instanceof Error ? e.message : "Edit failed",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = async () => {
    setBusy(true);
    try {
      const result = await downloadCertificate(projectId);
      setDownloadUrl(result.downloadUrl);
      downloadBase64File(result.fileContentBase64, result.fileName, "application/pdf");
      toast({ title: "Certificate downloaded" });
      await reload();
    } catch (e) {
      toast({
        variant: "destructive",
        title: e instanceof Error ? e.message : "Download failed",
      });
    } finally {
      setBusy(false);
    }
  };

  const accepted = details.certificateStatus === "accepted";

  return (
    <div className="space-y-5">
      <CertificateStatusSummary details={details} />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-muted/50 disabled:opacity-50"
          disabled={busy}
          onClick={() => void handlePreview()}
        >
          Preview Certificate
        </button>
        {details.canAcceptCertificate ? (
          <>
            <button
              type="button"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:opacity-50"
              disabled={busy}
              onClick={() => void handleAccept()}
            >
              Accept
            </button>
            <button
              type="button"
              className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-2 text-sm font-medium text-destructive disabled:opacity-50"
              disabled={busy}
              onClick={() => setShowReject(true)}
            >
              Reject
            </button>
          </>
        ) : null}
        {accepted ? (
          <>
            <button
              type="button"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:opacity-50"
              disabled={busy}
              onClick={() => void handleDownload()}
            >
              Download Certificate
            </button>
            <button
              type="button"
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-muted/50 disabled:opacity-50"
              disabled={busy}
              onClick={() => setShowEdit(true)}
            >
              Edit Certificate
            </button>
          </>
        ) : null}
      </div>

      {showReject ? (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
          <h4 className="text-sm font-semibold">Reject certificate</h4>
          <textarea
            className="w-full rounded-md border border-input px-3 py-2 text-sm"
            rows={4}
            placeholder="Reason (required)"
            value={rejectRemarks}
            onChange={(e) => setRejectRemarks(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground disabled:opacity-50"
              disabled={busy}
              onClick={() => void handleReject()}
            >
              Confirm reject
            </button>
            <button
              type="button"
              className="rounded-md border border-border px-4 py-2 text-sm"
              onClick={() => setShowReject(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {showEdit ? (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
          <h4 className="text-sm font-semibold">Edit certificate display</h4>
          <label className="block text-sm">
            <span className="text-muted-foreground">Project name</span>
            <input
              className="mt-1 w-full rounded-md border border-input px-3 py-2"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted-foreground">Address</span>
            <textarea
              className="mt-1 w-full rounded-md border border-input px-3 py-2"
              rows={3}
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              disabled={busy}
              onClick={() => void handleEdit()}
            >
              Save
            </button>
            <button
              type="button"
              className="rounded-md border border-border px-4 py-2 text-sm"
              onClick={() => setShowEdit(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {previewUrl ? (
        <ReportPdfViewer
          downloadUrl={previewUrl}
          title="Certificate preview"
          layout="a4-landscape"
        />
      ) : null}
      {downloadUrl && !previewUrl ? (
        <p className="text-sm text-muted-foreground">Certificate downloaded.</p>
      ) : null}

      <CertificateActivityTimeline logs={logs} />
    </div>
  );
}
