import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, Mail } from "lucide-react";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  title?: string;
  showSearch?: boolean;
  showEmail?: boolean;
  pageSize?: number;
}

const DataTable = ({ columns, data, title, showSearch = true, showEmail = false, pageSize = 10 }: DataTableProps) => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = data.filter((row) =>
    Object.values(row).some((v) => String(v).toLowerCase().includes(search.toLowerCase()))
  );

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const aVal = a[sortKey], bVal = b[sortKey];
        const cmp = typeof aVal === "number" ? aVal - bVal : String(aVal).localeCompare(String(bVal));
        return sortDir === "asc" ? cmp : -cmp;
      })
    : filtered;

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="kpi-card p-0 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
        </div>
        <div className="flex items-center gap-3">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                name="search"
                aria-label="Search"
                title="Search"
                className="filter-input pl-9 py-1.5 w-48 text-xs"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          )}
          {showEmail && (
            <button className="action-btn action-btn-outline text-xs"><Mail className="w-3.5 h-3.5" /> Send Email</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={col.sortable ? "cursor-pointer select-none hover:text-foreground" : ""}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={columns.length} className="text-center py-8 text-muted-foreground">No results found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-border">
        <span className="text-xs text-muted-foreground">
          Showing {paged.length} of {sorted.length} records
        </span>
        {totalPages > 1 ? (
          <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="action-btn action-btn-outline disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                  page === p ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
                }`}
              >
                {p}
              </button>
            );
          })}
          {totalPages > 5 && <span className="text-xs text-muted-foreground px-1">...</span>}
          {totalPages > 5 && (
            <button onClick={() => setPage(totalPages)} className="w-8 h-8 rounded-lg text-xs font-semibold hover:bg-muted text-foreground">
              {totalPages}
            </button>
          )}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="action-btn action-btn-outline disabled:opacity-40"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          </div>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};

export default DataTable;
