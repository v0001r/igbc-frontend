import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { GreenHomesProjectWorkspace } from "@/components/greenHomes/GreenHomesProjectWorkspace";
import { getProjectFullDetails, type ProjectFullDetailsResponse } from "@/lib/projectRegistration";
import { isRegistrationWorkspaceUnlocked } from "@/lib/ratingConfigRegistry";
import { useToast } from "@/hooks/use-toast";

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectFullDetailsResponse | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setProject(null);
      try {
        const details = await getProjectFullDetails(id);
        setProject(details);
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
  }, [id, toast]);

  const stepOne = (project?.stepOne ?? {}) as Record<string, unknown>;
  const stepTwo = (project?.stepTwo ?? {}) as Record<string, unknown>;
  const stepThree = (project?.stepThree ?? {}) as Record<string, unknown>;
  const stepFour = (project?.stepFour ?? {}) as Record<string, unknown>;
  const stepFive = (project?.stepFive ?? {}) as Record<string, unknown>;

  const parentOrganization = (stepThree.parentOrganization ?? {}) as Record<string, unknown>;
  const projectOwner = (stepThree.projectOwner ?? stepThree.owner ?? {}) as Record<string, unknown>;
  const projectCoordinator = (stepThree.projectCoordinator ?? stepThree.coordinator ?? {}) as Record<string, unknown>;

  const money = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value)
      ? `Rs ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "-";

  const text = (value: unknown) => {
    if (typeof value === "string" && value.trim().length > 0) return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return "-";
  };

  const rawIgbcProjectId =
    project && (project.igbcprojectid ?? project.igbcProjectId);

  const displayProjectId =
    rawIgbcProjectId !== undefined && rawIgbcProjectId !== null
      ? String(rawIgbcProjectId)
      : project?.temporaryProjectId
        ? String(project.temporaryProjectId)
        : "-";

  const hasCertificationConfig =
    stepOne.hasCertificationConfig === true || stepOne.hasCertificationConfig === "true";

  if (project && isRegistrationWorkspaceUnlocked(project) && hasCertificationConfig) {
    return <GreenHomesProjectWorkspace projectId={String(id)} />;
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Project Details</h1>
          <button
            onClick={() => navigate("/projects")}
            className="rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
          >
            Back to Projects
          </button>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Loading project details...</p>}

        {!loading && !project && (
          <p className="text-sm text-muted-foreground">No details found for this project.</p>
        )}

        {!loading && project && (
          <div className="space-y-4">
            <section className="rounded-xl border bg-card p-4">
              <h2 className="mb-3 text-base font-semibold text-foreground">Project Overview</h2>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p><span className="text-muted-foreground">IGBC Project ID:</span> {displayProjectId}</p>
                <p><span className="text-muted-foreground">Temporary ID:</span> {project.temporaryProjectId ?? "-"}</p>
                <p><span className="text-muted-foreground">Status:</span> {project.status ?? "-"}</p>
                <p><span className="text-muted-foreground">Payment Status:</span> {project.paymentStatus ?? "-"}</p>
                <p><span className="text-muted-foreground">Current Step:</span> {project.currentStep ?? "-"}</p>
                <p><span className="text-muted-foreground">Registration Fee:</span> {money(project.registrationFee)}</p>
                <p><span className="text-muted-foreground">Final Payable:</span> {money(project.finalPayableAmount)}</p>
                <p><span className="text-muted-foreground">Created At:</span> {project.createdAt ?? "-"}</p>
                <p><span className="text-muted-foreground">Updated At:</span> {project.updatedAt ?? "-"}</p>
              </div>
            </section>

            <section className="rounded-xl border bg-card p-4">
              <h3 className="mb-3 text-base font-semibold text-foreground">Project Rating</h3>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p><span className="text-muted-foreground">Category:</span> {text(stepOne.category ?? stepOne.categoryId)}</p>
                <p><span className="text-muted-foreground">Construction Type:</span> {text(stepOne.constructionType)}</p>
                <p><span className="text-muted-foreground">Rating System:</span> {text(stepOne.ratingSystem)}</p>
                <p><span className="text-muted-foreground">Sub Rating Type:</span> {text(stepOne.subRatingType)}</p>
                <p><span className="text-muted-foreground">Project Type:</span> {text(stepOne.projectType)}</p>
                <p><span className="text-muted-foreground">Base Registration Fee:</span> {money(stepOne.registrationFee ?? project.registrationFee)}</p>
              </div>
            </section>

            <section className="rounded-xl border bg-card p-4">
              <h3 className="mb-3 text-base font-semibold text-foreground">Project Details</h3>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p><span className="text-muted-foreground">Project Name:</span> {text(stepTwo.projectName)}</p>
                <p><span className="text-muted-foreground">Address:</span> {text(stepTwo.address ?? stepTwo.siteAddress)}</p>
                <p><span className="text-muted-foreground">City:</span> {text(stepTwo.city)}</p>
                <p><span className="text-muted-foreground">State:</span> {text(stepTwo.state)}</p>
                <p><span className="text-muted-foreground">Pincode:</span> {text(stepTwo.pincode)}</p>
                <p><span className="text-muted-foreground">Site Area (sqm):</span> {text(stepTwo.siteAreaSqm)}</p>
                <p><span className="text-muted-foreground">Site Area (sqft):</span> {text(stepTwo.siteAreaSqft)}</p>
                <p><span className="text-muted-foreground">Buildings:</span> {text(stepTwo.numberOfBuildings)}</p>
                <p><span className="text-muted-foreground">Built-up (sqm):</span> {text(stepTwo.totalBuiltUpAreaSqm)}</p>
                <p><span className="text-muted-foreground">Built-up (sqft):</span> {text(stepTwo.totalBuiltUpAreaSqft)}</p>
              </div>
            </section>

            <section className="rounded-xl border bg-card p-4">
              <h3 className="mb-3 text-base font-semibold text-foreground">Contact Details</h3>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p><span className="text-muted-foreground">Parent Organization:</span> {text(parentOrganization.organizationName ?? parentOrganization.name)}</p>
                <p><span className="text-muted-foreground">IGBC Member:</span> {text(parentOrganization.isIgbcMember)}</p>
                <p><span className="text-muted-foreground">Owner Name:</span> {`${text(projectOwner.firstName)} ${text(projectOwner.lastName)}`.trim()}</p>
                <p><span className="text-muted-foreground">Owner Email:</span> {text(projectOwner.email)}</p>
                <p><span className="text-muted-foreground">Coordinator Name:</span> {`${text(projectCoordinator.firstName)} ${text(projectCoordinator.lastName)}`.trim()}</p>
                <p><span className="text-muted-foreground">Coordinator Email:</span> {text(projectCoordinator.email)}</p>
              </div>
            </section>

            <section className="rounded-xl border bg-card p-4">
              <h3 className="mb-3 text-base font-semibold text-foreground">Invoice Details</h3>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p><span className="text-muted-foreground">Organization Name:</span> {text(stepFour.organizationName ?? stepFour.organization)}</p>
                <p><span className="text-muted-foreground">Address:</span> {text(stepFour.organizationAddress ?? stepFour.address)}</p>
                <p><span className="text-muted-foreground">City:</span> {text(stepFour.city)}</p>
                <p><span className="text-muted-foreground">State:</span> {text(stepFour.state)}</p>
                <p><span className="text-muted-foreground">Pincode:</span> {text(stepFour.pincode)}</p>
                <p><span className="text-muted-foreground">PAN:</span> {text(stepFour.panNumber ?? stepFour.pan)}</p>
                <p><span className="text-muted-foreground">GST Number:</span> {text(stepFour.gstNumber)}</p>
                <p><span className="text-muted-foreground">SEZ Selected:</span> {text(stepFour.sezSelected)}</p>
                <p><span className="text-muted-foreground">TDS Selected:</span> {text(stepFour.tdsSelected)}</p>
                <p><span className="text-muted-foreground">Registration Fee:</span> {money(stepFour.registrationFee ?? stepFour.baseRegistrationFee)}</p>
                <p><span className="text-muted-foreground">GST Amount:</span> {money(stepFour.gstAmount)}</p>
                <p><span className="text-muted-foreground">TDS Amount:</span> {money(stepFour.tdsAmount)}</p>
                <p><span className="text-muted-foreground">Total Payable:</span> {money(stepFour.totalPayable ?? project.finalPayableAmount)}</p>
              </div>
            </section>

            <section className="rounded-xl border bg-card p-4">
              <h3 className="mb-3 text-base font-semibold text-foreground">Payment Details</h3>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p><span className="text-muted-foreground">Payment Method:</span> {text(stepFive.paymentMethod)}</p>
                <p><span className="text-muted-foreground">Payment Type:</span> {text(stepFive.paymentType)}</p>
                <p><span className="text-muted-foreground">Transaction Reference:</span> {text(stepFive.transactionReference)}</p>
                <p><span className="text-muted-foreground">IFSC Code:</span> {text(stepFive.ifscCode)}</p>
                <p><span className="text-muted-foreground">Bank Name:</span> {text(stepFive.bankName)}</p>
                <p><span className="text-muted-foreground">Branch:</span> {text(stepFive.branch)}</p>
                <p><span className="text-muted-foreground">Payment Date:</span> {text(stepFive.paymentDate)}</p>
                <p><span className="text-muted-foreground">Remarks:</span> {text(stepFive.remarks)}</p>
              </div>
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetail;
