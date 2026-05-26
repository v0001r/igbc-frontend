import type { AnnexureSummaryRowDef } from "@/annexure/annexureTypes";

const readonlyClass =
  "h-10 w-full max-w-xs rounded-md border border-transparent bg-muted/50 px-3 text-right text-sm font-medium tabular-nums text-foreground";

type Props = {
  rows: AnnexureSummaryRowDef[];
  values: Record<string, string>;
  title?: string;
};

export function SummarySection({ rows, values, title = "Summary" }: Props) {
  if (!rows?.length) return null;
  return (
    <section className="mt-6 space-y-2 rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-ocean">{title}</h3>
      <div className="divide-y divide-border/80">
        {rows.map((r) => (
          <div key={r.param} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <span className="text-sm text-foreground sm:flex-1">{r.label}</span>
            <div className={readonlyClass}>{values[r.param] ?? "0.00"}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
