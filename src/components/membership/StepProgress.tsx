import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepProgressProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const steps = [
  { num: 1, title: "Category", subtitle: "Membership Type" },
  { num: 2, title: "Details", subtitle: "Contact Info" },
  { num: 3, title: "Review", subtitle: "Verify Info" },
  { num: 4, title: "Invoice", subtitle: "Proforma" },
  { num: 5, title: "Payment", subtitle: "Confirm" },
];

export const StepProgress = ({ currentStep, onStepClick }: StepProgressProps) => {
  return (
    <div className="w-full">
      {/* Mobile: compact */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[13px] font-semibold text-foreground">
            Step {currentStep}: {steps[currentStep - 1].title}
          </p>
          <p className="text-[11px] text-muted-foreground">{currentStep}/5</p>
        </div>
        <div className="relative h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-primary"
            initial={false}
            animate={{ width: `${(currentStep / 5) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden sm:block">
        <div className="rounded-xl border border-border bg-card px-6 py-4 shadow-card">
          <div className="relative">
            <div className="absolute left-0 right-0 top-[18px] h-px bg-border" />
            <div
              className="absolute left-0 top-[18px] h-px bg-primary transition-all duration-400"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
            <div className="grid grid-cols-5">
              {steps.map((step) => {
              const isCompleted = currentStep > step.num;
              const isActive = currentStep === step.num;

              return (
                <div key={step.num} className="flex flex-col items-center">
                  <button
                    onClick={() => isCompleted && onStepClick(step.num)}
                    disabled={!isCompleted}
                    className="relative z-10 shrink-0"
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        isCompleted
                          ? "bg-primary text-primary-foreground cursor-pointer hover:scale-105"
                          : isActive
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/15"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4" strokeWidth={3} /> : step.num}
                    </div>
                  </button>
                  <div className="mt-2 text-center">
                    <p className={`text-[11px] font-semibold ${
                      isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
              );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
