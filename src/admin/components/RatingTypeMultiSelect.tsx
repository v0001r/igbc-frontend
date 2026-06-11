import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import type { RatingTypeOption } from "../lib/usersApi";

type Props = {
  label?: string;
  required?: boolean;
  options: RatingTypeOption[];
  value: number[];
  onChange: (ids: number[]) => void;
  loading?: boolean;
  placeholder?: string;
};

export default function RatingTypeMultiSelect({
  label = "Assigned Rating Types",
  required = false,
  options,
  value,
  onChange,
  loading = false,
  placeholder = "Select Rating",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.filter((opt) => value.includes(opt.id));
  const available = options.filter(
    (opt) =>
      !value.includes(opt.id) &&
      opt.ratingName.toLowerCase().includes(query.trim().toLowerCase()),
  );

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const add = (id: number) => {
    if (!value.includes(id)) onChange([...value, id]);
    setQuery("");
    setOpen(false);
  };

  const remove = (id: number) => {
    onChange(value.filter((item) => item !== id));
  };

  return (
    <div ref={rootRef} className="relative">
      <label className="text-xs text-muted-foreground">
        {label}
        {required ? " *" : ""}
      </label>
      <div
        className="mt-1 min-h-[42px] cursor-text rounded-lg border border-border bg-white px-2 py-1.5 shadow-sm"
        onClick={() => setOpen(true)}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {selected.map((item) => (
            <span
              key={item.id}
              className="inline-flex max-w-full items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground"
            >
              <span className="truncate">{item.ratingName}</span>
              <button
                type="button"
                className="rounded hover:bg-primary-foreground/20"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(item.id);
                }}
                aria-label={`Remove ${item.ratingName}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            className="min-w-[120px] flex-1 border-0 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
            placeholder={selected.length ? placeholder : placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            disabled={loading}
          />
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
      </div>

      {open && !loading ? (
        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border bg-white py-1 shadow-lg">
          {available.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">No more options</p>
          ) : (
            available.map((item) => (
              <button
                key={item.id}
                type="button"
                className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted/60"
                onClick={() => add(item.id)}
              >
                {item.ratingName}
              </button>
            ))
          )}
        </div>
      ) : null}

      {loading ? (
        <p className="mt-1 text-xs text-muted-foreground">Loading rating types from database…</p>
      ) : null}
    </div>
  );
}
