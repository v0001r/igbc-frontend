import { ANNEXURE_COMPONENTS } from "@/components/greenHomes/annexureComponents";
import { AnnexurePlaceholder } from "@/components/greenHomes/AnnexurePlaceholder";
import { DynamicForm } from "@/components/greenHomes/DynamicForm";
import {
  AnnexureRenderer,
  type AnnexureRendererHandle,
} from "@/annexure/components/AnnexureRenderer";
import { hasInteractiveAnnexSchema } from "@/annexure/annexureSchemaUtils";
import type { AnnexureSchemaDefinition } from "@/annexure/annexureTypes";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { formatBladeIncludePath, resolveAnnexure, type AnnexureBladeRoute } from "@/lib/annexureRegistry";
import type { GreenHomesFieldDef } from "@/lib/greenHomesConfig";
import type { FieldRuleSet } from "@/lib/fieldRules";
import { createFieldValueContext } from "@/lib/ratingFieldValue";
import type { MutableRefObject } from "react";

type Props = {
  projectId: string;
  title: string;
  tab: string;
  subtab: string;
  ratingKey: string;
  fieldRules?: Record<string, FieldRuleSet>;
  versionType: string;
  ratingTypeId: number;
  annexureRoutes: AnnexureBladeRoute[];
  annexureSchemas?: Record<string, AnnexureSchemaDefinition>;
  fields: GreenHomesFieldDef[];
  formState: CertificationFormResponse;
  localValues: Record<string, string>;
  /** Same-tab field values for `global:*` refs in annexure formulas. */
  sectionValues: Record<string, string>;
  /** Cross-tab values for annexure formulas (e.g. site area). */
  annexGlobalExtras?: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onFilesChange?: (name: string, files: File[]) => void;
  annexSaveRef: MutableRefObject<AnnexureRendererHandle | null>;
  readOnly?: boolean;
};

export function CertificationSectionRouter({
  projectId,
  title,
  tab,
  subtab,
  ratingKey,
  versionType,
  ratingTypeId,
  annexureRoutes,
  annexureSchemas,
  fields,
  formState,
  localValues,
  sectionValues,
  annexGlobalExtras,
  errors,
  fieldRules,
  onChange,
  onFilesChange,
  annexSaveRef,
  readOnly = false,
}: Props) {
  const hasConfigFields = fields.length > 0;
  const annexure = resolveAnnexure(
    annexureRoutes,
    tab,
    subtab,
    versionType,
    ratingTypeId,
    hasConfigFields,
  );
  const valueContext = createFieldValueContext(formState, tab, subtab, localValues);
  const annexKey = annexure ? formatBladeIncludePath(annexure.bladeInclude) : null;
  const AnnexComponent = annexKey ? ANNEXURE_COMPONENTS[annexKey] : undefined;

  const sectionKey = `${tab}/${subtab}`;
  const schema = annexureSchemas?.[sectionKey];
  const hasConfigAnnex = hasInteractiveAnnexSchema(schema, ratingTypeId);

  return (
    <div className="space-y-4">
      {hasConfigAnnex && schema ? (
        <AnnexureRenderer
          schema={schema}
          tab={tab}
          subtab={subtab}
          ratingKey={ratingKey}
          versionType={versionType}
          ratingTypeId={ratingTypeId}
          formState={formState}
          sectionValues={sectionValues}
          globalExtras={annexGlobalExtras}
          saveHandleRef={annexSaveRef}
          readOnly={readOnly}
        />
      ) : AnnexComponent ? (
        <AnnexComponent
          projectId={projectId}
          tab={tab}
          subtab={subtab}
          versionType={versionType}
          ratingTypeId={ratingTypeId}
        />
      ) : annexure?.customUiOnly ? (
        <AnnexurePlaceholder title={title} annexure={annexure} />
      ) : null}

      {hasConfigFields ? (
        <DynamicForm
          title={!hasConfigAnnex && annexure?.customUiOnly ? `${title} — parameters` : title}
          fields={fields}
          valueContext={valueContext}
          fieldRules={fieldRules}
          tab={tab}
          subtab={subtab}
          errors={errors}
          onChange={onChange}
          onFilesChange={onFilesChange}
          readOnly={readOnly}
        />
      ) : !annexure && !hasConfigAnnex ? (
        <section className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
          No form fields configured for this section.
        </section>
      ) : !hasConfigAnnex && annexure && !annexure.customUiOnly ? (
        <section className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
          Annexure UI is not available for this section yet. Restart the backend after pulling the latest
          annexure schema, then hard-refresh this page.
        </section>
      ) : null}
    </div>
  );
}
