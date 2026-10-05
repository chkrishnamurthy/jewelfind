import Link from "next/link";
import { ArrowUpRight, Camera, CheckCircle2, Clock3, Gem, MapPin, MessageCircle, Search, ShieldCheck, Sparkles, Store } from "lucide-react";
import { MarketingShell } from "@/src/components/layouts/marketing";
import { JewelryVisual } from "@/src/components/domain/jewelry-visual";
import { LinkButton } from "@/src/components/ui";
import { CATEGORIES } from "@/src/domain/types";

export default function HomePage() {
  return (
    <MarketingShell>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <span className="eyebrow">Hyderabad jewellery search</span>
            <h1>Seen a design you love? <em>We’ll help you find it.</em></h1>
            <p className="lead">Upload a reference photo once. JewelFind checks with selected local showrooms and brings the most promising result back to you.</p>
            <div className="hero__actions"><LinkButton href="/request"><Camera size={17} />Upload a photo</LinkButton><LinkButton href="/how-it-works" tone="secondary">See how it works</LinkButton></div>
            <div className="hero__proof"><span><ShieldCheck size={16} />Private by design</span><span><Store size={16} />Curated showrooms</span><span><Clock3 size={16} />Progress tracking</span></div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-art__frame"><JewelryVisual tone="ruby" alt="Illustrated jewellery reference" /></div>
            <div className="hero-art__float"><span className="success-mark" style={{ width: 38, height: 38, margin: 0, boxShadow: "none" }}><CheckCircle2 size={19} /></span><div><strong>Close match found</strong><span>at a showroom in Jubilee Hills</span></div></div>
          </div>
        </div>
      </section>

      <div className="trust-strip"><div className="container trust-strip__inner"><div className="trust-item"><ShieldCheck size={18} />Your number stays private</div><div className="trust-item"><MapPin size={18} />Hyderabad focused</div><div className="trust-item"><MessageCircle size={18} />Simple status updates</div><div className="trust-item"><Gem size={18} />Exact and similar options</div></div></div>

      <section className="section section--paper">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">One request, less running around</span><h2>From screenshot to showroom in three thoughtful steps.</h2></div>
          <div className="feature-grid">
            <article className="feature-card step-card"><span className="step-card__number">01</span><div className="feature-card__icon"><Camera /></div><h3>Share the reference</h3><p>Upload the design, choose your area, category and comfortable budget range.</p></article>
            <article className="feature-card step-card"><span className="step-card__number">02</span><div className="feature-card__icon"><Search /></div><h3>We check locally</h3><p>Your request is shared only with selected showrooms that fit the area and category.</p></article>
            <article className="feature-card step-card"><span className="step-card__number">03</span><div className="feature-card__icon"><Sparkles /></div><h3>Visit with confidence</h3><p>See an exact or similar result with showroom details before you make the trip.</p></article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">What are you looking for?</span><h2>Start with the piece in your mind.</h2><p className="lead">Our request flow works for everyday pieces, special gifts and complete bridal looks.</p></div>
          <div className="category-grid">{CATEGORIES.slice(0, 4).map((category) => <Link className="category-card" href={`/request?category=${encodeURIComponent(category)}`} key={category}><strong>{category}</strong><ArrowUpRight size={18} style={{ marginLeft: "auto", position: "relative", zIndex: 2 }} /></Link>)}</div>
        </div>
      </section>

      <section className="section section--tight"><div className="container"><div className="cta-panel"><div><span className="eyebrow" style={{ color: "#e7c78e" }}>Ready when you are</span><h2>Make your first search feel effortless.</h2><p>This frontend demo uses realistic mock data and never sends your information anywhere.</p></div><LinkButton href="/request">Start a request</LinkButton></div></div></section>
    </MarketingShell>
  );
}
