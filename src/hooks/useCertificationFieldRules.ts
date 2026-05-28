import { useMemo } from "react";
import {
  evaluateFieldRules,
  getFieldsHiddenByRules,
  getRulesForSection,
  type FieldRuleSet,
  type FieldRulesEvaluation,
} from "@/lib/fieldRules";

type Params = {
  fieldRules: Record<string, FieldRuleSet> | undefined;
  tab: string;
  subtab: string;
  fieldNames: string[];
  sectionValues: Record<string, string>;
};

/**
 * Evaluates Laravel-ported show/hide rules for the active certification section.
 */
export function useCertificationFieldRules({
  fieldRules,
  tab,
  subtab,
  fieldNames,
  sectionValues,
}: Params): {
  ruleSet: FieldRuleSet | null;
  evaluation: FieldRulesEvaluation;
  hiddenFieldNames: string[];
} {
  const ruleSet = useMemo(
    () => getRulesForSection(fieldRules, tab, subtab),
    [fieldRules, tab, subtab],
  );

  const evaluation = useMemo(
    () => evaluateFieldRules(ruleSet, fieldNames, sectionValues),
    [ruleSet, fieldNames, sectionValues],
  );

  const hiddenFieldNames = useMemo(
    () =>
      fieldNames.filter((name) => evaluation.visible[name] === false),
    [fieldNames, evaluation.visible],
  );

  return { ruleSet, evaluation, hiddenFieldNames };
}

export { getFieldsHiddenByRules };
