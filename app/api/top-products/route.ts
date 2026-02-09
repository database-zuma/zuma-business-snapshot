import { queryTopProductsByPlace } from "@/lib/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const periodType = searchParams.get("period_type") || "monthly";
    const periodLabel = searchParams.get("period_label") || undefined;
    const placeType = searchParams.get("place_type") || undefined;

    const data = await queryTopProductsByPlace({ periodType, periodLabel, placeType });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, data: [], error: message }, { status: 500 });
  }
}
