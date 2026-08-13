"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Bot,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { MOCK_PURCHASE_ORDERS } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { POStatus } from "@/lib/mock-data";

const PAGE_SIZE = 5;
const statuses: POStatus[] = ["pending", "confirmed", "delayed", "cancelled", "delivered"];

export default function PurchaseOrdersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = MOCK_PURCHASE_ORDERS.filter((po) => {
    const matchSearch =
      po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      po.vendorName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || po.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Purchase Orders"
        description={`${MOCK_PURCHASE_ORDERS.length} purchase orders total`}
      >
        <Link href="/purchase-orders/new">
          <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white h-8 gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Create PO
          </Button>
        </Link>
      </PageHeader>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            placeholder="Search PO number or vendor..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-8 h-8 rounded-xl text-sm border-gray-200"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => { setStatusFilter("all"); setPage(1); }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-gray-900 border border-border text-gray-600 dark:text-gray-400 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
                statusFilter === s
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-900 border border-border text-gray-600 dark:text-gray-400 hover:bg-gray-50"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-border overflow-hidden"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["PO Number", "Vendor", "Amount", "Expected Delivery", "Status", "Assigned Agent", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.map((po) => (
              <tr key={po.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/purchase-orders/${po.id}`} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-mono">
                    {po.poNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-900 dark:text-white">{po.vendorName}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(po.amount)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm ${po.status === "delayed" ? "text-red-600 font-medium" : "text-gray-500 dark:text-gray-400"}`}>
                    {formatDate(po.expectedDelivery)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={po.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Bot className="w-3.5 h-3.5 text-indigo-500" />
                    {po.assignedAgent}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem asChild>
                        <Link href={`/purchase-orders/${po.id}`}>View Details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success("Initiating AI follow-up call...")}>
                        Start AI Follow-up
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 dark:text-red-400">
                        Cancel PO
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginated.length === 0 && (
          <div className="py-16 text-center text-sm text-gray-400">No purchase orders found.</div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-gray-500 dark:text-gray-400">{filtered.length} orders</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[60px] text-center">{page} / {totalPages || 1}</span>
            <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
