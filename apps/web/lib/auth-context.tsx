"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "./firebase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isDemo?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  demoLogin: (role?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_STORAGE_KEY = "vf_demo_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const configured = isFirebaseConfigured();

  useEffect(() => {
    // 1. Check for active demo user in localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(DEMO_STORAGE_KEY);
      if (stored) {
        try {
          setUser(JSON.parse(stored));
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem(DEMO_STORAGE_KEY);
        }
      }
    }

    // 2. If Firebase auth instance is available, attach onAuthStateChanged listener
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
            photoURL: fbUser.photoURL,
            isDemo: false,
          });
        } else {
          // If no Firebase user and no demo user, set user to null
          const stored = typeof window !== "undefined" ? localStorage.getItem(DEMO_STORAGE_KEY) : null;
          if (!stored) {
            setUser(null);
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    if (!auth || !configured) {
      // Graceful fallback to demo Google user if keys not yet configured
      demoLogin("Google User");
      toast.success("Signed in with Google (Demo Mode)", {
        description: "Configure Firebase keys in .env.local for live OAuth.",
      });
      router.push("/");
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      setUser({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || "Google User",
        photoURL: fbUser.photoURL,
        isDemo: false,
      });
      toast.success(`Welcome back, ${fbUser.displayName || "User"}!`);
      router.push("/");
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        toast.info("Google sign-in popup was closed");
      } else {
        toast.error(error.message || "Failed to sign in with Google");
      }
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!auth || !configured) {
      demoLogin(email.split("@")[0] || "Admin");
      toast.success("Signed in (Demo Mode)", {
        description: "Configure Firebase keys in .env.local for live auth.",
      });
      router.push("/");
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const fbUser = result.user;
      setUser({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
        photoURL: fbUser.photoURL,
        isDemo: false,
      });
      toast.success(`Welcome back!`);
      router.push("/");
    } catch (error: any) {
      let msg = "Invalid email or password";
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        msg = "Invalid email or password.";
      } else if (error.code === "auth/too-many-requests") {
        msg = "Too many failed attempts. Please try again later.";
      }
      toast.error(msg);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    if (!auth || !configured) {
      demoLogin(name || "New User");
      toast.success("Account created (Demo Mode)", {
        description: "Configure Firebase keys in .env.local for live auth.",
      });
      router.push("/");
      return;
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      if (name && result.user) {
        await updateProfile(result.user, { displayName: name });
      }
      const fbUser = result.user;
      setUser({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: name || fbUser.email?.split("@")[0] || "User",
        photoURL: null,
        isDemo: false,
      });
      toast.success("Account created successfully!");
      router.push("/");
    } catch (error: any) {
      let msg = "Failed to create account";
      if (error.code === "auth/email-already-in-use") {
        msg = "An account with this email already exists.";
      } else if (error.code === "auth/weak-password") {
        msg = "Password should be at least 6 characters.";
      }
      toast.error(msg);
      throw error;
    }
  };

  const sendPasswordReset = async (email: string) => {
    if (!auth || !configured) {
      toast.info("Demo Mode: Password reset email simulated for " + email);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset link sent to your email.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      if (auth) {
        await firebaseSignOut(auth);
      }
    } catch (e) {
      console.warn("Firebase signout error:", e);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem(DEMO_STORAGE_KEY);
    }
    setUser(null);
    toast.success("Signed out successfully");
    router.push("/login");
  };

  const demoLogin = (name = "Suhas Nair") => {
    const demoUser: UserProfile = {
      uid: "demo-user-" + Date.now(),
      email: "suhas@vendorflow.io",
      displayName: name,
      photoURL: null,
      isDemo: true,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoUser));
    }
    setUser(demoUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: configured,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        signOutUser,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
