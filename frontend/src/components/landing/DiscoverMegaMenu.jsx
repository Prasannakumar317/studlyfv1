import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Search, Loader2, MapPin, Building2, TrendingUp, Newspaper, X,
  Briefcase, Star, Bookmark, Globe2, ArrowUpRight, BookOpen, Rocket,
} from "lucide-react";
import api from "../../lib/api";

const QUICK_LINKS = [
  { label: "Browse startups",   icon: Building2, to: "/discover" },
  { label: "Startup blog",      icon: BookOpen,  to: "/discover/blog" },
  { label: "Featured lists",    icon: Star,      to: "/discover/lists" },
  { label: "Hiring companies",  icon: Briefcase, to: "/discover/hiring" },
  { label: "Remote jobs",       icon: Globe2,    to: "/discover/remote" },
];

function useDebounced(value, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function timeAgo(iso) {
  if (!iso) return "";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return `${Math.floor(s)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function LogoFallback({ name }) {
  const initial = (name || "?").trim()[0].toUpperCase();
  return (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] text-white text-sm font-display font-semibold flex items-center justify-center shrink-0">
      {initial}
    </div>
  );
}

function CompanyLogo({ logo, name }) {
  const [err, setErr] = useState(false);
  if (!logo || err) return <LogoFallback name={name} />;
  return (
    <img src={logo} alt={`${name} logo`} onError={() => setErr(true)}
         className="w-9 h-9 rounded-xl object-contain bg-white border border-gray-100 shrink-0" />
  );
}

function Skeleton({ rows = 4 }) {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="w-9 h-9 rounded-xl bg-gray-100" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-2/3 bg-gray-100 rounded" />
            <div className="h-2.5 w-1/2 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DiscoverMegaMenu({ onClose, panelId = "discover-mega", isMobile = false, onMouseEnter, onMouseLeave }) {
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 250);
  const panelRef = useRef(null);
  const routerNav = useNavigate();

  // Queries using TanStack Query
  const { data: startups = [], isLoading: loadingStartups, error: errorStartups } = useQuery({
    queryKey: ["discover-startups"],
    queryFn: () => api.get("/discover/startups?limit=8").then((r) => r.data.items || []),
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const { data: news = [], isLoading: loadingNews, error: errorNews } = useQuery({
    queryKey: ["discover-news"],
    queryFn: () => api.get("/discover/stories?limit=6").then((r) => r.data.items || []),
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const { data: industries = [], isLoading: loadingIndustries } = useQuery({
    queryKey: ["discover-industries"],
    queryFn: () => api.get("/discover/industries").then((r) => r.data.items || []),
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const { data: searchResults = null, isLoading: searching } = useQuery({
    queryKey: ["discover-search", dq],
    queryFn: () => {
      if (!dq.trim()) return Promise.resolve(null);
      return api.get(`/discover/search?q=${encodeURIComponent(dq)}&limit=12`).then((r) => r.data.items || []);
    },
    enabled: dq.trim().length > 0,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  // ESC closes; Keyboard focus trapping and arrow keys navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
        return;
      }
      
      if (!panelRef.current) return;
      
      const focusables = Array.from(
        panelRef.current.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]'
        )
      );
      
      if (focusables.length === 0) return;
      
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const activeIdx = focusables.indexOf(document.activeElement);
        if (e.key === "ArrowDown") {
          const nextIdx = (activeIdx + 1) % focusables.length;
          focusables[nextIdx].focus();
          e.preventDefault();
        } else {
          const prevIdx = (activeIdx - 1 + focusables.length) % focusables.length;
          focusables[prevIdx].focus();
          e.preventDefault();
        }
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    // focus search on open
    const id = setTimeout(() => panelRef.current?.querySelector('input[type="search"]')?.focus(), 80);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearTimeout(id);
    };
  }, [onClose]);

  const navigate = useCallback((url, external = false) => {
    if (external) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      routerNav(url);
    }
    onClose?.();
  }, [onClose, routerNav]);

  const handleBackdropClose = (e) => {
    if (panelRef.current && e.relatedTarget && (typeof e.relatedTarget.nodeType === "number") && !panelRef.current.contains(e.relatedTarget)) {
      onClose?.();
    }
  };

  return (
    <motion.div
      ref={panelRef}
      id={panelId}
      role="dialog"
      aria-modal="true"
      aria-label="Discover startups, investors, incubators, and news"
      initial={isMobile ? { x: "100%" } : { opacity: 0, y: -8, x: "-50%" }}
      animate={isMobile ? { x: 0 } : { opacity: 1, y: 0, x: "-50%" }}
      exit={isMobile ? { x: "100%" } : { opacity: 0, y: -8, x: "-50%" }}
      transition={{ type: "spring", damping: 25, stiffness: 220 }}
      className={
        isMobile
          ? "fixed inset-0 z-[9999] w-screen h-screen bg-white overflow-y-auto flex flex-col focus:outline-none"
          : "fixed left-1/2 top-[80px] z-[9999] w-[min(95vw,1280px)] max-h-[85vh] overflow-y-auto rounded-[20px] bg-white border border-gray-200 shadow-[0_22px_60px_rgba(0,0,0,0.12)] flex flex-col focus:outline-none"
      }
      onMouseEnter={!isMobile ? onMouseEnter : undefined}
      onMouseLeave={!isMobile ? (e) => { handleBackdropClose(e); onMouseLeave?.(e); } : undefined}
      data-testid="discover-megamenu"
    >
      {/* Global Search input */}
      <div className="px-8 pt-7 pb-4 border-b border-gray-100 flex items-center gap-3">
        <label className="block relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search startups, investors, incubators, funding news..."
            aria-label="Search startups, investors, incubators, funding news"
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/15 outline-none text-sm transition-all"
            data-testid="discover-search"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-400">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </label>
        {isMobile && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-3 rounded-full hover:bg-gray-100 text-gray-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Conditional: Search results override or mega-menu contents */}
      {q.trim() ? (
        <div className="px-8 py-6 flex-1 overflow-y-auto">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-4">
            {searching ? "Searching…" : `Results for "${q}"`}
          </p>
          {searching ? <Skeleton rows={6} /> : (
            searchResults && searchResults.length > 0 ? (
              <div className="space-y-6">
                {Object.entries(
                  searchResults.reduce((acc, item) => {
                    const t = item.type || "startup";
                    acc[t] = acc[t] || [];
                    acc[t].push(item);
                    return acc;
                  }, {})
                ).map(([type, list]) => {
                  const typeNames = {
                    startup: "Startups",
                    incubator: "Incubators & Accelerators",
                    vc: "VC Firms",
                    industry: "Industries",
                    news: "Startup News & Funding"
                  };
                  return (
                    <div key={type} className="space-y-2.5">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{typeNames[type] || type}</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {list.map((c, idx) => (
                          <li key={`${c.slug}-${idx}`}>
                            <button
                              onClick={() => {
                                if (c.type === "industry") {
                                  navigate(`/discover?industry=${c.slug}`);
                                } else if (c.type === "news") {
                                  navigate(c.website || c.url, true);
                                } else {
                                  navigate(`/discover/company/${c.slug}`);
                                }
                              }}
                              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl hover:bg-gray-50 text-left transition group border border-gray-50 hover:border-gray-100 hover:shadow-sm"
                            >
                              {c.logo ? (
                                <CompanyLogo logo={c.logo} name={c.name} />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                  {c.type === "industry" ? <Building2 className="w-4 h-4" /> : <Newspaper className="w-4 h-4" />}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold truncate text-gray-900 group-hover:text-[#6C63FF]">{c.name}</p>
                                <p className="text-xs text-gray-500 truncate leading-relaxed">{c.description || c.industry}</p>
                              </div>
                              <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[#6C63FF] transition" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No matches found. Try searching for a different topic, industry, or company name.</p>
            )
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* SECTION 1 — Startup Directory */}
          <div className="px-8 pt-6 pb-2">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Startup Directory</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Startups */}
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                className="group relative rounded-[20px] p-5 bg-gradient-to-br from-indigo-50/50 to-pink-50/30 border border-gray-100 hover:border-indigo-100 shadow-sm cursor-pointer transition-all duration-300"
                onClick={() => navigate("/startups")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-500 text-white shadow-md shadow-indigo-500/10">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-semibold text-gray-900 group-hover:text-indigo-600 transition">Startups</h4>
                </div>
                <p className="mt-3 text-xs text-gray-500 leading-relaxed">Browse and discover innovative startups from around the world.</p>
              </motion.div>

              {/* Card 2: Incubators */}
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                className="group relative rounded-[20px] p-5 bg-gradient-to-br from-pink-50/50 to-orange-50/30 border border-gray-100 hover:border-pink-100 shadow-sm cursor-pointer transition-all duration-300"
                onClick={() => navigate("/incubators")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-pink-500 text-white shadow-md shadow-pink-500/10">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-semibold text-gray-900 group-hover:text-pink-600 transition">Incubators</h4>
                </div>
                <p className="mt-3 text-xs text-gray-500 leading-relaxed">Explore startup accelerators, incubators, and founder programs.</p>
              </motion.div>

              {/* Card 3: VC Firms */}
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                className="group relative rounded-[20px] p-5 bg-gradient-to-br from-orange-50/50 to-amber-50/30 border border-gray-100 hover:border-orange-100 shadow-sm cursor-pointer transition-all duration-300"
                onClick={() => navigate("/vc-firms")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-500/10">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-semibold text-gray-900 group-hover:text-orange-600 transition">VC Firms</h4>
                </div>
                <p className="mt-3 text-xs text-gray-500 leading-relaxed">Discover venture capital firms actively investing in startups.</p>
              </motion.div>
            </div>
          </div>

          <div className="h-px bg-gray-100 mx-8 my-5" />

          {/* Grid Layout for Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 px-8 pb-7">
            {/* COL 1 — Trending Startups */}
            <div>
              <header className="flex items-center gap-2 mb-3.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#6C63FF]" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-700">Trending Startups</h3>
              </header>
              {loadingStartups ? <Skeleton rows={6} /> : errorStartups ? (
                <p className="text-sm text-gray-500">Couldn't load startups.</p>
              ) : startups.length === 0 ? (
                <p className="text-sm text-gray-500">Nothing trending right now.</p>
              ) : (
                <ul className="space-y-1.5">
                  {startups.map((c) => (
                    <li key={c.slug}>
                      <button
                        onClick={() => navigate(`/discover/company/${c.slug}`)}
                        className="w-full flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-gray-50 text-left group transition border border-transparent hover:border-gray-100/80"
                        data-testid={`startup-${c.slug}`}
                      >
                        <CompanyLogo logo={c.logo} name={c.name} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#6C63FF] transition">{c.name}</p>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">{c.description}</p>
                          <p className="text-[10px] text-gray-400 truncate mt-1 flex items-center gap-2">
                            {c.industry && <span>{c.industry}</span>}
                            {c.location && <><span>·</span><MapPin className="w-2.5 h-2.5 text-gray-300" />{c.location}</>}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* COL 2 — Explore Industries */}
            <div>
              <header className="flex items-center gap-2 mb-3.5">
                <Building2 className="w-3.5 h-3.5 text-[#FF4D94]" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-700">Explore Industries</h3>
              </header>
              {loadingIndustries ? <Skeleton rows={4} /> : (
                <div className="flex flex-wrap gap-2">
                  {industries.map((it) => (
                    <a
                      key={it.slug}
                      href={`/discover?industry=${it.slug}`}
                      onClick={(e) => { e.preventDefault(); navigate(`/discover?industry=${it.slug}`); }}
                      className="rounded-full px-3.5 py-1.5 text-xs font-medium border border-gray-200 bg-white hover:border-[#6C63FF] hover:text-[#6C63FF] hover:shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
                      data-testid={`industry-${it.slug}`}
                    >
                      {it.name}
                    </a>
                  ))}
                </div>
              )}
              <div className="mt-6 rounded-2xl p-5 text-white relative overflow-hidden shadow-sm"
                   style={{ background: "linear-gradient(135deg, #6C63FF 0%, #FF4D94 100%)" }}>
                <Bookmark className="w-4 h-4" />
                <p className="mt-3 font-display text-sm font-semibold">Add yours</p>
                <p className="text-[11px] opacity-90 mt-1.5 leading-relaxed">List your startup on STUDLYF AI to reach builders, mentors and investors.</p>
                <button onClick={() => navigate("/")} className="mt-4 bg-white text-gray-900 text-[11px] font-semibold rounded-full px-4.5 py-2 hover:bg-gray-50 transition shadow-sm">
                  Get featured
                </button>
              </div>
            </div>

            {/* COL 3 — Startup News & Funding */}
            <div>
              <header className="flex items-center gap-2 mb-3.5">
                <Newspaper className="w-3.5 h-3.5 text-[#FF7A18]" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-700">Startup News & Funding</h3>
              </header>
              {loadingNews ? <Skeleton rows={5} /> : errorNews ? (
                <p className="text-sm text-gray-500">Couldn't load news.</p>
              ) : news.length === 0 ? (
                <p className="text-sm text-gray-500">No stories right now.</p>
              ) : (
                <ul className="space-y-2">
                  {news.map((s, i) => (
                    <li key={i}>
                      <button
                        onClick={() => navigate(s.url, true)}
                        className="w-full text-left rounded-2xl px-3 py-3 hover:bg-gray-50 border border-transparent hover:border-gray-100 hover:shadow-sm group transition-all duration-200"
                        data-testid={`story-${i}`}
                      >
                        <p className="text-sm font-semibold leading-snug text-gray-900 group-hover:text-[#6C63FF] line-clamp-2">{s.title}</p>
                        
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {s.startup && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#6C63FF]/5 text-[#6C63FF] border border-[#6C63FF]/10 truncate max-w-[120px]">
                              {s.startup}
                            </span>
                          )}
                          {s.funding && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                              {s.funding}
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1.5">
                          <span className="truncate max-w-[140px] font-medium text-gray-500">{s.source}</span>
                          <span>·</span>
                          <span>{timeAgo(s.time)}</span>
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer quick links */}
      <div className="border-t border-gray-100 px-8 py-4 bg-gradient-to-r from-[#FAFAFC] to-white shrink-0">
        <ul className="flex flex-wrap items-center justify-center md:justify-between gap-2">
          {QUICK_LINKS.map((l) => (
            <li key={l.label}>
              <button
                onClick={() => navigate(l.to)}
                className="text-xs font-medium text-gray-700 hover:text-[#6C63FF] inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 transition"
                data-testid={`quicklink-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <l.icon className="w-3.5 h-3.5" /> {l.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
