import { useEffect, useState } from "react";
import { fetchProjectWorkflow } from "@/lib/certificationWorkflow";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  final_submitted: "Final Submitted",
  assigned_to_staff: "Assigned To Staff",
  assigned_to_tpa: "Assigned To TPA",
  under_review: "Under Review",
  completed: "Completed",
};

const ACTION_LABELS: Record<string, string> = {
  FINAL_SUBMITTED: "Final submission",
  STAFF_ASSIGNED: "Staff assigned",
  STAFF_REASSIGNED: "Staff reassigned",
  TPA_ASSIGNED: "TPA assigned",
  TPA_REASSIGNED: "TPA reassigned",
  WORKFLOW_STATUS_CHANGED: "Status updated",
};

type Props = {
  projectId: string;
};

export function ProjectWorkflowTimeline({ projectId }: Props) {
  const [workflow, setWorkflow] = useState<Awaited<ReturnType<typeof fetchProjectWorkflow>> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setWorkflow(await fetchProjectWorkflow(projectId));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load workflow");
      }
    })();
  }, [projectId]);

  if (error) return null;
  if (!workflow) {
    return <p className="text-sm text-muted-foreground">Loading timeline…</p>;
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground">Project Timeline</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Current status:{" "}
        <span className="font-medium text-foreground">
          {STATUS_LABELS[workflow.workflowStatus] ?? workflow.workflowStatus}
        </span>
      </p>
      <ol className="mt-4 space-y-3 border-l border-border pl-4">
        {workflow.timeline.length === 0 ? (
          <li className="text-sm text-muted-foreground">No workflow events yet.</li>
        ) : (
          workflow.timeline.map((event) => (
            <li key={event.id} className="relative text-sm">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
              <p className="font-medium text-foreground">
                {ACTION_LABELS[event.action] ?? event.action}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(event.createdAt).toLocaleString("en-IN")}
              </p>
            </li>
          ))
        )}
      </ol>
    </section>
  );
}
