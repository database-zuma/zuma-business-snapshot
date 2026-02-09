"use client";

import { PeriodType } from "@/lib/types";

const periods: { value: PeriodType; label: string }[] = [
  { value: "yearly", label: "Yearly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
];

interface PeriodTabsProps {
  value: PeriodType;
  onChange: (v: PeriodType) => void;
}

export default function PeriodTabs({ value, onChange }: PeriodTabsProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            value === p.value
              ? "bg-white text-[#0D3B2E] shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
