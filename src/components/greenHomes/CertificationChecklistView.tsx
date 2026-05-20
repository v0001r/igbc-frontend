import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ChecklistSummary } from "@/lib/certificationChecklist";

type Props = {
  summary: ChecklistSummary;
  onNavigateToCredit: (tabSlug: string, subSlug: string) => void;
};

export function CertificationChecklistView({ summary, onNavigateToCredit }: Props) {
  const [openTabs, setOpenTabs] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const g of summary.groups) init[g.tab.slug] = true;
    return init;
  });

  const toggle = (slug: string) => {
    setOpenTabs((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Checklist</h1>
          {/* <p className="mt-1 text-sm text-muted-foreground">
            Click a credit to open its section. Attempted points update from saved form progress.
          </p> */}
        </div>
        <div className="flex shrink-0 gap-6 rounded-xl border border-border bg-card px-5 py-3 shadow-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-ocean">{summary.totalPossible}</p>
            <p className="text-xs text-muted-foreground">Total possible points</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{summary.totalAttempted}</p>
            <p className="text-xs text-muted-foreground">Total points attempted</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-muted" />
          Not attempted
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-ocean" />
          Attempted / in progress
        </span>
      </div>

      <div className="space-y-3">
        {summary.groups.map((group) => {
          const open = openTabs[group.tab.slug] ?? true;
          return (
            <section
              key={group.tab.slug}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              <button
                type="button"
                onClick={() => toggle(group.tab.slug)}
                className="flex w-full items-center justify-between gap-3 border-b border-ocean/15 bg-ocean/[0.06] px-4 py-3 text-left"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-ocean">
                  {open ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  {group.tab.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {group.tabAttempted} / {group.tabPossible} pts
                </span>
              </button>

              {open ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="w-24 px-4 py-2.5">Attempted</th>
                        <th className="px-4 py-2.5">Credits</th>
                        <th className="w-32 px-4 py-2.5 text-right">Possible points</th>
                        <th className="w-28 px-4 py-2.5 text-right">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.rows.map((row) => (
                        <tr
                          key={`${row.tabSlug}-${row.subSlug}`}
                          className="border-b border-border/60 transition-colors hover:bg-ocean/[0.04]"
                        >
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex min-w-[2rem] justify-center rounded-md px-2 py-1 text-xs font-semibold ${
                                row.isAttempted
                                  ? "bg-ocean/15 text-ocean"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {row.attemptedPoints}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => onNavigateToCredit(row.tabSlug, row.subSlug)}
                              className={`text-left hover:underline ${
                                row.isAttempted ? "font-medium text-ocean" : "text-foreground"
                              }`}
                            >
                              {row.creditName}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                            {row.possiblePoints}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {row.completionPercent != null ? (
                              <span
                                className={`text-xs font-medium ${
                                  row.completionPercent === 100 ? "text-ocean" : "text-muted-foreground"
                                }`}
                              >
                                {row.completionPercent}%
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </section>
          );
        })}

        {summary.groups.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No checklist credits defined in this rating config.
          </p>
        ) : null}
      </div>
    </div>
  );
}
