import type { RequestStatus } from "@/src/domain/types";

export function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-IN", options ?? { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export function formatCurrency(value?: number) {
  if (value === undefined) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export function titleCase(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export const statusLabels: Record<RequestStatus, string> = {
  submitted: "Submitted",
  checking: "Checking",
  similar_offered: "Similar found",
  matched: "Match found",
  not_found: "Not found",
  closed: "Closed",
  cancelled: "Cancelled",
};

export function timeAgo(value: string) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
