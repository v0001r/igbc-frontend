import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CertificationReadOnlyWorkspace } from "@/components/greenHomes/CertificationReadOnlyWorkspace";
import { ProjectWorkflowTimeline } from "@/components/greenHomes/ProjectWorkflowTimeline";
import { fetchProjectWorkflow, type ProjectWorkflowResponse } from "@/lib/certificationWorkflow";
import { CoordinatorSubmittalReviewWorkspace } from "@/staff/components/CoordinatorSubmittalReviewWorkspace";

type Props = {
  isLead?: boolean;
};

export default function StaffProjectViewPage({ isLead = false }: Props) {
  const { id } = useParams<{ id: string }>();
  const [workflow, setWorkflow] = useState<ProjectWorkflowResponse | null>(null);
  const [workflowError, setWorkflowError] = useState<string | null>(null);

  const reloadWorkflow = () => {
    if (!id) return;
    void fetchProjectWorkflow(id)
      .then(setWorkflow)
      .catch((e) => {
        setWorkflowError(e instanceof Error ? e.message : "Unable to load workflow");
        setWorkflow(null);
      });
  };

  useEffect(() => {
    reloadWorkflow();
  }, [id]);

  if (!id) {
    return <p className="text-sm text-muted-foreground">Project not found.</p>;
  }

  const backTo = isLead ? "/staff/lead" : "/staff";
  const cycleStatus = workflow?.reviewCycle?.cycleStatus;
  const showReview =
    workflow?.workflowStatus === "tpa_report_released" ||
    workflow?.workflowStatus === "coordinator_review_in_progress" ||
    workflow?.workflowStatus === "coordinator_report_released" ||
    workflow?.workflowStatus === "client_review_pending" ||
    cycleStatus === "tpa_locked" ||
    cycleStatus === "client_pending";

  return (
    <div className="space-y-4">
      <Link to={backTo} className="text-sm font-medium text-primary hover:underline">
        ← Back to dashboard
      </Link>

      {showReview ? (
        <div className="rounded-xl border border-border bg-card p-4">
          <h1 className="text-lg font-semibold text-foreground">Coordinator project review</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Open each credit from the rating sections on the left. Client submittal data appears
            above; TPA review values are shown for reference. Enter coordinator values below each
            credit — they override TPA and become final on re-release.
          </p>
          {workflow?.reviewCycle ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Submission #{workflow.reviewCycle.submissionCount} · Cycle:{" "}
              {workflow.reviewCycle.cycleStatus.replace(/_/g, " ")}
            </p>
          ) : null}
          {workflowError ? <p className="mt-2 text-sm text-amber-700">{workflowError}</p> : null}
        </div>
      ) : null}

      <ProjectWorkflowTimeline projectId={id} />

      {showReview ? (
        <CoordinatorSubmittalReviewWorkspace projectId={id} onReleased={reloadWorkflow} />
      ) : (
        <CertificationReadOnlyWorkspace projectId={id} />
      )}
    </div>
  );
}
