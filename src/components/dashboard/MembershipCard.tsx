import { motion } from "framer-motion";
import { Crown, Calendar, RefreshCw } from "lucide-react";

export const MembershipCard = () => {
  const totalDays = 365;
  const elapsed = 280;
  const progress = (elapsed / totalDays) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-card glass-card-interactive flex flex-col p-5"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-muted">
          <Crown className="h-5 w-5 text-primary" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Membership</h3>
          <p className="text-xs text-muted-foreground">Premium Plan</p>
        </div>
      </div>

      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Valid till</span>
          <span className="font-medium text-foreground">Dec 2026</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Renewal</span>
          <span className="font-medium text-foreground">Nov 2026</span>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>Membership Period</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-primary-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <button className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90">
        <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
        Renew Now
      </button>
    </motion.div>
  );
};
