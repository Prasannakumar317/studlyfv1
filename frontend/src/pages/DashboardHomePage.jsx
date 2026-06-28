import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../lib/api";
import { useProjects } from "../lib/projects";
import { useAuth } from "../lib/auth";
import ProjectPicker from "../components/ProjectPicker";
import { Card, KpiCard, ScoreRing, InsightList, COLORS } from "../components/workspace/visuals/Primitives";
import {
  Sparkles, Compass, Megaphone, PiggyBank, FileText, BarChart3, ShieldCheck,
  Palette, Search, Mic, Target, Layers, ArrowRight,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";

const KIND_TO_ROUTE = {
  swot: "/workspace/strategy", business_model_canvas: "/workspace/strategy",
  go_to_market: "/workspace/strategy", customer_persona: "/workspace/strategy",
  competitor_analysis: "/workspace/strategy",
  marketing_plan: "/workspace/marketing", brand_strategy: "/workspace/marketing",
  one_minute_pitch: "/workspace/funding", pitch_deck: "/workspace/funding",
  vc_score: "/workspace/funding",
};

const KIND_ICON = {
  swot: ShieldCheck, business_model_canvas: Layers, go_to_market: Compass,
  customer_persona: Target, competitor_analysis: Search,
  marketing_plan: Megaphone, brand_strategy: Palette,
  one_minute_pitch: Mic, pitch_deck: FileText, vc_score: PiggyBank,
};

// fake trend data (live counts could be added later)
const sparkline = (seed = 1) =>
  Array.from({ length: 12 }, (_, i) => ({ x: i, y: Math.round(40 + Math.sin((i + seed) * 0.7) * 14 + i * 2) }));

export default function DashboardHomePage() {
  const { current } = useProjects();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!current) { setDash(null); setLoading(false); return; }
    setLoading(true);
    api.get("/workspace/dashboard", { params: { project_id: current.project_id } })
      .then((r) => setDash(r.data)).catch(() => setDash(null))
      .finally(() => setLoading(false));
  }, [current?.project_id]);

  const scores = dash?.scores || {};

  const scoreCards = [
    { key: "business_health", label: "Business Health", icon: ShieldCheck, gradient: "growth", from: "SWOT" },
    { key: "vc_score",        label: "VC Score",        icon: PiggyBank,   gradient: "primary", from: "VC Score" },
    { key: "marketing",       label: "Marketing",       icon: Megaphone,   gradient: "warm",  from: "Marketing Plan" },
    { key: "brand",           label: "Brand",           icon: Palette,     gradient: "energy",from: "Brand Strategy" },
    { key: "pitch",           label: "Pitch",           icon: FileText,    gradient: "cool",  from: "Pitch Deck" },
  ];

  return (
    <div data-testid="dashboard-home">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#6C63FF]">Dashboard</p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl font-semibold tracking-tighter">
            Welcome back, {user?.name?.split(" ")[0] || "Founder"}.
          </h1>
          <p className="mt-2 text-gray-600">Your live business intelligence — every score updates as you generate.</p>
        </div>
        <div className="flex items-center gap-2">
          <ProjectPicker />
        </div>
      </div>

      {/* HERO: Overall AI score + quick KPIs */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="md:col-span-1 rounded-[24px] p-6 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #6C63FF 0%, #FF4D94 55%, #FF7A18 100%)" }}>
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/20 blur-3xl" />
          <p className="relative text-[11px] uppercase tracking-widest font-bold opacity-80">Overall AI Score</p>
          <p className="relative mt-2 font-display text-6xl font-semibold tracking-tighter">
            {scores.overall_ai != null ? scores.overall_ai.toFixed(1) : "—"}<span className="text-2xl opacity-70">/10</span>
          </p>
          <p className="relative mt-1 text-xs opacity-90">{dash?.counts?.generations || 0} generations · {dash?.counts?.unique_tools || 0} unique tools</p>
          <button onClick={() => navigate("/workspace/strategy")} className="relative mt-5 bg-white text-gray-900 text-xs font-semibold rounded-full px-4 py-2 inline-flex items-center gap-1">
            Generate more <ArrowRight className="w-3 h-3" />
          </button>
        </motion.div>

        {scoreCards.slice(0, 3).map((s, i) => (
          <Card key={s.key} title={s.label} subtitle={`From ${s.from}`}
            action={<s.icon className="w-4 h-4 text-gray-400" />}>
            <div className="flex items-center gap-4">
              <ScoreRing value={scores[s.key]} size={96} gradientId={`grad-${s.key}`} />
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={70}>
                  <AreaChart data={sparkline(i + 1)}>
                    <defs>
                      <linearGradient id={`sp-${s.key}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.5}/>
                        <stop offset="100%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area dataKey="y" stroke={COLORS[i % COLORS.length]} fill={`url(#sp-${s.key})`} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Secondary score cards */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {scoreCards.slice(3).map((s, i) => (
          <Card key={s.key} title={s.label} subtitle={`From ${s.from}`} action={<s.icon className="w-4 h-4 text-gray-400" />}>
            <div className="flex items-center gap-4">
              <ScoreRing value={scores[s.key]} size={96} gradientId={`grad2-${s.key}`} />
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={70}>
                  <AreaChart data={sparkline(i + 4)}>
                    <defs>
                      <linearGradient id={`sp2-${s.key}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={COLORS[(i + 3) % COLORS.length]} stopOpacity={0.5}/>
                        <stop offset="100%" stopColor={COLORS[(i + 3) % COLORS.length]} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area dataKey="y" stroke={COLORS[(i + 3) % COLORS.length]} fill={`url(#sp2-${s.key})`} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent outputs + Recommendations */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Recent AI outputs" subtitle="Latest by tool" className="lg:col-span-2">
          {dash?.latest?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dash.latest.slice(0, 6).map((g) => {
                const Icon = KIND_ICON[g.kind] || Sparkles;
                return (
                  <button key={g.generation_id} onClick={() => navigate(KIND_TO_ROUTE[g.kind] || "/workspace/strategy")}
                    className="group text-left rounded-2xl border border-gray-100 p-4 hover:border-[#6C63FF]/30 hover:bg-[#F4F1FF]/40 transition flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] text-white flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{g.label}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{new Date(g.created_at).toLocaleString()}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#6C63FF] mt-2" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <Sparkles className="w-7 h-7 mx-auto text-[#6C63FF]" />
              <p className="mt-3 font-display text-lg font-semibold">No outputs yet</p>
              <p className="text-sm text-gray-500">Head to Strategy, Marketing or Funding to generate your first visual dashboard.</p>
            </div>
          )}
        </Card>

        <Card title="Suggested next" subtitle="AI playbook">
          <div className="space-y-2.5">
            {[
              { label: "Run SWOT analysis", to: "/workspace/strategy", color: "#6C63FF" },
              { label: "Generate VC score", to: "/workspace/funding", color: "#FF4D94" },
              { label: "Draft marketing plan", to: "/workspace/marketing", color: "#FF7A18" },
              { label: "Build pitch deck", to: "/workspace/funding", color: "#2ECC71" },
            ].map((it, i) => (
              <button key={i} onClick={() => navigate(it.to)}
                className="w-full text-left rounded-xl border border-gray-100 p-3 hover:border-[#6C63FF]/30 transition flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  <span className="w-2 h-2 rounded-full" style={{ background: it.color }} /> {it.label}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
