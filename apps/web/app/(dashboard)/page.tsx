"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  ShoppingCart,
  Users,
  CheckCircle,
  Plus,
  RefreshCw,
  ArrowRight,
  Clock,
  PhoneCall
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

// Mock data for MVP frontend wiring
const mockSummary = {
  prStatus: { draft: 2, pending: 5, approved: 10, rejected: 1 },
  poStatus: { draft: 1, sent: 3, acknowledged: 8, partially_received: 2, closed: 15 },
  pendingApprovals: 4,
  vendorsPendingQuotes: 3,
};

const mockRecentActivity = [
  { id: "1", type: "PR", ref: "PR-1001", action: "Submitted for approval", time: new Date(Date.now() - 1000 * 60 * 5) },
  { id: "2", type: "PO", ref: "PO-2023-005", action: "Acknowledged by Vendor", time: new Date(Date.now() - 1000 * 60 * 30) },
  { id: "3", type: "CALL", ref: "RFQ-900", action: "AI Call Completed (Quote Received)", time: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: "4", type: "APPROVAL", ref: "PR-1000", action: "Approved by Admin", time: new Date(Date.now() - 1000 * 60 * 60 * 5) },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    // In real implementation, call dashboardApi.getSummary()
    setTimeout(() => setLoading(false), 500);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your procurement activities"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl h-8 gap-1.5"
            onClick={loadDashboardData}
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </PageHeader>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/prs/create">
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
            <Plus className="w-4 h-4" /> Create PR
          </Button>
        </Link>
        <Link href="/vendors">
          <Button size="sm" variant="secondary" className="rounded-xl gap-2">
            <Plus className="w-4 h-4" /> Create Vendor
          </Button>
        </Link>
        <Link href="/approvals">
          <Button size="sm" variant="outline" className="rounded-xl gap-2 text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100">
            <CheckCircle className="w-4 h-4" /> View Pending Approvals
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* PRs */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-border">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-semibold">Purchase Requests</h3>
            </div>
            <Link href="/prs"><ArrowRight className="w-4 h-4 text-gray-400 hover:text-blue-600" /></Link>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-500">Draft:</span> <span className="font-medium">{mockSummary.prStatus.draft}</span></div>
            <div><span className="text-amber-500">Pending:</span> <span className="font-medium">{mockSummary.prStatus.pending}</span></div>
            <div><span className="text-emerald-500">Approved:</span> <span className="font-medium">{mockSummary.prStatus.approved}</span></div>
            <div><span className="text-red-500">Rejected:</span> <span className="font-medium">{mockSummary.prStatus.rejected}</span></div>
          </div>
        </motion.div>

        {/* POs */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-border">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <h3 className="font-semibold">Purchase Orders</h3>
            </div>
            <Link href="/pos"><ArrowRight className="w-4 h-4 text-gray-400 hover:text-emerald-600" /></Link>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-500">Draft:</span> <span className="font-medium">{mockSummary.poStatus.draft}</span></div>
            <div><span className="text-blue-500">Sent:</span> <span className="font-medium">{mockSummary.poStatus.sent}</span></div>
            <div><span className="text-indigo-500">Ack'd:</span> <span className="font-medium">{mockSummary.poStatus.acknowledged}</span></div>
            <div><span className="text-emerald-500">Closed:</span> <span className="font-medium">{mockSummary.poStatus.closed}</span></div>
          </div>
        </motion.div>

        {/* Approvals */}
        <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-border">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <CheckCircle className="w-4 h-4" />
              </div>
              <h3 className="font-semibold">Pending Approvals</h3>
            </div>
            <Link href="/approvals"><ArrowRight className="w-4 h-4 text-gray-400 hover:text-amber-600" /></Link>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {mockSummary.pendingApprovals}
          </div>
          <p className="text-xs text-gray-500 mt-1">Requires your action</p>
        </motion.div>

        {/* Quotes */}
        <motion.div {...fadeUp} transition={{ delay: 0.4 }} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-border">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="font-semibold">Pending Quotes</h3>
            </div>
            <Link href="/rfqs"><ArrowRight className="w-4 h-4 text-gray-400 hover:text-violet-600" /></Link>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {mockSummary.vendorsPendingQuotes}
          </div>
          <p className="text-xs text-gray-500 mt-1">Vendors currently being called by AI</p>
        </motion.div>
      </div>

      {/* Recent Activity List */}
      <motion.div {...fadeUp} transition={{ delay: 0.5 }} className="bg-white dark:bg-gray-900 rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
        </div>
        <div className="divide-y divide-border">
          {mockRecentActivity.map((act) => (
            <div key={act.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  act.type === 'PR' ? 'bg-blue-100 text-blue-600' :
                  act.type === 'PO' ? 'bg-emerald-100 text-emerald-600' :
                  act.type === 'CALL' ? 'bg-violet-100 text-violet-600' :
                  'bg-amber-100 text-amber-600'
                }`}>
                  {act.type === 'CALL' ? <PhoneCall className="w-4 h-4" /> :
                   act.type === 'APPROVAL' ? <CheckCircle className="w-4 h-4" /> :
                   <FileText className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{act.ref}</span>
                    <span className="text-gray-500 text-sm">— {act.action}</span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(act.time.toISOString())}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
