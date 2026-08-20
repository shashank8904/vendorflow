"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";
import { purchaseOrdersApi } from "@/lib/api";

export default function CreatePOPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteId = searchParams.get("quoteId");
  
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Mock PO creation logic from quote for MVP
      const payload = {
        vendorId: "vendor-id-from-quote", // Mocked
        amount: 50000,
        description: "Generated from Quote " + quoteId,
      };
      
      const po = await purchaseOrdersApi.create(payload);
      toast.success("PO created successfully!");
      router.push(`/pos/${po.id || (po as any).data?.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create PO");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Button variant="link" onClick={() => router.back()} className="p-0 h-auto hover:text-indigo-600 flex items-center gap-1 text-gray-500">
          <ArrowLeft className="w-3 h-3" /> Back
        </Button>
      </div>
      
      <PageHeader
        title="Create Purchase Order"
        description="Convert the shortlisted quotation into a formal PO"
      />

      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-border space-y-4 text-center">
         <p className="text-gray-600 mb-4">
           You are creating a PO based on Quotation <span className="font-mono font-medium">{quoteId || "Manual"}</span>.
           <br/>In the full implementation, items and prices will be pre-filled here.
         </p>
         
         <Button type="button" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Creating..." : "Confirm & Create PO"}
        </Button>
      </div>
    </div>
  );
}
