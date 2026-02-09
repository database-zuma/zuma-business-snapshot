"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Globe, Store, MapPin, Package } from "lucide-react";

const navItems = [
  { href: "/national", label: "National", icon: Globe },
  { href: "/branch", label: "Branch & Area", icon: MapPin },
  { href: "/store", label: "Store", icon: Store },
  { href: "/product", label: "Product", icon: Package },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-gray-200 bg-[#0D3B2E]">
      <div className="flex items-center gap-2 px-5 py-5">
        <BarChart3 className="h-6 w-6 text-[#00D084]" />
        <span className="text-lg font-bold text-white">Zuma Snapshot</span>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#00D084]/20 text-[#00D084]"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-xs text-gray-400">Zuma Indonesia</p>
        <p className="text-xs text-gray-500">Business Dashboard v1</p>
      </div>
    </aside>
  );
}
