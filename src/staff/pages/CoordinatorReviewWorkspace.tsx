import { useCallback, useEffect, useState } from "react";
import { CreditReviewForm } from "@/components/review/CreditReviewForm";
import { ReviewCompletenessBanner } from "@/components/review/ReviewCompletenessBanner";
import { ReportPdfViewer } from "@/components/review/ReportPdfViewer";
import {
  fetchCoordinatorCompleteness,
  fetchCoordinatorCredits,
  previewCoordinatorReport,
  rereleaseCoordinatorReport,
  saveCoordinatorCredit,
  type CreditListItem,
} from "@/lib/reviewApi";

type Props = {
  projectId: string;
};

export default function CoordinatorReviewWorkspace({ projectId }: Props) {
  const [credits, setCredits] = useState<CreditListItem[]>([]);
  const [selected, setSelected] = useState<CreditListItem | null>(null);
  const [completeness, setCompleteness] = useState<Awaited<
    ReturnType<typeof fetchCoordinatorCompleteness>
  > | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [remark, setRemark] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    const [list, comp] = await Promise.all([
      fetchCoordinatorCredits(projectId),
      fetchCoordinatorCompleteness(projectId),
    ]);
    setCredits(list.credits);
    setCompleteness(comp);
    setSelected(
      (prev) =>
        list.credits.find((c) => c.tab === prev?.tab && c.subtab === prev?.subtab) ??
        list.credits[0] ??
        null,
    );
  }, [projectId]);

  useEffect(() => {
    void reload().catch((e) => setMessage(e instanceof Error ? e.message : "Load failed"));
  }, [reload]);

  const handleSave = async (
    tab: string,
    subtab: string,
    payload: Parameters<typeof saveCoordinatorCredit>[3],
  ) => {
    await saveCoordinatorCredit(projectId, tab, subtab, payload);
    await reload();
  };

  const handlePreview = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await previewCoordinatorReport(projectId, remark);
      setPreviewUrl(result.downloadUrl);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Preview failed");
    } finally {
      setBusy(false);
    }
  };

  const handleRerelease = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await rereleaseCoordinatorReport(projectId, remark);
      setMessage(`${result.message} (pending points: ${result.totalPendingPoints})`);
      setPreviewUrl(result.downloadUrl);
      await reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Re-release failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {completeness ? (
        <ReviewCompletenessBanner
          total={completeness.total}
          reviewed={completeness.reviewed}
          optional={completeness.optional}
          missing={completeness.missing}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-xl border border-border bg-card p-3">
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Credits</p>
          <ul className="max-h-[480px] space-y-1 overflow-y-auto">
            {credits.map((credit) => (
              <li key={`${credit.tab}-${credit.subtab}`}>
                <button
                  type="button"
                  className={`w-full rounded-md px-2 py-2 text-left text-sm ${
                    selected?.tab === credit.tab && selected?.subtab === credit.subtab
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setSelected(credit)}
                >
                  <span className="block font-medium">{credit.subtabTitle}</span>
                  <span className="text-xs text-muted-foreground">
                    {credit.reviewed ? "Reviewed" : "Pending"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="space-y-4">
          {selected ? (
            <CreditReviewForm credit={selected} role="coordinator" onSave={handleSave} />
          ) : (
            <p className="text-sm text-muted-foreground">Select a credit to review.</p>
          )}

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold">Report actions</h3>
            <p className="text-xs text-muted-foreground">
              Credit review is optional. Preview or re-release the report when ready.
            </p>
            <input
              className="w-full rounded-md border border-input px-3 py-2 text-sm"
              placeholder="Coordinator remark (optional)"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-md border border-border px-4 py-2 text-sm disabled:opacity-50"
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
                Re-release to client
              </button>
            </div>
          </div>

          {previewUrl ? <ReportPdfViewer downloadUrl={previewUrl} title="Report preview" /> : null}
        </div>
      </div>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
