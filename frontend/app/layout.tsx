import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { AccessibilityProvider } from "../lib/AccessibilityContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ElderShield — Before you sign, know what it means.",
  description:
    "A cinematic, accessible legal-document explainer for seniors and families. Detect hidden fees, rights waivers, deadlines, and confusing clauses before signing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`h-full ${inter.variable} ${instrumentSerif.variable}`}
    >
      <body className="min-h-full bg-background text-foreground font-sans antialiased">
        <AccessibilityProvider>{children}</AccessibilityProvider>
      </body>
    </html>
  );
}
