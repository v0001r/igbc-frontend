# Config-driven annexures (MERN)

**Full guide (download):** [`docs/ANNEXURE_RENDERING_FLOW.md`](../../docs/ANNEXURE_RENDERING_FLOW.md) — end-to-end flow, API, DB, examples (WC1/WC2), file index, troubleshooting.

## Flow

```
API GET /projects/:id/certification-workspace
  → annexureSchemas: Record<"tab/subtab", AnnexureSchemaDefinition>
  → CertificationSectionRouter picks schema by current tab/subtab
  → AnnexureRenderer
       → **table** (default): hydrateRowsFromForm / hydrateScalarsFromForm → runAnnexureCalculations
         → DynamicTable + SummarySection; save via annexSaveRef.getSaveFields()
       → **reference** (`renderMode: "reference"`): stub for annexes without a JSON schema yet — title and
         Laravel include path only; getSaveFields returns `[]`
  → PATCH /projects/:id/certification-form (table annexes only; reference annexes do not persist rows yet)
```

## Folder layout

| Path | Role |
|------|------|
| `igbc-backend/src/rating-config/data/annexures/{ratingKey}/{version}/{tab}/{subtab}.json` | Annex schema + formulas |
| `igbc-backend/src/rating-config/data/greeninteriors/{version}/{tab}/{subtab}.json` | Green Interiors (rating 5) annex schemas |
| `igbc-backend/src/rating-config/annexure/annexure-schema.types.ts` | Shared TS types (server) |
| `igbc-backend/src/rating-config/annexure/annexure-schema.loader.ts` | Merges JSON annexes + reference stubs from `annexure-blade-routes.json` |
| `igbc-backend/src/rating-config/data/laravel-annexure-blades/` | Legacy folder (`annex-setup.json` only); Blade templates removed after MERN migration |
| `igbc-frontend/src/annexure/annexureTypes.ts` | Mirror types (client) |
| `igbc-frontend/src/annexure/annexureExprEval.ts` | Expression evaluator (`ref`, `op`, `sumRows`, …) |
| `igbc-frontend/src/annexure/annexureCalculationEngine.ts` | Hydrate + pipeline + save payload |
| `igbc-frontend/src/annexure/components/AnnexureRenderer.tsx` | Routes table vs reference annex UI |
| `igbc-frontend/src/annexure/components/AnnexureReferenceView.tsx` | Reference annex (Blade link, no save) |
| `igbc-frontend/src/annexure/components/DynamicTable.tsx` | Add/remove rows, cell editors |
| `igbc-frontend/src/annexure/components/SummarySection.tsx` | Read-only summary list |

## Expression language (no arbitrary JS)

- `const`, `ref` (`row:field`, `scalar:key`, `global:key`)
- `parseNum`, `isEmpty`, `add`, `sub`, `mul`, `div`, `min`, comparisons, `and`, `or`, `not`, `if`
- `sumRows` over current `rows` state

## Laravel blade → MERN

1. Copy column/param names from Blade (`name="quantity[]"` → param `quantity`, JSON array in DB).
2. Port jQuery calculations into `rowPipeline` / `scalarPipeline` using the expression AST.
3. Add JSON file under `data/annexures/...`; restart API.
4. Sections that appear in `annexure-blade-routes.json` but have no JSON yet get a **reference** stub in the workspace so the annex tab still shows; add a full `table.columns` JSON to replace it with the interactive editor.

## File uploads in annexures

Not in v1 schema. Add a column `type: "file"` + upload handler in a future iteration, or keep file fields on the main `DynamicForm` for the same subtab.

## Interdependency with main form

Pass `sectionValues` and `annexGlobalExtras` (e.g. `site_area` from `RatingDataIndex`) into `AnnexureRenderer` → `global` map for `ref: "global:site_area"` in future schemas.

## Migration notes

- First implemented annex: **Green Homes** `material_resources` / `annexure_master_material`.
- Row `recycled` stores **percentage** per row (Laravel `recycled[]`); summary percentage uses param `recycled_percent`.
- Local material cost: distance **≤ 500 km** uses line total (`index.blade.php` logic).
- Sections without full table JSON use **reference** mode until a schema is added under `data/annexures/{ratingKey}/{version}/{tab}/{subtab}.json`.
