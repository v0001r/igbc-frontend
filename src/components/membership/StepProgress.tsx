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
          <div className="flex items-center justify-between">
            {steps.map((step, i) => {
              const isCompleted = currentStep > step.num;
              const isActive = currentStep === step.num;

              return (
                <div key={step.num} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center w-full">
                    <div className="flex items-center w-full">
                      {i > 0 && (
                        <div className="flex-1 h-px bg-border">
                          <motion.div
                            className="h-full bg-primary"
                            initial={false}
                            animate={{ width: isCompleted ? "100%" : isActive ? "50%" : "0%" }}
                            transition={{ duration: 0.4 }}
                          />
                        </div>
                      )}

                      <button
                        onClick={() => isCompleted && onStepClick(step.num)}
                        disabled={!isCompleted}
                        className="relative shrink-0"
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

                      {i < steps.length - 1 && (
                        <div className="flex-1 h-px bg-border">
                          <motion.div
                            className="h-full bg-primary"
                            initial={false}
                            animate={{ width: isCompleted ? "100%" : "0%" }}
                            transition={{ duration: 0.4 }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-center">
                      <p className={`text-[11px] font-semibold ${
                        isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
