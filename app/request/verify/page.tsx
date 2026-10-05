"use client";

import { ArrowLeft, LockKeyhole, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Brand } from "@/src/components/layouts/marketing";
import { Button } from "@/src/components/ui";
import { useCreateRequest } from "@/src/features/hooks";
import type { RequestFormValues } from "@/src/validation/request";

type Draft = { values: RequestFormValues; photoDataUrl?: string; fileName: string; budgetMin?: number; budgetMax?: number };
const DRAFT_KEY = "jewelfind.request.draft";

export default function VerifyRequestPage() {
  const router = useRouter();
  const create = useCreateRequest();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  function change(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((current) => current.map((item, position) => position === index ? digit : item));
    if (digit && index < 5) inputs.current[index + 1]?.focus();
  }

  function paste(value: string) {
    const pasted = value.replace(/\D/g, "").slice(0, 6).split("");
    if (pasted.length === 6) { setDigits(pasted); inputs.current[5]?.focus(); }
  }

  async function verify() {
    setError("");
    if (digits.join("") !== "246810") { setError("That code is not correct. Use the demo code shown below."); return; }
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) { setError("Your request draft has expired. Return to the form and try again."); return; }
    const draft: Draft = JSON.parse(raw);
    try {
      const phoneDigits = draft.values.phone.replace(/\D/g, "").slice(-10);
      const request = await create.mutateAsync({ customerName: draft.values.customerName, phone: `+91${phoneDigits}`, area: draft.values.area, category: draft.values.category, budgetLabel: draft.values.budgetLabel, budgetMin: draft.budgetMin, budgetMax: draft.budgetMax, notes: draft.values.notes, photoDataUrl: draft.photoDataUrl });
      window.sessionStorage.removeItem(DRAFT_KEY);
      router.replace(`/request/success/${request.code}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The demo request could not be created.");
    }
  }

  return <main className="wizard-shell"><div className="wizard" style={{ maxWidth: 650 }}><div className="wizard-top"><Brand /><Link className="button button--ghost" href="/request"><ArrowLeft size={16} />Back to request</Link></div><div className="wizard-card"><div className="wizard-card__header" style={{ textAlign: "center", paddingTop: 48 }}><span className="tracking-status__icon"><LockKeyhole /></span><span className="eyebrow">Demo verification</span><h1>Enter the 6-digit code</h1><p>In production this verifies that the mobile number belongs to you. No message is sent in this prototype.</p></div><div className="wizard-card__body"><div className="otp-boxes" onPaste={(event) => { event.preventDefault(); paste(event.clipboardData.getData("text")); }}>{digits.map((digit, index) => <input aria-label={`Digit ${index + 1}`} autoComplete={index === 0 ? "one-time-code" : "off"} inputMode="numeric" key={index} maxLength={1} ref={(element) => { inputs.current[index] = element; }} value={digit} onChange={(event) => change(index, event.target.value)} onKeyDown={(event) => { if (event.key === "Backspace" && !digit && index > 0) inputs.current[index - 1]?.focus(); }} />)}</div><div className="demo-note" style={{ textAlign: "center" }}><MessageCircle size={15} style={{ verticalAlign: "middle", marginRight: 7 }} />Demo code: <strong>246810</strong></div>{error && <p className="field__error" role="alert" style={{ textAlign: "center", marginTop: 16 }}>{error}</p>}<Button className="button--block" style={{ marginTop: 22 }} busy={create.isPending} onClick={verify}>Verify and create request</Button><button className="button button--ghost button--block" type="button" style={{ marginTop: 8 }} onClick={() => setDigits(["2","4","6","8","1","0"])}>Fill demo code</button></div></div></div></main>;
}
