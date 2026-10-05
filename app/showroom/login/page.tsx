"use client";

import { LockKeyhole, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Brand } from "@/src/components/layouts/marketing";
import { Button, Field } from "@/src/components/ui";
import { useRepositories } from "@/src/providers/repository-provider";

export default function ShowroomLoginPage() {
  const router = useRouter(); const { auth } = useRepositories(); const [phone, setPhone] = useState("9900001000"); const [code, setCode] = useState("246810"); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function login(event: React.FormEvent) { event.preventDefault(); setBusy(true); setError(""); try { await auth.loginShowroom(phone, code); router.replace("/showroom"); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not sign in."); } finally { setBusy(false); } }
  return <main className="auth-shell"><section className="auth-art"><Brand light /><div><span className="eyebrow" style={{ color: "var(--gold-light)" }}>Partner workspace</span><h1>Respond from the showroom floor.</h1><p>See assigned references, answer in a few taps and keep shoppers informed without sharing their personal details.</p></div><div className="row" style={{ color: "#bcb3a7" }}><Store size={18} />Mobile-first showroom demo</div></section><section className="auth-panel"><div className="auth-form"><Brand /><h2>Showroom sign in</h2><p>Use the demo number and code to open Aarna Fine Jewels.</p><form onSubmit={login}><Field label="Mobile number"><input className="input" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} /></Field><Field label="6-digit code"><input className="input" inputMode="numeric" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} /></Field>{error && <p className="field__error">{error}</p>}<Button busy={busy} type="submit">Open showroom inbox</Button><div className="demo-note"><LockKeyhole size={15} style={{ verticalAlign: "middle", marginRight: 7 }} />Demo code: <strong>246810</strong></div></form></div></section></main>;
}
