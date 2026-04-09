import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { AlertCircle, Calendar, Clock, IndianRupee, RefreshCw, X } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import {
  getMyApExamListings,
  rescheduleApExamListing,
  type ApExamListing,
} from "@/lib/apExam";
import { useToast } from "@/hooks/use-toast";

const MyExams = () => {
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const [exams, setExams] = useState<ApExamListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<ApExamListing | null>(null);
  const [mode, setMode] = useState<"prepone" | "postpone">("postpone");
  const [newDate, setNewDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const email = currentUser?.email;
      if (!email) {
        setExams([]);
        setLoading(false);
        return;
      }
      try {
        const result = await getMyApExamListings(email);
        setExams(result);
      } catch (error) {
        toast({
          title: "Unable to load exams",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [currentUser?.email, toast]);

  const saturdayDates = useMemo(() => {
    if (!selectedExam) {
      return [];
    }
    const examDate = new Date(selectedExam.examDate);
    const dates: string[] = [];
    for (let offset = -84; offset <= 84; offset += 1) {
      if (offset === 0) {
        continue;
      }
      const candidate = new Date(examDate);
      candidate.setDate(examDate.getDate() + offset);
      if (candidate.getDay() !== 6) {
        continue;
      }
      if (mode === "prepone" && candidate >= examDate) {
        continue;
      }
      if (mode === "postpone" && candidate <= examDate) {
        continue;
      }
      dates.push(candidate.toISOString().split("T")[0]);
    }
    return dates.sort((a, b) => a.localeCompare(b));
  }, [mode, selectedExam]);

  const openReschedule = (exam: ApExamListing) => {
    setSelectedExam(exam);
    setMode("postpone");
    setNewDate("");
  };

  const closeReschedule = () => {
    setSelectedExam(null);
    setMode("postpone");
    setNewDate("");
    setSubmitting(false);
  };

  const isPastExam = (date: string) => {
    const examDate = new Date(date);
    const today = new Date();
    examDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return examDate < today;
  };

  const handleReschedule = async () => {
    if (!selectedExam) {
      return;
    }
    if (!newDate) {
      toast({
        title: "Date required",
        description: "Please select a new exam date",
        variant: "destructive",
      });
      return;
    }

    const fee = mode === "prepone" ? 590 : 0;
    setSubmitting(true);
    try {
      const updated = await rescheduleApExamListing(selectedExam.listingId, {
        mode,
        newExamDate: newDate,
        fee,
      });
      setExams((prev) =>
        prev.map((item) => (item.listingId === selectedExam.listingId ? updated : item)),
      );
      toast({
        title: "Exam rescheduled",
        description:
          mode === "prepone"
            ? "Prepone request submitted. Rs 590 is applicable."
            : "Postpone request submitted.",
      });
      closeReschedule();
    } catch (error) {
      setSubmitting(false);
      toast({
        title: "Unable to reschedule",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">My Exams</h1>
        <p className="mt-1 text-sm text-muted-foreground">Registered AP exams for your account</p>
      </motion.div>

      <div className="mt-6 space-y-4">
        {loading && (
          <div className="rounded-2xl bg-card p-6 text-sm text-muted-foreground shadow-card">
            Loading registered exams...
          </div>
        )}

        {!loading && exams.length === 0 && (
          <div className="rounded-2xl bg-card p-6 text-sm text-muted-foreground shadow-card">
            No AP exam registrations found for your account.
          </div>
        )}

        {!loading &&
          exams.map((exam, i) => {
            const isPast = isPastExam(exam.examDate);
            const examDateLabel = new Date(exam.examDate).toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            });

            return (
              <motion.div
                key={exam.listingId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col gap-4 rounded-2xl bg-card p-6 shadow-card sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">IGBC AP Exam</h3>
                    <span className="rounded-full bg-primary-muted px-2.5 py-0.5 text-xs font-medium text-primary">
                      {exam.status === "rescheduled" ? "Rescheduled" : "Registered"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {examDateLabel}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {exam.examTime}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Exam ID: <span className="font-mono">{exam.examId}</span>
                  </p>
                </div>

                <button
                  onClick={() => openReschedule(exam)}
                  disabled={isPast}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Reschedule Exam
                </button>
              </motion.div>
            );
          })}
      </div>

      {selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg rounded-2xl bg-card p-5 shadow-card-hover"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Reschedule Exam</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Select prepone or postpone and choose a Saturday date.
                </p>
              </div>
              <button onClick={closeReschedule} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-border p-3">
                <p className="text-xs text-muted-foreground">Current Exam Date</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {new Date(selectedExam.examDate).toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-foreground">Reschedule Type</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMode("prepone");
                      setNewDate("");
                    }}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      mode === "prepone"
                        ? "border-primary bg-primary-muted text-primary"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    Prepone
                  </button>
                  <button
                    onClick={() => {
                      setMode("postpone");
                      setNewDate("");
                    }}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      mode === "postpone"
                        ? "border-primary bg-primary-muted text-primary"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    Postpone
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">
                  Select New Exam Date (Saturday only)
                </label>
                <select
                  value={newDate}
                  onChange={(event) => setNewDate(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Choose a date</option>
                  {saturdayDates.map((date) => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString("en-IN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </option>
                  ))}
                </select>
                {saturdayDates.length === 0 && (
                  <p className="mt-2 text-xs text-destructive">
                    No Saturday dates available for this reschedule type.
                  </p>
                )}
              </div>

              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                <p className="flex items-center gap-1">
                  <IndianRupee className="h-3.5 w-3.5" />
                  Charges: {mode === "prepone" ? "Rs 590" : "No charges"}
                </p>
                <p className="mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Prepone dates are before current date; postpone dates are after current date.
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={closeReschedule}
                  className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void handleReschedule()}
                  disabled={submitting || !newDate}
                  className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Updating..." : "Confirm Reschedule"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyExams;
