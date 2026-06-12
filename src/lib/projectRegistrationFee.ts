import type { ProjectRegistrationFeeMasters } from "@/lib/projectRegistration";

type FeeRule = {
  ratingSystem: string;
  registrationFee: number;
  gstPercent: number;
  compatibleConstructionTypes: string[];
};

let feeRules: FeeRule[] = [];
let feeCoupons = new Set<string>();

function toNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function setProjectRegistrationFeeConfig(masters: ProjectRegistrationFeeMasters) {
  const compatibilityMap =
    (masters.compatibilityMap as Record<string, string[]> | undefined) ??
    (masters.compatibility as Record<string, string[]> | undefined) ??
    {};

  const feesByRatingSystem =
    (masters.feesByRatingSystem as Record<string, { registrationFee?: number; fee?: number; gstPercent?: number }> | undefined) ??
    (masters.fees as Record<string, { registrationFee?: number; fee?: number; gstPercent?: number }> | undefined) ??
    {};

  feeRules = Object.entries(feesByRatingSystem).map(([ratingSystem, feeData]) => ({
    ratingSystem,
    registrationFee: toNumber(
      feeData.registrationFee ?? feeData.fee ?? (feeData as { nonMember?: number }).nonMember,
      0,
    ),
    gstPercent: toNumber(feeData.gstPercent, 18),
    compatibleConstructionTypes: compatibilityMap[ratingSystem] ?? [],
  }));

  const coupons = Array.isArray(masters.couponCodes) ? masters.couponCodes : [];
  feeCoupons = new Set(coupons.map((coupon) => coupon.code?.trim().toUpperCase()).filter(Boolean) as string[]);
}

export function getProjectFeeRuleByRatingSystem(ratingSystem?: string) {
  if (!ratingSystem) {
    return undefined;
  }

  return feeRules.find((rule) => rule.ratingSystem === ratingSystem);
}

export function isValidProjectCouponCode(code?: string) {
  if (!code) {
    return false;
  }
  return feeCoupons.has(code.trim().toUpperCase());
}

export function calculateProjectRegistrationFee(
  ratingSystem?: string,
  options?: { deductTds?: boolean; sezSelected?: boolean },
) {
  const rule = getProjectFeeRuleByRatingSystem(ratingSystem);
  const registrationFee = rule?.registrationFee ?? 0;
  const gstPercent = rule?.gstPercent ?? 18;
  const sezSelected = options?.sezSelected === true;
  const deductTds = options?.deductTds === true;
  const gstAmount = sezSelected ? 0 : Number(((registrationFee * gstPercent) / 100).toFixed(2));
  const tdsAmount = deductTds ? Number((registrationFee * 0.1).toFixed(2)) : 0;
  const totalPayable = Math.max(0, Number((registrationFee + gstAmount - tdsAmount).toFixed(2)));

  return {
    registrationFee,
    gstPercent,
    gstAmount,
    tdsAmount,
    totalPayable,
  };
}
