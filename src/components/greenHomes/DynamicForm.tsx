import { DynamicField } from "@/components/greenHomes/DynamicField";
import { isSupportedFieldType, type GreenHomesFieldDef } from "@/lib/greenHomesConfig";
import { isFieldReadonlyByRules, isFieldVisibleByRules } from "@/lib/fieldRules";
import type { FieldRuleSet } from "@/lib/fieldRules";
import { fieldIsRequiredWhenVisible, isFieldVisible } from "@/lib/fieldVisibility";
import { resolveFieldValue, type FieldValueContext } from "@/lib/ratingFieldValue";
import { useCertificationFieldRules } from "@/hooks/useCertificationFieldRules";
import { useMemo } from "react";

type Props = {
  title: string;
  fields: GreenHomesFieldDef[];
  valueContext: FieldValueContext;
  fieldRules?: Record<string, FieldRuleSet>;
  tab: string;
  subtab: string;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onFilesChange?: (name: string, files: File[]) => void;
  readOnly?: boolean;
};

function fieldColumnClass(type: string): string {
  if (type === "hr") return "col-span-full";
  if (type === "c" || type === "u" || type === "M" || type === "ta") return "col-span-full";
  if (type === "r") return "col-span-full md:col-span-2";
  return "";
}

function buildSectionValues(
  fields: GreenHomesFieldDef[],
  valueContext: FieldValueContext,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const field of fields) {
    const name = field.name ?? "";
    if (!name) continue;
    out[name] = resolveFieldValue(field, valueContext).value;
  }
  return out;
}

export function DynamicForm({
  title,
  fields,
  valueContext,
  fieldRules,
  tab,
  subtab,
  errors,
  onChange,
  onFilesChange,
  readOnly = false,
}: Props) {
  const supported = fields.filter((f) => isSupportedFieldType(f.type ?? ""));
  const sectionValues = useMemo(
    () => buildSectionValues(fields, valueContext),
    [fields, valueContext],
  );

  const fieldNames = useMemo(
    () => fields.map((f) => f.name ?? "").filter(Boolean),
    [fields],
  );

  const { evaluation: rulesEvaluation } = useCertificationFieldRules({
    fieldRules,
    tab,
    subtab,
    fieldNames,
    sectionValues,
  });

  return (
    <section className="rounded-lg border border-border bg-card shadow-sm">
      <div className="rounded-t-lg border-b border-ocean/20 bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{title}</h2>
      </div>
      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-2">
          {supported.map((field, idx) => {
            const name = field.name ?? "";
            if (!name) return null;
            if (!isFieldVisible(field, sectionValues)) return null;
            if (!isFieldVisibleByRules(name, rulesEvaluation)) return null;

            const resolved = resolveFieldValue(field, valueContext);
            const displayValue = rulesEvaluation.computed[name] ?? resolved.value;
            const t = field.type ?? "";
            return (
              <div key={`${name}-${field.type}-${idx}`} className={fieldColumnClass(t)}>
                <DynamicField
                  field={field}
                  value={displayValue}
                  readonly={readOnly || resolved.readonly || isFieldReadonlyByRules(name, rulesEvaluation)}
                  required={fieldIsRequiredWhenVisible(field, sectionValues)}
                  error={errors[name]}
                  onChange={readOnly ? () => undefined : onChange}
                  onFilesChange={readOnly ? undefined : onFilesChange}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
