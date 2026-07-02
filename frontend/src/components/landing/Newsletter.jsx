import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../lib/api";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await api.post("/newsletter", { email, source: "landing-newsletter" });
      if (res.data?.already_subscribed) {
        toast.success("You're already subscribed — see you on Friday!");
      } else if (res.data?.email_sent) {
        toast.success("You're in! Check your inbox for your welcome email.");
      } else {
        toast.success("You're in! We'll be in touch soon.");
      }
      setEmail("");
      setDone(true);
      setTimeout(() => setDone(false), 4000);
    } catch (e) {
      toast.error("Could not subscribe — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-20 md:py-28">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[32px] p-10 md:p-16"
          style={{ background: "linear-gradient(135deg, #FFF 0%, #F4F1FF 60%, #FFE9F2 100%)" }}
        >
          <div className="absolute -top-32 -right-20 w-[420px] h-[420px] rounded-full blob"
               style={{ background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)", opacity: 0.35 }} />
          <div className="absolute -bottom-24 -left-10 w-[360px] h-[360px] rounded-full blob"
               style={{ background: "radial-gradient(circle, #A855F7 0%, transparent 70%)", opacity: 0.25 }} />

          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-semibold text-gray-700">
                <Mail className="w-3.5 h-3.5 text-[#7C3AED]" /> Weekly newsletter
              </span>
              <h2 className="mt-5 font-display text-3xl md:text-5xl font-semibold tracking-tighter text-gray-900">
                Get the <span className="brand-gradient-text">founder briefing</span>.
              </h2>
              <p className="mt-4 text-base md:text-lg text-gray-600 max-w-md">
                One short email. Every Friday. Frameworks, playbooks and prompts that move startups forward.
              </p>
            </div>

            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3" data-testid="newsletter-form">
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@startup.com"
                className="flex-1 px-5 py-4 rounded-full bg-white border border-gray-200 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 text-sm"
                data-testid="newsletter-email"
              />
              <button
                type="submit" disabled={loading}
                className="glow-button rounded-full px-7 py-4 text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-70"
                data-testid="newsletter-submit"
              >
                {loading ? "Sending..." : done ? <><CheckCircle2 className="w-4 h-4" /> Subscribed</> : <>Subscribe <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
