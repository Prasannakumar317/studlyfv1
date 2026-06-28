import React, { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../lib/api";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const startGoogleAuth = () => {
  const redirectUrl = window.location.origin + "/workspace";
  window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
};

export default function SignupDialog({ open, onOpenChange }) {
  const [form, setForm] = useState({ name: "", email: "", company: "", role: "Founder" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/signup", { ...form, source: "landing-get-started" });
      setDone(true);
      toast.success("Welcome to STUDLYF AI! We'll be in touch shortly.");
    } catch (err) {
      const msg = err?.response?.data?.detail || "Could not sign you up — please try again.";
      toast.error(typeof msg === "string" ? msg : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => { setDone(false); setForm({ name: "", email: "", company: "", role: "Founder" }); }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else onOpenChange(true); }}>
      <DialogContent className="sm:max-w-md rounded-[24px] border-gray-100 p-0 overflow-hidden" data-testid="signup-dialog">
        {!done ? (
          <>
            <div className="relative px-7 pt-7 pb-2">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blob"
                   style={{ background: "radial-gradient(circle, #6C63FF 0%, transparent 70%)", opacity: 0.25 }} />
              <DialogHeader className="text-left relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-semibold w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-[#6C63FF]" /> Get Started
                </div>
                <DialogTitle className="font-display text-2xl md:text-3xl font-semibold tracking-tight mt-3">
                  Start building your startup with AI.
                </DialogTitle>
                <DialogDescription>
                  Continue with Google to instantly open your workspace — or drop your email to stay in the loop.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="px-7 pb-2">
              <button
                onClick={startGoogleAuth}
                className="w-full rounded-full py-3 text-sm font-semibold bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm flex items-center justify-center gap-3 transition"
                data-testid="signup-google"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.55c2.08-1.92 3.29-4.74 3.29-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.55-2.76c-.98.66-2.23 1.06-3.73 1.06-2.87 0-5.3-1.94-6.17-4.54H2.18v2.85A11 11 0 0 0 12 23z"/>
                  <path fill="#FBBC05" d="M5.83 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.33-2.1V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.44 1.18 4.95l3.65-2.85z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.65l3.15-3.15C17.45 2.1 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05L5.83 9.9C6.7 7.3 9.13 5.38 12 5.38z"/>
                </svg>
                Continue with Google
              </button>
              <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
                <span className="flex-1 h-px bg-gray-100" /> or email me <span className="flex-1 h-px bg-gray-100" />
              </div>
            </div>

            <form onSubmit={submit} className="px-7 pb-7 space-y-3" data-testid="signup-form">
              <input
                type="text" placeholder="Full name" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/15 text-sm outline-none"
                data-testid="signup-name"
              />
              <input
                type="email" placeholder="Work email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/15 text-sm outline-none"
                data-testid="signup-email"
              />
              <input
                type="text" placeholder="Company / Project (optional)" value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/15 text-sm outline-none"
                data-testid="signup-company"
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/15 text-sm outline-none bg-white"
                data-testid="signup-role"
              >
                {["Founder", "Student", "Mentor", "Agency", "Incubator", "Investor"].map((r) => <option key={r}>{r}</option>)}
              </select>

              <button
                type="submit" disabled={loading}
                className="glow-button w-full rounded-full py-3.5 text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-70"
                data-testid="signup-submit"
              >
                {loading ? "Creating workspace..." : "Get the briefing"}
              </button>
              <p className="text-[11px] text-gray-500 text-center">By continuing you agree to our Terms and Privacy.</p>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="px-7 py-12 text-center"
            data-testid="signup-success"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#2ECC71] to-[#3FA9F5] flex items-center justify-center text-white">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-semibold">You&apos;re on the list!</h3>
            <p className="mt-2 text-gray-600 text-sm">Continue with Google any time to open your workspace.</p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <button onClick={startGoogleAuth} className="glow-button rounded-full px-5 py-2.5 text-sm font-semibold" data-testid="signup-success-google">
                Continue with Google
              </button>
              <button onClick={handleClose} className="rounded-full px-5 py-2.5 text-sm font-semibold border border-gray-200" data-testid="signup-success-close">
                Keep exploring
              </button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
