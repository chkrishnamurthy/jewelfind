"use client";

import { MapPin, Plus, Search, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState, ErrorState, LinkButton, LoadingState, PageHeader, StatusPill } from "@/src/components/ui";
import { AREAS, type Area } from "@/src/domain/types";
import { useShowrooms } from "@/src/features/hooks";

export default function AdminShowroomsPage() {
  const [search, setSearch] = useState("");
  const [area, setArea] = useState<Area | "all">("all");
  const [active, setActive] = useState<"all" | "active" | "paused">("all");
  const query = useShowrooms({ search, area, active });
  return <><PageHeader eyebrow="Partner network" title="Showrooms" description="Manage partner profiles, coverage and availability." action={<LinkButton href="/admin/showrooms/new"><Plus size={16} />Add showroom</LinkButton>} /><div className="data-toolbar"><div className="row" style={{ flex: "1 1 260px", position: "relative" }}><Search size={17} style={{ position: "absolute", left: 13, color: "var(--muted)" }} /><input className="input" style={{ paddingLeft: 39 }} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or area" /></div><select className="select" value={area} onChange={(event) => setArea(event.target.value as Area | "all")}><option value="all">All areas</option>{AREAS.map((item) => <option key={item}>{item}</option>)}</select><select className="select" value={active} onChange={(event) => setActive(event.target.value as typeof active)}><option value="all">All availability</option><option value="active">Active</option><option value="paused">Paused</option></select></div>{query.isLoading ? <LoadingState rows={5} /> : query.error ? <ErrorState message={query.error.message} onRetry={() => query.refetch()} /> : !query.data?.length ? <EmptyState title="No showrooms found" message="Try changing the current filters." /> : <section className="feature-grid">{query.data.map((showroom) => <Link className="feature-card" href={`/admin/showrooms/${showroom.id}`} key={showroom.id}><div className="row row--between"><span className="showroom-avatar" style={{ background: showroom.accent }}>{showroom.initials}</span><StatusPill value={showroom.active ? "active" : "paused"} /></div><h3 style={{ margin: "20px 0 7px" }}>{showroom.name}</h3><p><MapPin size={14} style={{ verticalAlign: "middle" }} /> {showroom.area}</p><div className="row wrap" style={{ fontSize: ".72rem", color: "var(--muted)" }}><span className="row"><Star size={13} fill="#b88a3b" color="#b88a3b" />{showroom.rating || "New"}</span><span>{showroom.responseRate}% response</span><span>{showroom.averageReplyMinutes || "—"}m avg.</span></div></Link>)}</section>}</>;
}
