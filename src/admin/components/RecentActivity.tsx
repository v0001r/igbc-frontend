import { CheckCircle, Clock, AlertCircle, FileText, UserPlus, Award, MoreHorizontal } from "lucide-react";
import { useState } from "react";

const activities = [
  { icon: UserPlus, text: "New membership application from Amol Dashrath Shinde", time: "2 min ago", type: "info" as const },
  { icon: CheckCircle, text: "Project 'Hungerford House' approved by reviewer", time: "15 min ago", type: "success" as const },
  { icon: Clock, text: "AP Exam payment pending for Sarah Patel", time: "1 hour ago", type: "warning" as const },
  { icon: Award, text: "Certificate issued for IGBCIM01260265", time: "2 hours ago", type: "success" as const },
  { icon: AlertCircle, text: "Membership expired for Conserve Buildcon LLP", time: "3 hours ago", type: "danger" as const },
  { icon: FileText, text: "New project registration: Mahindra Codename M3", time: "4 hours ago", type: "info" as const },
  { icon: CheckCircle, text: "Coupon ALCBT-26-13 redeemed by 3 users", time: "5 hours ago", type: "success" as const },
];

const typeColors = {
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
};

const filterTypes = ["All", "Info", "Success", "Warning", "Danger"];

const RecentActivity = () => {
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? activities : activities.filter((a) => a.type === filter.toLowerCase());

  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-foreground">Recent Activity</h3>
        <div className="flex items-center gap-1.5">
          {filterTypes.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2 max-h-[340px] overflow-y-auto scrollbar-thin">
        {filtered.map((activity, i) => {
          const Icon = activity.icon;
          return (
            <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg transition-all hover:bg-muted/50 cursor-pointer group">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeColors[activity.type]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-foreground leading-snug">{activity.text}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{activity.time}</p>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted">
                <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-[13px] text-muted-foreground py-8">No activity found</p>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
