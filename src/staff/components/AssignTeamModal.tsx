import { useEffect, useState } from "react";
import {
  assignTeamToProject,
  fetchEligibleStaff,
  fetchEligibleTpas,
} from "@/lib/certificationWorkflow";

type Props = {
  projectId: number;
  open: boolean;
  onClose: () => void;
  onAssigned: () => void;
  initialStaffId?: string;
  initialTpaId?: string;
  initialFee?: number | null;
  initialCount?: number | null;
};

export function AssignTeamModal({
  projectId,
  open,
  onClose,
  onAssigned,
  initialStaffId = "",
  initialTpaId = "",
  initialFee = null,
  initialCount = null,
}: Props) {
  const [staff, setStaff] = useState<Array<{ id: string; displayName: string; email: string }>>([]);
  const [tpas, setTpas] = useState<Array<{ id: string; displayName: string; email: string }>>([]);
  const [staffId, setStaffId] = useState(initialStaffId);
  const [tpaId, setTpaId] = useState(initialTpaId);
  const [fee, setFee] = useState(initialFee != null ? String(initialFee) : "");
  const [count, setCount] = useState(initialCount != null ? String(initialCount) : "");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setStaffId(initialStaffId);
    setTpaId(initialTpaId);
    setFee(initialFee != null ? String(initialFee) : "");
    setCount(initialCount != null ? String(initialCount) : "");
    setLoading(true);
    void Promise.all([fetchEligibleStaff(projectId), fetchEligibleTpas(projectId)])
      .then(([staffRes, tpaRes]) => {
        setStaff(staffRes.items);
        setTpas(tpaRes.items);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load users"))
      .finally(() => setLoading(false));
  }, [open, projectId, initialStaffId, initialTpaId, initialFee, initialCount]);

  if (!open) return null;

  const feeNum = Number(fee);
  const countNum = Number(count);
  const canSave =
    staffId && tpaId && Number.isFinite(feeNum) && feeNum >= 0 && Number.isInteger(countNum) && countNum >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="glass-panel w-full max-w-lg rounded-2xl border bg-white/95 p-6 shadow-xl">
        <h3 className="text-lg font-semibold">Assign Coordinator & TPA</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Select coordinator (staff) and TPA for this project. Notification emails will be sent to both.
        </p>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Select Coordinator</label>
            <select
              className="filter-input w-full"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              disabled={loading}
            >
              <option value="">Select</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.displayName}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Select TPA</label>
            <select
              className="filter-input w-full"
              value={tpaId}
              onChange={(e) => setTpaId(e.target.value)}
              disabled={loading}
            >
              <option value="">Select</option>
              {tpas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.displayName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Fee</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className="filter-input w-full"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Count</label>
            <input
              type="number"
              min={0}
              step={1}
              className="filter-input w-full"
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="action-btn action-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="action-btn action-btn-primary"
            disabled={!canSave || saving}
            onClick={() => {
              setSaving(true);
              void assignTeamToProject(projectId, {
                staffId,
                tpaId,
                fee: feeNum,
                count: countNum,
              })
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
