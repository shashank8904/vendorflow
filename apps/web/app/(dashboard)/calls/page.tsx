"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Loader2, RefreshCw, PhoneCall, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import { callsApi } from "@/lib/api";

export default function CallsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const res = await callsApi.getAll({ search, status: statusFilter !== "all" ? statusFilter : undefined } as any);
      setCalls(res.items || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load Call Logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, [search, statusFilter]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Voice AI Call Logs"
        description="Review transcripts and extracted data from AI interactions"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl h-8 gap-1.5" onClick={fetchCalls} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </PageHeader>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            placeholder="Search vendor or ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 rounded-xl text-sm border-gray-200"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-gray-400 mr-1" />
          {(["all", "COMPLETED", "FAILED", "PENDING"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-900 border border-border text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/75 dark:bg-gray-800/50 border-b border-border text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium">Related Ref</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Intent</th>
                <th className="px-4 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    Loading...
                  </td>
                </tr>
              ) : calls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <PhoneCall className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    No call logs found.
                  </td>
                </tr>
              ) : (
                calls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 cursor-pointer">
                    <td className="px-4 py-3 font-medium text-indigo-600">
                      <Link href={`/calls/${call.id}`}>{call.vendor?.name || "Unknown"}</Link>
                    </td>
                    <td className="px-4 py-3">
                      {call.rfqId ? `RFQ-${call.rfqId.substring(0,6).toUpperCase()}` : 
                       call.purchaseOrderId ? `PO-${call.purchaseOrderId.substring(0,6).toUpperCase()}` : "—"}
                    </td>
                    <td className="px-4 py-3">{call.durationSeconds ? `${call.durationSeconds}s` : "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={call.status} />
                    </td>
                    <td className="px-4 py-3">
                       <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                         {call.callResult?.summary || call.intent || "Quote Collection"}
                       </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                       {formatRelativeTime(call.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
