import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  approveProjectRegistration,
  getAdminProjectView,
  rejectProjectRegistration,
  type ProjectFullDetailsResponse,
} from "@/lib/projectRegistration";
import { useToast } from "@/hooks/use-toast";

interface ProjectRegistrationViewProps {
  projectId: string;
  onBack: () => void;
}

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-muted-foreground text-xs">{label}</p>
    <p className="text-sm font-medium text-foreground">{value || "—"}</p>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border bg-card p-4">
    <h3 className="mb-3 text-base font-semibold text-foreground">{title}</h3>
    <div className="grid gap-3 sm:grid-cols-2">{children}</div>
  </div>
);

const ProjectRegistrationView = ({ projectId, onBack }: ProjectRegistrationViewProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectFullDetailsResponse | null>(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAdminProjectView(projectId);
        setProject(data);
      } catch (error) {
        toast({
          title: "Unable to load project details",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [projectId, toast]);

  const stepOne = (project?.stepOne ?? {}) as Record<string, unknown>;
  const stepTwo = (project?.stepTwo ?? {}) as Record<string, unknown>;
  const stepThree = (project?.stepThree ?? {}) as Record<string, unknown>;
  const stepFour = (project?.stepFour ?? {}) as Record<string, unknown>;
  const stepFive = (project?.stepFive ?? {}) as Record<string, unknown>;
  const parentOrganization = (stepThree.parentOrganization ?? {}) as Record<string, unknown>;
  const projectOwner = (stepThree.projectOwner ?? stepThree.owner ?? {}) as Record<string, unknown>;
  const projectCoordinator = (stepThree.projectCoordinator ?? stepThree.coordinator ?? {}) as Record<string, unknown>;

  const text = (value: unknown) => {
    if (typeof value === "string" && value.trim().length > 0) return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return "-";
  };

  const money = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value)
      ? `Rs ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "-";

  const rawIgbcProjectId =
    project && (project.igbcprojectid ?? project.igbcProjectId);

  const displayProjectId =
    rawIgbcProjectId !== undefined && rawIgbcProjectId !== null
      ? String(rawIgbcProjectId)
      : project?.temporaryProjectId
        ? String(project.temporaryProjectId)
        : "-";

  const handleApprove = async () => {
    if (!project?.projectId) return;
    try {
      await approveProjectRegistration(String(project.projectId));
      const refreshed = await getAdminProjectView(project.projectId);
      setProject(refreshed);
      setShowApproveConfirm(false);
      toast({
        title: "Project approved",
        description: "Project status has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Unable to approve project",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!project?.projectId) return;
    const remark = rejectRemark.trim();
    if (!remark) {
      toast({
        title: "Remark is required",
        description: "Please provide a rejection remark before submitting.",
        variant: "destructive",
      });
      return;
    }
    setRejecting(true);
    try {
      await rejectProjectRegistration(String(project.projectId), remark);
      const refreshed = await getAdminProjectView(project.projectId);
      setProject(refreshed);
      setShowRejectConfirm(false);
      setRejectRemark("");
      toast({
        title: "Project rejected",
        description: "Rejection remark submitted and project status updated.",
      });
    } catch (error) {
      toast({
        title: "Unable to reject project",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="action-btn action-btn-outline !px-2">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Project Details — {displayProjectId}</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">{project?.status ?? "Loading"} · Registration View</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {String(project?.status ?? "").toLowerCase() === "submitted" && (
            <>
              <button
                onClick={() => setShowApproveConfirm(true)}
                className="rounded-lg border border-primary bg-transparent px-3 py-2 text-xs font-semibold text-primary hover:bg-primary-muted"
              >
                Approve
              </button>
              <button
                onClick={() => setShowRejectConfirm(true)}
                className="rounded-lg border border-destructive px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      {loading && <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">Loading project details...</div>}
      {!loading && !project && <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">No details found.</div>}
      {!loading && project && (
        <>
          <Section title="Project Overview">
            <DetailField label="IGBC Project ID" value={displayProjectId} />
            <DetailField label="Status" value={text(project.status)} />
            <DetailField label="Current Step" value={text(project.currentStep)} />
            <DetailField label="Payment Status" value={text(project.paymentStatus)} />
            <DetailField label="Registration Fee" value={money(project.registrationFee)} />
            <DetailField label="Final Payable" value={money(project.finalPayableAmount)} />
          </Section>

          <Section title="Project Rating">
            <DetailField label="Category" value={text(stepOne.category ?? stepOne.categoryId)} />
            <DetailField label="Construction Type" value={text(stepOne.constructionType)} />
            <DetailField label="Rating System" value={text(stepOne.ratingSystem)} />
            <DetailField label="Sub Rating Type" value={text(stepOne.subRatingType)} />
            <DetailField label="Project Type" value={text(stepOne.projectType)} />
            <DetailField label="Base Registration Fee" value={money(stepOne.registrationFee ?? project.registrationFee)} />
          </Section>

          <Section title="Project Details">
            <DetailField label="Project Name" value={text(stepTwo.projectName)} />
            <DetailField label="Address" value={text(stepTwo.address ?? stepTwo.siteAddress)} />
            <DetailField label="City" value={text(stepTwo.city)} />
            <DetailField label="State" value={text(stepTwo.state)} />
            <DetailField label="Pincode" value={text(stepTwo.pincode)} />
            <DetailField label="Site Area (sqm)" value={text(stepTwo.siteAreaSqm)} />
            <DetailField label="Site Area (sqft)" value={text(stepTwo.siteAreaSqft)} />
            <DetailField label="Buildings" value={text(stepTwo.numberOfBuildings)} />
            <DetailField label="Built-up (sqm)" value={text(stepTwo.totalBuiltUpAreaSqm)} />
            <DetailField label="Built-up (sqft)" value={text(stepTwo.totalBuiltUpAreaSqft)} />
          </Section>

          <Section title="Contact Details">
            <DetailField label="Parent Organization" value={text(parentOrganization.organizationName ?? parentOrganization.name)} />
            <DetailField label="IGBC Member" value={text(parentOrganization.isIgbcMember)} />
            <DetailField label="Owner Name" value={`${text(projectOwner.firstName)} ${text(projectOwner.lastName)}`.trim()} />
            <DetailField label="Owner Email" value={text(projectOwner.email)} />
            <DetailField label="Coordinator Name" value={`${text(projectCoordinator.firstName)} ${text(projectCoordinator.lastName)}`.trim()} />
            <DetailField label="Coordinator Email" value={text(projectCoordinator.email)} />
          </Section>

          <Section title="Invoice Details">
            <DetailField label="Organization Name" value={text(stepFour.organizationName ?? stepFour.organization)} />
            <DetailField label="Address" value={text(stepFour.organizationAddress ?? stepFour.address)} />
            <DetailField label="City" value={text(stepFour.city)} />
            <DetailField label="State" value={text(stepFour.state)} />
            <DetailField label="Pincode" value={text(stepFour.pincode)} />
            <DetailField label="PAN" value={text(stepFour.panNumber ?? stepFour.pan)} />
            <DetailField label="GST Number" value={text(stepFour.gstNumber)} />
            <DetailField label="SEZ Selected" value={text(stepFour.sezSelected)} />
            <DetailField label="TDS Selected" value={text(stepFour.tdsSelected)} />
            <DetailField label="GST Amount" value={money(stepFour.gstAmount)} />
            <DetailField label="TDS Amount" value={money(stepFour.tdsAmount)} />
            <DetailField label="Total Payable" value={money(stepFour.totalPayable ?? project.finalPayableAmount)} />
          </Section>

          <Section title="Payment Details">
            <DetailField label="Payment Method" value={text(stepFive.paymentMethod)} />
            <DetailField label="Payment Type" value={text(stepFive.paymentType)} />
            <DetailField label="Transaction Reference" value={text(stepFive.transactionReference)} />
            <DetailField label="IFSC Code" value={text(stepFive.ifscCode)} />
            <DetailField label="Bank Name" value={text(stepFive.bankName)} />
            <DetailField label="Branch" value={text(stepFive.branch)} />
            <DetailField label="Payment Date" value={text(stepFive.paymentDate)} />
            <DetailField label="Remarks" value={text(stepFive.remarks)} />
          </Section>
        </>
      )}

      {showApproveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border bg-card p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-foreground">Approve project</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to approve this project?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowApproveConfirm(false)}
                className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                No
              </button>
              <button
                onClick={handleApprove}
                className="rounded-lg border border-primary bg-transparent px-3 py-2 text-xs font-semibold text-primary hover:bg-primary-muted"
              >
                Yes, Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border bg-card p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-foreground">Reject project</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Please provide a rejection remark before continuing.
            </p>
            <textarea
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
              placeholder="Enter rejection remark..."
              rows={4}
              className="mt-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  if (rejecting) return;
                  setShowRejectConfirm(false);
                  setRejectRemark("");
                }}
                className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejecting}
                className="rounded-lg border border-destructive bg-transparent px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {rejecting ? "Submitting..." : "Submit Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectRegistrationView;
