import { useCallback, useEffect, useState } from "react";
import { ReportPdfViewer } from "@/components/review/ReportPdfViewer";
import {
  fetchTpaCredits,
  previewTpaReport,
  releaseTpaReport,
  saveTpaCredit,
  type CreditListItem,
  type SaveCreditReviewPayload,
} from "@/lib/reviewApi";

type Props = {
  projectId: string;
};

export function TpaReportActions({ projectId }: Props) {
  const [remark, setRemark] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handlePreview = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await previewTpaReport(projectId, remark);
      setPreviewUrl(result.downloadUrl);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Preview failed");
    } finally {
      setBusy(false);
    }
  };

  const handleRelease = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await releaseTpaReport(projectId, remark);
      setMessage(result.message);
      setPreviewUrl(result.downloadUrl);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Release failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h3 className="text-sm font-semibold">Report actions</h3>
        <p className="text-xs text-muted-foreground">
          Credit review is optional. Preview or release the report when ready.
        </p>
        <input
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Release remark (optional)"
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
            onClick={() => void handleRelease()}
          >
            Release report to coordinator
          </button>
        </div>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </div>
      {previewUrl ? <ReportPdfViewer downloadUrl={previewUrl} title="Report preview" /> : null}
    </div>
  );
}

export function useTpaReviewCredits(projectId: string) {
  const [credits, setCredits] = useState<CreditListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchTpaCredits(projectId);
      setCredits(list.credits);
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
    await saveTpaCredit(projectId, tab, subtab, payload);
    await reload();
  };

  const findCredit = (tab: string, subtab: string) =>
    credits.find((c) => c.tab === tab && c.subtab === subtab) ?? null;

  return { credits, loading, error, reload, saveCredit, findCredit };
}
