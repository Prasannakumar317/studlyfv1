import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../lib/auth";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);
  const { setUser } = useAuth();
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    const hash = location.hash || window.location.hash;
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) {
      navigate("/", { replace: true });
      return;
    }
    const sessionId = decodeURIComponent(match[1]);

    (async () => {
      try {
        const res = await api.post("/auth/session", { session_id: sessionId });
        if (res.data?.session_token) {
          localStorage.setItem("studlyf_session_token", res.data.session_token);
        }
        setUser({
          user_id: res.data.user_id,
          email: res.data.email,
          name: res.data.name,
          picture: res.data.picture,
        });
        navigate("/workspace", { replace: true, state: { user: res.data } });
      } catch (e) {
        setErr(e?.response?.data?.detail || "Sign-in failed. Please try again.");
        setTimeout(() => navigate("/", { replace: true }), 1800);
      }
    })();
  }, [location.hash, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] flex items-center justify-center text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="mt-5 font-display text-xl font-semibold">Signing you in…</p>
        <p className="mt-1 text-sm text-gray-500">{err || "Setting up your STUDLYF AI workspace."}</p>
      </motion.div>
    </div>
  );
}
