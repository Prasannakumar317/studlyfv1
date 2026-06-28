import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { useProjects } from "../lib/projects";
import { FileText, Download, Copy, Search } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function DocumentsPage() {
  const { current } = useProjects();
  const [docs, setDocs] = useState([]);
  const [active, setActive] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!current) return;
    api.get("/workspace/generations", { params: { project_id: current.project_id } })
      .then((r) => { setDocs(r.data); setActive(r.data[0] || null); })
      .catch(() => {});
  }, [current?.project_id]);

  const filtered = docs.filter((d) => d.label.toLowerCase().includes(q.toLowerCase()));

  const copy = async () => {
    if (!active) return;
    await navigator.clipboard.writeText(active.content || "");
    toast.success("Copied");
  };
  const download = () => {
    if (!active) return;
    const blob = new Blob([active.content || ""], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${active.label.replace(/\s+/g, "_").toLowerCase()}.md`;
    a.click();
  };

  return (
    <div data-testid="documents-page">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#6C63FF]">Workspace</p>
        <h1 className="mt-1 font-display text-3xl md:text-4xl font-semibold tracking-tighter">Documents</h1>
        <p className="mt-2 text-gray-600">Everything your AI agents have generated.</p>
      </div>

      <div className="mt-6 relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents…"
               className="w-full pl-9 pr-3 py-2.5 rounded-full border border-gray-200 text-sm outline-none focus:border-[#6C63FF]"
               data-testid="documents-search" />
      </div>

      {docs.length === 0 ? (
        <div className="mt-10 rounded-[24px] border border-dashed border-gray-200 p-10 text-center bg-white">
          <FileText className="w-7 h-7 mx-auto text-[#6C63FF]" />
          <p className="mt-3 font-display text-lg font-semibold">No documents yet</p>
          <p className="text-sm text-gray-500">Generate one from Strategy, Marketing or Funding.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto no-scrollbar">
            {filtered.map((d) => (
              <button key={d.generation_id} onClick={() => setActive(d)}
                className={`w-full text-left rounded-xl p-3 border ${active?.generation_id === d.generation_id ? "border-[#6C63FF]/40 bg-[#F4F1FF]" : "border-gray-100 bg-white hover:border-gray-200"}`}
                data-testid={`doc-${d.generation_id}`}>
                <p className="text-sm font-semibold">{d.label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{new Date(d.created_at).toLocaleString()}</p>
              </button>
            ))}
            {filtered.length === 0 && <p className="text-sm text-gray-400 px-2">No matches.</p>}
          </div>
          <div className="lg:col-span-3">
            {active && (
              <div className="bg-white border border-gray-100 rounded-[24px] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-display text-lg font-semibold">{active.label}</p>
                    <p className="text-xs text-gray-500">{new Date(active.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={copy} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 flex items-center gap-1"><Copy className="w-3.5 h-3.5" /> Copy</button>
                    <button onClick={download} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 flex items-center gap-1"><Download className="w-3.5 h-3.5" /> .md</button>
                  </div>
                </div>
                <div className="px-6 py-6 prose prose-sm md:prose-base max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{active.content || ""}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
