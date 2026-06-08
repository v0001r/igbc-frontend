import {
  clearGiFixtureRow,
  computeGiWcTwoAnnex,
  type GiWcTwoAnnexState,
  type GiWcTwoComputeContext,
} from "@/annexure/annexGiWcTwoCalculations";
import {
  buildSavePayloadFromGiWcTwo,
  hydrateGiWcTwoAnnex,
} from "@/annexure/annexGiWcTwoStorage";
import type { AnnexureSchemaDefinition, GiWcTwoPresetDef } from "@/annexure/annexureTypes";
import type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { RatingDataIndex } from "@/lib/ratingDataIndex";
import { Plus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MutableRefObject } from "react";

const inputClass =
  "h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/30";
const readonlyClass =
  "h-9 w-full min-w-0 rounded-md border border-transparent bg-muted/50 px-2 text-sm text-muted-foreground";

type Props = {
  schema: AnnexureSchemaDefinition;
  tab: string;
  subtab: string;
  ratingTypeId: number;
  formState: CertificationFormResponse;
  globalExtras?: Record<string, string>;
  saveHandleRef: MutableRefObject<AnnexureRendererHandle | null>;
};

function clampDecimal(raw: string): string {
  if (raw === "" || raw === ".") return raw;
  if (!raw.includes(".")) return raw;
  const [w, f] = raw.split(".");
  return f.length > 2 ? `${w}.${f.slice(0, 2)}` : raw;
}

export function AnnexureGiWcTwoRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  globalExtras,
  saveHandleRef,
}: Props) {
  const layout = schema.greenInteriorsWcTwoLayout!;
  const presets = layout.presetRows;
  const minPartTime = layout.partTimeMinRows ?? 1;
  const maxPartTime = layout.partTimeMaxRows ?? 50;

  const computeCtx = useMemo((): GiWcTwoComputeContext => {
    const idx = new RatingDataIndex(formState);
    const topologyRaw =
      globalExtras?.topology_type?.trim() ||
      idx.get("project_details", "project_details", "topology_type") ||
      "2";
    return {
      topologyType: parseInt(topologyRaw, 10) || 2,
      permanentNo:
        globalExtras?.projects_details_permanent_occupancy?.trim() ||
        idx.get("project_details", "project_details", "projects_details_permanent_occupancy") ||
        idx.getRelated("projects_details_permanent_occupancy", "project_details") ||
        "",
      transientNo:
        globalExtras?.projects_details_floating_population?.trim() ||
        idx.get("project_details", "project_details", "projects_details_floating_population") ||
        idx.getRelated("projects_details_floating_population", "project_details") ||
        "",
      defaultAnnualDays:
        globalExtras?.annual_working_days?.trim() ||
        idx.get("project_details", "water_conservation_details", "annual_working_days") ||
        idx.getRelated("annual_working_days", "water_conservation") ||
        "365",
    };
  }, [formState, globalExtras]);

  const dataSignature = useMemo(
    () =>
      JSON.stringify([
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value]),
        computeCtx,
      ]),
    [formState.data, tab, subtab, computeCtx],
  );

  const [activeTab, setActiveTab] = useState<"fte" | "fixtures">("fte");
  const [draft, setDraft] = useState<GiWcTwoAnnexState>(() =>
    hydrateGiWcTwoAnnex(schema, formState, tab, subtab, computeCtx),
  );

  useEffect(() => {
    setDraft(hydrateGiWcTwoAnnex(schema, formState, tab, subtab, computeCtx));
  }, [schema, formState, tab, subtab, dataSignature, computeCtx]);

  const recalc = useCallback(
    (fn: (s: GiWcTwoAnnexState) => GiWcTwoAnnexState) => {
      setDraft((prev) => computeGiWcTwoAnnex(fn(prev), presets, computeCtx));
    },
    [presets, computeCtx],
  );

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromGiWcTwo(draft),
    };
    saveHandleRef.current = handle;
    return () => {
      if (saveHandleRef.current === handle) saveHandleRef.current = null;
    };
  }, [draft, saveHandleRef]);

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(ratingTypeId)) {
    return null;
  }

  const s = draft.scalars;
  const fteTab = layout.fteTabLabel ?? "FTE Calculations";
  const fixturesTab = layout.fixturesTabLabel ?? "Water efficient plumbing fixtures";

  return (
    <div className="space-y-4">
      <div className="rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
      </div>
      <div className="rounded-b-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-4 flex gap-1 border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab("fte")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "fte"
                ? "border-ocean text-ocean"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {fteTab}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("fixtures")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "fixtures"
                ? "border-ocean text-ocean"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {fixturesTab}
          </button>
        </div>

        {activeTab === "fte" ? (
          <FteTab
            draft={draft}
            minPartTime={minPartTime}
            maxPartTime={maxPartTime}
            onRecalc={recalc}
          />
        ) : (
          <FixturesTab presets={presets} scalars={s} onRecalc={recalc} />
        )}
      </div>
    </div>
  );
}

function FteTab({
  draft,
  minPartTime,
  maxPartTime,
  onRecalc,
}: {
  draft: GiWcTwoAnnexState;
  minPartTime: number;
  maxPartTime: number;
  onRecalc: (fn: (s: GiWcTwoAnnexState) => GiWcTwoAnnexState) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-ocean/10">
            <th className="px-3 py-2 text-left font-semibold text-ocean" />
            <th className="px-3 py-2 text-center font-semibold text-ocean">Number</th>
            <th className="px-3 py-2 text-center font-semibold text-ocean">Time Spent (hr)</th>
            <th className="px-3 py-2 text-center font-semibold text-ocean">FTE</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/70">
            <td className="px-3 py-2">Permanent Occupancy (employees and house-keeping staff)</td>
            <td className="px-2 py-1">
              <div className={readonlyClass}>{draft.permanent_no}</div>
            </td>
            <td className="px-2 py-1">
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={draft.permanent_time}
                onChange={(e) =>
                  onRecalc((s) => ({ ...s, permanent_time: clampDecimal(e.target.value) }))
                }
              />
            </td>
            <td className="px-2 py-1">
              <div className={readonlyClass}>{draft.permanent_fte}</div>
            </td>
          </tr>
          <tr>
            <td colSpan={3} />
            <td className="px-2 py-1">
              <button
                type="button"
                disabled={draft.partTimeRows.length >= maxPartTime}
                onClick={() =>
                  onRecalc((s) => ({
                    ...s,
                    partTimeRows: [...s.partTimeRows, { part_time_no: "", part_time_emply: "" }],
                  }))
                }
                className="inline-flex items-center gap-1 rounded-lg bg-ocean px-3 py-1.5 text-sm font-medium text-white hover:bg-ocean-hover disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add More
              </button>
            </td>
          </tr>
          {draft.partTimeRows.map((row, ri) => (
            <tr key={ri} className="border-b border-border/70">
              <td className="px-3 py-2">Part-time employees</td>
              <td className="px-2 py-1">
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  value={row.part_time_no}
                  onChange={(e) =>
                    onRecalc((s) => ({
                      ...s,
                      partTimeRows: s.partTimeRows.map((r, i) =>
                        i === ri ? { ...r, part_time_no: clampDecimal(e.target.value) } : r,
                      ),
                    }))
                  }
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  value={row.part_time_emply}
                  onChange={(e) =>
                    onRecalc((s) => ({
                      ...s,
                      partTimeRows: s.partTimeRows.map((r, i) =>
                        i === ri ? { ...r, part_time_emply: clampDecimal(e.target.value) } : r,
                      ),
                    }))
                  }
                />
              </td>
              <td className="px-2 py-1">
                {ri > 0 ? (
                  <button
                    type="button"
                    disabled={draft.partTimeRows.length <= minPartTime}
                    onClick={() =>
                      onRecalc((s) => ({
                        ...s,
                        partTimeRows: s.partTimeRows.filter((_, i) => i !== ri),
                      }))
                    }
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
          <tr className="border-b border-border/70">
            <td colSpan={3} />
            <td className="px-2 py-1">
              <div className={readonlyClass}>{draft.part_time_fte}</div>
            </td>
          </tr>
          <tr className="border-b border-border/70">
            <td className="px-3 py-2">Transient Occupancy (Visitors)</td>
            <td className="px-2 py-1">
              <div className={readonlyClass}>{draft.transient_no}</div>
            </td>
            <td className="px-2 py-1">
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={draft.transient_time}
                onChange={(e) =>
                  onRecalc((s) => ({ ...s, transient_time: clampDecimal(e.target.value) }))
                }
              />
            </td>
            <td className="px-2 py-1">
              <div className={readonlyClass}>{draft.transient_fte}</div>
            </td>
          </tr>
          <SummaryFteRow label="Total FTE" value={draft.total_fte} />
          <SummaryFteRow label="Total Male Occupants" value={draft.total_male_occupant} />
          <SummaryFteRow label="Total Female Occupants" value={draft.total_female_occupant} />
        </tbody>
      </table>
    </div>
  );
}

function SummaryFteRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-border/70 bg-muted/10">
      <td colSpan={3} className="px-3 py-2 font-medium">
        {label}
      </td>
      <td className="px-2 py-1">
        <div className={readonlyClass}>{value}</div>
      </td>
    </tr>
  );
}

function FixturesTab({
  presets,
  scalars,
  onRecalc,
}: {
  presets: GiWcTwoPresetDef[];
  scalars: Record<string, string>;
  onRecalc: (fn: (s: GiWcTwoAnnexState) => GiWcTwoAnnexState) => void;
}) {
  const setScalar = (param: string, value: string) => {
    onRecalc((s) => ({ ...s, scalars: { ...s.scalars, [param]: value } }));
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-[1400px] w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-ocean/10 text-center">
              <th rowSpan={2} className="border border-border px-2 py-2 font-semibold text-ocean">
                Fixture Type
              </th>
              <th rowSpan={2} className="border border-border px-2 py-2 font-semibold text-ocean">
                Duration
              </th>
              <th className="border border-border px-2 py-2 font-semibold text-ocean">
                Estimated Daily Uses per FTE
              </th>
              <th className="border border-border px-2 py-2 font-semibold text-ocean" />
              <th rowSpan={2} className="border border-border px-2 py-2 font-semibold text-ocean">
                Total FTE
              </th>
              <th colSpan={3} className="border border-border px-2 py-2 font-semibold text-ocean">
                Base Line
              </th>
              <th colSpan={3} className="border border-border px-2 py-2 font-semibold text-ocean">
                Proposed
              </th>
              <th rowSpan={2} className="border border-border px-2 py-2 font-semibold text-ocean">
                Action
              </th>
            </tr>
            <tr className="border-b border-border bg-ocean/5 text-center">
              <th className="border border-border px-2 py-2" />
              <th className="border border-border px-2 py-2" />
              <th className="border border-border px-2 py-2">Maximum Flow Rate / Consumption</th>
              <th className="border border-border px-2 py-2">Baseline Unit</th>
              <th className="border border-border px-2 py-2">Water Consumption (per day)</th>
              <th className="border border-border px-2 py-2">Maximum Flow Rate / Consumption</th>
              <th className="border border-border px-2 py-2">Unit</th>
              <th className="border border-border px-2 py-2">Water Consumption (per day)</th>
            </tr>
          </thead>
          <tbody>
            {presets.map((preset) => (
              <FixtureRow
                key={preset.id}
                preset={preset}
                scalars={scalars}
                onScalar={setScalar}
                onClear={() => onRecalc((s) => clearGiFixtureRow(s, preset))}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full max-w-4xl border-collapse text-sm">
          <tbody>
            <SummaryPairRow
              label="Daily volume from flush fixtures (Black water) (liters)"
              base={scalars.flush_base_total ?? "0"}
              proposed={scalars.flush_proposed_total ?? "0"}
            />
            <SummaryPairRow
              label="Daily volume from flow fixtures (Grey water) (liters)"
              base={scalars.fixture_base_total ?? "0"}
              proposed={scalars.fixture_proposed_total ?? "0"}
            />
            <tr className="border-b border-border">
              <td className="px-3 py-2 text-right font-medium" colSpan={2}>
                Annual Working Days
              </td>
              <td className="px-2 py-1.5">
                <input
                  className={inputClass}
                  type="number"
                  min={1}
                  max={365}
                  value={scalars.annual_days ?? "365"}
                  onChange={(e) => setScalar("annual_days", clampDecimal(e.target.value))}
                />
              </td>
              <td className="px-2 py-2 text-muted-foreground">Days</td>
            </tr>
            <SummaryPairRow
              label="Annual volume from flush fixtures (Black water) (liters/annum)"
              base={scalars.annual_flush_base ?? "0"}
              proposed={scalars.annual_flush_proposed ?? "0"}
            />
            <SummaryPairRow
              label="Annual volume from flow fixtures (Grey water) (liters/annum)"
              base={scalars.annual_fixture_base ?? "0"}
              proposed={scalars.annual_fixture_proposed ?? "0"}
            />
            <SummaryPairRow
              label="Annual volume from flush & flow fixtures (liters/annum)"
              base={scalars.total_volume_base ?? "0"}
              proposed={scalars.total_volume_proposed ?? "0"}
            />
            <tr className="border-b border-border">
              <td className="px-3 py-2 text-right font-medium" colSpan={2}>
                Annual Water Saving (liters/annum)
              </td>
              <td className="px-2 py-1.5" colSpan={2}>
                <input className={readonlyClass} readOnly value={scalars.saving_annual ?? "0"} />
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="px-3 py-2 text-right font-medium" colSpan={2}>
                Percentage Savings (%)
              </td>
              <td className="px-2 py-1.5" colSpan={2}>
                <input className={readonlyClass} readOnly value={scalars.saving_percentage ?? "0"} />
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-right font-medium" colSpan={2}>
                Meets Mandatory Requirement
              </td>
              <td className="px-2 py-1.5" colSpan={2}>
                <input className={readonlyClass} readOnly value={scalars.annex_mandatory ?? "Yes"} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FixtureRow({
  preset,
  scalars,
  onScalar,
  onClear,
}: {
  preset: GiWcTwoPresetDef;
  scalars: Record<string, string>;
  onScalar: (param: string, value: string) => void;
  onClear: () => void;
}) {
  const prefix = preset.prefix;
  const occupantOpts = preset.defaults.readOnlyOccupantStatus
    ? { both: "Both" }
    : { "": "Select", male: "Male", female: "Female", both: "Both" };

  return (
    <tr className="border-b border-border/70 text-center">
      <td className="border border-border px-2 py-1.5 text-left text-sm">{preset.fixtureType}</td>
      <td className="border border-border px-2 py-1.5">
        <div className={readonlyClass}>{scalars[`${prefix}_duration`] ?? ""}</div>
      </td>
      <td className="border border-border px-2 py-1.5">
        <div className={readonlyClass}>{scalars[`${prefix}_daily`] ?? ""}</div>
      </td>
      <td className="border border-border px-2 py-1.5">
        <select
          className={inputClass}
          value={scalars[preset.occupantStatusParam] ?? ""}
          disabled={preset.defaults.readOnlyOccupantStatus}
          onChange={(e) => onScalar(preset.occupantStatusParam, e.target.value)}
        >
          {Object.entries(occupantOpts).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td className="border border-border px-2 py-1.5">
        <div className={readonlyClass}>{scalars[`${prefix}_total_fte`] ?? ""}</div>
      </td>
      <td className="border border-border px-2 py-1.5">
        <div className={readonlyClass}>{scalars[`${prefix}_base`] ?? ""}</div>
      </td>
      <td className="border border-border px-2 py-1.5">
        <div className={readonlyClass}>{(scalars[preset.unitTypeParam] ?? "lpf").toUpperCase()}</div>
      </td>
      <td className="border border-border px-2 py-1.5">
        <div className={readonlyClass}>{scalars[`${prefix}_total_use`] ?? "0"}</div>
      </td>
      <td className="border border-border px-2 py-1.5">
        <input
          type="number"
          step="0.01"
          className={inputClass}
          value={scalars[`${prefix}_proposed`] ?? ""}
          onChange={(e) => onScalar(`${prefix}_proposed`, clampDecimal(e.target.value))}
        />
      </td>
      <td className="border border-border px-2 py-1.5">
        <div className={readonlyClass}>{(scalars[preset.proposedUnitParam] ?? "lpf").toUpperCase()}</div>
      </td>
      <td className="border border-border px-2 py-1.5">
        <div className={readonlyClass}>{scalars[`${prefix}_proposed_total`] ?? "0"}</div>
      </td>
      <td className="border border-border px-2 py-1.5">
        <button
          type="button"
          onClick={onClear}
          className="rounded-md px-2 py-1 text-xs font-medium text-ocean hover:bg-ocean/10"
        >
          Clear
        </button>
      </td>
    </tr>
  );
}

function SummaryPairRow({
  label,
  base,
  proposed,
}: {
  label: string;
  base: string;
  proposed: string;
}) {
  return (
    <tr className="border-b border-border">
      <td className="px-3 py-2 text-right font-medium" colSpan={2}>
        {label}
      </td>
      <td className="px-2 py-1.5">
        <input className={readonlyClass} readOnly value={base} />
      </td>
      <td className="px-2 py-1.5">
        <input className={readonlyClass} readOnly value={proposed} />
      </td>
    </tr>
  );
}
