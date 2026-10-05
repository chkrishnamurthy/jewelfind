import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/src/components/ui";
import { ShowroomForm } from "@/src/features/showrooms/showroom-form";

export default function NewShowroomPage() { return <><Link className="button button--ghost" href="/admin/showrooms" style={{ paddingLeft: 0 }}><ArrowLeft size={16} />Back to showrooms</Link><PageHeader eyebrow="Partner network" title="Add showroom" description="Create a complete demo partner profile." /><div style={{ maxWidth: 850 }}><ShowroomForm /></div></>; }
