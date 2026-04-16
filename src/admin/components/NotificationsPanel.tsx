import { Bell, X, Check, AlertTriangle, Info } from "lucide-react";
import { useState } from "react";

const initialNotifications = [
  { id: 1, title: "12 memberships pending approval", priority: "high" as const, read: false },
  { id: 2, title: "AP Exam scheduled for 16-05-2026", priority: "medium" as const, read: false },
  { id: 3, title: "5 projects awaiting certification", priority: "high" as const, read: false },
  { id: 4, title: "Revenue target 85% achieved", priority: "low" as const, read: false },
  { id: 5, title: "3 expired memberships need follow-up", priority: "medium" as const, read: false },
  { id: 6, title: "New AP Associate batch starting next week", priority: "low" as const, read: true },
];

const priorityStyles = {
  high: { border: "border-l-destructive", icon: AlertTriangle, iconClass: "text-destructive" },
  medium: { border: "border-l-warning", icon: Info, iconClass: "text-warning" },
  low: { border: "border-l-success", icon: Check, iconClass: "text-success" },
};

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [showAll, setShowAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayed = showAll ? notifications : notifications.filter((n) => !n.read);

  const dismiss = (id: number) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const markRead = (id: number) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-4 h-4 text-primary" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-destructive text-destructive-foreground text-[8px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <h3 className="text-[13px] font-semibold text-foreground">Notifications</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAll(!showAll)} className="text-[11px] text-primary font-medium hover:underline">
            {showAll ? "Unread only" : "Show all"}
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-[11px] text-muted-foreground font-medium hover:text-foreground">
              Mark all read
            </button>
          )}
        </div>
      </div>
      <div className="space-y-2 max-h-[340px] overflow-y-auto scrollbar-thin">
        {displayed.map((n) => {
          const style = priorityStyles[n.priority];
          const PIcon = style.icon;
          return (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`flex items-center gap-3 p-3 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-sm ${style.border} ${n.read ? "bg-muted/20 opacity-70" : "bg-muted/40"}`}
            >
              <PIcon className={`w-4 h-4 shrink-0 ${style.iconClass}`} />
              <p className={`flex-1 text-[13px] ${n.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>{n.title}</p>
              <button
                onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded hover:bg-muted"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
        {displayed.length === 0 && (
          <p className="text-center text-[13px] text-muted-foreground py-8">All caught up! 🎉</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
