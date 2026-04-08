export const PreferencesSection = () => {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-card">
      <h2 className="mb-6 text-base font-semibold text-foreground">Preferences</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Communication
          </h3>
          <div className="space-y-3">
            {["Email notifications", "SMS alerts", "Newsletter"].map((item) => (
              <label key={item} className="flex items-center gap-3 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                {item}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Language
          </h3>
          <select className="h-11 w-full rounded-lg bg-card px-3 text-sm text-foreground ring-1 ring-input focus:outline-none focus:ring-2 focus:ring-primary">
            <option>English</option>
            <option>Hindi</option>
            <option>Telugu</option>
            <option>Tamil</option>
          </select>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Privacy
          </h3>
          <div className="space-y-3">
            {["Show profile publicly", "Show email to members"].map((item) => (
              <label key={item} className="flex items-center gap-3 text-sm text-foreground cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="peer sr-only" defaultChecked />
                  <div className="h-5 w-9 rounded-full bg-input transition-colors peer-checked:bg-primary" />
                  <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-card shadow-sm transition-transform peer-checked:translate-x-4" />
                </div>
                {item}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
