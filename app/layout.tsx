import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import BranchFilter from "@/components/filters/BranchFilter";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zuma Business Snapshot",
  description: "Zuma Indonesia Business Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <Sidebar />
        <div className="ml-56 min-h-screen">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/80 px-6 py-3 backdrop-blur-sm">
            <h1 className="text-lg font-bold text-[#0D3B2E]">
              Zuma Business Snapshot
            </h1>
            <Suspense fallback={null}>
              <BranchFilter />
            </Suspense>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
