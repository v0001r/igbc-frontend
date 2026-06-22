import { GreenHomesProjectWorkspace } from "@/components/greenHomes/GreenHomesProjectWorkspace";
import { CreditReviewForm } from "@/components/review/CreditReviewForm";
import { TpaReportActions, useTpaReviewCredits } from "./TpaReviewSection";

type Props = {
  projectId: string;
};

export function TpaSubmittalReviewWorkspace({ projectId }: Props) {
  const { loading, error, saveCredit, findCredit, reload } = useTpaReviewCredits(projectId);

  const renderAfterSection = (tab: string, subtab: string) => {
    const credit = findCredit(tab, subtab);
    if (!credit) return null;

    return (
      <div className="mt-8 border-t-2 border-primary/20 pt-6">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary">
          TPA review — assign points
        </h3>
        <CreditReviewForm
          credit={credit}
          role="tpa"
          hideHeader
          onSave={saveCredit}
        />
      </div>
    );
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading review workspace…</p>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-900">
        <p className="font-semibold">Review workspace could not load</p>
        <p className="mt-2">{error}</p>
        <button
          type="button"
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          onClick={() => void reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GreenHomesProjectWorkspace
        projectId={projectId}
        forceReadOnly
        embedded
        hideCertificateTab
        renderAfterSection={renderAfterSection}
      />
      <TpaReportActions projectId={projectId} />
    </div>
  );
}
