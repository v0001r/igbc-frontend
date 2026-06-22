type Props = {
  total: number;
  reviewed: number;
  optional?: boolean;
  missing: Array<{ tab: string; subtab: string }>;
};

export function ReviewCompletenessBanner({ total, reviewed, optional = true, missing }: Props) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <p className="text-sm font-medium text-foreground">
        Credits reviewed: {reviewed} / {total}
        {optional ? " (optional)" : ""}
      </p>
      {reviewed < total && missing.length > 0 ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Not yet reviewed: {missing.map((m) => `${m.tab}/${m.subtab}`).join(", ")} — you can still
          release the report.
        </p>
      ) : null}
    </div>
  );
}
