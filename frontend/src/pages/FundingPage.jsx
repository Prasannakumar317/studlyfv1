import React from "react";
import GenerationModule from "../components/workspace/GenerationModule";
import ProjectPicker from "../components/ProjectPicker";

const TOOLS = [
  { kind: "one_minute_pitch", label: "1-Minute Pitch", desc: "A punchy 60-second spoken pitch you can read on Zoom.", icon: "Mic", gradient: "from-[#FFC145] to-[#FF7A18]" },
  { kind: "pitch_deck", label: "Pitch Deck", desc: "A 14-slide investor-ready deck — content per slide.", icon: "Presentation", gradient: "from-[#6C63FF] to-[#FF4D94]" },
  { kind: "vc_score", label: "VC Score", desc: "Investor's-eye scorecard with recommendation.", icon: "Gauge", gradient: "from-[#FF4D94] to-[#FF7A18]" },
];

export default function FundingPage() {
  return (
    <div>
      <div className="flex items-center justify-end mb-6"><ProjectPicker /></div>
      <GenerationModule
        title="Funding"
        eyebrow="Module"
        intro="Pitch, score and prepare — everything investors want to see, generated in minutes."
        tools={TOOLS}
      />
    </div>
  );
}
