"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Filter } from "lucide-react";

const BRANCHES = ["ALL", "Jatim", "Jakarta", "Bali", "Sumatra", "Sulawesi", "Batam"];

export default function BranchFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("branch") || "ALL";

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const params = new URLSearchParams(searchParams.toString());
      if (e.target.value === "ALL") {
        params.delete("branch");
      } else {
        params.set("branch", e.target.value);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-gray-400" />
      <select
        value={current}
        onChange={handleChange}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-[#00D084] focus:outline-none focus:ring-1 focus:ring-[#00D084]"
      >
        {BRANCHES.map((b) => (
          <option key={b} value={b}>
            {b === "ALL" ? "All Branches" : b}
          </option>
        ))}
      </select>
    </div>
  );
}
