"use client";

import { CheckCircle2, Copy, MessageCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { Brand } from "@/src/components/layouts/marketing";
import { Button, ErrorState, LinkButton, LoadingState } from "@/src/components/ui";
import { useTracking } from "@/src/features/hooks";
import { useToast } from "@/src/components/ui/toast";

export default function RequestSuccessPage() {
  const { code } = useParams<{ code: string }>();
  const query = useTracking(code);
  const toast = useToast();
  if (query.isLoading) return <main className="wizard-shell"><div className="wizard"><LoadingState /></div></main>;
  if (query.error || !query.data) return <main className="wizard-shell"><div className="wizard"><ErrorState message={query.error?.message ?? "Request not found."} onRetry={() => query.refetch()} /></div></main>;
  const request = query.data.request;
  return <main className="wizard-shell"><div className="wizard" style={{ maxWidth: 720 }}><div className="wizard-top"><Brand /></div><div className="card success-panel"><span className="success-mark"><CheckCircle2 size={34} /></span><span className="eyebrow">Request created</span><h1>We’ve got your design.</h1><p className="lead">Your request is ready for the admin demo. Assign showrooms there, then return to tracking to see the flow update.</p><span className="request-code">{request.code}</span><div className="row wrap" style={{ justifyContent: "center" }}><Button tone="secondary" onClick={() => { navigator.clipboard.writeText(request.code); toast.success("Request code copied"); }}><Copy size={16} />Copy code</Button><LinkButton href={`/t/${request.trackingToken}`}>Track request</LinkButton></div><div className="demo-note" style={{ marginTop: 28 }}><MessageCircle size={15} style={{ verticalAlign: "middle", marginRight: 7 }} />A simulated confirmation is visible in the admin message center. No WhatsApp was sent.</div></div></div></main>;
}
