import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NavBar from "@/components/NavBar";
import Providers from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PeptideStack — Personalized Peptide Coaching",
  description:
    "Profile-driven peptide recommendations, stack tracking, and an AI coach to help you reach your fat loss, muscle, recovery, and longevity goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0b0f17] text-gray-100">
        <Providers>
          <NavBar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-gray-500">
            PeptideStack is for educational and research-tracking purposes.
            Always consult a licensed healthcare provider before starting any
            peptide protocol.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
