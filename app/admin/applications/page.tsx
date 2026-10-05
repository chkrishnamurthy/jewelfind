"use client";

import { Building2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState, ErrorState, LoadingState, PageHeader, StatusPill } from "@/src/components/ui";
import type { ApplicationStatus } from "@/src/domain/types";
import { useApplications } from "@/src/features/hooks";
import { formatDate } from "@/src/utils/format";

export default function ApplicationsPage() {
  const [status, setStatus] = useState<ApplicationStatus | "all">("all");
  const query = useApplications(status);
  return <><PageHeader eyebrow="Partner network" title="Applications" description="Review showrooms interested in joining the pilot." /><div className="data-toolbar"><select className="select" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="all">All statuses</option>{["new", "reviewing", "approved", "needs_info", "rejected"].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select></div>{query.isLoading ? <LoadingState rows={5} /> : query.error ? <ErrorState message={query.error.message} onRetry={() => query.refetch()} /> : !query.data?.length ? <EmptyState title="No applications here" message="New partner submissions will appear in this queue." /> : <section className="card"><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Business</th><th>Contact</th><th>Area</th><th>Categories</th><th>Status</th><th>Submitted</th></tr></thead><tbody>{query.data.map((item) => <tr key={item.id}><td><Link className="table-link" href={`/admin/applications/${item.id}`}>{item.businessName}</Link></td><td>{item.contactName}<span className="table-sub">{item.phone}</span></td><td>{item.area}</td><td>{item.categories.join(", ")}</td><td><StatusPill value={item.status} /></td><td>{formatDate(item.createdAt)}</td></tr>)}</tbody></table></div><div className="table-cards">{query.data.map((item) => <Link className="mobile-data-card" href={`/admin/applications/${item.id}`} key={item.id}><div className="row row--between"><span className="row"><Building2 size={17} /><strong>{item.businessName}</strong></span><StatusPill value={item.status} /></div><p className="muted" style={{ margin: "8px 0 0", fontSize: ".76rem" }}>{item.area} · {item.contactName}</p></Link>)}</div></section>}</>;
}
