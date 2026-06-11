import {
  computeExistingWaterEfficiencyState,
  emptyBuilding,
  emptyFixtureRow,
  isFixtureFieldReadonly,
  type ExistingWaterEfficiencyBuilding,
  type ExistingWaterEfficiencyLockedRowDef,
  type ExistingWaterEfficiencyRow,
  type ExistingWaterEfficiencyState,
} from "@/annexure/annexExistingWaterEfficiencyCalculations";
import {
  buildSavePayloadFromExistingWaterEfficiency,
  hydrateExistingWaterEfficiencyAnnex,
} from "@/annexure/annexExistingWaterEfficiencyStorage";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { Plus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MutableRefObject, ReactNode } from "react";

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
  saveHandleRef: MutableRefObject<AnnexureRendererHandle | null>;
};

function clampDecimal(raw: string): string {
  if (raw === "" || raw === ".") return raw;
  if (!raw.includes(".")) return raw;
  const [w, f] = raw.split(".");
  return f.length > 2 ? `${w}.${f.slice(0, 2)}` : raw;
}

function NumInput({
  value,
  onChange,
  readOnly,
  placeholder,
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}) {
  if (readOnly) {
    return <input readOnly className={readonlyClass} value={value} placeholder={placeholder} />;
  }
  return (
    <input
      type="number"
      step="0.01"
      className={inputClass}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange?.(clampDecimal(e.target.value))}
    />
  );
}

export function AnnexureExistingWaterEfficiencyRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  saveHandleRef,
}: Props) {
  const layout = schema.existingWaterEfficiencyLayout ?? {};
  const lockedRows: ExistingWaterEfficiencyLockedRowDef[] = layout.lockedRows ?? [];
  const maxBuildings = layout.maxBuildings ?? 20;
  const minBuildings = layout.minBuildings ?? 1;
  const maxRows = layout.maxRowsPerBuilding ?? 50;
  const addBuildingLabel = layout.addBuildingLabel ?? "Add Building";
  const lockExtraRowCalcFields = layout.lockExtraRowCalcFields !== false;
  const showMandatoryRequirement = layout.showMandatoryRequirement !== false;
  const showBuildingIndexInHeader = layout.showBuildingIndexInHeader === true;
  const dailyUsesHeader = layout.dailyUsesHeader ?? "Daily Uses per Person/ Day";
  const flowRateHeader = layout.flowRateHeader ?? "Flow Rate Capacity";

  const dataSignature = useMemo(
    () =>
      JSON.stringify(
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value]),
      ),
    [formState.data, tab, subtab],
  );

  const [draft, setDraft] = useState<ExistingWaterEfficiencyState>(() =>
    hydrateExistingWaterEfficiencyAnnex(schema, formState, tab, subtab),
  );

  useEffect(() => {
    setDraft(hydrateExistingWaterEfficiencyAnnex(schema, formState, tab, subtab));
  }, [schema, formState, tab, subtab, dataSignature]);

  const recalc = useCallback((fn: (s: ExistingWaterEfficiencyState) => ExistingWaterEfficiencyState) => {
    setDraft((prev) => computeExistingWaterEfficiencyState(fn(prev)));
  }, []);

  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => buildSavePayloadFromExistingWaterEfficiency(schema, draft),
    };
    saveHandleRef.current = handle;
    return () => {
      if (saveHandleRef.current === handle) saveHandleRef.current = null;
    };
  }, [draft, schema, saveHandleRef]);

  const addBuilding = useCallback(() => {
    recalc((s) => {
      if (s.buildings.length >= maxBuildings) return s;
      const nextIndex = s.buildings.reduce((m, b) => Math.max(m, b.tableIndex), 0) + 1;
      return { ...s, buildings: [...s.buildings, emptyBuilding(nextIndex, lockedRows)] };
    });
  }, [lockedRows, maxBuildings, recalc]);

  const removeBuilding = useCallback(
    (tableIndex: number) => {
      recalc((s) => {
        if (s.buildings.length <= minBuildings) return s;
        return { ...s, buildings: s.buildings.filter((b) => b.tableIndex !== tableIndex) };
      });
    },
    [minBuildings, recalc],
  );

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(Number(ratingTypeId))) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
      </div>
      <div className="rounded-b-xl border border-border bg-card p-4 shadow-sm space-y-6">
        <button
          type="button"
          onClick={addBuilding}
          disabled={draft.buildings.length >= maxBuildings}
          className="inline-flex items-center gap-1.5 rounded-lg bg-ocean px-4 py-2 text-sm font-medium text-white hover:bg-ocean-hover disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {addBuildingLabel}
        </button>

        {draft.buildings.map((building) => (
          <BuildingTable
            key={building.tableIndex}
            building={building}
            lockedRows={lockedRows}
            lockExtraRowCalcFields={lockExtraRowCalcFields}
            showMandatoryRequirement={showMandatoryRequirement}
            showBuildingIndexInHeader={showBuildingIndexInHeader}
            dailyUsesHeader={dailyUsesHeader}
            flowRateHeader={flowRateHeader}
            canRemove={draft.buildings.length > minBuildings}
            maxRows={maxRows}
            onRemove={() => removeBuilding(building.tableIndex)}
            onChange={(updater) =>
              recalc((s) => ({
                ...s,
                buildings: s.buildings.map((b) =>
                  b.tableIndex === building.tableIndex ? updater(b) : b,
                ),
              }))
            }
          />
        ))}
      </div>
    </div>
  );
}

function BuildingTable({
  building,
  lockedRows,
  lockExtraRowCalcFields,
  showMandatoryRequirement,
  showBuildingIndexInHeader,
  dailyUsesHeader,
  flowRateHeader,
  canRemove,
  maxRows,
  onRemove,
  onChange,
}: {
  building: ExistingWaterEfficiencyBuilding;
  lockedRows: ExistingWaterEfficiencyLockedRowDef[];
  lockExtraRowCalcFields: boolean;
  showMandatoryRequirement: boolean;
  showBuildingIndexInHeader: boolean;
  dailyUsesHeader: string;
  flowRateHeader: string;
  canRemove: boolean;
  maxRows: number;
  onRemove: () => void;
  onChange: (fn: (b: ExistingWaterEfficiencyBuilding) => ExistingWaterEfficiencyBuilding) => void;
}) {
  const isReadonly = (rowIndex: number, field: keyof ExistingWaterEfficiencyRow) =>
    isFixtureFieldReadonly(rowIndex, field, lockedRows, lockExtraRowCalcFields);
  const addRow = () => {
    onChange((b) => {
      if (b.rows.length >= maxRows) return b;
      return { ...b, rows: [...b.rows, emptyFixtureRow()] };
    });
  };

  const patchRow = (rowIndex: number, patch: Partial<ExistingWaterEfficiencyRow>) => {
    onChange((b) => ({
      ...b,
      rows: b.rows.map((row, i) => (i === rowIndex ? { ...row, ...patch } : row)),
    }));
  };

  return (
    <div className="relative overflow-x-auto rounded-xl border border-border bg-muted/10 p-4">
      {canRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 z-10 rounded-full bg-destructive p-1 text-white shadow"
          title="Remove building"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}

      <div className="mb-3 flex flex-wrap items-center justify-end gap-2 pr-8">
        <button
          type="button"
          onClick={addRow}
          disabled={building.rows.length >= maxRows}
          className="inline-flex items-center gap-1.5 rounded-lg bg-ocean px-3 py-1.5 text-xs font-medium text-white hover:bg-ocean-hover disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Row
        </button>
      </div>

      <table className="w-full min-w-[1100px] border-collapse text-sm">
        <thead>
          <tr className="bg-muted/40 text-center">
            <th colSpan={7} className="border border-border px-3 py-2 font-semibold">
              Building Name / Building Typology / Space Name
              {showBuildingIndexInHeader ? ` ${building.tableIndex}` : ""}
            </th>
            <th colSpan={2} className="border border-border px-2 py-1.5">
              <input
                className={inputClass}
                value={building.dwelling_type}
                onChange={(e) => onChange((b) => ({ ...b, dwelling_type: e.target.value }))}
                placeholder="Building / typology / space name"
              />
            </th>
          </tr>
          <tr className="bg-muted/30 text-center text-xs font-medium">
            <th rowSpan={2} className="border border-border px-2 py-2 w-36">
              Fixture Type
            </th>
            <th rowSpan={2} className="border border-border px-2 py-2 min-w-[120px]">
              Fixture Detail
            </th>
            <th rowSpan={2} className="border border-border px-2 py-2">
              Duration Per Use (Minutes)
            </th>
            <th rowSpan={2} className="border border-border px-2 py-2">
              {dailyUsesHeader}
            </th>
            <th rowSpan={2} className="border border-border px-2 py-2 w-20">
              FTE
            </th>
            <th colSpan={2} className="border border-border px-2 py-2">
              Base Case
            </th>
            <th colSpan={2} className="border border-border px-2 py-2">
              Actual Case
            </th>
          </tr>
          <tr className="bg-muted/30 text-center text-xs font-medium">
            <th className="border border-border px-2 py-2">{flowRateHeader}</th>
            <th className="border border-border px-2 py-2">Total Daily Water Use (Litres)</th>
            <th className="border border-border px-2 py-2">{flowRateHeader}</th>
            <th className="border border-border px-2 py-2">Total Daily Water Use (Litres)</th>
          </tr>
        </thead>
        <tbody>
          {building.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="text-center">
              <td className="border border-border px-1 py-1">
                <input
                  className={
                    isReadonly(rowIndex, "fixture_type") ? readonlyClass : inputClass
                  }
                  readOnly={isReadonly(rowIndex, "fixture_type")}
                  value={row.fixture_type}
                  placeholder="Fixture Type"
                  onChange={(e) => patchRow(rowIndex, { fixture_type: e.target.value })}
                />
              </td>
              <td className="border border-border px-1 py-1">
                <input
                  className={inputClass}
                  value={row.fixture_detail}
                  placeholder="Fixture Detail"
                  onChange={(e) => patchRow(rowIndex, { fixture_detail: e.target.value })}
                />
              </td>
              <td className="border border-border px-1 py-1">
                <NumInput
                  value={row.duration}
                  readOnly={isReadonly(rowIndex, "duration")}
                  onChange={(v) => patchRow(rowIndex, { duration: v })}
                />
              </td>
              <td className="border border-border px-1 py-1">
                <NumInput
                  value={row.daily_uses}
                  readOnly={isReadonly(rowIndex, "daily_uses")}
                  onChange={(v) => patchRow(rowIndex, { daily_uses: v })}
                />
              </td>
              <td className="border border-border px-1 py-1">
                <NumInput
                  value={row.fte}
                  readOnly={isReadonly(rowIndex, "fte")}
                  onChange={(v) => patchRow(rowIndex, { fte: v })}
                />
              </td>
              <td className="border border-border px-1 py-1">
                <NumInput
                  value={row.baseline_flow}
                  readOnly={isReadonly(rowIndex, "baseline_flow")}
                  onChange={(v) => patchRow(rowIndex, { baseline_flow: v })}
                />
              </td>
              <td className="border border-border px-1 py-1">
                <NumInput value={row.total_daily_base} readOnly />
              </td>
              <td className="border border-border px-1 py-1">
                <NumInput
                  value={row.baseline_flow_proposed}
                  readOnly={isReadonly(rowIndex, "baseline_flow_proposed")}
                  placeholder="Enter Value"
                  onChange={(v) => patchRow(rowIndex, { baseline_flow_proposed: v })}
                />
              </td>
              <td className="border border-border px-1 py-1">
                <NumInput value={row.total_daily_proposed} readOnly />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <FooterRow label="Daily water volume from flush & flow fixtures">
            <NumInput value={building.flush_base_total} readOnly />
            <td className="border border-border" />
            <NumInput value={building.flush_proposed_total} readOnly />
          </FooterRow>
          <FooterRow label="Annual Working Days">
            <input
              className={inputClass}
              value={building.annual_days}
              onChange={(e) => onChange((b) => ({ ...b, annual_days: e.target.value }))}
            />
            <td className="border border-border px-2 py-2 text-left text-sm">Days</td>
            <td className="border border-border" colSpan={1} />
          </FooterRow>
          <FooterRow label="Annual water volume from flush & flow fixtures">
            <NumInput value={building.annual_water_flush} readOnly />
            <td className="border border-border" />
            <NumInput value={building.fixture_flow_vol} readOnly />
          </FooterRow>
          <tr>
            <td colSpan={6} className="border border-border px-3 py-2 text-right text-sm">
              Percentage Savings (%)
            </td>
            <td colSpan={3} className="border border-border px-2 py-1.5">
              <NumInput value={building.saving_percentage} readOnly />
            </td>
          </tr>
          {showMandatoryRequirement ? (
            <tr>
              <td colSpan={6} className="border border-border px-3 py-2 text-right text-sm">
                Meets Mandatory Requirement
              </td>
              <td colSpan={3} className="border border-border px-2 py-1.5">
                <input readOnly className={readonlyClass} value={building.annex_mandatory} />
              </td>
            </tr>
          ) : null}
        </tfoot>
      </table>
    </div>
  );
}

function FooterRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <tr>
      <td colSpan={6} className="border border-border px-3 py-2 text-right text-sm">
        {label}
      </td>
      {children}
    </tr>
  );
}
