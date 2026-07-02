import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, LayoutDashboard, ChevronDown } from "lucide-react";
import { LOGO_URL, NAV_LINKS } from "../../data/landing";
import { useAuth } from "../../lib/auth";
import { useNavigate, useLocation, Link } from "react-router-dom";
import useMediaQuery from "../../lib/useMediaQuery";
import DiscoverMegaMenu from "./DiscoverMegaMenu";

export default function Navbar({ onGetStarted, onLogin }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const discoverHoverTimeout = useRef(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const openDiscover = () => {
    if (discoverHoverTimeout.current) clearTimeout(discoverHoverTimeout.current);
    setDiscoverOpen(true);
  };
  const scheduleCloseDiscover = () => {
    if (discoverHoverTimeout.current) clearTimeout(discoverHoverTimeout.current);
    discoverHoverTimeout.current = setTimeout(() => setDiscoverOpen(false), 250);
  };
  const toggleDiscover = () => setDiscoverOpen((s) => !s);
  const handleButtonClick = (e) => {
    e.stopPropagation();
    if (isDesktop) {
      openDiscover();
    } else {
      toggleDiscover();
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (l) => {
    if (l.label === "Home") return currentPath === "/" && !location.hash;
    if (l.label === "About Us") return currentPath === "/about";
    if (l.label === "Discover") return currentPath.startsWith("/discover") || discoverOpen;
    if (l.label === "Workspace") return currentPath.startsWith("/workspace");
    if (l.label === "Pricing") return currentPath === "/" && location.hash === "#pricing";
    if (l.label === "Contact") return currentPath === "/contact";
    return false;
  };

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-[0_2px_24px_rgba(0,0,0,0.04)]"
          : "bg-transparent"
      }`}
      data-testid="site-navbar"
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" data-testid="nav-logo">
          <img src={LOGO_URL} alt="STUDLYF" className="h-9 w-9 object-contain rounded-lg" />
          <span className="font-display font-semibold tracking-tight text-lg text-gray-900">
            STUDLYF <span className="brand-gradient-text">AI</span>
          </span>
        </Link>

        <nav 
          className="hidden lg:flex items-center gap-1 glass rounded-full px-2 py-1.5 relative"
          onMouseLeave={() => setHoveredLink(null)}
        >
          {NAV_LINKS.map((l) => {
            const active = isActive(l);

            if (l.label === "Discover") {
              return (
                <div
                  key={l.label}
                  className="relative"
                  onMouseEnter={() => { setHoveredLink(l.label); openDiscover(); }}
                  onMouseLeave={scheduleCloseDiscover}
                >
                  {hoveredLink === l.label && (
                    <motion.div
                      layoutId="nav-hover-pill"
                      className="absolute inset-0 bg-gray-900/5 rounded-full pointer-events-none"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={handleButtonClick}
                    aria-haspopup="dialog"
                    aria-expanded={discoverOpen}
                    aria-controls="discover-mega"
                    className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-full transition inline-flex items-center gap-1 ${
                      active ? "text-gray-900 bg-white/70" : "text-gray-700 hover:text-gray-900"
                    }`}
                    data-testid="nav-link-discover"
                  >
                    Discover
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${discoverOpen ? "rotate-180" : ""}`} />
                  </button>
                </div>
              );
            }

            const isHash = l.href.includes("#");
            const isExternalRoute = l.href.startsWith("/") && !isHash;

            const handleClick = (e) => {
              if (isHash) {
                const hash = l.href.substring(l.href.indexOf("#"));
                if (currentPath === "/") {
                  e.preventDefault();
                  const element = document.querySelector(hash);
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                    window.history.pushState(null, "", hash);
                  }
                }
              }
            };

            const linkProps = {
              className: `relative px-4 py-1.5 text-sm font-medium rounded-full transition block ${
                active ? "text-gray-900 bg-white/70 shadow-sm border border-gray-100/30" : "text-gray-700 hover:text-gray-900"
              }`,
              "data-testid": `nav-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`,
              onMouseEnter: () => setHoveredLink(l.label),
              onClick: handleClick,
            };

            return (
              <div key={l.label} className="relative">
                {hoveredLink === l.label && (
                  <motion.div
                    layoutId="nav-hover-pill"
                    className="absolute inset-0 bg-gray-900/5 rounded-full pointer-events-none"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {isExternalRoute ? (
                  <Link to={l.href} {...linkProps}>
                    <span className="relative z-10">{l.label}</span>
                  </Link>
                ) : (
                  <a href={l.href} {...linkProps}>
                    <span className="relative z-10">{l.label}</span>
                  </a>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={() => navigate("/workspace")}
              className="glow-button rounded-full px-5 py-2.5 text-sm font-semibold flex items-center gap-2"
              data-testid="nav-workspace"
            >
              <LayoutDashboard className="w-4 h-4" /> Workspace
            </button>
          ) : (
            <>
              <button
                onClick={onLogin || onGetStarted}
                className="hidden md:inline-flex text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-2"
                data-testid="nav-login"
              >
                Log in
              </button>
              <button
                onClick={onGetStarted}
                className="glow-button rounded-full px-5 py-2.5 text-sm font-semibold flex items-center gap-2"
                data-testid="nav-get-started"
              >
                <Sparkles className="w-4 h-4" /> Get Started
              </button>
            </>
          )}
          <button
            onClick={() => setOpen((s) => !s)}
            className="lg:hidden p-2 rounded-full glass"
            data-testid="nav-mobile-toggle"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-gray-100"
          >
            <div className="px-6 py-5 flex flex-col gap-1">
              {NAV_LINKS.map((l) => {
                if (l.label === "Discover") {
                  return (
                    <button
                      key={l.label}
                      type="button"
                      onClick={() => { setOpen(false); setDiscoverOpen(true); }}
                      className="py-2.5 text-base font-medium text-gray-800 text-left flex items-center justify-between w-full"
                      data-testid="nav-mobile-link-discover"
                    >
                      Discover <ChevronDown className="w-4 h-4 opacity-60" />
                    </button>
                  );
                }

                const isHash = l.href.includes("#");
                const isExternalRoute = l.href.startsWith("/") && !isHash;

                const handleClick = (e) => {
                  setOpen(false);
                  if (isHash) {
                    const hash = l.href.substring(l.href.indexOf("#"));
                    if (currentPath === "/") {
                      e.preventDefault();
                      const element = document.querySelector(hash);
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                        window.history.pushState(null, "", hash);
                      }
                    }
                  }
                };

                if (isExternalRoute) {
                  return (
                    <Link
                      key={l.label}
                      to={l.href}
                      onClick={handleClick}
                      className="py-2.5 text-base font-medium text-gray-800 block"
                      data-testid={`nav-mobile-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {l.label}
                    </Link>
                  );
                }

                return (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={handleClick}
                    className="py-2.5 text-base font-medium text-gray-800 block"
                    data-testid={`nav-mobile-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {l.label}
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile mega-menu slide-over */}
      <AnimatePresence>
        {discoverOpen && !isDesktop && (
          <DiscoverMegaMenu onClose={() => setDiscoverOpen(false)} panelId="discover-mega-mobile" isMobile />
        )}
      </AnimatePresence>

      {/* Desktop mega-menu positioned relative to full viewport header */}
      <AnimatePresence>
        {discoverOpen && isDesktop && (
          <DiscoverMegaMenu
            onClose={() => setDiscoverOpen(false)}
            onMouseEnter={openDiscover}
            onMouseLeave={scheduleCloseDiscover}
          />
        )}
      </AnimatePresence>
    </motion.header>
  );
}

