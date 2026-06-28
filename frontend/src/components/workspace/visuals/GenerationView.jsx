import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, Funnel, FunnelChart, LabelList,
} from "recharts";
import {
  ShieldCheck, AlertTriangle, Sparkles, Compass, Users, Megaphone, Palette,
  Mic, PiggyBank, Search, ChevronLeft, ChevronRight, Play, Target, TrendingUp,
  Layers, Globe2, Maximize2, X,
} from "lucide-react";
import { Card, KpiCard, ScoreRing, InsightList, COLORS } from "./Primitives";

const empty = (v, alt = "—") => (v == null || v === "" ? alt : v);

/* ============================ SWOT ============================ */
export function SwotRenderer({ data }) {
  const quads = [
    { key: "strengths",     title: "Strengths",     icon: ShieldCheck,  tone: "growth",  color: "#2ECC71" },
    { key: "weaknesses",    title: "Weaknesses",    icon: AlertTriangle,tone: "warm",    color: "#FF7A18" },
    { key: "opportunities", title: "Opportunities", icon: Sparkles,     tone: "cool",    color: "#3FA9F5" },
    { key: "threats",       title: "Threats",       icon: AlertTriangle,tone: "primary", color: "#FF4D94" },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1 flex flex-col items-center">
          <ScoreRing value={data?.scores?.overall} label="Overall health" />
        </Card>
        <KpiCard label="Internal balance" value={data?.scores?.internal?.toFixed?.(1) ?? "—"} icon={ShieldCheck} gradient="growth" />
        <KpiCard label="External outlook" value={data?.scores?.external?.toFixed?.(1) ?? "—"} icon={Sparkles} gradient="cool" />
        <Card title="Snapshot" className="md:col-span-1">
          <p className="text-sm text-gray-700 leading-relaxed">{empty(data?.summary)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quads.map((q) => (
          <Card key={q.key} title={q.title} subtitle={`${(data?.[q.key] || []).length} items`}>
            <div className="space-y-3">
              {(data?.[q.key] || []).map((it, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            className="rounded-xl border border-gray-100 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">{it.title}</p>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
                          style={{ background: q.color }}>
                      {it.score}/10
                    </span>
                  </div>
                  {it.detail && <p className="mt-1 text-xs text-gray-600 leading-relaxed">{it.detail}</p>}
                  <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(it.score || 0) * 10}%` }}
                                transition={{ duration: 0.8 }} className="h-full" style={{ background: q.color }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {Array.isArray(data?.radar) && data.radar.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="Strategic radar" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={data.radar}>
                <PolarGrid stroke="#EDEDF3" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: "#6B7280" }} />
                <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                <Radar dataKey="value" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.35} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
          <InsightList title="AI Recommendations" items={data?.recommendations || []} tone="primary" icon={Sparkles} />
        </div>
      )}
    </div>
  );
}

/* ============================ Business Model Canvas ============================ */
const BMC_CELLS = [
  { key: "key_partnerships",       title: "Key Partnerships",      span: "row-span-2", color: "#6C63FF" },
  { key: "key_activities",         title: "Key Activities",        color: "#FF4D94" },
  { key: "value_propositions",     title: "Value Propositions",    span: "row-span-2", color: "#FF7A18" },
  { key: "customer_relationships", title: "Customer Relationships",color: "#2ECC71" },
  { key: "customer_segments",      title: "Customer Segments",     span: "row-span-2", color: "#3FA9F5" },
  { key: "key_resources",          title: "Key Resources",         color: "#FFC145" },
  { key: "channels",               title: "Channels",              color: "#FF4D94" },
];
export function BmcRenderer({ data }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(data?.kpis || []).slice(0, 3).map((k, i) => (
          <KpiCard key={i} label={k.label} value={k.value} icon={[Target, Layers, Globe2][i % 3]}
                   gradient={["primary", "warm", "cool"][i % 3]} />
        ))}
        <Card title="Snapshot"><p className="text-sm text-gray-700">{empty(data?.summary)}</p></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 grid-rows-2 gap-3 min-h-[480px]">
        {BMC_CELLS.map((c) => (
          <div key={c.key} className={`rounded-[20px] bg-white border border-gray-100 p-4 ${c.span || ""}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-600">{c.title}</p>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              {(data?.cells?.[c.key] || []).map((b, i) => <li key={i} className="leading-snug">• {b}</li>)}
            </ul>
          </div>
        ))}
        <div className="rounded-[20px] bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] text-white p-4 col-span-1 lg:col-span-5">
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">Cost Structure</p>
          <ul className="mt-2 text-sm grid grid-cols-1 md:grid-cols-3 gap-2">
            {(data?.cells?.cost_structure || []).map((b, i) => <li key={i}>• {b}</li>)}
          </ul>
        </div>
        <div className="rounded-[20px] bg-gradient-to-br from-[#FF7A18] to-[#FFC145] text-white p-4 col-span-1 lg:col-span-5">
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">Revenue Streams</p>
          <ul className="mt-2 text-sm grid grid-cols-1 md:grid-cols-3 gap-2">
            {(data?.cells?.revenue_streams || []).map((b, i) => <li key={i}>• {b}</li>)}
          </ul>
        </div>
      </div>

      <InsightList title="AI Recommendations" items={data?.recommendations || []} tone="primary" icon={Sparkles} />
    </div>
  );
}

/* ============================ Go-to-Market ============================ */
export function GtmRenderer({ data }) {
  const funnel = (data?.funnel || []).map((f, i) => ({ ...f, fill: COLORS[i % COLORS.length] }));
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(data?.kpis || []).slice(0, 4).map((k, i) => (
          <KpiCard key={i} label={k.label} value={k.value} icon={[Globe2, Target, TrendingUp, PiggyBank][i % 4]}
                   gradient={["primary", "warm", "cool", "growth"][i % 4]} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Ideal customer profile">
          <p className="font-display text-lg font-semibold">{empty(data?.icp?.title)}</p>
          <ul className="mt-3 space-y-1.5 text-sm text-gray-700">
            <li><b>Industries:</b> {(data?.icp?.industries || []).join(", ") || "—"}</li>
            <li><b>Company size:</b> {empty(data?.icp?.company_size)}</li>
            <li><b>Geography:</b> {empty(data?.icp?.geo)}</li>
            <li><b>Buyer role:</b> {empty(data?.icp?.buyer_role)}</li>
          </ul>
        </Card>
        <Card title="Segments" subtitle="Share of focus" className="lg:col-span-1">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data?.segments || []} dataKey="share" nameKey="name" innerRadius={50} outerRadius={85}>
                {(data?.segments || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Funnel" subtitle="Awareness → Expansion">
          <ResponsiveContainer width="100%" height={220}>
            <FunnelChart>
              <Tooltip />
              <Funnel data={funnel} dataKey="value" isAnimationActive>
                <LabelList dataKey="stage" position="right" fill="#374151" fontSize={11} />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Positioning" className="lg:col-span-1">
          <p className="text-sm text-gray-700 leading-relaxed">{empty(data?.positioning)}</p>
        </Card>
        <Card title="Messaging pillars" className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(data?.messaging || []).map((m, i) => (
              <div key={i} className="rounded-xl border border-gray-100 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#6C63FF]">{m.pillar}</p>
                <p className="mt-1 text-sm text-gray-800">{m.line}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Channels & CAC">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {(data?.channels || []).map((c, i) => (
            <div key={i} className="rounded-xl border border-gray-100 p-3">
              <p className="text-sm font-semibold">{c.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">CAC est. {c.cac_estimate}</p>
              <span className={`mt-2 inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                c.priority === "high" ? "bg-[#6C63FF]/10 text-[#6C63FF]" :
                c.priority === "medium" ? "bg-[#FF7A18]/10 text-[#FF7A18]" :
                "bg-gray-100 text-gray-600"
              }`}>{c.priority}</span>
            </div>
          ))}
        </div>
      </Card>

      <InsightList title="AI Recommendations" items={data?.recommendations || []} tone="primary" icon={Sparkles} />
    </div>
  );
}

/* ============================ Marketing Plan ============================ */
export function MarketingPlanRenderer({ data }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
        <Card className="md:col-span-1 flex flex-col items-center">
          <ScoreRing value={data?.scores?.overall} label="Marketing health" gradientId="mktring" />
        </Card>
        {(data?.kpis || []).slice(0, 4).map((k, i) => (
          <KpiCard key={i} label={k.label} value={k.value} icon={[Megaphone, Target, TrendingUp, Users][i % 4]}
                   gradient={["primary", "warm", "cool", "growth"][i % 4]} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Channel budget mix">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data?.channels || []} dataKey="budget_pct" nameKey="name" outerRadius={90} label={(e) => `${e.budget_pct}%`}>
                {(data?.channels || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Audience breakdown">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data?.audience || []} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDEDF3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={110} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {(data?.audience || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Score breakdown">
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={Object.entries(data?.scores || {}).filter(([k]) => k !== "overall").map(([k, v]) => ({ axis: k, value: v }))}>
              <PolarGrid stroke="#EDEDF3" />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: "#6B7280" }} />
              <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 9 }} />
              <Radar dataKey="value" stroke="#FF4D94" fill="#FF4D94" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Objectives" className="lg:col-span-1">
          <ul className="space-y-2 text-sm text-gray-700">
            {(data?.objectives || []).map((o, i) => <li key={i} className="flex gap-2"><span className="text-[#6C63FF]">{i+1}.</span> {o}</li>)}
          </ul>
        </Card>
        <Card title="Campaign calendar" subtitle="90-day timeline" className="lg:col-span-2">
          <div className="relative pt-4">
            <div className="absolute left-2 right-2 top-7 h-px bg-gradient-to-r from-[#6C63FF] via-[#FF4D94] to-[#FF7A18]" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {(data?.calendar || []).map((c, i) => (
                <div key={i} className="relative">
                  <div className="w-4 h-4 mx-auto rounded-full bg-white border-2 border-[#6C63FF]" />
                  <div className="mt-3 rounded-xl border border-gray-100 p-3 bg-white">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#6C63FF]">Week {c.week}</p>
                    <p className="text-sm font-semibold mt-1">{c.campaign}</p>
                    <p className="text-xs text-gray-500">{c.channel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <InsightList title="AI Recommendations" items={data?.recommendations || []} tone="warm" icon={Sparkles} />
    </div>
  );
}

/* ============================ Brand Strategy ============================ */
export function BrandRenderer({ data }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="md:col-span-1 flex flex-col items-center">
          <ScoreRing value={data?.score} label="Brand score" gradientId="brandring" />
        </Card>
        <Card title="Mission" className="md:col-span-2"><p className="text-sm text-gray-700">{empty(data?.mission)}</p></Card>
        <Card title="Vision"  className="md:col-span-2"><p className="text-sm text-gray-700">{empty(data?.vision)}</p></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Brand story" className="lg:col-span-2">
          <p className="text-sm text-gray-700 leading-relaxed">{empty(data?.story)}</p>
          <p className="mt-4 text-xs uppercase tracking-widest font-bold text-gray-500">Positioning</p>
          <p className="text-sm text-gray-800 mt-1">{empty(data?.positioning)}</p>
        </Card>
        <Card title="Personality wheel">
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={data?.personality || []}>
              <PolarGrid stroke="#EDEDF3" />
              <PolarAngleAxis dataKey="trait" tick={{ fontSize: 11, fill: "#6B7280" }} />
              <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 9 }} />
              <Radar dataKey="value" stroke="#FF4D94" fill="#FF4D94" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Color palette" className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(data?.palette || []).map((c, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
                <div className="h-20" style={{ background: c.hex }} />
                <div className="p-3">
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{c.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Voice — Do / Don't">
          <div className="space-y-2">
            {(data?.voice || []).map((v, i) => (
              <div key={i} className="rounded-xl border border-gray-100 p-3">
                <p className="text-xs text-[#2ECC71] font-semibold">Do · {v.do}</p>
                <p className="text-xs text-[#FF4D94] font-semibold mt-1">Don't · {v.dont}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Tagline options">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {(data?.taglines || []).map((t, i) => (
            <div key={i} className="rounded-xl bg-gradient-to-br from-[#F4F1FF] to-[#FFE9F2] p-4 border border-white">
              <p className="font-display text-sm font-semibold text-gray-900">"{t}"</p>
            </div>
          ))}
        </div>
      </Card>

      <InsightList title="AI Recommendations" items={data?.recommendations || []} tone="warm" icon={Sparkles} />
    </div>
  );
}

/* ============================ 1-Minute Pitch ============================ */
export function PitchRenderer({ data }) {
  const sections = data?.sections || [];
  const total = sections.reduce((s, x) => s + (x.seconds || 0), 0) || 60;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard label="Total time" value={`${data?.duration_sec || total}s`} icon={Mic} gradient="primary" />
        <KpiCard label="Sections" value={sections.length} icon={Layers} gradient="warm" />
        <Card title="Snapshot" className="md:col-span-2"><p className="text-sm text-gray-700">{empty(data?.summary)}</p></Card>
      </div>

      <Card title="Pitch timeline" subtitle="Click any section to read">
        <div className="flex flex-wrap gap-1 mb-3">
          {sections.map((s, i) => (
            <div key={i} className="h-2 rounded-full" style={{ width: `${(s.seconds / total) * 100}%`, background: COLORS[i % COLORS.length] }} title={`${s.label} (${s.seconds}s)`} />
          ))}
        </div>
        <div className="space-y-3">
          {sections.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                        className="rounded-xl border border-gray-100 p-4 relative">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: COLORS[i % COLORS.length] }}>{s.label}</p>
                <p className="text-xs text-gray-500 font-mono">{s.seconds}s</p>
              </div>
              <p className="mt-2 text-sm text-gray-800 leading-relaxed">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      {data?.tips?.length > 0 && <InsightList title="Delivery tips" items={data.tips} tone="primary" icon={Sparkles} />}
    </div>
  );
}

/* ============================ Pitch Deck ============================ */
export function PitchDeckRenderer({ data }) {
  const slides = data?.slides || [];
  const [active, setActive] = useState(0);
  const [present, setPresent] = useState(false);

  const slide = slides[active];
  if (!slide) return <p className="text-sm text-gray-500">No slides.</p>;

  const SlideBody = ({ s, big = false }) => {
    const gradient = COLORS[(s.n - 1) % COLORS.length];
    return (
      <div className="aspect-video w-full rounded-2xl bg-white border border-gray-100 p-6 md:p-10 relative overflow-hidden flex flex-col">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full" style={{ background: gradient, opacity: 0.1, filter: "blur(40px)" }} />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Slide {s.n} / {slides.length}</p>
        <h2 className={`mt-2 font-display ${big ? "text-3xl md:text-5xl" : "text-xl md:text-2xl"} font-semibold tracking-tight text-gray-900`}>{s.title}</h2>
        {s.subtitle && <p className="text-sm md:text-base text-gray-500 mt-1">{s.subtitle}</p>}
        <ul className="mt-4 space-y-2 flex-1">
          {(s.bullets || []).map((b, i) => <li key={i} className={`flex items-start gap-2 ${big ? "text-base md:text-lg" : "text-sm"} text-gray-700`}>
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: gradient }} />{b}
          </li>)}
        </ul>
        {s.metric && (
          <div className="mt-4 inline-block rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] text-white px-4 py-2">
            <p className="text-[10px] uppercase tracking-widest opacity-80 font-bold">{s.metric.label}</p>
            <p className={`font-display ${big ? "text-2xl" : "text-lg"} font-semibold`}>{s.metric.value}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1 flex flex-col items-center">
          <ScoreRing value={data?.score} label="Deck score" gradientId="deckring" />
        </Card>
        <KpiCard label="Slides" value={slides.length} icon={Layers} gradient="primary" />
        <KpiCard label="Currently viewing" value={`#${active + 1} · ${slide.title}`} icon={Play} gradient="warm" />
        <button onClick={() => setPresent(true)} className="rounded-[20px] bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] text-white p-5 text-left hover:opacity-95">
          <Maximize2 className="w-5 h-5" />
          <p className="mt-3 font-display text-lg font-semibold">Present</p>
          <p className="text-xs opacity-90">Full-screen deck</p>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto no-scrollbar pr-1">
          {slides.map((s, i) => (
            <button key={i} onClick={() => setActive(i)}
                    className={`w-full text-left rounded-xl p-3 border transition ${i === active ? "border-[#6C63FF]/40 bg-[#F4F1FF]" : "border-gray-100 bg-white hover:border-gray-200"}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{String(i+1).padStart(2,"0")}</p>
              <p className="text-sm font-semibold mt-0.5 line-clamp-2">{s.title}</p>
            </button>
          ))}
        </div>
        <div className="lg:col-span-3 space-y-3">
          <SlideBody s={slide} />
          <div className="flex items-center justify-between">
            <button onClick={() => setActive(Math.max(0, active - 1))} disabled={active === 0}
                    className="rounded-full px-4 py-2 text-sm font-semibold border border-gray-200 inline-flex items-center gap-1 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <p className="text-xs text-gray-500">{slide.speaker_notes ? "📝 " + slide.speaker_notes : ""}</p>
            <button onClick={() => setActive(Math.min(slides.length - 1, active + 1))} disabled={active === slides.length - 1}
                    className="rounded-full px-4 py-2 text-sm font-semibold border border-gray-200 inline-flex items-center gap-1 disabled:opacity-40">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <InsightList title="How to improve this deck" items={data?.recommendations || []} tone="primary" icon={Sparkles} />

      {present && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6" onClick={() => setPresent(false)}>
          <button onClick={() => setPresent(false)} className="absolute top-5 right-5 text-white/70 hover:text-white"><X className="w-6 h-6" /></button>
          <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <SlideBody s={slide} big />
            <div className="mt-4 flex items-center justify-between text-white">
              <button onClick={() => setActive(Math.max(0, active - 1))} className="rounded-full px-5 py-2 text-sm font-semibold bg-white/10 hover:bg-white/20"><ChevronLeft className="inline w-4 h-4" /> Prev</button>
              <p className="text-sm opacity-80">{active + 1} / {slides.length}</p>
              <button onClick={() => setActive(Math.min(slides.length - 1, active + 1))} className="rounded-full px-5 py-2 text-sm font-semibold bg-white/10 hover:bg-white/20">Next <ChevronRight className="inline w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================ VC Score ============================ */
export function VcScoreRenderer({ data }) {
  const rec = (data?.recommendation || "WATCH").toUpperCase();
  const recColor = rec === "INVEST" ? "bg-[#2ECC71]" : rec === "PASS" ? "bg-[#FF4D94]" : "bg-[#FFC145]";
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
        <Card className="md:col-span-1 flex flex-col items-center">
          <ScoreRing value={data?.overall_score} label="VC score" gradientId="vcring" />
        </Card>
        <Card title="Recommendation" className="md:col-span-2">
          <div className="flex items-center gap-3">
            <span className={`text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${recColor}`}>{rec}</span>
            <p className="font-display text-xl font-semibold text-gray-900">{empty(data?.summary)}</p>
          </div>
          <p className="mt-3 text-sm text-gray-700 leading-relaxed">{empty(data?.rationale)}</p>
        </Card>
        <Card title="Radar" subtitle="VC dimensions" className="md:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={(data?.dimensions || []).map((d) => ({ axis: d.key, value: d.score }))}>
              <PolarGrid stroke="#EDEDF3" />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: "#6B7280" }} />
              <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 9 }} />
              <Radar dataKey="value" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.35} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(data?.dimensions || []).map((d, i) => (
          <Card key={d.key} title={d.key}>
            <div className="flex items-center gap-3">
              <p className="font-display text-3xl font-semibold tracking-tighter">{d.score}<span className="text-sm text-gray-400">/10</span></p>
              <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${d.score * 10}%` }} transition={{ duration: 1 }}
                            className="h-full" style={{ background: COLORS[i % COLORS.length] }} />
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-600 leading-relaxed">{d.comment}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <InsightList title="Strengths"     items={data?.strengths || []}     tone="growth" icon={ShieldCheck} />
        <InsightList title="Concerns"      items={data?.concerns || []}      tone="warm"   icon={AlertTriangle} />
        <InsightList title="Next questions" items={data?.next_questions || []} tone="cool" icon={Search} />
      </div>
    </div>
  );
}

/* ============================ Customer Persona ============================ */
export function PersonaRenderer({ data }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(data?.personas || []).map((p, i) => (
          <Card key={i} title={`Persona ${i+1}`}>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl text-white text-2xl font-display font-semibold flex items-center justify-center"
                   style={{ background: `linear-gradient(135deg, ${p.color || "#6C63FF"}, ${p.color || "#FF4D94"})` }}>
                {p.avatar_initial || p.name?.[0] || "?"}
              </div>
              <div>
                <p className="font-display text-xl font-semibold">{p.name}</p>
                <p className="text-xs text-gray-500">{p.role} · {p.age} · {p.location}</p>
                <p className="text-xs text-[#6C63FF] font-semibold">{p.income}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div><p className="font-bold uppercase tracking-widest text-gray-500">Goals</p><ul className="mt-1 space-y-1">{(p.goals || []).map((g, k) => <li key={k}>• {g}</li>)}</ul></div>
              <div><p className="font-bold uppercase tracking-widest text-gray-500">Pains</p><ul className="mt-1 space-y-1">{(p.pains || []).map((g, k) => <li key={k}>• {g}</li>)}</ul></div>
              <div><p className="font-bold uppercase tracking-widest text-gray-500">Objections</p><ul className="mt-1 space-y-1">{(p.objections || []).map((g, k) => <li key={k}>• {g}</li>)}</ul></div>
              <div><p className="font-bold uppercase tracking-widest text-gray-500">Buying behavior</p><p className="mt-1">{p.buying_behavior}</p></div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Channels</p>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={p.channels || []} dataKey="weight" nameKey="name" outerRadius={55} innerRadius={28}>
                      {(p.channels || []).map((_, k) => <Cell key={k} fill={COLORS[k % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Interests</p>
                <ResponsiveContainer width="100%" height={140}>
                  <RadarChart data={p.interests || []}>
                    <PolarGrid stroke="#EDEDF3" />
                    <PolarAngleAxis dataKey="axis" tick={{ fontSize: 9, fill: "#6B7280" }} />
                    <Radar dataKey="value" stroke={p.color || "#6C63FF"} fill={p.color || "#6C63FF"} fillOpacity={0.35} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <InsightList title="AI Recommendations" items={data?.recommendations || []} tone="primary" icon={Sparkles} />
    </div>
  );
}

/* ============================ Competitor Analysis ============================ */
export function CompetitorRenderer({ data }) {
  const comps = data?.competitors || [];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard label="Competitors analysed" value={comps.length} icon={Search} gradient="primary" />
        <KpiCard label="Highest threat" value={comps[0]?.name || "—"} icon={AlertTriangle} gradient="warm" />
        <KpiCard label="Avg market share" value={comps.length ? `${Math.round(comps.reduce((s, c) => s + (c.market_share || 0), 0) / comps.length)}%` : "—"} icon={Globe2} gradient="cool" />
        <Card title="Snapshot"><p className="text-sm text-gray-700">{empty(data?.summary)}</p></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Competitor scores">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={comps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDEDF3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                {comps.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Market share">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={comps} dataKey="market_share" nameKey="name" outerRadius={95} label={(e) => `${e.market_share}%`}>
                {comps.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {data?.features?.length > 0 && (
        <Card title="Feature comparison" subtitle="Us vs. competitors">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-widest text-gray-500">
                  <th className="text-left py-2">Feature</th>
                  {Object.keys(data.features[0]).filter((k) => k !== "name").map((k) => (
                    <th key={k} className="text-center py-2 capitalize">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.features.map((f, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="py-2 font-medium">{f.name}</td>
                    {Object.entries(f).filter(([k]) => k !== "name").map(([k, v]) => (
                      <td key={k} className="text-center py-2">
                        {v ? <span className="inline-block w-5 h-5 rounded-full bg-[#2ECC71]/15 text-[#2ECC71] text-[11px] font-bold leading-5">✓</span>
                           : <span className="inline-block w-5 h-5 rounded-full bg-gray-100 text-gray-400 text-[11px] leading-5">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InsightList title="Gaps to exploit"        items={data?.gaps || []} tone="growth" icon={Target} />
        <InsightList title="Opportunities"          items={data?.opportunities || []} tone="cool" icon={Sparkles} />
      </div>
      <InsightList title="AI Recommendations" items={data?.recommendations || []} tone="primary" icon={Sparkles} />
    </div>
  );
}

/* ============================ Dispatcher ============================ */
const REGISTRY = {
  swot: SwotRenderer,
  business_model_canvas: BmcRenderer,
  go_to_market: GtmRenderer,
  marketing_plan: MarketingPlanRenderer,
  brand_strategy: BrandRenderer,
  one_minute_pitch: PitchRenderer,
  pitch_deck: PitchDeckRenderer,
  vc_score: VcScoreRenderer,
  customer_persona: PersonaRenderer,
  competitor_analysis: CompetitorRenderer,
};

export default function GenerationView({ kind, data }) {
  const Comp = REGISTRY[kind];
  if (!Comp) return <p className="text-sm text-gray-500">No visual renderer for {kind}.</p>;
  return <Comp data={data || {}} />;
}
