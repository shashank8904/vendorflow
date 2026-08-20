"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, PlayCircle, FileText, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatRelativeTime, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { callsApi } from "@/lib/api";

export default function CallDetailPage() {
  const params = useParams();
  const callId = params.id as string;

  const [call, setCall] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCall = async () => {
      try {
        const res = await callsApi.getById(callId);
        setCall(res.data || res);
      } catch (err: any) {
        toast.error("Failed to load Call details");
      } finally {
        setLoading(false);
      }
    };
    fetchCall();
  }, [callId]);

  if (loading && !call) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!call) return <div className="text-center py-10">Call not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Link href="/calls" className="hover:text-indigo-600 flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Back to Calls
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Call with {call.vendor?.name || "Unknown"}
            <StatusBadge status={call.status} />
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <span>Started {formatRelativeTime(call.createdAt)}</span>
            <span>&bull;</span>
            <span>{call.durationSeconds ? `${call.durationSeconds}s` : "—"}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
           {call.rfqId && (
             <Link href={`/rfqs/${call.rfqId}`} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100">
               View Related RFQ
             </Link>
           )}
           {call.purchaseOrderId && (
             <Link href={`/pos/${call.purchaseOrderId}`} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100">
               View Related PO
             </Link>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transcript Player */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-border bg-gray-50/50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-indigo-600" />
              Recording & Transcript
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
             {call.transcript ? (
               <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                 {call.transcript}
               </div>
             ) : (
               <div className="text-center text-gray-400 mt-10">
                 <FileText className="w-10 h-10 mx-auto mb-2 opacity-20" />
                 Transcript not available or call pending
               </div>
             )}
          </div>
        </div>

        {/* Extracted Insights */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5 space-y-6">
           <div className="border-b border-border pb-3">
             <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
               <CheckCircle className="w-4 h-4 text-emerald-600" />
               AI Insights
             </h3>
             <p className="text-xs text-gray-500">Data extracted by AI during the call</p>
           </div>
           
           {call.callResult ? (
             <div className="space-y-4">
               <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Summary / Disposition</p>
                  <p className="text-sm bg-gray-50 p-2 rounded">{call.callResult.summary || "—"}</p>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Status</p>
                    <StatusBadge status={call.callResult.accepted ? "ACCEPTED" : "REJECTED"} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Confidence</p>
                    <p className="text-sm font-semibold">{call.callResult.confidence ? `${(call.callResult.confidence * 100).toFixed(0)}%` : "—"}</p>
                  </div>
                  {call.callResult.deliveryDate && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Delivery Date</p>
                      <p className="text-sm">{call.callResult.deliveryDate}</p>
                    </div>
                  )}
                  {call.callResult.quantity && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Quantity Confirmed</p>
                      <p className="text-sm">{call.callResult.quantity}</p>
                    </div>
                  )}
               </div>
               
               {call.callResult.delayReason && (
                 <div>
                    <p className="text-xs font-medium text-red-500 mb-1">Exception / Delay Reason</p>
                    <p className="text-sm bg-red-50 p-2 rounded text-red-700">{call.callResult.delayReason}</p>
                 </div>
               )}
             </div>
           ) : (
             <div className="text-sm text-gray-500">No insights extracted yet.</div>
           )}
        </div>
      </div>
    </div>
  );
}
