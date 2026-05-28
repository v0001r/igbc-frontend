/**
 * Register ported Laravel annex React components here.
 * Key: blade include path without leading dot (e.g. "rating/greenhomes/annexTwo").
 */
import type { ComponentType } from "react";

export type AnnexureComponentProps = {
  projectId: string;
  tab: string;
  subtab: string;
  versionType: string;
  ratingTypeId: number;
};

export const ANNEXURE_COMPONENTS: Record<string, ComponentType<AnnexureComponentProps>> = {
  // Example after porting:
  // "rating/greenhomes/annexTwo": AnnexWaterConservationTwoGreenHomes,
};
