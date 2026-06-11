import { motion } from "framer-motion";
import { FileText, Award, Building2, CreditCard, ArrowRight } from "lucide-react";

const activities = [
  {
    icon: FileText,
    text: "AP Exam registration confirmed",
    time: "2 hours ago",
    color: "bg-ocean/10 text-ocean",
  },
  {
    icon: Award,
    text: "IGBC AP Certification renewed",
    time: "1 day ago",
    color: "bg-primary-muted text-primary",
  },
  {
    icon: Building2,
    text: "Project 'Green Heights' submitted",
    time: "3 days ago",
    color: "bg-sage/20 text-sage-foreground",
  },
  {
    icon: CreditCard,
    text: "Membership payment processed",
    time: "1 week ago",
    color: "bg-peach/20 text-peach-foreground",
  },
];

export const RecentActivity = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card flex flex-col p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Recent Activity</h3>
        <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          View all <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((item, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl p-2 transition-colors duration-300 hover:bg-white/40">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
              <item.icon className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{item.text}</p>
              <p className="text-xs text-muted-foreground">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
