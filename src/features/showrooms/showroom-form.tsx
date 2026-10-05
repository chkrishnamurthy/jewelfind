"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Field } from "@/src/components/ui";
import { useToast } from "@/src/components/ui/toast";
import { AREAS, CATEGORIES, type Showroom } from "@/src/domain/types";
import { useSaveShowroom } from "@/src/features/hooks";

const schema = z.object({ name: z.string().trim().min(2), area: z.enum(AREAS), address: z.string().trim().min(8), phone: z.string().regex(/^\+91\d{10}$/, "Use +91 followed by 10 digits."), whatsapp: z.string().regex(/^\+91\d{10}$/, "Use +91 followed by 10 digits."), hours: z.string().min(3), categories: z.array(z.enum(CATEGORIES)).min(1, "Choose at least one category.") });
type Values = z.infer<typeof schema>;

export function ShowroomForm({ showroom }: { showroom?: Showroom }) {
  const save = useSaveShowroom();
  const router = useRouter();
  const toast = useToast();
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: showroom ? { name: showroom.name, area: showroom.area, address: showroom.address, phone: showroom.phone, whatsapp: showroom.whatsapp, hours: showroom.hours, categories: showroom.categories } : { area: "Banjara Hills", phone: "+91", whatsapp: "+91", hours: "10:00 AM – 8:00 PM", categories: [] } });
  const submit = handleSubmit(async (values) => { try { const result = await save.mutateAsync({ id: showroom?.id, ...values }); toast.success(showroom ? "Showroom updated" : "Showroom created"); router.push(`/admin/showrooms/${result.id}`); } catch (error) { toast.error("Could not save showroom", error instanceof Error ? error.message : undefined); } });
  return <form className="card card__body form-grid" onSubmit={submit}><Field label="Showroom name" error={errors.name?.message} required><input className="input" {...register("name")} /></Field><Field label="Area" error={errors.area?.message} required><select className="select" {...register("area")}>{AREAS.map((area) => <option key={area}>{area}</option>)}</select></Field><div className="span-2"><Field label="Address" error={errors.address?.message} required><textarea className="textarea" {...register("address")} /></Field></div><Field label="Phone" error={errors.phone?.message} required><input className="input" {...register("phone")} /></Field><Field label="WhatsApp" error={errors.whatsapp?.message} required><input className="input" {...register("whatsapp")} /></Field><div className="span-2"><Field label="Opening hours" error={errors.hours?.message}><input className="input" {...register("hours")} /></Field></div><div className="span-2"><Field label="Categories" error={errors.categories?.message} required><div className="choice-grid">{CATEGORIES.map((category) => <label className="choice" key={category}><input type="checkbox" value={category} {...register("categories")} /><span>{category}</span></label>)}</div></Field></div><div className="span-2 row"><Button type="submit" busy={save.isPending}>{showroom ? "Save changes" : "Create showroom"}</Button><Button tone="ghost" type="button" onClick={() => { if (!isDirty || confirm("Discard unsaved changes?")) router.back(); }}>Cancel</Button></div></form>;
}
