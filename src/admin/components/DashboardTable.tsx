import { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const recentProjects = [
  { id: "PRJ-001", name: "Green Tower Bangalore", owner: "Rajesh Kumar", status: "Approved", date: "2024-03-15" },
  { id: "PRJ-002", name: "Eco Park Delhi", owner: "Priya Singh", status: "Pending", date: "2024-03-14" },
  { id: "PRJ-003", name: "LEED Office Mumbai", owner: "Amit Sharma", status: "Rejected", date: "2024-03-13" },
  { id: "PRJ-004", name: "Solar Hub Chennai", owner: "Deepa Nair", status: "Approved", date: "2024-03-12" },
  { id: "PRJ-005", name: "Wind Valley Pune", owner: "Vikram Patel", status: "Pending", date: "2024-03-11" },
];

const recentUsers = [
  { id: "USR-001", name: "Anil Gupta", email: "anil@example.com", role: "Admin", joined: "2024-03-15" },
  { id: "USR-002", name: "Meera Joshi", email: "meera@example.com", role: "Member", joined: "2024-03-14" },
  { id: "USR-003", name: "Suresh R.", email: "suresh@example.com", role: "AP", joined: "2024-03-13" },
  { id: "USR-004", name: "Kavita Das", email: "kavita@example.com", role: "Member", joined: "2024-03-12" },
];

const eventRegistrations = [
  { id: "EVT-001", event: "Green Summit 2024", attendee: "Rohit Mehta", status: "Confirmed", date: "2024-04-01" },
  { id: "EVT-002", event: "IGBC Annual Meet", attendee: "Sita Ram", status: "Pending", date: "2024-04-05" },
  { id: "EVT-003", event: "Sustainability Expo", attendee: "Neha Kapoor", status: "Confirmed", date: "2024-04-10" },
  { id: "EVT-004", event: "Green Summit 2024", attendee: "Arjun Reddy", status: "Pending", date: "2024-04-01" },
];

const StatusBadge = ({ status }: { status: string }) => {
  const cls = status === "Approved" || status === "Confirmed" ? "status-approved" : status === "Pending" ? "status-pending" : "status-rejected";
  return <span className={`status-badge ${cls}`}>{status}</span>;
};

interface MiniTableProps {
  title: string;
  headers: string[];
  rows: Record<string, string>[];
  keys: string[];
  statusKey?: string;
}

const MiniTable = ({ title, headers, rows, keys, statusKey }: MiniTableProps) => {
  const [search, setSearch] = useState("");
  const filtered = rows.filter((r) =>
    keys.some((k) => r[k]?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="kpi-card !p-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <h3 className="text-xs font-semibold text-foreground">{title}</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input
            type="text"
            name="search"
            aria-label="Search"
            title="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-input pl-7 pr-3 py-1 text-[11px] w-32"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i} className="cursor-pointer">
                {keys.map((k) => (
                  <td key={k}>
                    {statusKey && k === statusKey ? <StatusBadge status={row[k]} /> : row[k]}
                  </td>
                ))}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={headers.length} className="text-center py-6 text-muted-foreground">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-t border-border text-[10px] text-muted-foreground">
        <span>Showing {filtered.length} of {rows.length}</span>
        <div className="flex gap-1 items-center">
          <button className="p-1 rounded hover:bg-muted"><ChevronLeft className="w-3 h-3" /></button>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-primary text-primary-foreground">1</span>
          <button className="p-1 rounded hover:bg-muted"><ChevronRight className="w-3 h-3" /></button>
        </div>
      </div>
    </div>
  );
};

const DashboardTable = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <MiniTable
        title="Recent Projects"
        headers={["ID", "Project", "Owner", "Status", "Date"]}
        keys={["id", "name", "owner", "status", "date"]}
        rows={recentProjects}
        statusKey="status"
      />
      <MiniTable
        title="Recent Users"
        headers={["ID", "Name", "Email", "Role", "Joined"]}
        keys={["id", "name", "email", "role", "joined"]}
        rows={recentUsers}
      />
      <MiniTable
        title="Event Registrations"
        headers={["ID", "Event", "Attendee", "Status", "Date"]}
        keys={["id", "event", "attendee", "status", "date"]}
        rows={eventRegistrations}
        statusKey="status"
      />
    </div>
  );
};

export default DashboardTable;
