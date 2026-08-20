"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Search, Clock, FileText, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { formatRelativeTime, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

// Mock approvals for MVP
const MOCK_APPROVALS = [
  { id: "1", type: "PR", ref: "PR-A101", requester: "John Doe", value: 45000, createdAt: new Date(Date.now() - 10000000).toISOString(), status: "PENDING" },
  { id: "2", type: "PO", ref: "PO-B202", requester: "Jane Smith", value: 125000, createdAt: new Date(Date.now() - 20000000).toISOString(), status: "PENDING" },
];

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState(MOCK_APPROVALS);
  const [search, setSearch] = useState("");
  const [actioning, setActioning] = useState<string | null>(null);

  const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
    setActioning(id);
    try {
      // In a real app, call approvalsApi.approve(id) or reject(id)
      await new Promise(resolve => setTimeout(resolve, 600));
      setApprovals(approvals.filter(a => a.id !== id));
      toast.success(`Request ${action.toLowerCase()}d successfully`);
    } catch (err) {
      toast.error("Failed to process approval");
    } finally {
      setActioning(null);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Approvals Center"
        description="Review and action pending requests"
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            placeholder="Search by reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 rounded-xl text-sm border-gray-200"
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/75 dark:bg-gray-800/50 border-b border-border text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Requester</th>
                <th className="px-4 py-3 font-medium">Total Value</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {approvals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-200" />
                    You're all caught up! No pending approvals.
                  </td>
                </tr>
              ) : (
                approvals.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
                        req.type === 'PR' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {req.type === 'PR' ? <FileText className="w-3 h-3" /> : <ShoppingCart className="w-3 h-3" />}
                        {req.type}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {req.ref}
                    </td>
                    <td className="px-4 py-3">{req.requester}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(req.value)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatRelativeTime(req.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                       <Button 
                         size="sm" 
                         variant="outline" 
                         className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50"
                         disabled={actioning === req.id}
                         onClick={() => handleAction(req.id, "REJECT")}
                       >
                         Reject
                       </Button>
                       <Button 
                         size="sm" 
                         className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                         disabled={actioning === req.id}
                         onClick={() => handleAction(req.id, "APPROVE")}
                       >
                         {actioning === req.id ? "Processing..." : "Approve"}
                       </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
