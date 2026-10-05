"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BarChart3, CheckCircle2, Clock3, Store, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MarketingShell } from "@/src/components/layouts/marketing";
import { Button, Field } from "@/src/components/ui";
import { AREAS, CATEGORIES, type Area, type Category } from "@/src/domain/types";
import { useCreateApplication } from "@/src/features/hooks";

const schema = z.object({
  businessName: z.string().trim().min(2, "Enter the showroom name."),
  contactName: z.string().trim().min(2, "Enter a contact name."),
  phone: z.string().regex(/^(?:\+91|91)?[6-9]\d{9}$/, "Enter a valid Indian mobile number."),
  area: z.enum(AREAS),
  categories: z.array(z.enum(CATEGORIES)).min(1, "Choose at least one category."),
  note: z.string().max(300).optional(),
});
type FormData = z.infer<typeof schema>;

export default function ForShowroomsPage() {
  const router = useRouter();
  const create = useCreateApplication();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { categories: [], area: "Banjara Hills" } });
  const submit = handleSubmit(async (values) => {
    await create.mutateAsync({ ...values, area: values.area as Area, categories: values.categories as Category[] });
    router.push("/for-showrooms/success");
  });

  return <MarketingShell><section className="page-hero"><div className="container"><span className="eyebrow">For showroom partners</span><h1>Turn the right requests into meaningful visits.</h1><p>See clear design requirements, respond quickly and let interested shoppers contact you directly.</p></div></section><section className="section section--paper"><div className="container feature-grid"><article className="feature-card"><div className="feature-card__icon"><Users /></div><h3>Relevant enquiries</h3><p>Receive requests filtered for your area and the categories you actually stock.</p></article><article className="feature-card"><div className="feature-card__icon"><Clock3 /></div><h3>Simple responses</h3><p>Answer Has It, Similar or No without a lengthy catalogue or inventory integration.</p></article><article className="feature-card"><div className="feature-card__icon"><BarChart3 /></div><h3>Clear value</h3><p>Track response time, released matches and shopper-reported outcomes over time.</p></article></div></section><section className="section"><div className="container detail-grid"><div><span className="eyebrow">Join the pilot network</span><h2>Tell us about your showroom.</h2><p className="lead">This form stores a demo application only in your browser. Nothing is submitted externally.</p><div className="stack" style={{ marginTop: 32 }}>{["No setup fee in the pilot", "Shopper numbers stay private", "You control every availability response"].map((item) => <div className="row" key={item}><CheckCircle2 color="#28705c" size={20} /><strong>{item}</strong></div>)}</div></div><form className="card card__body form-grid" onSubmit={submit} noValidate><Field label="Showroom name" error={errors.businessName?.message} required><input className="input" {...register("businessName")} placeholder="e.g. Aarna Fine Jewels" /></Field><Field label="Contact person" error={errors.contactName?.message} required><input className="input" {...register("contactName")} placeholder="Full name" /></Field><Field label="Mobile number" error={errors.phone?.message} required><input className="input" inputMode="tel" {...register("phone")} placeholder="9876543210" /></Field><Field label="Primary area" error={errors.area?.message} required><select className="select" {...register("area")}>{AREAS.map((area) => <option key={area}>{area}</option>)}</select></Field><div className="span-2"><Field label="Categories" error={errors.categories?.message} required><div className="choice-grid">{CATEGORIES.map((category) => <label className="choice" key={category}><input type="checkbox" value={category} {...register("categories")} /><span><Store size={16} />{category}</span></label>)}</div></Field></div><div className="span-2"><Field label="Anything else?" error={errors.note?.message} hint="Optional · up to 300 characters"><textarea className="textarea" {...register("note")} placeholder="Tell us about your showroom and typical collection." /></Field></div>{create.error && <div className="legal-notice span-2">{create.error.message}</div>}<Button className="span-2" busy={create.isPending} type="submit">Submit demo application</Button></form></div></section></MarketingShell>;
}
