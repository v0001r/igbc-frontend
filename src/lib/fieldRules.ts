/**
 * Client-side evaluator for Laravel-ported field rules (from certification workspace API).
 * Keep in sync with `igbc-backend/src/rating-config/field-rules/field-rules.engine.ts`.
 */

export type FieldRuleOperator = "==" | "!=" | "in" | "notIn" | "checked" | "notChecked";

export type FieldRuleCondition = {
  field: string;
  op: FieldRuleOperator;
  value?: string | string[];
};

export type ShowWhenRule = {
  targets: string[];
  when: FieldRuleCondition;
};

export type HideWhenRule = {
  targets: string[];
  when: FieldRuleCondition;
};

export type ReadonlyWhenRule = {
  target: string;
  when: FieldRuleCondition;
};

export type ComputeWhenRule = {
  target: string;
  computeId: string;
  sources: string[];
};

export type FieldRuleSet = {
  laravelScript?: string;
  showWhen?: ShowWhenRule[];
  hideWhen?: HideWhenRule[];
  readonlyWhen?: ReadonlyWhenRule[];
  computeWhen?: ComputeWhenRule[];
};

export type FieldRulesEvaluation = {
  visible: Record<string, boolean>;
  readonly: Record<string, boolean>;
  computed: Record<string, string>;
};

function parseNum(value: string | undefined): number {
  const n = parseFloat((value ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function isCheckedValue(value: string | undefined): boolean {
  const v = (value ?? "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

function normalize(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function evaluateCondition(condition: FieldRuleCondition, values: Record<string, string>): boolean {
  const actual = values[condition.field] ?? "";

  switch (condition.op) {
    case "checked":
      return isCheckedValue(actual);
    case "notChecked":
      return !isCheckedValue(actual);
    case "==":
      return normalize(actual) === normalize(String(condition.value ?? ""));
    case "!=":
      return normalize(actual) !== normalize(String(condition.value ?? ""));
    case "in": {
      const list = Array.isArray(condition.value)
        ? condition.value
        : [String(condition.value ?? "")];
      return list.map((v) => normalize(v)).includes(normalize(actual));
    }
    case "notIn": {
      const list = Array.isArray(condition.value)
        ? condition.value
        : [String(condition.value ?? "")];
      return !list.map((v) => normalize(v)).includes(normalize(actual));
    }
    default:
      return false;
  }
}

const COMPUTE: Record<string, (values: Record<string, string>) => string | null> = {
  green_parking_bycycle_percent: (values) => {
    const totCycle = parseNum(values.bycycle);
    const evUnits = parseNum(values.dwelling_units);
    if (evUnits <= 0) return "";
    return ((totCycle / evUnits) * 100).toFixed(2);
  },
  two_wheel_ev_percent: (values) => {
    const total = parseNum(values.two_wheel);
    const ev = parseNum(values.ev_twowheel);
    if (total <= 0) return "";
    return ((ev / total) * 100).toFixed(2);
  },
  four_wheel_ev_percent: (values) => {
    const total = parseNum(values.four_wheel);
    const ev = parseNum(values.ev_fourwheel);
    if (total <= 0) return "";
    return ((ev / total) * 100).toFixed(2);
  },
  percent_eco_labelled_interior_furniture: (values) => {
    const total = parseNum(values.total_furniture_cost);
    const eco = parseNum(values.total_ecolabelled_furniture_cost);
    if (total <= 0 || eco <= 0) return "";
    return String((eco / total) * 100);
  },
};

export function evaluateFieldRules(
  ruleSet: FieldRuleSet | null | undefined,
  fieldNames: string[],
  values: Record<string, string>,
): FieldRulesEvaluation {
  const showControlled = new Set<string>();
  for (const rule of ruleSet?.showWhen ?? []) {
    for (const target of rule.targets) {
      showControlled.add(target);
    }
  }

  const visible = new Map<string, boolean>();
  for (const name of fieldNames) {
    visible.set(name, !showControlled.has(name));
  }

  const readonly: Record<string, boolean> = {};
  const computed: Record<string, string> = {};

  if (!ruleSet) {
    return {
      visible: Object.fromEntries(fieldNames.map((n) => [n, true])),
      readonly,
      computed,
    };
  }

  for (const rule of ruleSet.showWhen ?? []) {
    if (!evaluateCondition(rule.when, values)) continue;
    for (const target of rule.targets) {
      visible.set(target, true);
    }
  }

  for (const rule of ruleSet.hideWhen ?? []) {
    if (!evaluateCondition(rule.when, values)) continue;
    for (const target of rule.targets) {
      visible.set(target, false);
    }
  }

  for (const rule of ruleSet.readonlyWhen ?? []) {
    readonly[rule.target] = evaluateCondition(rule.when, values);
  }

  for (const rule of ruleSet.computeWhen ?? []) {
    const fn = COMPUTE[rule.computeId];
    if (!fn) continue;
    const result = fn(values);
    if (result !== null) {
      computed[rule.target] = result;
    }
  }

  return {
    visible: Object.fromEntries(visible),
    readonly,
    computed,
  };
}

export function getRulesForSection(
  fieldRules: Record<string, FieldRuleSet> | undefined,
  tab: string,
  subtab: string,
): FieldRuleSet | null {
  if (!fieldRules) return null;
  return fieldRules[`${tab}/${subtab}`] ?? null;
}

export function isFieldVisibleByRules(
  fieldName: string,
  evaluation: FieldRulesEvaluation | null | undefined,
): boolean {
  if (!evaluation) return true;
  if (fieldName in evaluation.visible) {
    return evaluation.visible[fieldName];
  }
  return true;
}

export function isFieldReadonlyByRules(
  fieldName: string,
  evaluation: FieldRulesEvaluation | null | undefined,
): boolean {
  return evaluation?.readonly[fieldName] === true;
}

/** Field names that became hidden after a controller value change (Laravel `clearData`). */
export function getFieldsHiddenByRules(
  ruleSet: FieldRuleSet | null | undefined,
  fieldNames: string[],
  previousValues: Record<string, string>,
  nextValues: Record<string, string>,
): string[] {
  if (!ruleSet) return [];
  const prev = evaluateFieldRules(ruleSet, fieldNames, previousValues);
  const next = evaluateFieldRules(ruleSet, fieldNames, nextValues);
  return fieldNames.filter((name) => prev.visible[name] === true && next.visible[name] === false);
}
