import React from "react";
import { motion } from "framer-motion";
import { 
  Cpu, 
  Globe2, 
  Users, 
  UserCheck, 
  TrendingUp, 
  FileText, 
  ArrowUpRight 
} from "lucide-react";
import { SectionEyebrow, fadeUp, stagger } from "./Primitives";

const WHAT_WE_DO_ITEMS = [
  { title: "AI Workspace", desc: "Generate business strategies, customer personas, GTM plans, financial projections and investor documents using AI.", icon: <Cpu className="w-6 h-6" />, gradient: "from-[#7C3AED] to-[#EC4899]" },
  { title: "Startup Discovery", desc: "Explore Indian startups, founders, incubators, investors and startup news.", icon: <Globe2 className="w-6 h-6" />, gradient: "from-[#6366F1] to-[#7C3AED]" },
  { title: "Founder Community", desc: "Join a growing community of student entrepreneurs, founders and mentors.", icon: <Users className="w-6 h-6" />, gradient: "from-[#EC4899] to-[#A855F7]" },
  { title: "Mentorship", desc: "Learn directly from experienced founders, investors and industry experts.", icon: <UserCheck className="w-6 h-6" />, gradient: "from-[#22C55E] to-[#6366F1]" },
  { title: "Funding Readiness", desc: "Create pitch decks, one-minute pitches, valuation reports and VC-ready documents.", icon: <TrendingUp className="w-6 h-6" />, gradient: "from-[#A855F7] to-[#EC4899]" },
  { title: "Startup Resources", desc: "Access startup tools, AI tools, templates, funding opportunities and learning resources.", icon: <FileText className="w-6 h-6" />, gradient: "from-[#F59E0B] to-[#A855F7]" }
];

export default function WhatWeDo() {
  return (
    <section className="relative py-20 bg-[#EEF3FA]">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12 text-center space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto space-y-4"
        >
          <SectionEyebrow>What We Do</SectionEyebrow>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Core Engines Empowering <span className="brand-gradient-text">Founders</span>
          </h2>
          <p className="text-gray-500 text-sm md:text-base font-normal">
            We simplify complex startup execution pathways into structured, beautiful modular applications.
          </p>
        </motion.div>

        <motion.div 
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left"
        >
          {WHAT_WE_DO_ITEMS.map((item, i) => (
            <motion.div key={i} variants={fadeUp} className="relative group">
              {/* Glow ring */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${item.gradient} rounded-[20px] blur-xl opacity-0 group-hover:opacity-15 transition duration-500 pointer-events-none`} />
              
              <div 
                className="relative bg-white border border-gray-150 rounded-[20px] p-7 shadow-sm hover:-translate-y-1.5 hover:border-[#7C3AED]/30 transition-all duration-300 flex flex-col justify-between h-64 z-10"
                data-testid={`what-we-do-card-${i}`}
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mb-5 shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                    {item.icon}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 font-display transition-colors group-hover:text-[#7C3AED]">{item.title}</h3>
                  <p className="mt-2.5 text-xs text-gray-500 leading-relaxed font-normal">{item.desc}</p>
                </div>
                <div className="mt-6 flex items-center text-[9px] font-bold text-gray-400 group-hover:text-[#7C3AED] transition gap-1.5 pointer-events-none uppercase tracking-wider">
                  Explore Platform <ArrowUpRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
