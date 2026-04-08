import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { ExternalLink, Mail, Phone, Plus, Search, Trash2, UserRoundPen } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import {
  createDirectoryMember,
  deleteDirectoryMember,
  listDirectoryMembers,
  type DirectoryMember,
  type DirectoryMembershipType,
  updateDirectoryMember,
} from "@/lib/membershipDirectory";

const MEMBERSHIP_TABS: Array<"All" | DirectoryMembershipType> = [
  "All",
  "Founding Membership",
  "Annual Membership",
  "Individual Membership",
];
const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const PAGE_SIZE = 8;

type EditorState = {
  id?: string;
  logo: string;
  name: string;
  membershipType: DirectoryMembershipType;
  website: string;
  category: string;
  email: string;
  phone: string;
};

const emptyEditor: EditorState = {
  logo: "",
  name: "",
  membershipType: "Annual Membership",
  website: "",
  category: "",
  email: "",
  phone: "",
};

const MembershipDirectory = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [membershipType, setMembershipType] = useState<"All" | DirectoryMembershipType>("All");
  const [letter, setLetter] = useState("All");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<DirectoryMember[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editor, setEditor] = useState<EditorState>(emptyEditor);
  const [saving, setSaving] = useState(false);

  const currentUser = getCurrentUser();
  const canContact = Boolean(currentUser);
  const isAdmin = currentUser?.userType === "a";

  const loadMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listDirectoryMembers({
        search: query || undefined,
        category: category === "All" ? undefined : category,
        membershipType: membershipType === "All" ? undefined : membershipType,
        startsWith: letter === "All" ? undefined : letter,
      });
      setMembers(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMembers();
  }, [query, category, membershipType, letter]);

  const categories = useMemo(() => {
    const set = new Set(members.map((m) => m.category));
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [members]);

  const totalPages = Math.max(1, Math.ceil(members.length / PAGE_SIZE));
  const pagedMembers = members.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query, category, membershipType, letter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const openCreate = () => {
    setEditor(emptyEditor);
    setEditorOpen(true);
  };

  const openEdit = (member: DirectoryMember) => {
    setEditor({
      id: member.id,
      logo: member.logo,
      name: member.name,
      membershipType: member.membershipType,
      website: member.website,
      category: member.category,
      email: member.email,
      phone: member.phone,
    });
    setEditorOpen(true);
  };

  const saveMember = async () => {
    setSaving(true);
    try {
      const payload = {
        logo: editor.logo,
        name: editor.name,
        membershipType: editor.membershipType,
        website: editor.website,
        category: editor.category,
        email: editor.email,
        phone: editor.phone,
      };
      if (editor.id) {
        await updateDirectoryMember(editor.id, payload);
      } else {
        await createDirectoryMember(payload);
      }
      setEditorOpen(false);
      await loadMembers();
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (id: string) => {
    await deleteDirectoryMember(id);
    await loadMembers();
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Membership Directory</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Search, filter and connect with IGBC members.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Member
            </button>
          )}
        </div>
      </motion.div>

      <div className="mt-6 space-y-4 rounded-2xl bg-card p-4 shadow-card">
        <div className="grid gap-3 md:grid-cols-[1fr_260px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by organization name"
              className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm"
            />
          </div>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {MEMBERSHIP_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setMembershipType(tab)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                membershipType === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setLetter("All")}
            className={`rounded-md px-2.5 py-1 text-xs ${
              letter === "All" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            All
          </button>
          {ALPHABETS.map((alpha) => (
            <button
              key={alpha}
              onClick={() => setLetter(alpha)}
              className={`rounded-md px-2.5 py-1 text-xs ${
                letter === alpha ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {alpha}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                <th className="px-4 py-3 text-left">LOGO</th>
                <th className="px-4 py-3 text-left">NAME</th>
                <th className="px-4 py-3 text-left">TYPE</th>
                <th className="px-4 py-3 text-left">WEBSITE</th>
                <th className="px-4 py-3 text-left">CATEGORY</th>
                <th className="px-4 py-3 text-left">CONTACT</th>
                {isAdmin && <th className="px-4 py-3 text-left">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-4 py-8 text-center text-muted-foreground">
                    Loading directory...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-4 py-8 text-center text-destructive">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && pagedMembers.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-4 py-8 text-center text-muted-foreground">
                    No members found for selected filters.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                pagedMembers.map((member) => (
                  <tr key={member.id} className="border-b border-border/50">
                    <td className="px-4 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-muted text-xs font-semibold text-primary">
                        {member.logo || member.name.slice(0, 2).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{member.name}</td>
                    <td className="px-4 py-3">{member.membershipType}</td>
                    <td className="px-4 py-3">
                      <a
                        href={member.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        Website
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                    <td className="px-4 py-3">{member.category}</td>
                    <td className="px-4 py-3">
                      {canContact ? (
                        <div className="flex gap-2">
                          <a href={`mailto:${member.email}`} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs">
                            <Mail className="h-3.5 w-3.5" />
                            Email
                          </a>
                          <a href={`tel:${member.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs">
                            <Phone className="h-3.5 w-3.5" />
                            Call
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Login required</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(member)} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs">
                            <UserRoundPen className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button onClick={() => void removeMember(member.id)} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-card px-4 py-3 shadow-card">
        <p className="text-xs text-muted-foreground">Page: {page} / {totalPages}</p>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-50">Previous</button>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-50">Next</button>
        </div>
      </div>

      {isAdmin && editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-card p-6 shadow-card">
            <h3 className="text-lg font-semibold text-foreground">{editor.id ? "Edit Member" : "Add Member"}</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(["logo", "name", "website", "category", "email", "phone"] as const).map((field) => (
                <input
                  key={field}
                  value={editor[field]}
                  onChange={(event) => setEditor((prev) => ({ ...prev, [field]: event.target.value }))}
                  placeholder={field}
                  className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
                />
              ))}
              <select
                value={editor.membershipType}
                onChange={(event) =>
                  setEditor((prev) => ({
                    ...prev,
                    membershipType: event.target.value as DirectoryMembershipType,
                  }))
                }
                className="h-10 rounded-xl border border-input bg-background px-3 text-sm sm:col-span-2"
              >
                <option value="Founding Membership">Founding Membership</option>
                <option value="Annual Membership">Annual Membership</option>
                <option value="Individual Membership">Individual Membership</option>
              </select>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setEditorOpen(false)} className="rounded-xl border px-4 py-2 text-xs font-medium">
                Cancel
              </button>
              <button onClick={() => void saveMember()} disabled={saving} className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MembershipDirectory;
