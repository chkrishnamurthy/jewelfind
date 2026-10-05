"use client";

import { Check, CheckCircle2, Clock3, Gem, MapPin, MessageCircle, SearchX, ShieldCheck, Store } from "lucide-react";
import { useParams } from "next/navigation";
import { Brand } from "@/src/components/layouts/marketing";
import { JewelryVisual } from "@/src/components/domain/jewelry-visual";
import { Button, ErrorState, LinkButton, LoadingState, StatusPill } from "@/src/components/ui";
import { useFeedback, useTracking } from "@/src/features/hooks";
import { useToast } from "@/src/components/ui/toast";
import { formatCurrency, formatDate } from "@/src/utils/format";

const copy = {
  submitted: ["Request received", "Your design is safely in the queue. The team will review it before contacting showrooms."],
  checking: ["Showrooms are checking", "Selected partners are reviewing your reference and requirements."],
  similar_offered: ["A similar design is available", "We found a close alternative for you to review."],
  matched: ["A match is ready", "A showroom has confirmed a close match to your reference."],
  not_found: ["No match this time", "The checked showrooms could not confirm this design, but you can start another search."],
  closed: ["Request closed", "This search is complete. Your result remains visible for reference."],
  cancelled: ["Request cancelled", "This request is no longer being checked."],
} as const;

export default function TrackingPage() {
  const { token } = useParams<{ token: string }>();
  const query = useTracking(decodeURIComponent(token));
  const toast = useToast();
  const feedback = useFeedback(query.data?.request.id ?? "");
  if (query.isLoading) return <main className="tracking-shell"><div className="container tracking-top"><Brand /></div><div className="tracking-card"><LoadingState rows={4} /></div></main>;
  if (query.error || !query.data) return <main className="tracking-shell"><div className="container tracking-top"><Brand /><LinkButton href="/track" tone="secondary">Try another code</LinkButton></div><div className="tracking-card"><ErrorState title="Tracking link unavailable" message={query.error?.message ?? "This request does not exist."} onRetry={() => query.refetch()} /></div></main>;
  const { request, assignments, matches } = query.data;
  const result = matches[0];
  const replied = assignments.filter((item) => item.latestReply).length;
  const [title, description] = copy[request.status];
  const step = request.status === "submitted" ? 0 : ["checking"].includes(request.status) ? 1 : 2;
  const Icon = request.status === "not_found" ? SearchX : result ? CheckCircle2 : Clock3;

  async function shareOutcome(outcome: "contacted" | "visited" | "not_interested") {
    await feedback.mutateAsync(outcome);
    toast.success("Thanks for the update", "Your demo feedback is now visible to the admin.");
  }

  return <main className="tracking-shell"><div className="container tracking-top"><Brand /><div className="row"><span className="demo-chip">Frontend demo</span><LinkButton href="/track" tone="secondary">Track another</LinkButton></div></div><article className="card tracking-card"><div className="tracking-status"><span className="tracking-status__icon"><Icon /></span><StatusPill value={request.status} /><h1 style={{ marginTop: 14 }}>{title}</h1><p className="lead" style={{ maxWidth: 570, margin: "0 auto" }}>{description}</p></div><div className="tracking-timeline">{["Request received", "Showrooms checking", "Result ready"].map((label, index) => <div className={`tracking-step ${index <= step ? "tracking-step--done" : ""}`} key={label}>{label}</div>)}</div><div className="tracking-card__body stack">
    <div className="row row--between wrap"><div><span className="muted" style={{ fontSize: ".72rem" }}>Request code</span><strong style={{ display: "block" }}>{request.code}</strong></div><div><span className="muted" style={{ fontSize: ".72rem" }}>Submitted</span><strong style={{ display: "block" }}>{formatDate(request.createdAt)}</strong></div><div><span className="muted" style={{ fontSize: ".72rem" }}>Progress</span><strong style={{ display: "block" }}>{assignments.length} contacted · {replied} replied</strong></div></div>
    {result && <section className="result-card"><JewelryVisual tone={result.reply.photoTone ?? "emerald"} alt={`Available design at ${result.showroom.name}`} /><div><span className="eyebrow">{result.kind === "exact" ? "Exact result" : "Similar option"}</span><h3>{result.showroom.name}</h3><p className="muted"><MapPin size={14} style={{ verticalAlign: "middle" }} /> {result.showroom.address}</p><div className="info-grid" style={{ margin: "17px 0" }}><div className="info-item"><span>Indicative price</span><strong>{formatCurrency(result.reply.price)}</strong></div><div className="info-item"><span>Details</span><strong>{result.reply.weight ?? "Confirm in store"} · {result.reply.purity ?? "—"}</strong></div></div>{result.reply.note && <p style={{ fontSize: ".82rem" }}>{result.reply.note}</p>}<div className="row wrap"><Button onClick={() => toast.success("Demo action", "A production app would open WhatsApp with the showroom number.")}><MessageCircle size={16} />WhatsApp showroom</Button><Button tone="secondary" onClick={() => toast.success("Demo action", "A production app would open the showroom location.")}><MapPin size={16} />Open in Maps</Button></div></div></section>}
    {request.status === "checking" && <div className="card__body" style={{ background: "#fffaf0", border: "1px solid var(--border)", borderRadius: 14 }}><div className="row"><Store color="#966713" /><div><strong>Partners are reviewing the request</strong><p className="muted" style={{ margin: 0, fontSize: ".8rem" }}>Only aggregate progress appears here; unreleased showroom identities stay private.</p></div></div></div>}
    {request.status === "submitted" && <div className="card__body" style={{ background: "#fffaf0", border: "1px solid var(--border)", borderRadius: 14 }}><div className="row"><ShieldCheck color="#966713" /><div><strong>Waiting for admin review</strong><p className="muted" style={{ margin: 0, fontSize: ".8rem" }}>Open this request in the admin demo and assign showrooms to continue.</p></div></div></div>}
    {request.status === "not_found" && <div className="state-card" style={{ minHeight: 190 }}><SearchX /><h3 style={{ marginTop: 14 }}>Nothing suitable was confirmed</h3><p>Try another reference or adjust the area and budget in a new request.</p><LinkButton href="/request">Start another request</LinkButton></div>}
    {result && <section style={{ paddingTop: 10 }}><h3>Did this result help?</h3><p className="muted" style={{ fontSize: ".82rem" }}>Your answer helps the future service measure real value for shoppers.</p><div className="feedback-row"><Button tone={query.data.feedback?.outcome === "contacted" ? "primary" : "secondary"} busy={feedback.isPending} onClick={() => shareOutcome("contacted")}><MessageCircle size={15} />Contacted</Button><Button tone={query.data.feedback?.outcome === "visited" ? "primary" : "secondary"} busy={feedback.isPending} onClick={() => shareOutcome("visited")}><Store size={15} />Visited</Button><Button tone={query.data.feedback?.outcome === "not_interested" ? "primary" : "ghost"} busy={feedback.isPending} onClick={() => shareOutcome("not_interested")}><Check size={15} />Not for me</Button></div></section>}
    <p className="demo-note"><Gem size={15} style={{ verticalAlign: "middle", marginRight: 7 }} />This is a shared mock flow. Admin and showroom actions in this browser update this tracking view.</p>
  </div></article></main>;
}
