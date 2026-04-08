import { motion } from "framer-motion";
import { Phone, Mail, MessageCircle } from "lucide-react";

const contacts = [
  {
    name: "P V S Murthy",
    purpose: "Membership Registration & Renewal",
    phone: "+91-40-44185132/3",
    email: "p.v.murthy@cii.in",
  },
  {
    name: "P V S Murthy",
    purpose: "AP Exam Registration & Reschedule",
    phone: "+91-40-44185132/3",
    email: "p.v.murthy@cii.in",
  },
  {
    name: "Sundeep V",
    purpose: "Project Registration Process",
    phone: "+91 90009 99689",
    email: "sundeep.vullikanti@cii.in",
  },
  {
    name: "Anand Sundararajan",
    purpose: "Project Registration Support",
    phone: "+91 8142239142",
    email: "anand.sundararajan@cii.in",
  },
];

export const SupportSection = () => {
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
      <div className="grid gap-3 sm:grid-cols-2">
        {contacts.map((c, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-card"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.purpose}</p>
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
