"use client";

import { Activity } from "lucide-react";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/src/components/ui";
import { useActivity } from "@/src/features/hooks";
import { formatDate } from "@/src/utils/format";

export default function ActivityPage() { const query = useActivity(); return <><PageHeader eyebrow="Audit trail" title="Operational activity" description="A chronological view of demo actions across requests and partners." />{query.isLoading ? <LoadingState rows={7} /> : query.error ? <ErrorState message={query.error.message} onRetry={() => query.refetch()} /> : !query.data?.length ? <EmptyState title="No activity yet" message="Actions from all interfaces will appear here." /> : <section className="card"><div className="card__body timeline">{query.data.map((event) => <div className="timeline-item" key={event.id}><strong className="row"><Activity size={14} />{event.event}</strong><span>{event.detail}<br />{event.actor} · {formatDate(event.createdAt)}</span></div>)}</div></section>}</>; }
