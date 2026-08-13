"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  MoreHorizontal,
  Phone,
  Mail,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { MOCK_VENDORS } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/utils";
import { VendorDrawer } from "@/components/vendors/vendor-drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const PAGE_SIZE = 5;

export default function VendorsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = MOCK_VENDORS.filter((v) => {
    const matchesSearch =
      v.companyName.toLowerCase().includes(search.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div className="space-y-4">
        <PageHeader
          title="Vendors"
          description={`${MOCK_VENDORS.length} vendors in your network`}
        >
          <Button
            size="sm"
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white h-8 gap-1.5"
            onClick={() => setDrawerOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Vendor
          </Button>
        </PageHeader>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-8 h-8 rounded-xl text-sm border-gray-200"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {(["all", "active", "inactive", "on_hold"] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-indigo-600 text-white"
                    : "bg-white dark:bg-gray-900 border border-border text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {s === "all" ? "All" : s === "on_hold" ? "On Hold" : s.charAt(0).toUpperCase() + s.slice(1)}
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
                {["Vendor", "Phone", "Email", "Status", "Last Contact", "Open POs", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.map((vendor) => (
                <tr
                  key={vendor.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {vendor.companyName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
                          {vendor.companyName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {vendor.contactPerson}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="w-3 h-3" />
                      {vendor.phone}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-3 h-3" />
                      {vendor.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={vendor.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {formatRelativeTime(vendor.lastContact)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {vendor.openPurchaseOrders}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem render={
                          <Link href={`/purchase-orders?vendor=${vendor.id}`} className="flex items-center gap-2">
                            <ExternalLink className="w-3.5 h-3.5" />
                            View Orders
                          </Link>
                        } />
                        <DropdownMenuItem
                          onClick={() => toast.success(`Calling ${vendor.companyName}...`)}
                          className="flex items-center gap-2"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Start AI Call
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setDrawerOpen(true)} className="flex items-center gap-2">
                          Edit Vendor
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 dark:text-red-400">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paginated.length === 0 && (
            <div className="py-16 text-center text-sm text-gray-400">
              No vendors found matching your search.
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {filtered.length} vendor{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
                {page} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <VendorDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
