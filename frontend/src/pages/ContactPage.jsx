import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Linkedin,
  Instagram,
  CheckCircle2,
  Send,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Users,
  HelpCircle,
  ChevronDown,
  Building2,
  AlertCircle
} from "lucide-react";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import api from "../lib/api";

// Re-use sections & custom dividers
const CurvedDivider = ({ fill, className, flip = false }) => (
  <div className={`relative w-full overflow-hidden leading-[0] ${className || ""}`} style={{ transform: flip ? "rotateY(180deg)" : "none" }}>
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px]" style={{ fill }}>
      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C26.9,8.75,57.05,18.3,88.43,26.83,172.42,49.74,249.19,69.87,321.39,56.44Z"></path>
    </svg>
  </div>
);

const DiagonalDivider = ({ fill, className }) => (
  <div className={`relative w-full overflow-hidden leading-[0] ${className || ""}`}>
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[40px]" style={{ fill }}>
      <path d="M1200 120L0 0 0 120z"></path>
    </svg>
  </div>
);

// Framer motion variants
const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

export default function ContactPage() {
  const [mentorModalOpen, setMentorModalOpen] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Validation errors
  const [errors, setErrors] = useState({});
  const [submittedOnce, setSubmittedOnce] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState("");

  // FAQ state
  const [openFaq, setOpenFaq] = useState(null);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // Handle newsletter subscription
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterLoading(true);
    try {
      await api.post("/newsletter/subscribe", { email: newsletterEmail });
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
    } catch (err) {
      console.error(err);
    } finally {
      setNewsletterLoading(false);
    }
  };

  // Form field validation
  const validateForm = () => {
    const tempErrors = {};
    if (!name.trim()) tempErrors.name = "Full Name is required";

    if (!email.trim()) {
      tempErrors.email = "Email Address is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        tempErrors.email = "Please enter a valid email address";
      }
    }

    if (!subject.trim()) tempErrors.subject = "Subject is required";
    else if (subject.length > 100) tempErrors.subject = "Subject cannot exceed 100 characters";

    if (!message.trim()) tempErrors.message = "Message is required";
    else if (message.length > 1000) tempErrors.message = "Message cannot exceed 1000 characters";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Validate on field changes if already submitted once
  useEffect(() => {
    if (submittedOnce) {
      validateForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, email, subject, message, submittedOnce]);

  // Handle Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmittedOnce(true);
    setSubmitStatus(null);
    setStatusMessage("");

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await api.post("/contact", {
        name,
        email,
        company: company.trim() || null,
        subject,
        message
      });
      setSubmitStatus("success");
      setStatusMessage("Thank you for contacting STUDLYF! Your message has been sent successfully. We'll get back to you soon.");
      // Clear fields
      setName("");
      setEmail("");
      setCompany("");
      setSubject("");
      setMessage("");
      setSubmittedOnce(false);
    } catch (err) {
      console.error(err);
      setSubmitStatus("error");
      const errDetail = err.response?.data?.error || err.response?.data?.detail || "Sorry, we couldn't send your message right now. Please try again later.";
      setStatusMessage(errDetail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative bg-[#F3F6FB] text-gray-900 overflow-x-hidden min-h-screen font-sans animate-fade-in" data-testid="contact-us-page">
      <Navbar onGetStarted={() => setMentorModalOpen(true)} onLogin={() => setMentorModalOpen(true)} />

      <main className="relative z-10 pt-24">

        {/* HERO SECTION */}
        <section className="relative pt-20 pb-16 md:pb-24 overflow-hidden bg-[#F3F6FB]" data-testid="contact-hero">
          <div className="absolute inset-0 grid-bg pointer-events-none" />

          <div className="relative max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12 text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] text-xs font-semibold uppercase tracking-wider"
            >
              <Sparkles className="w-3.5 h-3.5" /> GET IN TOUCH
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 max-w-3xl mx-auto leading-tight"
            >
              We're Here to Help You <span className="brand-gradient-text">Build & Scale</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto text-gray-500 text-sm md:text-base leading-relaxed font-normal"
            >
              Have a question about our platforms, features, pricing, or partner hubs? Drop us a line and our core team will connect with you.
            </motion.p>
          </div>
        </section>

        {/* DETAILS CARDS SYSTEM */}
        <section className="relative pb-16 bg-[#F3F6FB]">
          <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Email card */}
            <motion.a
              href="mailto:hello@studlyf.in"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="relative group bg-white border border-gray-150 rounded-[20px] p-6 shadow-sm hover:-translate-y-1.5 hover:border-[#7C3AED]/30 transition duration-300 flex flex-col justify-between h-48 z-10 cursor-pointer"
              data-testid="contact-card-email"
            >
              <div>
                <span className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Mail className="w-5 h-5" />
                </span>
                <h3 className="font-display font-bold text-base text-gray-900">Email Inquiry</h3>
                <p className="mt-1.5 text-xs text-gray-500 font-normal">Send us an email and we will reply within 24 hours.</p>
              </div>
              <div className="text-xs font-bold text-[#7C3AED] mt-4 flex items-center gap-1">
                hello@studlyf.in <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </motion.a>

            {/* LinkedIn card */}
            <motion.a
              href="https://www.linkedin.com/company/studlyf/"
              target="_blank"
              rel="noopener noreferrer"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="relative group bg-white border border-gray-150 rounded-[20px] p-6 shadow-sm hover:-translate-y-1.5 hover:border-[#7C3AED]/30 transition duration-300 flex flex-col justify-between h-48 z-10 cursor-pointer"
              data-testid="contact-card-linkedin"
            >
              <div>
                <span className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Linkedin className="w-5 h-5" />
                </span>
                <h3 className="font-display font-bold text-base text-gray-900">LinkedIn</h3>
                <p className="mt-1.5 text-xs text-gray-500 font-normal">Stay updated on our ecosystem builders community news.</p>
              </div>
              <div className="text-xs font-bold text-[#7C3AED] mt-4 flex items-center gap-1">
                Follow STUDLYF <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </motion.a>

            {/* Instagram card */}
            <motion.a
              href="https://www.instagram.com/studlyf.in/"
              target="_blank"
              rel="noopener noreferrer"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="relative group bg-white border border-gray-150 rounded-[20px] p-6 shadow-sm hover:-translate-y-1.5 hover:border-[#7C3AED]/30 transition duration-300 flex flex-col justify-between h-48 z-10 cursor-pointer"
              data-testid="contact-card-instagram"
            >
              <div>
                <span className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Instagram className="w-5 h-5" />
                </span>
                <h3 className="font-display font-bold text-base text-gray-900">Instagram</h3>
                <p className="mt-1.5 text-xs text-gray-500 font-normal">Get insights into our sessions, hackathons, and cohort events.</p>
              </div>
              <div className="text-xs font-bold text-[#7C3AED] mt-4 flex items-center gap-1">
                @studlyf.in <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </motion.a>
          </div>
        </section>

        {/* SECTION DIVIDER */}
        <CurvedDivider fill="#EEF3FA" className="z-10" />

        {/* CONTACT FORM SECTION */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          variants={staggerContainer}
          className="relative py-20 bg-[#EEF3FA]"
          id="contact-form"
        >
          <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Left Info Column */}
            <motion.div variants={fadeUp} className="lg:col-span-5 space-y-6 text-left">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] text-xs font-bold uppercase tracking-wider">
                Send a Message
              </span>

              <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                Let's build something <span className="brand-gradient-text">exceptional</span> together.
              </h2>

              <p className="text-gray-600 text-sm md:text-base leading-relaxed font-normal">
                Whether you are a college dean interested in bringing STUDLYF Hub to your campus, a venture capital firm looking to connect with our validated pipeline, or a builder looking for support — we'd love to hear from you.
              </p>

              <div className="p-4 rounded-[20px] bg-white border border-gray-150 shadow-sm space-y-4">
                <h4 className="font-display font-bold text-sm text-gray-900 flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-50 text-[#7C3AED]"><Building2 className="w-4 h-4" /></span>
                  STUDLYF Headquarters
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Hyderabad, Telangana, India
                </p>
                <div className="text-[10px] text-gray-400 font-semibold border-t border-gray-100 pt-3">
                  COLLABORATE • VALIDATE • ACCELERATE
                </div>
              </div>
            </motion.div>

            {/* Right Form Column */}
            <motion.div variants={fadeUp} className="lg:col-span-7">
              <div className="bg-white border border-gray-150 rounded-[28px] p-6 md:p-10 shadow-sm text-left relative overflow-hidden">
                <h3 className="font-display font-bold text-xl text-gray-900 mb-6">Contact Form</h3>

                {/* Status Alert Message */}
                <AnimatePresence>
                  {submitStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${submitStatus === "success"
                        ? "bg-green-50/50 border-green-200 text-green-800"
                        : "bg-red-50/50 border-red-200 text-red-800"
                        }`}
                      data-testid="submit-status-alert"
                    >
                      {submitStatus === "success" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div className="text-xs font-semibold leading-relaxed">
                        {statusMessage}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5" data-testid="contact-us-form">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full mt-1.5 px-4 py-3 text-xs rounded-xl bg-gray-50 border focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 transition ${errors.name ? "border-red-400" : "border-gray-200 focus:border-[#7C3AED]"
                          }`}
                        placeholder="E Sai Eshwar"
                        data-testid="contact-name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-[10px] text-red-500 font-semibold flex items-center gap-1" data-testid="error-name">
                          <AlertCircle className="w-3 h-3" /> {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full mt-1.5 px-4 py-3 text-xs rounded-xl bg-gray-50 border focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 transition ${errors.email ? "border-red-400" : "border-gray-200 focus:border-[#7C3AED]"
                          }`}
                        placeholder="example@gmail.com"
                        data-testid="contact-email"
                      />
                      {errors.email && (
                        <p className="mt-1 text-[10px] text-red-500 font-semibold flex items-center gap-1" data-testid="error-email">
                          <AlertCircle className="w-3 h-3" /> {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Company Name (Optional)</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full mt-1.5 px-4 py-3 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:bg-white focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition"
                      placeholder="STUDLYF Inc"
                      data-testid="contact-company"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Subject *</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className={`w-full mt-1.5 px-4 py-3 text-xs rounded-xl bg-gray-50 border focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 transition ${errors.subject ? "border-red-400" : "border-gray-200 focus:border-[#7C3AED]"
                        }`}
                      placeholder="University Partnership inquiry"
                      data-testid="contact-subject"
                    />
                    {errors.subject && (
                      <p className="mt-1 text-[10px] text-red-500 font-semibold flex items-center gap-1" data-testid="error-subject">
                        <AlertCircle className="w-3 h-3" /> {errors.subject}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Message *</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      className={`w-full mt-1.5 px-4 py-3 text-xs rounded-xl bg-gray-50 border focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 transition resize-none ${errors.message ? "border-red-400" : "border-gray-200 focus:border-[#7C3AED]"
                        }`}
                      placeholder="Tell us details about your project or request..."
                      data-testid="contact-message"
                    />
                    {errors.message && (
                      <p className="mt-1 text-[10px] text-red-500 font-semibold flex items-center gap-1" data-testid="error-message">
                        <AlertCircle className="w-3 h-3" /> {errors.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-2 rounded-full py-4 text-xs font-bold bg-[#7C3AED] hover:bg-[#5549E0] text-white flex items-center justify-center gap-2 transition duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    data-testid="contact-submit"
                  >
                    {submitting ? "Sending message..." : <>Send Message <Send className="w-3.5 h-3.5" /></>}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* SECTION DIVIDER */}
        <CurvedDivider fill="#F3F6FB" className="z-10" flip={true} />

        {/* FAQ SECTION */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          variants={staggerContainer}
          className="relative py-20 bg-[#F3F6FB]"
          id="faq"
        >
          <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12 text-center space-y-12">
            <motion.div variants={fadeUp} className="max-w-xl mx-auto space-y-4">
              <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.22em] uppercase text-[#7C3AED]">
                <HelpCircle className="w-4 h-4" /> FAQ
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                Frequently Asked <span className="brand-gradient-text">Questions</span>
              </h2>
            </motion.div>

            <motion.div variants={staggerContainer} className="max-w-3xl mx-auto space-y-4 text-left">
              {FAQS.map((faq, idx) => {
                const open = openFaq === idx;
                return (
                  <motion.div
                    key={idx}
                    variants={fadeUp}
                    className="bg-white border border-gray-150 rounded-[20px] overflow-hidden shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : idx)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                      data-testid={`faq-button-${idx}`}
                    >
                      <span className="text-xs font-bold text-gray-900 font-display">{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-[#7C3AED] transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="px-6 pb-5 pt-1 text-xs text-gray-500 font-medium leading-relaxed border-t border-gray-50">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </motion.section>

        {/* SECTION DIVIDER */}
        <DiagonalDivider fill="#E8EEF8" className="z-10" />

        {/* NEWSLETTER SECTION */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          variants={fadeUp}
          className="py-20 bg-[#E8EEF8]"
          id="newsletter"
        >
          <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12">
            <div className="relative overflow-hidden rounded-[32px] p-8 md:p-16 border border-white/10 shadow-xl" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #A855F7 100%)" }}>
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] pointer-events-none" />

              <div
                className="absolute -top-32 -right-20 w-[420px] h-[420px] rounded-full opacity-20 pointer-events-none"
                style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)", filter: "blur(60px)" }}
              />
              <div
                className="absolute -bottom-24 -left-10 w-[360px] h-[360px] rounded-full opacity-20 pointer-events-none"
                style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)", filter: "blur(50px)" }}
              />

              <div className="relative grid lg:grid-cols-12 gap-10 items-center text-left z-10">
                <div className="lg:col-span-7 space-y-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wider">
                    <Mail className="w-3.5 h-3.5 text-white" /> Subscription Hub
                  </span>
                  <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tighter text-white">
                    Stay Connected with India's Startup Ecosystem
                  </h2>
                  <p className="text-indigo-100 text-sm md:text-base leading-relaxed font-normal max-w-xl">
                    Receive startup news, AI updates, founder stories, and opportunities directly in your inbox.
                  </p>
                </div>

                <div className="lg:col-span-5 space-y-6">
                  <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3" data-testid="newsletter-form">
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="you@startup.com"
                      className="flex-1 px-5 py-4 rounded-full bg-white/10 border border-white/20 focus:outline-none focus:bg-white focus:text-gray-900 focus:border-white text-sm text-white placeholder-indigo-100 transition"
                      data-testid="newsletter-email"
                    />
                    <button
                      type="submit"
                      disabled={newsletterLoading}
                      className="rounded-full px-8 py-4 text-sm font-semibold inline-flex items-center justify-center gap-2 bg-white text-gray-900 hover:scale-[1.03] active:scale-[0.98] transition duration-300 disabled:opacity-70 shrink-0 shadow-md"
                      data-testid="newsletter-submit"
                    >
                      {newsletterLoading ? "Sending..." : newsletterSubscribed ? <><CheckCircle2 className="w-4 h-4" /> Subscribed</> : <>Subscribe <Send className="w-4 h-4" /></>}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

      </main>

      <Footer />

      {/* MENTOR APPLICATION MODAL */}
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

              <div className="mt-4 p-4 rounded-xl bg-[#7C3AED]/5 border border-[#7C3AED]/20 text-xs text-gray-700 leading-relaxed text-left">
                To apply as a mentor, please email us directly at <a href="mailto:hello@studlyf.in" className="text-[#7C3AED] font-bold underline">hello@studlyf.in</a> with your resume/LinkedIn profile and details of your startup expertise.
              </div>
              <button
                onClick={() => setMentorModalOpen(false)}
                className="mt-6 w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-250 text-xs font-semibold text-gray-600 transition"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const FAQS = [
  {
    q: "How fast does the core team respond to contact inquiries?",
    a: "We review and respond to all partnership and business inquiries within 24 business hours."
  },
  {
    q: "Can I request a custom product demo or platform walk for my university or incubator?",
    a: "Yes, absolutely. Please submit your inquiry through the contact form with the subject 'University/Incubator Partnership' and list your institution details. Our partnership team will contact you to schedule a live walkthrough."
  },
  {
    q: "Where is the STUDLYF headquarters located?",
    a: "STUDLYF is proudly built and operated out of Hyderabad, Telangana, India, supporting startup builders across campuses nationwide."
  },
  {
    q: "How can I apply to join the startup mentor network?",
    a: "You can send an email detailing your industry credentials, mentoring interests, and LinkedIn profile link directly to hello@studlyf.in."
  }
];
