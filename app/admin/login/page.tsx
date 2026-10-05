"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Brand } from "@/src/components/layouts/marketing";
import { Button, Field } from "@/src/components/ui";
import { useRepositories } from "@/src/providers/repository-provider";

const schema = z.object({ email: z.string().email("Enter a valid email."), password: z.string().min(6, "Enter at least 6 characters.") });

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const { auth } = useRepositories();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { email: "demo@jewelfind.in", password: "jewel123" } });
  const submit = handleSubmit(async (values) => { try { await auth.loginAdmin(values.email, values.password); const next = search.get("next"); router.replace(next?.startsWith("/admin") ? next : "/admin"); } catch (error) { setError("root", { message: error instanceof Error ? error.message : "Could not sign in." }); } });
  return <div className="auth-form"><Brand /><h2>Welcome back</h2><p>Sign in to the simulated operations workspace.</p><form onSubmit={submit} noValidate><Field label="Email" error={errors.email?.message}><input className="input" type="email" autoComplete="email" {...register("email")} /></Field><Field label="Password" error={errors.password?.message}><input className="input" type="password" autoComplete="current-password" {...register("password")} /></Field>{errors.root && <div className="legal-notice" style={{ background: "var(--danger-pale)", color: "var(--danger)", borderColor: "#e6b8b3" }}>{errors.root.message}</div>}<Button busy={isSubmitting} type="submit">Sign in to admin demo</Button><div className="demo-note"><LockKeyhole size={15} style={{ verticalAlign: "middle", marginRight: 7 }} /><strong>Demo:</strong> demo@jewelfind.in / jewel123</div></form></div>;
}

export default function AdminLoginPage() {
  return <main className="auth-shell"><section className="auth-art"><Brand light /><div><span className="eyebrow" style={{ color: "var(--gold-light)" }}>Operations workspace</span><h1>Every request, clearly handled.</h1><p>Assign relevant showrooms, capture replies and release a useful result from one focused view.</p></div><div className="row muted" style={{ color: "#bcb3a7" }}><ShieldCheck size={18} />Frontend demo · not real authentication</div></section><section className="auth-panel"><Suspense><LoginForm /></Suspense></section></main>;
}
