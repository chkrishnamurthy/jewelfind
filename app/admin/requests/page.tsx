"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { EmptyState, ErrorState, LoadingState, PageHeader, StatusPill } from "@/src/components/ui";
import { AREAS, CATEGORIES, type Area, type Category, type RequestStatus } from "@/src/domain/types";
import { useRequests } from "@/src/features/hooks";
import { formatDate } from "@/src/utils/format";

const statuses: Array<RequestStatus | "all"> = ["all", "submitted", "checking", "similar_offered", "matched", "not_found", "closed", "cancelled"];

function RequestsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filters = {
    search: searchParams.get("search") ?? "",
    status: (searchParams.get("status") ?? "all") as RequestStatus | "all",
    area: (searchParams.get("area") ?? "all") as Area | "all",
    category: (searchParams.get("category") ?? "all") as Category | "all",
    page: Number(searchParams.get("page") ?? "1"),
    pageSize: 10,
  };
  const query = useRequests(filters);
  function setFilter(key: string, value: string) { const params = new URLSearchParams(searchParams.toString()); if (!value || value === "all") params.delete(key); else params.set(key, value); if (key !== "page") params.delete("page"); router.replace(`/admin/requests?${params.toString()}`); }
  return <><PageHeader eyebrow="Operations" title="Requests" description="Review, assign and release results from one queue." /><div className="data-toolbar"><div className="row" style={{ flex: "1 1 260px", position: "relative" }}><Search size={17} style={{ position: "absolute", left: 13, color: "var(--muted)" }} /><input aria-label="Search requests" className="input" style={{ paddingLeft: 39 }} placeholder="Search code, name or phone" value={filters.search} onChange={(event) => setFilter("search", event.target.value)} /></div><select aria-label="Filter by status" className="select" value={filters.status} onChange={(event) => setFilter("status", event.target.value)}>{statuses.map((status) => <option key={status} value={status}>{status === "all" ? "All statuses" : status.replaceAll("_", " ")}</option>)}</select><select aria-label="Filter by area" className="select" value={filters.area} onChange={(event) => setFilter("area", event.target.value)}><option value="all">All areas</option>{AREAS.map((area) => <option key={area}>{area}</option>)}</select><select aria-label="Filter by category" className="select" value={filters.category} onChange={(event) => setFilter("category", event.target.value)}><option value="all">All categories</option>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></div>{query.isLoading ? <LoadingState rows={6} /> : query.error ? <ErrorState message={query.error.message} onRetry={() => query.refetch()} /> : !query.data?.items.length ? <EmptyState title="No requests found" message="Try clearing one or more filters." action={<button className="button button--secondary" onClick={() => router.replace("/admin/requests")}>Clear filters</button>} /> : <section className="card"><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Request</th><th>Shopper</th><th>Requirements</th><th>Area</th><th>Status</th><th>Created</th></tr></thead><tbody>{query.data.items.map((request) => <tr key={request.id}><td><Link className="table-link" href={`/admin/requests/${request.id}`}>{request.code}</Link></td><td>{request.customerName}<span className="table-sub">{request.phone}</span></td><td>{request.category}<span className="table-sub">{request.budgetLabel}</span></td><td>{request.area}</td><td><StatusPill value={request.status} /></td><td>{formatDate(request.createdAt)}</td></tr>)}</tbody></table></div><div className="table-cards">{query.data.items.map((request) => <Link className="mobile-data-card" href={`/admin/requests/${request.id}`} key={request.id}><div className="row row--between"><strong>{request.code}</strong><StatusPill value={request.status} /></div><p style={{ margin: "9px 0 3px" }}>{request.customerName}</p><span className="muted" style={{ fontSize: ".75rem" }}>{request.category} · {request.area}</span></Link>)}</div><div className="pagination"><span>{query.data.total} requests · page {query.data.page} of {query.data.pages}</span><div className="row"><button aria-label="Previous page" className="icon-button" disabled={query.data.page <= 1} onClick={() => setFilter("page", String(query.data!.page - 1))}><ChevronLeft size={16} /></button><button aria-label="Next page" className="icon-button" disabled={query.data.page >= query.data.pages} onClick={() => setFilter("page", String(query.data!.page + 1))}><ChevronRight size={16} /></button></div></div></section>}</>;
}

export default function AdminRequestsPage() { return <Suspense fallback={<LoadingState rows={6} />}><RequestsContent /></Suspense>; }
