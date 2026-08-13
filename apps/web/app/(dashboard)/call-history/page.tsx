"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, FileText, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { MOCK_AI_CALLS } from "@/lib/mock-data";
import { formatRelativeTime, formatDuration } from "@/lib/utils";

export default function CallHistoryPage() {
  const completed = MOCK_AI_CALLS.filter(
    (c) => c.status === "completed" || c.status === "failed" || c.status === "no_answer"
  ).sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  const stats = [
    { label: "Total Calls", value: completed.length, icon: Phone, color: "indigo" },
    { label: "Successful", value: completed.filter((c) => c.status === "completed").length, icon: CheckCircle2, color: "emerald" },
    { label: "Failed", value: completed.filter((c) => c.status === "failed").length, icon: XCircle, color: "red" },
    { label: "No Answer", value: completed.filter((c) => c.status === "no_answer").length, icon: AlertCircle, color: "amber" },
  ];

  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    red: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Call History"
        description="Complete history of all AI calls made by your agents"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.3 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-4"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${colorMap[s.color]}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">All Calls</h3>
        <div className="space-y-3">
          {completed.map((call, i) => (
            <motion.div
              key={call.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
            >
              <Link href={`/ai-calls/${call.id}`}>
                <div className="flex items-center gap-4 p-3.5 rounded-xl border border-border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{call.vendorName}</span>
                      <StatusBadge status={call.status} />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{call.summary}</p>
                  </div>
                  <div className="text-right shrink-0 space-y-0.5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatRelativeTime(call.startedAt)}</p>
                    {call.duration > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 justify-end">
                        <Clock className="w-3 h-3" />
                        {formatDuration(call.duration)}
                      </div>
                    )}
                  </div>
                  <FileText className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
