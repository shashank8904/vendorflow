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
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fbUser.email, name: fbUser.displayName || "Google User", uid: fbUser.uid })
      });

      if (!response.ok) {
        throw new Error("Failed to sync Google user with backend");
      }

      const responseJson = await response.json();
      const backendUser = responseJson.data.user;
      
      const userProfile = {
        uid: backendUser.id,
        email: backendUser.email,
        displayName: backendUser.name || "Google User",
        photoURL: fbUser.photoURL,
        isDemo: false,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(userProfile));
        if (responseJson.data.token) localStorage.setItem("vf_token", responseJson.data.token);
      }

      setUser(userProfile);
      toast.success(`Welcome back, ${userProfile.displayName}!`);
      router.push("/");
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        toast.info("Google sign-in popup was closed");
      } else {
        let msg = error.message || "Failed to sign in with Google";
        if (msg.includes("Database is closing/hidden")) {
          msg = "Your browser is blocking IndexedDB (common in Incognito/Brave). Please allow cookies/storage for Google login.";
        }
        toast.error(msg);
      }
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Invalid email or password");
      }

      const responseJson = await response.json();
      const fbUser = responseJson.data.user;
      
      const userProfile = {
        uid: fbUser.id,
        email: fbUser.email,
        displayName: fbUser.name || fbUser.email?.split("@")[0] || "User",
        photoURL: null,
        isDemo: false,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(userProfile));
        // Also save token if needed
        if (responseJson.data.token) localStorage.setItem("vf_token", responseJson.data.token);
      }
      
      setUser(userProfile);
      toast.success(`Welcome back!`);
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Invalid email or password.");
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass, userName: name, companyName: name + "'s Company" })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create account");
      }

      const responseJson = await response.json();
      const fbUser = responseJson.data.user;
      
      const userProfile = {
        uid: fbUser.id,
        email: fbUser.email,
        displayName: fbUser.name || fbUser.email?.split("@")[0] || "User",
        photoURL: null,
        isDemo: false,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(userProfile));
        if (responseJson.data.token) localStorage.setItem("vf_token", responseJson.data.token);
      }
      
      setUser(userProfile);
      toast.success("Account created successfully!");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
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
