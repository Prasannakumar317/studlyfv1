import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Lock, Bell, Eye, EyeOff, Sparkles, CreditCard, Shield, Sliders, Globe,
  AlertTriangle, LogOut, Check, RefreshCw, Upload, Trash2, Laptop, Sun, Moon,
  Key, Terminal, ArrowUpRight, Github, Chrome, Compass, Link2, Settings,
  Camera, Building, UserCheck, ShieldCheck, Mail, ShieldAlert,
  Palette, Type, Minimize2, CheckSquare, Zap, Activity, HardDrive,
  HelpCircle, CheckCircle2, ChevronRight, X, UserCog, Database, ExternalLink
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { useProjects } from "../lib/projects";
import { toast } from "sonner";
import { Switch } from "../components/ui/switch";
import { Slider } from "../components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../components/ui/dialog";

// Simple UI components to match theme if imported items are missing
const SegmentedControl = ({ options, value, onChange, accentColorClass = "bg-[#7C3AED]" }) => {
  return (
    <div className="flex p-1 bg-gray-100/80 rounded-xl border border-gray-200/50">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-200 ${
              active
                ? `${accentColorClass} text-white shadow-sm`
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {opt.icon && <opt.icon className="w-3.5 h-3.5" />}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const { projects } = useProjects();

  // Navigation state
  const [activeSection, setActiveSection] = useState("profile");

  // Accent Theme & Appearance Settings (Interactive Preview)
  const [accentColor, setAccentColor] = useState("purple"); // purple, pink, blue, indigo, rose
  const [fontSize, setFontSize] = useState("md"); // sm, md, lg
  const [compactMode, setCompactMode] = useState(false);
  const [themeMode, setThemeMode] = useState("system"); // light, dark, system

  // Color Mapping helper
  const accentClasses = {
    purple: {
      primary: "bg-[#7C3AED]",
      gradient: "from-[#7C3AED] to-[#EC4899]",
      text: "text-[#7C3AED]",
      textHover: "hover:text-[#6D28D9]",
      ring: "focus:ring-[#7C3AED]",
      border: "border-[#7C3AED]",
      lightBg: "bg-[#F4F1FF]",
      badge: "bg-[#F4F1FF] text-[#7C3AED] border-[#7C3AED]/20",
    },
    pink: {
      primary: "bg-[#EC4899]",
      gradient: "from-[#EC4899] to-[#F43F5E]",
      text: "text-[#EC4899]",
      textHover: "hover:text-[#BE185D]",
      ring: "focus:ring-[#EC4899]",
      border: "border-[#EC4899]",
      lightBg: "bg-[#FDF2F8]",
      badge: "bg-[#FDF2F8] text-[#EC4899] border-[#EC4899]/20",
    },
    blue: {
      primary: "bg-[#2563EB]",
      gradient: "from-[#2563EB] to-[#06B6D4]",
      text: "text-[#2563EB]",
      textHover: "hover:text-[#1D4ED8]",
      ring: "focus:ring-[#2563EB]",
      border: "border-[#2563EB]",
      lightBg: "bg-[#EFF6FF]",
      badge: "bg-[#EFF6FF] text-[#2563EB] border-[#2563EB]/20",
    },
    indigo: {
      primary: "bg-[#4F46E5]",
      gradient: "from-[#4F46E5] to-[#8B5CF6]",
      text: "text-[#4F46E5]",
      textHover: "hover:text-[#4338CA]",
      ring: "focus:ring-[#4F46E5]",
      border: "border-[#4F46E5]",
      lightBg: "bg-[#EEF2FF]",
      badge: "bg-[#EEF2FF] text-[#4F46E5] border-[#4F46E5]/20",
    },
    rose: {
      primary: "bg-[#E11D48]",
      gradient: "from-[#E11D48] to-[#EC4899]",
      text: "text-[#E11D48]",
      textHover: "hover:text-[#BE123C]",
      ring: "focus:ring-[#E11D48]",
      border: "border-[#E11D48]",
      lightBg: "bg-[#FFF1F2]",
      badge: "bg-[#FFF1F2] text-[#E11D48] border-[#E11D48]/20",
    }
  };

  const activeAccent = accentClasses[accentColor] || accentClasses.purple;

  // Font sizing style object
  const fontSizeStyle = () => {
    switch (fontSize) {
      case "sm":
        return "text-[13px] leading-relaxed";
      case "lg":
        return "text-[16px] leading-relaxed";
      default:
        return "text-[14.5px] leading-relaxed";
    }
  };

  // 1. Profile State
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [fullName, setFullName] = useState(user?.name || "John Doe");
  const [email, setEmail] = useState(user?.email || "john.doe@university.edu");
  const [username, setUsername] = useState(user?.email ? user.email.split("@")[0] : "johndoe");
  const [college, setCollege] = useState("Massachusetts Institute of Technology");
  const [role, setRole] = useState("Student"); // Student, Admin, User
  const [avatarPreview, setAvatarPreview] = useState(user?.picture || null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Sync profile edits with Auth Context
  const handleSaveProfile = () => {
    setProfileSaving(true);
    setTimeout(() => {
      setProfileSaving(false);
      setProfileEditing(false);
      setUser({
        ...user,
        name: fullName,
        email: email,
        picture: avatarPreview
      });
      toast.success("Profile changes saved successfully!");
    }, 1200);
  };

  // Profile Photo Upload / Remove
  const handleImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
      toast.success("Image selected! Click Save Changes to apply.");
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const removePhoto = () => {
    setAvatarPreview(null);
    toast.success("Profile photo cleared. Save changes to apply.");
  };

  // 3. Password & Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [securitySaving, setSecuritySaving] = useState(false);

  // Toggles
  const [twoFactor, setTwoFactor] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState(true);

  // Mock Active Sessions
  const [sessions, setSessions] = useState([
    { id: 1, device: "Windows PC", browser: "Chrome", location: "San Francisco, USA", active: true },
    { id: 2, device: "MacBook Pro", browser: "Safari", location: "New York, USA", active: false },
    { id: 3, device: "iPhone 15 Pro", browser: "Safari Mobile", location: "San Francisco, USA", active: false }
  ]);

  const handleRevokeSession = (id) => {
    setSessions(sessions.filter((s) => s.id !== id));
    toast.success("Session terminated successfully.");
  };

  const handleRevokeAll = () => {
    setSessions(sessions.filter((s) => s.active));
    toast.success("Logged out from all other devices.");
  };

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!newPassword) return { score: 0, label: "None", color: "bg-gray-200" };
    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: "Weak", color: "bg-red-500" };
      case 2:
        return { score: 50, label: "Fair", color: "bg-orange-400" };
      case 3:
        return { score: 75, label: "Good", color: "bg-[#7C3AED]" };
      case 4:
        return { score: 100, label: "Strong", color: "bg-emerald-500" };
      default:
        return { score: 10, label: "Weak", color: "bg-red-500" };
    }
  };
  const strength = getPasswordStrength();

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSecuritySaving(true);
    setTimeout(() => {
      setSecuritySaving(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully!");
    }, 1200);
  };

  // 4. Notifications State
  const [notifs, setNotifs] = useState({
    email: true,
    aiCompletion: true,
    marketing: false,
    productUpdates: true,
    weeklyReports: true,
    securityAlerts: true
  });

  const toggleNotif = (key) => {
    setNotifs({ ...notifs, [key]: !notifs[key] });
    toast.success("Notification preferences updated.");
  };

  // 6. AI Preferences State
  const [aiModel, setAiModel] = useState("gemini-1.5-flash");
  const [responseLength, setResponseLength] = useState("medium");
  const [creativity, setCreativity] = useState([0.7]);
  const [aiAutoSave, setAiAutoSave] = useState(true);
  const [aiAutoExport, setAiAutoExport] = useState(false);
  const [defaultProject, setDefaultProject] = useState(projects[0]?.project_id || "none");

  // 8. Connected Accounts State
  const [connectedAccs, setConnectedAccs] = useState({
    google: true,
    github: false,
    microsoft: false,
    linkedin: true
  });

  const toggleConnection = (key, name) => {
    const isConnecting = !connectedAccs[key];
    setConnectedAccs({ ...connectedAccs, [key]: isConnecting });
    if (isConnecting) {
      toast.success(`Successfully connected to ${name}`);
    } else {
      toast.info(`Disconnected from ${name}`);
    }
  };

  // 9. Workspace Preferences State
  const [workspaceName, setWorkspaceName] = useState("My Workspace");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC-5");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [autosaveInterval, setAutosaveInterval] = useState("60");

  // 10. Danger Zone Confirmation Dialogs
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: "", // deleteAccount, deleteWorkspace, clearHistory, exportData
    title: "",
    description: "",
    inputValue: "",
    confirmWord: ""
  });

  const openDangerDialog = (type) => {
    let title = "";
    let description = "";
    let confirmWord = "";

    if (type === "deleteAccount") {
      title = "Delete Account permanently?";
      description = "This action is irreversible. It will erase all your projects, files, account profile and analytics. Please type DELETE below to confirm.";
      confirmWord = "DELETE";
    } else if (type === "deleteWorkspace") {
      title = "Delete Workspace?";
      description = "Are you sure you want to delete this workspace? This will terminate all collaborative projects. Please type the workspace name 'My Workspace' to confirm.";
      confirmWord = "My Workspace";
    } else if (type === "clearHistory") {
      title = "Clear AI Conversation History?";
      description = "This will wipe out all cached prompts, suggestions and history logs. Please type CLEAR to proceed.";
      confirmWord = "CLEAR";
    } else if (type === "exportData") {
      title = "Export All Account Data?";
      description = "We will package your projects and generations into a JSON archive. Type EXPORT to trigger download.";
      confirmWord = "EXPORT";
    }

    setConfirmDialog({
      open: true,
      type,
      title,
      description,
      inputValue: "",
      confirmWord
    });
  };

  const handleExecuteDangerAction = () => {
    if (confirmDialog.inputValue !== confirmDialog.confirmWord) {
      toast.error("Confirmation string does not match");
      return;
    }

    const type = confirmDialog.type;
    setConfirmDialog({ ...confirmDialog, open: false });

    toast.loading("Processing request...", { duration: 1000 });

    setTimeout(() => {
      if (type === "deleteAccount") {
        toast.success("Account successfully deleted. Redirecting...");
        setTimeout(() => logout(), 1000);
      } else if (type === "deleteWorkspace") {
        toast.success("Workspace deleted. Workspace reset to default.");
        setWorkspaceName("Default Workspace");
      } else if (type === "clearHistory") {
        toast.success("AI History cleared successfully!");
      } else if (type === "exportData") {
        const dummyData = {
          user: { name: fullName, email },
          workspace: workspaceName,
          projectsCount: projects.length,
          exportedAt: new Date().toISOString()
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dummyData, null, 2));
        const dlAnchor = document.createElement("a");
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", "studlyf_data_export.json");
        dlAnchor.click();
        toast.success("Data export archive downloaded!");
      }
    }, 1200);
  };

  const navigationItems = [
    { id: "profile", label: "Profile & Account", icon: User },
    { id: "security", label: "Security & Access", icon: Shield },
    { id: "preferences", label: "Preferences & Theme", icon: Sliders },
    { id: "ai", label: "AI & Notifications", icon: Sparkles },
    { id: "billing", label: "Billing & Plans", icon: CreditCard },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle, textClass: "text-red-500" }
  ];

  return (
    <div data-testid="settings-page" className={`min-h-screen ${fontSizeStyle()}`}>
      {/* Top Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#7C3AED]">Workspace</p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl font-semibold tracking-tighter">Settings</h1>
          <p className="mt-2 text-gray-600">Configure your personal profile, credentials, billing status, and AI environments.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 bg-white border border-gray-100/80 rounded-2xl p-4 shadow-sm relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-2">Settings Menu</p>
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
            {navigationItems.map((item) => {
              const active = activeSection === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 w-full text-left ${
                    active
                      ? `${activeAccent.lightBg} ${activeAccent.text} border border-gray-200/20 shadow-sm`
                      : `text-gray-500 hover:text-gray-900 hover:bg-gray-50`
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? activeAccent.text : "text-gray-400"}`} />
                  <span className={item.textClass || ""}>{item.label}</span>
                  {active && (
                    <motion.div
                      layoutId="sidebarActiveIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-current hidden lg:block"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Pane */}
        <div className="flex-1 w-full space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* SECTION 1: PROFILE & ACCOUNT */}
              {activeSection === "profile" && (
                <>
                  {/* Profile Card */}
                  <div className={`rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${compactMode ? "p-4" : "p-6"}`}>
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${activeAccent.lightBg} ${activeAccent.text}`}>
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-gray-900">Personal Profile</h2>
                          <p className="text-xs text-gray-500">Update your avatar photo and credentials</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (profileEditing) {
                            handleSaveProfile();
                          } else {
                            setProfileEditing(true);
                          }
                        }}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 border border-gray-200/80 shadow-sm ${
                          profileEditing
                            ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {profileSaving ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : profileEditing ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <UserCog className="w-3.5 h-3.5" />
                        )}
                        {profileSaving ? "Saving..." : profileEditing ? "Save Changes" : "Edit Profile"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                      {/* Left: Image Upload Zone */}
                      <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-200/80 rounded-2xl bg-gray-50/50">
                        <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Profile Picture</p>
                        <div className="relative group">
                          {avatarPreview ? (
                            <img
                              src={avatarPreview}
                              alt={fullName}
                              className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-md ring-4 ring-[#7C3AED]/20 transition-transform duration-200 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center text-3xl font-semibold shadow-md ring-4 ring-[#7C3AED]/20">
                              {(fullName || "?").slice(0, 1).toUpperCase()}
                            </div>
                          )}

                          {profileEditing && (
                            <button
                              onClick={triggerFileSelect}
                              className="absolute bottom-0 right-0 p-2 rounded-full bg-white border border-gray-100 shadow-md text-gray-600 hover:text-[#7C3AED] transition-colors"
                              title="Upload Picture"
                            >
                              <Camera className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {profileEditing ? (
                          <div className="mt-4 w-full flex flex-col items-center">
                            <div
                              onDragOver={onDragOver}
                              onDragLeave={onDragLeave}
                              onDrop={onDrop}
                              className={`w-full py-4 px-2 rounded-xl border border-dashed text-center cursor-pointer transition-all duration-200 ${
                                dragActive
                                  ? "border-[#7C3AED] bg-[#F4F1FF]/50"
                                  : "border-gray-200 hover:bg-gray-100/50"
                              }`}
                              onClick={triggerFileSelect}
                            >
                              <Upload className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                              <p className="text-[10px] text-gray-500">Drag image here or click to browse</p>
                            </div>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept="image/*"
                              className="hidden"
                            />
                            {avatarPreview && (
                              <button
                                type="button"
                                onClick={removePhoto}
                                className="mt-3 text-[11px] font-bold text-red-500 hover:underline inline-flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove photo
                              </button>
                            )}
                          </div>
                        ) : (
                          <p className="mt-3 text-[11px] text-gray-400 text-center">Click &apos;Edit Profile&apos; above to customize picture</p>
                        )}
                      </div>

                      {/* Right: Profile Info Form */}
                      <div className="md:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                            <input
                              type="text"
                              value={fullName}
                              disabled={!profileEditing}
                              onChange={(e) => setFullName(e.target.value)}
                              className={`w-full px-3 py-2 border rounded-xl text-xs transition-all outline-none ${
                                profileEditing
                                  ? `bg-white border-gray-200 focus:border-gray-300 ${activeAccent.ring} focus:ring-2`
                                  : "bg-gray-50/50 border-gray-100 text-gray-700 cursor-not-allowed"
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Username</label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-xs text-gray-400">@</span>
                              <input
                                type="text"
                                value={username}
                                disabled={!profileEditing}
                                onChange={(e) => setUsername(e.target.value)}
                                className={`w-full pl-7 pr-3 py-2 border rounded-xl text-xs transition-all outline-none ${
                                  profileEditing
                                    ? `bg-white border-gray-200 focus:border-gray-300 ${activeAccent.ring} focus:ring-2`
                                    : "bg-gray-50/50 border-gray-100 text-gray-700 cursor-not-allowed"
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                          <input
                            type="email"
                            value={email}
                            disabled={!profileEditing}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-xl text-xs transition-all outline-none ${
                              profileEditing
                                ? `bg-white border-gray-200 focus:border-gray-300 ${activeAccent.ring} focus:ring-2`
                                : "bg-gray-50/50 border-gray-100 text-gray-700 cursor-not-allowed"
                            }`}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">College/Organization</label>
                            <input
                              type="text"
                              value={college}
                              disabled={!profileEditing}
                              onChange={(e) => setCollege(e.target.value)}
                              className={`w-full px-3 py-2 border rounded-xl text-xs transition-all outline-none ${
                                profileEditing
                                  ? `bg-white border-gray-200 focus:border-gray-300 ${activeAccent.ring} focus:ring-2`
                                  : "bg-gray-50/50 border-gray-100 text-gray-700 cursor-not-allowed"
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Role</label>
                            <select
                              value={role}
                              disabled={!profileEditing}
                              onChange={(e) => setRole(e.target.value)}
                              className={`w-full px-3 py-2 border rounded-xl text-xs transition-all outline-none bg-white ${
                                profileEditing
                                  ? `bg-white border-gray-200 focus:border-gray-300 ${activeAccent.ring} focus:ring-2`
                                  : "bg-gray-50/50 border-gray-100 text-gray-700 cursor-not-allowed"
                              }`}
                            >
                              <option value="Student">Student</option>
                              <option value="Admin">Admin</option>
                              <option value="User">User</option>
                            </select>
                          </div>
                        </div>

                        {profileEditing && (
                          <div className="flex justify-end gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setAvatarPreview(user?.picture || null);
                                setFullName(user?.name || "John Doe");
                                setEmail(user?.email || "john.doe@university.edu");
                                setUsername(user?.email ? user.email.split("@")[0] : "johndoe");
                                setProfileEditing(false);
                              }}
                              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveProfile}
                              className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${activeAccent.primary} hover:opacity-95`}
                            >
                              {profileSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                              Save Changes
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Account Information Card */}
                  <div className={`rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow ${compactMode ? "p-4" : "p-6"}`}>
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                      <div className={`p-2 rounded-xl ${activeAccent.lightBg} ${activeAccent.text}`}>
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-gray-900">Account System Details</h2>
                        <p className="text-xs text-gray-500">Live indicators, plans, database statistics, and limits</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-center group hover:bg-white hover:border-gray-200 transition-all duration-200">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">User ID</p>
                        <p className="font-display font-bold text-sm text-gray-800 mt-1 truncate" title="usr_2910a9f14">usr_2910a9f14</p>
                        <p className="text-[10px] text-emerald-500 mt-1 flex items-center justify-center gap-1 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active Session
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-center hover:bg-white hover:border-gray-200 transition-all duration-200">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined Date</p>
                        <p className="font-display font-bold text-sm text-gray-800 mt-1">July 2, 2026</p>
                        <p className="text-[10px] text-gray-500 mt-1 font-semibold">0 days ago</p>
                      </div>

                      <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-center hover:bg-white hover:border-gray-200 transition-all duration-200">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Workspace Name</p>
                        <p className="font-display font-bold text-sm text-gray-800 mt-1 truncate" title={workspaceName}>{workspaceName}</p>
                        <p className="text-[10px] text-gray-500 mt-1 font-semibold">Creator Owner</p>
                      </div>

                      <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-center hover:bg-white hover:border-gray-200 transition-all duration-200">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Projects Allocated</p>
                        <p className="font-display font-bold text-lg text-gray-800 mt-0.5">{projects.length} / 10</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 font-semibold">Usage Limits</p>
                      </div>

                      <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-center hover:bg-white hover:border-gray-200 transition-all duration-200">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Generations</p>
                        <p className="font-display font-bold text-lg text-gray-800 mt-0.5">420 credits</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 font-semibold">Used this month</p>
                      </div>

                      <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-center hover:bg-white hover:border-gray-200 transition-all duration-200">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Login</p>
                        <p className="font-display font-bold text-sm text-gray-800 mt-1 truncate">Today, 12:46 PM</p>
                        <p className="text-[10px] text-gray-500 mt-1 font-semibold">Current Device</p>
                      </div>

                      <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-center hover:bg-white hover:border-gray-200 transition-all duration-200">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account Plan</p>
                        <span className={`inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full ${activeAccent.lightBg} ${activeAccent.text} border border-[#7C3AED]/20`}>
                          PRO TRIAL
                        </span>
                        <p className="text-[10px] text-gray-500 mt-0.5 font-semibold">Ends in 14 days</p>
                      </div>

                      <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-center hover:bg-white hover:border-gray-200 transition-all duration-200">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account Status</p>
                        <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-500/20">
                          ACTIVE
                        </span>
                        <p className="text-[10px] text-gray-500 mt-0.5 font-semibold">All systems nominal</p>
                      </div>
                    </div>
                  </div>

                  {/* Connected Accounts Card */}
                  <div className={`rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow ${compactMode ? "p-4" : "p-6"}`}>
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                      <div className={`p-2 rounded-xl ${activeAccent.lightBg} ${activeAccent.text}`}>
                        <Link2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-gray-900">Connected Accounts</h2>
                        <p className="text-xs text-gray-500">Enable single sign-on integrations and access key services</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Google */}
                      <div className="flex items-center justify-between p-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-white hover:border-gray-200 transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-sm text-lg font-bold text-[#EA4335]">
                            G
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-950">Google Authentication</p>
                            <p className="text-[10px] text-gray-500">Provides single sign-on authentication</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {connectedAccs.google ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Connected
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400">Not Connected</span>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleConnection("google", "Google Account")}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                              connectedAccs.google
                                ? "bg-white text-red-500 border-red-200 hover:bg-red-55 animate-pulse"
                                : `bg-white text-gray-700 border-gray-200 hover:bg-gray-50`
                            }`}
                          >
                            {connectedAccs.google ? "Disconnect" : "Connect"}
                          </button>
                        </div>
                      </div>

                      {/* GitHub */}
                      <div className="flex items-center justify-between p-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-white hover:border-gray-200 transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                            <Github className="w-5 h-5 text-gray-900" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-950">GitHub</p>
                            <p className="text-[10px] text-gray-500">Link repositories and deploy actions</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {connectedAccs.github ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Connected
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400">Not Connected</span>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleConnection("github", "GitHub Account")}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                              connectedAccs.github
                                ? "bg-white text-red-500 border-red-200 hover:bg-red-50"
                                : `bg-white text-gray-700 border-gray-200 hover:bg-gray-50`
                            }`}
                          >
                            {connectedAccs.github ? "Disconnect" : "Connect"}
                          </button>
                        </div>
                      </div>

                      {/* Microsoft */}
                      <div className="flex items-center justify-between p-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-white hover:border-gray-200 transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-sm text-[#00A4EF] font-bold text-base">
                            M
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-950">Microsoft Account</p>
                            <p className="text-[10px] text-gray-500">Integrate Microsoft Outlook calendar</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {connectedAccs.microsoft ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Connected
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400">Not Connected</span>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleConnection("microsoft", "Microsoft Account")}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                              connectedAccs.microsoft
                                ? "bg-white text-red-500 border-red-200 hover:bg-red-50"
                                : `bg-white text-gray-700 border-gray-200 hover:bg-gray-50`
                            }`}
                          >
                            {connectedAccs.microsoft ? "Disconnect" : "Connect"}
                          </button>
                        </div>
                      </div>

                      {/* LinkedIn */}
                      <div className="flex items-center justify-between p-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-white hover:border-gray-200 transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-sm text-[#0077B5] font-bold text-lg">
                            in
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-950">LinkedIn</p>
                            <p className="text-[10px] text-gray-500">Share project updates and reports</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {connectedAccs.linkedin ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Connected
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400">Not Connected</span>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleConnection("linkedin", "LinkedIn Account")}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                              connectedAccs.linkedin
                                ? "bg-white text-red-500 border-red-200 hover:bg-red-50"
                                : `bg-white text-gray-700 border-gray-200 hover:bg-gray-50`
                            }`}
                          >
                            {connectedAccs.linkedin ? "Disconnect" : "Connect"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* SECTION 2: SECURITY & SESSIONS */}
              {activeSection === "security" && (
                <>
                  {/* Security Card */}
                  <div className={`rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow ${compactMode ? "p-4" : "p-6"}`}>
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                      <div className={`p-2 rounded-xl ${activeAccent.lightBg} ${activeAccent.text}`}>
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-gray-900">Credentials & Security</h2>
                        <p className="text-xs text-gray-500">Modify login passwords, evaluate security level and configure 2FA</p>
                      </div>
                    </div>

                    <form onSubmit={handleSavePassword} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Form Inputs */}
                        <div className="md:col-span-2 space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Current Password</label>
                            <div className="relative">
                              <input
                                type={showPass.current ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className={`w-full pl-3 pr-10 py-2 border border-gray-200 rounded-xl text-xs transition-all outline-none focus:border-gray-300 ${activeAccent.ring} focus:ring-2`}
                                placeholder="••••••••••••"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPass({ ...showPass, current: !showPass.current })}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                              >
                                {showPass.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">New Password</label>
                            <div className="relative">
                              <input
                                type={showPass.new ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={`w-full pl-3 pr-10 py-2 border border-gray-200 rounded-xl text-xs transition-all outline-none focus:border-gray-300 ${activeAccent.ring} focus:ring-2`}
                                placeholder="••••••••••••"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPass({ ...showPass, new: !showPass.new })}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                              >
                                {showPass.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                            <div className="relative">
                              <input
                                type={showPass.confirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full pl-3 pr-10 py-2 border border-gray-200 rounded-xl text-xs transition-all outline-none focus:border-gray-300 ${activeAccent.ring} focus:ring-2`}
                                placeholder="••••••••••••"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                              >
                                {showPass.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Password Strength Checklist */}
                        <div className="p-4 bg-gray-50/80 border border-gray-100 rounded-2xl space-y-4 self-start">
                          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Password Strength</p>
                          <div className="space-y-1.5">
                            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: `${strength.score}%` }}></div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-gray-400">Security Index:</span>
                              <span className="text-gray-800">{strength.label}</span>
                            </div>
                          </div>

                          <div className="space-y-2 text-[10px] text-gray-500 font-semibold">
                            <div className="flex items-center gap-1.5">
                              {newPassword.length >= 6 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                              <span>At least 6 characters</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {newPassword.length >= 8 && /[0-9]/.test(newPassword) ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                              <span>Contains numeric digit</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                              <span>Capital and lowercase letter</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {/[^A-Za-z0-9]/.test(newPassword) ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                              <span>Special symbol (@, #, !, etc.)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          className={`px-4 py-2.5 text-white rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-sm ${activeAccent.primary} hover:opacity-95`}
                        >
                          {securitySaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                          Save Password
                        </button>
                      </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white hover:border-gray-200 transition-all duration-200">
                        <div className="pt-0.5">
                          <Switch
                            checked={twoFactor}
                            onCheckedChange={(val) => {
                              setTwoFactor(val);
                              if (val) {
                                toast.success("Two-Factor Authentication activated (Mock setup).");
                              } else {
                                toast.info("Two-Factor Authentication deactivated.");
                              }
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">Two-Factor Authentication (2FA)</p>
                          <p className="text-[10px] text-gray-500 mt-1 leading-normal">Require an authenticator code alongside your password when logging in for optimal protection.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white hover:border-gray-200 transition-all duration-200">
                        <div className="pt-0.5">
                          <Switch
                            checked={loginNotifications}
                            onCheckedChange={(val) => {
                              setLoginNotifications(val);
                              toast.success(`Login notification alerts ${val ? "enabled" : "disabled"}.`);
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">Login Notifications</p>
                          <p className="text-[10px] text-gray-500 mt-1 leading-normal">Send quick push or email notifications whenever a new connection session is authorized on your account.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Sessions Card */}
                  <div className={`rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow ${compactMode ? "p-4" : "p-6"}`}>
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${activeAccent.lightBg} ${activeAccent.text}`}>
                          <Laptop className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-gray-900">Active Login Sessions</h2>
                          <p className="text-xs text-gray-500">View and revoke active sessions on alternative machines</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRevokeAll}
                        className="px-3 py-1.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-[10px] font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Logout other devices
                      </button>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {sessions.map((s) => (
                        <div key={s.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500`}>
                              {s.device.includes("iPhone") ? <ShieldAlert className="w-5 h-5 text-gray-400" /> : <Chrome className="w-5 h-5 text-gray-400" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-gray-900">{s.device} • {s.browser}</p>
                                {s.active && (
                                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-500/20">
                                    Current Device
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500 mt-0.5">{s.location} • {s.active ? "Online now" : "Last active 3 hours ago"}</p>
                            </div>
                          </div>
                          {!s.active && (
                            <button
                              type="button"
                              onClick={() => handleRevokeSession(s.id)}
                              className="text-[11px] font-bold text-red-500 hover:underline hover:text-red-700 transition-colors"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* SECTION 3: PREFERENCES & THEME */}
              {activeSection === "preferences" && (
                <>
                  {/* Appearance Settings Card */}
                  <div className={`rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow ${compactMode ? "p-4" : "p-6"}`}>
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                      <div className={`p-2 rounded-xl ${activeAccent.lightBg} ${activeAccent.text}`}>
                        <Palette className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-gray-900">Theme & Appearance</h2>
                        <p className="text-xs text-gray-500">Personalize styling accents, text size and layouts</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Segmented control for Light/Dark/System Theme */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Display Theme Mode</label>
                        <SegmentedControl
                          options={[
                            { value: "light", label: "Light Mode", icon: Sun },
                            { value: "dark", label: "Dark Mode", icon: Moon },
                            { value: "system", label: "System Theme", icon: Laptop }
                          ]}
                          value={themeMode}
                          onChange={(val) => {
                            setThemeMode(val);
                            toast.success(`Theme mode preview set to: ${val}`);
                          }}
                          accentColorClass={activeAccent.primary}
                        />
                      </div>

                      {/* Accent Color Circle Selectors */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Accent Branding Color</label>
                        <div className="flex items-center gap-3 bg-gray-50/50 border border-gray-100 p-3.5 rounded-2xl">
                          {Object.keys(accentClasses).map((key) => {
                            const active = accentColor === key;
                            let colorBg = "";
                            if (key === "purple") colorBg = "bg-[#7C3AED]";
                            if (key === "pink") colorBg = "bg-[#EC4899]";
                            if (key === "blue") colorBg = "bg-[#2563EB]";
                            if (key === "indigo") colorBg = "bg-[#4F46E5]";
                            if (key === "rose") colorBg = "bg-[#E11D48]";

                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => {
                                  setAccentColor(key);
                                  toast.success(`Accent styling changed to ${key.toUpperCase()}!`);
                                }}
                                className={`w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-bold transition-all relative ${colorBg} hover:scale-110 ${
                                  active ? "ring-2 ring-gray-400 ring-offset-2 scale-105" : ""
                                }`}
                                title={key}
                              >
                                {active && <Check className="w-4 h-4" />}
                              </button>
                            );
                          })}
                          <span className="text-xs font-semibold text-gray-600 ml-2 capitalize">
                            Active Accent: <span className={`${activeAccent.text} font-bold`}>{accentColor}</span>
                          </span>
                        </div>
                      </div>

                      {/* Segmented Font Size selector & Compact toggle */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Workspace Font Size</label>
                          <SegmentedControl
                            options={[
                              { value: "sm", label: "Small (13px)" },
                              { value: "md", label: "Medium (15px)" },
                              { value: "lg", label: "Large (17px)" }
                            ]}
                            value={fontSize}
                            onChange={(val) => {
                              setFontSize(val);
                              toast.success(`Font scale adjusted to ${val.toUpperCase()}`);
                            }}
                            accentColorClass={activeAccent.primary}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                          <div>
                            <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                              <Minimize2 className="w-4 h-4 text-gray-500" /> Compact Mode
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5">Reduces page margins and card paddings</p>
                          </div>
                          <Switch
                            checked={compactMode}
                            onCheckedChange={(val) => {
                              setCompactMode(val);
                              toast.success(`Compact mode ${val ? "enabled" : "disabled"}`);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Workspace Preferences Card */}
                  <div className={`rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow ${compactMode ? "p-4" : "p-6"}`}>
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                      <div className={`p-2 rounded-xl ${activeAccent.lightBg} ${activeAccent.text}`}>
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-gray-900">Workspace Configurations</h2>
                        <p className="text-xs text-gray-500">Configure global workspace titles, date-time and language rules</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Default Workspace Name</label>
                        <input
                          type="text"
                          value={workspaceName}
                          onChange={(e) => {
                            setWorkspaceName(e.target.value);
                          }}
                          className={`w-full px-3 py-2 border border-gray-200 rounded-xl text-xs transition-all outline-none focus:border-gray-300 ${activeAccent.ring} focus:ring-2`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Language</label>
                        <select
                          value={language}
                          onChange={(e) => {
                            setLanguage(e.target.value);
                            toast.success("Workspace language updated!");
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs transition-all outline-none bg-white focus:border-gray-300 focus:ring-2 focus:ring-[#7C3AED]"
                        >
                          <option value="en">English (US)</option>
                          <option value="es">Spanish (Español)</option>
                          <option value="fr">French (Français)</option>
                          <option value="de">German (Deutsch)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Time Zone</label>
                        <select
                          value={timezone}
                          onChange={(e) => {
                            setTimezone(e.target.value);
                            toast.success("Time zone changes loaded");
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs transition-all outline-none bg-white focus:border-gray-300 focus:ring-2 focus:ring-[#7C3AED]"
                        >
                          <option value="UTC-8">Pacific Time (PT) - UTC-8</option>
                          <option value="UTC-5">Eastern Time (ET) - UTC-5</option>
                          <option value="UTC+0">Coordinated Universal Time (UTC)</option>
                          <option value="UTC+5.5">India Standard Time (IST) - UTC+5:30</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date Format</label>
                        <select
                          value={dateFormat}
                          onChange={(e) => {
                            setDateFormat(e.target.value);
                            toast.success("System date format updated");
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs transition-all outline-none bg-white focus:border-gray-300 focus:ring-2 focus:ring-[#7C3AED]"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY (e.g., 07/02/2026)</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY (e.g., 02/07/2026)</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD (e.g., 2026-07-02)</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Auto Save Interval</label>
                        <select
                          value={autosaveInterval}
                          onChange={(e) => {
                            setAutosaveInterval(e.target.value);
                            toast.success(`Autosave interval configured to ${e.target.value}s`);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs transition-all outline-none bg-white focus:border-gray-300 focus:ring-2 focus:ring-[#7C3AED]"
                        >
                          <option value="15">Every 15 seconds</option>
                          <option value="60">Every 1 minute (Recommended)</option>
                          <option value="300">Every 5 minutes</option>
                          <option value="0">Disabled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* SECTION 4: AI & NOTIFICATIONS */}
              {activeSection === "ai" && (
                <>
                  {/* AI Preferences Card */}
                  <div className={`rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow ${compactMode ? "p-4" : "p-6"}`}>
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                      <div className={`p-2 rounded-xl ${activeAccent.lightBg} ${activeAccent.text}`}>
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-gray-900">AI Engine Preferences</h2>
                        <p className="text-xs text-gray-500">Fine-tune generation thresholds, core models, and default targets</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Default AI Generation Model</label>
                          <select
                            value={aiModel}
                            onChange={(e) => {
                              setAiModel(e.target.value);
                              toast.success(`Default generator model switched to: ${e.target.value}`);
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs transition-all outline-none bg-white focus:border-gray-300 focus:ring-2 focus:ring-[#7C3AED]"
                          >
                            <option value="gemini-1.5-flash">Gemini 1.5 Flash (Default)</option>
                            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                            <option value="gpt-4o">OpenAI GPT-4o (High Speed)</option>
                            <option value="claude-3.5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Default Generation Project Target</label>
                          <select
                            value={defaultProject}
                            onChange={(e) => {
                              setDefaultProject(e.target.value);
                              toast.success("Default project destination updated");
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs transition-all outline-none bg-white focus:border-gray-300 focus:ring-2 focus:ring-[#7C3AED]"
                          >
                            <option value="none">No Default Project</option>
                            {projects.map((p) => (
                              <option key={p.project_id} value={p.project_id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Response Output Length</label>
                        <SegmentedControl
                          options={[
                            { value: "short", label: "Short (Concise)" },
                            { value: "medium", label: "Medium (Balanced)" },
                            { value: "long", label: "Long (Exhaustive & Explanatory)" }
                          ]}
                          value={responseLength}
                          onChange={(val) => {
                            setResponseLength(val);
                            toast.success(`Response output length target is: ${val}`);
                          }}
                          accentColorClass={activeAccent.primary}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">AI Creativity Level (Temperature)</label>
                          <span className={`text-xs font-bold ${activeAccent.text}`}>Temp: {creativity[0]}</span>
                        </div>
                        <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl flex items-center gap-4">
                          <Slider
                            defaultValue={creativity}
                            max={1.0}
                            min={0.0}
                            step={0.1}
                            onValueChange={(val) => setCreativity(val)}
                            className="flex-1"
                          />
                          <span className="text-[10px] text-gray-400 font-bold w-20 text-right shrink-0">
                            {creativity[0] <= 0.3 ? "Deterministic" : creativity[0] <= 0.7 ? "Balanced" : "Highly Creative"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                          <div>
                            <p className="text-xs font-bold text-gray-900">Auto Save Generations</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">Automatically save all logs to target drive</p>
                          </div>
                          <Switch
                            checked={aiAutoSave}
                            onCheckedChange={(val) => {
                              setAiAutoSave(val);
                              toast.success(`Auto save generations: ${val ? "ON" : "OFF"}`);
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                          <div>
                            <p className="text-xs font-bold text-gray-900">Auto Export Logs</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">Sync AI logs to primary cloud folder</p>
                          </div>
                          <Switch
                            checked={aiAutoExport}
                            onCheckedChange={(val) => {
                              setAiAutoExport(val);
                              toast.success(`Cloud auto-export logs: ${val ? "ON" : "OFF"}`);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notification Switches Card */}
                  <div className={`rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow ${compactMode ? "p-4" : "p-6"}`}>
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                      <div className={`p-2 rounded-xl ${activeAccent.lightBg} ${activeAccent.text}`}>
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-gray-900">Workspace Notification Matrix</h2>
                        <p className="text-xs text-gray-500">Control what alerts you receive and where</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* 1. Email Notifications */}
                      <div className="flex items-start gap-4 p-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-white hover:border-gray-200 transition-all duration-200">
                        <div className="pt-1">
                          <Switch checked={notifs.email} onCheckedChange={() => toggleNotif("email")} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">Email Notifications</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-normal">Receive occasional emails about system status and workspace summaries.</p>
                        </div>
                      </div>

                      {/* 2. AI Completion Alerts */}
                      <div className="flex items-start gap-4 p-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-white hover:border-gray-200 transition-all duration-200">
                        <div className="pt-1">
                          <Switch checked={notifs.aiCompletion} onCheckedChange={() => toggleNotif("aiCompletion")} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">AI Completion Alerts</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-normal">Get instant alerts when long-running AI content creations complete.</p>
                        </div>
                      </div>

                      {/* 3. Marketing Emails */}
                      <div className="flex items-start gap-4 p-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-white hover:border-gray-200 transition-all duration-200">
                        <div className="pt-1">
                          <Switch checked={notifs.marketing} onCheckedChange={() => toggleNotif("marketing")} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">Marketing & Promotional Emails</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-normal">Get updates about special offers, credits, campaigns and event discounts.</p>
                        </div>
                      </div>

                      {/* 4. Product Updates */}
                      <div className="flex items-start gap-4 p-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-white hover:border-gray-200 transition-all duration-200">
                        <div className="pt-1">
                          <Switch checked={notifs.productUpdates} onCheckedChange={() => toggleNotif("productUpdates")} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">Product Updates</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-normal">Get newsletters announcing new features, templates and UI changes.</p>
                        </div>
                      </div>

                      {/* 5. Weekly Reports */}
                      <div className="flex items-start gap-4 p-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-white hover:border-gray-200 transition-all duration-200">
                        <div className="pt-1">
                          <Switch checked={notifs.weeklyReports} onCheckedChange={() => toggleNotif("weeklyReports")} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">Weekly Reports</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-normal">Receive structured weekly summaries of project analytics and generations.</p>
                        </div>
                      </div>

                      {/* 6. Security Alerts */}
                      <div className="flex items-start gap-4 p-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-white hover:border-gray-200 transition-all duration-200">
                        <div className="pt-1">
                          <Switch checked={notifs.securityAlerts} onCheckedChange={() => toggleNotif("securityAlerts")} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">Security Alerts (High Priority)</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-normal">Critical warnings regarding access tokens, password modifications or unknown logins.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* SECTION 5: BILLING & PLANS */}
              {activeSection === "billing" && (
                <>
                  {/* Subscription details Card */}
                  <div className="rounded-2xl border border-[#7C3AED]/20 bg-gradient-to-br from-[#7C3AED]/5 to-[#EC4899]/5 p-6 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 pb-6 border-b border-[#7C3AED]/10">
                      <div>
                        <span className={`inline-block px-3 py-1 text-[10px] font-extrabold rounded-full ${activeAccent.lightBg} ${activeAccent.text} border border-[#7C3AED]/20`}>
                          TRIAL ACCOUNT
                        </span>
                        <h2 className="text-xl font-display font-extrabold text-gray-900 mt-2">Premium Pro Trial Active</h2>
                        <p className="text-xs text-gray-600 mt-1">Unlock full capabilities with unrestricted AI workspace integrations.</p>
                      </div>

                      <div className="bg-white border border-[#7C3AED]/20 p-4 rounded-2xl shadow-sm text-center shrink-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time Remaining</p>
                        <p className="font-display font-black text-3xl brand-gradient-text mt-1">14 Days</p>
                        <p className="text-[9px] text-gray-500 font-semibold mt-1">Ends on July 16, 2026</p>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4 relative z-10">
                      {/* AI credits progress */}
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="text-gray-600">Monthly AI Generations Credits</span>
                          <span className="text-gray-900">420 / 1,000 Credits</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${activeAccent.gradient} rounded-full`} style={{ width: "42%" }}></div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1.5">Resets automatically in 28 days</p>
                      </div>

                      {/* Project creations limit */}
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="text-gray-600">Workspace Startup Projects</span>
                          <span className="text-gray-900">{projects.length} / 10 Active Projects</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${activeAccent.gradient} rounded-full`} style={{ width: `${projects.length * 10}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 relative z-10">
                      <button
                        type="button"
                        onClick={() => toast.info("Mock Invoice list opened.")}
                        className="px-4 py-2 border border-[#7C3AED]/20 text-gray-700 bg-white rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        Billing Invoices
                      </button>
                      <button
                        type="button"
                        onClick={() => toast.success("Redirecting to Stripe upgrade portal...")}
                        className="glow-button rounded-xl px-5 py-2 text-xs font-extrabold flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" /> Upgrade to Pro
                      </button>
                    </div>
                  </div>

                  {/* Billing Invoices / History */}
                  <div className={`rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow ${compactMode ? "p-4" : "p-6"}`}>
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${activeAccent.lightBg} ${activeAccent.text}`}>
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-gray-900">Billing History</h2>
                          <p className="text-xs text-gray-500">Review your past invoices, statuses and dates</p>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <th className="pb-3 font-semibold">Invoice ID</th>
                            <th className="pb-3 font-semibold">Billing Period</th>
                            <th className="pb-3 font-semibold">Amount</th>
                            <th className="pb-3 font-semibold">Payment Status</th>
                            <th className="pb-3 font-semibold text-right">Receipt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs">
                          <tr>
                            <td className="py-3 font-bold text-gray-900">INV-8120</td>
                            <td className="py-3 text-gray-500">Jun 2, 2026 - Jul 2, 2026</td>
                            <td className="py-3 font-semibold text-gray-800">$0.00 (Pro Trial)</td>
                            <td className="py-3">
                              <span className="px-2.5 py-0.5 text-[9px] font-extrabold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-500/20">
                                PAID
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => toast.success("Receipt downloaded!")}
                                className="text-[10px] font-bold text-[#7C3AED] hover:underline flex items-center gap-0.5 ml-auto"
                              >
                                View PDF <ExternalLink className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 font-bold text-gray-900">INV-6019</td>
                            <td className="py-3 text-gray-500">May 2, 2026 - Jun 2, 2026</td>
                            <td className="py-3 font-semibold text-gray-800">$0.00 (Pro Trial)</td>
                            <td className="py-3">
                              <span className="px-2.5 py-0.5 text-[9px] font-extrabold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-500/20">
                                PAID
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => toast.success("Receipt downloaded!")}
                                className="text-[10px] font-bold text-[#7C3AED] hover:underline flex items-center gap-0.5 ml-auto"
                              >
                                View PDF <ExternalLink className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* SECTION 6: DANGER ZONE */}
              {activeSection === "danger" && (
                <>
                  {/* Danger zone Container card */}
                  <div className="rounded-2xl border border-red-200 bg-red-50/10 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-red-100">
                      <div className="p-2 rounded-xl bg-red-100 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-red-950">Destructive Actions Danger Zone</h2>
                        <p className="text-xs text-red-600/80">Irreversible actions that modify or delete workspace settings</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Log out */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-red-100 rounded-2xl bg-white">
                        <div>
                          <p className="text-xs font-bold text-gray-900">Logout Current Session</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">Safely close this active session and save all unsaved files.</p>
                        </div>
                        <button
                          onClick={logout}
                          className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-xl text-xs font-semibold shadow-sm transition-all shrink-0 self-start md:self-center"
                          data-testid="settings-logout"
                        >
                          Log out
                        </button>
                      </div>

                      {/* Clear History */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-red-100 rounded-2xl bg-white">
                        <div>
                          <p className="text-xs font-bold text-gray-900">Wipe AI Prompt Logs</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">Permanently delete prompt completion records, suggestions, and workspace caches.</p>
                        </div>
                        <button
                          onClick={() => openDangerDialog("clearHistory")}
                          className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-55 rounded-xl text-xs font-semibold shadow-sm transition-all shrink-0 self-start md:self-center"
                        >
                          Clear AI History
                        </button>
                      </div>

                      {/* Export Account Data */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-red-100 rounded-2xl bg-white">
                        <div>
                          <p className="text-xs font-bold text-gray-900">Export All Account Data</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">Package all created projects and AI generations into a downloadable JSON bundle.</p>
                        </div>
                        <button
                          onClick={() => openDangerDialog("exportData")}
                          className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-sm transition-all shrink-0 self-start md:self-center"
                        >
                          Export Data Archive
                        </button>
                      </div>

                      {/* Delete Workspace */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-red-100 rounded-2xl bg-white">
                        <div>
                          <p className="text-xs font-bold text-gray-900">Delete Workspace</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">Delete &apos;{workspaceName}&apos; along with all allocated projects and analytics. (Owner permission needed)</p>
                        </div>
                        <button
                          onClick={() => openDangerDialog("deleteWorkspace")}
                          className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold shadow-sm transition-all shrink-0 self-start md:self-center"
                        >
                          Delete Workspace
                        </button>
                      </div>

                      {/* Delete Account */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-red-100 rounded-2xl bg-white">
                        <div>
                          <p className="text-xs font-bold text-red-600">Delete User Account</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">Deletes profile picture, user record, analytics, files, and links. This cannot be undone.</p>
                        </div>
                        <button
                          onClick={() => openDangerDialog("deleteAccount")}
                          className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl text-xs font-semibold shadow-sm transition-all shrink-0 self-start md:self-center"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* DANGER CONFIRMATION DIALOG (Radix Dialog via shadcn/ui) */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent className="max-w-md bg-white border border-gray-100 shadow-xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{confirmDialog.title}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 leading-normal mt-2">
              {confirmDialog.description}
            </DialogDescription>
          </DialogHeader>

          <div className="my-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Type <span className="font-extrabold text-gray-700 font-mono">&quot;{confirmDialog.confirmWord}&quot;</span> below
            </p>
            <input
              type="text"
              value={confirmDialog.inputValue}
              onChange={(e) => setConfirmDialog({ ...confirmDialog, inputValue: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
              placeholder="Confirm instruction..."
            />
          </div>

          <DialogFooter className="flex gap-2 justify-end">
            <button
              onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
              className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteDangerAction}
              disabled={confirmDialog.inputValue !== confirmDialog.confirmWord}
              className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-sm ${
                confirmDialog.inputValue === confirmDialog.confirmWord
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Confirm Destructive Action
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
