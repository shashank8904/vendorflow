"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  ShoppingCart,
  Clock,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Building2,
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
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  analyticsApi,
  type MonthlyOrderItem,
  type VendorPerformanceItem,
  type DelayAnalysisData,
  type StatusDistributionItem,
} from "@/lib/api";

const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid hsl(var(--border))",
  fontSize: "12px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  background: "hsl(var(--background))",
};

const axisStyle = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AnalyticsPage() {
  const [monthlyOrders, setMonthlyOrders] = useState<MonthlyOrderItem[]>([]);
  const [vendorPerformance, setVendorPerformance] = useState<VendorPerformanceItem[]>([]);
  const [delayAnalysis, setDelayAnalysis] = useState<DelayAnalysisData | null>(null);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistributionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [monthly, vendors, delays, status] = await Promise.all([
        analyticsApi.getMonthlyOrders(),
        analyticsApi.getVendorPerformance(),
        analyticsApi.getDelayAnalysis(),
        analyticsApi.getStatusDistribution(),
      ]);
      setMonthlyOrders(monthly);
      setVendorPerformance(vendors);
      setDelayAnalysis(delays);
      setStatusDistribution(status);
    } catch (err: any) {
      toast.error(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const totalRevenue = monthlyOrders.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalOrders = monthlyOrders.reduce((sum, item) => sum + item.count, 0);

  const kpis = [
    {
      label: "Total Orders Analyzed",
      value: totalOrders,
      icon: ShoppingCart,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950",
    },
    {
      label: "Analyzed Pipeline Revenue",
      value: formatCurrency(totalRevenue),
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      label: "Delayed Orders",
      value: delayAnalysis?.totalDelayed ?? 0,
      icon: AlertTriangle,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950",
    },
    {
      label: "Average Delay Days",
      value: `${delayAnalysis?.averageDelayDays ?? 0} days`,
      icon: Clock,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Reporting"
        description="Business intelligence, vendor delivery performance, and revenue trends"
      >
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl h-8 gap-1.5"
          onClick={loadAnalytics}
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.bg}`}
            >
              <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : card.value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Order Trends */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Monthly Order Trends
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Orders placed over the last 12 months
            </p>
          </div>
          <div className="h-64">
            {monthlyOrders.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyOrders}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={axisStyle} />
                  <YAxis tick={axisStyle} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                No monthly data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Order Status Distribution
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Breakdown by fulfillment status
            </p>
          </div>
          <div className="h-64">
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name || ""} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                No orders available for distribution chart.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vendor Performance Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Vendor Fulfillment & Volume Summary
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Total purchase volume and order history per vendor
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/75 dark:bg-gray-800/50 text-xs text-gray-500 border-b border-border">
              <tr>
                <th className="px-4 py-2.5 font-medium">Vendor</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Total Orders</th>
                <th className="px-4 py-2.5 font-medium">Total Value</th>
                <th className="px-4 py-2.5 font-medium">Status Breakdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vendorPerformance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-400">
                    No vendor performance data found.
                  </td>
                </tr>
              ) : (
                vendorPerformance.map((vp) => (
                  <tr key={vp.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      {vp.name}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={vp.status} />
                    </td>
                    <td className="px-4 py-3">{vp.totalOrders}</td>
                    <td className="px-4 py-3 font-semibold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(vp.totalValue)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {Object.entries(vp.statusDistribution).map(([k, v]) => (
                        <span key={k} className="mr-2">
                          {k}: {v}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
