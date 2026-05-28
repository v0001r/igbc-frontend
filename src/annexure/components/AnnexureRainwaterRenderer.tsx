import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import {
  averagePeakRainfall,
  computeRainwaterSummary,
  computeSurfaceRow,
  onedayFromCase,
  sumImpervious,
} from "@/annexure/annexRainwaterCalculations";
import {
  buildSavePayloadFromRainwater,
  hydrateRainwaterAnnex,
  type RainwaterAnnexState,
} from "@/annexure/annexRainwaterStorage";
import type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";
import { SummarySection } from "@/annexure/components/SummarySection";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { RatingDataIndex } from "@/lib/ratingDataIndex";
import { Plus, Trash2 } from "lucide-react";
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

function recalcState(
  draft: RainwaterAnnexState,
  coeffs: Record<string, number>,
  ratingTypeId: number,
): RainwaterAnnexState {
  const average = averagePeakRainfall(draft.rainfallRows);
  const avgNum = parseFloat(average) || 0;
  const { oneday, caseRange } = onedayFromCase(draft.case, avgNum, ratingTypeId);

  const surfaceRows = draft.surfaceRows.map((row) => {
    const next = computeSurfaceRow(String(row.surface ?? ""), String(row.area ?? ""), coeffs);
    return { ...row, runoff: next.runoff, imprevious_area: next.imprevious_area };
  });

  const total_rain = sumImpervious(surfaceRows);
  const summary = computeRainwaterSummary({
    caseVal: draft.case,
    totalRain: parseFloat(total_rain) || 0,
    average: avgNum,
    oneday: parseFloat(oneday) || 0,
    harvesting: parseFloat(draft.harvesting) || 0,
    ratingTypeId,
  });

  return {
    ...draft,
    average,
    oneday,
    caseRange,
    surfaceRows,
    total_rain,
    ...summary,
  };
}

export function AnnexureRainwaterRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  globalExtras,
  saveHandleRef,
}: Props) {
  const layout = schema.rainwaterLayout!;
  const coeffs = (schema.lookupMaps?.runoffCoefficients ?? {}) as Record<string, number>;
  const surfaceColumns = layout.surfaceTable?.columns ?? [];
  const minSurfaceRows = layout.surfaceTable?.minRows ?? 1;
  const maxSurfaceRows = layout.surfaceTable?.maxRows ?? 50;

  const harvestingCapacity = useMemo(() => {
    const idx = new RatingDataIndex(formState);
    const fromExtras = globalExtras?.rainwater_harvesting_capacity?.trim();
    if (fromExtras) return fromExtras;
    return (
      idx.get("project_details", "water_conservation_details", "rainwater_harvesting_capacity") ||
      idx.getRelated("rainwater_harvesting_capacity", "water_conservation") ||
      ""
    );
  }, [formState, globalExtras]);

  const dataSignature = useMemo(
    () =>
      JSON.stringify([
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value]),
        harvestingCapacity,
      ]),
    [formState.data, tab, subtab, harvestingCapacity],
  );

  const [draft, setDraft] = useState<RainwaterAnnexState>(() =>
    recalcState(
      hydrateRainwaterAnnex(schema, formState, tab, subtab, harvestingCapacity),
      coeffs,
      ratingTypeId,
    ),
  );

  useEffect(() => {
    setDraft(
      recalcState(
        hydrateRainwaterAnnex(schema, formState, tab, subtab, harvestingCapacity),
        coeffs,
        ratingTypeId,
      ),
    );
  }, [schema, formState, tab, subtab, dataSignature, harvestingCapacity, coeffs, ratingTypeId]);

  const updateSave = useCallback(() => {
    saveHandleRef.current = {
      getSaveFields: () => buildSavePayloadFromRainwater(draft),
    };
  }, [draft, saveHandleRef]);

  useEffect(() => {
    updateSave();
    return () => {
      saveHandleRef.current = null;
    };
  }, [updateSave]);

  const setDraftRecalc = useCallback(
    (fn: (s: RainwaterAnnexState) => RainwaterAnnexState) => {
      setDraft((prev) => recalcState(fn(prev), coeffs, ratingTypeId));
    },
    [coeffs, ratingTypeId],
  );

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(ratingTypeId)) {
    return null;
  }

  const yearOpts = layout.rainfall.yearOptions ?? {};
  const monthOpts = layout.rainfall.monthOptions ?? {};
  const caseOpts = layout.caseOptions ?? {};

  return (
    <div className="space-y-4">
      <div className="rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
      </div>
      <div className="space-y-6 rounded-b-xl border border-border bg-card p-4 shadow-sm">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-ocean/10">
                <th colSpan={4} className="px-3 py-2 text-center font-semibold text-ocean">
                  Last 5 Year Rainfall Average
                </th>
              </tr>
              <tr className="border-b border-border bg-ocean/5">
                <th className="px-2 py-2 text-left font-medium text-ocean">Location</th>
                <th className="px-2 py-2 text-left font-medium text-ocean">Past Years</th>
                <th className="px-2 py-2 text-left font-medium text-ocean">Peak Month</th>
                <th className="px-2 py-2 text-left font-medium text-ocean">Peak Monthly Rainfall</th>
              </tr>
            </thead>
            <tbody>
              {draft.rainfallRows.map((row, ri) => (
                <tr key={ri} className="border-b border-border/70 odd:bg-muted/15">
                  {ri === 0 ? (
                    <td rowSpan={draft.rainfallRows.length} className="px-2 py-1 align-top">
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="Project Location"
                        value={draft.location}
                        onChange={(e) => setDraftRecalc((s) => ({ ...s, location: e.target.value }))}
                      />
                    </td>
                  ) : null}
                  <td className="px-2 py-1">
                    <select
                      className={inputClass}
                      value={row.years}
                      onChange={(e) =>
                        setDraftRecalc((s) => {
                          const rainfallRows = s.rainfallRows.map((r, i) =>
                            i === ri ? { ...r, years: e.target.value } : r,
                          );
                          return { ...s, rainfallRows };
                        })
                      }
                    >
                      {Object.entries(yearOpts).map(([val, label]) => (
                        <option key={val} value={val}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1">
                    <select
                      className={inputClass}
                      value={row.peak_month}
                      onChange={(e) =>
                        setDraftRecalc((s) => {
                          const rainfallRows = s.rainfallRows.map((r, i) =>
                            i === ri ? { ...r, peak_month: e.target.value } : r,
                          );
                          return { ...s, rainfallRows };
                        })
                      }
                    >
                      {Object.entries(monthOpts).map(([val, label]) => (
                        <option key={val} value={val}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="number"
                      step="0.01"
                      className={inputClass}
                      value={row.rainfall}
                      onChange={(e) =>
                        setDraftRecalc((s) => {
                          const rainfallRows = s.rainfallRows.map((r, i) =>
                            i === ri ? { ...r, rainfall: clampDecimal(e.target.value) } : r,
                          );
                          return { ...s, rainfallRows };
                        })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/20">
                <td colSpan={3} className="px-3 py-2 font-medium">
                  Average Peak Monthly Rainfall
                </td>
                <td className="px-2 py-2">
                  <div className={readonlyClass}>{draft.average}</div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full max-w-xl border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-ocean/10">
                <th colSpan={2} className="px-3 py-2 text-center font-semibold text-ocean">
                  One-Day Rainfall Calculation
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/70">
                <td className="px-3 py-2 font-medium">Applicability</td>
                <td className="px-2 py-1">
                  <select
                    className={inputClass}
                    value={draft.case}
                    onChange={(e) => setDraftRecalc((s) => ({ ...s, case: e.target.value }))}
                  >
                    {Object.entries(caseOpts).map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr className="border-b border-border/70">
                <td className="px-3 py-2 font-medium">One-Day Rainfall (m)</td>
                <td className="px-2 py-1">
                  <div className={readonlyClass}>{draft.oneday}</div>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Range</td>
                <td className="px-2 py-1 text-sm text-muted-foreground">{draft.caseRange || "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() =>
                setDraftRecalc((s) => ({
                  ...s,
                  surfaceRows: [...s.surfaceRows, { surface: "", runoff: "", area: "", imprevious_area: "0" }],
                }))
              }
              disabled={draft.surfaceRows.length >= maxSurfaceRows}
              className="inline-flex items-center gap-1.5 rounded-lg bg-ocean px-4 py-2 text-sm font-medium text-white hover:bg-ocean-hover disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {layout.surfaceTable?.addRowLabel ?? "Add Row"}
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-ocean/10">
                  <th className="w-12 px-2 py-2 text-center font-semibold text-ocean">S.No</th>
                  {surfaceColumns.map((c) => (
                    <th key={c.id} className="px-2 py-2 text-center font-semibold text-ocean">
                      {c.header}
                    </th>
                  ))}
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {draft.surfaceRows.map((row, ri) => (
                  <tr key={ri} className="border-b border-border/70 odd:bg-muted/15">
                    <td className="px-2 py-1 text-center text-muted-foreground">{ri + 1}</td>
                    {surfaceColumns.map((c) => (
                      <td key={c.id} className="px-2 py-1">
                        {c.type === "select" && c.options ? (
                          <select
                            className={inputClass}
                            value={row[c.param] ?? ""}
                            onChange={(e) =>
                              setDraftRecalc((s) => ({
                                ...s,
                                surfaceRows: s.surfaceRows.map((r, i) =>
                                  i === ri ? { ...r, [c.param]: e.target.value } : r,
                                ),
                              }))
                            }
                          >
                            {Object.entries(c.options).map(([val, label]) => (
                              <option key={val} value={val}>
                                {label}
                              </option>
                            ))}
                          </select>
                        ) : c.type === "readonly" || c.computed ? (
                          <div className={readonlyClass}>{row[c.param] ?? ""}</div>
                        ) : (
                          <input
                            type="number"
                            step={c.step ?? "0.01"}
                            className={inputClass}
                            value={row[c.param] ?? ""}
                            onChange={(e) =>
                              setDraftRecalc((s) => ({
                                ...s,
                                surfaceRows: s.surfaceRows.map((r, i) =>
                                  i === ri
                                    ? {
                                        ...r,
                                        [c.param]:
                                          c.step === "0.01" ? clampDecimal(e.target.value) : e.target.value,
                                      }
                                    : r,
                                ),
                              }))
                            }
                          />
                        )}
                      </td>
                    ))}
                    <td className="px-1 py-1 text-center">
                      <button
                        type="button"
                        disabled={draft.surfaceRows.length <= minSurfaceRows}
                        onClick={() =>
                          setDraftRecalc((s) => ({
                            ...s,
                            surfaceRows: s.surfaceRows.filter((_, i) => i !== ri),
                          }))
                        }
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <SummarySection
          rows={layout.summary ?? []}
          values={{
            total_rain: draft.total_rain,
            mandatory_harvesting: draft.mandatory_harvesting,
            harvesting: draft.harvesting,
            requirment: draft.requirment,
            avg_rainfall: draft.avg_rainfall,
          }}
        />
      </div>
    </div>
  );
}
