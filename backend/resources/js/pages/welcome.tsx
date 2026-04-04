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

export default function Welcome() {
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

    const slides = [
        {
            title: "Economic & Operational Impact",
            subtitle: "15% to 30% Reduction in Operational Costs",
            image: "./img/CiviLens-impact-1.jpg",
        },
        {
            title: "Smart City Optimization",
            subtitle: "20% Increase in Infrastructure Lifespan",
            image: "./img/CiviLens-impact-2.jpg",
        },
        {
            title: "Citizen Engagement",
            subtitle: "5% to 10% Increase in Tax Compliance",
            image: "./img/CiviLens-impact-3.jpg",
        },
    ];

    const [current, setCurrent] = useState(0);

    useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000); // 4s

    return () => clearInterval(interval);
  }, []);



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
    title: "AI Issue Detection",
    description:
      "Automatically analyzes images and voice reports to identify urban problems quickly and accurately.",
    tag: "Smart Analysis",
  },
  {
    number: "02",
    title: "Real-Time Reporting",
    description:
      "Submit issues instantly with location tracking and keep your city updated in real time.",
    tag: "Live Reports",
  },
  {
    number: "03",
    title: "Intelligent Categorization",
    description:
      "Classifies issues by type and urgency to ensure faster and more efficient resolution.",
    tag: "Auto Sorting",
  },
  {
    number: "04",
    title: "City Analytics Dashboard",
    description:
      "Visualize trends, monitor performance, and make data-driven decisions easily.",
    tag: "Data Insights",
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
        end: () => `+=${totalCards * 190}`,
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
                        <source src="/videos/civilens-vd.mp4" type="video/mp4" />
                    </video>
                    {/* Glass Cursor Effect */}
                    <div className="lens fixed pointer-events-none z-20" />
                </div>
                <div className="fixed bottom-0 inset-x-0 z-10 pointer-events-none">
                    <div className="h-20 backdrop-blur-xs [mask:linear-gradient(to_top,black_20%,rgba(0,0,0,6.0)_50%,rgba(0,0,0,6.0)_50%,rgba(0,0,0,6.0)_45%,rgba(0,0,0,5.0)_30%,rgba(0,0,0,2.5)_15%,transparent_100%)]" />
                </div>

                <div id="smooth-wrapper">
                <div id="smooth-content" className="relative bg-radial from-transparent to-[#F6F7F8] z-10 min-h-screen flex flex-col items-center pt-6 text-[#1b1b18] lg:justify-center">
                    <div className="flex  min-h-screen flex-col items-center p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                        
                        <div className="flex-col w-full mt-32 justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                            <main className="relative flex justify-between gap-36 w-full mx-auto max-w-83.75 lg:max-w-360 lg:flex">

                                {/* LEFT SIDE */}
                                <div className="hidden relative mt-15 lg:flex flex-col gap-6 opacity-70">
                                    <div className="rotate-6 relative space-y-10 py-9">
                                        <div className="pointer-events-none z-10 absolute right-0 top-0 h-32 w-full bg-linear-to-b from-transparent to-transparent" />
                                        <div className="pointer-events-none z-10 absolute left-0 -bottom-10 h-44 w-full bg-linear-to-t from-[#F6F7F8] to-transparent" />
                                        <div className="p-4  w-52 rounded-xl bg-white backdrop-blur-md shadow-lg border border-white/40">
                                            <p className="text-sm font-sans text-gray-700">
                                                “Amazing civic insights 🚀”
                                            </p>
                                        </div>

                                        <div className="p-4 w-52 -rotate-6 rounded-xl bg-white backdrop-blur-md shadow-lg border border-white/40">
                                            <p className="text-sm font-sans text-gray-700">
                                                “Data-driven decisions simplified”
                                            </p>
                                        </div>

                                        <div className="p-4 w-44 -rotate-12 rounded-xl bg-white backdrop-blur-md shadow-lg border border-white/40">
                                            <p className="text-sm font-sans text-gray-700">
                                                “Smart city tools powered by AI”
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* HERO CENTER */}
                                <div className="flex flex-col z-50 max-w-2xl items-center text-center gap-6 lg:gap-8">
                                    <span className="px-4 py-1.5 text-xs border border-[#236aa41e] shadow-lg shadow-[#236aa41e] font-semibold flex items-center gap-2 tracking-wider text-black backdrop-blur-xs bg-linear-150 from-white to-white/40 uppercase rounded-full">
                                        <span className="text-[#2369A4] text-xl">•</span>
                                        Welcome to civicLens
                                    </span>

                                    <h1 className="text-2xl font-bold font-satoshi -tracking-wide leading-12 text-[#171717] sm:text-[48px]">
                                        Smarter Cities Start With Smarter Reporting
                                    </h1>

                                    <p className="text-[18px] max-w-lg font-sans text-[#404040]">
                                        CivicLens AI empowers citizens to report urban issues using AI-powered tools — transforming complaints into actionable insights for municipalities.
                                    </p>
                                    <div className="flex gap-6">
                                        <a href='/contact' className="flex items-center shadow-xl shadow-[#2771ad92] gap-4 justify-between bg-[#2369A4] text-white pr-2 pl-6 py-2 rounded-4xl text-md">
                                            Book A Call
                                            <span className="border bg-[#2771ad] border-white/15 rounded-4xl py-1.5 px-4">
                                            <ArrowRightIcon size={20} />
                                            </span>
                                        </a>
                                        <a href="/service" className="flex items-center gap-4 justify-between border border-[#c0c0c08b] bg-white text-black px-6 py-2 rounded-4xl text-md">
                                            View Services
                                        </a>
                                    </div>
                                    <div className="flex gap-5">
                                        <div className="flex -gap-8">
                                            <img width={37} className="rounded-full border border-white" src="./img/rv-4.jpg" alt="rv-1" />
                                            <img width={37} className="rounded-full border border-white -ml-2" src="./img/rv-1.jpg" alt="rv-1" />
                                            <img width={37} className="rounded-full border border-white -ml-2" src="./img/rv-3.jpg" alt="rv-1" />
                                            <img width={37} className="rounded-full border border-white -ml-2" src="./img/rv-2.jpg" alt="rv-1" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <img width={70} src="./svg/5-stars-svg.svg" alt="5-stars-svg" />
                                            <p className="text-[12px] text-[#171717]">From 150+ reviews</p>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT SIDE */}
                                <div className="hidden mt-18 z-10 lg:flex bg-linear-to-b from white/0 to-transparent flex-col gap-6 opacity-70">
                                    <div className=" relative h-[61vh] space-y-10">                                        
                                        <div className="p-4 w-48 rounded-xl bg-white backdrop-blur-md shadow-lg border border-white/40">
                                            <p className="text-sm font-sans text-gray-700">
                                                “Citizens engagement redefined”
                                            </p>
                                        </div>

                                        <div className="p-4 w-52 rotate-6 rounded-xl bg-white backdrop-blur-md shadow-lg border border-white/40">
                                            <p className="text-sm font-sans text-gray-700">
                                                “AI + civic = powerful”
                                            </p>
                                        </div>

                                        <div className="p-4 w-44 rotate-12 rounded-xl bg-white backdrop-blur-md shadow-lg border border-white/40">
                                            <p className="text-sm font-sans text-gray-700">
                                                “Build smarter communities”
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            </main>

                            <section className="relative flex z-10 bg-white max-w-340 rounded-[3rem] w-full  mx-auto border border-[#236aa41e] shadow-lg shadow-black/15 overflow-hidden">

                                {/* Slides */}
                                <div
                                    className="flex z-50 transition-transform  max-w-340 duration-700 ease-in-out"
                                    style={{ transform: `translateX(-${current * 100}%)` }}
                                >
                                    {slides.map((slide, index) => (
                                    <div key={index} className="min-w-full">
                                        <div className="flex rounded-[3rem] p-2 flex-col">

                                        <div className="flex w-full justify-between">
                                            <div className="flex gap-7 p-4 items-center">
                                            <h2 className="text-[24px] font-satoshi font-medium">
                                                {slide.title}
                                            </h2>
                                            <p className="text-[16px] font-sans text-[#525252]">
                                                {slide.subtitle}
                                            </p>
                                            </div>

                                            <a href="/services" className="flex items-center font-satoshi gap-4 bg-white text-[#525252] px-6 py-2 rounded-4xl text-xl font-medium">
                                            View Services
                                            <span className="border bg-[#F6F7F8] border-[#c0c0c08b] rounded-4xl py-1.5 px-4">
                                                <ArrowRightIcon size={20} />
                                            </span>
                                            </a>
                                        </div>

                                        <div className="mt-5">
                                            <img
                                            className="rounded-[3rem] h-187 w-full object-cover"
                                            src={slide.image}
                                            alt={slide.title}
                                            />
                                        </div>
                                        </div>
                                    </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                                    {slides.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrent(index)}
                                        className={`h-2.5 rounded-full transition-all duration-300 ${
                                        current === index
                                            ? "w-8 bg-black"
                                            : "w-2.5 bg-gray-300"
                                        }`}
                                    />
                                    ))}
                                </div>
                            </section>

                            <section className="bg-[#F6F7F8] max-w-screen w-screen pt-48 mt-0 flex flex-col">
                                <div className="flex flex-col items-center mx-auto justify-center">
                                    <span className="text-md font-medium flex items-center gap-2 tracking-wider text-[#525252] rounded-full">
                                        <span className="text-[#2369A4] text-3xl">•</span>
                                        CivicLens
                                    </span>
                                    <h3 className="font-satoshi text-center mt-5 -tracking-wide leading-[2.8rem] font-bold text-[40px] text-[#171717]">
                                        CivicLens makes it simple,
                                        <br/>
                                        <span className="text-[#2369A4]">
                                            and delivers results.
                                        </span>
                                    </h3>
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
                                                    <span className="bg-[#F6F7F8] py-2 rounded-2xl border border-gray-300 px-5">
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
                                                <p className="text-[16px] text-[#404040] max-w-md opacity-80">
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
                            <main className="w-full flex-col h-full pt-24 max-w-full bg-[#F6F7F8] font-sans justify-center">
                                <div className="flex-col justify-between gap-7">
                            
                                    {/* ── STICKY LEFT + SCROLL RIGHT ── */}
                                    <section
                                    ref={sectionRef}
                                    className="flex flex-col lg:flex-row items-start gap-16 max-w-350 mx-auto px-6 pb-32 relative"
                                    >
                                    {/* LEFT — sticky panel */}
                                    <div
                                        ref={leftRef}
                                        className="lg:w-1/2 w-full sticky self-start flex flex-col items-start py-16 pr-8"
                                    >
                                        <div className="relative">
                                        {/* Decorative background blob */}
                                        <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-[#2369A4]/5 blur-3xl pointer-events-none" />
                            
                                        <button className="px-4 font-satoshi py-1.5 text-xs border border-[#236aa41e] shadow-lg shadow-[#236aa41e] font-semibold flex items-center gap-2 tracking-wider text-black backdrop-blur-sm uppercase rounded-full">
                                        <span className="text-[#2369A4] text-xl">•</span>
                                        About
                                        </button>
                            
                                        <h2 className="text-[40px] font-satoshi -tracking-wide font-bold mt-6 text-[#171717] leading-[1.1] mb-6">
                                            Transforming Urban
                                            <br />
                                            <span className="text-[#2369A4]">Reporting with AI.</span>
                                        </h2>
                            
                                        <p className="text-[#585858] text-[18px] leading-relaxed max-w-lg mb-10">
                                            CivicLens AI connects citizens and municipalities through
                                            intelligent, real-time issue reporting powered by artificial
                                            intelligence.
                                        </p>
                            
                                        {/* Stats row */}
                                        <div className="flex gap-8">
                                            {[
                                            { value: "97%", label: "Detection accuracy" },
                                            { value: "4×", label: "Faster resolution" },
                                            { value: "120+", label: "Cities live" },
                                            ].map((s) => (
                                            <div key={s.label}>
                                                <p className="text-3xl font-bold text-[#171717]">{s.value}</p>
                                                <p className="text-xs text-[#585858] mt-1">{s.label}</p>
                                            </div>
                                            ))}
                                        </div>
                                        </div>
                                    </div>
                            
                                    {/* RIGHT — scrollable cards + progress line */}
                                    <div className="lg:w-1/2 w-full flex gap-6 pt-16">
                                        {/* Progress line track */}
                                        <div className="hidden lg:flex flex-col items-center pt-3 shrink-0">
                                        <div  className="relative w-0.5 bg-gray-300 rounded-full overflow-hidden"
                                            style={{ height: `${cards.length * 220}px` }}>
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
                            
                                        {/* Cards stack */}
                                        <div className="flex flex-col gap-6 flex-1">
                                        {cards.map((card, i) => (
                                            <div
                                            key={card.number}
                                            ref={(el) => { cardRefs.current[i] = el; }}
                                            className="group bg-white border border-[#E8EBF0] rounded-2xl p-7 shadow-sm hover:shadow-md hover:border-[#2369A4]/20 transition-all duration-300 relative overflow-hidden"
                                            >
                                            {/* Hover accent */}
                                            <div className="absolute inset-0 bg-linear-to-br from-[#2369A4]/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                            
                                            <div className="relative z-10">
                                                {/* Number + tag row */}
                                                <div className="flex items-center justify-between mb-4">
                                                <span className="text-4xl font-bold text-[#2369A4]/15 font-sans">
                                                    {card.number}
                                                </span>
                                                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#2369A4] bg-[#2369A4]/8 px-3 py-1 rounded-full">
                                                    {card.tag}
                                                </span>
                                                </div>
                            
                                                <h4 className="text-xl font-bold text-[#171717] mb-3 leading-snug">
                                                {card.title}
                                                </h4>
                                                <p className="text-[#585858] text-sm leading-relaxed">
                                                {card.description}
                                                </p>
                            
                                                {/* Bottom accent line */}
                                                <div className="mt-5 h-0.5 w-8 bg-[#2369A4] rounded-full group-hover:w-16 transition-all duration-300" />
                                            </div>
                                            </div>
                                        ))}
                                        </div>
                                    </div>
                                    </section>
                            
                                </div>
                                </main>
                                <section className="bg-[#F6F7F8] max-w-screen w-screen pt-48 mt-0 flex flex-col">
                                <div className="flex flex-col items-center mx-auto justify-center">
                                    <span className="text-md font-medium flex items-center gap-2 tracking-wider text-[#525252] rounded-full">
                                        <span className="text-[#2369A4] text-3xl">•</span>
                                        Impact & Benefits
                                    </span>
                                    <h3 className="font-satoshi text-center mt-5 -tracking-wide leading-[2.8rem] font-bold text-[40px] text-[#171717]">
                                        Measurable Impact 
                                        <br/>
                                        <span className="text-[#2369A4]">
                                            For Cities and Communities.
                                        </span>
                                    </h3>
                                </div>
                                <div className=" bg-white p-5 inset-shadow-zinc-200 rounded-[3rem] border border-gray-300  mx-auto max-w-340 mt-16">
                                    <h2 className="text-center text-3xl font-satoshi text-[#171717] -tracking-wide mb-7 font-bold">For Citizens</h2>
                                    <div className="grid grid-cols-2 gap-5">
                                        {/* card1 */}
                                        <div className="bg-white  flex flex-col shadow-xl gap-3 p-7 rounded-4xl border border-[#8b87873c]">
                                            <h2 className="text-[32px] text-[#171717] font-satoshi flex items-center gap-3 font-bold">+70% <span className="text-lg">Speed</span></h2>
                                            <p className="font-satoshi font-medium -tracking-wide text-[#5d636f] text-[24px]">Faster Issue Reporting</p>
                                            <p className="text-[16px] font-sans text-[#737373]">Citizens can report issues in seconds using photos, voice, or text, eliminating long forms and manual processes. This significantly reduces the time required to submit a complaint and increases overall participation.</p>
                                        </div>
                                        {/* card2 */}
                                        <div className="bg-white flex flex-col shadow-xl gap-3 p-7 rounded-4xl border border-[#8b87873c]">
                                            <h2 className="text-[32px] text-[#171717] font-satoshi flex items-center gap-3 font-bold">+85% <span className="text-lg">Visibility</span></h2>
                                            <p className="font-satoshi font-medium -tracking-wide text-[#5d636f] text-[24px]">Real-Time Transparency</p>
                                            <p className="text-[16px] font-sans text-[#737373]">Users can track their reports in real time, from submission to resolution, ensuring full transparency and building trust between citizens and local authorities.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 bg-white p-5 rounded-[3rem] mt-16 gap-5 max-w-340 mx-auto">
                                        {/* card3 */}
                                        <div className="bg-white flex flex-col shadow-xl gap-3 p-7 rounded-4xl border border-[#8b87873c]">
                                            <h2 className="text-[32px] text-[#171717] font-satoshi flex items-center gap-3 font-bold">+60% <span className="text-lg">Participation</span></h2>
                                            <p className="font-satoshi font-medium -tracking-wide text-[#5d636f] text-[24px]">Improved Community Engagement</p>
                                            <p className="text-[16px] font-sans text-[#737373]">By simplifying the reporting process, CivicLens AI encourages more citizens to actively contribute to improving their city, creating a stronger sense of community involvement.</p>
                                        </div>
                                        {/* card4 */}
                                        <div className="bg-white flex flex-col shadow-xl gap-3 p-7 rounded-4xl border border-[#8b87873c]">
                                            <h2 className="text-[32px] text-[#171717] font-satoshi flex items-center gap-3 font-bold">+75% <span className="text-lg">Efficiency</span></h2>
                                            <p className="font-satoshi font-medium -tracking-wide text-[#5d636f] text-[24px]">Better Communication with Authorities</p>
                                            <p className="text-[16px] font-sans text-[#737373]">The platform creates a direct and structured communication channel between citizens and municipalities, reducing misunderstandings and improving response clarity.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Second section */}

                                <div className=" bg-white p-5 rounded-[3rem] border border-gray-300 mx-auto max-w-340 mt-16">
                                    <h2 className="text-center text-3xl font-satoshi text-[#171717] -tracking-wide mb-7 font-bold">For Municipalities</h2>
                                    <div className="grid grid-cols-2 gap-5">
                                        {/* card1 */}
                                        <div className="bg-white flex flex-col shadow-xl gap-3 p-7 rounded-4xl border border-[#8b87873c]">
                                            <h2 className="text-[32px] text-[#171717] font-satoshi flex items-center gap-3 font-bold">+50% <span className="text-lg">Resolution Time</span></h2>
                                            <p className="font-satoshi font-medium -tracking-wide text-[#5d636f] text-[24px]">Faster Response Time</p>
                                            <p className="text-[16px] font-sans text-[#737373]">Automated categorization and prioritization allow city teams to respond faster, reducing delays and improving overall service efficiency.</p>
                                        </div>
                                        {/* card2 */}
                                        <div className="bg-white flex flex-col shadow-xl gap-3 p-7 rounded-4xl border border-[#8b87873c]">
                                            <h2 className="text-[32px] text-[#171717] font-satoshi flex items-center gap-3 font-bold">+65% <span className="text-lg">Optimization</span></h2>
                                            <p className="font-satoshi font-medium -tracking-wide text-[#5d636f] text-[24px]">Smarter Resource Allocation</p>
                                            <p className="text-[16px] font-sans text-[#737373]">With AI-driven insights, municipalities can allocate teams and resources more effectively, focusing on high-priority issues and critical areas.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 bg-white p-5 rounded-[3rem] mt-16 gap-5 max-w-340 mx-auto">
                                        {/* card3 */}
                                        <div className="bg-white flex flex-col shadow-xl gap-3 p-7 rounded-4xl border border-[#8b87873c]">
                                            <h2 className="text-[32px] text-[#171717] font-satoshi flex items-center gap-3 font-bold">+80% <span className="text-lg">Insight Accuracy</span></h2>
                                            <p className="font-satoshi font-medium -tracking-wide text-[#5d636f] text-[24px]">Data-Driven Decision Making</p>
                                            <p className="text-[16px] font-sans text-[#737373]">Advanced analytics provide actionable insights into trends, recurring problems, and performance metrics, helping authorities make informed decisions.</p>
                                        </div>
                                        {/* card4 */}
                                        <div className="bg-white flex flex-col shadow-xl gap-3 p-7 rounded-4xl border border-[#8b87873c]">
                                            <h2 className="text-[32px] text-[#171717] font-satoshi flex items-center gap-3 font-bold">+90% <span className="text-lg">Organization</span></h2>
                                            <p className="font-satoshi font-medium -tracking-wide text-[#5d636f] text-[24px]">Centralized Issue Management</p>
                                            <p className="text-[16px] font-sans text-[#737373]">All reports are managed in a single dashboard, allowing teams to track, filter, and resolve issues efficiently without scattered systems.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

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
