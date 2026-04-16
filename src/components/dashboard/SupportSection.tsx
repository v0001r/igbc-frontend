import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { getPublicSupportContacts, type PublicSupportContact } from "@/lib/support";

export const SupportSection = () => {
  const [contacts, setContacts] = useState<PublicSupportContact[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await getPublicSupportContacts({ limit: 8 });
        if (active) {
          setContacts(data);
        }
      } catch {
        if (active) {
          setContacts([]);
        }
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
      transition={{ delay: 0.25 }}
      className="mb-10"
    >
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Support & Assistance
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {contacts.length === 0 && (
          <div className="rounded-2xl bg-card p-5 text-xs text-muted-foreground shadow-card sm:col-span-2 lg:col-span-4">
            Support contacts are currently unavailable.
          </div>
        )}
        {contacts.map((c, i) => (
          <div
            key={c.id ?? i}
            className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-card"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.designation} - {c.department}</p>
            </div>
            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" strokeWidth={1.5} /> {c.phone}
              </span>
              <span className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" strokeWidth={1.5} /> {c.email}
              </span>
            </div>
            <button className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-primary-muted px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} /> Chat Now
            </button>
          </div>
        ))}
      </div>
    </motion.section>
  );
};
