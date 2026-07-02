import React from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Cpu, 
  Users, 
  BookOpen, 
  Award 
} from "lucide-react";
import { SectionEyebrow, fadeUp, stagger } from "./Primitives";

const VALUES = [
  { name: "Innovation", icon: <Sparkles className="w-4 h-4" />, badge: "AI Strategy", color: "#7C3AED", hoverBg: "from-[#7C3AED]/20 to-indigo-300/10" },
  { name: "Execution", icon: <Cpu className="w-4 h-4" />, badge: "Fast Shipping", color: "#EC4899", hoverBg: "from-[#EC4899]/20 to-pink-300/10" },
  { name: "Community", icon: <Users className="w-4 h-4" />, badge: "5k+ Builders", color: "#6366F1", hoverBg: "from-[#6366F1]/20 to-blue-300/10" },
  { name: "Learning", icon: <BookOpen className="w-4 h-4" />, badge: "Playbooks", color: "#A855F7", hoverBg: "from-[#A855F7]/20 to-orange-300/10" },
  { name: "Impact", icon: <Award className="w-4 h-4" />, badge: "Global Growth", color: "#22C55E", hoverBg: "from-[#22C55E]/20 to-emerald-300/10" }
];

export default function OurValues() {
  return (
    <section className="relative py-20 bg-[#F3F6FB]">
      <div className="absolute top-[20%] right-0 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #EC4899 0%, transparent 70%)", filter: "blur(90px)" }} />
      
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12 text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto space-y-4"
        >
          <SectionEyebrow>Our Values</SectionEyebrow>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Foundational <span className="brand-gradient-text">Beliefs</span>
          </h2>
        </motion.div>

        <motion.div 
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-6 max-w-4xl mx-auto text-left"
        >
          {VALUES.map((val, idx) => (
            <motion.div key={idx} variants={fadeUp} className="relative group">
              <div className={`absolute -inset-1 bg-gradient-to-br ${val.hoverBg} rounded-[20px] blur-md opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none`} />
              
              <div 
                className="relative bg-white border border-gray-150 rounded-[20px] p-6 shadow-sm hover:-translate-y-1.5 hover:border-[#7C3AED]/30 transition-all duration-300 flex flex-col justify-between h-36 z-10"
                data-testid={`value-card-${val.name.toLowerCase()}`}
              >
                <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ color: val.color }}>
                  {val.icon}
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-gray-900">{val.name}</h4>
                  <p className="text-[8px] text-gray-400 mt-1 uppercase tracking-widest font-extrabold">{val.badge}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
