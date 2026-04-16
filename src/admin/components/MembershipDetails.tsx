import { X, Download } from "lucide-react";
import { jsPDF } from "jspdf";

interface MembershipDetailsProps {
  member: Record<string, unknown> | null;
  loading?: boolean;
  onClose: () => void;
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-primary mb-3">{title}</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{children}</div>
  </div>
);

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium text-foreground">{value || "-"}</p>
  </div>
);

const toSentenceCase = (input: string): string => {
  const withSpaces = input
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .trim()
    .toLowerCase();
  if (!withSpaces) return "";
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};

const toDisplay = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
};

const parseAmount = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.-]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const asCurrency = (value: number): string =>
  new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

const asDate = (value: unknown): string => {
  if (!value) return new Date().toLocaleDateString("en-IN");
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? new Date().toLocaleDateString("en-IN") : date.toLocaleDateString("en-IN");
};

const renderObjectSection = (title: string, value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const hiddenMembershipKeys = new Set([
    "membership_type_id",
    "membership_category_id",
    "membership_plan_id",
  ]);
  const entries = Object.entries(value as Record<string, unknown>).filter(([key]) => {
    if (title === "Membership Details") {
      return !hiddenMembershipKeys.has(key);
    }
    if (title === "Payment Details") {
      return key !== "details";
    }
    return true;
  });
  if (entries.length === 0) {
    return null;
  }
  return (
    <Section title={title}>
      {entries.map(([k, v]) => (
        <Field key={k} label={toSentenceCase(k)} value={toDisplay(v)} />
      ))}
    </Section>
  );
};

const MembershipDetails = ({ member, loading = false, onClose }: MembershipDetailsProps) => {
  const headerName =
    toDisplay(member?.contact && typeof member.contact === "object" ? (member.contact as Record<string, unknown>).firstName : undefined) !== "-" ||
    toDisplay(member?.contact && typeof member.contact === "object" ? (member.contact as Record<string, unknown>).lastName : undefined) !== "-"
      ? `${toDisplay(member?.contact && typeof member.contact === "object" ? (member.contact as Record<string, unknown>).firstName : undefined)} ${toDisplay(member?.contact && typeof member.contact === "object" ? (member.contact as Record<string, unknown>).lastName : undefined)}`.trim()
      : toDisplay(member?.membershipDetails && typeof member.membershipDetails === "object" ? (member.membershipDetails as Record<string, unknown>).membership_type : undefined) !== "-"
        ? toDisplay((member?.membershipDetails as Record<string, unknown>)?.membership_type)
        : "Membership";
  const membershipId = toDisplay(member?.membershipId);
  const applicantName = headerName === "Membership" ? "IGBC Member" : headerName;
  const membershipDetails =
    member?.membershipDetails && typeof member.membershipDetails === "object"
      ? (member.membershipDetails as Record<string, unknown>)
      : null;
  const amounts = member?.amounts && typeof member.amounts === "object" ? (member.amounts as Record<string, unknown>) : null;
  const invoice = member?.invoice && typeof member.invoice === "object" ? (member.invoice as Record<string, unknown>) : null;

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadInvoice = async () => {
    try {
      const fee = parseAmount(amounts?.membershipFee ?? amounts?.membership_fee ?? amounts?.fee ?? amounts?.amount);
      const gst = parseAmount(amounts?.gst ?? amounts?.gstAmount ?? amounts?.gst_amount);
      const total = parseAmount(amounts?.total ?? amounts?.totalFee ?? amounts?.total_fee ?? fee + gst);
      const invoiceDate = asDate(invoice?.invoiceDate ?? invoice?.date ?? member?.createdAt);
      const membershipType = toDisplay(
        membershipDetails?.membership_type ?? membershipDetails?.membershipType ?? membershipDetails?.membershipTypeName,
      );
      const invoiceNo = toDisplay(member?.invoiceNumber ?? invoice?.invoiceNumber ?? invoice?.number);
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const accent: [number, number, number] = [8, 110, 76];
      const light: [number, number, number] = [238, 248, 243];

      // Outer frame
      doc.setDrawColor(...accent);
      doc.setLineWidth(1.1);
      doc.rect(22, 22, pageWidth - 44, pageHeight - 44);

      // Header
      doc.setFillColor(...accent);
      doc.rect(22, 22, pageWidth - 44, 84, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("TAX INVOICE", 40, 66);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Indian Green Building Council (IGBC)", pageWidth - 40, 52, { align: "right" });
      doc.text("Confederation of Indian Industry", pageWidth - 40, 68, { align: "right" });
      doc.text("Membership Billing Division", pageWidth - 40, 84, { align: "right" });

      // Company + invoice info blocks
      doc.setTextColor(30, 30, 30);
      doc.setFillColor(...light);
      doc.rect(40, 126, pageWidth - 80, 72, "F");
      doc.setDrawColor(194, 219, 209);
      doc.rect(40, 126, pageWidth - 80, 72);

      const leftX = 52;
      const rightLabelX = pageWidth - 230;
      const rightValueX = pageWidth - 52;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Billed To", leftX, 146);
      doc.setFont("helvetica", "normal");
      doc.text(applicantName, leftX, 162);
      doc.text(`Membership Type: ${membershipType !== "-" ? membershipType : "Membership"}`, leftX, 178);

      doc.setFont("helvetica", "bold");
      doc.text("Invoice No", rightLabelX, 146);
      doc.text("Invoice Date", rightLabelX, 162);
      doc.text("Membership ID", rightLabelX, 178);

      doc.setFont("helvetica", "normal");
      doc.text(invoiceNo !== "-" ? invoiceNo : membershipId, rightValueX, 146, { align: "right" });
      doc.text(invoiceDate, rightValueX, 162, { align: "right" });
      doc.text(membershipId !== "-" ? membershipId : "N/A", rightValueX, 178, { align: "right" });

      // Charge table
      const tableLeft = 40;
      const tableTop = 236;
      const tableWidth = pageWidth - 80;
      const col1 = tableLeft + 12;
      const col2 = tableLeft + 330;
      const col3 = tableLeft + tableWidth - 12;

      doc.setFillColor(...accent);
      doc.rect(tableLeft, tableTop, tableWidth, 30, "F");
      doc.setDrawColor(...accent);
      doc.rect(tableLeft, tableTop, tableWidth, 30);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("Description", col1, tableTop + 20);
      doc.text("Taxable Value", col2, tableTop + 20);
      doc.text("Amount (INR)", col3, tableTop + 20, { align: "right" });

      doc.setTextColor(25, 25, 25);
      const rowHeight = 32;
      const rows = [
        { label: "Membership Fee", taxable: asCurrency(fee), amount: asCurrency(fee) },
        { label: "GST @ 18%", taxable: "-", amount: asCurrency(gst) },
        { label: "Total Invoice Amount", taxable: "", amount: asCurrency(total), bold: true },
      ];

      rows.forEach((row, index) => {
        const y = tableTop + 30 + index * rowHeight;
        doc.setDrawColor(214, 226, 220);
        doc.rect(tableLeft, y, tableWidth, rowHeight);
        if (row.bold) {
          doc.setFillColor(244, 250, 247);
          doc.rect(tableLeft, y, tableWidth, rowHeight, "F");
          doc.rect(tableLeft, y, tableWidth, rowHeight);
        }
        doc.setFont("helvetica", row.bold ? "bold" : "normal");
        doc.text(row.label, col1, y + 21);
        doc.text(row.taxable, col2, y + 21);
        doc.text(row.amount, col3, y + 21, { align: "right" });
      });

      // Notes + footer
      doc.setDrawColor(220, 228, 224);
      doc.rect(tableLeft, tableTop + 30 + rows.length * rowHeight + 16, tableWidth, 108);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Notes", tableLeft + 10, tableTop + 30 + rows.length * rowHeight + 34);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(85, 85, 85);
      doc.text("1. This is a system-generated invoice and does not require a physical signature.", tableLeft + 10, tableTop + 30 + rows.length * rowHeight + 52);
      doc.text("2. Payment received towards IGBC membership registration.", tableLeft + 10, tableTop + 30 + rows.length * rowHeight + 68);
      doc.text("3. For support, contact support@igbc.in", tableLeft + 10, tableTop + 30 + rows.length * rowHeight + 84);

      doc.setTextColor(...accent);
      doc.setFont("helvetica", "bold");
      doc.text("Authorized Signatory", pageWidth - 52, pageHeight - 90, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setTextColor(95, 95, 95);
      doc.text("Indian Green Building Council", pageWidth - 52, pageHeight - 74, { align: "right" });

      const blob = doc.output("blob");
      const fileName = `${membershipId !== "-" ? membershipId : "membership"}_invoice.pdf`;
      downloadBlob(blob, fileName);
    } catch {
      // keep silent; existing UI has no toast provider in this modal context
    }
  };

  const handleDownloadCertificate = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const width = doc.internal.pageSize.getWidth();
    const center = width / 2;
    const issueDate = new Date().toLocaleDateString("en-IN");

    doc.setFillColor(245, 252, 248);
    doc.rect(24, 24, width - 48, doc.internal.pageSize.getHeight() - 48, "F");
    doc.setDrawColor(33, 138, 90);
    doc.setLineWidth(2);
    doc.rect(24, 24, width - 48, doc.internal.pageSize.getHeight() - 48);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 138, 90);
    doc.setFontSize(28);
    doc.text("IGBC Membership Certificate", center, 110, { align: "center" });

    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text("This certifies that", center, 170, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(30);
    doc.text(applicantName, center, 225, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text("is an approved member of the Indian Green Building Council (IGBC).", center, 265, {
      align: "center",
    });

    doc.setFontSize(13);
    doc.text(`Membership ID: ${membershipId !== "-" ? membershipId : "N/A"}`, center, 320, {
      align: "center",
    });
    doc.text(`Issue Date: ${issueDate}`, center, 345, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setTextColor(90, 90, 90);
    doc.text("Authorized by IGBC Admin", center, 420, { align: "center" });

    doc.save(`${membershipId !== "-" ? membershipId : "membership"}_certificate.pdf`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40" onClick={onClose}>
      <div
        className="bg-card rounded-xl w-full max-w-3xl max-h-[85vh] overflow-hidden"
        style={{ boxShadow: "var(--shadow-modal)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 bg-foreground rounded-t-xl">
          <h2 className="text-sm font-semibold text-card">{headerName} Membership Details</h2>
          <button onClick={onClose} className="text-card hover:opacity-80"><X className="w-5 h-5" /></button>
        </div>
        <div className="max-h-[calc(85vh-56px)] overflow-y-auto">
          <div className="sticky top-0 z-10 flex gap-3 border-b border-border bg-card/95 px-6 py-4 backdrop-blur">
            <button onClick={() => void handleDownloadInvoice()} className="action-btn action-btn-success">
              <Download className="w-3.5 h-3.5" /> Download Invoice
            </button>
            <button onClick={handleDownloadCertificate} className="action-btn action-btn-primary">
              <Download className="w-3.5 h-3.5" /> Download Certificate
            </button>
            <button onClick={onClose} className="action-btn action-btn-outline ml-auto">Close</button>
          </div>
          <div className="p-6">
          {loading && (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading membership details...</div>
          )}

          {!loading && member && (
            <>
              <Section title="Overview">
                <Field label="Status" value={toDisplay(member.status)} />
                <Field label="Invoice Number" value={toDisplay(member.invoiceNumber)} />
                <Field label="Membership id" value={toDisplay(member.membershipId)} />
              </Section>

              {renderObjectSection("Membership Details", member.membershipDetails)}
              {renderObjectSection("Contact Details", member.contact)}
              {renderObjectSection("Invoice Details", member.invoice)}
              {renderObjectSection("Amounts", member.amounts)}
              {renderObjectSection("Payment Details", member.payment)}
            </>
          )}

          {!loading && !member && (
            <div className="py-10 text-center text-sm text-muted-foreground">No details available.</div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipDetails;
