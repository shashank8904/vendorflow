"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("suhas@vendorflow.io");
  const [password, setPassword] = useState("••••••••");
  const [remember, setRemember] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    toast.success("Signed in successfully", {
      description: "Welcome back, Suhas!",
    });
    router.push("/");
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950">
      {/* Left panel – branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 flex-col p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl opacity-30" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">VendorFlow</span>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white leading-tight mb-4">
              AI-powered vendor<br />communication platform
            </h2>
            <p className="text-indigo-200 text-base leading-relaxed max-w-sm">
              Automatically call vendors, follow up on purchase orders, and sync structured data to your ERP — all hands-free.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-10 space-y-3"
          >
            {[
              "🤖 AI voice agents call vendors automatically",
              "📋 Extracts delivery dates, delays & confirmations",
              "🔄 Updates ERP/CRM with structured data in real-time",
              "📊 Full analytics & call transcripts",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-indigo-100">
                <span>{item}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
          <p className="text-sm text-indigo-100 leading-relaxed">
            "VendorFlow reduced our vendor follow-up time by 80%. The AI calls vendors, gets confirmation, and updates our SAP — we just see the results."
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-6 h-6 rounded-full bg-indigo-300 flex items-center justify-center text-xs font-bold text-indigo-800">
              M
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Meera Pillai</p>
              <p className="text-xs text-indigo-300">Head of Supply Chain, IndusTech</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel – login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">VendorFlow</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Sign in to your workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="h-10 rounded-xl border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-10 rounded-xl border-gray-200 dark:border-gray-700 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300 accent-indigo-600"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <Link
                href="#"
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            By signing in, you agree to our{" "}
            <Link href="#" className="underline hover:text-gray-600">Terms</Link> and{" "}
            <Link href="#" className="underline hover:text-gray-600">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
