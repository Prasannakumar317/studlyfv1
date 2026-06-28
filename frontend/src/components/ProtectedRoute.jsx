import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center gap-3 text-gray-500 text-sm">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading workspace…
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace state={{ from: location }} />;
  return children;
}
