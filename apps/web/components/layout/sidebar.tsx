"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Phone,
  History,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/vendors", icon: Users, label: "Vendors" },
  { href: "/purchase-orders", icon: ShoppingCart, label: "Purchase Orders" },
  { href: "/ai-calls", icon: Phone, label: "AI Calls" },
  { href: "/call-history", icon: History, label: "Call History" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen border-r border-border bg-white dark:bg-gray-950 shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-border shrink-0">
        <Link href="/" className="flex items-center gap-2.5 min-w-max">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-base text-gray-900 dark:text-white tracking-tight overflow-hidden whitespace-nowrap"
              >
                VendorFlow
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return collapsed ? (
            <Tooltip key={item.href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center justify-center h-9 w-9 mx-auto rounded-lg transition-all",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 h-9 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                isActive
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-border shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center justify-center w-full h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors text-sm",
            !collapsed && "gap-1.5"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
