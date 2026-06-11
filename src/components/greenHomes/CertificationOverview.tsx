import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { CertificationWorkspaceResponse } from "@/lib/certificationWorkspace";
import { readFormParam } from "@/lib/certificationChecklist";
import {
  buildOverviewActivities,
  formatBuiltUpArea,
  formatDualArea,
  formatIndianCurrency,
  formatOverviewDate,
  readFormParamAliases,
  yesNoLabel,
} from "@/lib/certificationOverviewUtils";
import {
  getProjectFullDetails,
  type ProjectFullDetailsResponse,
} from "@/lib/projectRegistration";
import {
  Activity,
  Building2,
  CreditCard,
  Droplets,
  FileUp,
  Leaf,
  Loader2,
  MapPin,
  Plus,
  User,
  Zap,
} from "lucide-react";

type Props = {
  projectId: string;
  workspace: CertificationWorkspaceResponse;
};

function InfoCard({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon: React.ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-border bg-card shadow-sm ${className}`}>
      <div className="flex items-center gap-2 border-b border-ocean/15 bg-ocean/[0.06] px-4 py-3">
        <span className="text-ocean">{icon}</span>
        <h3 className="text-sm font-semibold text-ocean">{title}</h3>
      </div>
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}

function DetailGrid({ children }: { children: ReactNode }) {
  return <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</dl>;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">{value || "—"}</dd>
    </div>
  );
}

function PaymentBlock({
  title,
  paymentType,
  chequeNumber,
  bank,
  branch,
  date,
  amount,
}: {
  title: string;
  paymentType: string;
  chequeNumber: string;
  bank: string;
  branch: string;
  date: string;
  amount: string;
}) {
  return (
    <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ocean">{title}</p>
      <dl className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <DetailItem label="Payment type" value={paymentType} />
        <DetailItem label="Cheque Number" value={chequeNumber} />
        <DetailItem label="Bank" value={bank} />
        <DetailItem label="Branch" value={branch} />
        <DetailItem label="Date" value={date} />
        <DetailItem label="Amount paid" value={amount} />
      </dl>
    </div>
  );
}

function textValue(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

export function CertificationOverview({ projectId, workspace }: Props) {
  const { form, config } = workspace;
  const [details, setDetails] = useState<ProjectFullDetailsResponse | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingDetails(true);
      try {
        const data = await getProjectFullDetails(projectId);
        if (!cancelled) setDetails(data);
      } catch {
        if (!cancelled) setDetails(null);
      } finally {
        if (!cancelled) setLoadingDetails(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const stepOne = (details?.stepOne ?? {}) as Record<string, unknown>;
  const stepTwo = (details?.stepTwo ?? {}) as Record<string, unknown>;
  const stepThree = (details?.stepThree ?? {}) as Record<string, unknown>;
  const stepFour = (details?.stepFour ?? {}) as Record<string, unknown>;
  const stepFive = (details?.stepFive ?? {}) as Record<string, unknown>;
  const cert = details?.certificationApplication;
  const parentOrg = (stepThree.parentOrganization ?? {}) as Record<string, unknown>;
  const projectOwner = (stepThree.projectOwner ?? stepThree.owner ?? {}) as Record<string, unknown>;

  const projectIdDisplay =
    textValue(details?.igbcProjectId ?? details?.igbcprojectid) ||
    workspace.projectCode ||
    textValue(details?.temporaryProjectId);

  const projectTitle = textValue(stepTwo.projectName) || workspace.projectName;

  const categoryName =
    textValue(details?.categoryName) ||
    textValue(stepOne.categoryName) ||
    textValue(stepOne.category);

  const certificationType =
    cert?.certificationTypeLabel ??
    (cert?.certificationType === 1
      ? "Pre-certification"
      : cert?.certificationType === 2
        ? "Certification"
        : "Pre-Certification / Certification");

  const siteAreaSqm =
    cert?.siteAreaSqm ??
    (typeof stepTwo.siteAreaSqm === "number" ? stepTwo.siteAreaSqm : Number(readFormParam(form, "site_area") || NaN));
  const siteAreaSqft =
    cert?.siteAreaSqft ?? (typeof stepTwo.siteAreaSqft === "number" ? stepTwo.siteAreaSqft : NaN);

  const builtUpSqm =
    cert?.totalBuiltUpAreaSqm ??
    (typeof stepTwo.totalBuiltUpAreaSqm === "number"
      ? stepTwo.totalBuiltUpAreaSqm
      : Number(readFormParam(form, "total_built_up_area") || readFormParam(form, "built_up_area") || NaN));
  const builtUpSqft =
    cert?.totalBuiltUpAreaSqft ?? (typeof stepTwo.totalBuiltUpAreaSqft === "number" ? stepTwo.totalBuiltUpAreaSqft : NaN);

  const buildings =
    textValue(cert?.numberOfBuildings) ||
    textValue(stepTwo.numberOfBuildings) ||
    readFormParam(form, "no_of_buildings") ||
    readFormParam(form, "no_of_towers");

  const igbcMember = yesNoLabel(
    parentOrg.isIgbcMember ?? parentOrg.is_igbc_member ?? parentOrg.igbcMember,
  );

  const ownerName = [projectOwner.firstName, projectOwner.lastName]
    .map((part) => textValue(part))
    .filter(Boolean)
    .join(" ");

  const orgName =
    textValue(parentOrg.organizationName ?? parentOrg.name) ||
    ownerName ||
    textValue(stepFour.organizationName) ||
    readFormParam(form, "owner_org") ||
    readFormParam(form, "organization_name");

  const addressLine =
    textValue(cert?.address) || textValue(stepTwo.address ?? stepTwo.siteAddress);
  const city = textValue(cert?.city) || textValue(stepTwo.city) || readFormParam(form, "city");
  const state = textValue(cert?.state) || textValue(stepTwo.state) || readFormParam(form, "state");
  const country = readFormParam(form, "country") || "India";
  const pincode =
    textValue(cert?.pincode) || textValue(stepTwo.pincode) || readFormParam(form, "pincode");

  const savings = useMemo(
    () => ({
      water:
        readFormParamAliases(form, [
          "annual_water_savings",
          "water_savings",
          "water_consumption_saving",
          "annual_water_saving",
        ]) || "—",
      ac:
        readFormParamAliases(form, [
          "air_conditioning_savings",
          "ac_savings",
          "air_conditioning_saving",
        ]) || "—",
      lpd: readFormParamAliases(form, ["lpd_savings", "lpd_saving", "lpd_saving_kwh"]) || "—",
      renewable:
        readFormParamAliases(form, [
          "renewable_energy_savings",
          "renewable_savings",
          "renewable_energy_saving",
        ]) || "—",
    }),
    [form],
  );

  const registrationPayment = {
    paymentType: textValue(stepFive.paymentType) || "—",
    chequeNumber: textValue(stepFive.transactionReference) || "—",
    bank: textValue(stepFive.bankName) || "—",
    branch: textValue(stepFive.branch) || "—",
    date: formatOverviewDate(stepFive.paymentDate),
    amount: formatIndianCurrency(
      typeof stepFive.amount === "number"
        ? stepFive.amount
        : typeof stepFour.totalPayable === "number"
          ? stepFour.totalPayable
          : details?.finalPayableAmount,
    ),
  };

  const certificationPayment = {
    paymentType: textValue(cert?.paymentType) || "—",
    chequeNumber: textValue(cert?.transactionReference) || "—",
    bank: textValue(cert?.bankName) || "—",
    branch: textValue(cert?.branch) || "—",
    date: formatOverviewDate(cert?.paymentDate),
    amount: formatIndianCurrency(
      cert?.paymentAmount ?? cert?.finalPayableAmount ?? cert?.certificationFee,
    ),
  };

  const activities = useMemo(
    () => buildOverviewActivities(config, form),
    [config, form],
  );

  const siteAreaDisplay = formatDualArea(
    Number.isFinite(siteAreaSqm) ? siteAreaSqm : null,
    Number.isFinite(siteAreaSqft) ? siteAreaSqft : null,
  );
  const builtUpDisplay = formatBuiltUpArea(
    Number.isFinite(builtUpSqm) ? builtUpSqm : null,
    Number.isFinite(builtUpSqft) ? builtUpSqft : null,
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{workspace.projectLabel}</p>
        <h1 className="mt-1 text-xl font-semibold text-foreground">Overview</h1>
      </div>

      {loadingDetails ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading project details…
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <InfoCard title="Project details" icon={<Building2 className="h-4 w-4" />}>
          <DetailGrid>
            <DetailItem label="Project ID" value={projectIdDisplay} />
            <DetailItem label="Project title" value={projectTitle} />
            <DetailItem label="Project category" value={categoryName} />
            <DetailItem label="Rating system" value={workspace.ratingLabel} />
          </DetailGrid>
        </InfoCard>

        <InfoCard title="Certification details" icon={<CreditCard className="h-4 w-4" />}>
          <DetailGrid>
            <DetailItem label="Certification type" value={certificationType} />
            <DetailItem label="Site area" value={siteAreaDisplay} />
            <DetailItem
              label="Total built-up area (as per lease agreement / sales deed)"
              value={builtUpDisplay}
            />
            <DetailItem label="No. of buildings" value={buildings} />
          </DetailGrid>
        </InfoCard>

        <InfoCard title="Membership details" icon={<User className="h-4 w-4" />}>
          <DetailGrid>
            <DetailItem
              label="Is the parent organization an IGBC member?"
              value={igbcMember}
            />
            <DetailItem label="Organization / Individual name" value={orgName} />
          </DetailGrid>
        </InfoCard>
      </div>

      <InfoCard title="Project details" icon={<MapPin className="h-4 w-4" />}>
        <DetailGrid>
          <DetailItem label="Organization / Individual name" value={orgName} />
          <DetailItem label="Address Line 1" value={addressLine} />
          <DetailItem label="City" value={city} />
          <DetailItem label="State / UT" value={state} />
          <DetailItem label="Country" value={country} />
          <DetailItem label="Pincode" value={pincode} />
        </DetailGrid>
      </InfoCard>

      <InfoCard title="Project savings" icon={<Leaf className="h-4 w-4" />}>
        <DetailGrid>
          <DetailItem label="Annual water savings (Liters)" value={savings.water} />
          <DetailItem label="Air conditioning savings (kWh)" value={savings.ac} />
          <DetailItem label="LPD savings (kWh)" value={savings.lpd} />
          <DetailItem label="Renewable energy savings (kWh)" value={savings.renewable} />
        </DetailGrid>
      </InfoCard>

      <div className="grid gap-4 xl:grid-cols-[1.4fr,0.6fr]">
        <InfoCard title="Payment details" icon={<CreditCard className="h-4 w-4" />}>
          <div className="space-y-4">
            <PaymentBlock title="Registration Fee" {...registrationPayment} />
            {cert ? <PaymentBlock title="Certification Fee" {...certificationPayment} /> : null}
          </div>
        </InfoCard>

        <InfoCard title="Latest Activities" icon={<Activity className="h-4 w-4" />}>
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity yet.</p>
          ) : (
            <ul className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {activities.map((item) => (
                <li key={item.id} className="flex gap-2 text-sm">
                  <span className="mt-0.5 shrink-0 text-ocean">
                    {item.kind === "document" ? (
                      <FileUp className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </span>
                  <div>
                    <p className="leading-snug text-foreground">{item.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      on {formatOverviewDate(item.updatedAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </InfoCard>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Droplets className="h-3.5 w-3.5 text-ocean" />
          Complete water credits to update savings
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-ocean" />
          Progress updates automatically on the Checklist
        </span>
      </div>
    </div>
  );
}
