import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const projectStatusData = [
  { name: "Jan", Pending: 12, Approved: 28, Rejected: 5 },
  { name: "Feb", Pending: 15, Approved: 32, Rejected: 7 },
  { name: "Mar", Pending: 10, Approved: 40, Rejected: 3 },
  { name: "Apr", Pending: 18, Approved: 35, Rejected: 6 },
  { name: "May", Pending: 14, Approved: 45, Rejected: 4 },
  { name: "Jun", Pending: 20, Approved: 50, Rejected: 8 },
];

const revenueData = [
  { name: "Jan", revenue: 42 }, { name: "Feb", revenue: 53 },
  { name: "Mar", revenue: 61 }, { name: "Apr", revenue: 58 },
  { name: "May", revenue: 72 }, { name: "Jun", revenue: 85 },
  { name: "Jul", revenue: 78 }, { name: "Aug", revenue: 92 },
];

const membershipData = [
  { name: "Jan", members: 120 }, { name: "Feb", members: 180 },
  { name: "Mar", members: 240 }, { name: "Apr", members: 310 },
  { name: "May", members: 380 }, { name: "Jun", members: 450 },
];

const periods = ["7D", "30D", "90D", "1Y"] as const;

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [period, setPeriod] = useState<string>("30D");
  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-foreground">{title}</h3>
        <div className="flex gap-0.5">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-2 py-0.5 rounded text-[10px] font-medium transition-colors"
              style={{
                backgroundColor: period === p ? "hsl(var(--primary))" : "transparent",
                color: period === p ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
      <p className="text-[10px] font-medium text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-[10px]" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const gridStroke = "hsl(214, 18%, 93%)";
const tickStyle = { fontSize: 10, fill: "hsl(215, 10%, 50%)" };

const DashboardCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <ChartCard title="Projects Status">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={projectStatusData} barSize={12}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="name" tick={tickStyle} stroke={gridStroke} />
            <YAxis tick={tickStyle} stroke={gridStroke} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="Pending" fill="hsl(38, 92%, 50%)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Approved" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Rejected" fill="hsl(0, 72%, 51%)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Revenue Trend (₹L)">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(152, 55%, 38%)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(152, 55%, 38%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="name" tick={tickStyle} stroke={gridStroke} />
            <YAxis tick={tickStyle} stroke={gridStroke} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="hsl(152, 55%, 38%)" strokeWidth={2} fill="url(#revGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Membership Growth">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={membershipData} barSize={16}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="name" tick={tickStyle} stroke={gridStroke} />
            <YAxis tick={tickStyle} stroke={gridStroke} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="members" fill="hsl(152, 55%, 42%)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

export default DashboardCharts;
