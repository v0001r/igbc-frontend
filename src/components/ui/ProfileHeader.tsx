import { motion } from "framer-motion";
import { Camera } from "lucide-react";

export const ProfileHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 rounded-2xl bg-card p-6 shadow-card sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
            D
          </div>
          <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm">
            <Camera className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Lavona Davis</h1>
          <p className="text-sm text-muted-foreground">Member since 2020 · Hyderabad, India</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full bg-primary-muted px-2.5 py-0.5 text-xs font-medium text-primary">
              Premium
            </span>
            <span className="rounded-full bg-ocean/10 px-2.5 py-0.5 text-xs font-medium text-ocean">
              IGBC AP
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
