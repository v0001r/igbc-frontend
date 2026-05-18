import { formatBladeIncludePath, type ResolvedAnnexure } from "@/lib/annexureRegistry";
import { FileStack } from "lucide-react";

type Props = {
  title: string;
  annexure: ResolvedAnnexure;
};

export function AnnexurePlaceholder({ title, annexure }: Props) {
  const laravelPath = formatBladeIncludePath(annexure.bladeInclude);

  return (
    <section className="rounded-lg border border-border bg-card shadow-sm">
      <div className="rounded-t-lg border-b border-ocean/20 bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{title}</h2>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex gap-4 rounded-lg border border-dashed border-ocean/30 bg-ocean/5 p-5">
          <FileStack className="h-8 w-8 shrink-0 text-ocean" />
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Annexure UI (Laravel parity)</p>
            <p>
              This sub-section uses a custom annex partial in the Laravel portal
              {annexure.customUiOnly ? " and has no fields in the JSON config" : ""}. Port the Blade
              view to React and register it in{" "}
              <code className="rounded bg-muted px-1">annexureComponents.tsx</code>.
            </p>
            <p className="text-xs">
              Laravel include:{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
                {laravelPath}
              </code>
            </p>
            <p className="text-xs">
              Reference: <code className="rounded bg-muted px-1">src/index.blade.php</code>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
