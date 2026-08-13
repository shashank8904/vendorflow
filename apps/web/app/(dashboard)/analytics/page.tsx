"use client";

import { motion } from "framer-motion";
import {
  Phone,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
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
  LineChart,
  Line,
  Legend,
} from "recharts";
import { PageHeader } from "@/components/shared/page-header";
import { MOCK_ANALYTICS } from "@/lib/mock-data";
import { formatDuration } from "@/lib/utils";

const kpiCards = [
  {
    label: "Total Calls",
    value: MOCK_ANALYTICS.totalCalls,
    icon: Phone,
    color: "indigo",
    suffix: "",
  },
  {
    label: "Successful Calls",
    value: MOCK_ANALYTICS.successfulCalls,
    icon: CheckCircle2,
    color: "emerald",
    suffix: "",
  },
  {
    label: "Avg. Call Duration",
    value: formatDuration(MOCK_ANALYTICS.avgCallDuration),
    icon: Clock,
    color: "blue",
    suffix: "",
  },
  {
    label: "Success Rate",
    value: `${MOCK_ANALYTICS.callSuccessRate}%`,
    icon: TrendingUp,
    color: "violet",
    suffix: "",
  },
];

const colorMap: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
};

const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid hsl(var(--border))",
  fontSize: "12px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

const axisStyle = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Executive overview of your AI call performance and vendor metrics"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.3 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colorMap[card.color]}`}>
              <card.icon className="w-4.5 h-4.5" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly trend – area */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-border p-5"
        >
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Monthly Call Volume</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Successful, failed, and total calls over time</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MOCK_ANALYTICS.monthlyTrend}>
              <defs>
                <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
              <Area type="monotone" dataKey="successful" name="Successful" stroke="#10B981" fill="url(#colorSuccess)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="failed" name="Failed" stroke="#EF4444" fill="url(#colorFailed)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Call status breakdown – pie */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5"
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Call Status Breakdown</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={MOCK_ANALYTICS.callsByStatus}
                cx="50%"
                cy="50%"
                outerRadius={72}
                innerRadius={44}
                paddingAngle={3}
                dataKey="value"
              >
                {MOCK_ANALYTICS.callsByStatus.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {MOCK_ANALYTICS.callsByStatus.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {item.value} ({Math.round(item.value / MOCK_ANALYTICS.totalCalls * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Vendor response times – bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5"
        >
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Avg. Vendor Response Time</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Minutes to first response per vendor</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MOCK_ANALYTICS.vendorResponseTimes} barSize={28} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} unit="m" />
              <YAxis dataKey="vendor" type="category" tick={axisStyle} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} min`, "Avg Response"]} />
              <Bar dataKey="responseTime" name="Response Time" fill="#4F46E5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue at risk – line */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5"
        >
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Revenue At Risk</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Value of delayed or at-risk POs over time</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MOCK_ANALYTICS.revenueAtRisk}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`₹${Number(v).toLocaleString()}`, "At Risk"]} />
              <Line type="monotone" dataKey="value" name="Revenue at Risk" stroke="#EF4444" strokeWidth={2} dot={{ fill: "#EF4444", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
