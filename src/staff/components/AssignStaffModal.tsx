import { useEffect, useState } from "react";
import {
  assignStaffToProject,
  fetchEligibleStaff,
} from "@/lib/certificationWorkflow";

type Props = {
  projectId: number;
  open: boolean;
  onClose: () => void;
  onAssigned: () => void;
};

export function AssignStaffModal({ projectId, open, onClose, onAssigned }: Props) {
  const [staff, setStaff] = useState<Array<{ id: string; displayName: string; email: string }>>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    void fetchEligibleStaff(projectId)
      .then((r) => setStaff(r.items))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load staff"))
      .finally(() => setLoading(false));
  }, [open, projectId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl border bg-white/95 p-6 shadow-xl">
        <h3 className="text-lg font-semibold">Assign Staff</h3>
        <p className="mt-1 text-sm text-muted-foreground">Select a staff member for this project.</p>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        <div className="mt-4">
          <select
            className="filter-input w-full"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            disabled={loading}
          >
            <option value="">Select staff</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.displayName} ({s.email})
              </option>
            ))}
          </select>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="action-btn action-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="action-btn action-btn-primary"
            disabled={!selected || saving}
            onClick={() => {
              setSaving(true);
              void assignStaffToProject(projectId, selected)
                .then(() => {
                  onAssigned();
                  onClose();
                })
                .catch((e) => setError(e instanceof Error ? e.message : "Assign failed"))
                .finally(() => setSaving(false));
            }}
          >
            {saving ? "Assigning…" : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}
