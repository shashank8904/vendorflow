"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, HardDrive, PhoneForwarded } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatRelativeTime, formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { purchaseOrdersApi, tallyApi } from "@/lib/api";

export default function PODetailPage() {
  const params = useParams();
  const poId = params.id as string;

  const [po, setPO] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchPO = async () => {
    try {
      const res = await purchaseOrdersApi.getById(poId);
      setPO(res.data || res);
    } catch (err: any) {
      toast.error("Failed to load PO");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPO();
  }, [poId]);

  const handleSyncToTally = async () => {
    setSyncing(true);
    try {
      await tallyApi.syncPO(poId);
      toast.success("Purchase Order synced to Tally successfully");
      fetchPO();
    } catch (err: any) {
      toast.error(err.message || "Failed to sync to Tally");
    } finally {
      setSyncing(false);
    }
  };

  if (loading && !po) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!po) return <div className="text-center py-10">PO not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Link href="/pos" className="hover:text-indigo-600 flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Back to Purchase Orders
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 font-mono">
            {po.poNumber}
            <StatusBadge status={po.status} />
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Vendor: <span className="font-medium text-gray-800">{po.vendor?.name}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
           <Button variant="outline" className="gap-2">
             <PhoneForwarded className="w-4 h-4" /> Trigger Follow-up AI Call
           </Button>
          {(po.status === "APPROVED" || po.status === "CONFIRMED") && po.tallySyncStatus !== "SYNCED" && (
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              onClick={handleSyncToTally}
              disabled={syncing}
            >
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
              Sync to Tally
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5">
             <h3 className="font-semibold text-gray-900 dark:text-white border-b border-border pb-2 mb-3">Overview</h3>
             <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                   <p className="text-gray-500 mb-1">Total Value</p>
                   <p className="font-semibold text-xl text-indigo-600">{formatCurrency(po.amount || po.totalValue || 0)}</p>
                </div>
                <div>
                   <p className="text-gray-500 mb-1">Expected Delivery</p>
                   <p className="font-medium text-gray-900">{po.expectedDelivery ? formatDate(po.expectedDelivery) : "—"}</p>
                </div>
             </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5">
             <h3 className="font-semibold text-gray-900 dark:text-white border-b border-border pb-2 mb-3">Tally Integration</h3>
             <div className="flex items-center gap-3">
               <StatusBadge status={po.tallySyncStatus || "NOT_SYNCED"} />
               {po.tallySyncStatus === "SYNCED" && (
                 <span className="text-sm text-gray-500">Synced to ledger on {formatRelativeTime(po.updatedAt)}</span>
               )}
             </div>
             {po.tallySyncStatus === "FAILED" && (
                <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800">
                  Sync failed: Check Tally connection or ledger mapping.
                </div>
             )}
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5">
             <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Follow-up Status</h3>
             <div className="flex items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-100">
               <div className="text-center">
                 <div className="text-gray-400 mb-2"><PhoneForwarded className="w-8 h-8 mx-auto" /></div>
                 <div className="font-medium text-gray-900 text-sm">Not Called Yet</div>
                 <p className="text-xs text-gray-500 mt-1">AI agent will call vendor near delivery date</p>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
