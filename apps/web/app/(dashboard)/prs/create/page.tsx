"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";
import { prsApi } from "@/lib/api";

export default function CreatePRPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState("");
  const [requiredByDate, setRequiredByDate] = useState("");
  const [notes, setNotes] = useState("");
  
  const [items, setItems] = useState([
    { freeTextDescription: "", quantity: 1, unit: "Nos", estimatedRate: 0 }
  ]);

  const handleAddItem = () => {
    setItems([...items, { freeTextDescription: "", quantity: 1, unit: "Nos", estimatedRate: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleChangeItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requiredByDate) {
      toast.error("Required By Date is mandatory");
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        department,
        requiredByDate: new Date(requiredByDate).toISOString(),
        notes,
        items: items.map(i => ({
          freeTextDescription: i.freeTextDescription,
          quantity: Number(i.quantity),
          unit: i.unit,
          estimatedRate: Number(i.estimatedRate)
        }))
      };
      
      const pr = await prsApi.create(payload);
      toast.success("PR created successfully!");
      router.push(`/prs/${pr.id || pr.data?.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create PR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Link href="/prs" className="hover:text-indigo-600 flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Back to PRs
        </Link>
      </div>
      
      <PageHeader
        title="Create Purchase Request"
        description="Draft a new request for items or services"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-border space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white border-b border-border pb-2">Basic Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
              <Input 
                placeholder="e.g. IT, Operations"
                value={department}
                onChange={e => setDepartment(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Required By Date *</label>
              <Input 
                type="date"
                required
                value={requiredByDate}
                onChange={e => setRequiredByDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes / Purpose</label>
              <Input 
                placeholder="Briefly describe why this is needed"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-border space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Line Items</h3>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="h-8 gap-1">
              <Plus className="w-3 h-3" /> Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex items-end gap-3 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-border/50">
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Item Description *</label>
                  <Input 
                    required
                    placeholder="Enter item name..."
                    value={item.freeTextDescription}
                    onChange={e => handleChangeItem(index, "freeTextDescription", e.target.value)}
                  />
                </div>
                <div className="w-24 space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Qty *</label>
                  <Input 
                    type="number"
                    min="1"
                    required
                    value={item.quantity}
                    onChange={e => handleChangeItem(index, "quantity", e.target.value)}
                  />
                </div>
                <div className="w-24 space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Unit</label>
                  <Input 
                    placeholder="Nos"
                    value={item.unit}
                    onChange={e => handleChangeItem(index, "unit", e.target.value)}
                  />
                </div>
                <div className="w-32 space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Est. Rate (₹)</label>
                  <Input 
                    type="number"
                    min="0"
                    value={item.estimatedRate}
                    onChange={e => handleChangeItem(index, "estimatedRate", e.target.value)}
                  />
                </div>
                {items.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    className="h-9 w-9 text-red-500 hover:bg-red-50"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
            {loading ? "Saving..." : "Save PR as Draft"}
          </Button>
        </div>
      </form>
    </div>
  );
}
