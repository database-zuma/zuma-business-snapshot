"use client";

import { PeriodType } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <Tabs value={value} onValueChange={(v) => onChange(v as PeriodType)}>
      <TabsList className="bg-muted">
        {periods.map((p) => (
          <TabsTrigger
            key={p.value}
            value={p.value}
            className="text-sm data-[state=active]:bg-[#00D084] data-[state=active]:text-white"
          >
            {p.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
