"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  ShieldCheck,
  Plug,
  Bot,
  Sparkles,
  Bell,
  Save,
  Loader2,
  CheckCircle2,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const SIDEBAR_NAV = [
  { id: "company", label: "Workspace", icon: Building2, desc: "Manage your company profile" },
  { id: "users", label: "Team & Members", icon: Users, desc: "Manage seats and invites" },
  { id: "roles", label: "Roles & Permissions", icon: ShieldCheck, desc: "Access control settings" },
  { id: "integrations", label: "Integrations", icon: Plug, desc: "Connect ERPs & CRMs" },
  { id: "calle", label: "Voice Agents", icon: Bot, desc: "Configure AI calling behavior" },
  { id: "ai", label: "Gemini Model", icon: Sparkles, desc: "API keys and LLM settings" },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "Alerts and email digests" },
];

const mockUsers = [
  { id: "u1", name: "Suhas Nair", email: "suhas@vendorflow.io", role: "Admin", status: "Active" },
  { id: "u2", name: "Meera Pillai", email: "meera@vendorflow.io", role: "Manager", status: "Active" },
  { id: "u3", name: "Anand Iyer", email: "anand@vendorflow.io", role: "Operator", status: "Active" },
  { id: "u4", name: "Riya Shah", email: "riya@vendorflow.io", role: "Viewer", status: "Invited" },
];

function SaveButton({ label = "Save Changes" }: { label?: string }) {
  const [saving, setSaving] = useState(false);
  return (
    <Button
      onClick={async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 800));
        toast.success("Settings updated successfully", {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
        });
        setSaving(false);
      }}
      className="rounded-xl h-9 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 transition-all gap-1.5 font-medium"
    >
      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
      {saving ? "Saving..." : label}
    </Button>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">{title}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
    </div>
  );
}

function SettingsCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-[#0A0A0A] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("company");

  const renderContent = () => {
    switch (activeTab) {
      case "company":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <SectionHeader title="Workspace Profile" description="Update your company details, branding, and billing address." />
            
            <SettingsCard>
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Company Logo</h3>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs">Upload new</Button>
                      <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30">Remove</Button>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100 dark:bg-gray-800 my-4" />

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Company Name</Label>
                    <Input defaultValue="IndusTech Solutions" className="h-9 rounded-xl bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus-visible:ring-indigo-500 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Website Domain</Label>
                    <Input defaultValue="industech.io" className="h-9 rounded-xl bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus-visible:ring-indigo-500 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Tax ID / GST</Label>
                    <Input defaultValue="27AAAPL1234C1Z5" className="h-9 rounded-xl bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 font-mono text-sm focus-visible:ring-indigo-500 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Industry</Label>
                    <select className="w-full h-9 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 px-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                      <option>Manufacturing</option>
                      <option>Logistics & Supply Chain</option>
                      <option>Retail</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Please use a valid registered entity name.</p>
                <SaveButton />
              </div>
            </SettingsCard>
          </motion.div>
        );

      case "users":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <SectionHeader title="Team & Members" description="Invite colleagues and manage their workspace access." />
            
            <SettingsCard>
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Active Members</h3>
                  <p className="text-xs text-gray-500 mt-0.5">You are currently using 4 of your 10 available seats.</p>
                </div>
                <Button className="rounded-xl h-9 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-black text-white text-sm transition-all shadow-sm">
                  Invite Member
                </Button>
              </div>
              
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {mockUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 px-6 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">{user.name}</p>
                          {user.role === "Admin" && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Owner</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <span className="text-xs text-gray-500 w-12">{user.status}</span>
                      </div>
                      <select className="h-8 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700 bg-transparent px-2 text-xs font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer">
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Operator">Operator</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </SettingsCard>
          </motion.div>
        );

      case "ai":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <SectionHeader title="Gemini AI Configuration" description="Manage your LLM connection, model settings, and prompts." />
            
            <SettingsCard>
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-violet-50/50 dark:bg-violet-500/5 border border-violet-100 dark:border-violet-500/10">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-violet-900 dark:text-violet-100">Connection Active</h3>
                    <p className="text-xs text-violet-700/70 dark:text-violet-300/70 mt-0.5">Gemini 2.0 Flash is currently powering your voice agents.</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">API Key</Label>
                  <Input type="password" defaultValue="AIzaSy••••••••••••••••••••••••••" className="h-9 rounded-xl bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 font-mono text-sm focus-visible:ring-indigo-500 transition-all" />
                  <p className="text-[11px] text-gray-500 mt-1">Keep your API key secure. Do not share it publicly.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Default Model</Label>
                    <select className="w-full h-9 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 px-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                      <option>gemini-2.0-flash</option>
                      <option>gemini-2.5-pro</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Temperature</Label>
                    <div className="flex items-center gap-3">
                      <input type="range" min="0" max="1" step="0.1" defaultValue="0.3" className="w-full accent-violet-500" />
                      <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-gray-600 dark:text-gray-300">0.3</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <SaveButton label="Update AI Config" />
              </div>
            </SettingsCard>
          </motion.div>
        );

      case "integrations":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <SectionHeader title="Integrations" description="Connect VendorFlow with your existing ERP, CRM, and communication tools." />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "SAP ERP", desc: "Sync PO status and delivery updates directly to SAP", connected: true, color: "blue" },
                { name: "Salesforce", desc: "Keep vendor records and call logs synced", connected: false, color: "sky" },
                { name: "Slack", desc: "Get real-time agent notifications in your channels", connected: true, color: "purple" },
                { name: "Webhooks", desc: "Build custom integrations with HTTP POST events", connected: false, color: "gray" },
              ].map((intg) => (
                <SettingsCard key={intg.name} className="flex flex-col hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors">
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${intg.color}-50 dark:bg-${intg.color}-500/10`}>
                        <Plug className={`w-5 h-5 text-${intg.color}-600 dark:text-${intg.color}-400`} />
                      </div>
                      <div className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        intg.connected 
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                        {intg.connected ? "Connected" : "Disconnected"}
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{intg.name}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{intg.desc}</p>
                  </div>
                  <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.01]">
                    <Button variant={intg.connected ? "outline" : "default"} className={`w-full h-8 text-xs rounded-lg ${intg.connected ? "" : "bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"}`}>
                      {intg.connected ? "Configure" : "Connect"}
                    </Button>
                  </div>
                </SettingsCard>
              ))}
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Coming Soon</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              The {activeTab} configuration panel is currently being redesigned. Check back soon.
            </p>
          </motion.div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-8 max-w-6xl mx-auto pt-2 pb-12">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="mb-6 px-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
        </div>
        <nav className="space-y-1">
          {SIDEBAR_NAV.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <item.icon className={`w-4.5 h-4.5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"}`} />
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-indigo-400 dark:text-indigo-500" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <div key={activeTab}>
            {renderContent()}
          </div>
        </AnimatePresence>
      </main>
    </div>
  );
}
