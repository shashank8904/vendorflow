"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Building2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";
import { vendorsApi, purchaseOrdersApi, type Vendor } from "@/lib/api";

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    vendorId: "",
    amount: "",
    expectedDelivery: "",
    description: "",
  });

  useEffect(() => {
    async function loadVendors() {
      try {
        const res = await vendorsApi.getAll({ limit: 100, status: "ACTIVE" });
        setVendors(res.items);
      } catch (err: any) {
        toast.error("Failed to load active vendors");
      } finally {
        setLoadingVendors(false);
      }
    }
    loadVendors();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.vendorId) {
      toast.error("Please select a vendor");
      return;
    }

    const numAmount = parseFloat(form.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }

    setSubmitting(true);
    try {
      const created = await purchaseOrdersApi.create({
        vendorId: form.vendorId,
        amount: numAmount,
        expectedDelivery: form.expectedDelivery
          ? new Date(form.expectedDelivery).toISOString()
          : undefined,
        description: form.description.trim() || undefined,
      });

      toast.success(`Purchase Order created: ${created.poNumber}`, {
        description: "Status set to PENDING.",
      });

      router.push("/purchase-orders");
    } catch (err: any) {
      toast.error(err.message || "Failed to create purchase order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/purchase-orders">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <PageHeader
          title="New Purchase Order"
          description="Create a purchase order for vendor follow-up"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Vendor *
            </Label>
            {loadingVendors ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading vendors...
              </div>
            ) : vendors.length === 0 ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 text-xs text-amber-800 dark:text-amber-300">
                No active vendors found. Please{" "}
                <Link href="/vendors" className="underline font-semibold">
                  create a vendor
                </Link>{" "}
                first.
              </div>
            ) : (
              <select
                required
                name="vendorId"
                value={form.vendorId}
                onChange={handleChange}
                className="w-full h-9 rounded-xl border border-border bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white"
              >
                <option value="">Select a vendor...</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.contactPerson})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Amount ($) *
              </Label>
              <Input
                required
                type="number"
                step="0.01"
                min="1"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="2500.00"
                className="h-9 rounded-xl text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Expected Delivery
              </Label>
              <Input
                type="date"
                name="expectedDelivery"
                value={form.expectedDelivery}
                onChange={handleChange}
                className="h-9 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Description / Line Items
            </Label>
            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="500x Precision CNC Parts, batch delivery by end of month..."
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
              disabled={submitting || loadingVendors || vendors.length === 0}
              className="rounded-xl h-9 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              {submitting ? "Creating..." : "Create Purchase Order"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
