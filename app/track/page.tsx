"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MarketingShell } from "@/src/components/layouts/marketing";
import { Button, Field } from "@/src/components/ui";

export default function TrackLookupPage() {
  const router = useRouter();
  const [code, setCode] = useState("JF-7K3P9QXM");
  const [error, setError] = useState("");
  function submit(event: React.FormEvent) { event.preventDefault(); const value = code.trim(); if (value.length < 5) { setError("Enter a valid request code."); return; } router.push(`/t/${encodeURIComponent(value)}`); }
  return <MarketingShell><section className="page-hero"><div className="narrow"><span className="eyebrow">Request tracking</span><h1>See where your search stands.</h1><p>Enter your request code. Production recovery would also verify your phone with an OTP.</p></div></section><section className="section section--tight"><div className="narrow"><form className="card card__body" onSubmit={submit}><Field label="Request code" error={error} hint="Try the seeded demo code JF-7K3P9QXM"><div className="row"><input className="input" value={code} onChange={(event) => { setCode(event.target.value.toUpperCase()); setError(""); }} placeholder="JF-XXXXXXXX" /><Button type="submit"><Search size={17} />Track</Button></div></Field><div className="demo-note" style={{ marginTop: 18 }}>You can also open any seeded tracking link from the Demo Guide.</div></form></div></section></MarketingShell>;
}
