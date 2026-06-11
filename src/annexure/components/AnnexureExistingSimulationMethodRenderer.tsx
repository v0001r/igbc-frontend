import {
  computeExistingSimulationMethodState,
  EXISTING_SIMULATION_DEFAULT_HVAC_ROW,
  EXISTING_SIMULATION_DEFAULT_OUTPUT_ROW,
  type ExistingSimulationMethodState,
} from "@/annexure/annexExistingSimulationMethodCalculations";
import {
  buildSavePayloadFromExistingSimulationMethod,
  hydrateExistingSimulationMethodAnnex,
} from "@/annexure/annexExistingSimulationMethodStorage";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { MutableRefObject } from "react";

const textareaClass =
  "min-h-[2.25rem] w-full resize-y rounded-md border border-input bg-background px-2 py-1.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/30";
const inputClass =
  "h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/30";
const readonlyClass =
  "h-9 w-full min-w-0 rounded-md border border-transparent bg-muted/50 px-2 text-sm text-muted-foreground";
const cellBorder = "border border-border";

type TabKey = "envelope" | "lighting" | "hvac" | "simulation";

type Props = {
  schema: AnnexureSchemaDefinition;
  tab: string;
  subtab: string;
  ratingTypeId: number;
  formState: CertificationFormResponse;
  saveHandleRef: MutableRefObject<AnnexureRendererHandle | null>;
};

function clampDecimal(raw: string): string {
  if (raw === "" || raw === ".") return raw;
  if (!raw.includes(".")) return raw;
  const [w, f] = raw.split(".");
  return f.length > 2 ? `${w}.${f.slice(0, 2)}` : raw;
}

function ComparisonTable({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <h4 className="mb-2 text-sm font-semibold">{title}</h4>
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="bg-muted/30">
            <th colSpan={2} className={`${cellBorder} px-3 py-2 text-left font-medium`}>
              Description
            </th>
            <th className={`${cellBorder} px-3 py-2 text-left font-medium`}>
              Base Case Input Parameter Construction
            </th>
            <th className={`${cellBorder} px-3 py-2 text-left font-medium`}>
              Existing Case Input Parameter Construction
            </th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function ScalarTextareaRow({
  label,
  baseParam,
  existingParam,
  values,
  onChange,
  groupLabel,
  groupRowSpan,
}: {
  label: string;
  baseParam: string;
  existingParam: string;
  values: Record<string, string>;
  onChange: (param: string, value: string) => void;
  groupLabel?: string;
  groupRowSpan?: number;
}) {
  return (
    <tr>
      {groupLabel ? (
        <td
          rowSpan={groupRowSpan}
          className={`${cellBorder} px-3 py-2 align-middle text-sm font-medium`}
        >
          {groupLabel}
        </td>
      ) : null}
      <td colSpan={groupLabel ? 1 : 2} className={`${cellBorder} px-3 py-2 text-sm`}>
        {label}
      </td>
      <td className={`${cellBorder} px-2 py-1.5`}>
        <textarea
          className={textareaClass}
          rows={1}
          value={values[baseParam] ?? ""}
          onChange={(e) => onChange(baseParam, e.target.value)}
        />
      </td>
      <td className={`${cellBorder} px-2 py-1.5`}>
        <textarea
          className={textareaClass}
          rows={1}
          value={values[existingParam] ?? ""}
          onChange={(e) => onChange(existingParam, e.target.value)}
        />
      </td>
    </tr>
  );
}

export function AnnexureExistingSimulationMethodRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  saveHandleRef,
}: Props) {
  const layout = schema.existingSimulationMethodLayout ?? {};
  const maxHvac = layout.maxHvacRows ?? 50;
  const maxSimulation = layout.maxSimulationRows ?? 50;

  const dataSignature = useMemo(
    () =>
      JSON.stringify(
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value]),
      ),
    [formState.data, tab, subtab],
  );

  const [activeTab, setActiveTab] = useState<TabKey>("envelope");
  const [draft, setDraft] = useState<ExistingSimulationMethodState>(() =>
    hydrateExistingSimulationMethodAnnex(schema, formState, tab, subtab),
  );

  useEffect(() => {
    setDraft(hydrateExistingSimulationMethodAnnex(schema, formState, tab, subtab));
  }, [schema, formState, tab, subtab, dataSignature]);

  const recalc = useCallback((fn: (s: ExistingSimulationMethodState) => ExistingSimulationMethodState) => {
    setDraft((prev) => computeExistingSimulationMethodState(fn(prev)));
  }, []);

  const onScalarChange = useCallback(
    (param: string, value: string) => {
      recalc((s) => ({
        ...s,
        scalars: { ...s.scalars, [param]: value },
      }));
    },
    [recalc],
  );

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromExistingSimulationMethod(draft),
    };
    saveHandleRef.current = handle;
    return () => {
      if (saveHandleRef.current === handle) saveHandleRef.current = null;
    };
  }, [draft, saveHandleRef]);

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(ratingTypeId)) {
    return null;
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "envelope", label: "BUILDING ENVELOPE" },
    { key: "lighting", label: "LIGHTING SYSTEMS" },
    { key: "hvac", label: "HVAC SYSTEM" },
    { key: "simulation", label: "SIMULATION OUTPUT" },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
      </div>
      <div className="rounded-b-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-1 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`border-b-2 px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
                activeTab === t.key
                  ? "border-ocean text-ocean"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "envelope" ? (
          <ComparisonTable title="Building Envelope">
            <ScalarTextareaRow
              label="Exterior Wall Construction: U Value (Btu/hr sq.ft°F)"
              baseParam="exterior_wall"
              existingParam="exterior_wall_base"
              values={draft.scalars}
              onChange={onScalarChange}
            />
            <ScalarTextareaRow
              label="Roof Construction: U Value (Btu/hr sq.ft°F)"
              baseParam="roof_cons"
              existingParam="roof_cons_base"
              values={draft.scalars}
              onChange={onScalarChange}
            />
            <tr>
              <td colSpan={4} className={`${cellBorder} h-2`} />
            </tr>
            <ScalarTextareaRow
              label="U Value (W/m2 K)"
              baseParam="fenestration"
              existingParam="fenestration_base"
              values={draft.scalars}
              onChange={onScalarChange}
              groupLabel="Fenestration"
              groupRowSpan={2}
            />
            <ScalarTextareaRow
              label="SHGC"
              baseParam="shgc_simulation"
              existingParam="design_shgc_simulation"
              values={draft.scalars}
              onChange={onScalarChange}
            />
            <tr>
              <td colSpan={4} className={`${cellBorder} h-2`} />
            </tr>
            <ScalarTextareaRow
              label="WWR (Window to Wall Ratio)"
              baseParam="wwr_ratio"
              existingParam="wwr_ratio_base"
              values={draft.scalars}
              onChange={onScalarChange}
            />
            <ScalarTextareaRow
              label="Skylight Ratio"
              baseParam="sky_ratio"
              existingParam="sky_ratio_base"
              values={draft.scalars}
              onChange={onScalarChange}
            />
          </ComparisonTable>
        ) : null}

        {activeTab === "lighting" ? (
          <ComparisonTable title="Lighting System">
            <ScalarTextareaRow
              label="Lighting Power Density (W/sq ft.)"
              baseParam="lighting_power"
              existingParam="lighting_power_base"
              values={draft.scalars}
              onChange={onScalarChange}
            />
            <ScalarTextareaRow
              label="Equipment Power Density (W/sq ft.)"
              baseParam="equipment_power"
              existingParam="equipment_power_base"
              values={draft.scalars}
              onChange={onScalarChange}
            />
            <ScalarTextareaRow
              label="Lighting Controls"
              baseParam="ligting_controls"
              existingParam="ligting_controls_base"
              values={draft.scalars}
              onChange={onScalarChange}
            />
            <ScalarTextareaRow
              label="Exterior Power (W/sq ft.)"
              baseParam="exterior_power"
              existingParam="exterior_power_base"
              values={draft.scalars}
              onChange={onScalarChange}
            />
          </ComparisonTable>
        ) : null}

        {activeTab === "hvac" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">HVAC System</h4>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md bg-ocean px-3 py-1.5 text-sm text-white hover:bg-ocean/90"
                onClick={() =>
                  recalc((s) =>
                    s.hvacRows.length >= maxHvac
                      ? s
                      : { ...s, hvacRows: [...s.hvacRows, { ...EXISTING_SIMULATION_DEFAULT_HVAC_ROW }] },
                  )
                }
              >
                <Plus className="h-4 w-4" />
                Add Row
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/30">
                    <th colSpan={2} className={`${cellBorder} px-3 py-2 text-left font-medium`}>
                      Description
                    </th>
                    <th className={`${cellBorder} px-3 py-2 text-left font-medium`}>
                      Base Case Input Parameter Construction
                    </th>
                    <th className={`${cellBorder} px-3 py-2 text-left font-medium`}>
                      Existing Case Input Parameter Construction
                    </th>
                    <th className={`${cellBorder} w-10`} />
                  </tr>
                </thead>
                <tbody>
                  {draft.hvacRows.map((row, i) => (
                    <tr key={i}>
                      <td colSpan={2} className={`${cellBorder} px-2 py-1.5`}>
                        <input
                          className={inputClass}
                          value={row.lighting_type}
                          onChange={(e) =>
                            recalc((s) => ({
                              ...s,
                              hvacRows: s.hvacRows.map((r, idx) =>
                                idx === i ? { ...r, lighting_type: e.target.value } : r,
                              ),
                            }))
                          }
                        />
                      </td>
                      <td className={`${cellBorder} px-2 py-1.5`}>
                        <input
                          className={inputClass}
                          value={row.lighting_power_hvac}
                          onChange={(e) =>
                            recalc((s) => ({
                              ...s,
                              hvacRows: s.hvacRows.map((r, idx) =>
                                idx === i ? { ...r, lighting_power_hvac: e.target.value } : r,
                              ),
                            }))
                          }
                        />
                      </td>
                      <td className={`${cellBorder} px-2 py-1.5`}>
                        <input
                          className={inputClass}
                          value={row.lighting_power_base_hvac}
                          onChange={(e) =>
                            recalc((s) => ({
                              ...s,
                              hvacRows: s.hvacRows.map((r, idx) =>
                                idx === i ? { ...r, lighting_power_base_hvac: e.target.value } : r,
                              ),
                            }))
                          }
                        />
                      </td>
                      <td className={`${cellBorder} px-1 py-1.5 text-center`}>
                        <button
                          type="button"
                          className="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-40"
                          disabled={draft.hvacRows.length <= 1}
                          onClick={() =>
                            recalc((s) =>
                              s.hvacRows.length <= 1
                                ? s
                                : { ...s, hvacRows: s.hvacRows.filter((_, idx) => idx !== i) },
                            )
                          }
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
        ) : null}

        {activeTab === "simulation" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Simulation Output</h4>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md bg-ocean px-3 py-1.5 text-sm text-white hover:bg-ocean/90"
                onClick={() =>
                  recalc((s) =>
                    s.simulationRows.length >= maxSimulation
                      ? s
                      : {
                          ...s,
                          simulationRows: [
                            ...s.simulationRows,
                            { ...EXISTING_SIMULATION_DEFAULT_OUTPUT_ROW },
                          ],
                        },
                  )
                }
              >
                <Plus className="h-4 w-4" />
                Add More
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/30 text-center">
                    <th className={`${cellBorder} px-2 py-2`}>S.No</th>
                    <th className={`${cellBorder} px-2 py-2`}>END USES</th>
                    <th className={`${cellBorder} px-2 py-2`}>
                      Base Case - Energy Consumption (kWh)
                    </th>
                    <th className={`${cellBorder} px-2 py-2`}>
                      Existing Case - Energy Consumption (kWh)
                    </th>
                    <th className={`${cellBorder} px-2 py-2`}>Percentage (%)</th>
                    <th className={`${cellBorder} w-10`} />
                  </tr>
                </thead>
                <tbody>
                  {draft.simulationRows.map((row, i) => (
                    <tr key={i} className="text-center">
                      <td className={`${cellBorder} px-2 py-1.5`}>{i + 1}</td>
                      <td className={`${cellBorder} px-2 py-1.5`}>
                        <input
                          className={inputClass}
                          value={row.existing_overall_enegry}
                          onChange={(e) =>
                            recalc((s) => ({
                              ...s,
                              simulationRows: s.simulationRows.map((r, idx) =>
                                idx === i ? { ...r, existing_overall_enegry: e.target.value } : r,
                              ),
                            }))
                          }
                        />
                      </td>
                      <td className={`${cellBorder} px-2 py-1.5`}>
                        <input
                          type="number"
                          step="0.01"
                          className={inputClass}
                          value={row.existing_baseline_simulation}
                          onChange={(e) =>
                            recalc((s) => ({
                              ...s,
                              simulationRows: s.simulationRows.map((r, idx) =>
                                idx === i
                                  ? { ...r, existing_baseline_simulation: clampDecimal(e.target.value) }
                                  : r,
                              ),
                            }))
                          }
                        />
                      </td>
                      <td className={`${cellBorder} px-2 py-1.5`}>
                        <input
                          type="number"
                          step="0.01"
                          className={inputClass}
                          value={row.existing_baseline_90}
                          onChange={(e) =>
                            recalc((s) => ({
                              ...s,
                              simulationRows: s.simulationRows.map((r, idx) =>
                                idx === i
                                  ? { ...r, existing_baseline_90: clampDecimal(e.target.value) }
                                  : r,
                              ),
                            }))
                          }
                        />
                      </td>
                      <td className={`${cellBorder} px-2 py-1.5`}>
                        <input readOnly className={readonlyClass} value={row.existing_baseline_average} />
                      </td>
                      <td className={`${cellBorder} px-1 py-1.5`}>
                        <button
                          type="button"
                          className="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-40"
                          disabled={draft.simulationRows.length <= 1}
                          onClick={() =>
                            recalc((s) =>
                              s.simulationRows.length <= 1
                                ? s
                                : {
                                    ...s,
                                    simulationRows: s.simulationRows.filter((_, idx) => idx !== i),
                                  },
                            )
                          }
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
        ) : null}
      </div>
    </div>
  );
}
