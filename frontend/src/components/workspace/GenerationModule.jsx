import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import * as Icons from "lucide-react";
import { Sparkles, Loader2, Copy, Download, Trash2, CheckCircle2 } from "lucide-react";
import api from "../../lib/api";
import { useProjects } from "../../lib/projects";
import { toast } from "sonner";

/**
 * tools: [{ kind, label, desc, icon, gradient }, ...]
 */
export default function GenerationModule({ title, eyebrow, intro, tools }) {
  const { current } = useProjects();
  const [history, setHistory] = useState([]);
  const [active, setActive] = useState(null); // { kind, content, generation_id, created_at, label }
  const [loading, setLoading] = useState(false);
  const [busyKind, setBusyKind] = useState(null);

  const loadHistory = async () => {
    if (!current) return;
    const kinds = tools.map((t) => t.kind);
    try {
      const res = await api.get("/workspace/generations", { params: { project_id: current.project_id } });
      const filtered = res.data.filter((g) => kinds.includes(g.kind));
      setHistory(filtered);
      if (!active && filtered.length > 0) setActive(filtered[0]);
    } catch (e) {
      // ignore — empty history is fine
    }
  };

  useEffect(() => {
    setActive(null);
    setHistory([]);
    if (current) loadHistory();
  }, [current?.project_id]);

  const run = async (kind) => {
    if (!current) {
      toast.error("Create a project first.");
      return;
    }
    setBusyKind(kind);
    setLoading(true);
    try {
      const res = await api.post("/workspace/generate", { project_id: current.project_id, kind });
      setActive(res.data);
      setHistory((h) => [res.data, ...h]);
      toast.success(`${res.data.label} ready`);
    } catch (e) {
      const msg = e?.response?.data?.detail || "Generation failed";
      toast.error(typeof msg === "string" ? msg : "Generation failed");
    } finally {
      setLoading(false);
      setBusyKind(null);
    }
  };

  const copyMd = async () => {
    if (!active?.content) return;
    await navigator.clipboard.writeText(active.content);
    toast.success("Markdown copied");
  };
  const downloadMd = () => {
    if (!active?.content) return;
    const blob = new Blob([active.content], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${active.label.replace(/\s+/g, "_").toLowerCase()}.md`;
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
          <p className="text-xs font-bold uppercase tracking-widest text-[#6C63FF]">{eyebrow}</p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl font-semibold tracking-tighter text-gray-900">{title}</h1>
          {intro && <p className="mt-2 text-gray-600 max-w-2xl">{intro}</p>}
        </div>
      </div>

      {/* Tools */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((t) => {
          const Icon = Icons[t.icon] || Sparkles;
          const isBusy = busyKind === t.kind;
          return (
            <motion.button
              key={t.kind}
              whileHover={{ y: -4 }}
              onClick={() => run(t.kind)}
              disabled={loading}
              className="group relative text-left bg-white border border-gray-100 rounded-[20px] p-5 hover:shadow-[0_14px_40px_rgba(0,0,0,0.07)] transition-all disabled:opacity-60"
              data-testid={`tool-${t.kind}`}
            >
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white`}>
                {isBusy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
              </div>
              <p className="mt-4 font-semibold text-gray-900">{t.label}</p>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">{t.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700 group-hover:text-[#6C63FF]">
                {isBusy ? "Generating…" : <>Generate <Icons.ArrowRight className="w-3 h-3" /></>}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Output + history */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <p className="text-xs uppercase tracking-widest font-bold text-gray-500">History</p>
          <div className="mt-3 space-y-2 max-h-[60vh] overflow-y-auto no-scrollbar">
            {history.length === 0 && (
              <p className="text-sm text-gray-400">No generations yet. Click a tool above.</p>
            )}
            {history.map((g) => (
              <button
                key={g.generation_id}
                onClick={() => setActive(g)}
                className={`w-full text-left rounded-xl px-3 py-2.5 border transition ${
                  active?.generation_id === g.generation_id
                    ? "border-[#6C63FF]/40 bg-gradient-to-br from-[#F4F1FF] to-[#FFE9F2]"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
                data-testid={`history-${g.generation_id}`}
              >
                <p className="text-sm font-semibold text-gray-900">{g.label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{new Date(g.created_at).toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {loading && !active && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-white border border-gray-100 rounded-[24px] p-10 flex items-center justify-center min-h-[300px]"
              >
                <div className="text-center">
                  <Loader2 className="w-7 h-7 mx-auto animate-spin text-[#6C63FF]" />
                  <p className="mt-3 font-display text-lg font-semibold">Thinking…</p>
                  <p className="text-sm text-gray-500">Gemini is drafting your output.</p>
                </div>
              </motion.div>
            )}

            {active && (
              <motion.div
                key={active.generation_id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-white border border-gray-100 rounded-[24px] overflow-hidden"
                data-testid="generation-output"
              >
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-display text-lg font-semibold">{active.label}</p>
                    <p className="text-xs text-gray-500">{new Date(active.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={copyMd} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center gap-1" data-testid="output-copy">
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                    <button onClick={downloadMd} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center gap-1" data-testid="output-download">
                      <Download className="w-3.5 h-3.5" /> .md
                    </button>
                    <button onClick={remove} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 hover:bg-red-50 hover:text-red-600 flex items-center gap-1" data-testid="output-delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="px-6 py-6 prose prose-sm md:prose-base max-w-none prose-headings:font-display prose-headings:tracking-tight prose-h1:text-2xl prose-h2:text-lg prose-h2:mt-6 prose-h3:text-base prose-p:text-gray-700 prose-li:text-gray-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{active.content || ""}</ReactMarkdown>
                </div>
                <div className="px-6 py-3 border-t border-gray-100 bg-gradient-to-r from-[#F4F1FF]/40 to-[#FFE9F2]/40 text-xs text-gray-600 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2ECC71]" /> Saved to your workspace · Generated by Gemini 3 Flash
                </div>
              </motion.div>
            )}

            {!loading && !active && history.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white border border-dashed border-gray-200 rounded-[24px] p-10 text-center"
              >
                <Sparkles className="w-7 h-7 mx-auto text-[#6C63FF]" />
                <p className="mt-3 font-display text-lg font-semibold">Pick a tool above to start.</p>
                <p className="text-sm text-gray-500">Outputs are saved here automatically.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
