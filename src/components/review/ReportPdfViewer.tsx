import { reportDownloadUrl } from "@/lib/reviewApi";

type Props = {
  downloadUrl: string;
  title?: string;
  /** A4 landscape aspect for certificate HTML previews */
  layout?: "default" | "a4-landscape";
};

export function ReportPdfViewer({
  downloadUrl,
  title = "Review Report",
  layout = "default",
}: Props) {
  const url =
    downloadUrl.startsWith("blob:") || downloadUrl.startsWith("data:")
      ? downloadUrl
      : reportDownloadUrl(downloadUrl);
  const frameClass =
    layout === "a4-landscape"
      ? "aspect-[297/210] w-full max-h-[85vh] rounded-lg border border-border"
      : "h-[480px] w-full rounded-lg border border-border";

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-primary hover:underline"
        >
          Open in new tab
        </a>
      </div>
      <iframe title={title} src={url} className={frameClass} />
    </div>
  );
}
