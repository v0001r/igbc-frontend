import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ProjectWorkflowTimeline } from "@/components/greenHomes/ProjectWorkflowTimeline";
import { fetchProjectWorkflow, type ProjectWorkflowResponse } from "@/lib/certificationWorkflow";
import { TpaSubmittalReviewWorkspace } from "@/tpa/components/TpaSubmittalReviewWorkspace";

export default function TpaProjectViewPage() {
  const { id } = useParams<{ id: string }>();
  const [workflow, setWorkflow] = useState<ProjectWorkflowResponse | null>(null);
  const [workflowError, setWorkflowError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void fetchProjectWorkflow(id)
      .then(setWorkflow)
      .catch((e) => {
        setWorkflowError(e instanceof Error ? e.message : "Unable to load workflow");
        setWorkflow(null);
      });
  }, [id]);

  if (!id) {
    return <p className="text-sm text-muted-foreground">Project not found.</p>;
  }

  return (
    <div className="space-y-4">
      <Link to="/tpa" className="text-sm font-medium text-primary hover:underline">
        ← Back to dashboard
      </Link>

      <div className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-lg font-semibold text-foreground">TPA project review</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Open each credit from the rating sections on the left. Client submittal data appears
          above; enter your review points and remarks in the section below each credit.
        </p>
        {workflow?.reviewCycle ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Submission #{workflow.reviewCycle.submissionCount} · Cycle:{" "}
            {workflow.reviewCycle.cycleStatus.replace(/_/g, " ")}
          </p>
        ) : null}
        {workflowError ? <p className="mt-2 text-sm text-amber-700">{workflowError}</p> : null}
      </div>

      <ProjectWorkflowTimeline projectId={id} />

      <TpaSubmittalReviewWorkspace projectId={id} />
    </div>
  );
}
