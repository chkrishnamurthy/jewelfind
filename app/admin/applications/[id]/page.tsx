"use client";

import { ArrowLeft, Building2, CheckCircle2, HelpCircle, MapPin, Phone, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, ErrorState, LoadingState, PageHeader, StatusPill } from "@/src/components/ui";
import { useToast } from "@/src/components/ui/toast";
import type { ApplicationStatus } from "@/src/domain/types";
import { useApplication, useUpdateApplication } from "@/src/features/hooks";
import { formatDate } from "@/src/utils/format";

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const query = useApplication(id);
  const update = useUpdateApplication(id);
  const toast = useToast();
  if (query.isLoading) return <LoadingState />;
  if (query.error || !query.data) return <ErrorState message={query.error?.message ?? "Application not found."} />;
  const item = query.data;
  async function change(status: ApplicationStatus) { await update.mutateAsync(status); toast.success("Application updated", `Status changed to ${status.replaceAll("_", " ")}.`); }
  return <><Link className="button button--ghost" href="/admin/applications" style={{ paddingLeft: 0 }}><ArrowLeft size={16} />Back to applications</Link><PageHeader eyebrow={`Submitted ${formatDate(item.createdAt)}`} title={item.businessName} description={`Application from ${item.contactName}`} action={<StatusPill value={item.status} />} /><div className="detail-grid"><section className="card card__body"><span className="showroom-avatar" style={{ width: 64, height: 64, background: "#8b6a20", fontSize: "1rem" }}><Building2 /></span><h2 style={{ fontSize: "2.3rem", margin: "24px 0 8px" }}>{item.businessName}</h2><div className="stack" style={{ gap: 14 }}><div className="row"><MapPin color="#966713" size={18} />{item.area}</div><div className="row"><Phone color="#966713" size={18} />{item.phone}</div><div><span className="muted" style={{ fontSize: ".75rem" }}>Categories</span><p>{item.categories.join(", ")}</p></div>{item.note && <div><span className="muted" style={{ fontSize: ".75rem" }}>Applicant note</span><p>{item.note}</p></div>}</div></section><aside className="card"><div className="card__header"><h3>Review decision</h3></div><div className="card__body stack"><p className="muted" style={{ fontSize: ".8rem" }}>These actions update mock data only. Approving does not yet create a showroom profile.</p><Button busy={update.isPending} onClick={() => change("approved")}><CheckCircle2 size={16} />Approve</Button><Button tone="secondary" busy={update.isPending} onClick={() => change("needs_info")}><HelpCircle size={16} />Request information</Button><Button tone="danger" busy={update.isPending} onClick={() => change("rejected")}><XCircle size={16} />Reject</Button></div></aside></div></>;
}
