import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export const GRADIENTS = {
  primary: "from-[#7C3AED] to-[#EC4899]",
  warm:    "from-[#EC4899] to-[#F59E0B]",
  cool:    "from-[#6366F1] to-[#7C3AED]",
  growth:  "from-[#22C55E] to-[#6366F1]",
  energy:  "from-[#F59E0B] to-[#EC4899]",
};

export const COLORS = ["#7C3AED", "#EC4899", "#A855F7", "#6366F1", "#22C55E", "#F59E0B"];

export function KpiCard({ label, value, delta, icon: Icon, gradient = "primary", className = "" }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`rounded-[20px] bg-white border border-gray-100 p-5 relative overflow-hidden ${className}`}
    >
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${GRADIENTS[gradient]} opacity-15 blur-2xl`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
          <p className="mt-1 font-display text-2xl md:text-3xl font-semibold tracking-tighter text-gray-900 truncate">{value}</p>
          {delta != null && (
            <p className={`mt-1 text-xs font-semibold flex items-center gap-1 ${delta > 0 ? "text-[#22C55E]" : delta < 0 ? "text-[#EC4899]" : "text-gray-500"}`}>
              {delta > 0 ? <TrendingUp className="w-3 h-3" /> : delta < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {delta > 0 && "+"}{delta}{typeof delta === "number" ? "%" : ""}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${GRADIENTS[gradient]} text-white flex items-center justify-center shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function ScoreRing({ value, max = 10, label, size = 140, gradientId = "ringGrad" }) {
  const r = (size - 18) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, (value || 0) / max));
  const dash = c * pct;
  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F1F4" strokeWidth="10" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={`url(#${gradientId})`} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - dash }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 4px 12px rgba(168, 85, 247, 0.25))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-display text-3xl font-semibold tracking-tighter">{value?.toFixed?.(1) ?? value ?? "—"}</p>
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">/ {max}</p>
      </div>
      {label && <p className="mt-2 text-xs text-gray-500 font-medium">{label}</p>}
    </div>
  );
}

export function InsightList({ title, items = [], tone = "primary", icon: Icon }) {
  const dot = {
    primary: "bg-gradient-to-br from-[#7C3AED] to-[#EC4899]",
    warm:    "bg-gradient-to-br from-[#EC4899] to-[#A855F7]",
    cool:    "bg-gradient-to-br from-[#6366F1] to-[#7C3AED]",
    growth:  "bg-gradient-to-br from-[#22C55E] to-[#6366F1]",
    energy:  "bg-gradient-to-br from-[#F59E0B] to-[#A855F7]",
  }[tone];
  return (
    <div className="rounded-[20px] bg-white border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="w-4 h-4 text-gray-700" />}
        <p className="text-xs font-bold uppercase tracking-widest text-gray-600">{title}</p>
      </div>
      <ul className="space-y-2.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
            <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dot}`} />
            <span className="leading-relaxed">{typeof it === "string" ? it : it.text || it.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Card({ title, subtitle, action, children, className = "" }) {
  return (
    <div className={`rounded-[20px] bg-white border border-gray-100 p-5 ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            {title && <p className="font-display text-base font-semibold text-gray-900">{title}</p>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
