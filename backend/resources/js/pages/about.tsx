import { Head} from '@inertiajs/react';
import { gsap } from 'gsap';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import  { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRightIcon,  BrainCircuitIcon,  CameraIcon,  ChartSplineIcon,  ChevronDownIcon,  FlagTriangleRightIcon } from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AppTop from '@/components/app-top';
import Footer from '@/components/Footer';
import Chatbot from '@/components/chatbot';

interface AccordionItem {
    id: number
    title: string
    icon?: LucideIcon | null
    content: string
    image: string
}

export default function About() {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
     useEffect(() => {
        const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1,
        effects: true,
        smoothTouch: 0.1,
        })

        // 🔥 VERY IMPORTANT
        ScrollTrigger.refresh()

        return () => {
        smoother.paused()
        }
    }, [])



const items: AccordionItem[] = [
  {
    id: 1,
    title: "Capture the Issue",
    icon: <CameraIcon/>,
    content: "Take a photo, record audio, or write a description.",
    image: "./img/how-it-work-1.jpg",
  },
  {
    id: 2,
    title: "AI Analysis",
    icon: <BrainCircuitIcon/>,
    content: "Our system automatically detects and categorizes the issue.",
    image: "./img/how-it-work-3.jpg",
  },
  {
    id: 3,
    title: "Report Submission",
    icon: <FlagTriangleRightIcon/>,
    content: "The issue is sent directly to the relevant authorities.",
    image: "./img/how-it-work-2.jpg",
  },
  {
    id: 4,
    title: "Track Progress",
    icon: <ChartSplineIcon/>,
    content: "Follow the status of your report in real time.",
    image: "./img/how-it-work-4.jpg",
  },
]


  const [activeId, setActiveId] = useState<number>(1)

  const activeItem = items.find(item => item.id === activeId)

  gsap.registerPlugin(ScrollTrigger);
 
const cards = [
  {
    number: "01",
    title: "AI-Powered Issue Detection",
    description:
      "CivicLens AI uses advanced artificial intelligence to automatically detect and classify urban issues from images, voice recordings, and text descriptions. This reduces manual processing and ensures accurate categorization of problems.",
    tag: ["Time","Processing","Faster","Classification"],
  },
  {
    number: "02",
    title: "Real-Time Issue Reporting System",
    description:
      "Citizens can instantly report problems using their mobile devices. The system captures essential information such as location, media files, and descriptions to create detailed and actionable reports.",
    tag: ["Photo","Audio","Text","GPS tracking"],
  },
  {
    number: "03",
    title: "Smart Municipality Dashboard",
    description:
      "A centralized dashboard designed for municipal teams to monitor, manage, and resolve reported issues efficiently. It provides full visibility and control over all incoming reports.",
    tag: ["View","Category","Manage","Progress", "Status"],
  },
  {
    number: "04",
    title: "Interactive Map Visualization",
    description:
      "Visualize all reported issues on a dynamic map. This feature helps authorities identify hotspots and prioritize areas that require immediate attention.",
    tag: ["Updates","Real-time","Visualization","Awareness"],
  },
  {
    number: "05",
    title: "Data Analytics & Insights",
    description:
      "Gain valuable insights into urban issues through advanced analytics. The platform helps municipalities understand trends, measure performance, and improve long-term planning.",
    tag: ["Category","Time tracking","Analysis","Performance"],
  },
  {
    number: "06",
    title: "Notification & Communication System",
    description:
      "Keep citizens informed with real-time notifications about their reports. The system ensures transparent communication between users and authorities.",
    tag: ["Notifications","Alerts","Citizen","Engagement"],
  },
];
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
 
  useEffect(() => {
    const ctx = gsap.context(() => {
      const totalCards = cards.length;
 
      // Sticky left panel — pin it while right side scrolls
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: () => `+=${totalCards * 230}`,
        pin: leftRef.current,
        pinSpacing: false,
      });
 
      // Progress line grows as user scrolls through cards
      gsap.to(progressLineRef.current, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center",
          end: () => `+=${totalCards * 300}`,
          scrub: true,
        },
      });
 
      // Each card fades + slides in
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, y: 48 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, sectionRef);
 
    return () => ctx.revert();
  }, []);


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
  const [openIndex, setOpenIndex] = useState<number | null>(0);
 
  useEffect(() => {
    const ctx3 = gsap.context(() => {
      // Pin the left panel while right side scrolls
      ScrollTrigger.create({
        trigger: sectionRef3.current,
        start: "top top",
        end: () => `+=${faqs.length * 50}`,
        pin: leftRef3.current,
        pinSpacing: false,
      });
 
      // Progress line grows as user scrolls
      gsap.to(progressLineRef3.current, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef3.current,
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
    }, sectionRef3);
 
    return () => ctx3.revert();
  }, []);
 
  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

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
                <div  className="h-full fixed flex inset-0 items-end justify-end overflow-hidden z-0">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full fixed h-full object-cover"
                    >
                        <source src="/videos/service-vd.mp4" type="video/mp4" />
                    </video>
                    {/* Glass Cursor Effect */}
                    <div className="lens fixed pointer-events-none z-20" />
                </div>
                <div className="fixed bottom-0 inset-x-0 z-10 pointer-events-none">
                    <div className="h-20 backdrop-blur-xs [mask:linear-gradient(to_top,black_20%,rgba(0,0,0,6.0)_50%,rgba(0,0,0,6.0)_50%,rgba(0,0,0,6.0)_45%,rgba(0,0,0,5.0)_30%,rgba(0,0,0,2.5)_15%,transparent_100%)]" />
                </div>

                <div id="smooth-wrapper">
                <div id="smooth-content" className="relative z-10 min-h-screen flex flex-col items-center pt-6 text-[#1b1b18] lg:justify-center">
                    <div className="flex  min-h-screen flex-col items-center p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                        
                        <div className="flex-col w-full mt-32 justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                            <main className="relative flex justify-center gap-36 w-full mx-auto max-w-83.75 lg:max-w-360 lg:flex">

                                {/* HERO CENTER */}
                                <div className="flex flex-col z-50 max-w-2xl items-center text-center gap-6 lg:gap-8">
                                    <span className="px-4 py-1.5 text-xs border border-[#236aa41e] shadow-lg shadow-[#236aa41e] font-semibold flex items-center gap-2 tracking-wider text-black backdrop-blur-xs bg-linear-150 from-white to-white/40 uppercase rounded-full">
                                        <span className="text-[#2369A4] text-xl">•</span>
                                        About us
                                    </span>

                                    <h1 className="text-[48px] font-bold font-satoshi -tracking-[0.1rem] leading-14 text-[#171717] sm:text-[48px]">
                                        Building Smarter Cities <br/>
                                        <span className="text-[#2369A4]">
                                            Through Intelligent Technology 
                                        </span>
                                    </h1>

                                    <p className="text-[18px] max-w-lg font-sans text-[#404040]">
                                        CivicLens AI is transforming how citizens and municipalities collaborate by turning everyday urban issues into actionable insights using artificial intelligence.
                                    </p>
                                </div>

                            </main>

                            <section className="relative flex z-10 py-24  max-w-full rounded-[3rem] w-full overflow-hidden">
                            
                                {/* Slides */}
                                <div
                                    className="flex z-50  transition-transform w-full max-w-340 mx-auto duration-700 ease-in-out"
                                >
                                    <div className="min-w-full gap-5 flex flex-col">
                                        <div className="flex rounded-[3rem] shadow-lg border border-[#236aa41e] shadow-black/15 p-2 bg-white flex-col">
                                                <img
                                                className="rounded-[3rem]  w-full object-cover"
                                                src="/img/CiviLens-impact-2.jpg"
                                                alt="CiviLens-impact-2"
                                                />
                                        </div>

                                        <div className="flex gap-5">
                                            <div className="flex rounded-[3rem] p-2 shadow-lg border border-[#236aa41e] shadow-black/15 bg-white flex-col">
                                                <img
                                                className="rounded-[3rem] h-120 w-full object-cover"
                                                src="/img/about-1.jpg"
                                                alt="CiviLens-impact-2"
                                                />
                                            </div>
                                            <div className="flex rounded-[3rem] p-2 shadow-lg border border-[#236aa41e] shadow-black/15 bg-white flex-col">
                                                <img
                                                className="rounded-[3rem] h-120 w-full object-cover"
                                                src="/img/about-2.jpg"
                                                alt="CiviLens-impact-2"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-[#F6F7F8] max-w-screen w-screen pt-28 mt-0 flex flex-col">
                                <div className="flex flex-col items-center mx-auto justify-center">
                                    <span className="text-md font-medium flex items-center gap-2 tracking-wider text-[#525252] rounded-full">
                                        <span className="text-[#2369A4] text-3xl">•</span>
                                        Story
                                    </span>
                                    <h3 className="font-satoshi text-center mt-5 -tracking-[0.1rem] leading-[2.8rem] font-bold text-[40px] text-[#171717]">
                                        Our Story
                                        <br/>
                                        <span className="text-[#2369A4]">
                                            matters.
                                        </span>
                                    </h3>
                                    <p className="text-[18px] mt-5 max-w-4xl text-center font-sans text-[#404040]">
                                        CivicLens AI was created to solve a common problem faced by cities worldwide: inefficient and disconnected issue reporting systems. Citizens often struggle to report problems, while municipalities face delays in identifying and prioritizing them.
                                        <br /> <br />
                                        Recognizing this gap, we designed a platform that combines simplicity for users with powerful AI capabilities for decision-makers. Our goal was clear — create a system that not only collects reports but also understands them.
                                        <br /> <br/>
                                        Today, CivicLens AI stands as a modern solution that bridges the gap between communities and city authorities, enabling faster responses and more effective urban management.
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 mt-16 gap-5 max-w-340 mx-auto">
                                    {/* card1 */}
                                    <div className="bg-white flex flex-col gap-3 p-7 rounded-4xl border border-[#8b87873c]">
                                        <h2 className="text-[32px] text-[#171717] font-satoshi font-bold">30%</h2>
                                        <p className="font-satoshi font-medium -tracking-wide text-[#5d636f] text-[24px]">The "Smart Triage" Impact</p>
                                        <p className="text-[16px] font-sans text-[#737373]">AI automates reporting and GPS routing, eliminating errors and redundant crew trips to save 30% of the city's operational budget.</p>
                                    </div>
                                    {/* card2 */}
                                    <div className="bg-white flex flex-col gap-3 p-7 rounded-4xl border border-[#8b87873c]">
                                        <h2 className="text-[32px] text-[#171717] font-satoshi font-bold">15%</h2>
                                        <p className="font-satoshi font-medium -tracking-wide text-[#5d636f] text-[24px]">The "Resource Protection" Impact</p>
                                        <p className="text-[16px] text-[#737373]">Real-time citizen reporting of leaks and illegal waste helps the state recover 15% of the GDP costs lost to environmental degradation.</p>
                                    </div>
                                    {/* card3 */}
                                    <div className="bg-white flex flex-col gap-3 p-7 rounded-4xl border border-[#8b87873c]">
                                        <h2 className="text-[32px] text-[#171717] font-satoshi font-bold">50%</h2>
                                        <p className="font-satoshi font-medium -tracking-wide text-[#5d636f] text-[24px]">The "Civic Trust" Impact</p>
                                        <p className="text-[16px] text-[#737373]">Digital pipelines replace manual workflows to track issues from report to fix, cutting the time to resolve urban problems by exactly 50%.</p>
                                    </div>
                                </div>
                            </section>

                            <main className=" w-full flex-col h-full pt-24 max-w-full bg-[#F6F7F8] font-sans justify-center">
                                <div className="flex-col justify-between gap-7">
                                    <div className="max-w-360 p-8 mx-auto flex justify-between">
                                        <div className=" flex-col lg:flex-row lg:justify-between items-start gap-6 py-8 rounded-2xl font-sans text-white">
                                            <button className="px-4 py-1.5 text-xs border border-[#236aa41e] shadow-lg shadow-[#236aa41e] font-semibold flex items-center gap-2 tracking-wider text-black backdrop-blur-xs uppercase rounded-full">
                                                <span className="text-[#2369A4] text-xl">•</span>
                                                How It Works
                                            </button>
                                            <h3 className="text-[40px] mt-5 text-[#171717] font-satoshi font-bold max-w-xl leading-tight">
                                                Powerful Features <br/> 
                                                <span className="text-[#2369A4]">
                                                    For Modern Cities
                                                </span>
                                            </h3>
                                        </div>
                                        <div className="flex items-center">
                                            <a href="/contact" className="flex bg-white shadow-black/15 shadow-xl items-center font-satoshi gap-4 text-[#525252] px-6 py-2 rounded-4xl text-lg font-semibold">
                                            Contact us
                                            <span className="border bg-[#F6F7F8] border-[#c0c0c08b] rounded-4xl py-1.5 px-4">
                                                <ArrowRightIcon size={20} />
                                            </span>
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-16 max-w-360 mx-auto py-16 lg:py-0 px-6">
                                        {/* Accordion Section */}
                                        <div className="w-full font-sans lg:w-1/2 space-y-4">
                                        {items.map((item) => {
                                            const isActive = item.id === activeId

                                            return (
                                            <div
                                                key={item.id}
                                                className={`border-b border-black/15 bg-white rounded-3xl p-5 cursor-pointer transition-all duration-300 text-[#171717]`}
                                                onClick={() => setActiveId(item.id)}
                                            >
                                                <h3 className="text-[24px] text-[#171717] flex justify-between font-medium font-satoshi">
                                                <div className="flex gap-5 items-center">
                                                    <span className="bg-[#F6F7F8] text-black/50 py-2 rounded-2xl border border-gray-300 px-5">
                                                        {item.icon}
                                                    </span>
                                                    {item.title}
                                                </div>
                                                {
                                                    isActive ? (
                                                    <p className="text-lg text-black/50 flex justify-between font-normal font-sans">
                                                        ( 0{item.id} )
                                                    </p>
                                                    ) : (
                                                    <ChevronDownIcon className="text-[#171717]"/>
                                                    )
                                                }
                                                </h3>

                                                <div
                                                className={`overflow-hidden transition-all duration-700 ${
                                                    isActive ? "max-h-40 mt-3" : "max-h-0"
                                                }`}
                                                >
                                                <p className="text-[16px] p-3 bg-[#F6F7F8] border font-sans font-medium rounded-2xl border-black/10 text-[#404040]  opacity-80">
                                                    {item.content}
                                                </p>
                                                </div>
                                            </div>
                                            )
                                        })}
                                        </div>
                                        {/* Image Section */}
                                        <div className="w-full rounded-4xl bg-white p-2 lg:w-1/2">
                                            <div className="relative w-full h-full rounded-4xl overflow-hidden">
                                                <img
                                                src={activeItem?.image}
                                                alt={activeItem?.title}
                                                className="w-full h-full object-cover transition-all duration-700 ease-in-out"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </main>

                            {/* FAQ */}

                             <section
                                ref={sectionRef3}
                                className="w-full pt-36 bg-[#F6F7F8] font-sans"
                                >
                                <div className="max-w-350 mx-auto px-6 pb-32">
                            
                                    {/* Two-column layout */}
                                    <div className="flex flex-col lg:flex-row items-start gap-16">
                            
                                    {/* LEFT — sticky */}
                                    <div
                                        ref={leftRef3}
                                        className="lg:w-2/5 w-full sticky flex flex-col items-start self-start pr-8"
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
                                    <div className="lg:w-3/5 w-full flex gap-6">
                            
                                        {/* Progress line */}
                                        <div className="hidden lg:flex flex-col items-center pt-3 shrink-0">
                                        <div
                                            className="relative w-0.5 bg-[#2369A4]/10 rounded-full overflow-hidden"
                                            style={{ height: `${faqs.length * 88}px` }}
                                        >
                                            <div
                                            ref={progressLineRef3}
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
                                            const isOpen = openIndex === i;
                                            return (
                                            <div
                                                key={faq.id}
                                                ref={(el) => { itemRefs.current[i] = el; }}
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
                        </div>
                        <Footer/>
                    </div>
                </div>
            </div>
        </>
    );
}
