import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AccessibilityProvider } from "../lib/AccessibilityContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ElderShield — Before you sign, know what it means.",
  description: "Linguistic fine-print risk extractor designed for elder accessibility. Detect rights waivers, hidden fees, auto-renewals, deadlines, and ambiguous terms in official documents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-950 text-slate-100`}>
        <AccessibilityProvider>{children}</AccessibilityProvider>
      </body>
    </html>
  );
}
