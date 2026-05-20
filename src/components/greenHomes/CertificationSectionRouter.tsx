import { ANNEXURE_COMPONENTS } from "@/components/greenHomes/annexureComponents";
import { AnnexurePlaceholder } from "@/components/greenHomes/AnnexurePlaceholder";
import { DynamicForm } from "@/components/greenHomes/DynamicForm";
import type { CertificationFormResponse } from "@/lib/certificationForm";
import { formatBladeIncludePath, resolveAnnexure, type AnnexureBladeRoute } from "@/lib/annexureRegistry";
import type { GreenHomesFieldDef } from "@/lib/greenHomesConfig";
import type { FieldRuleSet } from "@/lib/fieldRules";
import { createFieldValueContext } from "@/lib/ratingFieldValue";

type Props = {
  projectId: string;
  title: string;
  tab: string;
  subtab: string;
  fieldRules?: Record<string, FieldRuleSet>;
  versionType: string;
  ratingTypeId: number;
  annexureRoutes: AnnexureBladeRoute[];
  fields: GreenHomesFieldDef[];
  formState: CertificationFormResponse;
  localValues: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onFilesChange?: (name: string, files: File[]) => void;
};

export function CertificationSectionRouter({
  projectId,
  title,
  tab,
  subtab,
  versionType,
  ratingTypeId,
  annexureRoutes,
  fields,
  formState,
  localValues,
  errors,
  fieldRules,
  onChange,
  onFilesChange,
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

  return (
    <div className="space-y-4">
      {AnnexComponent ? (
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
          title={annexure?.customUiOnly ? `${title} — parameters` : title}
          fields={fields}
          valueContext={valueContext}
          fieldRules={fieldRules}
          tab={tab}
          subtab={subtab}
          errors={errors}
          onChange={onChange}
          onFilesChange={onFilesChange}
        />
      ) : !annexure ? (
        <section className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
          No form fields configured for this section.
        </section>
      ) : null}
    </div>
  );
}
