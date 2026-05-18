import type { GreenHomesFieldDef } from "@/lib/greenHomesConfig";
import { fieldIsRequired, resolveFieldOptions } from "@/lib/greenHomesConfig";
import { Upload } from "lucide-react";

type Props = {
  field: GreenHomesFieldDef;
  value: string;
  readonly?: boolean;
  onChange: (name: string, value: string) => void;
  onFilesChange?: (name: string, files: File[]) => void;
  error?: string;
};

const inputClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/30 disabled:cursor-not-allowed disabled:opacity-60";

export function DynamicField({ field, value, readonly: readonlyOverride, onChange, onFilesChange, error }: Props) {
  const t = field.type ?? "";
  const name = field.name ?? "";
  const label = (field.display_name ?? "").trim();
  const readonly = readonlyOverride === true || field.readonly === true;
  const required = fieldIsRequired(field);

  if (t === "hr") {
    return <hr className="col-span-full my-2 border-border" />;
  }

  if (!name) return null;

  const labelNode = label ? (
    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
      {label}
      {required ? <span className="text-destructive"> *</span> : null}
    </label>
  ) : null;

  if (t === "c") {
    const checked = value === "1" || value === "true";
    return (
      <div className="col-span-full flex items-start gap-3">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          disabled={readonly}
          onChange={(e) => onChange(name, e.target.checked ? "1" : "0")}
          className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-ocean/30"
        />
        <div>
          {label ? <span className="text-sm text-foreground">{label}</span> : null}
          {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
        </div>
      </div>
    );
  }

  if (t === "r") {
    const options = resolveFieldOptions(field);
    return (
      <div className="md:col-span-2">
        {labelNode}
        <div className="space-y-2">
          {options.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={value === opt.value}
                disabled={readonly}
                onChange={() => onChange(name, opt.value)}
                className="h-4 w-4 border-input text-primary focus:ring-ocean/30"
              />
              {opt.label}
            </label>
          ))}
        </div>
        {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
      </div>
    );
  }

  if (t === "d") {
    const options = resolveFieldOptions(field);
    return (
      <div>
        {labelNode}
        <select
          name={name}
          value={value}
          disabled={readonly}
          onChange={(e) => onChange(name, e.target.value)}
          className={inputClass}
        >
          <option value="">Select…</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
      </div>
    );
  }

  if (t === "u" || t === "M") {
    return (
      <div className="col-span-full">
        {labelNode}
        <label
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-6 transition-colors hover:border-ocean/40 hover:bg-ocean/5 ${readonly ? "pointer-events-none opacity-60" : ""}`}
        >
          <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {value ? value : t === "M" ? "Choose files (demo — stores filename)" : "Choose file (demo — stores filename)"}
          </span>
          <input
            type="file"
            className="sr-only"
            disabled={readonly}
            multiple={t === "M"}
            onChange={(e) => {
              const list = e.target.files;
              if (!list?.length) return;
              const fileArr = Array.from(list);
              onFilesChange?.(name, fileArr);
              onChange(name, fileArr.map((f) => f.name).join(", "));
            }}
          />
        </label>
        {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
      </div>
    );
  }

  if (t === "ta") {
    return (
      <div className="md:col-span-2">
        {labelNode}
        <textarea
          name={name}
          value={value}
          disabled={readonly}
          onChange={(e) => onChange(name, e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/30 disabled:cursor-not-allowed disabled:opacity-60"
        />
        {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
      </div>
    );
  }

  if (t === "t" || t === "n") {
    return (
      <div>
        {labelNode}
        <input
          name={name}
          type={t === "n" ? "number" : "text"}
          value={value}
          disabled={readonly}
          onChange={(e) => onChange(name, e.target.value)}
          className={inputClass}
        />
        {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
      </div>
    );
  }

  return null;
}
