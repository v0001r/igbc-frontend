import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  icon: LucideIcon;
  color: "primary" | "success" | "warning" | "info";
  sparkData?: number[];
}

const colorMap = {
  primary: { bg: "bg-primary/10", icon: "text-primary" },
  success: { bg: "bg-success/10", icon: "text-success" },
  warning: { bg: "bg-warning/10", icon: "text-warning" },
  info: { bg: "bg-info/10", icon: "text-info" },
};

const sparkColors: Record<string, string> = {
  primary: "hsl(152, 55%, 38%)",
  success: "hsl(142, 71%, 45%)",
  warning: "hsl(38, 92%, 50%)",
  info: "hsl(217, 91%, 60%)",
};

const defaultSpark = [30, 50, 35, 60, 45, 70, 55, 80, 65, 90, 75, 95];

const MiniSparkline = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 28;
  const w = 72;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="opacity-50">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
    </svg>
  );
};

const KPICard = ({ title, value, change, icon: Icon, color, sparkData }: KPICardProps) => {
  const colors = colorMap[color];
  const isPositive = change >= 0;

  return (
    <div className="kpi-card group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
          <p className="text-lg font-bold text-foreground mt-1">{value}</p>
          <div className="flex items-center gap-1 mt-1">
            {isPositive ? (
              <TrendingUp className="w-3 h-3 text-success" />
            ) : (
              <TrendingDown className="w-3 h-3 text-destructive" />
            )}
            <span className={`text-[10px] font-semibold ${isPositive ? "text-success" : "text-destructive"}`}>
              {isPositive ? "+" : ""}{change}%
            </span>
            <span className="text-[10px] text-muted-foreground">vs last month</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center`}>
            <Icon className={`w-4.5 h-4.5 ${colors.icon}`} />
          </div>
          <MiniSparkline data={sparkData || defaultSpark} color={sparkColors[color]} />
        </div>
      </div>
    </div>
  );
};

export default KPICard;
