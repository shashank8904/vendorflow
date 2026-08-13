"use client";

import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { use } from "react";
import {
  ArrowLeft,
  Bot,
  Phone,
  Calendar,
  Building2,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Package,
  Clock,
  ShoppingCart,
  Lightbulb,
  ExternalLink,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { MOCK_PURCHASE_ORDERS, MOCK_VENDORS, MOCK_AI_CALLS } from "@/lib/mock-data";
import { formatCurrency, formatDate, formatRelativeTime, formatDuration } from "@/lib/utils";
import { toast } from "sonner";

const timelineIconMap: Record<string, { icon: React.ElementType; color: string }> = {
  created: { icon: ShoppingCart, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400" },
  call: { icon: Phone, color: "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400" },
  update: { icon: CheckCircle2, color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
  delivery: { icon: Package, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" },
  issue: { icon: AlertTriangle, color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400" },
  resolved: { icon: CheckCircle2, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" },
};

export default function PODetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const po = MOCK_PURCHASE_ORDERS.find((p) => p.id === id);
  if (!po) notFound();

  const vendor = MOCK_VENDORS.find((v) => v.id === po.vendorId);
  const calls = MOCK_AI_CALLS.filter((c) => c.poId === po.id);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/purchase-orders">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white font-mono">{po.poNumber}</h1>
            <StatusBadge status={po.status} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Created {formatRelativeTime(po.createdAt)} · Last updated {formatRelativeTime(po.updatedAt)}
          </p>
        </div>
        <Button
          size="sm"
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white h-8 gap-1.5"
          onClick={() => toast.success("Scheduling AI follow-up call...")}
        >
          <Zap className="w-3.5 h-3.5" />
          Start Follow-up
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left – timeline + calls */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order info */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Order Information</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Amount", value: formatCurrency(po.amount), icon: ShoppingCart },
                { label: "Expected Delivery", value: formatDate(po.expectedDelivery), icon: Calendar },
                { label: "Assigned Agent", value: po.assignedAgent, icon: Bot },
                { label: "Description", value: po.description, icon: Package },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label}>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">Order Timeline</h3>
            <div className="space-y-4">
              {po.timeline.map((event, i) => {
                const { icon: Icon, color } = timelineIconMap[event.type];
                const isLast = i === po.timeline.length - 1;
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    className="flex gap-3"
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      {!isLast && <div className="w-px flex-1 bg-border mt-2" />}
                    </div>
                    <div className={`pb-${isLast ? "0" : "4"} flex-1`}>
                      <div className="flex items-baseline gap-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{event.title}</p>
                        <span className="text-xs text-gray-400">{formatRelativeTime(event.timestamp)}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{event.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">by {event.actor}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* AI Call History */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">AI Call History</h3>
            {calls.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">No calls yet for this PO.</p>
            ) : (
              <div className="space-y-2">
                {calls.map((call) => (
                  <Link href={`/ai-calls/${call.id}`} key={call.id}>
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{call.agentName}</span>
                          <StatusBadge status={call.status} />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{call.summary}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-500">{formatRelativeTime(call.startedAt)}</p>
                        {call.duration > 0 && (
                          <p className="text-xs text-gray-400">{formatDuration(call.duration)}</p>
                        )}
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right – vendor + AI insights */}
        <div className="space-y-4">
          {/* Vendor info */}
          {vendor && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Vendor</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {vendor.companyName[0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{vendor.companyName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{vendor.contactPerson}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Phone className="w-3.5 h-3.5" />
                  {vendor.phone}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Mail className="w-3.5 h-3.5" />
                  {vendor.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  Last contact {formatRelativeTime(vendor.lastContact)}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">Response Rate</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{vendor.responseRate}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${vendor.responseRate}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* AI Insights */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
                <Lightbulb className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI Insights</h3>
            </div>
            <div className="space-y-2">
              {po.aiInsights.map((insight, i) => (
                <div key={i} className="flex gap-2 text-xs text-gray-600 dark:text-gray-400 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <span className="text-indigo-500 shrink-0">→</span>
                  {insight}
                </div>
              ))}
            </div>
          </div>

          {/* Delivery status */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Delivery Status</h3>
            <div className="flex items-center gap-2 mb-3">
              <StatusBadge status={po.status} />
              <span className="text-xs text-gray-500">·</span>
              <span className="text-xs text-gray-500">{formatDate(po.expectedDelivery)}</span>
            </div>
            {po.status === "delayed" && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-400 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Delay Detected
                </div>
                <p className="text-xs text-red-600 dark:text-red-400">
                  This order is past its expected delivery date. AI follow-up is recommended.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
