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
  customUiOnly: boolean;
};

const INTERIORS_RATING_TYPE_ID = 5;

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
  routes: AnnexureBladeRoute[],
  tab: string,
  subtab: string,
  projectVersion: string,
  ratingTypeId: number,
): AnnexureBladeRoute | null {
  const candidates = routes.filter(
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
  routes: AnnexureBladeRoute[],
  tab: string,
  subtab: string,
  projectVersion: string,
  ratingTypeId: number,
  hasConfigFields: boolean,
): ResolvedAnnexure | null {
  const route = resolveAnnexureRoute(routes, tab, subtab, projectVersion, ratingTypeId);
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

export function formatBladeIncludePath(path: string): string {
  return path.replace(/^\./, "rating/").replace(/\./g, "/");
}
