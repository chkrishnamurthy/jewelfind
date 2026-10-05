import { CheckCircle2 } from "lucide-react";
import { MarketingShell } from "@/src/components/layouts/marketing";
import { LinkButton } from "@/src/components/ui";

export default function ApplicationSuccessPage() {
  return <MarketingShell><section className="section"><div className="narrow"><div className="card success-panel"><span className="success-mark"><CheckCircle2 size={34} /></span><span className="eyebrow">Application saved</span><h1>Thanks for your interest.</h1><p className="lead">Your demo application is now visible in the admin review queue. In a real launch, the JewelFind team would contact you after review.</p><div className="row" style={{ justifyContent: "center", marginTop: 26 }}><LinkButton href="/admin/applications" tone="secondary">View in admin demo</LinkButton><LinkButton href="/">Return home</LinkButton></div></div></div></section></MarketingShell>;
}
