import type {
  AnnexureComparisonLayoutDef,
  AnnexureComparisonRowDef,
} from "@/annexure/annexureTypes";
import type { ComparisonValues } from "@/annexure/annexureComparisonStorage";

const textareaClass =
  "min-h-[2.25rem] w-full resize-y rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/30";
const inputClass =
  "h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/30";
const readonlyClass =
  "h-9 w-full min-w-0 rounded-md border border-transparent bg-muted/50 px-2 text-sm text-muted-foreground";

const cellBorder = "border border-border bg-card";

function clampDecimal(raw: string): string {
  if (raw === "" || raw === ".") return raw;
  if (!raw.includes(".")) return raw;
  const [w, f] = raw.split(".");
  return f.length > 2 ? `${w}.${f.slice(0, 2)}` : raw;
}

type Props = {
  layout: AnnexureComparisonLayoutDef;
  values: ComparisonValues;
  onChange: (param: string, value: string) => void;
};

function ComparisonField({
  param,
  value,
  onChange,
  inputType,
  readonly,
}: {
  param: string;
  value: string;
  onChange: (param: string, value: string) => void;
  inputType: "textarea" | "number";
  readonly?: boolean;
}) {
  if (readonly) {
    return <input className={readonlyClass} readOnly value={value} />;
  }
  if (inputType === "number") {
    return (
      <input
        className={inputClass}
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(param, clampDecimal(e.target.value))}
      />
    );
  }
  return (
    <textarea
      className={textareaClass}
      rows={1}
      value={value}
      onChange={(e) => onChange(param, e.target.value)}
    />
  );
}

function LabelContent({ text }: { text: string }) {
  const parts = text.split("\n");
  return (
    <>
      {parts.map((line, i) => (
        <span key={i} className={i > 0 ? "block" : undefined}>
          {line}
        </span>
      ))}
    </>
  );
}

function ComparisonDataRow({
  row,
  prevRow,
  values,
  onChange,
  inputType,
}: {
  row: AnnexureComparisonRowDef;
  prevRow?: AnnexureComparisonRowDef;
  values: ComparisonValues;
  onChange: (param: string, value: string) => void;
  inputType: "textarea" | "number";
}) {
  const isGroupStart = Boolean(row.groupLabel && row.groupStart);
  const isGroupContinue = Boolean(prevRow?.groupLabel && prevRow?.groupStart && !row.groupStart);
  const labelClass = row.emphasis ? "font-semibold" : "";

  if (row.spanBoth) {
    return (
      <tr className="border-b border-border">
        <td colSpan={2} className={`${cellBorder} px-3 py-2 text-sm text-foreground ${labelClass}`}>
          <LabelContent text={row.label} />
        </td>
        <td colSpan={2} className={`${cellBorder} px-2 py-1.5`}>
          <ComparisonField
            param={row.baseParam}
            value={values[row.baseParam] ?? ""}
            onChange={onChange}
            inputType={inputType}
            readonly={row.readonly}
          />
        </td>
      </tr>
    );
  }

  if (isGroupStart) {
    return (
      <tr className="border-b border-border">
        <td
          rowSpan={2}
          className={`${cellBorder} px-3 py-2 text-center align-middle text-sm font-medium text-foreground`}
        >
          {row.groupLabel}
        </td>
        <td className={`${cellBorder} px-3 py-2 text-sm text-foreground`}>{row.label}</td>
        <td className={`${cellBorder} px-2 py-1.5`}>
          <ComparisonField
            param={row.baseParam}
            value={values[row.baseParam] ?? ""}
            onChange={onChange}
            inputType={inputType}
            readonly={row.readonly}
          />
        </td>
        <td className={`${cellBorder} px-2 py-1.5`}>
          <ComparisonField
            param={row.designParam}
            value={values[row.designParam] ?? ""}
            onChange={onChange}
            inputType={inputType}
            readonly={row.readonly}
          />
        </td>
      </tr>
    );
  }

  if (isGroupContinue) {
    return (
      <tr className="border-b border-border">
        <td className={`${cellBorder} px-3 py-2 text-sm text-foreground`}>{row.label}</td>
        <td className={`${cellBorder} px-2 py-1.5`}>
          <ComparisonField
            param={row.baseParam}
            value={values[row.baseParam] ?? ""}
            onChange={onChange}
            inputType={inputType}
            readonly={row.readonly}
          />
        </td>
        <td className={`${cellBorder} px-2 py-1.5`}>
          <ComparisonField
            param={row.designParam}
            value={values[row.designParam] ?? ""}
            onChange={onChange}
            inputType={inputType}
            readonly={row.readonly}
          />
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-border">
      <td colSpan={2} className={`${cellBorder} px-3 py-2 text-sm text-foreground ${labelClass}`}>
        <LabelContent text={row.label} />
      </td>
      <td className={`${cellBorder} px-2 py-1.5`}>
        <ComparisonField
          param={row.baseParam}
          value={values[row.baseParam] ?? ""}
          onChange={onChange}
          inputType={inputType}
          readonly={row.readonly}
        />
      </td>
      <td className={`${cellBorder} px-2 py-1.5`}>
        <ComparisonField
          param={row.designParam}
          value={values[row.designParam] ?? ""}
          onChange={onChange}
          inputType={inputType}
          readonly={row.readonly}
        />
      </td>
    </tr>
  );
}

export function AnnexureComparisonTable({ layout, values, onChange }: Props) {
  const headers = layout.columnHeaders ?? ["PARAMETERS", "BASE CASE", "DESIGN CASE"];
  const inputType = layout.inputType ?? "textarea";

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full min-w-[640px] max-w-[1030px] border-collapse text-sm">
        <tbody>
          <tr className="bg-muted/30">
            <th colSpan={2} className={`${cellBorder} px-3 py-2 text-center font-semibold text-foreground`}>
              {headers[0]}
            </th>
            <th className={`${cellBorder} px-3 py-2 text-center font-semibold text-foreground`}>
              {headers[1]}
            </th>
            <th className={`${cellBorder} px-3 py-2 text-center font-semibold text-foreground`}>
              {headers[2]}
            </th>
          </tr>
          {layout.sections.map((section) => (
            <SectionBlock
              key={section.title}
              sectionTitle={section.title}
              rows={section.rows}
              values={values}
              onChange={onChange}
              inputType={inputType}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionBlock({
  sectionTitle,
  rows,
  values,
  onChange,
  inputType,
}: {
  sectionTitle: string;
  rows: AnnexureComparisonRowDef[];
  values: ComparisonValues;
  onChange: (param: string, value: string) => void;
  inputType: "textarea" | "number";
}) {
  return (
    <>
      <tr>
        <td
          colSpan={4}
          className={`${cellBorder} bg-muted/20 px-3 py-2 text-center text-sm font-semibold tracking-wide text-foreground`}
        >
          {sectionTitle}
        </td>
      </tr>
      {rows.map((row, i) => (
        <ComparisonDataRow
          key={`${row.baseParam}-${i}`}
          row={row}
          prevRow={rows[i - 1]}
          values={values}
          onChange={onChange}
          inputType={inputType}
        />
      ))}
    </>
  );
}
