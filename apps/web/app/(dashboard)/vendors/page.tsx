"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Plus,
  MoreHorizontal,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2,
  Building2,
  RefreshCw,
  DownloadCloud
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
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
import { vendorsApi, tallyApi, type Vendor, type PaginationMeta } from "@/lib/api";

const PAGE_SIZE = 8;

// Extracted from requirements: Name, Code, GSTIN, Category, Primary Contact, Phone, Rating, Tally Sync Status.
export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tallySyncFilter, setTallySyncFilter] = useState<string>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  const fetchVendors = useCallback(async (page = 1, currentSearch = search, currentStatus = statusFilter) => {
    setLoading(true);
    try {
      const res = await vendorsApi.getAll({
        page,
        limit: PAGE_SIZE,
        search: currentSearch || undefined,
        status: currentStatus !== "all" ? currentStatus : undefined,
        sort: "createdAt",
        order: "desc",
      });
      // In MVP, we might mock this array if the real API isn't populated
      setVendors(res.items || []);
      setPagination(res.pagination || { page: 1, totalPages: 1, totalItems: 0 });
    } catch (err: any) {
      toast.error(err.message || "Failed to load vendors");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVendors(1, search, statusFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, fetchVendors]);

  const handleImportTally = async () => {
    setImporting(true);
    try {
      await tallyApi.importVendors();
      toast.success("Vendors imported successfully from Tally");
      fetchVendors(1);
    } catch (err: any) {
      toast.error(err.message || "Tally import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await vendorsApi.delete(id);
      toast.success("Vendor deleted successfully");
      fetchVendors(pagination.page);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete vendor");
    }
  };

  return (
    <>
      <div className="space-y-4">
        <PageHeader
          title="Vendors"
          description={`${pagination.totalItems} vendor${pagination.totalItems === 1 ? "" : "s"} in your directory`}
        >
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-8 gap-1.5 border-green-200 text-green-700 hover:bg-green-50"
              onClick={handleImportTally}
              disabled={importing}
            >
              <DownloadCloud className={`w-3.5 h-3.5 ${importing ? "animate-bounce" : ""}`} />
              Import from Tally
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-8 gap-1.5"
              onClick={() => fetchVendors(pagination.page)}
              disabled={loading}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white h-8 gap-1.5"
              onClick={() => setDrawerOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Vendor
            </Button>
          </div>
        </PageHeader>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              placeholder="Search by name, code, GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 rounded-xl text-sm border-gray-200"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 mr-1">Status:</span>
            {(["all", "ACTIVE", "INACTIVE"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-indigo-600 text-white"
                    : "bg-white dark:bg-gray-900 border border-border text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 ml-4">
            <span className="text-xs text-gray-500 mr-1">Tally Sync:</span>
            {(["all", "NOT_SYNCED", "SYNCED"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setTallySyncFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  tallySyncFilter === s
                    ? "bg-emerald-600 text-white"
                    : "bg-white dark:bg-gray-900 border border-border text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s === "all" ? "All" : s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/75 dark:bg-gray-800/50 border-b border-border text-xs text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Name / Code</th>
                  <th className="px-4 py-3 font-medium">GSTIN</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Primary Contact</th>
                  <th className="px-4 py-3 font-medium">Tally Sync</th>
                  <th className="px-4 py-3 font-medium">Rating</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && vendors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                      Loading vendors...
                    </td>
                  </tr>
                ) : vendors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      No vendors found. Click "Add Vendor" or "Import from Tally".
                    </td>
                  </tr>
                ) : (
                  vendors.map((vendor) => (
                    <tr
                      key={vendor.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link href={`/vendors/${vendor.id}`}>
                          <div className="font-semibold text-indigo-600 hover:underline">
                            {vendor.name}
                          </div>
                        </Link>
                        {vendor.code && (
                          <div className="text-xs text-gray-400 font-mono">
                            {vendor.code}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-mono text-xs">
                        {vendor.gstNumber || vendor.gstin || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {vendor.category ? (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{vendor.category}</span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{vendor.contactPerson || vendor.primaryContactName || "—"}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <Phone className="w-3 h-3" /> {vendor.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={vendor.tallySyncStatus || "NOT_SYNCED"} />
                      </td>
                      <td className="px-4 py-3">
                        {vendor.rating ? (
                          <div className="flex items-center text-amber-500 font-medium text-xs">
                            ★ {vendor.rating.toFixed(1)}
                          </div>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(vendor.phone)}>
                              Copy Phone
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 gap-1.5"
                              onClick={() => handleDelete(vendor.id, vendor.name)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-gray-500">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} items)
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  disabled={!pagination.hasPreviousPage || loading}
                  onClick={() => fetchVendors(pagination.page - 1)}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  disabled={!pagination.hasNextPage || loading}
                  onClick={() => fetchVendors(pagination.page + 1)}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <VendorDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() => fetchVendors(1)}
      />
    </>
  );
}
