<?php
declare(strict_types=1);

/**
 * Exports Laravel-style GreenHomesConfig trait to static JSON for the React app.
 *
 * Usage (from igbc-frontend):
 *   php scripts/export-green-homes-json.php
 *
 * Expects PHP source at: src/config/greenHomes/GreenHomesConfig.php
 * Writes:            src/config/greenHomes/config.json
 */

if (!function_exists('url')) {
    function url(string $path = ''): string
    {
        return 'https://localhost/rating_apply' . ($path !== '' ? '/' . ltrim($path, '/') : '');
    }
}

$baseDir = dirname(__DIR__);
$traitFile = $baseDir . '/src/config/greenHomes/GreenHomesConfig.php';
$outFile = $baseDir . '/src/config/greenHomes/config.json';

if (!is_readable($traitFile)) {
    fwrite(STDERR, "Missing trait file: $traitFile\nCopy config.json to GreenHomesConfig.php if needed.\n");
    exit(1);
}

require $traitFile;

final class GreenHomesJsonExporter
{
    use App\Traits\GreenHomesConfig;

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
}

$src = file_get_contents($traitFile);
if ($src === false) {
    fwrite(STDERR, "Cannot read trait file\n");
    exit(1);
}

$tabSlugs = GreenHomesJsonExporter::matchAll("/if\\s*\\(\\s*\\\$data\\['tab'\\]\\s*==\\s*'([^']+)'\\s*\\)/", $src);
$subtabSlugs = GreenHomesJsonExporter::matchAll("/if\\s*\\(\\s*\\\$data\\['subtab'\\]\\s*==\\s*'([^']+)'\\s*\\)/", $src);
sort($tabSlugs);
$subtabSlugs = array_values(array_unique($subtabSlugs));
sort($subtabSlugs);

$optionMapLiteral = GreenHomesJsonExporter::extractArrayLiteral($src, '$optionMap = ');
/** @var array<string, array{tab: string, subtab: string}> $optionMap */
$optionMap = eval('return ' . $optionMapLiteral . ';');

$sample = GreenHomesJsonExporter::greenHomesConfig([
    'version' => 3,
    'tab' => 'project_details',
    'subtab' => 'project_details',
]);
if (!is_array($sample) || !isset($sample['tabs'])) {
    fwrite(STDERR, "greenHomesConfig returned unexpected value\n");
    exit(1);
}
$tabs = $sample['tabs'];

$subtabsByTab = [];
foreach ($tabSlugs as $tab) {
    $r = GreenHomesJsonExporter::greenHomesConfig([
        'version' => 3,
        'tab' => $tab,
        'subtab' => $subtabSlugs[0] ?? 'project_details',
    ]);
    if (is_array($r) && isset($r['subtabs'])) {
        $subtabsByTab[$tab] = $r['subtabs'];
    }
}

$params = [];
foreach ($subtabSlugs as $sub) {
    $r = GreenHomesJsonExporter::greenHomesConfig([
        'version' => 3,
        'tab' => 'project_details',
        'subtab' => $sub,
    ]);
    if (!is_array($r)) {
        continue;
    }
    $p = $r['params'] ?? [];
    $params[$sub] = $p;
}

// Also capture every sub_slug referenced in subtabs_by_tab (some may not match regex)
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
        $r = GreenHomesJsonExporter::greenHomesConfig([
            'version' => 3,
            'tab' => 'project_details',
            'subtab' => $sub,
        ]);
        if (is_array($r)) {
            $params[$sub] = $r['params'] ?? [];
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
    fwrite(STDERR, "json_encode failed: " . json_last_error_msg() . "\n");
    exit(1);
}

if (file_put_contents($outFile, $json . "\n") === false) {
    fwrite(STDERR, "Failed to write $outFile\n");
    exit(1);
}

echo "OK: wrote " . strlen($json) . " bytes to $outFile\n";
echo "tabs: " . count($tabs) . ", subtabs_by_tab: " . count($subtabsByTab) . ", params keys: " . count($params) . "\n";
