import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, MapPin, Building2, Loader2, Search, Briefcase, Star, BookOpen, Globe2, Rocket, TrendingUp } from "lucide-react";
import api from "../lib/api";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

function CompanyLogo({ domain, name, size = 56 }) {
  const [useBackup, setUseBackup] = useState(false);
  const logoUrl = useBackup 
    ? `https://www.google.com/s2/favicons?sz=128&domain=${domain}`
    : `https://logo.clearbit.com/${domain}`;

  return (
    <img
      src={logoUrl}
      alt={`${name} logo`}
      onError={() => {
        if (!useBackup) setUseBackup(true);
      }}
      style={{ width: size, height: size }}
      className="rounded-2xl object-contain bg-white border border-gray-100 p-1.5 shrink-0"
    />
  );
}

export function CompanyDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("company");
  const [similarData, setSimilarData] = useState([]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.get(`/discover/company/${slug}`)
      .then((r) => {
        if (!alive) return;
        setData(r.data);
        const similarSlugs = r.data.similar_startups || [];
        Promise.all(similarSlugs.map(s => api.get(`/discover/company/${s}`).then(res => res.data).catch(() => null)))
          .then(results => {
            if (alive) {
              setSimilarData(results.filter(x => x !== null));
            }
          });
      })
      .catch((e) => alive && setError(e?.response?.status === 404 ? "Company not found." : "Could not load company."))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [slug]);

  const TABS = [
    { id: "company", label: "Company" },
    { id: "founders", label: "Founders" },
    { id: "news", label: "News" },
    { id: "funding", label: "Funding" },
    { id: "jobs", label: "Jobs" }
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar onGetStarted={() => navigate("/")} />
      <main className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          {/* Breadcrumbs */}
          <div className="text-xs text-gray-500 flex items-center gap-2 mb-6 font-medium flex-wrap">
            <Link to="/" className="hover:text-[#7C3AED] transition">Home</Link>
            <span>/</span>
            <Link to="/discover" className="hover:text-[#7C3AED] transition">Discover</Link>
            <span>/</span>
            <span className="text-gray-400">Startups</span>
            <span>/</span>
            <span className="text-gray-900 font-semibold">{loading ? "Loading..." : data?.name}</span>
          </div>

          {loading ? (
            <div className="mt-10 flex items-center gap-2 text-gray-500"><Loader2 className="w-5 h-5 animate-spin" /> Loading company profile…</div>
          ) : error ? (
            <div className="mt-10 rounded-[24px] border border-dashed border-gray-200 bg-white p-10 text-center shadow-sm">
              <p className="font-display text-xl font-semibold text-gray-900">{error}</p>
              <Link to="/discover" className="mt-3 inline-block text-sm font-semibold text-[#7C3AED]">Go back to directory</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
              {/* LEFT SIDE (70%) */}
              <div className="lg:col-span-7 space-y-8">
                {/* Title block */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[24px] border border-gray-150 p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-start md:items-center gap-5">
                    <CompanyLogo domain={data.domain} name={data.name} size={72} />
                    <div>
                      <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tighter text-gray-950 flex items-center gap-3">
                        {data.name}
                        {data.stage && data.stage.includes("Unicorn") && (
                          <span className="text-[10px] bg-yellow-50 text-amber-600 border border-amber-200/50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Unicorn</span>
                        )}
                      </h1>
                      <p className="text-gray-600 mt-2 text-sm leading-relaxed">{data.tagline || data.description}</p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        <span className="text-xs font-semibold bg-indigo-50 text-[#7C3AED] px-3 py-1 rounded-full">{data.industry}</span>
                        {data.stage && <span className="text-xs font-semibold bg-gray-50 text-gray-600 px-3 py-1 rounded-full">{data.stage}</span>}
                        {data.location && <span className="text-xs font-medium text-gray-500 px-1 py-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{data.location}</span>}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Tabs */}
                <div className="border-b border-gray-150 flex gap-6 overflow-x-auto scrollbar-none">
                  {TABS.map((t) => {
                    const active = activeTab === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`pb-4 text-sm font-bold border-b-2 transition shrink-0 ${active ? "border-[#7C3AED] text-[#7C3AED]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Contents */}
                <div className="min-h-[300px]">
                  {activeTab === "company" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                      {/* Overview */}
                      <div className="bg-white rounded-[24px] border border-gray-150 p-8 shadow-sm space-y-6">
                        <h2 className="text-lg font-bold text-gray-950 font-display">Company Overview</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-indigo-50/30 border border-indigo-100/10">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED]">Our Mission</span>
                            <p className="mt-1.5 text-xs text-gray-700 leading-relaxed font-normal">{data.mission || "Empowering people with innovative tech."}</p>
                          </div>
                          <div className="p-4 rounded-xl bg-emerald-50/30 border border-emerald-100/10">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Our Vision</span>
                            <p className="mt-1.5 text-xs text-gray-700 leading-relaxed font-normal">{data.vision || "Building a sustainable global tech ecosystem."}</p>
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-100">
                          <div>
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">The Problem</h3>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed font-normal">{data.problem_solved || "Analyzing and solving critical transaction barriers."}</p>
                          </div>
                          <div className="pt-2">
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Product Solution</h3>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed font-normal">{data.product_description || data.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Market & UVP */}
                      <div className="bg-white rounded-[24px] border border-gray-150 p-8 shadow-sm space-y-6">
                        <h2 className="text-lg font-bold text-gray-950 font-display">Market & UVP</h2>
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Unique Value Proposition</h3>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed font-normal">{data.uvp || "Frictionless merchant access tools."}</p>
                          </div>
                          <div className="pt-2">
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Target Audience & Market Opportunity</h3>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed font-normal">{data.target_customers || "B2B and B2C scaling digital clients."}</p>
                          </div>
                        </div>
                      </div>

                      {/* Business Model */}
                      <div className="bg-white rounded-[24px] border border-gray-150 p-8 shadow-sm space-y-6">
                        <h2 className="text-lg font-bold text-gray-950 font-display">Business & Monetization</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Business Model</h3>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed font-normal">{data.business_model || "Product-led digital scaling."}</p>
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Revenue Strategy</h3>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed font-normal">{data.revenue_model || "Transaction margins and direct subscriptions."}</p>
                          </div>
                        </div>
                      </div>

                      {/* Tech Stack */}
                      <div className="bg-white rounded-[24px] border border-gray-150 p-8 shadow-sm space-y-4">
                        <h2 className="text-lg font-bold text-gray-950 font-display">Technology Stack</h2>
                        <p className="text-xs text-gray-600 leading-relaxed font-normal">{data.tech_stack || "Built using React, Node.js, Python, and scalable AWS infrastructure."}</p>
                      </div>

                      {/* Milestones & Awards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-[24px] border border-gray-150 p-6 shadow-sm">
                          <h3 className="font-bold text-gray-950 text-sm mb-4 font-display">Key Milestones</h3>
                          <ul className="space-y-3">
                            {(data.milestones || ["First version launched.", "Crossed $10M transaction volume.", "Expanded to 20 cities."]).map((m, idx) => (
                              <li key={idx} className="text-xs text-gray-600 leading-relaxed font-normal flex items-start gap-2">
                                <span className="text-[#7C3AED] font-bold">✓</span> {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-white rounded-[24px] border border-gray-150 p-6 shadow-sm">
                          <h3 className="font-bold text-gray-950 text-sm mb-4 font-display">Awards & Recognition</h3>
                          <ul className="space-y-3">
                            {(data.awards || ["Forbes 30 Under 30 Co-founders list.", "E-commerce Startup Innovation Award."]).map((a, idx) => (
                              <li key={idx} className="text-xs text-gray-600 leading-relaxed font-normal flex items-start gap-2">
                                <span className="text-amber-500 font-bold">★</span> {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "founders" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {data.founders && data.founders.map((f, idx) => (
                        <div key={idx} className="bg-white rounded-[24px] border border-gray-150 p-6 shadow-sm flex flex-col items-center text-center">
                          <img src={f.photo} alt={f.name} className="w-20 h-20 rounded-full object-cover border border-gray-100 mb-4 shadow-sm" />
                          <h3 className="text-base font-bold text-gray-950 font-display">{f.name}</h3>
                          <span className="text-[10px] text-[#7C3AED] font-semibold uppercase tracking-wider mt-1">{f.designation}</span>
                          <p className="text-xs text-gray-500 mt-4 leading-relaxed font-normal max-w-xs">{f.bio}</p>
                          <div className="mt-6 pt-4 border-t border-gray-100 w-full flex justify-center gap-4 text-xs font-bold text-gray-400">
                            {f.linkedin && (
                              <a href={f.linkedin} target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition">
                                LinkedIn
                              </a>
                            )}
                            {f.twitter && (
                              <a href={f.twitter} target="_blank" rel="noreferrer" className="hover:text-sky-500 transition">
                                Twitter
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === "news" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      {data.news && data.news.map((n, idx) => (
                        <a key={idx} href={n.url} target="_blank" rel="noreferrer" className="block bg-white rounded-2xl border border-gray-150 p-5 hover:border-[#7C3AED]/30 transition group hover:shadow-sm">
                          <div className="flex justify-between items-center gap-4">
                            <div>
                              <span className="text-[9px] font-bold text-[#7C3AED] uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                                {n.source}
                              </span>
                              <h4 className="font-semibold text-gray-950 text-sm mt-2 group-hover:text-[#7C3AED] transition">{n.title}</h4>
                              <p className="text-[10px] text-gray-400 mt-2">{n.date}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-[#7C3AED] transition shrink-0" />
                          </div>
                        </a>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === "funding" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[24px] border border-gray-150 p-8 shadow-sm space-y-6">
                      <h3 className="font-bold text-gray-950 text-sm mb-4 font-display">Funding Timeline</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-gray-150 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                              <th className="pb-3">Round</th>
                              <th className="pb-3">Amount</th>
                              <th className="pb-3">Date</th>
                              <th className="pb-3">Lead Investors</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.funding_timeline && data.funding_timeline.map((f, idx) => (
                              <tr key={idx} className="border-b border-gray-100 last:border-0 text-gray-600 font-normal">
                                <td className="py-3 font-semibold text-gray-900">{f.round}</td>
                                <td className="py-3 text-emerald-600 font-bold">{f.amount}</td>
                                <td className="py-3">{f.date}</td>
                                <td className="py-3 text-gray-500">{f.investors}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "jobs" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[24px] border border-gray-150 p-8 shadow-sm space-y-6">
                      <h3 className="font-bold text-gray-950 text-sm mb-4 font-display">Current Open Roles</h3>
                      <div className="space-y-4">
                        {[
                          { title: "Senior Software Engineer - Fullstack", department: "Engineering", type: "Full-Time", location: data.location || "Bengaluru, India" },
                          { title: "Product Manager - Core Systems", department: "Product", type: "Full-Time", location: data.location || "Bengaluru, India" },
                          { title: "DevOps Architect", department: "Infrastructure", type: "Full-Time", location: data.location || "Bengaluru, India" }
                        ].map((job, idx) => (
                          <div key={idx} className="p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-xs text-gray-900">{job.title}</h4>
                              <p className="text-[10px] text-gray-500 mt-1">{job.department} • {job.type} • {job.location}</p>
                            </div>
                            <a href={data.website} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#7C3AED] hover:underline">Apply Now</a>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Similar Startups */}
                {similarData.length > 0 && (
                  <div className="bg-white rounded-[24px] border border-gray-150 p-8 shadow-sm space-y-6">
                    <h2 className="text-lg font-bold text-gray-950 font-display">Similar Indian Startups</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {similarData.map((s) => (
                        <div key={s.slug} onClick={() => { navigate(`/discover/company/${s.slug}`); setActiveTab("company"); }} className="p-4 rounded-xl border border-gray-100 hover:border-[#7C3AED]/30 transition duration-200 cursor-pointer flex items-center gap-4">
                          <CompanyLogo domain={s.domain} name={s.name} size={44} />
                          <div>
                            <h4 className="font-bold text-sm text-gray-900">{s.name}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{s.industry} • {s.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT SIDEBAR (30%) */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-[24px] border border-gray-150 p-6 shadow-sm sticky top-28 space-y-6">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                    <CompanyLogo domain={data.domain} name={data.name} size={44} />
                    <div>
                      <h3 className="font-bold text-gray-950 font-display text-sm">{data.name}</h3>
                      <span className="text-[10px] text-gray-400">Founded in {data.founded_year}</span>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs font-normal">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Headquarters</span>
                      <span className="font-bold text-gray-800">{data.location || "India"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Employees</span>
                      <span className="font-bold text-gray-800">{data.team_size || "500-1000"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stage</span>
                      <span className="font-bold text-gray-800">{data.stage || "Late Stage"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Round</span>
                      <span className="font-bold text-gray-800">{data.last_funding_round || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Funding</span>
                      <span className="font-bold text-emerald-600">{data.funding || "N/A"}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    {data.website && (
                      <a href={data.website} target="_blank" rel="noreferrer" className="w-full text-center glow-button rounded-xl py-3 text-xs font-bold inline-flex items-center justify-center gap-2">
                        Visit Website <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-xs font-bold text-gray-400">
                    {data.social_links?.linkedin && (
                      <a href={data.social_links.linkedin} target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition">
                        LinkedIn
                      </a>
                    )}
                    {data.social_links?.twitter && (
                      <a href={data.social_links.twitter} target="_blank" rel="noreferrer" className="hover:text-sky-500 transition">
                        Twitter
                      </a>
                    )}
                    {data.social_links?.github && (
                      <a href={data.social_links.github} target="_blank" rel="noreferrer" className="hover:text-gray-900 transition">
                        GitHub
                      </a>
                    )}
                    {data.social_links?.instagram && (
                      <a href={data.social_links.instagram} target="_blank" rel="noreferrer" className="hover:text-pink-600 transition">
                        Instagram
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StartupCard({ c, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="bg-white rounded-[20px] border border-gray-150 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition duration-300 relative group cursor-pointer"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <CompanyLogo domain={c.domain} name={c.name} size={52} />
          
          <div className="flex flex-wrap gap-1.5 justify-end">
            {c.stage && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">
                {c.stage}
              </span>
            )}
            {c.funding && c.funding !== "N/A" && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">
                {c.funding}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-display font-bold text-gray-950 text-lg leading-snug group-hover:text-[#7C3AED] transition">
            {c.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
            {c.description}
          </p>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
        <div className="flex flex-wrap gap-3">
          <span className="font-semibold text-gray-600">{c.industry}</span>
          <span>•</span>
          <span>{c.location}</span>
          {c.founded_year && (
            <>
              <span>•</span>
              <span>Est. {c.founded_year}</span>
            </>
          )}
        </div>
        
        <span className="text-gray-400 group-hover:text-[#7C3AED] transition font-bold flex items-center gap-0.5">
          View Profile →
        </span>
      </div>
    </motion.div>
  );
}

function NewsItem({ n }) {
  return (
    <a
      href={n.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-2xl bg-white border border-gray-150 hover:border-[#7C3AED]/30 transition group hover:shadow-sm"
    >
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-wide bg-indigo-50 px-2 py-0.5 rounded">
          {n.source}
        </span>
        {n.funding && (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            💰 {n.funding}
          </span>
        )}
      </div>
      <h4 className="font-semibold text-xs text-gray-800 mt-2 leading-relaxed group-hover:text-[#7C3AED] transition">
        {n.title}
      </h4>
    </a>
  );
}

const STUB_HEADINGS = {
  "/discover":          { title: "Indian Startup Directory", subtitle: "Browse the premier startups, unicorns and tech leaders in India.", icon: Building2 },
  "/discover/blog":     { title: "Startup Blog",      subtitle: "Stories, playbooks and lessons from real Indian founders.",    icon: BookOpen },
  "/discover/lists":    { title: "Featured Lists",    subtitle: "Hand-picked collections of top Indian startups.",   icon: Star },
  "/discover/hiring":   { title: "Hiring Companies",  subtitle: "Find Indian startups actively building their core teams.",icon: Briefcase },
  "/discover/remote":   { title: "Remote Jobs",       subtitle: "Work globally from India. Build everywhere.",                       icon: Globe2 },
  "/startups":          { title: "Indian Startups",   subtitle: "Discover high-growth startups founded and headquartered in India.", icon: Rocket },
  "/incubators":        { title: "Indian Incubators", subtitle: "Explore startup accelerators, incubators, and founder programs in India.", icon: Building2 },
  "/vc-firms":          { title: "Indian VC Firms",   subtitle: "Venture capital firms backing Indian entrepreneurs.", icon: TrendingUp },
};

export function DiscoverListPage({ route = "/discover" }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const industryParam = params.get("industry");
  
  const [items, setItems] = useState([]);
  const [news, setNews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const head = STUB_HEADINGS[route] || STUB_HEADINGS["/discover"];

  useEffect(() => {
    setLoading(true);
    let startupsUrl = "/discover/startups?limit=100";
    if (route === "/incubators") {
      startupsUrl = "/discover/incubators?limit=50";
    } else if (route === "/vc-firms") {
      startupsUrl = "/discover/vc-firms?limit=50";
    } else if (industryParam) {
      startupsUrl = `/discover/startups?industry=${industryParam}&limit=100`;
    }

    Promise.all([
      api.get(startupsUrl).then((r) => r.data.items || []),
      api.get("/discover/stories?limit=6").then((r) => r.data.items || [])
    ])
      .then(([startupsData, newsData]) => {
        setItems(startupsData);
        setNews(newsData);
      })
      .catch(() => {
        setItems([]);
        setNews([]);
      })
      .finally(() => setLoading(false));
  }, [route, industryParam]);

  // Filter items based on search query
  const filteredItems = items.filter(item => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      item.name.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.industry && item.industry.toLowerCase().includes(query)) ||
      (item.location && item.location.toLowerCase().includes(query))
    );
  });

  const getSectionItems = (tagOrCondition) => {
    return items.filter(item => {
      if (typeof tagOrCondition === "function") {
        return tagOrCondition(item);
      }
      return item.tags && item.tags.includes(tagOrCondition);
    });
  };

  // Section divisions for main page
  const trendingStartups = getSectionItems("Trending").slice(0, 3);
  const unicorns = getSectionItems("Unicorn").slice(0, 3);
  const aiStartups = getSectionItems("AI Startups").slice(0, 3);
  const saasStartups = getSectionItems(item => item.industry === "SaaS").slice(0, 3);
  const fundedStartups = getSectionItems("Recently Funded").slice(0, 3);
  const fastGrowing = getSectionItems("Fast Growing").slice(0, 3);

  const isMainPage = route === "/discover" && !industryParam;

  return (
    <div className="min-h-screen bg-gray-50/40">
      <Navbar onGetStarted={() => navigate("/")} />
      <main className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          
          <button onClick={() => navigate("/")} className="text-sm font-semibold text-gray-700 inline-flex items-center gap-1 hover:text-[#7C3AED] mb-6" data-testid="discover-back">
            <ArrowLeft className="w-4 h-4" /> Home
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center shrink-0">
                <head.icon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tighter text-gray-950">
                  {head.title}{industryParam ? <span className="text-[#7C3AED] font-normal"> · {industryParam}</span> : ""}
                </h1>
                <p className="text-xs text-gray-500 mt-1">{head.subtitle}</p>
              </div>
            </div>

            {/* General search bar for the page */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Indian directory..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-[#7C3AED] outline-none text-xs shadow-sm transition"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" /></div>
          ) : searchQuery.trim() !== "" ? (
            // Search results view
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-6">Search Results for "{searchQuery}"</h2>
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border border-dashed border-gray-200 bg-white">
                  <p className="text-sm text-gray-500">No Indian startups match your search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((c) => (
                    <StartupCard key={c.slug} c={c} onClick={() => navigate(`/discover/company/${c.slug}`)} />
                  ))}
                </div>
              )}
            </div>
          ) : isMainPage ? (
            // Main discovery hub view
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Startups columns (left/center) */}
              <div className="lg:col-span-2 space-y-10">
                
                {/* 🔥 Trending Startups */}
                {trendingStartups.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-950 mb-4 flex items-center gap-2">🔥 Trending Indian Startups</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {trendingStartups.map((c) => (
                        <StartupCard key={c.slug} c={c} onClick={() => navigate(`/discover/company/${c.slug}`)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 🦄 Indian Unicorns */}
                {unicorns.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-950 mb-4 flex items-center gap-2">🦄 Indian Unicorns</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {unicorns.map((c) => (
                        <StartupCard key={c.slug} c={c} onClick={() => navigate(`/discover/company/${c.slug}`)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 🤖 Indian AI Startups */}
                {aiStartups.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-950 mb-4 flex items-center gap-2">🤖 Indian AI Startups</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {aiStartups.map((c) => (
                        <StartupCard key={c.slug} c={c} onClick={() => navigate(`/discover/company/${c.slug}`)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 💼 Indian SaaS Startups */}
                {saasStartups.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-950 mb-4 flex items-center gap-2">💼 Indian SaaS Startups</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {saasStartups.map((c) => (
                        <StartupCard key={c.slug} c={c} onClick={() => navigate(`/discover/company/${c.slug}`)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 💰 Recently Funded */}
                {fundedStartups.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-950 mb-4 flex items-center gap-2">💰 Recently Funded Indian Startups</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {fundedStartups.map((c) => (
                        <StartupCard key={c.slug} c={c} onClick={() => navigate(`/discover/company/${c.slug}`)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 🚀 Fast Growing */}
                {fastGrowing.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-950 mb-4 flex items-center gap-2">🚀 Fast Growing Indian Startups</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {fastGrowing.map((c) => (
                        <StartupCard key={c.slug} c={c} onClick={() => navigate(`/discover/company/${c.slug}`)} />
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Sidebar (right) for India News */}
              <div className="space-y-6">
                <div className="bg-white border border-gray-150 rounded-[20px] p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    📰 Trending Indian News
                  </h3>
                  
                  <div className="space-y-4">
                    {news.map((n, idx) => (
                      <NewsItem key={idx} n={n} />
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            // Category lists (startups, incubators, vcs)
            <div>
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border border-dashed border-gray-200 bg-white">
                  <p className="text-sm text-gray-500">No results found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((c) => (
                    <StartupCard key={c.slug} c={c} onClick={() => navigate(`/discover/company/${c.slug}`)} />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
