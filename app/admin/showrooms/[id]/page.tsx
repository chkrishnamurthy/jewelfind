"use client";

import { ArrowLeft, Clock3, Edit3, MapPin, MessageCircle, PauseCircle, PlayCircle, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, ErrorState, LinkButton, LoadingState, MetricCard, PageHeader, StatusPill } from "@/src/components/ui";
import { useToast } from "@/src/components/ui/toast";
import { useShowroom, useShowroomAssignments, useToggleShowroom } from "@/src/features/hooks";
import { formatDate } from "@/src/utils/format";

export default function ShowroomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const query = useShowroom(id);
  const assignments = useShowroomAssignments(id);
  const toggle = useToggleShowroom();
  const toast = useToast();
  if (query.isLoading) return <LoadingState rows={5} />;
  if (query.error || !query.data) return <ErrorState message={query.error?.message ?? "Showroom not found."} onRetry={() => query.refetch()} />;
  const showroom = query.data;
  return <><Link className="button button--ghost" href="/admin/showrooms" style={{ paddingLeft: 0 }}><ArrowLeft size={16} />Back to showrooms</Link><PageHeader eyebrow={showroom.area} title={showroom.name} description={showroom.address} action={<div className="row"><LinkButton href={`/admin/showrooms/${id}/edit`} tone="secondary"><Edit3 size={15} />Edit</LinkButton><Button tone={showroom.active ? "danger" : "secondary"} busy={toggle.isPending} onClick={async () => { await toggle.mutateAsync(id); toast.success(showroom.active ? "Showroom paused" : "Showroom reactivated"); }}>{showroom.active ? <PauseCircle size={16} /> : <PlayCircle size={16} />}{showroom.active ? "Pause" : "Reactivate"}</Button></div>} /><div className="metrics-grid"><MetricCard label="Response rate" value={`${showroom.responseRate}%`} hint="Across demo assignments" /><MetricCard label="Average reply" value={`${showroom.averageReplyMinutes || "—"}m`} hint="After message sent" /><MetricCard label="Rating" value={showroom.rating || "New"} hint="Demo shopper feedback" /><MetricCard label="Current status" value={showroom.active ? "Active" : "Paused"} hint="Assignment eligibility" tone="dark" /></div><div className="detail-grid"><section className="card"><div className="card__header"><h3>Recent assignments</h3><Clock3 size={18} /></div><div className="card__body">{assignments.isLoading ? <LoadingState rows={3} /> : assignments.data?.slice(0, 8).map((detail) => { const assignment = detail.assignments.find((item) => item.showroomId === id); return <Link className="assignment-item" href={`/admin/requests/${detail.request.id}`} key={detail.request.id}><span className="showroom-avatar" style={{ background: "var(--gold)" }}>{detail.request.category[0]}</span><div><h4>{detail.request.code} · {detail.request.category}</h4><p>{detail.request.area} · {formatDate(detail.request.createdAt)}</p></div><StatusPill value={assignment?.status ?? "sent"} /></Link>; })}</div></section><aside className="detail-stack"><section className="card card__body"><div className="row row--between"><span className="showroom-avatar" style={{ background: showroom.accent, width: 58, height: 58, fontSize: "1rem" }}>{showroom.initials}</span><StatusPill value={showroom.active ? "active" : "paused"} /></div><h3 style={{ marginTop: 24 }}>Partner profile</h3><div className="stack" style={{ gap: 12, fontSize: ".82rem" }}><div className="row"><MapPin size={16} color="#966713" />{showroom.address}</div><div className="row"><MessageCircle size={16} color="#966713" />{showroom.whatsapp}</div><div className="row"><Clock3 size={16} color="#966713" />{showroom.hours}</div><div className="row"><Star size={16} color="#966713" />{showroom.categories.join(", ")}</div></div></section></aside></div></>;
}
