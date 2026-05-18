import { ANNEXURE_BLADE_ROUTES } from "@/lib/annexureBladeRoutes.generated";

export type AnnexureBladeRoute = {
  tab: string;
  subtab: string;
  version: string;
  bladeInclude: string | null;
  ratingTypeId5Only: boolean;
  ratingTypeExclude5: boolean;
};

export type ResolvedAnnexure = {
  tab: string;
  subtab: string;
  bladeInclude: string;
  /** True when config has no params — Laravel used a custom annex partial only. */
  customUiOnly: boolean;
};

const INTERIORS_RATING_TYPE_ID = 5;

/** Match Laravel `$version == 3` for annex routes (includes 3.3.1). */
export function annexVersionMatches(projectVersion: string, routeVersion: string): boolean {
  if (projectVersion === routeVersion) return true;
  if (routeVersion === "3" && projectVersion.startsWith("3")) return true;
  if (routeVersion === "4" && projectVersion.startsWith("4")) return true;
  return false;
}

export function isAnnexSubtabSlug(subSlug: string): boolean {
  return subSlug.startsWith("annex") || subSlug.includes("annexure") || subSlug.includes("epi_");
}

export function resolveAnnexureRoute(
  tab: string,
  subtab: string,
  projectVersion: string,
  ratingTypeId: number,
): AnnexureBladeRoute | null {
  const candidates = (ANNEXURE_BLADE_ROUTES as AnnexureBladeRoute[]).filter(
    (r) =>
      r.tab === tab &&
      r.subtab === subtab &&
      annexVersionMatches(projectVersion, r.version) &&
      r.bladeInclude,
  );

  for (const route of candidates) {
    if (route.ratingTypeId5Only && ratingTypeId !== INTERIORS_RATING_TYPE_ID) continue;
    if (route.ratingTypeExclude5 && ratingTypeId === INTERIORS_RATING_TYPE_ID) continue;
    return route;
  }
  return null;
}

export function resolveAnnexure(
  tab: string,
  subtab: string,
  projectVersion: string,
  ratingTypeId: number,
  hasConfigFields: boolean,
): ResolvedAnnexure | null {
  const route = resolveAnnexureRoute(tab, subtab, projectVersion, ratingTypeId);
  if (!route?.bladeInclude) {
    if (isAnnexSubtabSlug(subtab) && !hasConfigFields) {
      return {
        tab,
        subtab,
        bladeInclude: "(unknown — not in index.blade.php)",
        customUiOnly: true,
      };
    }
    return null;
  }
  return {
    tab,
    subtab,
    bladeInclude: route.bladeInclude,
    customUiOnly: !hasConfigFields,
  };
}

/** Human label from Laravel include path, e.g. `.rating.greenhomes.annexTwo` */
export function formatBladeIncludePath(path: string): string {
  return path.replace(/^\./, "rating/").replace(/\./g, "/");
}
