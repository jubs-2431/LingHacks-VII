import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { AccessibilityProvider } from "../lib/AccessibilityContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  title: "ElderShield — Before you sign, know what it means.",
  description:
    "Linguistic fine-print risk extractor designed for elder accessibility. Detect rights waivers, hidden fees, auto-renewals, deadlines, and ambiguous terms in official documents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-full flex flex-col bg-paper text-ink font-sans antialiased">
        <AccessibilityProvider>{children}</AccessibilityProvider>
      </body>
    </html>
  );
}
