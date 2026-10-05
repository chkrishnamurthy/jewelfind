import { SearchX } from "lucide-react";
import { MarketingShell } from "@/src/components/layouts/marketing";
import { LinkButton } from "@/src/components/ui";

export default function NotFound() { return <MarketingShell><section className="section"><div className="narrow state-card"><span className="state-card__icon"><SearchX /></span><span className="eyebrow">404</span><h1 style={{ fontSize: "3.6rem" }}>This page is not in the collection.</h1><p>Return home or track an existing jewellery request.</p><div className="row"><LinkButton href="/">Go home</LinkButton><LinkButton href="/track" tone="secondary">Track request</LinkButton></div></div></section></MarketingShell>; }
