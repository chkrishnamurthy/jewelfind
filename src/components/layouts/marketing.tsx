"use client";

import Link from "next/link";
import { Gem, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LinkButton } from "@/src/components/ui";

export function Brand({ light = false }: { light?: boolean }) {
  return <Link className="brand" href="/" style={light ? { color: "white" } : undefined}><span className="brand__mark"><Gem size={18} /></span><span>JewelFind</span></Link>;
}

export function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="marketing-header">
      <div className="marketing-header__inner">
        <Brand />
        <nav className="marketing-nav" aria-label="Main navigation">
          <Link aria-current={pathname === "/how-it-works" ? "page" : undefined} href="/how-it-works">How it works</Link>
          <Link aria-current={pathname === "/for-showrooms" ? "page" : undefined} href="/for-showrooms">For showrooms</Link>
          <Link aria-current={pathname === "/track" ? "page" : undefined} href="/track">Track request</Link>
          <Link href="/demo">Demo guide</Link>
        </nav>
        <LinkButton href="/request">Find this design</LinkButton>
        <button className="icon-button mobile-menu-button" aria-expanded={open} aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen((value) => !value)}>{open ? <X size={19} /> : <Menu size={19} />}</button>
      </div>
      {open && <nav className="mobile-nav-panel" aria-label="Mobile navigation"><Link onClick={() => setOpen(false)} href="/how-it-works">How it works</Link><Link onClick={() => setOpen(false)} href="/for-showrooms">For showrooms</Link><Link onClick={() => setOpen(false)} href="/track">Track request</Link><Link onClick={() => setOpen(false)} href="/demo">Demo guide</Link></nav>}
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="marketing-footer">
      <div className="container">
        <div className="footer-grid">
          <div><Brand /><p style={{ marginTop: 16 }}>A calmer way to find the jewellery design you love across trusted Hyderabad showrooms.</p></div>
          <div><div className="footer-title">Explore</div><div className="footer-links"><Link href="/request">Find a design</Link><Link href="/track">Track a request</Link><Link href="/how-it-works">How it works</Link><Link href="/for-showrooms">For showrooms</Link></div></div>
          <div><div className="footer-title">Information</div><div className="footer-links"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/demo">Frontend demo guide</Link><Link href="/admin/login">Admin demo</Link></div></div>
        </div>
        <div className="footer-bottom"><span>© 2026 JewelFind. Frontend prototype.</span><span>No purchases or messages are sent in this demo.</span></div>
      </div>
    </footer>
  );
}

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return <><MarketingHeader /><main>{children}</main><MarketingFooter /></>;
}
