/**
 * Parse igbc-frontend/src/index.blade.php → annexure registry entries.
 * Run: node scripts/parse-annex-registry.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const blade = readFileSync(join(root, "src/index.blade.php"), "utf8");

const re =
  /@elseif\(\$activeSubmenu\s*==\s*'([^']+)'\s*&&\s*\$activeMenu\s*==\s*'([^']+)'\s*&&\s*\$version\s*==\s*(\d+)/g;

const entries = [];
let m;
while ((m = re.exec(blade)) !== null) {
  const line = blade.slice(m.index, m.index + 400);
  const elseifLine = line.split("\n")[0] ?? line;
  const includeMatch = line.match(/@include\(FRONTEND_THEME_NAME\s*\.\s*'([^']+)'\)/);
  const rating5 = elseifLine.includes("rating_type[0] == 5");
  const ratingNot5 = elseifLine.includes("rating_type[0] != 5");
  entries.push({
    tab: m[1],
    subtab: m[2],
    version: String(m[3]),
    bladeInclude: includeMatch?.[1] ?? null,
    ratingTypeId5Only: rating5 && !ratingNot5,
    ratingTypeExclude5: ratingNot5 && !rating5,
  });
}

const out = `/** Auto-generated from index.blade.php — do not edit by hand */\nexport const ANNEXURE_BLADE_ROUTES = ${JSON.stringify(entries, null, 2)} as const;\n`;
writeFileSync(join(root, "src/lib/annexureBladeRoutes.generated.ts"), out);
console.log(`Wrote ${entries.length} annex routes`);
