"use client";

import { Loader2 } from "lucide-react";

export function LoadingState({ message = "Loading data..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <Loader2 className="h-8 w-8 animate-spin text-[#00D084]" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm font-medium text-red-700">Error loading data</p>
      <p className="mt-1 text-xs text-red-500">{message}</p>
    </div>
  );
}
