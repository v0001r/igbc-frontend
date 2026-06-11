import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
};

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function GlassCard({
  children,
  className,
  interactive = false,
  padding = "md",
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card",
        paddingMap[padding],
        interactive && "glass-card-interactive cursor-default",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
