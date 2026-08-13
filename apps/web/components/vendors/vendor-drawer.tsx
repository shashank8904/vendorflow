"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, User, Phone, Mail, MapPin, Hash, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface VendorDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function VendorDrawer({ open, onClose }: VendorDrawerProps) {
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Vendor created successfully");
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Add Vendor</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Add a new vendor to your network</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-xl">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Company Name *
                </Label>
                <Input required placeholder="Acme Supplies Pvt. Ltd." className="h-9 rounded-xl text-sm" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Contact Person *
                </Label>
                <Input required placeholder="Full name" className="h-9 rounded-xl text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone *
                  </Label>
                  <Input required placeholder="+91 98765 43210" className="h-9 rounded-xl text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email *
                  </Label>
                  <Input required type="email" placeholder="contact@company.com" className="h-9 rounded-xl text-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Address
                </Label>
                <Textarea
                  placeholder="Full business address"
                  rows={2}
                  className="rounded-xl text-sm resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" /> GST Number
                </Label>
                <Input placeholder="27AAAPL1234C1Z5" className="h-9 rounded-xl text-sm font-mono" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Notes
                </Label>
                <Textarea
                  placeholder="Payment terms, special instructions..."
                  rows={3}
                  className="rounded-xl text-sm resize-none"
                />
              </div>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border shrink-0">
              <Button variant="outline" onClick={onClose} className="rounded-xl h-9">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="rounded-xl h-9 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                {loading ? "Saving..." : "Save Vendor"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
