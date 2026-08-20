"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, User, Phone, Mail, MapPin, Hash, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { vendorsApi } from "@/lib/api";

interface VendorDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function VendorDrawer({ open, onClose, onSuccess }: VendorDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    gstNumber: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await vendorsApi.create({
        name: form.name.trim(),
        contactPerson: form.contactPerson.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        gstNumber: form.gstNumber.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });

      toast.success("Vendor added successfully");
      setForm({
        name: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
        gstNumber: "",
        notes: "",
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create vendor");
    } finally {
      setLoading(false);
    }
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
                <Input
                  required
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Acme Supplies Pvt. Ltd."
                  className="h-9 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Contact Person *
                </Label>
                <Input
                  required
                  name="contactPerson"
                  value={form.contactPerson}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="h-9 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone *
                  </Label>
                  <Input
                    required
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                    className="h-9 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </Label>
                  <Input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="contact@company.com"
                    className="h-9 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Address
                </Label>
                <Textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Full business address"
                  rows={2}
                  className="rounded-xl text-sm resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" /> GST / Tax Number
                </Label>
                <Input
                  name="gstNumber"
                  value={form.gstNumber}
                  onChange={handleChange}
                  placeholder="GSTIN29ABCDE1234F1Z5"
                  className="h-9 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Notes
                </Label>
                <Textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Payment terms, delivery preferences..."
                  rows={2}
                  className="rounded-xl text-sm resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center gap-2 justify-end">
                <Button variant="outline" type="button" onClick={onClose} className="rounded-xl h-9">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl h-9 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                  {loading ? "Saving..." : "Add Vendor"}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
