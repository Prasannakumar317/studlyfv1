import React from "react";
import { useAuth } from "../lib/auth";
import { useProjects } from "../lib/projects";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { projects } = useProjects();

  return (
    <div data-testid="settings-page">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#6C63FF]">Workspace</p>
        <h1 className="mt-1 font-display text-3xl md:text-4xl font-semibold tracking-tighter">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account.</p>
      </div>

      <div className="mt-8 rounded-[24px] bg-white border border-gray-100 p-6">
        <p className="text-sm font-semibold">Account</p>
        <div className="mt-4 flex items-center gap-3">
          {user?.picture ? (
            <img src={user.picture} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] text-white flex items-center justify-center text-lg font-semibold">
              {(user?.name || user?.email || "?").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-display text-lg font-semibold">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 max-w-md">
          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-gray-500">Projects</p>
            <p className="font-display text-2xl font-semibold mt-1">{projects.length}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-gray-500">Plan</p>
            <p className="font-display text-2xl font-semibold mt-1">Pro Trial</p>
          </div>
        </div>
        <button onClick={logout} className="mt-6 rounded-full px-5 py-2.5 text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800" data-testid="settings-logout">
          Log out
        </button>
      </div>
    </div>
  );
}
