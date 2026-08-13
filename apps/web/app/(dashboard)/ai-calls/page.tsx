"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileText,
  Bot,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { MOCK_AI_CALLS } from "@/lib/mock-data";
import { formatRelativeTime, formatDuration } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { CallStatus } from "@/lib/mock-data";

const PAGE_SIZE = 6;

function ConfidenceMeter({ value }: { value: number }) {
  if (value === 0) return <span className="text-xs text-gray-400">—</span>;
  const color = value >= 90 ? "bg-emerald-500" : value >= 75 ? "bg-amber-400" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{value}%</span>
    </div>
  );
}

export default function AICallsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const filtered = MOCK_AI_CALLS.filter((call) => {
    const matchSearch =
      call.vendorName.toLowerCase().includes(search.toLowerCase()) ||
      (call.poNumber ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || call.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statuses: CallStatus[] = ["completed", "failed", "in_progress", "scheduled", "no_answer"];

  return (
    <div className="space-y-4">
      <PageHeader
        title="AI Calls"
        description={`${MOCK_AI_CALLS.length} total calls managed by your AI agents`}
      >
        <Button
          size="sm"
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white h-8 gap-1.5"
          onClick={() => toast.success("Initiating new AI call...")}
        >
          <Phone className="w-3.5 h-3.5" />
          Start Call
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            placeholder="Search vendor or PO..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-8 h-8 rounded-xl text-sm"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => { setStatusFilter("all"); setPage(1); }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${statusFilter === "all" ? "bg-indigo-600 text-white" : "bg-white dark:bg-gray-900 border border-border text-gray-600 hover:bg-gray-50"}`}
          >
            All
          </button>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-indigo-600 text-white" : "bg-white dark:bg-gray-900 border border-border text-gray-600 hover:bg-gray-50"}`}
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
              {["Status", "Vendor", "PO Number", "Agent", "Started", "Duration", "Confidence", "Summary", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.map((call) => (
              <tr key={call.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3">
                  <StatusBadge status={call.status} />
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{call.vendorName}</span>
                </td>
                <td className="px-4 py-3">
                  {call.poNumber ? (
                    <Link href={`/purchase-orders/${call.poId}`} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-mono">
                      {call.poNumber}
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Bot className="w-3.5 h-3.5 text-indigo-500" />
                    {call.agentName}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                  {formatRelativeTime(call.startedAt)}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {call.duration > 0 ? formatDuration(call.duration) : "—"}
                </td>
                <td className="px-4 py-3">
                  <ConfidenceMeter value={call.aiConfidence} />
                </td>
                <td className="px-4 py-3 max-w-[200px]">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={call.summary}>
                    {call.summary || "—"}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link href={`/ai-calls/${call.id}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" title="View transcript">
                        <FileText className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    {(call.status === "failed" || call.status === "no_answer") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg text-indigo-500"
                        title="Retry call"
                        onClick={() => toast.success(`Retrying call to ${call.vendorName}...`)}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginated.length === 0 && (
          <div className="py-16 text-center text-sm text-gray-400">No calls found.</div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-gray-500 dark:text-gray-400">{filtered.length} calls</p>
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
