import type { GreenHomesSubtab } from "@/lib/greenHomesConfig";

type SubtabProgress = { subSlug: string; percent: number | null };

type Props = {
  title?: string;
  subtabs: GreenHomesSubtab[];
  currentSubSlug: string;
  progressBySubSlug?: SubtabProgress[];
  onSelectSubtab: (subSlug: string) => void;
};

export function DynamicSidebar({
  title = "Project Information",
  subtabs,
  currentSubSlug,
  progressBySubSlug,
  onSelectSubtab,
}: Props) {
  const progressMap = new Map(progressBySubSlug?.map((p) => [p.subSlug, p.percent]) ?? []);
  return (
    <aside className="w-full shrink-0 lg:w-72">
      <div className="rounded-lg border border-ocean/25 bg-ocean/[0.06] shadow-sm">
        <div className="border-b border-ocean/15 px-4 py-3">
          <h3 className="text-sm font-semibold text-ocean">{title}</h3>
        </div>
        <nav className="p-3" aria-label="Sub-sections">
          {subtabs.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">No sub-sections in config for this tab.</p>
          ) : (
          <ol className="relative space-y-0">
            {subtabs.map((s, idx) => {
              const active = s.sub_slug === currentSubSlug;
              const last = idx === subtabs.length - 1;
              const pct = progressMap.get(s.sub_slug);
              return (
                <li key={s.sub_slug} className="relative flex gap-3">
                  <div className="flex w-5 shrink-0 flex-col items-center">
                    <span
                      className={`mt-1.5 flex h-3 w-3 shrink-0 rounded-full border-2 ${
                        active ? "border-ocean bg-ocean shadow-[0_0_0_3px_hsl(var(--ocean)/0.2)]" : "border-muted-foreground/40 bg-card"
                      }`}
                    />
                    {!last ? <span className="mt-0.5 w-px flex-1 min-h-[1.25rem] bg-border" aria-hidden /> : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectSubtab(s.sub_slug)}
                    className={`group flex-1 rounded-md px-2 py-2 text-left text-sm transition-colors ${
                      active ? "font-semibold text-ocean" : "text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span>{s.name}</span>
                      {pct != null ? (
                        <span className="text-[10px] font-normal text-muted-foreground">{pct}%</span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          )}
        </nav>
      </div>
    </aside>
  );
}
