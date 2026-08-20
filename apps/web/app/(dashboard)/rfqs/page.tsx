"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Search, Loader2, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import { rfqsApi } from "@/lib/api";

export default function RFQsPage() {
  const [rfqs, setRFQs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchRFQs = async () => {
    setLoading(true);
    try {
      const res = await rfqsApi.getAll();
      setRFQs(res.items || res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load RFQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Request For Quotations (RFQ)"
        description="Manage quotes collection via AI"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl h-8 gap-1.5" onClick={fetchRFQs} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/prs">
            <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white h-8 gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Create from PR
            </Button>
          </Link>
        </div>
      </PageHeader>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            placeholder="Search RFQ ID or PR..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 rounded-xl text-sm border-gray-200"
          />
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
                <th className="px-4 py-3 font-medium">RFQ ID</th>
                <th className="px-4 py-3 font-medium">Linked PR</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Vendors Target</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    Loading...
                  </td>
                </tr>
              ) : rfqs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    No RFQs found. Create an RFQ from an approved Purchase Request.
                  </td>
                </tr>
              ) : (
                rfqs.map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3 font-medium text-indigo-600">
                      <Link href={`/rfqs/${rfq.id}`}>RFQ-{rfq.id.substring(0, 6).toUpperCase()}</Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{rfq.prId ? `PR-${rfq.prId.substring(0,6).toUpperCase()}` : "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={rfq.status} />
                    </td>
                    <td className="px-4 py-3">
                       {rfq.quotations?.length || 0} Vendors
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatRelativeTime(rfq.createdAt)}
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
