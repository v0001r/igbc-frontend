interface FormFieldProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  fieldKey?: string;
  type?: "text" | "email" | "select";
  options?: string[];
}

export const FormField = ({
  label,
  value = "",
  onChange,
  placeholder = "",
  required,
  error,
  fieldKey,
  type = "text",
  options,
}: FormFieldProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {type === "select" && options ? (
        <select
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          required={required}
          aria-required={required}
          data-field-key={fieldKey}
          className={`h-11 rounded-lg bg-card px-3 text-sm text-foreground ring-1 transition-all focus:outline-none focus:ring-2 ${
            error
              ? "ring-destructive focus:ring-destructive"
              : "ring-input focus:ring-primary"
          }`}
        >
          <option value="">{placeholder || `Select ${label}`}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          required={required}
          aria-required={required}
          data-field-key={fieldKey}
          className={`h-11 rounded-lg bg-card px-4 text-sm text-foreground ring-1 transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
            error
              ? "ring-destructive focus:ring-destructive"
              : "ring-input focus:ring-primary"
          }`}
        />
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};
