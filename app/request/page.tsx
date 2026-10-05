"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Camera, Check, ChevronLeft, ChevronRight, FileImage, ShieldCheck, Trash2, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Brand } from "@/src/components/layouts/marketing";
import { JewelryVisual } from "@/src/components/domain/jewelry-visual";
import { Button, Field } from "@/src/components/ui";
import { AREAS, CATEGORIES } from "@/src/domain/types";
import { budgetOptions, requestFormSchema, type RequestFormValues } from "@/src/validation/request";

const DRAFT_KEY = "jewelfind.request.draft";

async function compressForDemo(file: File): Promise<string | undefined> {
  if (file.type === "image/heic" || file.type === "image/heif") return undefined;
  const source = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Image could not be read")); image.src = source; });
    const scale = Math.min(1, 1000 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.72);
  } finally {
    URL.revokeObjectURL(source);
  }
}

export default function RequestPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [photoDataUrl, setPhotoDataUrl] = useState<string>();
  const [fileName, setFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const { register, handleSubmit, trigger, control, getValues, formState: { errors } } = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    mode: "onBlur",
    defaultValues: { area: "Banjara Hills", category: "Necklace", budgetLabel: "", notes: "", privacyConsent: false as never, whatsappConsent: false as never, photoConsent: false as never },
  });
  const draftValues = useWatch({ control });

  useEffect(() => {
    const safePhoto = photoDataUrl && photoDataUrl.length < 1_800_000 ? photoDataUrl : undefined;
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ values: draftValues, photoDataUrl: safePhoto, fileName }));
  }, [draftValues, photoDataUrl, fileName]);

  async function chooseFile(file?: File) {
    setUploadError("");
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
    if (!allowed.includes(file.type) && !/\.(heic|heif)$/i.test(file.name)) { setUploadError("Choose a JPEG, PNG, WebP or HEIC image."); return; }
    if (file.size > 10 * 1024 * 1024) { setUploadError("The image must be 10 MB or smaller."); return; }
    setFileName(file.name);
    setUploadProgress(12);
    const interval = window.setInterval(() => setUploadProgress((value) => Math.min(value + 17, 88)), 90);
    try {
      const result = await compressForDemo(file);
      setPhotoDataUrl(result);
      setUploadProgress(100);
    } catch {
      setUploadError("We could not preview this image. Try another file.");
      setUploadProgress(0);
    } finally {
      window.clearInterval(interval);
    }
  }

  async function next() {
    if (step === 0 && !fileName) { setUploadError("Add a reference image to continue."); return; }
    const fields: Array<Array<keyof RequestFormValues>> = [[], ["area", "category", "budgetLabel", "notes"], ["customerName", "phone", "privacyConsent", "whatsappConsent", "photoConsent"]];
    if (step > 0 && !(await trigger(fields[step]))) return;
    setStep((value) => Math.min(3, value + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const submit = handleSubmit((values) => {
    const budget = budgetOptions.find((item) => item.label === values.budgetLabel);
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ values, photoDataUrl, fileName, budgetMin: budget?.min, budgetMax: budget?.max }));
    router.push("/request/verify");
  });

  const values = getValues();
  return <main className="wizard-shell"><div className="wizard"><div className="wizard-top"><Brand /><Link className="button button--ghost" href="/"><ArrowLeft size={16} />Exit</Link></div><div className="progress-steps" aria-label={`Step ${step + 1} of 4`}>{[0,1,2,3].map((index) => <span className={`progress-step ${index <= step ? "progress-step--active" : ""}`} key={index} />)}</div><form className="wizard-card" onSubmit={submit} noValidate><div className="wizard-card__header"><span className="eyebrow">Step {step + 1} of 4</span><h1>{["Show us the design", "Tell us what matters", "Where should we update you?", "Review your request"][step]}</h1><p>{["A clear screenshot or photo works best.", "This helps us choose the most relevant showrooms.", "Your number is used only for this request in the planned service.", "Make sure everything looks right before the demo verification step."][step]}</p></div><div className="wizard-card__body">
        {step === 0 && <div><input ref={inputRef} hidden type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" onChange={(event) => chooseFile(event.target.files?.[0])} />{fileName ? <div className="upload-preview"><JewelryVisual dataUrl={photoDataUrl} tone="amber" alt={`Preview of ${fileName}`} /><div className="row row--between" style={{ marginTop: 12 }}><div className="row"><FileImage size={18} /><div><strong style={{ display: "block", fontSize: ".82rem" }}>{fileName}</strong><span className="muted" style={{ fontSize: ".72rem" }}>{photoDataUrl ? "Optimised for this browser demo" : "HEIC accepted · illustrative preview used"}</span></div></div><button className="icon-button" type="button" aria-label="Remove photo" onClick={() => { setFileName(""); setPhotoDataUrl(undefined); setUploadProgress(0); }}><Trash2 size={17} /></button></div>{uploadProgress > 0 && <div className="upload-progress" aria-label={`Upload ${uploadProgress}%`}><span style={{ width: `${uploadProgress}%` }} /></div>}</div> : <button className="upload-zone" type="button" onClick={() => inputRef.current?.click()}><div><span className="upload-zone__icon"><UploadCloud /></span><h3>Drop a photo here, or browse</h3><p>JPEG, PNG, WebP or HEIC · up to 10 MB</p><span className="button button--secondary"><Camera size={17} />Choose a photo</span></div></button>}{uploadError && <p className="field__error" role="alert" style={{ marginTop: 10 }}>{uploadError}</p>}<p className="demo-note" style={{ marginTop: 16 }}><ShieldCheck size={15} style={{ verticalAlign: "middle", marginRight: 7 }} />Demo files stay in this browser. No image is uploaded to a server.</p></div>}
        {step === 1 && <div className="form-grid"><Field label="Jewellery type" error={errors.category?.message} required><select className="select" {...register("category")}>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></Field><Field label="Preferred area" error={errors.area?.message} required><select className="select" {...register("area")}>{AREAS.map((area) => <option key={area}>{area}</option>)}</select></Field><div className="span-2"><Field label="Comfortable budget" error={errors.budgetLabel?.message} required><div className="choice-grid">{budgetOptions.map((option) => <label className="choice" key={option.label}><input type="radio" value={option.label} {...register("budgetLabel")} /><span>{option.label}</span></label>)}</div></Field></div><div className="span-2"><Field label="Anything a showroom should know?" error={errors.notes?.message} hint="Optional · up to 500 characters"><textarea className="textarea" {...register("notes")} placeholder="For example: flexible on stones, need it before a particular date…" /></Field></div></div>}
        {step === 2 && <div className="stack"><div className="form-grid"><Field label="Your name" error={errors.customerName?.message} required><input className="input" autoComplete="name" {...register("customerName")} placeholder="Full name" /></Field><Field label="Mobile number" error={errors.phone?.message} hint="We will simulate verification next." required><input className="input" inputMode="tel" autoComplete="tel" {...register("phone")} placeholder="9876543210" /></Field></div><hr className="divider" /><label className="check-row"><input type="checkbox" {...register("privacyConsent")} /><span>I agree to the <Link href="/privacy" style={{ textDecoration: "underline" }}>privacy notice</Link> and understand how request data is used.</span></label>{errors.privacyConsent && <span className="field__error">{errors.privacyConsent.message}</span>}<label className="check-row"><input type="checkbox" {...register("whatsappConsent")} /><span>I agree to receive request updates on WhatsApp in the planned service.</span></label>{errors.whatsappConsent && <span className="field__error">{errors.whatsappConsent.message}</span>}<label className="check-row"><input type="checkbox" {...register("photoConsent")} /><span>I agree to share this reference photo and non-sensitive requirements with selected showrooms.</span></label>{errors.photoConsent && <span className="field__error">{errors.photoConsent.message}</span>}</div>}
        {step === 3 && <div className="stack"><div className="row" style={{ alignItems: "stretch" }}><JewelryVisual dataUrl={photoDataUrl} tone="amber" compact /><div><span className="muted" style={{ fontSize: ".75rem" }}>Reference</span><strong style={{ display: "block" }}>{fileName}</strong></div></div><div className="review-list"><div className="review-row"><span>Looking for</span><strong>{values.category}</strong><Button tone="ghost" type="button" onClick={() => setStep(1)}>Edit</Button></div><div className="review-row"><span>Area</span><strong>{values.area}</strong><Button tone="ghost" type="button" onClick={() => setStep(1)}>Edit</Button></div><div className="review-row"><span>Budget</span><strong>{values.budgetLabel}</strong><Button tone="ghost" type="button" onClick={() => setStep(1)}>Edit</Button></div><div className="review-row"><span>Contact</span><strong>{values.customerName} · {values.phone}</strong><Button tone="ghost" type="button" onClick={() => setStep(2)}>Edit</Button></div></div><p className="demo-note"><Check size={15} style={{ verticalAlign: "middle", marginRight: 7 }} />Submitting continues to a simulated phone-verification screen. No message is sent.</p></div>}
      </div><div className="wizard-card__actions"><Button tone="ghost" type="button" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}><ChevronLeft size={17} />Back</Button>{step < 3 ? <Button type="button" onClick={next}>Continue<ChevronRight size={17} /></Button> : <Button type="submit">Verify & submit<ChevronRight size={17} /></Button>}</div></form></div></main>;
}
