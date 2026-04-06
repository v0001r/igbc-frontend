interface FormFieldProps {
  label: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "email" | "select";
  options?: string[];
}

export const FormField = ({
  label,
  defaultValue = "",
  placeholder = "",
  required,
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
          defaultValue={defaultValue}
          className="h-11 rounded-lg bg-card px-3 text-sm text-foreground ring-1 ring-input transition-all focus:outline-none focus:ring-2 focus:ring-primary"
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
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="h-11 rounded-lg bg-card px-4 text-sm text-foreground ring-1 ring-input transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      )}
    </div>
  );
};
