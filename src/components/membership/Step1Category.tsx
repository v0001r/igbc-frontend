import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, User, Users, Crown, ArrowRight, Check,
  Compass, PenTool, HardHat, Wrench, Cog, Palette, Factory, Package, GraduationCap, MoreHorizontal,
  Info,
} from "lucide-react";
import type { MembershipMasterItem, MembershipPlan } from "@/lib/membership";

interface Step1Props {
  data: { membershipTypeId: number | null; membershipCategoryId: number | null; membershipPlanId: number | null };
  masters: {
    membershipTypes: MembershipMasterItem[];
    membershipCategories: MembershipMasterItem[];
    membershipPlans: MembershipPlan[];
  };
  loading: boolean;
  onUpdate: (data: {
    membershipTypeId: number | null;
    membershipCategoryId: number | null;
    membershipPlanId: number | null;
  }) => void;
  onNext: () => Promise<void>;
}

const colorMap: Record<string, { bg: string; border: string; text: string; ring: string }> = {
  ocean: { bg: "bg-ocean/8", border: "border-ocean", text: "text-ocean", ring: "ring-ocean/20" },
  emerald: { bg: "bg-emerald/8", border: "border-emerald", text: "text-emerald", ring: "ring-emerald/20" },
  accent: { bg: "bg-accent/8", border: "border-accent", text: "text-accent", ring: "ring-accent/20" },
  primary: { bg: "bg-primary/8", border: "border-primary", text: "text-primary", ring: "ring-primary/20" },
};

const iconPool = [
  User,
  Crown,
  Building2,
  Users,
  Compass,
  PenTool,
  HardHat,
  Wrench,
  Cog,
  Palette,
  Factory,
  Package,
  GraduationCap,
  MoreHorizontal,
];
const colorKeys = ["ocean", "emerald", "accent", "primary"] as const;

export const Step1Category = ({ data, masters, loading, onUpdate, onNext }: Step1Props) => {
  const [typeId, setTypeId] = useState<number | null>(data.membershipTypeId);
  const [categoryId, setCategoryId] = useState<number | null>(data.membershipCategoryId);
  const [planId, setPlanId] = useState<number | null>(data.membershipPlanId);
  const [submitting, setSubmitting] = useState(false);

  const plansForType = masters.membershipPlans.filter((plan) => {
    if (!typeId) {
      return false;
    }
    if (!plan.membershipTypeId) {
      return true;
    }
    return plan.membershipTypeId === typeId;
  });

  const handleNext = async () => {
    onUpdate({ membershipTypeId: typeId, membershipCategoryId: categoryId, membershipPlanId: planId });
    setSubmitting(true);
    try {
      await onNext();
    } finally {
      setSubmitting(false);
    }
  };

  const selectedType = masters.membershipTypes.find((m) => m.id === typeId);
  const selectedCategory = masters.membershipCategories.find((m) => m.id === categoryId);
  const selectedPlan = masters.membershipPlans.find((m) => m.id === planId);
  const isIndividualMembership =
    selectedType?.name.toLowerCase().includes("individual") ?? false;
  const canProceed = true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Step Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">1</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Step 1 of 5</span>
            </div>
            <h2 className="text-lg font-bold text-foreground">Choose Your Membership</h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Select a plan that fits your needs</p>
          </div>

          {/* Membership Plans - 2x2 Grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {masters.membershipTypes.map((m, i) => {
              const isSelected = typeId === m.id;
              const color = colorKeys[i % colorKeys.length];
              const colors = colorMap[color];
              const Icon = iconPool[i % iconPool.length];
              return (
                <motion.button
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    setTypeId(m.id);
                    setPlanId(null);
                  }}
                  className={`group relative rounded-xl border-2 text-left overflow-hidden transition-all duration-200 ${
                    isSelected
                      ? `${colors.border} shadow-card-hover ring-2 ${colors.ring}`
                      : "border-border bg-card hover:border-muted-foreground/20 hover:shadow-card-hover"
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isSelected ? `${colors.bg} ${colors.text}` : "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="h-5 w-5" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between">
                          <h3 className="text-sm font-bold text-foreground">{m.name}</h3>
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
                          {m.code ?? "Membership plan"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Selection indicator */}
                  <div className={`flex items-center justify-between px-4 py-2 transition-colors ${
                    isSelected ? colors.bg : "bg-muted/30"
                  }`}>
                    <span className={`text-[11px] font-semibold ${isSelected ? colors.text : "text-muted-foreground"}`}>
                      {isSelected ? "✓ Selected" : `Select ${m.name}`}
                    </span>
                    <div className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all ${
                      isSelected ? `${colors.border} bg-current` : "border-muted-foreground/30"
                    }`}>
                      {isSelected && <Check className="h-2.5 w-2.5 text-card" strokeWidth={3} />}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Category Selection */}
          <AnimatePresence>
            {typeId && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-foreground">What describes you best?</h3>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">Select your professional category</p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {masters.membershipCategories.map((cat, i) => {
                    const isSelected = categoryId === cat.id;
                    const Icon = iconPool[(i + 4) % iconPool.length];
                    return (
                      <motion.button
                        key={cat.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setCategoryId(cat.id)}
                        className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-2 py-3 text-center transition-all ${
                          isSelected
                            ? "border-primary bg-primary-muted shadow-sm"
                            : "border-border bg-card hover:border-muted-foreground/20"
                        }`}
                      >
                        <div className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                          <Icon className="h-4 w-4" strokeWidth={1.5} />
                        </div>
                        <span className={`text-[11px] font-medium leading-tight ${isSelected ? "text-primary" : "text-foreground"}`}>
                          {cat.name}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {typeId && isIndividualMembership && (
            <div>
              <div className="mb-3">
                <h3 className="text-sm font-bold text-foreground">Choose Membership Plan</h3>
                <p className="mt-0.5 text-[12px] text-muted-foreground">Select an available plan for checkout</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {plansForType.map((plan) => {
                  const isSelected = planId === plan.id;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => setPlanId(plan.id)}
                      className={`rounded-lg border px-3 py-3 text-left ${
                        isSelected ? "border-primary bg-primary-muted" : "border-border bg-card hover:border-muted-foreground/20"
                      }`}
                    >
                      <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                      <p className="text-[11px] text-muted-foreground">{plan.code ?? "Plan"}</p>
                      <p className="mt-1 text-sm font-mono text-primary">
                        {typeof plan.fee === "number" ? `Rs ${plan.fee.toLocaleString("en-IN")}` : "Fee as per plan"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Right Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            {/* Selection Summary */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Your Selection</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Plan</span>
                  <span className="text-[13px] font-semibold text-foreground">{selectedType?.name || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Category</span>
                  <span className="text-[13px] font-semibold text-foreground">{selectedCategory?.name || "—"}</span>
                </div>
                {selectedPlan && (
                  <>
                    <div className="border-t border-border pt-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[13px] text-muted-foreground">Annual Fee</span>
                        <span className="font-mono text-lg font-bold text-primary">
                          {typeof selectedPlan.fee === "number"
                            ? `Rs ${selectedPlan.fee.toLocaleString("en-IN")}`
                            : "As per plan"}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">+ applicable GST</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Help Tips */}
            <div className="rounded-xl bg-primary-muted p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-3.5 w-3.5 text-primary" />
                <h4 className="text-xs font-bold text-primary">Need help choosing?</h4>
              </div>
              <ul className="space-y-1.5 text-[11px] leading-relaxed text-muted-foreground">
                <li>• <strong>Individual</strong> – Best for beginners</li>
                <li>• <strong>Professional</strong> – For certified practitioners</li>
                <li>• <strong>Corporate</strong> – For teams & organizations</li>
                <li>• <strong>Institutional</strong> – For colleges & universities</li>
              </ul>
            </div>

            {/* Continue Button */}
            <motion.button
              whileHover={canProceed ? { scale: 1.01 } : {}}
              whileTap={canProceed ? { scale: 0.99 } : {}}
              onClick={handleNext}
              disabled={!canProceed || loading || submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-premium transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading || submitting ? "Saving..." : "Continue"} {!loading && !submitting && <ArrowRight className="h-4 w-4" />}
            </motion.button>

            {typeId && (!categoryId || (isIndividualMembership && !planId)) && (
              <p className="text-center text-[11px] text-muted-foreground">
                {isIndividualMembership ? "Select category and plan to continue" : "Select category to continue"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation (bottom bar) */}
      <div className="lg:hidden mt-6">
        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-card">
          <div className="text-[11px] text-muted-foreground">
            {canProceed ? (
              <span className="text-primary font-medium">✓ Ready to continue</span>
            ) : (
              <span>
                {!typeId
                  ? "Select a membership type"
                  : !categoryId
                    ? "Select category"
                    : "Select a plan"}
              </span>
            )}
          </div>
          <motion.button
            whileHover={canProceed ? { scale: 1.02 } : {}}
            whileTap={canProceed ? { scale: 0.98 } : {}}
            onClick={handleNext}
            disabled={!canProceed || loading || submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading || submitting ? "Saving..." : "Continue"} {!loading && !submitting && <ArrowRight className="h-3.5 w-3.5" />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
