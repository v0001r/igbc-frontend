import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { CreditListItem, SaveCreditReviewPayload } from "@/lib/reviewApi";

type Props = {
  credit: CreditListItem;
  role: "tpa" | "coordinator";
  onSave: (tab: string, subtab: string, payload: SaveCreditReviewPayload) => Promise<void>;
  hideHeader?: boolean;
};

function parsePointValue(raw: string) {
  const n = parseFloat(raw);
  return Number.isNaN(n) ? 0 : n;
}

function validatePointTotal(awarded: number, pending: number, denied: number, maxPoints: number) {
  if (awarded < 0 || pending < 0 || denied < 0) {
    return `Max points is ${maxPoints}`;
  }
  if (awarded + pending + denied > maxPoints) {
    return `Max points is ${maxPoints}`;
  }
  return null;
}

export function CreditReviewForm({ credit, role, onSave, hideHeader = false }: Props) {
  const { toast } = useToast();
  const tpaReview = credit.tpaReview;
  const coordinatorReview = credit.coordinatorReview;
  const initialSource =
    role === "tpa" ? tpaReview : (coordinatorReview ?? tpaReview);
  const maxPoints = credit.maxPoints ?? 0;

  const [awardedPoints, setAwardedPoints] = useState(String(initialSource?.awardedPoints ?? 0));
  const [pendingPoints, setPendingPoints] = useState(String(initialSource?.pendingPoints ?? 0));
  const [deniedPoints, setDeniedPoints] = useState(String(initialSource?.deniedPoints ?? 0));
  const [technicalAdvice, setTechnicalAdvice] = useState(initialSource?.technicalAdvice ?? "");
  const [reviewRemarks, setReviewRemarks] = useState(initialSource?.reviewRemarks ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const src = role === "tpa" ? tpaReview : (coordinatorReview ?? tpaReview);
    setAwardedPoints(String(src?.awardedPoints ?? 0));
    setPendingPoints(String(src?.pendingPoints ?? 0));
    setDeniedPoints(String(src?.deniedPoints ?? 0));
    setTechnicalAdvice(src?.technicalAdvice ?? "");
    setReviewRemarks(src?.reviewRemarks ?? "");
  }, [credit, role, tpaReview, coordinatorReview]);

  const awardedNum = parsePointValue(awardedPoints);
  const pendingNum = parsePointValue(pendingPoints);
  const deniedNum = parsePointValue(deniedPoints);
  const validationError = validatePointTotal(awardedNum, pendingNum, deniedNum, maxPoints);
  const remainingPoints = Math.max(0, maxPoints - awardedNum - pendingNum - deniedNum);

  const showValidationToast = () => {
    toast({
      variant: "destructive",
      title: `Max points is ${maxPoints}`,
      description:
        "Awarded, pending, and denied points combined cannot exceed the credit maximum.",
    });
  };

  const handleSave = async () => {
    if (validationError) {
      showValidationToast();
      return;
    }
    setSaving(true);
    try {
      await onSave(credit.tab, credit.subtab, {
        awardedPoints: awardedNum,
        pendingPoints: pendingNum,
        deniedPoints: deniedNum,
        technicalAdvice,
        reviewRemarks,
      });
      toast({ title: "Review saved" });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Save failed";
      if (message.includes("Max points is")) {
        toast({ variant: "destructive", title: message });
      } else {
        toast({ variant: "destructive", title: "Save failed", description: message });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-5">
      {!hideHeader ? (
        <div>
          <h3 className="text-base font-semibold">{credit.subtabTitle}</h3>
          <p className="text-xs text-muted-foreground">
            {credit.tabTitle} · {credit.tab}/{credit.subtab}
          </p>
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Review is optional. Maximum points for this credit:{" "}
        <span className="font-semibold text-foreground">{maxPoints}</span>
        {role === "coordinator" ? (
          <span>
            {" "}
            — enter coordinator values below; they override TPA and become final on re-release.
          </span>
        ) : (
          <span> — awarded + pending + denied cannot exceed this total.</span>
        )}
      </p>

      {role === "coordinator" && tpaReview ? (
        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm space-y-2">
          <p className="font-medium text-foreground">TPA review (reference)</p>
          <div className="grid gap-2 sm:grid-cols-3 text-muted-foreground">
            <p>Awarded: {tpaReview.awardedPoints}</p>
            <p>Pending: {tpaReview.pendingPoints}</p>
            <p>Denied: {tpaReview.deniedPoints}</p>
          </div>
          {tpaReview.technicalAdvice ? (
            <div>
              <p className="text-xs font-medium text-foreground">Technical advice</p>
              <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                {tpaReview.technicalAdvice}
              </p>
            </div>
          ) : null}
          {tpaReview.reviewRemarks ? (
            <div>
              <p className="text-xs font-medium text-foreground">Review remarks</p>
              <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                {tpaReview.reviewRemarks}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {role === "coordinator" ? (
        <p className="text-xs font-medium text-foreground">Coordinator review (editable)</p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          <span className="text-muted-foreground">Awarded points</span>
          <input
            type="number"
            min={0}
            step="0.01"
            className={`mt-1 w-full rounded-md border px-3 py-2 ${
              validationError ? "border-destructive" : "border-input"
            }`}
            value={awardedPoints}
            disabled={!credit.editable}
            onChange={(e) => setAwardedPoints(e.target.value)}
            onBlur={() => {
              if (validationError) showValidationToast();
            }}
          />
        </label>
        <label className="text-sm">
          <span className="text-muted-foreground">Pending points</span>
          <input
            type="number"
            min={0}
            step="0.01"
            className={`mt-1 w-full rounded-md border px-3 py-2 ${
              validationError ? "border-destructive" : "border-input"
            }`}
            value={pendingPoints}
            disabled={!credit.editable}
            onChange={(e) => setPendingPoints(e.target.value)}
            onBlur={() => {
              if (validationError) showValidationToast();
            }}
          />
        </label>
        <label className="text-sm">
          <span className="text-muted-foreground">Denied points</span>
          <input
            type="number"
            min={0}
            step="0.01"
            className={`mt-1 w-full rounded-md border px-3 py-2 ${
              validationError ? "border-destructive" : "border-input"
            }`}
            value={deniedPoints}
            disabled={!credit.editable}
            onChange={(e) => setDeniedPoints(e.target.value)}
            onBlur={() => {
              if (validationError) showValidationToast();
            }}
          />
        </label>
      </div>

      {!validationError ? (
        <p className="text-xs text-muted-foreground">
          Remaining points available: {remainingPoints} / {maxPoints}
        </p>
      ) : null}

      <label className="block text-sm">
        <span className="text-muted-foreground">Technical advice</span>
        <textarea
          className="mt-1 w-full rounded-md border border-input px-3 py-2"
          rows={3}
          value={technicalAdvice}
          disabled={!credit.editable}
          onChange={(e) => setTechnicalAdvice(e.target.value)}
        />
      </label>

      <label className="block text-sm">
        <span className="text-muted-foreground">Review remarks</span>
        <textarea
          className="mt-1 w-full rounded-md border border-input px-3 py-2"
          rows={3}
          value={reviewRemarks}
          disabled={!credit.editable}
          onChange={(e) => setReviewRemarks(e.target.value)}
        />
      </label>

      {credit.editable ? (
        <button
          type="button"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          disabled={saving}
          onClick={() => void handleSave()}
        >
          {saving ? "Saving…" : role === "coordinator" ? "Save coordinator draft" : "Save draft"}
        </button>
      ) : (
        <p className="text-sm text-muted-foreground">Review locked for this phase.</p>
      )}
    </div>
  );
}
