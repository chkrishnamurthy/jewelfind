"use client";

import { Inbox, LogOut, Store, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand } from "@/src/components/layouts/marketing";
import { LoadingState } from "@/src/components/ui";
import { useRepositories } from "@/src/providers/repository-provider";
import type { Showroom } from "@/src/domain/types";

export function ShowroomShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const { auth } = useRepositories();
  const [showroom, setShowroom] = useState<Showroom | null | undefined>(pathname === "/showroom/login" ? null : undefined);
  useEffect(() => {
    if (pathname === "/showroom/login") return;
    const timer = window.setTimeout(() => {
      const session = auth.getShowroomSession();
      setShowroom(session);
      if (!session) router.replace(`/showroom/login?next=${encodeURIComponent(pathname)}`);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [auth, pathname, router]);
  if (pathname === "/showroom/login") return <>{children}</>;
  if (!showroom) return <main className="section"><div className="narrow"><LoadingState /></div></main>;
  return <div className="showroom-shell"><header className="showroom-header"><Brand /><div className="row"><span className="demo-chip">Showroom demo</span><button className="icon-button" aria-label="Sign out" onClick={async () => { await auth.logout("showroom"); router.replace("/showroom/login"); }}><LogOut size={17} /></button></div></header><main className="showroom-content">{children}</main><nav className="marketing-header" aria-label="Showroom navigation" style={{ position: "fixed", top: "auto", bottom: 0, width: "100%", height: 66 }}><div className="marketing-header__inner" style={{ justifyContent: "space-around" }}><Link className="row" href="/showroom"><Inbox size={18} />Inbox</Link><span className="muted" style={{ fontSize: ".75rem" }}><Store size={15} style={{ verticalAlign: "middle" }} /> {showroom.name}</span><Link className="row" href="/showroom/profile"><UserRound size={18} />Profile</Link></div></nav></div>;
}
