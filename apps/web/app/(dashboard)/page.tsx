"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  ShoppingCart,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import {
  MOCK_STATS,
  MOCK_ACTIVITY,
  MOCK_ANALYTICS,
  MOCK_PURCHASE_ORDERS,
} from "@/lib/mock-data";
import { formatCurrency, formatRelativeTime, formatDate } from "@/lib/utils";
import { toast } from "sonner";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const stats = [
  {
    label: "Total Vendors",
    value: MOCK_STATS.totalVendors,
    icon: Users,
    trend: "+2",
    trendUp: true,
    color: "indigo",
    href: "/vendors",
  },
  {
    label: "Active POs",
    value: MOCK_STATS.activePOs,
    icon: ShoppingCart,
    trend: "+1",
    trendUp: true,
    color: "blue",
    href: "/purchase-orders",
  },
  {
    label: "Pending Calls",
    value: MOCK_STATS.pendingCalls,
    icon: Phone,
    trend: "-3",
    trendUp: false,
    color: "violet",
    href: "/ai-calls",
  },
  {
    label: "Delayed Orders",
    value: MOCK_STATS.delayedOrders,
    icon: AlertTriangle,
    trend: "Same",
    trendUp: null,
    color: "red",
    href: "/purchase-orders",
  },
  {
    label: "Today's Calls",
    value: MOCK_STATS.todayCompletedCalls,
    icon: CheckCircle2,
    trend: "+1",
    trendUp: true,
    color: "emerald",
    href: "/ai-calls",
  },
];

const colorMap: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
  red: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
};

const activityIconMap: Record<string, { icon: React.ElementType; color: string }> = {
  call: { icon: Phone, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-400" },
  po_update: { icon: ShoppingCart, color: "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400" },
  vendor_added: { icon: Users, color: "text-violet-600 bg-violet-50 dark:bg-violet-950 dark:text-violet-400" },
  alert: { icon: AlertTriangle, color: "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400" },
  success: { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400" },
};

export default function DashboardPage() {
  const pendingPOs = MOCK_PURCHASE_ORDERS.filter(
    (po) => po.status === "pending" || po.status === "delayed"
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Good morning, Suhas. Here's what's happening today."
      >
        <Button
          size="sm"
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white h-8 gap-1.5"
          onClick={() => toast.success("Starting AI Call session...")}
        >
          <Zap className="w-3.5 h-3.5" />
          Start AI Call
        </Button>
      </PageHeader>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ delay: i * 0.07, duration: 0.35 }}
          >
            <Link href={stat.href}>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-4 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[stat.color]}`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  {stat.trendUp !== null && (
                    <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.trendUp ? "text-emerald-600" : "text-red-500"}`}>
                      {stat.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stat.trend}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {stat.label}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly calls trend */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4, duration: 0.35 }}
          className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-border p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Monthly Call Trends</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Successful vs failed AI calls</p>
            </div>
            <span className="text-xs text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400 px-2 py-1 rounded-lg">
              ↑ 38% vs last month
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MOCK_ANALYTICS.monthlyTrend} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid hsl(var(--border))",
                  fontSize: "12px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                }}
              />
              <Bar dataKey="successful" name="Successful" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failed" name="Failed" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Call success pie */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.5, duration: 0.35 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5"
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Call Success Rate</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Last 30 days</p>
          </div>
          <div className="flex items-center justify-center mb-3">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={MOCK_ANALYTICS.callsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {MOCK_ANALYTICS.callsByStatus.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid hsl(var(--border))",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5">
            {MOCK_ANALYTICS.callsByStatus.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Activity + Pending follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.55, duration: 0.35 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            <Link href="/ai-calls" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_ACTIVITY.slice(0, 5).map((event, i) => {
              const { icon: Icon, color } = activityIconMap[event.type];
              return (
                <div key={event.id} className="flex gap-3">
                  <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{event.title}</p>
                      <span className="text-[10px] text-gray-400 shrink-0">{formatRelativeTime(event.timestamp)}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{event.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Pending follow-ups */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.6, duration: 0.35 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Pending Follow-ups</h3>
            <Link href="/purchase-orders" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {pendingPOs.map((po) => (
              <Link href={`/purchase-orders/${po.id}`} key={po.id}>
                <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className={`w-1.5 h-8 rounded-full shrink-0 ${po.status === "delayed" ? "bg-red-500" : "bg-amber-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">{po.poNumber}</span>
                      <StatusBadge status={po.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{po.vendorName}</span>
                      <span className="text-gray-300 dark:text-gray-700">·</span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{formatCurrency(po.amount)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 shrink-0">
                    <Clock className="w-3 h-3" />
                    {formatDate(po.expectedDelivery)}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick actions */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">Quick Actions</p>
            <div className="flex gap-2">
              <Link href="/vendors/new" className="flex-1">
                <Button variant="outline" size="sm" className="w-full rounded-xl text-xs h-8 gap-1.5">
                  <Plus className="w-3 h-3" />
                  Add Vendor
                </Button>
              </Link>
              <Link href="/purchase-orders/new" className="flex-1">
                <Button variant="outline" size="sm" className="w-full rounded-xl text-xs h-8 gap-1.5">
                  <Plus className="w-3 h-3" />
                  Create PO
                </Button>
              </Link>
              <Button
                size="sm"
                className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 gap-1.5"
                onClick={() => toast.success("Scheduling AI Call...")}
              >
                <Zap className="w-3 h-3" />
                AI Call
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
