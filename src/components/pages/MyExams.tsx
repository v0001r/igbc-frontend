import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Award, Download, CheckCircle2, AlertCircle, Timer, FileText } from "lucide-react";

const upcomingExams = [
  { title: "IGBC AP Exam", date: "April 15, 2026", time: "10:00 AM – 12:00 PM", venue: "IGBC Center, Hyderabad", status: "confirmed", hallTicket: true },
  { title: "IGBC AP – O&M", date: "May 10, 2026", time: "2:00 PM – 4:30 PM", venue: "Online Proctored", status: "pending", hallTicket: false },
];

const pastExams = [
  { title: "IGBC AP Exam", date: "Jan 20, 2026", score: 82, result: "pass", certificate: true },
  { title: "IGBC AP – Interiors", date: "Oct 5, 2025", score: 65, result: "fail", certificate: false },
  { title: "IGBC AP Exam", date: "Jun 15, 2025", score: 78, result: "pass", certificate: true },
];

const MyExams = () => {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">My Exams</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track your exam schedule and results</p>
      </motion.div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Exams", value: "5", icon: FileText, color: "text-primary" },
          { label: "Passed", value: "3", icon: CheckCircle2, color: "text-primary" },
          { label: "Upcoming", value: "2", icon: Timer, color: "text-ocean" },
          { label: "Certifications", value: "2", icon: Award, color: "text-accent" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card"
          >
            <s.icon className={`h-5 w-5 ${s.color}`} strokeWidth={1.5} />
            <div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 rounded-xl bg-muted p-1">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t} Exams
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        {tab === "upcoming" && (
          <div className="mt-6 space-y-4">
            {upcomingExams.map((exam, i) => (
              <motion.div
                key={exam.title + exam.date}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col gap-4 rounded-2xl bg-card p-6 shadow-card sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">{exam.title}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      exam.status === "confirmed" ? "bg-primary-muted text-primary" : "bg-peach/20 text-peach-foreground"
                    }`}>
                      {exam.status === "confirmed" ? "Confirmed" : "Pending"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{exam.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{exam.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{exam.venue}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {exam.hallTicket && (
                    <button className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
                      <Download className="h-3.5 w-3.5" /> Hall Ticket
                    </button>
                  )}
                  <button className="rounded-xl border px-4 py-2.5 text-xs font-medium text-foreground hover:bg-muted">
                    Reschedule
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {tab === "past" && (
          <div className="mt-6 space-y-4">
            {pastExams.map((exam, i) => (
              <motion.div
                key={exam.title + exam.date}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col gap-4 rounded-2xl bg-card p-6 shadow-card sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    exam.result === "pass" ? "bg-primary-muted" : "bg-destructive/10"
                  }`}>
                    {exam.result === "pass"
                      ? <CheckCircle2 className="h-6 w-6 text-primary" />
                      : <AlertCircle className="h-6 w-6 text-destructive" />
                    }
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{exam.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{exam.date}</span>
                      <span>Score: <strong className={exam.result === "pass" ? "text-primary" : "text-destructive"}>{exam.score}%</strong></span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {exam.certificate && (
                    <button className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
                      <Download className="h-3.5 w-3.5" /> Certificate
                    </button>
                  )}
                  {exam.result === "fail" && (
                    <button className="rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-accent-foreground hover:opacity-90">
                      Re-register
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default MyExams;
