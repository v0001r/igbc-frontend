import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, User, Users, Crown, ArrowRight, Check, Sparkles,
  Compass, PenTool, HardHat, Wrench, Cog, Palette, Factory, Package, GraduationCap, MoreHorizontal,
  Info,
} from "lucide-react";

interface Step1Props {
  data: { membershipType: string; category: string };
  onUpdate: (data: { membershipType: string; category: string }) => void;
  onNext: () => void;
}

const membershipTypes = [
  {
    id: "individual",
    title: "Individual",
    desc: "For professionals pursuing green building careers",
    icon: User,
    price: "₹5,000",
    period: "per year",
    highlight: "Most Affordable",
    features: ["IGBC AP Exam eligibility", "Member directory listing", "10% event discounts", "Monthly newsletter"],
    color: "ocean",
  },
  {
    id: "professional",
    title: "Professional",
    desc: "For experienced green building professionals",
    icon: Crown,
    price: "₹15,000",
    period: "per year",
    highlight: "Most Popular",
    popular: true,
    features: ["All Individual benefits", "Priority exam scheduling", "25% event discounts", "Networking events access", "3 AP Exam attempts"],
    color: "emerald",
  },
  {
    id: "corporate",
    title: "Corporate",
    desc: "For organizations committed to sustainability",
    icon: Building2,
    price: "₹50,000",
    period: "per year",
    highlight: "Best Value for Teams",
    features: ["All Professional benefits", "5 member accounts", "Logo on IGBC website", "Dedicated account manager", "Custom training programs"],
    color: "accent",
  },
  {
    id: "institutional",
    title: "Institutional",
    desc: "For academic & research institutions",
    icon: Users,
    price: "₹25,000",
    period: "per year",
    highlight: "For Education",
    features: ["Student memberships included", "Research collaboration", "Conference hosting rights", "Academic resource access"],
    color: "primary",
  },
];

const categories = [
  { id: "architect", label: "Architect", icon: Compass },
  { id: "builder", label: "Builder / Developer", icon: HardHat },
  { id: "consultant", label: "Consultant", icon: PenTool },
  { id: "contractor", label: "Contractor", icon: Wrench },
  { id: "engineer", label: "Engineer", icon: Cog },
  { id: "interior", label: "Interior Designer", icon: Palette },
  { id: "manufacturer", label: "Manufacturer", icon: Factory },
  { id: "supplier", label: "Product Supplier", icon: Package },
  { id: "student", label: "Student", icon: GraduationCap },
  { id: "other", label: "Other", icon: MoreHorizontal },
];

const colorMap: Record<string, { bg: string; border: string; text: string; ring: string }> = {
  ocean: { bg: "bg-ocean/8", border: "border-ocean", text: "text-ocean", ring: "ring-ocean/20" },
  emerald: { bg: "bg-emerald/8", border: "border-emerald", text: "text-emerald", ring: "ring-emerald/20" },
  accent: { bg: "bg-accent/8", border: "border-accent", text: "text-accent", ring: "ring-accent/20" },
  primary: { bg: "bg-primary/8", border: "border-primary", text: "text-primary", ring: "ring-primary/20" },
};

export const Step1Category = ({ data, onUpdate, onNext }: Step1Props) => {
  const [type, setType] = useState(data.membershipType);
  const [category, setCategory] = useState(data.category);

  const handleNext = () => {
    if (type && category) {
      onUpdate({ membershipType: type, category });
      onNext();
    }
  };

  const selectedPlan = membershipTypes.find((m) => m.id === type);

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
            {membershipTypes.map((m, i) => {
              const isSelected = type === m.id;
              const colors = colorMap[m.color];
              return (
                <motion.button
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setType(m.id)}
                  className={`group relative rounded-xl border-2 text-left overflow-hidden transition-all duration-200 ${
                    isSelected
                      ? `${colors.border} shadow-card-hover ring-2 ${colors.ring}`
                      : "border-border bg-card hover:border-muted-foreground/20 hover:shadow-card-hover"
                  }`}
                >
                  {/* Popular badge */}
                  {m.popular && (
                    <div className="absolute top-0 right-0 z-10">
                      <div className="flex items-center gap-1 rounded-bl-lg bg-primary px-2 py-1 text-[9px] font-bold text-primary-foreground uppercase tracking-wider">
                        <Sparkles className="h-2.5 w-2.5" /> Popular
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isSelected ? `${colors.bg} ${colors.text}` : "bg-muted text-muted-foreground"
                      }`}>
                        <m.icon className="h-5 w-5" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between">
                          <h3 className="text-sm font-bold text-foreground">{m.title}</h3>
                          <span className={`font-mono text-base font-bold ${isSelected ? colors.text : "text-foreground"}`}>{m.price}</span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">{m.desc}</p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      {m.features.slice(0, 3).map((f) => (
                        <div key={f} className="flex items-center gap-1.5">
                          <Check className={`h-3 w-3 shrink-0 ${isSelected ? colors.text : "text-primary"}`} strokeWidth={2.5} />
                          <span className="text-[11px] text-muted-foreground">{f}</span>
                        </div>
                      ))}
                      {m.features.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{m.features.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  {/* Selection indicator */}
                  <div className={`flex items-center justify-between px-4 py-2 transition-colors ${
                    isSelected ? colors.bg : "bg-muted/30"
                  }`}>
                    <span className={`text-[11px] font-semibold ${isSelected ? colors.text : "text-muted-foreground"}`}>
                      {isSelected ? "✓ Selected" : `Select ${m.title}`}
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
            {type && (
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
                  {categories.map((cat, i) => {
                    const isSelected = category === cat.label;
                    return (
                      <motion.button
                        key={cat.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setCategory(cat.label)}
                        className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-2 py-3 text-center transition-all ${
                          isSelected
                            ? "border-primary bg-primary-muted shadow-sm"
                            : "border-border bg-card hover:border-muted-foreground/20"
                        }`}
                      >
                        <div className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                          <cat.icon className="h-4 w-4" strokeWidth={1.5} />
                        </div>
                        <span className={`text-[11px] font-medium leading-tight ${isSelected ? "text-primary" : "text-foreground"}`}>
                          {cat.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                  <span className="text-[13px] font-semibold text-foreground">{selectedPlan?.title || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Category</span>
                  <span className="text-[13px] font-semibold text-foreground">{category || "—"}</span>
                </div>
                {selectedPlan && (
                  <>
                    <div className="border-t border-border pt-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[13px] text-muted-foreground">Annual Fee</span>
                        <span className="font-mono text-lg font-bold text-primary">{selectedPlan.price}</span>
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
              whileHover={type && category ? { scale: 1.01 } : {}}
              whileTap={type && category ? { scale: 0.99 } : {}}
              onClick={handleNext}
              disabled={!type || !category}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-premium transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </motion.button>

            {type && !category && (
              <p className="text-center text-[11px] text-muted-foreground">Select your category to continue</p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation (bottom bar) */}
      <div className="lg:hidden mt-6">
        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-card">
          <div className="text-[11px] text-muted-foreground">
            {type && category ? (
              <span className="text-primary font-medium">✓ Ready to continue</span>
            ) : (
              <span>{!type ? "Select a plan" : "Select category"}</span>
            )}
          </div>
          <motion.button
            whileHover={type && category ? { scale: 1.02 } : {}}
            whileTap={type && category ? { scale: 0.98 } : {}}
            onClick={handleNext}
            disabled={!type || !category}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Continue <ArrowRight className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
