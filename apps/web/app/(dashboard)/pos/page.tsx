"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Search, Loader2, RefreshCw, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { formatRelativeTime, formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { purchaseOrdersApi } from "@/lib/api";

export default function POsPage() {
  const [pos, setPOs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchPOs = async () => {
    setLoading(true);
    try {
      const res = await purchaseOrdersApi.getAll({ search, status: statusFilter !== "all" ? statusFilter : undefined });
      setPOs(res.items || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load Purchase Orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, [search, statusFilter]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Purchase Orders"
        description="Track orders, sync with Tally, and follow up"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl h-8 gap-1.5" onClick={fetchPOs} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/pos/create">
            <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white h-8 gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              New PO
            </Button>
          </Link>
        </div>
      </PageHeader>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            placeholder="Search PO number or vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 rounded-xl text-sm border-gray-200"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(["all", "DRAFT", "PENDING", "CONFIRMED", "CANCELLED"] as const).map((s) => (
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
                <th className="px-4 py-3 font-medium">PO Number</th>
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Delivery Date</th>
                <th className="px-4 py-3 font-medium">Tally Sync</th>
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
              ) : pos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    No Purchase Orders found.
                  </td>
                </tr>
              ) : (
                pos.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3 font-medium text-indigo-600 font-mono">
                      <Link href={`/pos/${po.id}`}>{po.poNumber}</Link>
                    </td>
                    <td className="px-4 py-3">{po.vendor?.name || "—"}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(po.amount || po.totalValue || 0)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={po.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                       {po.expectedDelivery ? formatDate(po.expectedDelivery) : "—"}
                    </td>
                    <td className="px-4 py-3">
                       <StatusBadge status={po.tallySyncStatus || "NOT_SYNCED"} />
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
