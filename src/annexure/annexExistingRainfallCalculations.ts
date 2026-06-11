export type ExistingRainfallRow = {
  years_ex: string;
  ex_peak_month: string;
  rainfall_ex: string;
  rainy_day: string;
  rainfall_oneday: string;
};

export type ExistingSurfaceRow = {
  surface: string;
  runoff: string;
  area: string;
  imprevious_area: string;
};

export type ExistingRainfallState = {
  location_ex: string;
  rainfallRows: ExistingRainfallRow[];
  average_ex: string;
  average_rainfall_m: string;
  surfaceRows: ExistingSurfaceRow[];
  ex_total_rain: string;
  ex_mandatory_harvesting: string;
  cap_recharge: string;
  cap_recharge_reuse: string;
  harvesting_existing: string;
  requirment_ex: string;
  ex_avg_rainfall: string;
  ex_avg_rainfall_peak: string;
};

function n(v: string | undefined): number {
  const x = parseFloat(String(v ?? "").trim());
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

function fmt4(v: number): string {
  return v.toFixed(4);
}

export function computeRainfallOneday(rainfall: string, rainyDay: string): string {
  const days = n(rainyDay);
  if (days <= 0) return "0.00";
  return fmt2(n(rainfall) / days);
}

export function computeAverageRainfall(rows: ExistingRainfallRow[]): {
  average_ex: string;
  average_rainfall_m: string;
} {
  let sum = 0;
  let count = 0;
  for (const row of rows) {
    const perDay = n(row.rainfall_oneday);
    if (perDay > 0) {
      sum += perDay;
      count += 1;
    }
  }
  const average_ex = count > 0 ? sum / count : 0;
  return {
    average_ex: fmt2(average_ex),
    average_rainfall_m: fmt4(average_ex / 1000),
  };
}

export function computeSurfaceRow(
  surfaceId: string,
  area: string,
  coeffs: Record<string, number>,
): Pick<ExistingSurfaceRow, "runoff" | "imprevious_area"> {
  const coeff = surfaceId ? (coeffs[surfaceId] ?? 0) : 0;
  const runoff = surfaceId ? String(coeff) : "";
  const imp = surfaceId && n(area) > 0 ? n(area) * coeff : 0;
  return {
    runoff,
    imprevious_area: fmt2(imp),
  };
}

export function computeExistingRainfallState(
  state: ExistingRainfallState,
  coeffs: Record<string, number>,
): ExistingRainfallState {
  const rainfallRows = state.rainfallRows.map((row) => ({
    ...row,
    rainfall_oneday: computeRainfallOneday(row.rainfall_ex, row.rainy_day),
  }));

  const { average_ex, average_rainfall_m } = computeAverageRainfall(rainfallRows);
  const avgMm = n(average_rainfall_m);

  const surfaceRows = state.surfaceRows.map((row) => {
    const computed = computeSurfaceRow(row.surface, row.area, coeffs);
    return { ...row, ...computed };
  });

  const ex_total_rain = surfaceRows.reduce((sum, row) => sum + n(row.imprevious_area), 0);
  const ex_mandatory_harvesting = ex_total_rain * avgMm * 0.2;

  const cap_recharge = state.cap_recharge;
  const cap_recharge_reuse = state.cap_recharge_reuse;
  const harvesting_existing = n(cap_recharge) + n(cap_recharge_reuse);

  const denominator = ex_total_rain * avgMm;
  const ex_avg_rainfall = denominator > 0 ? (n(cap_recharge) / denominator) * 100 : 0;
  const ex_avg_rainfall_peak = denominator > 0 ? (n(cap_recharge_reuse) / denominator) * 100 : 0;

  return {
    ...state,
    rainfallRows,
    average_ex,
    average_rainfall_m,
    surfaceRows,
    ex_total_rain: fmt2(ex_total_rain),
    ex_mandatory_harvesting: fmt2(ex_mandatory_harvesting),
    harvesting_existing: fmt2(harvesting_existing),
    requirment_ex: harvesting_existing >= ex_mandatory_harvesting ? "YES" : "NO",
    ex_avg_rainfall: fmt2(ex_avg_rainfall),
    ex_avg_rainfall_peak: fmt2(ex_avg_rainfall_peak),
  };
}

export function emptyExistingRainfallRow(): ExistingRainfallRow {
  return {
    years_ex: "",
    ex_peak_month: "",
    rainfall_ex: "",
    rainy_day: "",
    rainfall_oneday: "",
  };
}

export function emptyExistingSurfaceRow(): ExistingSurfaceRow {
  return {
    surface: "",
    runoff: "",
    area: "",
    imprevious_area: "0.00",
  };
}
