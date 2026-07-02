import React from "react";
import GenerationModule from "../components/workspace/GenerationModule";
import ProjectPicker from "../components/ProjectPicker";

const TOOLS = [
  { kind: "marketing_plan", label: "1-Page Marketing Plan", desc: "Objectives, channels, KPIs, budget and 90-day timeline.", icon: "Megaphone", gradient: "from-[#EC4899] to-[#A855F7]" },
  { kind: "brand_strategy", label: "Brand Strategy", desc: "Story, voice, positioning, taglines and personality.", icon: "Palette", gradient: "from-[#7C3AED] to-[#EC4899]" },
  { kind: "customer_persona", label: "Customer Personas", desc: "Two rich personas to anchor every campaign.", icon: "Users", gradient: "from-[#22C55E] to-[#6366F1]" },
];

export default function MarketingPage() {
  return (
    <div>
      <div className="flex items-center justify-end mb-6"><ProjectPicker /></div>
      <GenerationModule
        title="Marketing"
        eyebrow="Module"
        intro="A studio for your brand, plan and audience — in one canvas."
        tools={TOOLS}
      />
    </div>
  );
}
