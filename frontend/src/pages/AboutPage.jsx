import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { 
  Sparkles, 
  ArrowRight, 
  Compass, 
  Globe2, 
  GraduationCap, 
  Building2, 
  UserCheck, 
  Briefcase, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  ShieldCheck, 
  Target,
  Linkedin, 
  Instagram, 
  CheckCircle2, 
  Mail, 
  Plus, 
  FileText, 
  Check, 
  ArrowUpRight,
  BookOpen,
  Award,
  Cpu,
  HeartHandshake,
  Star,
  Send,
  Workflow,
  Lightbulb,
  Rocket,
  Bot
} from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

// Real partner institutions with monochromatic brand style
const PARTNERS = [
  { name: "IIT Bombay", type: "Academic Partner", logoText: "IIT Bombay" },
  { name: "IIT Madras", type: "Ecosystem Partner", logoText: "IIT Madras" },
  { name: "IIT Hyderabad", type: "Academic Partner", logoText: "IIT Hyderabad" },
  { name: "SRM University", type: "Ecosystem Partner", logoText: "SRM" },
  { name: "T-Hub", type: "Ecosystem Partner", logoText: "T-Hub" }
];

// Framer motion variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
};

// Purple Floating Blobs background matching the color system
const PurpleFloatingBlobs = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
    <motion.div
      animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[-10%] left-[-5%] w-[450px] h-[450px] rounded-full"
      style={{ background: "radial-gradient(circle, rgba(108, 99, 255, 0.25) 0%, transparent 70%)", filter: "blur(90px)" }}
    />
    <motion.div
      animate={{ x: [0, -30, 30, 0], y: [0, 40, -20, 0], scale: [1, 0.9, 1.1, 1] }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[25%] right-[-8%] w-[500px] h-[500px] rounded-full"
      style={{ background: "radial-gradient(circle, rgba(255, 77, 148, 0.2) 0%, transparent 70%)", filter: "blur(95px)" }}
    />
    <motion.div
      animate={{ x: [0, 20, -20, 0], y: [0, 30, -30, 0], scale: [1, 1.05, 0.95, 1] }}
      transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-[15%] left-[15%] w-[550px] h-[550px] rounded-full"
      style={{ background: "radial-gradient(circle, rgba(255, 122, 24, 0.16) 0%, transparent 70%)", filter: "blur(100px)" }}
    />
  </div>
);

// Curved SVG dividers for premium fluid transitions
const CurvedDivider = ({ fill = "#ffffff", className = "", flip = false }) => (
  <div className={`w-full overflow-hidden leading-[0] ${flip ? "transform rotate-180" : ""} ${className}`}>
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[40px] md:h-[60px]">
      <path 
        d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V30.28C1129.74,56.24,1065,113.96,985.66,92.83Z" 
        fill={fill}
      />
    </svg>
  </div>
);

const DiagonalDivider = ({ fill = "#ffffff", className = "" }) => (
  <div className={`w-full overflow-hidden leading-[0] ${className}`}>
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[30px] md:h-[50px]">
      <path d="M1200,0 L0,120 L1200,120 Z" fill={fill} />
    </svg>
  </div>
);

// Animated metrics counter component
const AnimatedCounter = ({ value, label, index }) => {
  const [count, setCount] = useState(0);
  const numericVal = parseInt(value.replace(/[^0-9]/g, ""));
  const suffix = value.replace(/[0-9,]/g, "");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 2000;
    const stepTime = Math.max(Math.floor(duration / numericVal), 25);
    const increment = Math.ceil(numericVal / 40);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= numericVal) {
        setCount(numericVal);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [numericVal, isInView]);

  return (
    <div ref={ref} className="relative group" data-testid={`impact-card-${index}`}>
      {/* Glow on hover */}
      <div className="absolute -inset-1.5 bg-[#7C3AED]/20 rounded-[24px] blur-xl opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />
      
      <div className="relative bg-white/70 backdrop-blur-2xl border border-white/60 rounded-[24px] p-6 text-center shadow-[0_8px_32px_rgba(0,0,0,0.03)] hover:-translate-y-1.5 hover:border-[#7C3AED]/40 transition duration-300">
        <span className="block font-display text-4xl md:text-5xl font-extrabold tracking-tighter text-[#7C3AED]">
          {count.toLocaleString()}{suffix}
        </span>
        <span className="block mt-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
          {label}
        </span>
      </div>
    </div>
  );
};

export default function AboutPage() {
  const [subCount, setSubCount] = useState(5124);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  
  // Mentor form modal state
  const [mentorModalOpen, setMentorModalOpen] = useState(false);
  const [mentorName, setMentorName] = useState("");
  const [mentorCompany, setMentorCompany] = useState("");
  const [mentorExpertise, setMentorExpertise] = useState("");
  const [mentorEmail, setMentorEmail] = useState("");

  // Founder image load error handler
  const [founderImgError, setFounderImgError] = useState(false);

  // Mouse Parallax coordinates for Hero
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Confetti particles state
  const [confetti, setConfetti] = useState([]);

  // Mouse Parallax handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX - window.innerWidth / 2) / 40,
        y: (e.clientY - window.innerHeight / 2) / 40,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Fetch newsletter count
  useEffect(() => {
    api.get("/newsletter/count")
      .then(res => {
        if (res.data?.count) {
          setSubCount(res.data.count);
        }
      })
      .catch(() => {
        // Fallback to static count
      });
  }, []);

  const triggerConfetti = () => {
    const particles = [...Array(40)].map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 450,
      y: (Math.random() - 0.75) * 350,
      color: ["#7C3AED", "#8C85FF", "#5549E0", "#A5B4FC", "#C7D2FE"][i % 5],
      scale: Math.random() * 0.7 + 0.4,
      rotation: Math.random() * 360
    }));
    setConfetti(particles);
    setTimeout(() => setConfetti([]), 2000);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      const res = await api.post("/newsletter", { email, source: "about-newsletter" });
      if (res.data?.already_subscribed) {
        toast.success("You are already subscribed to the founder briefing.");
      } else {
        toast.success("Successfully subscribed to India's startup briefing!");
        setSubCount(prev => prev + 1);
      }
      setEmail("");
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
    } catch (e) {
      toast.error("Could not subscribe. Please check your connection.");
    } finally {
      setSubscribing(false);
    }
  };

  const submitMentorApplication = (e) => {
    e.preventDefault();
    if (!mentorName || !mentorEmail) return;
    toast.success(`Thank you ${mentorName}! Your application to mentor at STUDLYF has been received.`);
    setMentorName("");
    setMentorCompany("");
    setMentorExpertise("");
    setMentorEmail("");
    setMentorModalOpen(false);
  };

  return (
    <div className="relative bg-[#F3F6FB] text-gray-900 overflow-x-hidden min-h-screen font-sans" data-testid="about-us-page">
      <Navbar onGetStarted={() => setMentorModalOpen(true)} onLogin={() => setMentorModalOpen(true)} />
      
      <main className="relative z-10 pt-24">

        {/* MEET OUR FOUNDER SECTION */}
        <motion.section 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          variants={staggerContainer}
          className="relative py-20 bg-[#EEF3FA]" 
          id="founder" 
          data-testid="founder-section"
        >
          {/* Subtle background blob */}
          <div className="absolute top-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[#7C3AED]/5 blur-[100px] pointer-events-none" />
          
          <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
            {/* LEFT SIDE: Portrait card styled as a white rounded container with shadow & glow */}
            <motion.div variants={fadeUp} className="lg:col-span-5 flex justify-center">
              <div className="relative group max-w-sm w-full bg-white border border-gray-100 rounded-[28px] p-3 shadow-md">
                {/* Glow using brand color */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-[#7C3AED] via-[#EC4899] to-[#A855F7] rounded-[30px] blur-xl opacity-0 group-hover:opacity-20 transition duration-500 pointer-events-none" />
                
                <motion.div 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative p-1 rounded-[22px] bg-gradient-to-tr from-[#7C3AED] via-[#EC4899] to-[#A855F7] shadow-inner w-full aspect-[4/5] flex items-center justify-center overflow-hidden"
                >
                  {!founderImgError ? (
                    <img 
                      src="/sai_eshwar.jpg" 
                      alt="E Sai Eshwar" 
                      onError={() => setFounderImgError(true)}
                      className="w-full h-full object-cover rounded-[18px] bg-white z-10"
                    />
                  ) : (
                    /* Fallback Initials Card styled exclusively in purple brand style */
                    <div className="w-full h-full rounded-[18px] bg-gradient-to-br from-indigo-950 to-slate-900 flex flex-col items-center justify-center text-white p-6 text-center z-10">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#7C3AED] via-[#EC4899] to-[#A855F7] flex items-center justify-center font-display font-black text-4xl shadow-md mb-4 text-white">
                        ESE
                      </div>
                      <h4 className="font-display font-bold text-xl">E Sai Eshwar</h4>
                      <p className="text-xs text-indigo-300 font-bold mt-1">Founder & CEO, STUDLYF</p>
                      <span className="text-[9px] text-gray-400 mt-4 max-w-xs font-normal">
                        (Upload portrait as `sai_eshwar.jpg` in `public/` directory to load here)
                      </span>
                    </div>
                  )}
                  
                  {/* Hover detail box */}
                  <div className="absolute bottom-6 left-6 right-6 glass border border-white/60 rounded-2xl p-4 text-left z-20 shadow-md">
                    <h4 className="text-sm font-bold text-gray-900 font-display">E Sai Eshwar</h4>
                    <p className="text-[10px] text-gray-500 font-bold mt-0.5">Founder & CEO, STUDLYF</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
 
            {/* RIGHT SIDE: Story & Highlights */}
            <motion.div variants={fadeUp} className="lg:col-span-7 space-y-6 text-left">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] text-xs font-bold uppercase tracking-wider">
                Founder & CEO
              </span>
              
              <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                Empowering India's Next Generation of <span className="brand-gradient-text">Entrepreneurs</span>.
              </h2>
              
              <div className="space-y-4 text-gray-600 text-sm md:text-base leading-relaxed font-normal">
                <p>
                  Over the years, Sai Eshwar has worked across student and startup ecosystems in Telangana, Andhra Pradesh, and Chennai, helping founders transform ideas into real startups.
                </p>
                <p>
                  He has built a thriving community of over 5,000 students, mentored early-stage founders, collaborated with prestigious institutions including IIT Bombay, IIT Madras, IIT Hyderabad, and SRM University, and supported founders through startup validation, positioning, and investor readiness.
                </p>
              </div>
 
              {/* Achievements, Mission, Vision Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="bg-white rounded-[20px] p-4 border border-gray-150/75 shadow-sm hover:-translate-y-1 hover:border-[#7C3AED]/30 transition duration-300">
                  <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#7C3AED] mb-3">
                    <Award className="w-4 h-4" />
                  </span>
                  <h4 className="text-xs font-bold text-gray-900 font-display">Achievements</h4>
                  <p className="text-[10px] text-gray-500 mt-1 font-medium leading-relaxed">
                    Mentored 100+ early startup teams & speaker at premium IIT campuses.
                  </p>
                </div>
                <div className="bg-white rounded-[20px] p-4 border border-gray-150/75 shadow-sm hover:-translate-y-1 hover:border-[#7C3AED]/30 transition duration-300">
                  <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#7C3AED] mb-3">
                    <Target className="w-4 h-4" />
                  </span>
                  <h4 className="text-xs font-bold text-gray-900 font-display">Our Mission</h4>
                  <p className="text-[10px] text-gray-500 mt-1 font-medium leading-relaxed">
                    Provide raw engineering curiosity with structured validation.
                  </p>
                </div>
                <div className="bg-white rounded-[20px] p-4 border border-gray-150/75 shadow-sm hover:-translate-y-1 hover:border-[#7C3AED]/30 transition duration-300">
                  <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#7C3AED] mb-3">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h4 className="text-xs font-bold text-gray-900 font-display">Our Vision</h4>
                  <p className="text-[10px] text-gray-500 mt-1 font-medium leading-relaxed">
                    Build a globally competitive ecosystem powered by collaborate-first AI.
                  </p>
                </div>
              </div>
 
              {/* Social profile links styled in brand colors */}
              <div className="flex gap-4 pt-6 border-t border-indigo-100">
                <a 
                  href="https://www.linkedin.com/company/studlyf/?viewAsMember=true" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="glow-button rounded-full px-6 py-3 text-xs font-bold inline-flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition duration-300 shadow-md"
                  data-testid="founder-linkedin"
                >
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
                <a 
                  href="https://www.instagram.com/studlyf.in/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="rounded-full px-6 py-3 text-xs font-bold inline-flex items-center justify-center gap-2 border border-[#7C3AED] text-[#7C3AED] bg-white hover:bg-indigo-50/50 hover:scale-[1.02] active:scale-[0.98] transition duration-300 shadow-sm"
                  data-testid="founder-instagram"
                >
                  <Instagram className="w-4 h-4" /> Instagram
                </a>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* FOUNDER QUOTE HIGHLIGHT BLOCK */}
        <motion.section 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="py-14 bg-[#EEF3FA]"
        >
          <div className="max-w-[1000px] mx-auto px-5">
            <div className="relative rounded-[28px] p-8 md:p-12 bg-[#E8EEF8]/60 backdrop-blur-md border border-[#7C3AED]/15 shadow-sm text-center overflow-hidden">
              <div className="absolute top-[-10px] left-6 font-serif text-8xl text-indigo-200/20 select-none pointer-events-none">“</div>
              <div className="absolute bottom-[-50px] right-6 font-serif text-8xl text-indigo-200/20 select-none pointer-events-none">”</div>
              
              <p className="font-display font-medium text-lg sm:text-xl md:text-2xl text-gray-800 leading-relaxed max-w-3xl mx-auto italic relative z-10">
                "The future belongs to those who build. Our mission at STUDLYF is to help every student and founder move from ideas to execution with confidence, clarity, and the power of AI."
              </p>
              
              <div className="mt-6 flex flex-col items-center">
                <span className="w-8 h-0.5 bg-[#7C3AED] rounded-full mb-3" />
                <span className="text-xs font-bold tracking-widest text-[#7C3AED] uppercase font-display">E Sai Eshwar</span>
                <span className="text-[10px] text-gray-400 mt-1 font-semibold">Founder & CEO, STUDLYF</span>
              </div>
            </div>
          </div>
        </motion.section>
        {/* SECTION DIVIDER */}
        <CurvedDivider fill="#E8EEF8" className="z-10" />

        {/* PARTNERS LOGO STRIP */}
        <motion.section 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="py-10 bg-[#E8EEF8] border-b border-gray-150/50"
        >
          <div className="max-w-[1400px] mx-auto px-5 md:px-8 text-center space-y-5">
            <span className="text-[10px] font-extrabold tracking-[0.25em] uppercase text-gray-400">
              TRUSTED ACROSS INDIA'S LEADING ECOSYSTEMS
            </span>
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
              {PARTNERS.map((partner, idx) => (
                <div 
                  key={idx} 
                  className="px-5 py-2.5 rounded-xl bg-white border border-gray-150/70 shadow-sm text-xs font-bold text-gray-500 hover:text-[#7C3AED] hover:border-[#7C3AED]/30 transition duration-300"
                >
                  {partner.name}
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* SECTION DIVIDER */}
        <CurvedDivider fill="#F3F6FB" className="z-10" flip={true} />

        {/* IMPACT STATISTICS */}
        <motion.section 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          variants={staggerContainer}
          className="relative py-20 bg-[#F3F6FB]"
        >
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #EC4899 0%, transparent 70%)", filter: "blur(90px)" }} />
          
          <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12 text-center space-y-16">
            <motion.div variants={fadeUp} className="space-y-4">
              <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.22em] uppercase text-[#7C3AED]">
                <span className="w-6 h-px bg-gradient-to-r from-[#7C3AED] to-[#EC4899]" /> OUR IMPACT
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                Empowering India's <span className="brand-gradient-text">Startup Ecosystem</span>
              </h2>
            </motion.div>

            {/* Grid of animated counter cards */}
            <motion.div variants={staggerContainer} className="grid grid-cols-2 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
              {IMPACT_METRICS.map((m, idx) => (
                <motion.div key={idx} variants={fadeUp}>
                  <AnimatedCounter 
                    value={m.value} 
                    label={m.label} 
                    index={idx}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>



        {/* NEWSLETTER: Clean Purple Glassmorphic Section */}
        <motion.section 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          variants={fadeUp}
          className="py-20 bg-[#F3F6FB]" 
          id="newsletter"
        >
          <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12">
            <div className="relative overflow-hidden rounded-[32px] p-8 md:p-16 border border-white/10 shadow-xl" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #A855F7 100%)" }}>
              {/* Glass overlay */}
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] pointer-events-none" />
              
              {/* Animated soft brand blobs */}
              <div 
                className="absolute -top-32 -right-20 w-[420px] h-[420px] rounded-full opacity-20 pointer-events-none"
                style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)", filter: "blur(60px)" }} 
              />
              <div 
                className="absolute -bottom-24 -left-10 w-[360px] h-[360px] rounded-full opacity-20 pointer-events-none"
                style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)", filter: "blur(50px)" }} 
              />

              <div className="relative grid lg:grid-cols-12 gap-10 items-center text-left z-10">
                {/* Text Side */}
                <div className="lg:col-span-7 space-y-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wider">
                    <Mail className="w-3.5 h-3.5 text-white" /> Subscription Hub
                  </span>
                  <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tighter text-white">
                    Stay Connected with India's Startup Ecosystem
                  </h2>
                  <p className="text-indigo-100 text-sm md:text-base leading-relaxed font-normal max-w-xl">
                    Receive startup news, AI updates, founder stories, funding announcements, events, hackathons and exclusive opportunities directly in your inbox.
                  </p>
                  <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest pt-2">
                    Join {subCount.toLocaleString()}+ active builders & mentors
                  </p>
                </div>

                {/* Form Side */}
                <div className="lg:col-span-5 space-y-6">
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3" data-testid="newsletter-form">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@startup.com"
                      className="flex-1 px-5 py-4 rounded-full bg-white/10 border border-white/20 focus:outline-none focus:bg-white focus:text-gray-900 focus:border-white text-sm text-white placeholder-indigo-100 transition"
                      data-testid="newsletter-email"
                    />
                    <button
                      type="submit"
                      disabled={subscribing}
                      className="rounded-full px-8 py-4 text-sm font-semibold inline-flex items-center justify-center gap-2 bg-white text-gray-900 hover:scale-[1.03] active:scale-[0.98] transition duration-300 disabled:opacity-70 shrink-0 shadow-md"
                      data-testid="newsletter-submit"
                    >
                      {subscribing ? "Sending..." : subscribed ? <><CheckCircle2 className="w-4 h-4" /> Subscribed</> : <>Subscribe <Send className="w-4 h-4" /></>}
                    </button>
                  </form>
                  
                  {/* Floating inbox message widget */}
                  <motion.div 
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-3 shadow-md"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white text-sm shadow-sm">📥</div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-white">Founder Briefing</p>
                      <p className="text-[10px] text-indigo-100 font-semibold">Sent every Friday • Frameworks & Prompts</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION DIVIDER */}
        <DiagonalDivider fill="#EEF3FA" className="z-10" />

        {/* CALL TO ACTION: Large Purple Gradient Container */}
        <motion.section 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          variants={fadeUp}
          className="py-20 bg-[#EEF3FA] relative overflow-hidden text-white" 
          id="cta-bottom"
        >
          <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12">
            <div 
              className="relative rounded-[36px] p-10 md:p-20 overflow-hidden shadow-2xl text-center"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #A855F7 100%)" }}
            >
              {/* Confetti Explosion particles */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                {confetti.map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                    animate={{ x: c.x, y: c.y, opacity: 0, rotate: c.rotation }}
                    transition={{ duration: 1.6, ease: "easeOut" }}
                    className="absolute w-2 h-2 rounded-full"
                    style={{ backgroundColor: c.color, scale: c.scale }}
                  />
                ))}
              </div>

              {/* Background floating geometric shapes */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-white/5 blur-[8px] animate-pulse" />
                <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-white/5 blur-[10px]" />
              </div>

              <div className="relative z-10 space-y-6 max-w-xl mx-auto">
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-none">
                  Ready to Build the Future?
                </h2>
                <p className="text-white/95 text-sm md:text-base leading-relaxed font-normal">
                  Launch your startup business models, generate investor assets, or browse university innovation directories.
                </p>
                <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
                  <button 
                    onClick={() => { triggerConfetti(); setMentorModalOpen(true); }}
                    className="rounded-full px-8 py-4 text-sm font-semibold bg-white text-gray-900 hover:scale-[1.03] hover:shadow-[0_15px_40px_rgba(0,0,0,0.15)] active:scale-[0.98] transition duration-300 shadow-md font-display"
                    data-testid="cta-get-started"
                  >
                    Get Started
                  </button>
                  <a 
                    href="/discover"
                    className="px-8 py-4 text-sm font-semibold rounded-full border border-white/35 hover:border-white text-white hover:bg-white/10 hover:scale-[1.02] transition duration-300 flex items-center gap-2 shadow-sm font-display"
                    data-testid="cta-explore-discover"
                  >
                    Explore Discover
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

      </main>

      <Footer />

      {/* MENTOR APPLICATION MODAL (Strictly monochromatic purple styled) */}
      <AnimatePresence>
        {mentorModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              exit={{ opacity: 0 }}
              onClick={() => setMentorModalOpen(false)}
              className="absolute inset-0 bg-black"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-2xl z-10"
              data-testid="mentor-application-modal"
            >
              <h3 className="font-display font-bold text-xl text-gray-900">Apply as a Mentor</h3>
              <p className="text-xs text-gray-500 mt-1">Help guide student builders on our platform.</p>
              
              <form onSubmit={submitMentorApplication} className="mt-5 space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Your Name</label>
                  <input
                    type="text" required value={mentorName} onChange={(e) => setMentorName(e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:bg-white focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 transition"
                    data-testid="mentor-name-input"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Company / Organization</label>
                  <input
                    type="text" value={mentorCompany} onChange={(e) => setMentorCompany(e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:bg-white focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 transition"
                    data-testid="mentor-company-input"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Area of Expertise</label>
                  <input
                    type="text" placeholder="e.g. Fintech, Product Strategy..."
                    required value={mentorExpertise} onChange={(e) => setMentorExpertise(e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:bg-white focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 transition"
                    data-testid="mentor-expertise-input"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Email Address</label>
                  <input
                    type="email" required value={mentorEmail} onChange={(e) => setMentorEmail(e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:bg-white focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 transition"
                    data-testid="mentor-email-input"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setMentorModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                    data-testid="mentor-cancel-button"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#5549E0] text-white text-xs font-semibold transition shadow-sm"
                    data-testid="mentor-submit-button"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Monochromatic Brand style highlights
const FOUNDER_HIGHLIGHTS = [
  "5,000+ Students Connected",
  "Startup Ecosystem Builder",
  "AI & Startup Mentor",
  "Speaker at Premier Institutions",
  "Community Leader",
  "Startup Advisor"
];



// Impact counters
const IMPACT_METRICS = [
  { value: "5,000+", label: "Students Connected" },
  { value: "30+", label: "Mentors & Experts" },
  { value: "100+", label: "Events Organized" },
  { value: "50+", label: "Startup Sessions" },
  { value: "20+", label: "Institution Partners" }
];




