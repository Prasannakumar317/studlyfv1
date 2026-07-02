import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { motion } from "framer-motion";
import { Play, Sparkles, Bot, TrendingUp, Megaphone, PiggyBank } from "lucide-react";

// Drop-in placeholder until the real demo MP4 is uploaded.
// Set REACT_APP_DEMO_VIDEO_URL in frontend/.env to play a real video instead of the storyboard.
const DEMO_URL = process.env.REACT_APP_DEMO_VIDEO_URL;

const Scene = ({ delay, color, icon: Icon, title, line }) => (
  <motion.div
    initial={{ opacity: 0, y: 12, scale: 0.96 }}
    animate={{ opacity: [0, 1, 1, 0], y: [12, 0, 0, -12], scale: [0.96, 1, 1, 0.98] }}
    transition={{ duration: 4, delay, repeat: Infinity, repeatDelay: 12, times: [0, 0.1, 0.9, 1] }}
    className="absolute inset-0 flex items-center justify-center px-8"
  >
    <div className="text-center max-w-md">
      <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white shadow-lg"
           style={{ background: `linear-gradient(135deg, ${color}, ${color}AA)` }}>
        <Icon className="w-8 h-8" />
      </div>
      <p className="mt-5 font-display text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">{title}</p>
      <p className="mt-2 text-sm md:text-base text-gray-500">{line}</p>
    </div>
  </motion.div>
);

export default function VideoModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl rounded-[24px] border-gray-100 p-0 overflow-hidden" data-testid="video-modal">
        <VisuallyHidden.Root>
          <DialogTitle>STUDLYF AI demo</DialogTitle>
          <DialogDescription>An animated preview of the STUDLYF AI platform.</DialogDescription>
        </VisuallyHidden.Root>
        <div className="aspect-video w-full bg-black relative overflow-hidden">
          {DEMO_URL ? (
            <video
              src={DEMO_URL}
              controls
              autoPlay
              className="w-full h-full"
              data-testid="demo-video"
            />
          ) : (
            <div className="relative w-full h-full bg-gradient-to-br from-[#FAFAFC] via-white to-[#F4F1FF]">
              <div className="absolute inset-0 grid-bg opacity-50" />
              {/* watermark badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-semibold">
                <Play className="w-3.5 h-3.5 text-[#7C3AED]" /> Demo preview
              </div>
              <div className="absolute top-4 right-4 z-10 text-[10px] font-bold tracking-widest uppercase text-gray-400">
                Real video coming soon
              </div>
              <Scene delay={0} color="#7C3AED" icon={Sparkles} title="Drop in your idea." line="Tell STUDLYF AI what you're building — one line is enough." />
              <Scene delay={4} color="#EC4899" icon={Bot} title="Ten agents go to work." line="Strategy, brand, market, finance — they run in parallel." />
              <Scene delay={8} color="#A855F7" icon={TrendingUp} title="See your SWOT, GTM and roadmap." line="Generated, structured and editable in seconds." />
              <Scene delay={12} color="#22C55E" icon={Megaphone} title="Marketing studio kicks in." line="Campaigns, content pillars, social posts — done." />
              <Scene delay={16} color="#F59E0B" icon={PiggyBank} title="Investor-ready in minutes." line="Pitch deck, VC score, one-pager. Export. Pitch. Win." />
            </div>
          )}
        </div>
        <div className="p-5 flex items-center justify-between flex-wrap gap-3 bg-white">
          <div>
            <p className="font-display font-semibold text-gray-900">STUDLYF AI in 90 seconds</p>
            <p className="text-xs text-gray-500">A guided tour of the platform.</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="glow-button rounded-full px-5 py-2.5 text-sm font-semibold"
            data-testid="video-modal-close"
          >Close</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
