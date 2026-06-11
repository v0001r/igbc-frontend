import { useEffect, useState } from "react";
import { assignTpaToProject, fetchEligibleTpas } from "@/lib/certificationWorkflow";

type Props = {
  projectId: number;
  open: boolean;
  onClose: () => void;
  onAssigned: () => void;
};

export function AssignTpaModal({ projectId, open, onClose, onAssigned }: Props) {
  const [tpas, setTpas] = useState<Array<{ id: string; displayName: string; email: string }>>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    void fetchEligibleTpas(projectId)
      .then((r) => setTpas(r.items))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load TPAs"))
      .finally(() => setLoading(false));
  }, [open, projectId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl border bg-white/95 p-6 shadow-xl">
        <h3 className="text-lg font-semibold">Assign TPA</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a TPA matching this project&apos;s rating type.
        </p>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        <div className="mt-4">
          <select
            className="filter-input w-full"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            disabled={loading}
          >
            <option value="">Select TPA</option>
            {tpas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.displayName} ({t.email})
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
              void assignTpaToProject(projectId, selected)
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
