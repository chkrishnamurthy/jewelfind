"use client";

import { ArrowLeft, CheckCircle2, Gem, MapPin, Send } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { JewelryVisual } from "@/src/components/domain/jewelry-visual";
import { Button, ErrorState, Field, LoadingState, PageHeader, StatusPill } from "@/src/components/ui";
import { useToast } from "@/src/components/ui/toast";
import type { ReplyKind } from "@/src/domain/types";
import { useReply, useRequest } from "@/src/features/hooks";
import { useRepositories } from "@/src/providers/repository-provider";

export default function ShowroomRequestPage() {
  const { id } = useParams<{ id: string }>(); const router = useRouter(); const { auth } = useRepositories(); const showroom = auth.getShowroomSession(); const query = useRequest(id); const mutation = useReply(id); const toast = useToast(); const [kind, setKind] = useState<ReplyKind>("has"); const [note, setNote] = useState(""); const [price, setPrice] = useState(""); const [weight, setWeight] = useState("");
  if (query.isLoading) return <LoadingState rows={4} />;
  if (query.error || !query.data || !showroom) return <ErrorState message={query.error?.message ?? "Request unavailable."} />;
  const assignment = query.data.assignments.find((item) => item.showroomId === showroom.id);
  if (!assignment) return <ErrorState title="Request not assigned" message="This request is not available to the signed-in showroom." />;
  async function submit() { await mutation.mutateAsync({ assignmentId: assignment!.id, kind, note: note || undefined, price: price ? Number(price) : undefined, weight: weight || undefined, purity: kind === "no" ? undefined : "22K", source: "showroom" }); toast.success("Reply sent", "The response now appears in the admin workspace."); router.push("/showroom"); }
  return <><Link className="button button--ghost" href="/showroom" style={{ paddingLeft: 0 }}><ArrowLeft size={16} />Back to inbox</Link><PageHeader eyebrow={query.data.request.code} title={`${query.data.request.category} request`} description={`${query.data.request.budgetLabel} · ${query.data.request.area}`} action={<StatusPill value={assignment.status} />} /><div className="detail-grid"><section className="card"><JewelryVisual dataUrl={query.data.request.photoDataUrl} tone={query.data.request.photoTone} alt="Shopper reference" /><div className="card__body"><div className="row"><MapPin size={16} color="#966713" /><strong>{query.data.request.area}</strong></div>{query.data.request.notes && <p className="lead" style={{ marginTop: 18, fontSize: ".9rem" }}>{query.data.request.notes}</p>}<div className="demo-note"><Gem size={15} style={{ verticalAlign: "middle", marginRight: 7 }} />Shopper name and phone are intentionally hidden from showrooms.</div></div></section><aside className="card"><div className="card__header"><h3>Your response</h3><Send size={18} /></div><div className="card__body stack"><div className="choice-grid">{(["has", "similar", "no"] as ReplyKind[]).map((value) => <label className="choice" key={value}><input type="radio" checked={kind === value} onChange={() => setKind(value)} /><span>{value === "has" ? "Has it" : value === "similar" ? "Similar" : "Not available"}</span></label>)}</div>{kind !== "no" && <div className="form-grid"><Field label="Indicative price"><input className="input" inputMode="numeric" value={price} onChange={(event) => setPrice(event.target.value.replace(/\D/g, ""))} placeholder="₹" /></Field><Field label="Approx. weight"><input className="input" value={weight} onChange={(event) => setWeight(event.target.value)} placeholder="e.g. 12.6 g" /></Field></div>}<Field label="Note"><textarea className="textarea" value={note} onChange={(event) => setNote(event.target.value)} placeholder={kind === "no" ? "Optional reason" : "Describe how close the available design is"} /></Field><Button busy={mutation.isPending} onClick={submit}><CheckCircle2 size={16} />Submit response</Button></div></aside></div></>;
}
