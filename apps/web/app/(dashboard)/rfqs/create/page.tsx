"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";
import { prsApi, rfqsApi, vendorsApi } from "@/lib/api";

export default function CreateRFQPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prId = searchParams.get("prId");
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pr, setPR] = useState<any>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!prId) {
      toast.error("PR ID is required to create an RFQ");
      router.push("/prs");
      return;
    }

    const loadData = async () => {
      try {
        const [prRes, vendorRes] = await Promise.all([
          prsApi.getById(prId),
          vendorsApi.getAll({ limit: 100, status: "ACTIVE" })
        ]);
        setPR(prRes.data || prRes);
        setVendors(vendorRes.items || vendorRes.data || []);
      } catch (err: any) {
        toast.error("Failed to load PR or vendors");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [prId, router]);

  const handleToggleVendor = (id: string) => {
    if (selectedVendors.includes(id)) {
      setSelectedVendors(selectedVendors.filter(v => v !== id));
    } else {
      setSelectedVendors([...selectedVendors, id]);
    }
  };

  const handleSubmit = async () => {
    if (selectedVendors.length === 0) {
      toast.error("Please select at least one vendor");
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        prId,
        vendorIds: selectedVendors,
        notes
      };
      
      const rfq = await rfqsApi.create(payload);
      toast.success("RFQ created successfully!");
      router.push(`/rfqs/${rfq.id || rfq.data?.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create RFQ");
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Link href={`/prs/${prId}`} className="hover:text-indigo-600 flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Back to PR
        </Link>
      </div>
      
      <PageHeader
        title="Create RFQ"
        description="Select vendors and configure the Request for Quotation"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PR Summary */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-border space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white border-b border-border pb-2">PR Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">PR Number:</span>
              <span className="font-medium">{pr?.prNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Department:</span>
              <span className="font-medium">{pr?.department || "—"}</span>
            </div>
          </div>
          
          <h4 className="font-medium text-sm text-gray-900 dark:text-white mt-4 pt-4 border-t border-border">Items to quote:</h4>
          <ul className="space-y-2">
            {pr?.items?.map((item: any) => (
              <li key={item.id} className="text-sm flex justify-between bg-gray-50 p-2 rounded">
                <span>{item.freeTextDescription}</span>
                <span className="font-medium">{item.quantity} {item.unit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Vendor Selection */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-border space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Select Vendors</h3>
            <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
              {selectedVendors.length} selected
            </span>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {vendors.map((v) => (
              <label key={v.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedVendors.includes(v.id) 
                  ? "border-indigo-600 bg-indigo-50/50" 
                  : "border-gray-200 hover:bg-gray-50"
              }`}>
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-indigo-600 rounded"
                  checked={selectedVendors.includes(v.id)}
                  onChange={() => handleToggleVendor(v.id)}
                />
                <div>
                  <div className="font-medium text-sm text-gray-900">{v.name}</div>
                  <div className="text-xs text-gray-500">{v.category || "General"}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        <Button type="button" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Creating..." : "Create RFQ"}
        </Button>
      </div>
    </div>
  );
}
