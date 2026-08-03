export function getReportOpenUrl(report: { reportUrl?: string; fileUrl?: string }): string {
  const raw = (report.reportUrl || report.fileUrl || "").trim();
  if (!raw) return "";

  let candidate = raw;

  // Handle protocol-relative URLs such as //res.cloudinary.com/...
  if (candidate.startsWith("//")) {
    candidate = `https:${candidate}`;
  } else if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const url = new URL(candidate);
    // Ensure whitespace/special chars in path are safely encoded.
    return encodeURI(url.toString());
  } catch {
    return "";
  }
}
