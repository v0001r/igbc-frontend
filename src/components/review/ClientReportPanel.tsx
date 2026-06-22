import { useEffect, useState } from "react";
import {
  acceptReport,
  fetchCurrentReport,
  rejectReport,
} from "@/lib/reviewApi";
import { ReportPdfViewer } from "./ReportPdfViewer";

type Props = {
  projectId: string;
  onUpdated?: () => void;
};

export function ClientReportPanel({ projectId, onUpdated }: Props) {
  const [report, setReport] = useState<Awaited<ReturnType<typeof fetchCurrentReport>> | null>(null);
  const [remark, setRemark] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const r = await fetchCurrentReport(projectId);
    setReport(r);
  };

  useEffect(() => {
    void load().catch((e) => setMessage(e instanceof Error ? e.message : "Load failed"));
  }, [projectId]);

  const handleAccept = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await acceptReport(projectId, remark);
      setMessage(result.message);
      await load();
      onUpdated?.();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Accept failed");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await rejectReport(projectId, remark);
      setMessage(result.message);
      await load();
      onUpdated?.();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Reject failed");
    } finally {
      setBusy(false);
    }
  };

  if (!report) {
    return <p className="text-sm text-muted-foreground">Loading report…</p>;
  }

  const cycleStatus = report.cycle?.cycleStatus;
  const canRespond = cycleStatus === "client_pending";

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Coordinator review report</h3>
      {!report.available ? (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          No report available yet. The coordinator will deliver the report after review.
        </p>
      ) : (
        <ReportPdfViewer downloadUrl={report.downloadUrl!} />
      )}

      {canRespond ? (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Your decision on the report</h3>
          <textarea
            className="w-full rounded-md border border-input px-3 py-2 text-sm"
            rows={3}
            placeholder="Optional remark"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              disabled={busy}
              onClick={() => void handleAccept()}
            >
              Accept report
            </button>
            <button
              type="button"
              className="rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive disabled:opacity-50"
              disabled={busy}
              onClick={() => void handleReject()}
            >
              Reject report
            </button>
          </div>
        </div>
      ) : null}

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
