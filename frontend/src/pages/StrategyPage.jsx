import React from "react";
import GenerationModule from "../components/workspace/GenerationModule";
import ProjectPicker from "../components/ProjectPicker";

const TOOLS = [
  { kind: "swot", label: "SWOT Analysis", desc: "Strengths, weaknesses, opportunities and threats — auto-tailored.", icon: "ShieldCheck", gradient: "from-[#6C63FF] to-[#FF4D94]" },
  { kind: "business_model_canvas", label: "Business Model Canvas", desc: "The 9 sections of a working business model.", icon: "LayoutGrid", gradient: "from-[#3FA9F5] to-[#6C63FF]" },
  { kind: "go_to_market", label: "Go-to-Market", desc: "ICP, segments, positioning, funnels, retention — done.", icon: "Compass", gradient: "from-[#FF4D94] to-[#FF7A18]" },
  { kind: "customer_persona", label: "Customer Personas", desc: "Two detailed personas with goals and objections.", icon: "Users", gradient: "from-[#2ECC71] to-[#3FA9F5]" },
  { kind: "competitor_analysis", label: "Competitor Analysis", desc: "Matrix, gaps and opportunities versus 5 competitors.", icon: "Search", gradient: "from-[#FF7A18] to-[#FFC145]" },
];

export default function StrategyPage() {
  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <ProjectPicker />
      </div>
      <GenerationModule
        title="Strategy"
        eyebrow="Module"
        intro="Frameworks, analyses and roadmaps — generated, refined and ready in seconds."
        tools={TOOLS}
      />
    </div>
  );
}
