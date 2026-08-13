"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/page-header";
import { MOCK_VENDORS } from "@/lib/mock-data";
import { toast } from "sonner";

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Purchase order created", { description: "AI agent will follow up automatically." });
    setLoading(false);
    router.push("/purchase-orders");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/purchase-orders">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <PageHeader title="New Purchase Order" description="Create a purchase order and assign an AI agent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Vendor *</Label>
            <select
              required
              className="w-full h-9 rounded-xl border border-border bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white"
            >
              <option value="">Select a vendor...</option>
              {MOCK_VENDORS.map((v) => (
                <option key={v.id} value={v.id}>{v.companyName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">PO Number *</Label>
              <Input required placeholder="PO-2025-0050" className="h-9 rounded-xl text-sm font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Amount (₹) *</Label>
              <Input required type="number" placeholder="250000" className="h-9 rounded-xl text-sm" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Expected Delivery *</Label>
            <Input required type="date" className="h-9 rounded-xl text-sm" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Description</Label>
            <Textarea
              placeholder="Describe the items, quantities, and any special requirements..."
              rows={3}
              className="rounded-xl text-sm resize-none"
            />
          </div>

          <div className="pt-2 flex items-center gap-2 justify-end">
            <Link href="/purchase-orders">
              <Button variant="outline" type="button" className="rounded-xl h-9">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl h-9 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              {loading ? "Creating..." : "Create Purchase Order"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
