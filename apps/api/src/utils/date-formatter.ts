/**
 * Date formatting utilities.
 */

/**
 * Format a Date to YYYY-MM-DD.
 */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

/**
 * Format a Date to YYYY-MM-DD HH:mm:ss.
 */
export function formatDateTime(date: Date): string {
  return date.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "");
}

/**
 * Get a human-readable relative time string (e.g. "2 hours ago").
 */
export function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;

  return formatDate(date);
}
