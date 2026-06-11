import type { AnnexureRenderMode, AnnexureSchemaDefinition } from "@/annexure/annexureTypes";

const INTERACTIVE_RENDER_MODES = new Set<AnnexureRenderMode>([
  "comparison",
  "dwelling",
  "rainwater",
  "waterEfficiency",
  "greenInteriorsWcTwo",
  "conditionedSpaces",
  "naturalVentilation",
  "lpdBuildingAreaMethod",
  "lpdSpaceFunctionMethod",
  "onsiteRenewableEnergy",
  "masterMaterial",
  "acFreshAir",
  "daylightNoise",
  "occupantWellbeing",
  "wasteManagement",
  "waterBalance",
  "wastewaterReuse",
  "urbanHeatRoof",
  "urbanHeatNonRoof",
  "existingRainfall",
  "existingWaterEfficiency",
  "existingWaterConsumption",
  "existingAlternativePerformance",
  "eemr2Office",
  "epiCalculation",
  "epiLimitCalculation",
  "existingSimulationMethod",
  "existingOneSiteRenewable",
  "existingSingleZoneSystem",
  "existingOutdoorAirSystem",
]);

export function schemaMatchesRatingType(
  schema: AnnexureSchemaDefinition,
  ratingTypeId: number,
): boolean {
  if (!schema.ratingTypeIds?.length) return true;
  return schema.ratingTypeIds.includes(Number(ratingTypeId));
}

export function hasInteractiveAnnexSchema(
  schema: AnnexureSchemaDefinition | undefined,
  ratingTypeId: number,
): boolean {
  if (!schema || !schemaMatchesRatingType(schema, ratingTypeId)) return false;
  if (schema.renderMode === "reference") return true;
  if (schema.renderMode && INTERACTIVE_RENDER_MODES.has(schema.renderMode)) return true;
  return (schema.table?.columns?.length ?? 0) > 0;
}
