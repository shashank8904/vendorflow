"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Zap,
  Loader2,
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

// Official Google "G" Icon
function GoogleIcon() {
  return (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
    demoLogin,
    isConfigured,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("suhas@vendorflow.io");
  const [password, setPassword] = useState("password123");

  // Forgot password dialog
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
      } else {
        if (!name.trim()) {
          toast.error("Please enter your full name");
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, name.trim());
      }
    } catch {
      // Error handled by AuthContext toasts
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      // Error handled by AuthContext
    } finally {
      setGoogleLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordReset(resetEmail);
      setResetDialogOpen(false);
    } catch {
      // Error handled by AuthContext
    } finally {
      setResetLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    demoLogin("Suhas Nair");
    toast.success("Signed in with Demo Account", {
      description: "Welcome to VendorFlow Preview.",
    });
    router.push("/");
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950">
      {/* Left panel – branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 flex-col p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-0 left-0 w-full h-full"
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
              AI-powered vendor
              <br />
              communication platform
            </h2>
            <p className="text-indigo-200 text-base leading-relaxed max-w-sm">
              Automatically call vendors, follow up on purchase orders, and sync structured data
              to your ERP — all hands-free.
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
              "📊 Full analytics, tracking & call transcripts",
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
            "VendorFlow reduced our vendor follow-up time by 80%. The AI calls vendors, gets
            confirmation, and updates our SAP — we just see the results."
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

      {/* Right panel – auth form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-6 lg:hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">VendorFlow</span>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === "signin"
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {mode === "signin"
                ? "Sign in to access your vendor communications"
                : "Get started with automated AI vendor follow-ups"}
            </p>
          </div>

          {/* Google Auth Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full h-10 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-sm gap-2 mb-4"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-950 px-2 text-gray-400">
                Or with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "signup" && (
              <div className="space-y-1">
                <Label
                  htmlFor="name"
                  className="text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  Full Name
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Suhas Nair"
                    required={mode === "signup"}
                    className="h-10 rounded-xl border-gray-200 dark:border-gray-700 pl-9 text-sm"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label
                htmlFor="email"
                className="text-xs font-medium text-gray-700 dark:text-gray-300"
              >
                Email address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="h-10 rounded-xl border-gray-200 dark:border-gray-700 pl-9 text-sm"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </Label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setResetDialogOpen(true);
                    }}
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="h-10 rounded-xl border-gray-200 dark:border-gray-700 pl-9 pr-10 text-sm"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {loading
                ? mode === "signin"
                  ? "Signing in..."
                  : "Creating account..."
                : mode === "signin"
                ? "Sign in"
                : "Create Account"}
            </Button>
          </form>

          {/* Quick Demo Sign In Box */}
          <div className="mt-6 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/70 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-semibold">Quick Demo Login</span>
                <span className="text-gray-400 text-[10px]">(Skip Credentials)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Protected by Firebase Authentication ·{" "}
            <Link href="#" className="underline hover:text-gray-600">
              Terms & Privacy
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {resetDialogOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setResetDialogOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-6 w-full max-w-sm shadow-xl space-y-4"
              >
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Reset Password
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your email to receive a password reset link from Firebase.
                  </p>
                </div>

                <form onSubmit={handlePasswordReset} className="space-y-3">
                  <Input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="h-9 rounded-xl text-sm"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => setResetDialogOpen(false)}
                      className="rounded-xl h-8 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      type="submit"
                      disabled={resetLoading}
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs"
                    >
                      {resetLoading && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                      Send Reset Link
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
