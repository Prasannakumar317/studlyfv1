import React from "react";
import { motion } from "framer-motion";
import { 
  Rocket, 
  Cpu, 
  Briefcase, 
  GraduationCap, 
  Users, 
  Globe2 
} from "lucide-react";
import { SectionEyebrow, fadeUp, stagger } from "./Primitives";

const COMMUNITY_HUBS = [
  { title: "Startup Community", desc: "A robust national network of student builders sharing templates, insights, and project audits.", icon: <Rocket className="w-4 h-4" />, value: "Knowledge sharing", gradient: "from-[#7C3AED] to-[#EC4899]" },
  { title: "AI Community", desc: "Exploring prompt engineering, custom AI agents, and model integration playbooks.", icon: <Cpu className="w-4 h-4" />, value: "AI mastery", gradient: "from-[#EC4899] to-[#A855F7]" },
  { title: "Engineering Network", desc: "Collaborating on full-stack development, software engineering paradigms, and production scaling.", icon: <Briefcase className="w-4 h-4" />, value: "Technical excellence", gradient: "from-[#6366F1] to-[#7C3AED]" },
  { title: "College Clubs", desc: "Empowering college innovation clubs to launch local hackathons and community bootcamps.", icon: <GraduationCap className="w-4 h-4" />, value: "Campus hubs", gradient: "from-[#22C55E] to-[#6366F1]" },
  { title: "Founder Network", desc: "Direct peer groups for venture-backed and bootstrapped startup operators across India.", icon: <Users className="w-4 h-4" />, value: "Founder circles", gradient: "from-[#A855F7] to-[#F59E0B]" },
  { title: "Industry Network", desc: "Exposing builders to capital allocators, hiring leads, and corporate innovators.", icon: <Globe2 className="w-4 h-4" />, value: "Market access", gradient: "from-[#F59E0B] to-[#EC4899]" }
];

export default function CommunityHubs() {
  return (
    <section className="relative py-20 bg-[#E8EEF8]">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12 text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto space-y-4"
        >
          <SectionEyebrow>Community</SectionEyebrow>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Specialized <span className="brand-gradient-text">Hubs</span>
          </h2>
          <p className="text-gray-500 text-sm md:text-base font-normal">
            Providing high-value environments and frameworks for peer-to-peer execution.
          </p>
        </motion.div>

        <motion.div 
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left"
        >
          {COMMUNITY_HUBS.map((hub, idx) => (
            <motion.div key={idx} variants={fadeUp} className="relative group">
              <div className={`absolute -inset-1 bg-gradient-to-r ${hub.gradient} rounded-[20px] blur-xl opacity-0 group-hover:opacity-10 transition duration-300 pointer-events-none`} />
              
              <div 
                className="relative bg-white rounded-[20px] border border-gray-150 p-6 shadow-sm hover:shadow-md hover:-translate-y-1.5 hover:border-[#7C3AED]/30 transition duration-300 flex flex-col justify-between h-48 z-10" 
                data-testid={`community-hub-${idx}`}
              >
                <div>
                  <span className={`w-9 h-9 rounded-xl bg-gradient-to-br ${hub.gradient} text-white flex items-center justify-center mb-4 shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                    {hub.icon}
                  </span>
                  <h4 className="font-display font-bold text-sm text-gray-900">{hub.title}</h4>
                  <p className="mt-2 text-xs text-gray-500 leading-relaxed font-normal">{hub.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 text-[8.5px] font-bold text-[#7C3AED] uppercase tracking-wider">
                  {hub.value}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
