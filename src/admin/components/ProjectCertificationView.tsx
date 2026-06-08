import { useEffect, useState } from "react";
import { ArrowLeft, Building2, CreditCard, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  approveAdminCertificationApplication,
  getAdminCertificationApplicationView,
  rejectAdminCertificationApplication,
  type AdminCertificationApplicationViewResponse,
} from "../lib/adminApi";

interface ProjectCertificationViewProps {
  applicationId: string;
  onBack: () => void;
  onReviewComplete?: () => void;
}

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="detail-label">{label}</p>
    <p className="detail-value">{value || "—"}</p>
  </div>
);

const Section = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <div className="kpi-card !p-0 overflow-hidden">
    <div
      className="flex items-center gap-2 px-5 py-3 border-b"
      style={{ borderColor: "hsl(var(--border))" }}
    >
      <Icon className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
      <h3 className="section-header !mb-0 !pb-0 !border-0">{title}</h3>
    </div>
    <div className="detail-grid px-5 py-4">{children}</div>
  </div>
);

const ProjectCertificationView = ({
  applicationId,
  onBack,
  onReviewComplete,
}: ProjectCertificationViewProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminCertificationApplicationViewResponse | null>(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadView = async () => {
    setLoading(true);
    try {
      const response = await getAdminCertificationApplicationView(applicationId);
      setData(response);
    } catch (error) {
      setData(null);
      toast({
        title: "Unable to load certification details",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  const text = (value: unknown) => {
    if (typeof value === "string" && value.trim().length > 0) return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return "—";
  };

  const money = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value)
      ? `₹${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "—";

  const cert = (data?.certificationApplication ?? {}) as Record<string, unknown>;
  const project = (data?.project ?? {}) as Record<string, unknown>;
  const details = (data?.projectDetails ?? {}) as Record<string, unknown>;
  const owner = data?.owner;
  const regPayment = data?.registrationPayment;
  const regInvoice = data?.registrationInvoice;

  const displayProjectId = text(
    data?.igbcProjectId ?? data?.temporaryProjectId ?? data?.projectId,
  );

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await approveAdminCertificationApplication(applicationId);
      setShowApproveConfirm(false);
      toast({
        title: "Certification payment approved",
        description:
          "Certification payment status is now paid. The application will appear under Approved.",
      });
      onReviewComplete?.();
      await loadView();
    } catch (error) {
      toast({
        title: "Unable to approve certification",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    const remark = rejectRemark.trim();
    if (!remark) {
      toast({
        title: "Remark is required",
        description: "Please provide a rejection remark before submitting.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      await rejectAdminCertificationApplication(applicationId, remark);
      setShowRejectConfirm(false);
      setRejectRemark("");
      toast({
        title: "Certification payment rejected",
        description:
          "Certification payment status is now rejected. The application will appear under Rejected.",
      });
      onReviewComplete?.();
      await loadView();
    } catch (error) {
      toast({
        title: "Unable to reject certification",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="action-btn action-btn-outline !px-2">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-foreground">
              Certification — {displayProjectId}
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {text(cert.status)} · Payment: {text(cert.paymentStatus)} · Certification View
            </p>
          </div>
        </div>
        {data?.canApproveOrReject && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowApproveConfirm(true)}
              disabled={submitting}
              className="rounded-lg border border-primary bg-transparent px-3 py-2 text-xs font-semibold text-primary hover:bg-primary-muted disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() => setShowRejectConfirm(true)}
              disabled={submitting}
              className="rounded-lg border border-destructive px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="kpi-card text-sm text-muted-foreground">Loading certification details...</div>
      )}
      {!loading && !data && (
        <div className="kpi-card text-sm text-muted-foreground">No details found.</div>
      )}
      {!loading && data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="kpi-card">
              <h3 className="section-header">Project Details</h3>
              <div className="space-y-2.5">
                <DetailField label="Project ID" value={displayProjectId} />
                <DetailField label="Project Title" value={text(details.projectName)} />
                <DetailField label="Rating System" value={text(project.ratingSystem)} />
                <DetailField label="Registration Status" value={text(project.status)} />
              </div>
            </div>
            <div className="kpi-card">
              <h3 className="section-header">Certification Details</h3>
              <div className="space-y-2.5">
                <DetailField
                  label="Certification Type"
                  value={text(cert.certificationTypeLabel)}
                />
                <DetailField
                  label="Site Area"
                  value={`${text(details.siteAreaSqm)} sq.m / ${text(details.siteAreaSqft)} sq.ft`}
                />
                <DetailField
                  label="Total Built-up Area"
                  value={`${text(details.totalBuiltUpAreaSqm)} sq.m / ${text(details.totalBuiltUpAreaSqft)} sq.ft`}
                />
                <DetailField label="No. of Buildings" value={text(details.numberOfBuildings)} />
                <DetailField label="Expedite Review" value={text(cert.expediteReview)} />
              </div>
            </div>
            <div className="kpi-card">
              <h3 className="section-header">Owner</h3>
              <div className="space-y-2.5">
                <DetailField label="Name" value={text(owner?.name)} />
                <DetailField label="Email" value={text(owner?.email)} />
                <DetailField label="Mobile" value={text(owner?.mobile)} />
              </div>
            </div>
          </div>

          <Section title="Organization (Certification Invoice)" icon={Building2}>
            <DetailField label="Organization Name" value={text(cert.organizationName)} />
            <DetailField label="Address" value={text(cert.organizationAddress)} />
            <DetailField label="City" value={text(cert.organizationCity)} />
            <DetailField label="State" value={text(cert.organizationState)} />
            <DetailField label="Pincode" value={text(cert.organizationPinCode)} />
            <DetailField label="PAN" value={text(cert.panNumber)} />
            <DetailField label="GST Number" value={text(cert.gstNumber)} />
          </Section>

          <Section title="Project Site" icon={Building2}>
            <DetailField label="Address" value={text(details.address)} />
            <DetailField label="City" value={text(details.city)} />
            <DetailField label="State" value={text(details.state)} />
            <DetailField label="Pincode" value={text(details.pincode)} />
            <DetailField
              label="Construction Start"
              value={text(details.constructionStartDate)}
            />
            <DetailField
              label="Target Certification Date"
              value={text(details.targetCertificationDate)}
            />
          </Section>

          <div className="kpi-card !p-0 overflow-hidden">
            <div
              className="flex items-center gap-2 px-5 py-3 border-b"
              style={{ borderColor: "hsl(var(--border))" }}
            >
              <CreditCard className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
              <h3 className="section-header !mb-0 !pb-0 !border-0">Payment Details</h3>
            </div>
            <div className="px-5 py-4 space-y-5">
              <div>
                <p className="text-xs font-semibold text-foreground mb-3">
                  Registration Fee (reference)
                </p>
                {regPayment ? (
                  <div className="detail-grid">
                    <DetailField label="Payment Method" value={text(regPayment.paymentMethod)} />
                    <DetailField label="Payment Type" value={text(regPayment.paymentType)} />
                    <DetailField
                      label="Transaction / Cheque"
                      value={text(regPayment.transactionReference)}
                    />
                    <DetailField label="Bank" value={text(regPayment.bankName)} />
                    <DetailField label="Branch" value={text(regPayment.branch)} />
                    <DetailField label="Amount" value={money(regPayment.amount)} />
                    <DetailField label="Date" value={text(regPayment.paymentDate)} />
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No registration payment on file.</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground mb-3">Certification Fee</p>
                <div className="detail-grid">
                  <DetailField label="Certification Fee" value={money(cert.certificationFee)} />
                  <DetailField label="Final Payable" value={money(cert.finalPayableAmount)} />
                  <DetailField label="GST Amount" value={money(cert.gstAmount)} />
                  <DetailField label="TDS Amount" value={money(cert.tdsAmount)} />
                  <DetailField label="Payment Method" value={text(cert.paymentMethod)} />
                  <DetailField label="Payment Type" value={text(cert.paymentType)} />
                  <DetailField
                    label="Transaction / Cheque"
                    value={text(cert.transactionReference)}
                  />
                  <DetailField label="Bank" value={text(cert.bankName)} />
                  <DetailField label="Branch" value={text(cert.branch)} />
                  <DetailField label="Amount Paid" value={money(cert.paymentAmount)} />
                  <DetailField label="Payment Date" value={text(cert.paymentDate)} />
                  <DetailField label="Payment Status" value={text(cert.paymentStatus)} />
                  {cert.rejectRemark ? (
                    <DetailField label="Reject Remark" value={text(cert.rejectRemark)} />
                  ) : null}
                </div>
              </div>
              {regInvoice && (
                <div>
                  <p className="text-xs font-semibold text-foreground mb-3">
                    Registration Invoice (reference)
                  </p>
                  <div className="detail-grid">
                    <DetailField
                      label="Organization"
                      value={text(regInvoice.organizationName)}
                    />
                    <DetailField
                      label="Total Payable"
                      value={money(regInvoice.totalPayable)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* <Section title="Registration vs certification" icon={User}>
            <DetailField
              label="Project registration payment"
              value={text(project.paymentStatus)}
            />
            <DetailField
              label="Certification payment (this review)"
              value={text(cert.paymentStatus)}
            />
            <p className="col-span-full text-[11px] text-muted-foreground">
              Approving here updates only certification_applications.paymentStatus (to paid).
              Project Registration approval is separate and does not auto-approve certification
              payment.
            </p>
          </Section> */}
        </>
      )}

      {showApproveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border bg-card p-5 shadow-lg">
            <h3 className="text-sm font-semibold">Approve certification payment?</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              Action can't be undo Are you sure to perform this aciton !
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowApproveConfirm(false)}
                className="rounded-lg border px-3 py-2 text-xs"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleApprove()}
                className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                disabled={submitting}
              >
                {submitting ? "Approving..." : "Confirm Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border bg-card p-5 shadow-lg">
            <h3 className="text-sm font-semibold">Reject certification payment?</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              Provide a remark. Payment status will be set to rejected.
            </p>
            <textarea
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
              className="mt-3 h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="Rejection remark (required)"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRejectConfirm(false)}
                className="rounded-lg border px-3 py-2 text-xs"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleReject()}
                className="rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground"
                disabled={submitting}
              >
                {submitting ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCertificationView;
