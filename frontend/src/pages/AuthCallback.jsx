import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate("/workspace", { replace: true });
      } else {
        // If loading finished but no user, redirect to home page
        navigate("/", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="mt-5 font-display text-xl font-semibold">Signing you in…</p>
        <p className="mt-1 text-sm text-gray-500">Setting up your STUDLYF AI workspace.</p>
      </motion.div>
    </div>
  );
}
