import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import BranchFilter from "@/components/filters/BranchFilter";
import { Suspense } from "react";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
        className={`${plusJakartaSans.variable} font-sans antialiased bg-background`}
      >
        <Sidebar />
        <div className="md:ml-56 min-h-screen">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/95 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold text-[#0D3B2E]">
                Zuma Business Snapshot
              </h1>
            </div>
            <Suspense fallback={null}>
              <BranchFilter />
            </Suspense>
          </header>
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
