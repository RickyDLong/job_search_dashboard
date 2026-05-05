import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { validateApiAuth } from "@/lib/api-auth";

const ConfigUpdateSchema = z.object({
  enabled: z.boolean().optional(),
  target_roles: z.array(z.string()).optional(),
  target_keywords: z.array(z.string()).optional(),
  min_match_score: z.number().min(0).max(100).optional(),
  max_applications_per_run: z.number().min(1).max(100).optional(),
  excluded_companies: z.array(z.string()).optional(),
}).strict();

/**
 * GET /api/autopilot/config
 */
export async function GET(request: Request) {
  const authError = validateApiAuth(request);
  if (authError) return authError;

  try {
    const { data, error } = await supabaseAdmin
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
 */
export async function PATCH(request: Request) {
  const authError = validateApiAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = ConfigUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid config payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("autopilot_config")
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
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
