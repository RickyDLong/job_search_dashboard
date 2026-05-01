import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/autopilot/config
 * Returns the current autopilot configuration
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("autopilot_config")
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, config: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PATCH /api/autopilot/config
 * Update autopilot configuration
 */
export async function PATCH(request: Request) {
  try {
    const updates = await request.json();

    const { data, error } = await supabase
      .from("autopilot_config")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", 1)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, config: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
