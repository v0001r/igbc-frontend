export type WasteMaterialSourceRow = {
  sourceIndex: number;
  sub_category: string;
  other_sub_catg: string;
};

export type WasteManagementRow = {
  sourceIndex: number;
  sub_category: string;
  other_sub_catg: string;
  material_description: string;
  generated: string;
  generated_proj: string;
  reused: string;
  recycle_used: string;
  sent_landfill: string;
};

export type WasteManagementState = {
  waste_unit: string;
  rows: WasteManagementRow[];
  total_generated_waste: string;
  total_reused_project: string;
  total_reused_recycle_vendor: string;
  total_reused_donated_proj: string;
  total_sent_landfil: string;
  percentage_waste_diverted_landfill: string;
};

function n(v: string | undefined): number {
  const x = parseFloat(String(v ?? "").trim());
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

export function materialLabelFromSource(
  row: WasteMaterialSourceRow,
  materialOptions?: Record<string, string>,
): string {
  const sub = row.sub_category.trim();
  if (materialOptions?.[sub]) return materialOptions[sub];
  if (sub === "Other") {
    const other = row.other_sub_catg.trim();
    return other || sub;
  }
  return sub;
}

export function loadWasteMaterialSourceRows(
  subCategories: string[],
  otherSubCategories: string[],
): WasteMaterialSourceRow[] {
  const len = Math.max(subCategories.length, otherSubCategories.length);
  const rows: WasteMaterialSourceRow[] = [];
  for (let i = 0; i < len; i++) {
    rows.push({
      sourceIndex: i + 1,
      sub_category: subCategories[i] ?? "",
      other_sub_catg: otherSubCategories[i] ?? "",
    });
  }
  return rows;
}

export function computeWasteManagementRow(row: WasteManagementRow): WasteManagementRow {
  const generated = n(row.generated);
  const reusedProj = n(row.generated_proj);
  const recycleVendor = n(row.reused);
  const donated = n(row.recycle_used);
  const landfill = generated - (reusedProj + recycleVendor + donated);
  return { ...row, sent_landfill: fmt2(landfill) };
}

export function computeWasteManagementState(state: WasteManagementState): WasteManagementState {
  const rows = state.rows.map(computeWasteManagementRow);

  let totalGenerated = 0;
  let totalReusedProject = 0;
  let totalRecycleVendor = 0;
  let totalDonated = 0;
  let totalLandfill = 0;

  for (const r of rows) {
    totalGenerated += n(r.generated);
    totalReusedProject += n(r.generated_proj);
    totalRecycleVendor += n(r.reused);
    totalDonated += n(r.recycle_used);
    totalLandfill += n(r.sent_landfill);
  }

  const diverted = totalReusedProject + totalRecycleVendor + totalDonated;
  const pct = totalGenerated > 0 ? (diverted / totalGenerated) * 100 : 0;

  return {
    ...state,
    rows,
    total_generated_waste: fmt2(totalGenerated),
    total_reused_project: fmt2(totalReusedProject),
    total_reused_recycle_vendor: fmt2(totalRecycleVendor),
    total_reused_donated_proj: fmt2(totalDonated),
    total_sent_landfil: fmt2(totalLandfill),
    percentage_waste_diverted_landfill: totalGenerated > 0 ? fmt2(pct) : "",
  };
}

export function mergeWasteRowsFromSource(
  sources: WasteMaterialSourceRow[],
  prev: WasteManagementRow[],
  minRows: number,
  materialOptions?: Record<string, string>,
): WasteManagementRow[] {
  const targetLen = Math.max(sources.length, minRows);
  const prevByIndex = new Map(prev.map((r) => [r.sourceIndex, r]));

  const rows: WasteManagementRow[] = [];
  for (let i = 0; i < targetLen; i++) {
    const src = sources[i];
    const sourceIndex = i + 1;
    const existing = prevByIndex.get(sourceIndex);
    const description = src ? materialLabelFromSource(src, materialOptions) : "";

    if (existing) {
      rows.push({
        ...existing,
        sourceIndex,
        sub_category: src?.sub_category ?? existing.sub_category,
        other_sub_catg: src?.other_sub_catg ?? existing.other_sub_catg,
        material_description: description || existing.material_description,
      });
    } else {
      rows.push({
        sourceIndex,
        sub_category: src?.sub_category ?? "",
        other_sub_catg: src?.other_sub_catg ?? "",
        material_description: description,
        generated: "",
        generated_proj: "",
        reused: "",
        recycle_used: "",
        sent_landfill: "0.00",
      });
    }
  }
  return rows;
}
