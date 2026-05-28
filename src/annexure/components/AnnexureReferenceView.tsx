import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { AnnexureRendererHandle } from "@/annexure/components/annexureRendererHandle";
import { useEffect, useMemo } from "react";
import type { MutableRefObject } from "react";

type Props = {
  schema: AnnexureSchemaDefinition;
  tab: string;
  subtab: string;
  ratingKey?: string;
  versionType?: string;
  ratingTypeId: number;
  saveHandleRef: MutableRefObject<AnnexureRendererHandle | null>;
};

export function AnnexureReferenceView({
  schema,
  tab,
  subtab,
  ratingKey,
  versionType,
  ratingTypeId,
  saveHandleRef,
}: Props) {
  useEffect(() => {
    const handle: AnnexureRendererHandle = {
      getSaveFields: () => [],
    };
    saveHandleRef.current = handle;
    return () => {
      saveHandleRef.current = null;
    };
  }, [saveHandleRef]);

  const jsonRelPath = useMemo(() => {
    if (!ratingKey || !versionType) return null;
    return `data/annexures/${ratingKey}/${versionType}/${tab}/${subtab}.json`;
  }, [ratingKey, versionType, tab, subtab]);

  if (schema.ratingTypeIds?.length && !schema.ratingTypeIds.includes(ratingTypeId)) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-t-xl border border-b-0 border-border bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{schema.title}</h2>
      </div>
      <div className="space-y-3 rounded-b-xl border border-border bg-card p-4 shadow-sm">
        {schema.referenceDescription ? (
          <p className="text-sm text-muted-foreground">{schema.referenceDescription}</p>
        ) : null}

        <p className="text-sm text-amber-800 dark:text-amber-200">
          This annex does not have a MERN JSON schema yet. Add{" "}
          <code className="rounded bg-muted px-1 py-0.5">
            data/greenhome/…/{tab}/{subtab}.json
          </code>{" "}
          (or under <code className="rounded bg-muted px-1 py-0.5">data/annexures/</code>) to enable the
          interactive editor.
        </p>

        <details className="rounded-md border border-border/80 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          <summary className="cursor-pointer select-none font-medium text-foreground/80">Technical details</summary>
          <dl className="mt-2 space-y-1.5 [&_dt]:inline [&_dt]:font-medium [&_dt]:text-foreground/70 [&_dd]:inline [&_dd]:before:content-['—_']">
            {schema.bladeInclude ? (
              <div>
                <dt>Laravel include</dt>
                <dd>{schema.bladeInclude}</dd>
              </div>
            ) : null}
            {jsonRelPath ? (
              <div>
                <dt>Interactive schema (when added)</dt>
                <dd>
                  <code className="break-all rounded bg-muted px-1 py-0.5">{jsonRelPath}</code>
                </dd>
              </div>
            ) : null}
          </dl>
        </details>
      </div>
    </div>
  );
}
