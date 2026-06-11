import { useState } from "react";
import { Search, Calendar, Filter, ChevronDown, X, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface DashboardFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  dateRange: string;
  category: string;
}

const dateRanges = ["Last 7 days", "Last 30 days", "Last 90 days", "This Year", "All Time"];
const categories = ["All", "Memberships", "Projects", "AP Exams", "Revenue", "Certificates"];

const DashboardFilters = ({ onFilterChange }: DashboardFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    dateRange: "Last 30 days",
    category: "All",
  });
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: FilterState = { search: "", dateRange: "Last 30 days", category: "All" };
    setFilters(defaultFilters);
    onFilterChange?.(defaultFilters);
  };

  const hasActiveFilters = filters.search || filters.dateRange !== "Last 30 days" || filters.category !== "All";

  return (
    <div className="kpi-card !p-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search dashboard..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="filter-input w-full pl-9 pr-4 py-2 text-[13px]"
          />
          {filters.search && (
            <button onClick={() => updateFilter("search", "")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Date Range */}
        <div className="relative">
          <button
            onClick={() => { setShowDateDropdown(!showDateDropdown); setShowCategoryDropdown(false); }}
            className="filter-input flex items-center gap-2 py-2 text-[13px]"
          >
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{filters.dateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {showDateDropdown && (
            <div className="glass-panel absolute right-0 top-full z-50 mt-1 min-w-[160px] py-1">
              {dateRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => { updateFilter("dateRange", range); setShowDateDropdown(false); }}
                  className={`w-full text-left px-3 py-2 text-[13px] transition-colors hover:bg-muted ${filters.dateRange === range ? "text-primary font-medium" : "text-foreground"}`}
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category */}
        <div className="relative">
          <button
            onClick={() => { setShowCategoryDropdown(!showCategoryDropdown); setShowDateDropdown(false); }}
            className="filter-input flex items-center gap-2 py-2 text-[13px]"
          >
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{filters.category}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {showCategoryDropdown && (
            <div className="glass-panel absolute right-0 top-full z-50 mt-1 min-w-[160px] py-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { updateFilter("category", cat); setShowCategoryDropdown(false); }}
                  className={`w-full text-left px-3 py-2 text-[13px] transition-colors hover:bg-muted ${filters.category === cat ? "text-primary font-medium" : "text-foreground"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-[13px] gap-1.5 text-muted-foreground">
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default DashboardFilters;
