"use client";

import { useForm } from "react-hook-form";
import { Button, Field, PageHeader } from "@/src/components/ui";
import { useToast } from "@/src/components/ui/toast";
import { useSaveShowroom } from "@/src/features/hooks";
import { useRepositories } from "@/src/providers/repository-provider";

export default function ShowroomProfilePage() { const { auth } = useRepositories(); const showroom = auth.getShowroomSession()!; const save = useSaveShowroom(); const toast = useToast(); const { register, handleSubmit } = useForm({ defaultValues: { phone: showroom.phone, whatsapp: showroom.whatsapp, hours: showroom.hours, address: showroom.address } }); const submit = handleSubmit(async (values) => { await save.mutateAsync({ ...showroom, ...values }); toast.success("Profile updated"); }); return <><PageHeader eyebrow="Partner profile" title={showroom.name} description="Keep contact and opening information current." /><form className="card card__body form-grid" style={{ maxWidth: 760 }} onSubmit={submit}><Field label="Address"><textarea className="textarea" {...register("address")} /></Field><Field label="Opening hours"><input className="input" {...register("hours")} /></Field><Field label="Phone"><input className="input" {...register("phone")} /></Field><Field label="WhatsApp"><input className="input" {...register("whatsapp")} /></Field><div className="span-2"><Button busy={save.isPending} type="submit">Save profile</Button></div></form></>; }
