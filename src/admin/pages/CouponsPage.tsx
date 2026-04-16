import DataTable from "../components/DataTable";
import TableRowActions from "../components/TableRowActions";

const coupons = [
  { name: "ALCBT-26-13", code: "IGBCAP-ALCBT-26-13", description: "IGBCAP-ALCBT-26-13 PARTICIPANTS COUPON CODE KOCHI", type: "Percentage", discount: 50.0, status: "Active" },
  { name: "SHREENIWAS APARTMENT Membership Discount", code: "DESHGH20", description: "Discount correction for annual member IGBCBD220014...", type: "Flat", discount: 20000.0, status: "Active" },
  { name: "Lodha Volume Proposal for 6 projects flat", code: "LODHAFLAT440", description: "GH2400418-Lodha Hosa Road, GH2400419-Lodha Sterli...", type: "Flat", discount: 440000.0, status: "Active" },
  { name: "Greenfield", code: "GFFHFLAT", description: "Fees was paid last year (jan, 2025) before the fee...", type: "Flat", discount: 312855.55, status: "Active" },
  { name: "Varun Enclave", code: "VARUNGHFLAT", description: "Fees was paid last year (jan, 2025) before the fee...", type: "Flat", discount: 130000.0, status: "Active" },
  { name: "Flat coupon for Lodha Parcel 10", code: "Parcel10GHFlat", description: "Flat coupon for Lodha Upper Thane Parcel 10 - Vill...", type: "Flat", discount: 269732.44, status: "Active" },
  { name: "Flat coupon for Lodha Eden", code: "EdenGHFLAT", description: "Flat coupon for Lodha Upper Thane - Eden, As the f...", type: "Flat", discount: 143510.0, status: "Active" },
  { name: "NB to EB migration IGBCNBO151028", code: "WIPRONB2EB", description: "SBD 9 & 10, WIPRO LIMITED, CDC5, Chennai (Reg ID -...", type: "Flat", discount: 25000.0, status: "Active" },
  { name: "Volume Proposal for Radiance Realty (PC)", code: "VOLRADGH10", description: "Volume Proposal for Radiance Realty (PC): Radiance...", type: "Percentage", discount: 10.0, status: "Active" },
  { name: "Test Expired Coupon", code: "TESTEXP01", description: "This coupon has expired for testing purposes.", type: "Flat", discount: 5000.0, status: "Inactive" },
];

const CouponsPage = () => {
  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "code", label: "Code", sortable: true },
    { key: "description", label: "Description", render: (v: string) => <span className="text-xs text-muted-foreground line-clamp-2">{v}</span> },
    { key: "type", label: "Type", sortable: true },
    { key: "discount", label: "Discount", sortable: true, render: (v: number, row: any) => <span className="font-semibold text-foreground">{row.type === "Percentage" ? `${v}%` : `₹${v.toLocaleString()}`}</span> },
    {
      key: "status", label: "Status",
      render: (v: string) => <span className={`status-badge ${v === "Active" ? "status-approved" : "status-rejected"}`}>{v}</span>,
    },
    {
      key: "actions", label: "Action",
      render: () => (
        <TableRowActions
          actions={[
            { label: "Edit", onClick: () => undefined, variant: "primary" },
            { label: "View Details", onClick: () => undefined, variant: "outline" },
            { label: "Remove", onClick: () => undefined, variant: "danger" },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-primary font-semibold">Manage Coupons</p>
        <div className="flex gap-2">
          <button className="action-btn action-btn-success">+ Add</button>
          <button className="action-btn action-btn-outline">Export</button>
        </div>
      </div>
      <DataTable columns={columns} data={coupons} title="Coupons" />
    </div>
  );
};

export default CouponsPage;
