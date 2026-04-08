import { motion } from "framer-motion";
import { CalendarDays, MapPin, Plus } from "lucide-react";

const events = [
  { date: "Mar 25, 2026", title: "IGBC Green Building Congress", location: "Hyderabad", online: false },
  { date: "Apr 10, 2026", title: "AP Exam Workshop", location: "Online", online: true },
  { date: "May 5, 2026", title: "Sustainable Design Summit", location: "Mumbai", online: false },
  { date: "Jun 15, 2026", title: "Net Zero Buildings Webinar", location: "Online", online: true },
];

export const UpcomingEvents = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="mb-4 text-lg font-semibold text-foreground">Upcoming Events</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {events.map((event, i) => (
          <div
            key={i}
            className="min-w-[260px] shrink-0 rounded-2xl bg-card p-5 shadow-card"
          >
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-primary">
              <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} />
              {event.date}
            </div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">{event.title}</h3>
            <div className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" strokeWidth={1.5} />
              {event.location}
              {event.online && (
                <span className="ml-1 rounded-full bg-ocean/10 px-2 py-0.5 text-[10px] font-medium text-ocean">
                  Online
                </span>
              )}
            </div>
            <button className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
              <Plus className="h-3 w-3" strokeWidth={1.5} /> Add to Calendar
            </button>
          </div>
        ))}
      </div>
    </motion.section>
  );
};
