import { motion } from "framer-motion";
import { Check, ClipboardList, Eye, CreditCard } from "lucide-react";

interface ExamStepProgressProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const steps = [
  { num: 1, label: "Registration", icon: ClipboardList },
  { num: 2, label: "Review", icon: Eye },
  { num: 3, label: "Payment", icon: CreditCard },
];

export const ExamStepProgress = ({ currentStep, onStepClick }: ExamStepProgressProps) => {
  return (
    <div className="mt-8 mb-8">
      {/* Desktop */}
      <div className="hidden sm:flex items-center justify-center gap-0">
        {steps.map((s, i) => {
          const completed = currentStep > s.num;
          const active = currentStep === s.num;
          const Icon = s.icon;

          return (
            <div key={s.num} className="flex items-center">
              <button
                onClick={() => completed && onStepClick(s.num)}
                disabled={!completed}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    completed
                      ? "border-primary bg-primary text-primary-foreground cursor-pointer hover:shadow-md"
                      : active
                      ? "border-primary bg-primary-muted text-primary shadow-md"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {completed ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                  {active && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary"
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
                <span
                  className={`text-xs font-medium transition-colors ${
                    active ? "text-primary" : completed ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </button>
              {i < steps.length - 1 && (
                <div className="mx-4 h-0.5 w-24 rounded-full bg-border overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: completed ? "100%" : "0%" }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="flex sm:hidden items-center justify-between px-2">
        {steps.map((s, i) => {
          const completed = currentStep > s.num;
          const active = currentStep === s.num;
          return (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold ${
                    completed
                      ? "border-primary bg-primary text-primary-foreground"
                      : active
                      ? "border-primary bg-primary-muted text-primary"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {completed ? <Check className="h-4 w-4" /> : s.num}
                </div>
                <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="mx-2 h-0.5 flex-1 rounded-full bg-border overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      completed ? "w-full bg-primary" : "w-0"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile progress percentage */}
      <div className="mt-3 flex sm:hidden items-center gap-2 px-2">
        <div className="h-1.5 flex-1 rounded-full bg-border overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          Step {currentStep}/{steps.length}
        </span>
      </div>
    </div>
  );
};
