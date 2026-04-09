import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FileText,
  ClipboardList,
  Building2,
  Leaf,
  BookOpen,
  Search,
  UserPlus,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getMyApExamListings } from "@/lib/apExam";

const baseActions = [
  { title: "My Exams", desc: "View exam schedule & results", icon: ClipboardList, color: "text-ocean", path: "/exams" },
  { title: "Register A Project", desc: "Submit green building project", icon: Building2, color: "text-primary", path: "/register-project" },
  { title: "Register for Nest+", desc: "Residential rating program", icon: Leaf, color: "text-sage", path: "/nest-plus" },
  { title: "Membership Directory", desc: "Browse IGBC members", icon: BookOpen, color: "text-ocean", path: "/directory" },
  { title: "Become a Member", desc: "Join the IGBC community", icon: UserPlus, color: "text-accent", path: "/become-a-member" },
  { title: "My Projects", desc: "Track registered projects", icon: Search, color: "text-primary", path: "/projects" },
];

export const QuickActions = () => {
  const [hasApExamRegistration, setHasApExamRegistration] = useState(false);

  useEffect(() => {
    let isActive = true;

    const checkApExamRegistration = async () => {
      const currentUser = getCurrentUser();
      const email = currentUser?.email;

      if (!email) {
        if (isActive) {
          setHasApExamRegistration(false);
        }
        return;
      }

      try {
        const exams = await getMyApExamListings(email);
        if (isActive) {
          setHasApExamRegistration(exams.length > 0);
        }
      } catch {
        if (isActive) {
          setHasApExamRegistration(false);
        }
      }
    };

    void checkApExamRegistration();

    return () => {
      isActive = false;
    };
  }, []);

  const actions = useMemo(() => {
    if (hasApExamRegistration) {
      return baseActions;
    }

    return [
      {
        title: "Register for AP Exam",
        desc: "Register for new certification",
        icon: FileText,
        color: "text-primary",
        path: "/ap-exam",
      },
      ...baseActions,
    ];
  }, [hasApExamRegistration]);

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {actions.map((action, i) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2 }}
          >
            <Link
              to={action.path}
              className="group flex h-full flex-col items-start rounded-2xl bg-card p-5 text-left shadow-card transition-shadow hover:shadow-card-hover"
            >
              <action.icon
                className={`mb-3 h-6 w-6 ${action.color} transition-transform group-hover:scale-110`}
                strokeWidth={1.5}
              />
              <h3 className="text-sm font-semibold text-foreground">{action.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{action.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
