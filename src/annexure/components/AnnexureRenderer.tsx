import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import { buildSavePayloadFromAnnex, hydrateScalarsFromForm, runAnnexureCalculations } from "@/annexure/annexureCalculationEngine";
import { hydrateRowsWithSourceAnnex, sourceAnnexSignature } from "@/annexure/annexureSourceHydrate";
import {
  buildSavePayloadFromVentilationSummary,
  hydrateVentilationSummaryRows,
  ventilationSummarySignature,
} from "@/annexure/annexureVentilationSummaryHydrate";
import type { RowRecord } from "@/annexure/annexureExprEval";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { DynamicTable } from "@/annexure/components/DynamicTable";
import { SummarySection } from "@/annexure/components/SummarySection";
import { AnnexureReferenceView } from "@/annexure/components/AnnexureReferenceView";
import { AnnexureComparisonTable } from "@/annexure/components/AnnexureComparisonTable";
import { AnnexureDwellingRenderer } from "@/annexure/components/AnnexureDwellingRenderer";
import { AnnexureRainwaterRenderer } from "@/annexure/components/AnnexureRainwaterRenderer";
import { AnnexureWaterEfficiencyRenderer } from "@/annexure/components/AnnexureWaterEfficiencyRenderer";
import { AnnexureGiWcTwoRenderer } from "@/annexure/components/AnnexureGiWcTwoRenderer";
import { AnnexureConditionedSpacesRenderer } from "@/annexure/components/AnnexureConditionedSpacesRenderer";
import { AnnexureNaturalVentilationRenderer } from "@/annexure/components/AnnexureNaturalVentilationRenderer";
import { AnnexureLpdBuildingAreaRenderer } from "@/annexure/components/AnnexureLpdBuildingAreaRenderer";
import { AnnexureLpdSpaceFunctionRenderer } from "@/annexure/components/AnnexureLpdSpaceFunctionRenderer";
import { AnnexureOnsiteRenewableRenderer } from "@/annexure/components/AnnexureOnsiteRenewableRenderer";
import { AnnexureMasterMaterialRenderer } from "@/annexure/components/AnnexureMasterMaterialRenderer";
import { AnnexureAcFreshAirRenderer } from "@/annexure/components/AnnexureAcFreshAirRenderer";
import { AnnexureDaylightNoiseRenderer } from "@/annexure/components/AnnexureDaylightNoiseRenderer";
import { AnnexureOccupantWellbeingRenderer } from "@/annexure/components/AnnexureOccupantWellbeingRenderer";
import { AnnexureWasteManagementRenderer } from "@/annexure/components/AnnexureWasteManagementRenderer";
import { AnnexureWaterBalanceRenderer } from "@/annexure/components/AnnexureWaterBalanceRenderer";
import { AnnexureWastewaterReuseRenderer } from "@/annexure/components/AnnexureWastewaterReuseRenderer";
import { AnnexureUrbanHeatRoofRenderer } from "@/annexure/components/AnnexureUrbanHeatRoofRenderer";
import { AnnexureUrbanHeatNonRoofRenderer } from "@/annexure/components/AnnexureUrbanHeatNonRoofRenderer";
import { AnnexureExistingRainfallRenderer } from "@/annexure/components/AnnexureExistingRainfallRenderer";
import { AnnexureExistingWaterEfficiencyRenderer } from "@/annexure/components/AnnexureExistingWaterEfficiencyRenderer";
import { AnnexureExistingWaterConsumptionRenderer } from "@/annexure/components/AnnexureExistingWaterConsumptionRenderer";
import { AnnexureExistingAlternativePerformanceRenderer } from "@/annexure/components/AnnexureExistingAlternativePerformanceRenderer";
import { AnnexureEemr2OfficeRenderer } from "@/annexure/components/AnnexureEemr2OfficeRenderer";
import { AnnexureEpiCalculationRenderer } from "@/annexure/components/AnnexureEpiCalculationRenderer";
import { AnnexureEpiLimitCalculationRenderer } from "@/annexure/components/AnnexureEpiLimitCalculationRenderer";
import { AnnexureExistingSimulationMethodRenderer } from "@/annexure/components/AnnexureExistingSimulationMethodRenderer";
import { AnnexureExistingOneSiteRenewableRenderer } from "@/annexure/components/AnnexureExistingOneSiteRenewableRenderer";
import { AnnexureExistingSingleZoneRenderer } from "@/annexure/components/AnnexureExistingSingleZoneRenderer";
import { schemaMatchesRatingType } from "@/annexure/annexureSchemaUtils";
import {
  buildSavePayloadFromComparison,
  getComparisonLayout,
  hydrateComparisonFromForm,
} from "@/annexure/annexureComparisonStorage";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MutableRefObject } from "react";
import type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";

export type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";

type Props = {
  schema: AnnexureSchemaDefinition;
  tab: string;
  subtab: string;
  ratingKey?: string;
  versionType?: string;
  ratingTypeId: number;
  formState: CertificationFormResponse;
  sectionValues: Record<string, string>;
  globalExtras?: Record<string, string>;
  saveHandleRef: MutableRefObject<AnnexureRendererHandle | null>;
  readOnly?: boolean;
};

function emptyRow(schema: AnnexureSchemaDefinition): RowRecord {
  const r: RowRecord = {};
  for (const c of schema.table?.columns ?? []) {
    if (c.computed) continue;
    r[c.param] = "";
  }
  return r;
}

export function AnnexureRenderer(props: Props) {
  if (!schemaMatchesRatingType(props.schema, props.ratingTypeId)) {
    return null;
  }
  if (props.schema.renderMode === "comparison") {
    return <AnnexureComparisonRenderer {...props} />;
  }
  if (props.schema.renderMode === "dwelling") {
    return <AnnexureDwellingRenderer {...props} />;
  }
  if (props.schema.renderMode === "rainwater") {
    return <AnnexureRainwaterRenderer {...props} />;
  }
  if (props.schema.renderMode === "waterEfficiency") {
    return <AnnexureWaterEfficiencyRenderer {...props} />;
  }
  if (props.schema.renderMode === "greenInteriorsWcTwo") {
    return <AnnexureGiWcTwoRenderer {...props} />;
  }
  if (props.schema.renderMode === "conditionedSpaces") {
    return <AnnexureConditionedSpacesRenderer {...props} />;
  }
  if (props.schema.renderMode === "naturalVentilation") {
    return <AnnexureNaturalVentilationRenderer {...props} />;
  }
  if (props.schema.renderMode === "lpdBuildingAreaMethod") {
    return <AnnexureLpdBuildingAreaRenderer {...props} />;
  }
  if (props.schema.renderMode === "lpdSpaceFunctionMethod") {
    return <AnnexureLpdSpaceFunctionRenderer {...props} />;
  }
  if (props.schema.renderMode === "onsiteRenewableEnergy") {
    return <AnnexureOnsiteRenewableRenderer {...props} />;
  }
  if (props.schema.renderMode === "masterMaterial") {
    return <AnnexureMasterMaterialRenderer {...props} />;
  }
  if (props.schema.renderMode === "acFreshAir") {
    return <AnnexureAcFreshAirRenderer {...props} />;
  }
  if (props.schema.renderMode === "daylightNoise") {
    return <AnnexureDaylightNoiseRenderer {...props} />;
  }
  if (props.schema.renderMode === "occupantWellbeing") {
    return <AnnexureOccupantWellbeingRenderer {...props} />;
  }
  if (props.schema.renderMode === "wasteManagement") {
    return <AnnexureWasteManagementRenderer {...props} />;
  }
  if (props.schema.renderMode === "waterBalance") {
    return <AnnexureWaterBalanceRenderer {...props} />;
  }
  if (props.schema.renderMode === "wastewaterReuse") {
    return <AnnexureWastewaterReuseRenderer {...props} />;
  }
  if (props.schema.renderMode === "urbanHeatRoof") {
    return <AnnexureUrbanHeatRoofRenderer {...props} />;
  }
  if (props.schema.renderMode === "urbanHeatNonRoof") {
    return <AnnexureUrbanHeatNonRoofRenderer {...props} />;
  }
  if (props.schema.renderMode === "existingRainfall") {
    return <AnnexureExistingRainfallRenderer {...props} />;
  }
  if (props.schema.renderMode === "existingWaterEfficiency") {
    return <AnnexureExistingWaterEfficiencyRenderer {...props} />;
  }
  if (props.schema.renderMode === "existingWaterConsumption") {
    return <AnnexureExistingWaterConsumptionRenderer {...props} />;
  }
  if (props.schema.renderMode === "existingAlternativePerformance") {
    return <AnnexureExistingAlternativePerformanceRenderer {...props} />;
  }
  if (props.schema.renderMode === "eemr2Office") {
    return <AnnexureEemr2OfficeRenderer {...props} />;
  }
  if (props.schema.renderMode === "epiCalculation") {
    return <AnnexureEpiCalculationRenderer {...props} />;
  }
  if (props.schema.renderMode === "epiLimitCalculation") {
    return <AnnexureEpiLimitCalculationRenderer {...props} />;
  }
  if (props.schema.renderMode === "existingSimulationMethod") {
    return <AnnexureExistingSimulationMethodRenderer {...props} />;
  }
  if (props.schema.renderMode === "existingOneSiteRenewable") {
    return <AnnexureExistingOneSiteRenewableRenderer {...props} />;
  }
  if (
    props.schema.renderMode === "existingSingleZoneSystem" ||
    props.schema.renderMode === "existingOutdoorAirSystem"
  ) {
    return <AnnexureExistingSingleZoneRenderer {...props} />;
  }
  if (props.schema.renderMode === "reference") {
    return (
      <AnnexureReferenceView
        schema={props.schema}
        ratingTypeId={props.ratingTypeId}
        saveHandleRef={props.saveHandleRef}
        ratingKey={props.ratingKey}
        versionType={props.versionType}
        tab={props.tab}
        subtab={props.subtab}
      />
    );
  }
  return <AnnexureTableRenderer {...props} />;
}

function AnnexureComparisonRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  saveHandleRef,
}: Props) {
  const layout = useMemo(() => getComparisonLayout(schema), [schema]);

  const getParam = useCallback(
    (param: string) =>
      (formState.data ?? []).find((d) => d.tab === tab && d.subtab === subtab && d.paramName === param)?.value ??
      undefined,
    [formState.data, tab, subtab],
  );

  const dataSignature = useMemo(
    () =>
      JSON.stringify(
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value])
          .sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
      ),
    [formState.data, tab, subtab],
  );

  const [values, setValues] = useState(() => hydrateComparisonFromForm(schema, getParam));

  useEffect(() => {
    setValues(hydrateComparisonFromForm(schema, getParam));
  }, [schema, dataSignature, getParam]);

  const onFieldChange = useCallback((param: string, value: string) => {
    setValues((prev) => ({ ...prev, [param]: value }));
  }, []);

  const updateSaveHandle = useCallback(() => {
    saveHandleRef.current = {
      getSaveFields: () => buildSavePayloadFromComparison(schema, values),
    };
  }, [schema, values, saveHandleRef]);

  useEffect(() => {
    updateSaveHandle();
    return () => {
      saveHandleRef.current = null;
    };
  }, [updateSaveHandle]);

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(ratingTypeId)) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
      </div>
      <div className="rounded-b-xl border border-border bg-card p-4 shadow-sm">
        <AnnexureComparisonTable layout={layout} values={values} onChange={onFieldChange} />
      </div>
    </div>
  );
}

function AnnexureTableRenderer({
  schema,
  tab,
  subtab,
  ratingTypeId,
  formState,
  sectionValues,
  globalExtras,
  saveHandleRef,
  readOnly = false,
}: Props) {
  const getParam = useCallback(
    (param: string) =>
      (formState.data ?? []).find((d) => d.tab === tab && d.subtab === subtab && d.paramName === param)?.value ??
      undefined,
    [formState.data, tab, subtab],
  );

  const global = useMemo(
    () => ({ ...sectionValues, ...(globalExtras ?? {}) }),
    [sectionValues, globalExtras],
  );

  const dataSignature = useMemo(
    () =>
      JSON.stringify([
        (formState.data ?? [])
          .filter((d) => d.tab === tab && d.subtab === subtab)
          .map((d) => [d.paramName, d.value])
          .sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
        sourceAnnexSignature(formState, schema.sourceAnnex, tab),
        ventilationSummarySignature(formState, schema, tab),
      ]),
    [formState.data, tab, subtab, schema.sourceAnnex, schema.ventilationSummary],
  );

  const hydrateRows = useCallback(() => {
    if (schema.ventilationSummary) {
      return hydrateVentilationSummaryRows(schema, formState, tab, subtab);
    }
    return hydrateRowsWithSourceAnnex(schema, formState, tab, subtab, getParam);
  }, [schema, formState, tab, subtab, getParam]);

  const [draftRows, setDraftRows] = useState<RowRecord[]>(() => hydrateRows());

  useEffect(() => {
    setDraftRows(hydrateRows());
  }, [schema, dataSignature, hydrateRows]);

  const [draftScalars, setDraftScalars] = useState(() => hydrateScalarsFromForm(schema, getParam));

  useEffect(() => {
    setDraftScalars(hydrateScalarsFromForm(schema, getParam));
  }, [schema, dataSignature, getParam]);

  const computed = useMemo(
    () => runAnnexureCalculations(schema, draftRows, draftScalars, global),
    [schema, draftRows, draftScalars, global],
  );

  const { rows, scalar } = computed;

  const onFooterScalarChange = useCallback((param: string, value: string) => {
    setDraftScalars((prev) => ({ ...prev, [param]: value }));
  }, []);

  const updateSaveHandle = useCallback(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => {
        if (readOnly) return [];
        const latest = runAnnexureCalculations(schema, draftRows, draftScalars, global);
        return buildSavePayloadFromAnnex(schema, latest);
      },
    };
    saveHandleRef.current = handle;
  }, [schema, draftRows, draftScalars, global, saveHandleRef, readOnly]);

  useEffect(() => {
    updateSaveHandle();
    return () => {
      saveHandleRef.current = null;
    };
  }, [updateSaveHandle]);

  const onRowChange = useCallback((rowIndex: number, param: string, value: string) => {
    setDraftRows((prev) => {
      const next = prev.map((r, i) => (i === rowIndex ? { ...r, [param]: value } : r));
      return next;
    });
  }, []);

  const onAddRow = useCallback(() => {
    setDraftRows((prev) => {
      if (schema.table?.maxRows && prev.length >= schema.table.maxRows) return prev;
      return [...prev, emptyRow(schema)];
    });
  }, [schema]);

  const onRemoveRow = useCallback(
    (rowIndex: number) => {
      setDraftRows((prev) => {
        const min = schema.table?.minRows ?? 1;
        if (prev.length <= min) return prev;
        return prev.filter((_, i) => i !== rowIndex);
      });
    },
    [schema.table?.minRows],
  );

  const evalCtx = useMemo(() => ({ rows, scalar, global }), [rows, scalar, global]);

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(ratingTypeId)) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
      </div>
      <div className="rounded-b-xl border border-border bg-card p-4 shadow-sm">
        <DynamicTable
          columns={schema.table?.columns ?? []}
          rows={rows}
          stickyFirstColumns={schema.table?.stickyFirstColumns}
          addRowLabel={
            schema.ventilationSummary || schema.table?.allowAddRows === false
              ? undefined
              : schema.table?.addRowLabel
          }
          allowRemoveRows={!schema.ventilationSummary && schema.table?.allowAddRows !== false}
          minRows={schema.table?.minRows}
          maxRows={schema.table?.maxRows ?? 99}
          headerRows={schema.table?.headerRows}
          footerRows={schema.footerRows}
          footerScalar={scalar}
          evalCtx={evalCtx}
          onRowChange={readOnly ? undefined : onRowChange}
          onAddRow={readOnly ? undefined : onAddRow}
          onRemoveRow={readOnly ? undefined : onRemoveRow}
          onFooterScalarChange={readOnly ? undefined : onFooterScalarChange}
        />

        {schema.summaryGroups?.length
          ? schema.summaryGroups.map((group) => (
              <SummarySection key={group.title} title={group.title} rows={group.rows} values={scalar} />
            ))
          : null}
        {!schema.summaryGroups?.length && schema.summary?.length ? (
          <SummarySection rows={schema.summary} values={scalar} />
        ) : null}
      </div>
    </div>
  );
}

