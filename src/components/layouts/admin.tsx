"use client";

import { Activity, Building2, ClipboardList, LayoutDashboard, LogOut, Menu, MessageSquareText, Store, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand } from "@/src/components/layouts/marketing";
import { LoadingState } from "@/src/components/ui";
import { useRepositories } from "@/src/providers/repository-provider";

const nav = [
  ["/admin", "Overview", LayoutDashboard],
  ["/admin/requests", "Requests", ClipboardList],
  ["/admin/showrooms", "Showrooms", Store],
  ["/admin/applications", "Applications", Building2],
  ["/admin/messages", "Messages", MessageSquareText],
  ["/admin/activity", "Activity", Activity],
  ["/admin/profile", "Profile", UserRound],
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { auth } = useRepositories();
  const [user, setUser] = useState<ReturnType<typeof auth.getAdminSession> | undefined>(pathname === "/admin/login" ? null : undefined);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    const timer = window.setTimeout(() => {
      const session = auth.getAdminSession();
      setUser(session);
      if (!session) router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [auth, pathname, router]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (!user) return <main className="section"><div className="narrow"><LoadingState /></div></main>;

  const navigation = (close = false) => <nav className="admin-nav" aria-label="Admin navigation">{nav.map(([href, label, Icon]) => { const active = href === "/admin" ? pathname === href : pathname.startsWith(href); return <Link aria-current={active ? "page" : undefined} href={href} key={href} onClick={() => close && setMobileOpen(false)}><Icon size={18} />{label}{label === "Applications" && <span className="admin-nav__badge">6</span>}</Link>; })}</nav>;
  return <div className="admin-layout"><aside className="admin-sidebar"><Brand light />{navigation()}<div className="admin-sidebar__foot"><div className="admin-user"><span className="admin-user__avatar">PS</span><div><strong>{user.name}</strong><span>{user.role}</span></div></div><button className="button button--ghost" style={{ color: "#bdb5aa", width: "100%" }} onClick={async () => { await auth.logout("admin"); router.replace("/admin/login"); }}><LogOut size={16} />Sign out</button></div></aside>{mobileOpen && <><button className="admin-mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} /><aside className="admin-mobile-nav"><div className="row row--between" style={{ marginBottom: 26 }}><Brand light /><button className="icon-button" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={18} /></button></div>{navigation(true)}</aside></>}<div className="admin-main"><header className="admin-topbar"><div className="row"><button className="icon-button admin-menu-button" aria-expanded={mobileOpen} aria-label="Open admin navigation" onClick={() => setMobileOpen(true)}><Menu size={19} /></button><span className="admin-topbar__title">JewelFind operations</span></div><span className="demo-chip">Mock data</span></header><main className="admin-content">{children}</main></div></div>;
}
