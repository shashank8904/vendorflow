import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | VendorFlow",
  description: "Sign in to VendorFlow to manage your vendor communications.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
