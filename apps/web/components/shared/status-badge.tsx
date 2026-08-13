"use client";

import { cn } from "@/lib/utils";
import type { VendorStatus, POStatus, CallStatus } from "@/lib/mock-data";

type StatusVariant = VendorStatus | POStatus | CallStatus | string;

const statusConfig: Record<string, { label: string; className: string }> = {
  // Vendor status
  active: { label: "Active", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-400" },
  inactive: { label: "Inactive", className: "bg-gray-50 text-gray-600 ring-gray-500/20 dark:bg-gray-800 dark:text-gray-400" },
  on_hold: { label: "On Hold", className: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-400" },
  // PO status
  pending: { label: "Pending", className: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950 dark:text-blue-400" },
  confirmed: { label: "Confirmed", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-400" },
  delayed: { label: "Delayed", className: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950 dark:text-red-400" },
  cancelled: { label: "Cancelled", className: "bg-gray-50 text-gray-600 ring-gray-500/20 dark:bg-gray-800 dark:text-gray-400" },
  delivered: { label: "Delivered", className: "bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-950 dark:text-indigo-400" },
  // Call status
  completed: { label: "Completed", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-400" },
  failed: { label: "Failed", className: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950 dark:text-red-400" },
  in_progress: { label: "In Progress", className: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950 dark:text-blue-400" },
  scheduled: { label: "Scheduled", className: "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-950 dark:text-violet-400" },
  no_answer: { label: "No Answer", className: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-400" },
};

interface StatusBadgeProps {
  status: StatusVariant;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
