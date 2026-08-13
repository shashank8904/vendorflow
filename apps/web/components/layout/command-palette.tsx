"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  Users,
  ShoppingCart,
  Phone,
  BarChart3,
  Settings,
  ArrowRight,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const commands = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { id: "vendors", label: "Vendors", icon: Users, href: "/vendors" },
  { id: "new-vendor", label: "New Vendor", icon: Users, href: "/vendors/new" },
  { id: "purchase-orders", label: "Purchase Orders", icon: ShoppingCart, href: "/purchase-orders" },
  { id: "new-po", label: "New Purchase Order", icon: ShoppingCart, href: "/purchase-orders/new" },
  { id: "ai-calls", label: "AI Calls", icon: Phone, href: "/ai-calls" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/analytics" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

export function CommandPalette({ open, setOpen }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = query
    ? commands.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const navigate = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-border shadow-2xl overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, actions..."
                className="flex-1 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 bg-transparent outline-none"
              />
              <kbd className="text-xs text-gray-300 dark:text-gray-600 font-mono border border-border rounded px-1.5 py-0.5">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="py-2 max-h-72 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No results found</p>
              ) : (
                <>
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 px-4 py-1.5">
                    Navigation
                  </p>
                  {filtered.map((cmd) => (
                    <button
                      key={cmd.id}
                      onClick={() => navigate(cmd.href)}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left group"
                    >
                      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 transition-colors">
                        <cmd.icon className="w-3.5 h-3.5 text-gray-500 group-hover:text-indigo-600 dark:text-gray-400 dark:group-hover:text-indigo-400" />
                      </div>
                      {cmd.label}
                      <ArrowRight className="w-3.5 h-3.5 ml-auto text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <kbd className="border border-border rounded px-1 py-0.5 font-mono">↑↓</kbd>
                navigate
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <kbd className="border border-border rounded px-1 py-0.5 font-mono">↵</kbd>
                open
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
