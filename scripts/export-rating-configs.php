<?php
declare(strict_types=1);

/**
 * Exports IGBC rating PHP traits under src/config/greenHomes/ to static JSON for the React app.
 *
 * Usage (from igbc-frontend):
 *   php scripts/export-rating-configs.php
 *
 * Outputs (same shape as green homes: tabs, subtabs_by_tab, optionMap, params):
 *   src/config/greenHomes/existingBuilding.config.json
 *   src/config/greenHomes/greenFactories.config.json
 *   src/config/greenHomes/greenInteriors.config.json
 *   src/config/greenHomes/newBuilding.config.json
 */

if (!function_exists('url')) {
    function url(string $path = ''): string
    {
        return 'https://localhost/rating_apply' . ($path !== '' ? '/' . ltrim($path, '/') : '');
    }
}

final class RatingConfigExport
{
    /** @return list<string> */
    public static function matchAll(string $pattern, string $subject): array
    {
        preg_match_all($pattern, $subject, $m);
        return array_values(array_unique($m[1] ?? []));
    }

    /** Extract first PHP array literal after $needle (e.g. "$optionMap = ") */
    public static function extractArrayLiteral(string $src, string $needle): string
    {
        $p = strpos($src, $needle);
        if ($p === false) {
            throw new RuntimeException("Needle not found: $needle");
        }
        $start = strpos($src, '[', $p);
        if ($start === false) {
            throw new RuntimeException("Opening [ not found after needle");
        }
        $depth = 0;
        $len = strlen($src);
        $inSingle = false;
        $inDouble = false;
        for ($i = $start; $i < $len; $i++) {
            $c = $src[$i];
            if ($inDouble) {
                if ($c === '\\') {
                    $i++;
                    continue;
                }
                if ($c === '"') {
                    $inDouble = false;
                }
                continue;
            }
            if ($inSingle) {
                if ($c === '\\') {
                    $i++;
                    continue;
                }
                if ($c === "'") {
                    $inSingle = false;
                }
                continue;
            }
            if ($c === "'") {
                $inSingle = true;
                continue;
            }
            if ($c === '"') {
                $inDouble = true;
                continue;
            }
            if ($c === '[') {
                $depth++;
            } elseif ($c === ']') {
                $depth--;
                if ($depth === 0) {
                    return substr($src, $start, $i - $start + 1);
                }
            }
        }
        throw new RuntimeException('Unbalanced array literal');
    }

    /** @param callable(array):mixed $invoke */
    public static function export(
        string $traitPath,
        string $outPath,
        callable $invoke,
        array $extraDefaults = []
    ): void {
        $src = file_get_contents($traitPath);
        if ($src === false) {
            throw new RuntimeException("Cannot read: $traitPath");
        }

        $tabSlugs = self::matchAll("/if\\s*\\(\\s*\\\$data\\['tab'\\]\\s*==\\s*'([^']+)'\\s*\\)/", $src);
        $subtabSlugs = self::matchAll("/if\\s*\\(\\s*\\\$data\\['subtab'\\]\\s*==\\s*'([^']+)'\\s*\\)/", $src);
        $tabSlugs = array_values(array_unique($tabSlugs));
        $subtabSlugs = array_values(array_unique($subtabSlugs));
        sort($tabSlugs);
        sort($subtabSlugs);

        $optionMapLiteral = self::extractArrayLiteral($src, '$optionMap = ');
        /** @var array<string, mixed> $optionMap */
        $optionMap = eval('return ' . $optionMapLiteral . ';');

        $base = array_merge([
            'version' => 3,
            'tab' => 'project_details',
            'subtab' => 'project_details',
        ], $extraDefaults);

        $sample = $invoke($base);
        if (!is_array($sample) || !isset($sample['tabs'])) {
            throw new RuntimeException('Config method did not return array with tabs: ' . $outPath);
        }
        $tabs = $sample['tabs'];

        $subtabsByTab = [];
        foreach ($tabSlugs as $tab) {
            $payload = array_merge($base, [
                'tab' => $tab,
                'subtab' => $subtabSlugs[0] ?? 'project_details',
            ]);
            $r = $invoke($payload);
            if (is_array($r) && isset($r['subtabs'])) {
                $subtabsByTab[$tab] = $r['subtabs'];
            }
        }

        $params = [];
        foreach ($subtabSlugs as $sub) {
            $payload = array_merge($base, [
                'tab' => 'project_details',
                'subtab' => $sub,
            ]);
            $r = $invoke($payload);
            if (!is_array($r)) {
                continue;
            }
            $p = $r['params'] ?? [];
            $params[$sub] = is_array($p) ? $p : [];
        }

        foreach ($subtabsByTab as $rows) {
            if (!is_array($rows)) {
                continue;
            }
            foreach ($rows as $row) {
                if (!is_array($row) || !isset($row['sub_slug'])) {
                    continue;
                }
                $sub = (string) $row['sub_slug'];
                if (isset($params[$sub])) {
                    continue;
                }
                $payload = array_merge($base, [
                    'tab' => 'project_details',
                    'subtab' => $sub,
                ]);
                $r = $invoke($payload);
                if (is_array($r)) {
                    $p = $r['params'] ?? [];
                    $params[$sub] = is_array($p) ? $p : [];
                }
            }
        }
        ksort($params);

        $merged = [
            'tabs' => $tabs,
            'subtabs_by_tab' => $subtabsByTab,
            'optionMap' => $optionMap,
            'params' => $params,
        ];

        $json = json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($json === false) {
            throw new RuntimeException('json_encode failed: ' . json_last_error_msg());
        }
        if (file_put_contents($outPath, $json . "\n") === false) {
            throw new RuntimeException("Failed to write: $outPath");
        }
        fwrite(STDOUT, "OK: " . basename($outPath) . " (" . strlen($json) . " bytes, params: " . count($params) . ")\n");
    }
}

$baseDir = dirname(__DIR__);
$gh = $baseDir . '/src/config/greenHomes';

require_once $gh . '/ExistingBuildingConfig.php';
require_once $gh . '/GreenFactoriesConfig.php';
require_once $gh . '/GreenInteriorsConfig.php';
require_once $gh . '/NewBuildingConfig.php';

final class _ExporterExistingBuilding
{
    use App\Traits\ExistingBuildingConfig;
}

final class _ExporterGreenFactories
{
    use App\Traits\GreenFactoriesConfig;
}

final class _ExporterGreenInteriors
{
    use App\Traits\GreenInteriorsConfig;
}

final class _ExporterNewBuilding
{
    use App\Traits\NewBuildingConfig;
}

try {
    RatingConfigExport::export(
        $gh . '/ExistingBuildingConfig.php',
        $gh . '/existingBuilding.config.json',
        static fn (array $d): mixed => _ExporterExistingBuilding::existingBuildingConfig($d),
    );
    RatingConfigExport::export(
        $gh . '/GreenFactoriesConfig.php',
        $gh . '/greenFactories.config.json',
        static fn (array $d): mixed => _ExporterGreenFactories::greenFactoriesConfig($d),
    );
    RatingConfigExport::export(
        $gh . '/GreenInteriorsConfig.php',
        $gh . '/greenInteriors.config.json',
        static fn (array $d): mixed => _ExporterGreenInteriors::greenInteriorsConfig($d),
        ['topology_type' => 0, 'certificate_type' => 0],
    );
    RatingConfigExport::export(
        $gh . '/NewBuildingConfig.php',
        $gh . '/newBuilding.config.json',
        static fn (array $d): mixed => _ExporterNewBuilding::newBuildingConfig($d),
        ['version' => 4],
    );
} catch (Throwable $e) {
    fwrite(STDERR, $e->getMessage() . "\n" . $e->getFile() . ':' . $e->getLine() . "\n");
    exit(1);
}

echo "Done.\n";
