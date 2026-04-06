import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import {
  Search, MapPin, Building2, Filter, ChevronDown, Mail, Phone, Award,
  Leaf, Users, BookOpen, Shield, BadgePercent, Sprout, Globe, ChevronRight,
  ExternalLink
} from "lucide-react";

// IGBC Membership info page data
const membershipTypes = [
  { type: "Corporate Membership", desc: "For organizations committed to green buildings", members: "2,500+" },
  { type: "Institutional Membership", desc: "For academic and research institutions", members: "800+" },
  { type: "Individual Membership", desc: "For professionals in green building sector", members: "18,000+" },
  { type: "Student Membership", desc: "For students pursuing green building studies", members: "4,000+" },
];

const benefits = [
  { icon: BookOpen, title: "Access to Resources", desc: "Green building publications, technical papers, and research" },
  { icon: Users, title: "Networking", desc: "Connect with 25,000+ industry professionals" },
  { icon: Shield, title: "Policy Influence", desc: "Participate in shaping green building policies" },
  { icon: BadgePercent, title: "Discounts", desc: "Special rates on IGBC events and training programs" },
  { icon: Sprout, title: "Sustainability", desc: "Drive sustainable change in the Indian building sector" },
  { icon: Award, title: "Recognition", desc: "IGBC membership recognized nationally" },
];

const feeTable = [
  { category: "Individual Membership", annual: "₹1,500", gst: "₹270", total: "₹1,770" },
  { category: "Professional Membership", annual: "₹15,000", gst: "₹2,700", total: "₹17,700" },
  { category: "Corporate Membership", annual: "₹50,000", gst: "₹9,000", total: "₹59,000" },
  { category: "Institutional Membership", annual: "₹25,000", gst: "₹4,500", total: "₹29,500" },
  { category: "Student Membership", annual: "₹500", gst: "₹90", total: "₹590" },
];

const chapters = [
  { id: 1, place: "Ahmedabad", type: "Chapter", contacts: "Ar. Rahul Shah\nahmedabad@igbc.in\n+91-79-26400100" },
  { id: 2, place: "Bangalore", type: "Chapter", contacts: "Er. Vikram M\nbangalore@igbc.in\n+91-80-25551234" },
  { id: 3, place: "Chennai", type: "Chapter", contacts: "Dr. Priya S\nchennai@igbc.in\n+91-44-28201234" },
  { id: 4, place: "Delhi NCR", type: "Chapter", contacts: "Ar. Amit K\ndelhi@igbc.in\n+91-11-41234567" },
  { id: 5, place: "Hyderabad", type: "HQ", contacts: "IGBC Secretariat\nigbc@cii.in\n+91-40-44185111" },
  { id: 6, place: "Kolkata", type: "Chapter", contacts: "Er. Siddharth J\nkolkata@igbc.in\n+91-33-22801234" },
  { id: 7, place: "Mumbai", type: "Chapter", contacts: "Ar. Kavita M\nmumbai@igbc.in\n+91-22-24981234" },
  { id: 8, place: "Pune", type: "Chapter", contacts: "Dr. Anil V\npune@igbc.in\n+91-20-25671234" },
];

const MembershipDirectory = () => {
  const [showChapters, setShowChapters] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 text-primary-foreground">
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="h-6 w-6" />
              <span className="text-sm font-semibold opacity-80">INDIAN GREEN BUILDING COUNCIL</span>
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl">IGBC Membership</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed opacity-80">
              IGBC Membership is open to all those who are interested in the green building movement in India.
              Members include architects, developers, building owners, energy consultants, corporations, academic and research institutions, and more.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="/become-a-member" className="inline-flex items-center gap-2 rounded-xl bg-primary-foreground px-5 py-2.5 text-sm font-semibold text-primary shadow-sm transition hover:opacity-90">
                Become a Member <ArrowRight />
              </a>
              <button onClick={() => setShowChapters(!showChapters)} className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/30 px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-foreground/10">
                <Globe className="h-4 w-4" /> View Chapters
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            {/* Who can become a member */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-lg font-semibold text-foreground">🏛️ Who Can Become a Member?</h2>
              <p className="mt-2 text-sm text-muted-foreground">IGBC membership is open to:</p>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {["Architects & Engineers", "Real Estate Developers", "Building Owners & Operators", "Energy & Environment Consultants", "Corporate Organizations", "Academic & Research Institutions", "Government Bodies", "Students & Individuals"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-muted text-primary text-xs">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Types of Membership */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-lg font-semibold text-foreground">📋 Types of Membership</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {membershipTypes.map((m) => (
                  <div key={m.type} className="rounded-xl border border-border p-4 transition hover:border-primary/30 hover:shadow-md">
                    <h3 className="text-sm font-semibold text-foreground">{m.type}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{m.desc}</p>
                    <p className="mt-2 text-xs font-medium text-primary">{m.members} members</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Benefits */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-lg font-semibold text-foreground">🌿 Key Benefits</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {benefits.map((b) => (
                  <div key={b.title} className="flex items-start gap-3 rounded-xl border border-border p-4 transition hover:border-primary/30">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-muted">
                      <b.icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{b.title}</h3>
                      <p className="text-xs text-muted-foreground">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Validity */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-lg font-semibold text-foreground">📅 Validity</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                IGBC offers the following period of enrollment for new members:
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> Individual Membership is for 1 year</li>
                <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> Corporate Membership is for 1 year</li>
                <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> Institutional Membership is for 3 years</li>
                <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> Student Membership is for 1 year</li>
              </ul>
            </motion.div>

            {/* Fee Table */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-lg font-semibold text-foreground">💰 Membership Fees (Effective from 1 January 2026)</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs font-medium text-muted-foreground">
                      <th className="px-4 py-3 text-left">Membership Category</th>
                      <th className="px-4 py-3 text-right">Annual Fee</th>
                      <th className="px-4 py-3 text-right">GST (18%)</th>
                      <th className="px-4 py-3 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeTable.map((row) => (
                      <tr key={row.category} className="border-b border-border/50 transition hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium text-foreground">{row.category}</td>
                        <td className="px-4 py-3 text-right font-mono text-muted-foreground">{row.annual}</td>
                        <td className="px-4 py-3 text-right font-mono text-muted-foreground">{row.gst}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-primary">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Chapters */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-lg font-semibold text-foreground">📍 IGBC Chapters</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs font-medium text-muted-foreground">
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Place</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Contact Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chapters.map((ch) => (
                      <tr key={ch.id} className="border-b border-border/50 transition hover:bg-muted/30">
                        <td className="px-4 py-3 text-muted-foreground">{ch.id}</td>
                        <td className="px-4 py-3 font-medium text-foreground">{ch.place}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ch.type === "HQ" ? "bg-primary-muted text-primary" : "bg-muted text-muted-foreground"}`}>
                            {ch.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-pre-line">{ch.contacts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="sticky top-20 space-y-5">
              {/* Login / Register */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Login / Register</h3>
                <input placeholder="Email or Member ID" className="mb-2 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <input type="password" placeholder="Password" className="mb-3 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <button className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition">Login</button>
                <a href="/register" className="mt-3 block text-center text-xs text-primary hover:underline">Create an Account</a>
              </div>

              {/* Quick Links */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Quick Links</h3>
                <div className="space-y-2">
                  {[
                    { label: "Become a Member", href: "/become-a-member" },
                    { label: "Register a Project", href: "/register-project" },
                    { label: "AP Exam", href: "/ap-exam" },
                    { label: "NEST & NEST+", href: "/nest-plus" },
                  ].map((link) => (
                    <a key={link.label} href={link.href} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground">
                      <ChevronRight className="h-3.5 w-3.5" /> {link.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="rounded-2xl bg-primary-muted p-5">
                <h3 className="mb-2 text-sm font-semibold text-primary">Need Help?</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  For membership queries, contact IGBC at{" "}
                  <span className="font-medium text-foreground">igbc@cii.in</span> or call{" "}
                  <span className="font-medium text-foreground">+91 40 4418 5111</span>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

function ArrowRight() {
  return <ChevronRight className="h-4 w-4" />;
}

export default MembershipDirectory;
