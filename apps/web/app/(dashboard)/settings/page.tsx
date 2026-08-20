"use client";

import { useState } from "react";
import { Save, Loader2, Building, Play, Users, CheckCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";
import { tallyApi } from "@/lib/api";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"org" | "tally" | "workflow" | "users">("org");
  const [saving, setSaving] = useState(false);
  const [testingTally, setTestingTally] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Mock save
    setTimeout(() => {
      toast.success("Settings saved successfully");
      setSaving(false);
    }, 600);
  };

  const handleTestTally = async () => {
    setTestingTally(true);
    try {
      await tallyApi.importVendors();
      toast.success("Connection successful. Tally is reachable on port 9001.");
    } catch (err: any) {
      toast.error("Connection failed: " + err.message);
    } finally {
      setTestingTally(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <PageHeader
        title="Settings"
        description="Manage organization, workflows, and integrations"
      />

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 space-y-1">
          <button 
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "org" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}
            onClick={() => setActiveTab("org")}
          >
            <Building className="w-4 h-4" /> Organization
          </button>
          <button 
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "workflow" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}
            onClick={() => setActiveTab("workflow")}
          >
            <CheckCircle className="w-4 h-4" /> Approval Workflow
          </button>
          <button 
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "tally" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}
            onClick={() => setActiveTab("tally")}
          >
            <Play className="w-4 h-4" /> Tally Integration
          </button>
          <button 
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "users" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}
            onClick={() => setActiveTab("users")}
          >
            <Users className="w-4 h-4" /> Users (Admin)
          </button>
        </div>

        <div className="flex-1">
          {activeTab === "org" && (
            <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-6 space-y-6">
               <h3 className="text-lg font-semibold text-gray-900">Organization Settings</h3>
               
               <div className="space-y-4 max-w-md">
                 <div className="space-y-1.5">
                   <label className="text-sm font-medium text-gray-700">Organization Name</label>
                   <Input defaultValue="Acme Corp" />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-sm font-medium text-gray-700">Default Currency</label>
                   <Input defaultValue="INR" disabled />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-sm font-medium text-gray-700">Default Plant Address</label>
                   <Input defaultValue="123 Industrial Area, Phase 1" />
                 </div>
               </div>
               
               <Button type="submit" disabled={saving} className="bg-indigo-600 text-white gap-2">
                 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Settings
               </Button>
            </form>
          )}

          {activeTab === "workflow" && (
            <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-6 space-y-6">
               <h3 className="text-lg font-semibold text-gray-900">Approval Workflow Thresholds</h3>
               <p className="text-sm text-gray-500">Configure value-based routing for PRs and POs.</p>
               
               <div className="space-y-4 max-w-lg border border-border rounded-xl p-4 bg-gray-50">
                 <div className="flex items-center gap-4">
                   <div className="flex-1 space-y-1.5">
                     <label className="text-sm font-medium text-gray-700">Value Less Than (₹)</label>
                     <Input defaultValue="50000" type="number" />
                   </div>
                   <div className="flex-1 space-y-1.5">
                     <label className="text-sm font-medium text-gray-700">Approver Role</label>
                     <Input defaultValue="PROCUREMENT_MANAGER" disabled />
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="flex-1 space-y-1.5">
                     <label className="text-sm font-medium text-gray-700">Value Above (₹)</label>
                     <Input defaultValue="50000" type="number" />
                   </div>
                   <div className="flex-1 space-y-1.5">
                     <label className="text-sm font-medium text-gray-700">Approver Role</label>
                     <Input defaultValue="ADMIN" disabled />
                   </div>
                 </div>
               </div>
               
               <Button type="submit" disabled={saving} className="bg-indigo-600 text-white gap-2">
                 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Workflows
               </Button>
            </form>
          )}

          {activeTab === "tally" && (
            <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-6 space-y-6">
               <h3 className="text-lg font-semibold text-gray-900">Tally Prime Integration</h3>
               <p className="text-sm text-gray-500">Connect VendorFlow directly to your local Tally XML server.</p>
               
               <div className="space-y-4 max-w-md">
                 <div className="space-y-1.5">
                   <label className="text-sm font-medium text-gray-700">Connector URL (Localhost)</label>
                   <Input defaultValue="http://localhost:9001" />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-sm font-medium text-gray-700">Tally Company Name</label>
                   <Input defaultValue="Acme Corp FY 24-25" />
                 </div>
               </div>
               
               <div className="flex items-center gap-3 pt-2">
                 <Button type="button" variant="outline" className="gap-2 border-indigo-200 text-indigo-700" onClick={handleTestTally} disabled={testingTally}>
                   {testingTally ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />} Test Connection
                 </Button>
                 <Button type="submit" disabled={saving} className="bg-indigo-600 text-white gap-2">
                   {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Settings
                 </Button>
               </div>
            </form>
          )}

          {activeTab === "users" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-6 space-y-6">
               <div className="flex justify-between items-center">
                 <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                 <Button size="sm" className="bg-indigo-600 text-white">Invite User</Button>
               </div>
               
               <div className="border border-border rounded-xl overflow-hidden">
                 <table className="w-full text-left text-sm">
                   <thead className="bg-gray-50 border-b border-border">
                     <tr>
                       <th className="px-4 py-2 font-medium">Email</th>
                       <th className="px-4 py-2 font-medium">Role</th>
                       <th className="px-4 py-2 font-medium">Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border">
                     <tr>
                       <td className="px-4 py-3">admin@vendorflow.com</td>
                       <td className="px-4 py-3"><span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs">ADMIN</span></td>
                       <td className="px-4 py-3"><span className="text-emerald-600 font-medium text-xs">Active</span></td>
                     </tr>
                     <tr>
                       <td className="px-4 py-3">procurement@vendorflow.com</td>
                       <td className="px-4 py-3"><span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">PROCUREMENT_MANAGER</span></td>
                       <td className="px-4 py-3"><span className="text-emerald-600 font-medium text-xs">Active</span></td>
                     </tr>
                   </tbody>
                 </table>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
