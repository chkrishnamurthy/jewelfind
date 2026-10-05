"use client";

import { Clock3, MapPin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { JewelryVisual } from "@/src/components/domain/jewelry-visual";
import { EmptyState, ErrorState, LoadingState, PageHeader, StatusPill } from "@/src/components/ui";
import { useShowroomAssignments } from "@/src/features/hooks";
import { useRepositories } from "@/src/providers/repository-provider";
import { formatDate } from "@/src/utils/format";

export default function ShowroomInboxPage() {
  const { auth } = useRepositories(); const showroom = auth.getShowroomSession(); const [tab, setTab] = useState<"new" | "replied" | "all">("new"); const query = useShowroomAssignments(showroom?.id ?? "");
  if (!showroom) return null;
  const filtered = query.data?.filter((detail) => { const assignment = detail.assignments.find((item) => item.showroomId === showroom.id); return tab === "all" || (tab === "new" ? assignment?.status !== "replied" : assignment?.status === "replied"); });
  return <><PageHeader eyebrow={showroom.name} title="Request inbox" description="Only assignments sent to this showroom appear here." /><div className="showroom-tabs">{(["new", "replied", "all"] as const).map((value) => <button className={`showroom-tab ${tab === value ? "showroom-tab--active" : ""}`} key={value} onClick={() => setTab(value)}>{value === "new" ? "Needs reply" : value[0].toUpperCase() + value.slice(1)}</button>)}</div>{query.isLoading ? <LoadingState rows={4} /> : query.error ? <ErrorState message={query.error.message} onRetry={() => query.refetch()} /> : !filtered?.length ? <EmptyState title="Nothing in this view" message={tab === "new" ? "You are caught up. New assignments will appear here." : "No assignments match this tab."} /> : <div className="inbox-grid">{filtered.map((detail) => { const assignment = detail.assignments.find((item) => item.showroomId === showroom.id)!; return <Link className="request-card" href={`/showroom/requests/${detail.request.id}`} key={assignment.id}><JewelryVisual dataUrl={detail.request.photoDataUrl} tone={detail.request.photoTone} compact alt={`${detail.request.category} reference`} /><div><div className="row row--between"><StatusPill value={assignment.status} /><span className="muted" style={{ fontSize: ".68rem" }}>{formatDate(detail.request.createdAt)}</span></div><h3>{detail.request.category}</h3><p><MapPin size={12} /> {detail.request.area}</p><p><Clock3 size={12} /> Reply requested within 6 hours</p><strong style={{ display: "block", marginTop: 8, fontSize: ".78rem" }}>{detail.request.budgetLabel}</strong></div></Link>; })}</div>}</>;
}
