"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ErrorState, LoadingState, PageHeader } from "@/src/components/ui";
import { ShowroomForm } from "@/src/features/showrooms/showroom-form";
import { useShowroom } from "@/src/features/hooks";

export default function EditShowroomPage() { const { id } = useParams<{ id: string }>(); const query = useShowroom(id); if (query.isLoading) return <LoadingState />; if (query.error || !query.data) return <ErrorState message={query.error?.message ?? "Showroom not found."} />; return <><Link className="button button--ghost" href={`/admin/showrooms/${id}`} style={{ paddingLeft: 0 }}><ArrowLeft size={16} />Back to showroom</Link><PageHeader eyebrow="Partner network" title={`Edit ${query.data.name}`} description="Changes update every mock view immediately." /><div style={{ maxWidth: 850 }}><ShowroomForm showroom={query.data} /></div></>; }
