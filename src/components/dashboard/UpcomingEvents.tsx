import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Plus } from "lucide-react";
import { getClientEventListings, type ClientEventItem } from "@/lib/events";

export const UpcomingEvents = () => {
  const [events, setEvents] = useState<ClientEventItem[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const data = await getClientEventListings();
      if (active) {
        setEvents(data);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="glass-section-title">Upcoming Events</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {events.length === 0 && (
          <div className="glass-card min-w-[260px] shrink-0 p-5 text-sm text-muted-foreground">
            No upcoming events available.
          </div>
        )}
        {events.map((event, i) => (
          <div
            key={event.id ?? i}
            className="glass-card glass-card-interactive min-w-[260px] shrink-0 p-5"
          >
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-primary">
              <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} />
              {new Date(event.startDateTime).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">{event.title}</h3>
            <div className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" strokeWidth={1.5} />
              {event.location}
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
