"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PhoneForwarded, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatRelativeTime, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { rfqsApi } from "@/lib/api";

export default function RFQDetailPage() {
  const params = useParams();
  const rfqId = params.id as string;

  const [rfq, setRfq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);

  useEffect(() => {
    const fetchRFQ = async () => {
      try {
        const res = await rfqsApi.getById(rfqId);
        setRfq(res.data || res);
      } catch (err: any) {
        toast.error("Failed to load RFQ");
      } finally {
        setLoading(false);
      }
    };
    fetchRFQ();
    
    // In MVP, we poll for updates every 5s if status is COLLECTING
    const interval = setInterval(() => {
      if (rfq?.status === "COLLECTING") {
        fetchRFQ();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [rfqId, rfq?.status]);

  const handleCollectQuotes = async () => {
    setCalling(true);
    try {
      await rfqsApi.collectQuotes(rfqId);
      toast.success("Voice AI campaign started!");
      const res = await rfqsApi.getById(rfqId);
      setRfq(res.data || res);
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger voice collection");
    } finally {
      setCalling(false);
    }
  };

  if (loading && !rfq) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!rfq) return <div className="text-center py-10">RFQ not found</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Link href="/rfqs" className="hover:text-indigo-600 flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Back to RFQs
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            RFQ-{rfq.id.substring(0, 6).toUpperCase()}
            <StatusBadge status={rfq.status} />
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Linked to PR: <Link href={`/prs/${rfq.prId}`} className="text-indigo-600 hover:underline">PR-{rfq.pr?.prNumber || rfq.prId?.substring(0,6).toUpperCase()}</Link>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {rfq.status === "SENT" && (
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              onClick={handleCollectQuotes}
              disabled={calling}
            >
              {calling ? <Loader2 className="w-4 h-4 animate-spin" /> : <PhoneForwarded className="w-4 h-4" />}
              Collect Quotes via AI
            </Button>
          )}
          {rfq.status === "COLLECTING" && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              AI Agent is calling vendors...
            </div>
          )}
        </div>
      </div>

      {/* PR Summary */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-border">
         <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Items Requesting Quote</h3>
         <div className="flex flex-wrap gap-4">
            {rfq.pr?.items?.map((item: any) => (
              <div key={item.id} className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                <div className="font-medium text-sm text-gray-900">{item.freeTextDescription}</div>
                <div className="text-xs text-gray-500">Qty: {item.quantity} {item.unit}</div>
              </div>
            ))}
         </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900 dark:text-white">Vendor Quotations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-xs text-gray-500 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium">Call Status</th>
                <th className="px-4 py-3 font-medium text-right">Price</th>
                <th className="px-4 py-3 font-medium text-right">Tax %</th>
                <th className="px-4 py-3 font-medium text-right">Total Cost</th>
                <th className="px-4 py-3 font-medium">Lead Time</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rfq.quotations?.length === 0 ? (
                 <tr><td colSpan={7} className="text-center py-8 text-gray-500">No quotes yet.</td></tr>
              ) : (
                rfq.quotations?.map((quote: any) => (
                  <tr key={quote.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3 font-medium">{quote.vendor?.name}</td>
                    <td className="px-4 py-3">
                       <StatusBadge status={quote.callStatus || (quote.status === "SUBMITTED" ? "COMPLETED" : "PENDING")} />
                    </td>
                    <td className="px-4 py-3 text-right">{formatCurrency(quote.totalPrice || 0)}</td>
                    <td className="px-4 py-3 text-right">{quote.taxPercent || 0}%</td>
                    <td className="px-4 py-3 text-right font-semibold text-indigo-600">
                      {formatCurrency((quote.totalPrice || 0) * (1 + (quote.taxPercent || 0)/100))}
                    </td>
                    <td className="px-4 py-3">{quote.leadTimeDays ? `${quote.leadTimeDays} days` : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      {quote.status === "SUBMITTED" ? (
                        <Link href={`/pos/create?quoteId=${quote.id}`}>
                           <Button size="sm" variant="outline" className="h-7 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                             <CheckCircle className="w-3 h-3 mr-1"/> Shortlist to PO
                           </Button>
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-400">Waiting</span>
                      )}
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
