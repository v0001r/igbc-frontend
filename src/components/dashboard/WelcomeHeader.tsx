import { Copy, Trophy, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export const WelcomeHeader = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-ocean text-xl font-bold text-primary-foreground shadow-premium">
          D
        </div>
        <div>
          <p className="text-sm font-medium text-primary">Overview</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Welcome back, Davis
          </h1>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <StatusCard label="IGBC ID" value="#123456" icon={<Copy className="h-3.5 w-3.5" strokeWidth={1.5} />} />
        <StatusCard label="Status" value="Active" dot />
        <StatusCard label="Points" value="250" icon={<Trophy className="h-3.5 w-3.5" strokeWidth={1.5} />} />
      </div>
    </motion.header>
  );
};

const StatusCard = ({
  label,
  value,
  icon,
  dot,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  dot?: boolean;
}) => (
  <div className="glass-card glass-card-interactive flex min-w-[140px] flex-col gap-1 px-4 py-3">
    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
      {label}
    </span>
    <div className="flex items-center justify-between">
      <span className="font-mono text-sm font-medium tracking-tight text-foreground">{value}</span>
      {dot && <div className="h-2 w-2 rounded-full bg-primary animate-pulse-dot" />}
      {icon && <span className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">{icon}</span>}
    </div>
  </div>
);
