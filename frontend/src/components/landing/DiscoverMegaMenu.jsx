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

const TOOLKIT_CATEGORIES = [
  {
    name: "MVP & Product Development",
    description: "Build and validate your MVP quickly.",
    tools: [
      { name: "Lovable", domain: "lovable.dev", desc: "Build full-stack apps using AI.", tags: ["AI Tools", "Free Tier Available", "Popular with Startups"] },
      { name: "Emergent", domain: "emergent.dev", desc: "AI agent development and integration platform.", tags: ["AI Tools"] },
      { name: "Bolt.new", domain: "bolt.new", desc: "In-browser sandbox for building full-stack web apps.", tags: ["AI Tools", "Free Tier Available"] },
      { name: "v0 by Vercel", domain: "v0.dev", desc: "Generative UI system powered by AI.", tags: ["AI Tools", "Free Tier Available"] },
      { name: "Replit", domain: "replit.com", desc: "Collaborative browser-based IDE and hosting.", tags: ["Free Tier Available"] },
      { name: "Cursor", domain: "cursor.com", desc: "AI-first code editor built on VS Code.", tags: ["AI Tools", "Free Tier Available"] },
      { name: "Windsurf", domain: "codeium.com", desc: "Next-gen AI coding assistant IDE.", tags: ["AI Tools"] },
      { name: "Figma", domain: "figma.com", desc: "Collaborative design and prototyping interface.", tags: ["Free Tier Available", "Popular with Startups"] }
    ]
  },
  {
    name: "Landing Pages & Websites",
    description: "Create beautiful marketing websites.",
    tools: [
      { name: "Framer", domain: "framer.com", desc: "Design and publish websites visually.", tags: ["No-Code", "Free Tier Available"] },
      { name: "Webflow", domain: "webflow.com", desc: "Professional visual web development platform.", tags: ["No-Code"] },
      { name: "Wix Studio", domain: "wix.com", desc: "Advanced web design and development platform.", tags: ["No-Code"] },
      { name: "WordPress", domain: "wordpress.org", desc: "World's most popular open-source CMS.", tags: ["Open Source", "Free Tier Available"] },
      { name: "Carrd", domain: "carrd.co", desc: "Simple, responsive one-page websites.", tags: ["No-Code", "Free Tier Available"] }
    ]
  },
  {
    name: "Automation & Workflows",
    description: "Automate repetitive tasks and operations.",
    tools: [
      { name: "n8n", domain: "n8n.io", desc: "Extendable open-source workflow automation.", tags: ["Open Source", "Free Tier Available"] },
      { name: "Zapier", domain: "zapier.com", desc: "No-code integration and automated workflows.", tags: ["No-Code", "Free Tier Available"] },
      { name: "Make", domain: "make.com", desc: "Visual platform to build and automate workflows.", tags: ["No-Code"] },
      { name: "Pipedream", domain: "pipedream.com", desc: "Integration platform for developers.", tags: ["Free Tier Available"] }
    ]
  },
  {
    name: "Backend & Databases",
    description: "Power your applications with scalable infrastructure.",
    tools: [
      { name: "Supabase", domain: "supabase.com", desc: "Open source Firebase alternative built on PostgreSQL.", tags: ["Open Source", "Free Tier Available", "Popular with Startups"] },
      { name: "Firebase", domain: "firebase.google.com", desc: "Google's mobile and web application development platform.", tags: ["Free Tier Available"] },
      { name: "Neon", domain: "neon.tech", desc: "Serverless, autoscaling PostgreSQL database.", tags: ["Free Tier Available"] },
      { name: "PlanetScale", domain: "planetscale.com", desc: "Scalable MySQL database platform.", tags: ["Popular with Startups"] },
      { name: "Appwrite", domain: "appwrite.io", desc: "Open-source backend server for web and mobile.", tags: ["Open Source"] }
    ]
  },
  {
    name: "Authentication & User Management",
    description: "Manage users securely.",
    tools: [
      { name: "Clerk", domain: "clerk.com", desc: "Complete user management and authentication suite.", tags: ["Free Tier Available"] },
      { name: "Auth0", domain: "auth0.com", desc: "Flexible, enterprise-grade identity platform.", tags: [] },
      { name: "Better Auth", domain: "better-auth.com", desc: "Modern TypeScript-first auth solution.", tags: ["Open Source", "Free Tier Available"] },
      { name: "Firebase Auth", domain: "firebase.google.com", desc: "Easy authentication using email or socials.", tags: ["Free Tier Available"] }
    ]
  },
  {
    name: "Payments & Billing",
    description: "Accept payments globally.",
    tools: [
      { name: "Stripe", domain: "stripe.com", desc: "Financial infrastructure for the internet.", tags: ["Popular with Startups"] },
      { name: "Razorpay", domain: "razorpay.com", desc: "Leading payments solution for businesses in India.", tags: [] },
      { name: "Lemon Squeezy", domain: "lemonsqueezy.com", desc: "Merchant of record for SaaS payments and tax handling.", tags: ["Free Tier Available"] },
      { name: "Paddle", domain: "paddle.com", desc: "Unified billing and merchant of record platform.", tags: [] }
    ]
  },
  {
    name: "Analytics & Product Insights",
    description: "Understand user behavior and product usage.",
    tools: [
      { name: "PostHog", domain: "posthog.com", desc: "Open source product analytics and feature flags.", tags: ["Open Source", "Free Tier Available", "Popular with Startups"] },
      { name: "Mixpanel", domain: "mixpanel.com", desc: "Event-based user behavior tracking and analytics.", tags: ["Free Tier Available"] },
      { name: "Google Analytics", domain: "analytics.google.com", desc: "Global web traffic tracking and reporting.", tags: ["Free Tier Available"] },
      { name: "Amplitude", domain: "amplitude.com", desc: "Digital analytics and cohort segmentation platform.", tags: [] }
    ]
  },
  {
    name: "Customer Support",
    description: "Deliver world-class customer support.",
    tools: [
      { name: "Intercom", domain: "intercom.com", desc: "AI-first customer service platform.", tags: ["AI Tools"] },
      { name: "Crisp", domain: "crisp.chat", desc: "Simple live chat and helpdesk solution.", tags: ["AI Tools", "Free Tier Available"] },
      { name: "Zendesk", domain: "zendesk.com", desc: "Enterprise customer service and ticketing system.", tags: [] },
      { name: "Tidio", domain: "tidio.com", desc: "AI customer service chat and widgets.", tags: ["Free Tier Available"] }
    ]
  },
  {
    name: "Email & Notifications",
    description: "Engage users through email and notifications.",
    tools: [
      { name: "Resend", domain: "resend.com", desc: "Modern developer-friendly email sending platform.", tags: ["Free Tier Available", "Popular with Startups"] },
      { name: "SendGrid", domain: "sendgrid.com", desc: "Scalable cloud-based transactional email service.", tags: [] },
      { name: "Loops", domain: "loops.so", desc: "Modern email marketing and automation for SaaS.", tags: ["Free Tier Available", "Popular with Startups"] },
      { name: "Mailchimp", domain: "mailchimp.com", desc: "All-in-one marketing platform and email campaigns.", tags: [] }
    ]
  },
  {
    name: "Design & Branding",
    description: "Create beautiful designs and brand assets.",
    tools: [
      { name: "Figma", domain: "figma.com", desc: "Collaborative interface design tool.", tags: ["Free Tier Available", "Popular with Startups"] },
      { name: "Canva", domain: "canva.com", desc: "Easy visual content and graphics creation.", tags: ["No-Code", "Free Tier Available"] },
      { name: "Adobe Express", domain: "adobe.com", desc: "Quick graphic design and layout editor.", tags: [] },
      { name: "Midjourney", domain: "midjourney.com", desc: "Generative AI imagery and creative assets.", tags: ["AI Tools"] }
    ]
  },
  {
    name: "Marketing & SEO",
    description: "Grow traffic and acquire customers.",
    tools: [
      { name: "Ahrefs", domain: "ahrefs.com", desc: "SEO toolset to analyze backlinks and keywords.", tags: [] },
      { name: "Semrush", domain: "semrush.com", desc: "Complete online marketing suite and SEO tools.", tags: [] },
      { name: "Google Search Console", domain: "search.google.com", desc: "Monitor and optimize search ranking.", tags: [] },
      { name: "HubSpot", domain: "hubspot.com", desc: "Inbound marketing, sales, and CRM suite.", tags: [] }
    ]
  },
  {
    name: "Team Collaboration",
    description: "Manage projects and collaborate efficiently.",
    tools: [
      { name: "Notion", domain: "notion.so", desc: "All-in-one workspace for notes, docs, and tasks.", tags: ["No-Code", "Free Tier Available", "Popular with Startups"] },
      { name: "Slack", domain: "slack.com", desc: "Instant messaging and team communications.", tags: ["Popular with Startups"] },
      { name: "Linear", domain: "linear.app", desc: "High-performance issue tracking and project management.", tags: ["Free Tier Available", "Popular with Startups"] },
      { name: "Jira", domain: "jira.com", desc: "Enterprise agile software development tracking.", tags: [] }
    ]
  },
  {
    name: "Founder Community & Learning",
    description: "Learn and connect with other founders.",
    tools: [
      { name: "Y Combinator", domain: "ycombinator.com", desc: "World's most successful startup accelerator.", tags: ["Popular with Startups"] },
      { name: "Product Hunt", domain: "producthunt.com", desc: "Discover and launch new products daily.", tags: ["Popular with Startups"] },
      { name: "Indie Hackers", domain: "indiehackers.com", desc: "Community of developers building self-funded businesses.", tags: ["Free Tier Available"] },
      { name: "Hacker News", domain: "news.ycombinator.com", desc: "Tech and startup link aggregator and community.", tags: ["Free Tier Available"] },
      { name: "Wellfound", domain: "wellfound.com", desc: "Connect with startup talent and investors.", tags: ["Free Tier Available"] }
    ]
  }
];

function ToolLogo({ domain, name }) {
  const logoUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  const [err, setErr] = useState(false);
  if (err) {
    const initial = (name || "?")[0].toUpperCase();
    return (
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
        {initial}
      </div>
    );
  }
  return (
    <img
      src={logoUrl}
      alt={`${name} logo`}
      onError={() => setErr(true)}
      className="w-8 h-8 rounded-lg object-contain bg-white shrink-0 border border-gray-100"
    />
  );
}

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
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#EC4899] text-white text-sm font-display font-semibold flex items-center justify-center shrink-0">
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
  const [activeTab, setActiveTab] = useState("directory"); // "directory" | "toolkit"
  const [selectedFilter, setSelectedFilter] = useState("All");

  const dq = useDebounced(q, 250);
  const panelRef = useRef(null);
  const routerNav = useNavigate();

  // Filter/search logic for toolkit
  const filteredToolkit = TOOLKIT_CATEGORIES.map(category => {
    const matchedTools = category.tools.filter(tool => {
      const matchesSearch = q.trim() === "" ||
        tool.name.toLowerCase().includes(q.toLowerCase()) ||
        category.name.toLowerCase().includes(q.toLowerCase()) ||
        tool.desc.toLowerCase().includes(q.toLowerCase());

      const matchesFilter = selectedFilter === "All" || tool.tags.includes(selectedFilter);
      return matchesSearch && matchesFilter;
    });
    return {
      ...category,
      tools: matchedTools
    };
  }).filter(category => category.tools.length > 0);

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
            placeholder={activeTab === "toolkit" ? "Search founder tools..." : "Search startups, investors, incubators, funding news..."}
            aria-label={activeTab === "toolkit" ? "Search founder tools" : "Search startups, investors, incubators, funding news"}
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 outline-none text-sm transition-all"
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

      {/* Tab Switcher */}
      <div className="px-8 py-2.5 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2 shrink-0">
        <button
          onClick={() => { setActiveTab("directory"); setQ(""); }}
          className={`px-4.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all ${
            activeTab === "directory"
              ? "bg-[#7C3AED] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          📂 Startup Directory
        </button>
        <button
          onClick={() => { setActiveTab("toolkit"); setQ(""); }}
          className={`px-4.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all ${
            activeTab === "toolkit"
              ? "bg-[#7C3AED] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          🚀 Founder Toolkit
        </button>
      </div>

      {/* Conditional: Search results override or mega-menu contents */}
      {q.trim() && activeTab === "directory" ? (
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
                                <p className="text-sm font-semibold truncate text-gray-900 group-hover:text-[#7C3AED]">{c.name}</p>
                                <p className="text-xs text-gray-500 truncate leading-relaxed">{c.description || c.industry}</p>
                              </div>
                              <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[#7C3AED] transition" />
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
      ) : activeTab === "directory" ? (
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
                <TrendingUp className="w-3.5 h-3.5 text-[#7C3AED]" />
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
                          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#7C3AED] transition">{c.name}</p>
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
                <Building2 className="w-3.5 h-3.5 text-[#EC4899]" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-700">Explore Industries</h3>
              </header>
              {loadingIndustries ? <Skeleton rows={4} /> : (
                <div className="flex flex-wrap gap-2">
                  {industries.map((it) => (
                    <a
                      key={it.slug}
                      href={`/discover?industry=${it.slug}`}
                      onClick={(e) => { e.preventDefault(); navigate(`/discover?industry=${it.slug}`); }}
                      className="rounded-full px-3.5 py-1.5 text-xs font-medium border border-gray-200 bg-white hover:border-[#7C3AED] hover:text-[#7C3AED] hover:shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
                      data-testid={`industry-${it.slug}`}
                    >
                      {it.name}
                    </a>
                  ))}
                </div>
              )}
              <div className="mt-6 rounded-2xl p-5 text-white relative overflow-hidden shadow-sm"
                   style={{ background: "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)" }}>
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
                <Newspaper className="w-3.5 h-3.5 text-[#A855F7]" />
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
                        <p className="text-sm font-semibold leading-snug text-gray-900 group-hover:text-[#7C3AED] line-clamp-2">{s.title}</p>
                        
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {s.startup && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#7C3AED]/5 text-[#7C3AED] border border-[#7C3AED]/10 truncate max-w-[120px]">
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
      ) : (
        <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50/20">
          <div className="px-8 pt-6 pb-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display font-extrabold text-xl text-gray-900 flex items-center gap-2">
                  🚀 Founder Toolkit
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Discover the best tools used by modern founders to build, launch, and scale startups.
                </p>
              </div>
              
              {/* Mini search inside Toolkit view */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search founder tools..."
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-[#7C3AED] outline-none text-xs transition"
                />
                {q && (
                  <button onClick={() => setQ("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-100 text-gray-400">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {["All", "AI Tools", "No-Code", "Open Source", "Free Tier Available", "Popular with Startups"].map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                    selectedFilter === filter
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Categorized Grid */}
            {filteredToolkit.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                {filteredToolkit.map(category => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-[20px] bg-white border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div>
                      <h3 className="font-display font-bold text-gray-950 text-sm flex items-center gap-2">
                        {category.name}
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-1 mb-4 leading-relaxed">{category.description}</p>
                      
                      <div className="space-y-2">
                        {category.tools.map(tool => (
                          <a
                            key={tool.name}
                            href={`https://${tool.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100 group"
                          >
                            <ToolLogo domain={tool.domain} name={tool.name} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-gray-800 group-hover:text-[#7C3AED] transition">
                                  {tool.name}
                                </span>
                                {tool.tags.includes("AI Tools") && (
                                  <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1 rounded font-semibold scale-90 origin-left">
                                    AI
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500 mt-0.5 truncate leading-normal">
                                {tool.desc}
                              </p>
                            </div>
                            <ArrowUpRight className="w-3 h-3 text-gray-300 group-hover:text-[#7C3AED] transition shrink-0 self-center" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">No matching tools found.</p>
              </div>
            )}
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
                className="text-xs font-medium text-gray-700 hover:text-[#7C3AED] inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 transition"
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
