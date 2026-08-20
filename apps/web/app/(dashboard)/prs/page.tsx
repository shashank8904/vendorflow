"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Search, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { formatRelativeTime, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { prsApi } from "@/lib/api";

export default function PRsPage() {
  const [prs, setPRs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchPRs = async () => {
    setLoading(true);
    try {
      const res = await prsApi.getAll();
      // Using items if paginated, or directly if array
      setPRs(res.items || res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load PRs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPRs();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Purchase Requests"
        description="Manage your indents and requests"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl h-8 gap-1.5" onClick={fetchPRs} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/prs/create">
            <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white h-8 gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              New PR
            </Button>
          </Link>
        </div>
      </PageHeader>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            placeholder="Search PR number..."
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
                <th className="px-4 py-3 font-medium">PR Number</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Required By</th>
                <th className="px-4 py-3 font-medium">Status</th>
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
              ) : prs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    No purchase requests found.
                  </td>
                </tr>
              ) : (
                prs.map((pr) => (
                  <tr key={pr.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3 font-medium text-indigo-600">
                      <Link href={`/prs/${pr.id}`}>{pr.prNumber}</Link>
                    </td>
                    <td className="px-4 py-3">{pr.department || "—"}</td>
                    <td className="px-4 py-3">{formatDate(pr.requiredByDate)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={pr.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatRelativeTime(pr.createdAt)}
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
