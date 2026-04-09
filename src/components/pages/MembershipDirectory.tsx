import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ExternalLink, Mail, Search } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

type MembershipType = "Founding Membership" | "Annual Membership" | "Individual Membership";

type Member = {
  id: string;
  logo: string | null;
  name: string;
  type: MembershipType;
  website: string;
  category: string;
  contactEmail: string;
};

const members: Member[] = [
  { id: "m1", logo: "AN", name: "Ananta Architects", type: "Founding Membership", website: "https://ananta-architects.example.com", category: "Architects", contactEmail: "contact@ananta-architects.example.com" },
  { id: "m2", logo: "BE", name: "Blue Earth Engineers", type: "Annual Membership", website: "https://blueearth.example.com", category: "Engineers", contactEmail: "hello@blueearth.example.com" },
  { id: "m3", logo: "GD", name: "Greenline Developers", type: "Annual Membership", website: "https://greenline-dev.example.com", category: "Builders & Developers", contactEmail: "office@greenline-dev.example.com" },
  { id: "m4", logo: "EC", name: "EcoCore Consulting", type: "Individual Membership", website: "https://ecocore.example.com", category: "Service Consultants", contactEmail: "team@ecocore.example.com" },
  { id: "m5", logo: "SM", name: "SunMatrix Materials", type: "Founding Membership", website: "https://sunmatrix.example.com", category: "Materials & Equipment Manufacturers", contactEmail: "sales@sunmatrix.example.com" },
  { id: "m6", logo: "AE", name: "Apex Energy Auditors", type: "Annual Membership", website: "https://apex-auditors.example.com", category: "Energy Auditors", contactEmail: "support@apex-auditors.example.com" },
  { id: "m7", logo: "UP", name: "UrbanPlanners Studio", type: "Individual Membership", website: "https://urbanplanners.example.com", category: "Architects/Planners (<10 Professionals)", contactEmail: "info@urbanplanners.example.com" },
  { id: "m8", logo: "NC", name: "NexGen Corporate Realty", type: "Annual Membership", website: "https://nexgen-realty.example.com", category: "Corporate", contactEmail: "corp@nexgen-realty.example.com" },
  { id: "m9", logo: "BM", name: "BuildMax Infra", type: "Founding Membership", website: "https://buildmax.example.com", category: "Builders & Developers", contactEmail: "projects@buildmax.example.com" },
  { id: "m10", logo: "RA", name: "Reform Architects", type: "Annual Membership", website: "https://reform-arch.example.com", category: "Architects", contactEmail: "contact@reform-arch.example.com" },
  { id: "m11", logo: "CF", name: "CrestField Engineers", type: "Founding Membership", website: "https://crestfield.example.com", category: "Engineers", contactEmail: "hello@crestfield.example.com" },
  { id: "m12", logo: null, name: "Indira Narayan", type: "Individual Membership", website: "https://indira-narayan.example.com", category: "Individual Consultant", contactEmail: "indira.narayan@example.com" },
];

const membershipTabs: Array<"All" | MembershipType> = [
  "All",
  "Founding Membership",
  "Annual Membership",
  "Individual Membership",
];

const pageSize = 6;

const MembershipDirectory = () => {
  const user = getCurrentUser();
  const canContact = Boolean(user);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [activeType, setActiveType] = useState<"All" | MembershipType>("All");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const categories = useMemo(
    () => ["All Categories", ...new Set(members.map((member) => member.category))],
    [],
  );

  const filteredMembers = useMemo(() => {
    return members
      .filter((member) =>
        query.trim() ? member.name.toLowerCase().includes(query.trim().toLowerCase()) : true,
      )
      .filter((member) => (category === "All Categories" ? true : member.category === category))
      .filter((member) => (activeType === "All" ? true : member.type === activeType))
      .filter((member) =>
        activeLetter ? member.name.toUpperCase().startsWith(activeLetter) : true,
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [activeLetter, activeType, category, query]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const paginatedMembers = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredMembers.slice(startIndex, startIndex + pageSize);
  }, [filteredMembers, page]);

  useEffect(() => {
    setPage(1);
  }, [query, category, activeType, activeLetter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Membership Directory</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse IGBC member organizations and individuals by membership type, category, or alphabetical index.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_280px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by organization name"
                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {membershipTabs.map((tab) => {
              const active = activeType === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveType(tab)}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => {
              const active = activeLetter === letter;
              return (
                <button
                  key={letter}
                  onClick={() => setActiveLetter((current) => (current === letter ? null : letter))}
                  className={`h-8 min-w-8 rounded-md border px-2 text-xs font-medium transition ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Logo</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Website</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-center">Contact</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMembers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No members found for selected filters.
                    </td>
                  </tr>
                )}

                {paginatedMembers.map((member) => (
                  <tr key={member.id} className="border-b border-border/60 last:border-b-0 hover:bg-muted/20">
                    <td className="px-4 py-3">
                      {member.logo ? (
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-muted text-xs font-semibold text-primary">
                          {member.logo}
                        </span>
                      ) : (
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                          N/A
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{member.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{member.type}</td>
                    <td className="px-4 py-3">
                      <a
                        href={member.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        Visit <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{member.category}</td>
                    <td className="px-4 py-3 text-center">
                      {canContact ? (
                        <a
                          href={`mailto:${member.contactEmail}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          aria-label={`Contact ${member.name}`}
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                      ) : (
                        <button
                          disabled
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 text-muted-foreground/50"
                          aria-label="Login required to contact"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border bg-background px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              Page: {totalPages === 0 ? 0 : page} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page === totalPages}
                className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default MembershipDirectory;
