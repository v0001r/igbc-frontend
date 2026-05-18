import { DynamicField } from "@/components/greenHomes/DynamicField";
import { isSupportedFieldType, type GreenHomesFieldDef } from "@/lib/greenHomesConfig";
import { resolveFieldValue, type FieldValueContext } from "@/lib/ratingFieldValue";

type Props = {
  title: string;
  fields: GreenHomesFieldDef[];
  valueContext: FieldValueContext;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onFilesChange?: (name: string, files: File[]) => void;
};

function fieldColumnClass(type: string): string {
  if (type === "c" || type === "u" || type === "M" || type === "hr" || type === "ta") {
    return "col-span-full";
  }
  if (type === "r") return "md:col-span-2";
  return "";
}

export function DynamicForm({ title, fields, valueContext, errors, onChange, onFilesChange }: Props) {
  const supported = fields.filter((f) => isSupportedFieldType(f.type ?? ""));

  return (
    <section className="rounded-lg border border-border bg-card shadow-sm">
      <div className="rounded-t-lg border-b border-ocean/20 bg-ocean/10 px-4 py-3">
        <h2 className="text-base font-semibold text-ocean">{title}</h2>
      </div>
      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2">
          {supported.map((field, idx) => {
            const resolved = resolveFieldValue(field, valueContext);
            const t = field.type ?? "";
            return (
              <div key={`${field.name ?? "f"}-${field.type}-${idx}`} className={fieldColumnClass(t)}>
                <DynamicField
                  field={field}
                  value={resolved.value}
                  readonly={resolved.readonly}
                  error={errors[field.name ?? ""]}
                  onChange={onChange}
                  onFilesChange={onFilesChange}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
