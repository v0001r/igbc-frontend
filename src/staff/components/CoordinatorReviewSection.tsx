import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ReportPdfViewer } from "@/components/review/ReportPdfViewer";
import {
  fetchCoordinatorCredits,
  previewCoordinatorReport,
  rereleaseCoordinatorReport,
  saveCoordinatorCredit,
  type CreditListItem,
  type SaveCreditReviewPayload,
} from "@/lib/reviewApi";

type Props = {
  projectId: string;
  cycleStatus?: string | null;
  onReleased?: () => void;
};

export function CoordinatorReportActions({ projectId, cycleStatus, onReleased }: Props) {
  const { toast } = useToast();
  const [remark, setRemark] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const deliveredToClient = cycleStatus === "client_pending";

  const handlePreview = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await previewCoordinatorReport(projectId, remark);
      setPreviewUrl(result.downloadUrl);
    } catch (e) {
      const text = e instanceof Error ? e.message : "Preview failed";
      setMessage(text);
      toast({ variant: "destructive", title: text });
    } finally {
      setBusy(false);
    }
  };

  const handleRerelease = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await rereleaseCoordinatorReport(projectId, remark);
      const text = `${result.message} (pending points: ${result.totalPendingPoints})`;
      setMessage(text);
      setPreviewUrl(result.downloadUrl);
      toast({ title: "Report delivered to client", description: text });
      onReleased?.();
    } catch (e) {
      const text = e instanceof Error ? e.message : "Release failed";
      setMessage(text);
      toast({ variant: "destructive", title: text });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h3 className="text-sm font-semibold">Report actions</h3>
        {deliveredToClient ? (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
            Report already delivered to the client. You can preview or send an updated report if
            the client has not responded yet.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Credit review is optional. Coordinator values override TPA per credit. Preview or
            release to the client when ready.
          </p>
        )}
        <input
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Coordinator remark (optional)"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md border border-border bg-background px-4 py-2 text-sm disabled:opacity-50"
            disabled={busy}
            onClick={() => void handlePreview()}
          >
            Preview report
          </button>
          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            disabled={busy}
            onClick={() => void handleRerelease()}
          >
            {deliveredToClient ? "Re-send to client" : "Release to client"}
          </button>
        </div>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </div>
      {previewUrl ? <ReportPdfViewer downloadUrl={previewUrl} title="Report preview" /> : null}
    </div>
  );
}

export function useCoordinatorReviewCredits(projectId: string) {
  const [credits, setCredits] = useState<CreditListItem[]>([]);
  const [cycleStatus, setCycleStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchCoordinatorCredits(projectId);
      setCredits(list.credits);
      setCycleStatus(list.cycle?.cycleStatus ?? null);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
      setCredits([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveCredit = async (tab: string, subtab: string, payload: SaveCreditReviewPayload) => {
    await saveCoordinatorCredit(projectId, tab, subtab, payload);
    await reload();
  };

  const findCredit = (tab: string, subtab: string) =>
    credits.find((c) => c.tab === tab && c.subtab === subtab) ?? null;

  return { credits, cycleStatus, loading, error, reload, saveCredit, findCredit };
}
