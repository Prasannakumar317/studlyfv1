import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, FolderKanban, Trash2, Edit3, Sparkles, ArrowUpRight, X } from "lucide-react";
import { useProjects } from "../lib/projects";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { toast } from "sonner";

export default function ProjectsPage() {
  const { projects, current, setCurrent, create, remove } = useProjects();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", tagline: "", industry: "", stage: "Idea" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await create(form);
      toast.success("Project created");
      setOpen(false);
      setForm({ name: "", tagline: "", industry: "", stage: "Idea" });
    } catch (e) {
      toast.error("Could not create project");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? All generations will be lost.`)) return;
    try {
      await remove(p.project_id);
      toast.success("Project deleted");
    } catch (e) {
      toast.error("Could not delete project");
    }
  };

  return (
    <div data-testid="projects-page">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#6C63FF]">Workspace</p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl font-semibold tracking-tighter">Projects</h1>
          <p className="mt-2 text-gray-600">All your startups in one place.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="glow-button rounded-full px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2"
          data-testid="new-project-btn"
        >
          <Plus className="w-4 h-4" /> New project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="mt-12 rounded-[24px] border border-dashed border-gray-200 p-12 text-center bg-white">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] text-white flex items-center justify-center">
            <Sparkles className="w-7 h-7" />
          </div>
          <p className="mt-4 font-display text-2xl font-semibold">Create your first project</p>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">Drop in your startup idea — your team of AI agents will get to work generating strategy, brand, marketing and investor assets.</p>
          <button onClick={() => setOpen(true)} className="mt-6 glow-button rounded-full px-6 py-3 text-sm font-semibold inline-flex items-center gap-2" data-testid="empty-new-project">
            <Plus className="w-4 h-4" /> Start a project
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => {
            const isActive = current?.project_id === p.project_id;
            return (
              <motion.div
                key={p.project_id}
                whileHover={{ y: -4 }}
                onClick={() => setCurrent(p)}
                className={`relative rounded-[24px] bg-white border p-5 cursor-pointer transition-all ${
                  isActive ? "border-[#6C63FF]/40 shadow-[0_14px_40px_rgba(108,99,255,0.12)]" : "border-gray-100 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)]"
                }`}
                data-testid={`project-card-${p.project_id}`}
              >
                {p.is_demo && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#FF4D94] text-white">Demo</span>
                )}
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] text-white flex items-center justify-center">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <p className="mt-4 font-display text-lg font-semibold">{p.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.industry || "—"} · {p.stage}</p>
                <p className="mt-3 text-sm text-gray-700 line-clamp-2">{p.tagline || "No tagline yet."}</p>

                <div className="mt-4 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${isActive ? "text-[#6C63FF]" : "text-gray-500"}`}>
                    {isActive ? "Selected" : "Click to select"} <ArrowUpRight className="w-3 h-3" />
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(p); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"
                    data-testid={`delete-project-${p.project_id}`}
                    aria-label="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-[24px] p-0 overflow-hidden" data-testid="new-project-dialog">
          <div className="px-7 pt-7 pb-2">
            <DialogHeader className="text-left">
              <DialogTitle className="font-display text-2xl tracking-tight">New project</DialogTitle>
              <DialogDescription>Tell us a little about what you&apos;re building.</DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={submit} className="px-7 pb-7 space-y-3">
            <input
              required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Project name *"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/15 text-sm outline-none"
              data-testid="new-project-name"
            />
            <input
              value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              placeholder="One-line tagline"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/15 text-sm outline-none"
              data-testid="new-project-tagline"
            />
            <input
              value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}
              placeholder="Industry (e.g. Cleantech, B2B SaaS)"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/15 text-sm outline-none"
              data-testid="new-project-industry"
            />
            <select
              value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/15 text-sm outline-none bg-white"
              data-testid="new-project-stage"
            >
              {["Idea", "Validation", "Pre-seed", "Seed", "Series A", "Growth"].map((s) => <option key={s}>{s}</option>)}
            </select>
            <button
              type="submit" disabled={busy}
              className="glow-button w-full rounded-full py-3 text-sm font-semibold disabled:opacity-70"
              data-testid="new-project-submit"
            >
              {busy ? "Creating…" : "Create project"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
