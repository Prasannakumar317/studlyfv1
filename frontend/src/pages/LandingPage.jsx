import React, { useState } from "react";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import TrustedBy from "../components/landing/TrustedBy";
import Features from "../components/landing/Features";
import Solutions from "../components/landing/Solutions";
import WhatWeDo from "../components/landing/WhatWeDo";
import Workflow from "../components/landing/Workflow";
import Agents from "../components/landing/Agents";
import OurValues from "../components/landing/OurValues";
import DashboardPreview from "../components/landing/DashboardPreview";
import Metrics from "../components/landing/Metrics";
import CommunityHubs from "../components/landing/CommunityHubs";
import Testimonials from "../components/landing/Testimonials";
import Pricing from "../components/landing/Pricing";
import FAQ from "../components/landing/FAQ";
import Blog from "../components/landing/Blog";
import Newsletter from "../components/landing/Newsletter";
import Footer from "../components/landing/Footer";
import ChatWidget from "../components/landing/ChatWidget";
import SignupDialog from "../components/landing/SignupDialog";
import VideoModal from "../components/landing/VideoModal";

export default function LandingPage() {
  const [signupOpen, setSignupOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signup");
  const [videoOpen, setVideoOpen] = useState(false);
  const openSignup = () => { setAuthMode("signup"); setSignupOpen(true); };
  const openLogin = () => { setAuthMode("login"); setSignupOpen(true); };
  const watchDemo = () => setVideoOpen(true);

  return (
    <div className="relative bg-white text-gray-900 overflow-x-hidden" data-testid="landing-page">
      <Navbar onGetStarted={openSignup} onLogin={openLogin} />
      <main>
        <Hero onGetStarted={openSignup} onWatchDemo={watchDemo} />
        <TrustedBy />
        <Features />
        <Solutions />
        <WhatWeDo />
        <Workflow />
        <Agents />
        <OurValues />
        <DashboardPreview />
        <Metrics />
        <CommunityHubs />
        <Testimonials />
        <Pricing onSelect={openSignup} />
        <Blog />
        <FAQ />
        <Newsletter />
      </main>
      <Footer />
      <ChatWidget />
      <SignupDialog open={signupOpen} onOpenChange={setSignupOpen} initialMode={authMode} />
      <VideoModal open={videoOpen} onOpenChange={setVideoOpen} />
    </div>
  );
}
