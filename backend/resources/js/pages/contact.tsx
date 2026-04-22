"use client";

import { Head } from "@inertiajs/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import AppTop from "@/components/app-top";
import Chatbot from "@/components/chatbot";
import Footer from "@/components/Footer";

const API_URL = "http://localhost:8000/api/sentContact";

type FormState = {
  name: string;
  email: string;
  message: string;
};

type Status = "idle" | "loading" | "success" | "error";

gsap.registerPlugin(ScrollTrigger);

export default function ContactPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormState>({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(heroRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 })
      .fromTo(infoRef.current, { opacity: 0, x: -32 }, { opacity: 1, x: 0, duration: 0.7 }, "-=0.4")
      .fromTo(formRef.current, { opacity: 0, x: 32 }, { opacity: 1, x: 0, duration: 0.7 }, "-=0.7");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data?.message ||
          (data?.errors
            ? Object.values(data.errors as Record<string, string[]>).flat().join(" ")
            : "Something went wrong.");
        setErrorMsg(msg);
        setStatus("error");
        return;
      }

      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setErrorMsg("Unable to reach the server. Please try again later.");
      setStatus("error");
    }
  };

  const infoItems = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      label: "Email us",
      value: "support@civiclens.ai",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      label: "Headquarters",
      value: "Morocco, 🇲🇦",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      label: "Response time",
      value: "Within 24 hours",
    },
  ];

  const faqs = [
  {
    id: "01",
    question: "How does CivicLens AI help reduce pollution?",
    answer:
      "CivicLens AI enables citizens to report pollution-related issues such as illegal dumping, air pollution, water leaks, and waste overflow in real time. By using AI to categorize and prioritize these reports, municipalities can respond faster and take effective action to reduce environmental impact.",
    category: "Impact",
  },
  {
    id: "02",
    question: "What types of pollution can be reported?",
    answer:
      "The platform supports reporting various types of pollution, including waste accumulation and garbage overflow, water pollution and leaks, air pollution sources (smoke, emissions), noise pollution, and hazardous materials or illegal dumping.",
    category: "Reporting",
  },
  {
    id: "03",
    question: "How does AI improve pollution management?",
    answer:
      "CivicLens AI uses artificial intelligence to analyze images, voice inputs, and descriptions. It automatically identifies the type of pollution, evaluates its severity, and helps authorities prioritize urgent environmental issues for faster resolution.",
    category: "Technology",
  },
  {
    id: "04",
    question: "Can I report pollution anonymously?",
    answer:
      "Yes, CivicLens AI can allow anonymous reporting depending on system settings. This encourages more users to report environmental issues without concerns about privacy.",
    category: "Privacy",
  },
  {
    id: "05",
    question: "How quickly are pollution issues resolved?",
    answer:
      "Resolution time depends on the municipality, but CivicLens AI significantly reduces delays by automatically routing reports to the correct department and prioritizing urgent environmental cases.",
    category: "Resolution",
  },
  {
    id: "06",
    question: "How can municipalities benefit from the platform?",
    answer:
      "Municipalities gain access to a centralized dashboard where they can monitor pollution reports, identify high-risk areas, and analyze environmental trends. This leads to better decision-making and more efficient resource allocation.",
    category: "Municipalities",
  },
  {
    id: "07",
    question: "Does the platform provide pollution analytics?",
    answer:
      "Yes, CivicLens AI offers analytics tools that help track pollution patterns, identify recurring issues, and measure response performance, enabling long-term environmental improvements.",
    category: "Analytics",
  },
  {
    id: "08",
    question: "Is CivicLens AI suitable for smart city initiatives?",
    answer:
      "Absolutely. CivicLens AI is designed to support smart city strategies by combining citizen engagement, real-time reporting, and AI-driven insights to improve urban environmental management.",
    category: "Smart City",
  },
  {
    id: "09",
    question: "How does location tracking help with pollution reports?",
    answer:
      "GPS integration allows each report to be accurately mapped, helping authorities quickly locate pollution sources and take targeted action in affected areas.",
    category: "Technology",
  },
  {
    id: "10",
    question: "How can I start reporting pollution issues?",
    answer:
      "Simply create an account, submit a report using your mobile device, and let CivicLens AI handle the rest — from analysis to routing and tracking.",
    category: "Getting Started",
  },
];

  const sectionRef3 = useRef<HTMLElement>(null);
  const leftRef3 = useRef<HTMLDivElement>(null);
  const progressLineRef3 = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
 
  useEffect(() => {
    const ctx3 = gsap.context(() => {
      // Pin the left panel while right side scrolls
      ScrollTrigger.create({
        trigger: sectionRef3.current,
        start: "top top",
        end: "bottom bottom",
        pin: leftRef3.current,
        pinSpacing: true,
      });
 
      // Progress line grows as user scrolls
      gsap.to(progressLineRef3.current, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef3.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });
 
      // Each FAQ item reveals on scroll
      itemRefs.current.forEach((item) => {
        if (!item) return;
        gsap.fromTo(
          item,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, sectionRef3);
 
    return () => ctx3.revert();
  }, []);


//   FAQ

  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const itemRefs2 = useRef<(HTMLDivElement | null)[]>([]);
  const [openIndex2, setOpenIndex2] = useState<number | null>(0);
 
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pin the left panel while right side scrolls
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: () => `+=${faqs.length * 50}`,
        pin: leftRef.current,
        pinSpacing: false,
      });
 
      // Progress line grows as user scrolls
      gsap.to(progressLineRef.current, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${faqs.length * 60}`,
          scrub: true,
        },
      });
 
      // Each FAQ item reveals on scroll
      itemRefs.current.forEach((item) => {
        if (!item) return;
        gsap.fromTo(
          item,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, sectionRef);
 
    return () => ctx.revert();
  }, []);
 
  const toggle = (i: number) => setOpenIndex2(openIndex2 === i ? null : i);

  return (
    <>
        <AppTop/>
        <Chatbot />
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
                <div className="fixed bottom-0 inset-x-0 z-10 pointer-events-none">
                    <div className="h-20 backdrop-blur-xs [mask:linear-gradient(to_top,black_20%,rgba(0,0,0,6.0)_50%,rgba(0,0,0,6.0)_50%,rgba(0,0,0,6.0)_45%,rgba(0,0,0,5.0)_30%,rgba(0,0,0,2.5)_15%,transparent_100%)]" />
                </div>

                <div id="smooth-wrapper">
                <div id="smooth-content" className="relative z-10 min-h-screen flex flex-col items-center pt-6 text-[#1b1b18] lg:justify-center">
                    <section
                                ref={sectionRef3}
                                className="w-full pt-36 bg-[#F6F7F8] font-sans"
                                >
                                <div className="max-w-350 mx-auto px-6 pb-32">
                            
                                    {/* Two-column layout */}
                                    <div className="flex gap-16 items-start">
                            
                                    {/* LEFT — sticky */}
                                    <div
                                        ref={leftRef3}
                                        className="lg:w-2/5 w-full sticky top-12 flex flex-col items-start self-start pr-8"
                                    >
                                        {/* Top label */}
                                        <div ref={heroRef} className=" pb-16 max-w-350 mx-auto px-8">
                                            <button className="px-4 py-1.5 text-xs border border-[#236aa41e] shadow-lg shadow-[#236aa41e] font-semibold flex items-center gap-2 tracking-wider text-black backdrop-blur-sm uppercase rounded-full mb-6">
                                            <span className="text-[#2369A4] text-xl">•</span>
                                            Contact
                                            </button>
                                            <h1 className="text-[48px] font-bold text-[#171717] leading-[1.05] -tracking-[0.1rem] ">
                                            Let's build smarter{" "}
                                            <span className="text-[#2369A4]">cities together.</span>
                                            </h1>
                                            <p className="mt-5 text-[#585858] text-lg max-w-xl leading-relaxed">
                                            Have a question, a partnership idea, or want to see CivicLens AI in your city? We'd love to hear from you.
                                            </p>
                                        {/* Map placeholder */}
                                        <div className="rounded-2xl mt-7 overflow-hidden border border-[#E8EBF0] shadow-sm relative bg-white h-64 flex items-center justify-center">
                                            <div className="absolute inset-0 opacity-[0.04]"
                                                style={{
                                                    backgroundImage: "radial-gradient(circle, #2369A4 1px, transparent 1px)",
                                                    backgroundSize: "20px 20px",
                                                }}
                                                />
                                                <div className="relative z-10 text-center">
                                                <div className="w-12 h-12 rounded-full bg-[#2369A4]/10 flex items-center justify-center mx-auto mb-3">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2369A4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm text-[#585858] font-medium">San Francisco, CA</p>
                                                <p className="text-xs text-[#9CA3AF] mt-1">CivicLens AI HQ</p>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                            
                                    {/* RIGHT — scrollable FAQ list with progress line */}
                                    <div className="w-[50%] flex gap-6 shrink-0">
                            
                                        {/* Progress line */}
                                        <div className="hidden lg:flex flex-col items-center pt-3 shrink-0">
                                        <div
                                            className="relative w-0.5 bg-[#2369A4]/10 rounded-full overflow-hidden"
                                            style={{ height: '100%' }}
                                        >
                                            <div
                                                ref={progressLineRef3}
                                                className="absolute w-full bg-[#2369A4] origin-top"
                                                style={{
                                                    height: "100%",
                                                    transform: "scaleY(0)",
                                                    transformOrigin: "top"
                                                }}
                                                />
                                            </div>
                                        </div>
                            
                                        {/* ── TWO COLUMN LAYOUT ── */}
                    <div className="max-w-350 mx-auto px-8 pt-24 pb-32 flex flex-col gap-16 items-start">

                        {/* LEFT — info panel */}
                        <div ref={infoRef} className=" w-full">
                        
                        {/* RIGHT — form */}
                        <div ref={formRef} className="w-full">
                        <div className="bg-white rounded-3xl border border-[#E8EBF0] shadow-sm p-10">

                            {status === "success" ? (
                            /* Success state */
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-5">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-[#171717] mb-2">Message sent!</h3>
                                <p className="text-[#585858] text-sm max-w-xs leading-relaxed mb-8">
                                Thanks for reaching out. We'll get back to you within 24 hours.
                                </p>
                                <button
                                onClick={() => setStatus("idle")}
                                className="px-6 py-2.5 text-sm font-semibold text-[#2369A4] border border-[#2369A4]/20 rounded-xl hover:bg-[#2369A4]/5 transition-colors"
                                >
                                Send another message
                                </button>
                            </div>
                            ) : (
                            /* Form */
                            <form  onSubmit={handleSubmit} noValidate>
                                <h2 className="text-2xl font-bold text-[#171717] mb-1">Send us a message</h2>
                                <p className="text-[#9CA3AF] text-sm mb-8">We read every message personally.</p>

                                <div className="flex flex-col gap-5">

                                {/* Name */}
                                <div>
                                    <label className="block text-xs font-bold tracking-[0.1rem] uppercase text-[#6B7280] mb-2">
                                    Full name
                                    </label>
                                    <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Your name"
                                    className="w-full bg-[#F6F7F8] border border-[#E8EBF0] rounded-xl px-4 py-3 text-sm text-[#171717] placeholder-[#C4CDD6] focus:outline-none focus:border-[#2369A4]/50 focus:bg-white transition-all"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-bold tracking-[0.1rem] uppercase text-[#6B7280] mb-2">
                                    Email address
                                    </label>
                                    <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="yourmail@example.com"
                                    className="w-full bg-[#F6F7F8] border border-[#E8EBF0] rounded-xl px-4 py-3 text-sm text-[#171717] placeholder-[#C4CDD6] focus:outline-none focus:border-[#2369A4]/50 focus:bg-white transition-all"
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block text-xs font-bold tracking-[0.1rem] uppercase text-[#6B7280] mb-2">
                                    Message
                                    </label>
                                    <textarea
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    placeholder="Tell us about your question…"
                                    className="w-full bg-[#F6F7F8] border border-[#E8EBF0] rounded-xl px-4 py-3 text-sm text-[#171717] placeholder-[#C4CDD6] focus:outline-none focus:border-[#2369A4]/50 focus:bg-white transition-all resize-none"
                                    />
                                </div>

                                {/* Error banner */}
                                {status === "error" && (
                                    <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    <p className="text-xs text-red-600 leading-relaxed">{errorMsg}</p>
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={status === "loading"}
                                    className="w-full py-3.5 bg-[#2369A4] hover:bg-[#1d5a8a] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-[#2369A4]/20 hover:shadow-[#2369A4]/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                >
                                    {status === "loading" ? (
                                    <>
                                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                                        </svg>
                                        Sending…
                                    </>
                                    ) : (
                                    <>
                                        Send message
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                    </>
                                    )}
                                </button>
                                </div>
                            </form>
                            )}
                        </div>
                        </div>

                        {/* Info cards */}
                        <div className="flex flex-col gap-4 my-10">
                            {infoItems.map((item) => (
                            <div
                                key={item.label}
                                className="flex items-start gap-4 bg-white rounded-2xl px-6 py-5 border border-[#E8EBF0] shadow-sm"
                            >
                                <div className="w-10 h-10 rounded-xl bg-[#2369A4]/8 flex items-center justify-center text-[#2369A4] flex-shrink-0">
                                {item.icon}
                                </div>
                                <div>
                                <p className="text-xs font-bold tracking-[0.12em] uppercase text-[#9CA3AF] mb-0.5">{item.label}</p>
                                <p className="text-[#171717] text-sm font-semibold">{item.value}</p>
                                </div>
                            </div>
                            ))}
                        </div>

                        {/* Trust note */}
                        <div className="mt-6 flex items-start gap-3 px-5 py-4 bg-[#2369A4]/5 rounded-2xl border border-[#2369A4]/10">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2369A4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <p className="text-xs text-[#585858] leading-relaxed">
                            Your message is sent securely. We never share your information with third parties.
                            </p>
                        </div>
                        </div>

                    </div>
                                    </div>
                                    </div>
                                </div>
                            </section>{/* FAQ */}

                             <section
                                ref={sectionRef}
                                className="w-full pt-36 bg-[#F6F7F8] font-sans"
                                >
                                <div className="max-w-350 mx-auto px-6 pb-32">
                            
                                    {/* Two-column layout */}
                                    <div className="flex flex-col lg:flex-row items-start gap-16">
                            
                                    {/* LEFT — sticky */}
                                    <div
                                        ref={leftRef}
                                        className="w-[40%] sticky flex flex-col items-start self-start pr-8"
                                    >
                                        {/* Top label */}
                                    <button className="px-4 py-1.5 text-xs border border-[#236aa41e] shadow-lg shadow-[#236aa41e] font-semibold flex items-center gap-2 tracking-wider text-black backdrop-blur-sm uppercase rounded-full mb-6">
                                        <span className="text-[#2369A4] text-xl">•</span>
                                        FAQ
                                    </button>
                                        <div className="relative">
                                        <div className="absolute -top-10 -left-10 w-56 h-56 rounded-full bg-[#2369A4]/5 blur-3xl pointer-events-none" />
                            
                                        <h2 className="text-[40px] font-bold text-[#171717] leading-[1.1] mb-6">
                                            Got
                                            <br />
                                            <span className="text-[#2369A4]">questions?</span>
                                        </h2>
                            
                                        <p className="text-[#585858] text-lg leading-relaxed max-w-sm mb-10">
                                            Everything you need to know about CivicLens AI and how it powers smarter, cleaner cities.
                                        </p>
                            
                                        {/* Category chips */}
                                        <div className="flex flex-wrap gap-2">
                                            {["Impact", "Technology", "Privacy", "Analytics", "Smart City"].map((cat) => (
                                            <span
                                                key={cat}
                                                className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#2369A4] bg-[#2369A4]/8 px-3 py-1 rounded-full border border-[#2369A4]/15"
                                            >
                                                {cat}
                                            </span>
                                            ))}
                                        </div>
                            
                                        {/* Decorative stat */}
                                        <div className="mt-12 pt-8 border-t border-[#2369A4]/10">
                                            <p className="text-4xl font-bold text-[#171717]">10</p>
                                            <p className="text-sm text-[#585858] mt-1">questions answered</p>
                                        </div>
                                        </div>
                                    </div>
                            
                                    {/* RIGHT — scrollable FAQ list with progress line */}
                                    <div className="w-[60%]  flex gap-6 shrink-0">
                            
                                        {/* Progress line */}
                                        <div className="hidden lg:flex flex-col items-center pt-3 shrink-0">
                                        <div
                                            className="relative w-0.5 bg-[#2369A4]/10 rounded-full overflow-hidden"
                                            style={{ height: `${faqs.length * 88}px` }}
                                        >
                                            <div
                                            ref={progressLineRef}
                                            className="absolute top-0 left-0 w-full bg-[#2369A4] origin-top"
                                            style={{
                                                height: "100%",
                                                transform: "scaleY(0)",
                                                transformOrigin: "top"
                                            }}
                                            />
                                        </div>
                                        </div>
                            
                                        {/* Accordion items */}
                                        <div className="flex flex-col gap-3 flex-1">
                                        {faqs.map((faq, i) => {
                                            const isOpen = openIndex2 === i;
                                            return (
                                            <div
                                                key={faq.id}
                                                ref={(el) => { itemRefs2.current[i] = el; }}
                                                className={`group bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${
                                                isOpen
                                                    ? "border-[#2369A4]/25 shadow-md shadow-[#2369A4]/5"
                                                    : "border-[#E8EBF0] hover:border-[#2369A4]/20 shadow-sm"
                                                }`}
                                            >
                                                <button
                                                onClick={() => toggle(i)}
                                                className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left"
                                                >
                                                <div className="flex items-start gap-4">
                                                    {/* Number */}
                                                    <span className="text-xs font-bold text-[#2369A4]/40 font-sans mt-0.5 shrink-0">
                                                    {faq.id}
                                                    </span>
                                                    <span className="text-[16px] font-medium text-[#171717] leading-snug">
                                                    {faq.question}
                                                    </span>
                                                </div>
                            
                                                <div className="flex items-center gap-3 shrink-0 mt-0.5">
                                                    <span className="hidden sm:inline-block text-[9px] font-bold tracking-[0.12em] uppercase text-[#2369A4] bg-[#2369A4]/8 px-2.5 py-1 rounded-full">
                                                    {faq.category}
                                                    </span>
                                                    {/* +/- icon */}
                                                    <span
                                                    className={`w-6 h-6 flex items-center justify-center rounded-full border text-sm font-light transition-all duration-200 shrink-0 ${
                                                        isOpen
                                                        ? "bg-[#2369A4] border-[#2369A4] text-white rotate-45"
                                                        : "border-[#E8EBF0] text-[#585858] group-hover:border-[#2369A4]/30"
                                                    }`}
                                                    >
                                                    +
                                                    </span>
                                                </div>
                                                </button>
                            
                                                {/* Answer panel */}
                                                <div
                                                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                                    isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                                                }`}
                                                >
                                                <div className="px-6 pb-5 pl-14">
                                                    <div className="h-px w-full bg-[#2369A4]/8 mb-4" />
                                                    <p className="text-[#737373] text-[14px] leading-relaxed font-medium font-sans">
                                                    {faq.answer}
                                                    </p>
                                                    <div className="mt-4 h-0.5 w-8 bg-[#2369A4] rounded-full" />
                                                </div>
                                                </div>
                                            </div>
                                            );
                                        })}
                                        </div>
                                    </div>
                                    </div>
                                </div>
                            </section>
                <Footer/>
            </div>
        </div>
        </>
  );
}