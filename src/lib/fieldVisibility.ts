import type { GreenHomesFieldDef } from "@/lib/greenHomesConfig";
import { fieldIsRequired } from "@/lib/greenHomesConfig";

export type RequiredIfRule = {
  field: string;
  operator: string;
  value: string;
};

const REQUIRED_IF_RE = /^required_if:([^,]+),([^,]+),(.+)$/;

/** Parse Laravel-style `required_if:controller,==,1` from field validation. */
export function parseRequiredIfRule(validation: string | undefined): RequiredIfRule | null {
  if (!validation?.trim()) return null;
  const m = validation.trim().match(REQUIRED_IF_RE);
  if (!m) return null;
  return { field: m[1].trim(), operator: m[2].trim(), value: m[3].trim() };
}

export function isControlChecked(value: string | undefined): boolean {
  const v = (value ?? "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

export function evaluateRequiredIf(rule: RequiredIfRule, values: Record<string, string>): boolean {
  const actual = (values[rule.field] ?? "").trim();
  const expected = rule.value.trim();
  switch (rule.operator) {
    case "==":
      return actual === expected;
    case "!=":
      return actual !== expected;
    default:
      return false;
  }
}

/**
 * Field is shown when it has no `required_if`, or when the controlling field matches the rule.
 * Matches Laravel: dependent upload/doc fields appear when the checkbox is checked (value `1`).
 */
export function isFieldVisible(field: GreenHomesFieldDef, values: Record<string, string>): boolean {
  const rule = parseRequiredIfRule(field.validation);
  if (!rule) return true;
  return evaluateRequiredIf(rule, values);
}

/** Required only when visible (includes `required_if` dependents when their controller is checked). */
export function fieldIsRequiredWhenVisible(
  field: GreenHomesFieldDef,
  values: Record<string, string>,
): boolean {
  if (!isFieldVisible(field, values)) return false;
  if (fieldIsRequired(field)) return true;
  if (parseRequiredIfRule(field.validation)) return true;
  return false;
}

/** Fields whose visibility depends on `controllerFieldName` (e.g. checkbox → upload). */
export function fieldsControlledBy(
  controllerFieldName: string,
  fields: GreenHomesFieldDef[],
): GreenHomesFieldDef[] {
  return fields.filter((f) => {
    const rule = parseRequiredIfRule(f.validation);
    return rule?.field === controllerFieldName;
  });
}
