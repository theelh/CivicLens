"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const links = {
  Product: ["Features", "How it works", "Pricing", "Changelog", "Roadmap"],
  Solutions: ["For Citizens", "For Municipalities", "Smart Cities", "Enterprise", "NGOs"],
  Resources: ["Documentation", "API Reference", "Case Studies", "Blog", "Press Kit"],
  Company: ["About", "Careers", "Privacy Policy", "Terms of Use", "Contact"],
};

const socials = [
  {
    label: "X",
    href: "#",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.733-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "#",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
];

const stats = [
  { value: "120+", label: "Cities served" },
  { value: "2.4M", label: "Reports resolved" },
  { value: "97%", label: "Detection accuracy" },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const colsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: footerRef.current, start: "top 88%" },
        }
      );
      gsap.fromTo(
        colsRef.current?.querySelectorAll(".col-anim") ?? [],
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.55, stagger: 0.07, ease: "power2.out",
          scrollTrigger: { trigger: colsRef.current, start: "top 90%" },
        }
      );
    }, footerRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="w-full font-sans relative overflow-hidden bg-[#2369A4]"
    >
      {/* Light scatter — top-right */}
      <div
        className="absolute top-0 right-0 w-125 h-125 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 65%)",
          transform: "translate(20%, -20%)",
        }}
      />
      {/* Light scatter — bottom-left */}
      <div
        className="absolute bottom-0 left-0 w-100 h-100 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 65%)",
          transform: "translate(-20%, 20%)",
        }}
      />
      {/* Subtle darker bottom vignette */}
      <div
        className="absolute bottom-0 left-0 w-full h-40 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(14,58,100,0.35), transparent)" }}
      />

      {/* Wavy top edge blending from page bg */}
      <div className="absolute top-0 left-0 w-full overflow-hidden" style={{ height: "44px" }}>
        <svg viewBox="0 0 1440 44" preserveAspectRatio="none" className="w-full h-full">
          <path
            d="M0,22 C360,44 720,0 1080,22 C1260,33 1380,10 1440,22 L1440,0 L0,0 Z"
            fill="#F6F7F8"
          />
        </svg>
      </div>

      <div className="max-w-350 mx-auto px-8 pt-20 pb-10 relative z-10">

        {/* ── CTA CARD ── */}
        <div
          ref={ctaRef}
          className="rounded-3xl p-10 mb-16 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden"
          style={{
            background: "rgba(255,255,255,255)",
            border: "1px solid rgba(255,255,255,0.2)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Dot grid texture */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase text-black/60 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2369A4] inline-block" />
              Ready to get started?
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#171717] leading-tight max-w-lg">
              Make your city cleaner,{" "}
              <span className="text-[#2369A4]">one report at a time.</span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 relative z-10 shrink-0">
            <button className="px-7 py-3 cursor-pointer bg-[#2369A4] hover:text-[#2369A4] hover:bg-white/90 hover:border hover:border-black/10 text-white text-sm font-bold rounded-2xl transition-all duration-200 shadow-lg shadow-black/10 hover:-translate-y-0.5">
              Start for free
            </button>
            <button className="px-7 py-3 cursor-pointer text-[#2369A4] text-sm font-semibold rounded-2xl border border-black/25 hover:bg-white/10 transition-all duration-200 hover:-translate-y-0.5">
              Book a demo
            </button>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="flex flex-wrap gap-8 mb-16 justify-center lg:justify-start border-b border-white/10 pb-12">
          {stats.map((s, i) => (
            <div key={s.label} className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{s.value}</span>
              <span className="text-sm text-white/50">{s.label}</span>
              {i < stats.length - 1 && (
                <span className="text-white/20 ml-4 hidden sm:inline text-lg">·</span>
              )}
            </div>
          ))}
        </div>

        {/* ── COLUMNS ── */}
        <div
          ref={colsRef}
          className="grid grid-cols-1 lg:grid-cols-5 gap-12 pb-14 border-b border-white/10"
        >
          {/* Brand col */}
          <div className="col-anim lg:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" fill="white" />
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="white" fillOpacity="0.45" />
                </svg>
              </div>
              <span className="text-base font-bold tracking-tight text-white">CivicLens AI</span>
            </div>

            <p className="text-white/55 text-sm leading-relaxed mb-6">
              Intelligent issue reporting that brings citizens and municipalities closer together.
            </p>

            {/* Newsletter */}
            <p className="text-xs font-semibold text-white/70 mb-2">Weekly updates</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="you@email.com"
                className="flex-1 min-w-0 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-colors"
              />
              <button className="px-3 py-2 bg-white hover:bg-white/90 text-[#2369A4] text-xs font-bold rounded-xl transition-colors shrink-0">
                →
              </button>
            </div>

            {/* Socials */}
            <div className="flex gap-2 mt-5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 border border-white/15 text-white/60 hover:text-white hover:bg-white/20 hover:border-white/30 transition-all duration-150"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group} className="col-anim">
              <p className="text-xs font-bold tracking-[0.15em] uppercase text-white/40 mb-5">
                {group}
              </p>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-white/70 text-sm hover:text-white transition-colors duration-150 group flex items-center gap-1.5"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-white/60 transition-all duration-200 inline-block rounded-full" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-7">
          <p className="text-white/35 text-xs">
            © {new Date().getFullYear()} CivicLens AI. All rights reserved.
          </p>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block animate-pulse" />
            <span className="text-white/40 text-xs">All systems operational</span>
          </div>

          <div className="flex gap-5">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-white/35 text-xs hover:text-white/70 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}