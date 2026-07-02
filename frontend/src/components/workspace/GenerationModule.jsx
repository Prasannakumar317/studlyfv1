import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import { Sparkles, Loader2, Copy, Download, Trash2, CheckCircle2 } from "lucide-react";
import api from "../../lib/api";
import { useProjects } from "../../lib/projects";
import { toast } from "sonner";
import GenerationView from "./visuals/GenerationView";

export default function GenerationModule({ title, eyebrow, intro, tools }) {
  const { current } = useProjects();
  const [history, setHistory] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busyKind, setBusyKind] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  const loadHistory = async () => {
    if (!current) return;
    const kinds = tools.map((t) => t.kind);
    try {
      const res = await api.get("/workspace/generations", { params: { project_id: current.project_id } });
      const filtered = res.data.filter((g) => kinds.includes(g.kind));
      setHistory(filtered);
      if (!active && filtered.length > 0) setActive(filtered[0]);
    } catch (error) { 
      console.error("Failed to load generations history:", error); 
    }
  };

  useEffect(() => {
    setActive(null); setHistory([]); setErrorDetails(null);
    if (current) loadHistory();
  }, [current?.project_id]);

  const run = async (kind) => {
    if (!current) { toast.error("Create a project first."); return; }
    setBusyKind(kind); setLoading(true); setActive(null); setErrorDetails(null);
    try {
      const res = await api.post("/workspace/generate", { project_id: current.project_id, kind });
      setActive(res.data);
      setHistory((h) => [res.data, ...h]);
      toast.success(`${res.data.label} ready`);
    } catch (error) {
      console.error("AI Generation pipeline error:", error);
      const details = error?.response?.data?.detail || {};
      setErrorDetails({
        actualError: details.error || error.message || "Generation failed",
        apiStatus: error.response?.status || 500,
        provider: details.provider || "Unknown",
        model: details.model || "Unknown",
        providerStatus: details.provider_status || "Unknown",
        responseTime: details.response_time || "N/A",
        requestId: details.request_id || "req_" + Math.random().toString(36).substring(2, 9),
        developmentMode: true,
        rawResponse: details.raw_response || ""
      });
      toast.error("Generation failed. Check the diagnostics panel below.");
    } finally { setLoading(false); setBusyKind(null); }
  };

  const copyJson = async () => {
    if (!active?.data) return;
    await navigator.clipboard.writeText(JSON.stringify(active.data, null, 2));
    toast.success("JSON copied");
  };
  const downloadJson = () => {
    if (!active?.data) return;
    const blob = new Blob([JSON.stringify(active.data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${active.label.replace(/\s+/g, "_").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const remove = async () => {
    if (!active) return;
    await api.delete(`/workspace/generations/${active.generation_id}`);
    setHistory((h) => h.filter((g) => g.generation_id !== active.generation_id));
    setActive(null);
    toast.success("Deleted");
  };

  return (
    <div data-testid={`module-${title.toLowerCase()}`}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#7C3AED]">{eyebrow}</p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl font-semibold tracking-tighter text-gray-900">{title}</h1>
          {intro && <p className="mt-2 text-gray-600 max-w-2xl">{intro}</p>}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((t) => {
          const Icon = Icons[t.icon] || Sparkles;
          const isBusy = busyKind === t.kind;
          return (
            <motion.button key={t.kind} whileHover={{ y: -4 }} onClick={() => run(t.kind)} disabled={loading}
              className="group relative text-left bg-white border border-gray-100 rounded-[20px] p-5 hover:shadow-[0_14px_40px_rgba(0,0,0,0.07)] transition-all disabled:opacity-60"
              data-testid={`tool-${t.kind}`}>
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white`}>
                {isBusy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
              </div>
              <p className="mt-4 font-semibold text-gray-900">{t.label}</p>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">{t.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700 group-hover:text-[#7C3AED]">
                {isBusy ? "Generating…" : <>Generate <Icons.ArrowRight className="w-3 h-3" /></>}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-1">
          <p className="text-xs uppercase tracking-widest font-bold text-gray-500">History</p>
          <div className="mt-3 space-y-2 max-h-[70vh] overflow-y-auto no-scrollbar pr-1">
            {history.length === 0 && <p className="text-sm text-gray-400">No outputs yet. Click a tool above.</p>}
            {history.map((g) => (
              <button key={g.generation_id} onClick={() => { setActive(g); setErrorDetails(null); }}
                className={`w-full text-left rounded-xl px-3 py-2.5 border transition ${active?.generation_id === g.generation_id ? "border-[#7C3AED]/40 bg-gradient-to-br from-[#F4F1FF] to-[#FFE9F2]" : "border-gray-100 bg-white hover:border-gray-200"}`}
                data-testid={`history-${g.generation_id}`}>
                <p className="text-sm font-semibold text-gray-900">{g.label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{new Date(g.created_at).toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4">
          <AnimatePresence mode="wait">
            {loading && !active && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-white border border-gray-100 rounded-[24px] p-10 flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                  <Loader2 className="w-7 h-7 mx-auto animate-spin text-[#7C3AED]" />
                  <p className="mt-3 font-display text-lg font-semibold">Thinking…</p>
                  <p className="text-sm text-gray-500">Gemini is generating your analytics.</p>
                </div>
              </motion.div>
            )}

            {active && (
              <motion.div key={active.generation_id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                data-testid="generation-output">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <div>
                    <p className="font-display text-xl font-semibold">{active.label}</p>
                    <p className="text-xs text-gray-500">{new Date(active.created_at).toLocaleString()} · Saved · Generated by Gemini 3 Flash</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={copyJson} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center gap-1" data-testid="output-copy"><Copy className="w-3.5 h-3.5" /> Copy JSON</button>
                    <button onClick={downloadJson} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center gap-1" data-testid="output-download"><Download className="w-3.5 h-3.5" /> .json</button>
                    <button onClick={remove} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 hover:bg-red-50 hover:text-red-600 flex items-center gap-1" data-testid="output-delete"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                <GenerationView kind={active.kind} data={active.data} />
              </motion.div>
            )}

            {errorDetails && (
              <motion.div key="error" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-red-50/70 backdrop-blur-sm border border-red-200/85 rounded-[24px] p-6 text-left space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-red-200 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-red-700">
                    <Icons.AlertTriangle className="w-5 h-5" />
                    <span className="font-display font-bold text-sm tracking-tight">Development Mode — AI Pipeline Error</span>
                  </div>
                  <span className="text-[10px] bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    API Status: {errorDetails.apiStatus}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block font-bold text-gray-500 uppercase text-[9px] tracking-wider">Actual Error</span>
                    <span className="block font-mono text-red-700 font-semibold mt-1 break-all bg-red-100/50 p-2.5 rounded-lg border border-red-100/80">{errorDetails.actualError}</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="block font-bold text-gray-500 uppercase text-[9px] tracking-wider">Provider Status</span>
                      <span className="block font-semibold text-gray-800 mt-1">{errorDetails.provider} / {errorDetails.model} (Status: {errorDetails.providerStatus})</span>
                    </div>
                    <div>
                      <span className="block font-bold text-gray-500 uppercase text-[9px] tracking-wider">Response Time</span>
                      <span className="block font-semibold text-gray-800 mt-1">{errorDetails.responseTime}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-gray-500 uppercase text-[9px] tracking-wider">Request ID</span>
                      <span className="block font-mono text-gray-800 mt-0.5">{errorDetails.requestId}</span>
                    </div>
                  </div>
                </div>
                {errorDetails.rawResponse && (
                  <div className="pt-2">
                    <span className="block font-bold text-gray-500 uppercase text-[9px] tracking-wider mb-1.5">Raw Response Body</span>
                    <pre className="text-[10px] font-mono bg-gray-900 text-gray-100 p-3.5 rounded-xl overflow-x-auto max-h-48 shadow-inner">{errorDetails.rawResponse}</pre>
                  </div>
                )}
              </motion.div>
            )}

            {!loading && !active && !errorDetails && history.length === 0 && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white border border-dashed border-gray-200 rounded-[24px] p-10 text-center">
                <Sparkles className="w-7 h-7 mx-auto text-[#7C3AED]" />
                <p className="mt-3 font-display text-lg font-semibold">Pick a tool above to start.</p>
                <p className="text-sm text-gray-500">Every output is a live visual dashboard, not a wall of text.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
