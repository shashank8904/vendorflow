import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | VendorFlow",
    default: "VendorFlow – AI Vendor Communication Platform",
  },
  description:
    "Automate vendor follow-ups with AI voice agents. VendorFlow calls vendors, extracts structured data, and updates your ERP automatically.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <TooltipProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                borderRadius: "12px",
                border: "1px solid hsl(var(--border))",
                fontFamily: "Inter, sans-serif",
              },
            }}
          />
        </TooltipProvider>
      </body>
    </html>
  );
}
