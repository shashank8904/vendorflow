"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatRelativeTime, formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { prsApi } from "@/lib/api";

export default function PRDetailPage() {
  const params = useParams();
  const router = useRouter();
  const prId = params.id as string;

  const [pr, setPR] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPR = async () => {
      try {
        const res = await prsApi.getById(prId);
        setPR(res.data || res);
      } catch (err: any) {
        toast.error("Failed to load PR details");
      } finally {
        setLoading(false);
      }
    };
    fetchPR();
  }, [prId]);

  const handleSubmitPR = async () => {
    setSubmitting(true);
    try {
      await prsApi.submit(prId);
      toast.success("PR submitted for approval");
      // Reload PR
      const res = await prsApi.getById(prId);
      setPR(res.data || res);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit PR");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!pr) {
    return <div className="text-center py-10 text-gray-500">PR not found</div>;
  }

  const totalValue = pr.items?.reduce((acc: number, item: any) => acc + (item.quantity * (item.estimatedRate || 0)), 0) || 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Link href="/prs" className="hover:text-indigo-600 flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Back to PRs
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            {pr.prNumber}
            <StatusBadge status={pr.status} />
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Created {formatRelativeTime(pr.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pr.status === "DRAFT" && (
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              onClick={handleSubmitPR}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit for Approval
            </Button>
          )}
          {pr.status === "APPROVED" && (
            <Link href={`/rfqs/create?prId=${pr.id}`}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                Create RFQ
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-gray-50/50">
              <h3 className="font-semibold text-gray-900 dark:text-white">Line Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 text-xs text-gray-500 border-b border-border">
                  <tr>
                    <th className="px-4 py-2 font-medium">Item</th>
                    <th className="px-4 py-2 font-medium">Qty</th>
                    <th className="px-4 py-2 font-medium text-right">Est. Rate</th>
                    <th className="px-4 py-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pr.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">{item.freeTextDescription || item.item?.name}</td>
                      <td className="px-4 py-3">{item.quantity} {item.unit}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(item.estimatedRate || 0)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency((item.quantity * (item.estimatedRate || 0)))}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50/50 font-semibold">
                    <td colSpan={3} className="px-4 py-3 text-right text-gray-600">Total Estimated Value</td>
                    <td className="px-4 py-3 text-right text-indigo-600">{formatCurrency(totalValue)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Details Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Details</h3>
            
            <div>
              <p className="text-xs text-gray-500 mb-1">Department</p>
              <p className="font-medium text-gray-900 dark:text-white">{pr.department || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Required By</p>
              <p className="font-medium text-gray-900 dark:text-white">{pr.requiredByDate ? formatDate(pr.requiredByDate) : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 p-2 rounded-lg">{pr.notes || "No notes provided."}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-5 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Timeline</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-indigo-600 bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white border border-border p-3 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-sm text-gray-900">Created</div>
                    <time className="text-xs text-gray-500">{formatDate(pr.createdAt)}</time>
                  </div>
                </div>
              </div>
              
              {pr.status !== "DRAFT" && (
                 <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                 <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-indigo-600 bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                 <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white border border-border p-3 rounded-lg shadow-sm">
                   <div className="flex items-center justify-between mb-1">
                     <div className="font-medium text-sm text-gray-900">Submitted</div>
                   </div>
                 </div>
               </div>
              )}

              {pr.status === "APPROVED" && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-emerald-500 bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-emerald-50 border border-emerald-100 p-3 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-sm text-emerald-900 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Approved</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
