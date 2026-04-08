import { CheckCircle, Circle } from "lucide-react";

const completionItems = [
  { label: "Personal details", done: true },
  { label: "Contact information", done: true },
  { label: "Address", done: false },
  { label: "Organization", done: false },
  { label: "Profile photo", done: false },
  { label: "Preferences", done: true },
];

export const ProfileSidebar = () => {
  const completed = completionItems.filter((i) => i.done).length;
  const total = completionItems.length;
  const pct = Math.round((completed / total) * 100);

  return (
    <div className="sticky top-24 space-y-6">
      {/* Completeness */}
      <div className="rounded-2xl bg-card p-5 shadow-card">
        <h3 className="mb-1 text-sm font-semibold text-foreground">Profile Completeness</h3>
        <p className="mb-3 text-xs text-muted-foreground">{completed} of {total} sections completed</p>
        <div className="mb-4 h-2 w-full rounded-full bg-primary-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="space-y-2.5">
          {completionItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              {item.done ? (
                <CheckCircle className="h-4 w-4 text-primary" strokeWidth={1.5} />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              )}
              <span className={item.done ? "text-foreground" : "text-muted-foreground"}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-2xl bg-primary-muted p-5">
        <h3 className="mb-2 text-sm font-semibold text-primary">Why complete your profile?</h3>
        <ul className="space-y-1.5 text-xs leading-relaxed text-sage-foreground">
          <li>• Get listed in the Membership Directory</li>
          <li>• Receive relevant exam notifications</li>
          <li>• Unlock networking opportunities</li>
          <li>• Faster support responses</li>
        </ul>
      </div>
    </div>
  );
};
