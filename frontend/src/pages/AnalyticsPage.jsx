import React, { useEffect, useState, useMemo } from "react";
import api from "../lib/api";
import { useProjects } from "../lib/projects";
import { BarChart3, TrendingUp, Zap, FileText } from "lucide-react";

export default function AnalyticsPage() {
  const { projects, current } = useProjects();
  const [gens, setGens] = useState([]);

  useEffect(() => {
    if (!current) return;
    api.get("/workspace/generations", { params: { project_id: current.project_id } })
      .then((r) => setGens(r.data)).catch(() => setGens([]));
  }, [current?.project_id]);

  const counts = useMemo(() => {
    const c = {};
    gens.forEach((g) => { c[g.kind] = (c[g.kind] || 0) + 1; });
    return c;
  }, [gens]);

  const stats = [
    { label: "Projects", value: projects.length, icon: FileText, gradient: "from-[#6C63FF] to-[#FF4D94]" },
    { label: "Generations", value: gens.length, icon: Zap, gradient: "from-[#FF4D94] to-[#FF7A18]" },
    { label: "Unique tools", value: Object.keys(counts).length, icon: TrendingUp, gradient: "from-[#2ECC71] to-[#3FA9F5]" },
    { label: "Active project", value: current?.name || "—", icon: BarChart3, gradient: "from-[#FFC145] to-[#FF7A18]" },
  ];

  return (
    <div data-testid="analytics-page">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#6C63FF]">Workspace</p>
        <h1 className="mt-1 font-display text-3xl md:text-4xl font-semibold tracking-tighter">Analytics</h1>
        <p className="mt-2 text-gray-600">A live look at how you&apos;re using STUDLYF AI.</p>
      </div>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[20px] bg-white border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} text-white flex items-center justify-center`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-500">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold truncate">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-[24px] bg-white border border-gray-100 p-6">
        <p className="text-sm font-semibold text-gray-900">Generations by tool</p>
        {Object.keys(counts).length === 0 ? (
          <p className="mt-3 text-sm text-gray-400">Generate something to see analytics here.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k, v]) => {
              const max = Math.max(...Object.values(counts));
              const pct = (v / max) * 100;
              return (
                <div key={k} className="flex items-center gap-3">
                  <span className="text-xs text-gray-700 w-36 truncate capitalize">{k.replace(/_/g, " ")}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#6C63FF,#FF4D94)" }} />
                  </div>
                  <span className="text-xs font-semibold w-8 text-right">{v}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
