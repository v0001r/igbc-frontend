import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Calendar, Clock, Timer, FileText } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import {
  getApExamRescheduleOptions,
  getUserApExamList,
  rescheduleApExam,
  type UserExamListResponse,
} from "@/lib/apExam";
import { useToast } from "@/hooks/use-toast";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const MyExams = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exams, setExams] = useState<UserExamListResponse["exams"]>([]);
  const [rescheduleExamId, setRescheduleExamId] = useState<string | null>(null);
  const [rescheduleType, setRescheduleType] = useState<"prepone" | "postpone">("prepone");
  const [newExamDate, setNewExamDate] = useState("");
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);
  const [rescheduleOptionsLoading, setRescheduleOptionsLoading] = useState(false);
  const [rescheduleOptions, setRescheduleOptions] = useState<string[]>([]);
  const [rescheduleFee, setRescheduleFee] = useState(590);
  const { toast } = useToast();

  const loadExams = async () => {
    const user = getCurrentUser();
    const email = user?.email?.trim();
    if (!email) {
      setError("Unable to load exams. Please login again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getUserApExamList(email);
      setExams(response.exams);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadExams();
  }, []);

  const totalExams = exams.length;
  const reschedulableCount = exams.filter((exam) => exam.actions.reschedule).length;

  const openReschedulePopup = (registrationId: string) => {
    setRescheduleExamId(registrationId);
    setRescheduleType("prepone");
    setNewExamDate("");
    setRescheduleOptions([]);
    setRescheduleFee(590);
  };

  const closeReschedulePopup = () => {
    setRescheduleExamId(null);
    setNewExamDate("");
    setRescheduleOptions([]);
    setRescheduleSubmitting(false);
    setRescheduleFee(590);
  };

  useEffect(() => {
    const loadRescheduleOptions = async () => {
      if (!rescheduleExamId) return;
      setRescheduleOptionsLoading(true);
      setNewExamDate("");
      try {
        const response = await getApExamRescheduleOptions(rescheduleExamId, rescheduleType);
        setRescheduleOptions(response.selectableDates);
        setRescheduleFee(response.feeAmount);
      } catch (optionsError) {
        setRescheduleOptions([]);
        toast({
          title: "Unable to load date options",
          description:
            optionsError instanceof Error ? optionsError.message : "Unable to fetch Saturday dates",
          variant: "destructive",
        });
      } finally {
        setRescheduleOptionsLoading(false);
      }
    };
    void loadRescheduleOptions();
  }, [rescheduleExamId, rescheduleType, toast]);

  const handleConfirmReschedule = async () => {
    if (!rescheduleExamId) return;
    if (!newExamDate) {
      toast({
        title: "Select a new exam date",
        description: "Please choose a valid date to continue.",
        variant: "destructive",
      });
      return;
    }
    setRescheduleSubmitting(true);
    try {
      await rescheduleApExam(rescheduleExamId, {
        type: rescheduleType,
        examDate: newExamDate,
        transactionId: rescheduleFee > 0 ? `txn_reschedule_${Date.now()}` : undefined,
      });
      toast({
        title: "Exam rescheduled",
        description:
          rescheduleFee > 0
            ? "Reschedule fee of INR 590 captured successfully."
            : "Postpone completed with zero reschedule fee.",
      });
      closeReschedulePopup();
      await loadExams();
    } catch (rescheduleError) {
      setRescheduleSubmitting(false);
      toast({
        title: "Reschedule failed",
        description:
          rescheduleError instanceof Error ? rescheduleError.message : "Unable to reschedule exam",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">My Exams</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track your exam schedule and results</p>
      </motion.div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: "Total Exams", value: String(totalExams), icon: FileText, color: "text-primary" },
          { label: "Registered", value: String(totalExams), icon: Calendar, color: "text-primary" },
          { label: "Reschedulable", value: String(reschedulableCount), icon: Timer, color: "text-ocean" },
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

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        {loading && <p className="mt-6 text-sm text-muted-foreground">Loading your exams...</p>}
        {!loading && error && (
          <p className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="mt-6 space-y-4">
          {!loading && !error && exams.length === 0 && (
            <p className="text-sm text-muted-foreground">No registered AP exams found.</p>
          )}
          {exams.map((exam, i) => (
              <motion.div
                key={exam.registrationId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col gap-4 rounded-2xl bg-card p-6 shadow-card sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">IGBC AP Exam</h3>
                    <span className="rounded-full bg-primary-muted px-2.5 py-0.5 text-xs font-medium text-primary">
                      Confirmed
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(exam.examDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {exam.examTime}
                    </span>
                    <span className="flex items-center gap-1">Exam ID: {exam.examId ?? "—"}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={!exam.actions.reschedule}
                    onClick={() => openReschedulePopup(exam.registrationId)}
                    className="rounded-xl border px-4 py-2.5 text-xs font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {exam.actions.reschedule ? "Reschedule" : "Reschedule Closed"}
                  </button>
                </div>
              </motion.div>
          ))}
        </div>
      </motion.div>

      {rescheduleExamId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-card">
            <h3 className="text-lg font-semibold text-foreground">Reschedule Exam</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose prepone or postpone. Prepone fee is INR 590 and postpone fee is INR 0. Each exam can be rescheduled only once.
            </p>
            <div className="mt-5 space-y-4">
              <div>
                <p className="mb-2 text-xs font-medium text-foreground">Reschedule Option</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setRescheduleType("prepone")} className={`rounded-xl border px-3 py-2 text-xs font-medium ${rescheduleType === "prepone" ? "border-primary bg-primary-muted text-primary" : "border-border text-foreground"}`}>
                    Prepone
                  </button>
                  <button onClick={() => setRescheduleType("postpone")} className={`rounded-xl border px-3 py-2 text-xs font-medium ${rescheduleType === "postpone" ? "border-primary bg-primary-muted text-primary" : "border-border text-foreground"}`}>
                    Postpone
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="reschedule-date" className="mb-2 block text-xs font-medium text-foreground">
                  Select Saturday Date
                </label>
                <select
                  id="reschedule-date"
                  value={newExamDate}
                  onChange={(event) => setNewExamDate(event.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground"
                  disabled={rescheduleOptionsLoading}
                >
                  <option value="">
                    {rescheduleOptionsLoading
                      ? "Loading dates..."
                      : rescheduleOptions.length > 0
                        ? "Select a date"
                        : "No valid Saturday dates available"}
                  </option>
                  {rescheduleOptions.map((date) => (
                    <option key={date} value={date}>
                      {formatDate(date)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                Reschedule Fee: <span className="font-semibold text-foreground">INR {rescheduleFee}</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={closeReschedulePopup} disabled={rescheduleSubmitting} className="rounded-xl border px-4 py-2 text-xs font-medium text-foreground disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={() => void handleConfirmReschedule()}
                disabled={rescheduleSubmitting || rescheduleOptionsLoading || rescheduleOptions.length === 0}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
              >
                {rescheduleSubmitting
                  ? "Processing..."
                  : rescheduleFee > 0
                    ? `Pay INR ${rescheduleFee} & Reschedule`
                    : "Reschedule (No Fee)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyExams;
