import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { validateApiAuth } from "@/lib/api-auth";

const RunUpdateSchema = z.object({
  runId: z.string().uuid(),
  status: z.enum(["running", "completed", "failed"]).optional(),
  stage: z.enum(["scout", "scorer", "tailor", "outreach", "analyst"]).optional(),
  jobs_discovered: z.number().optional(),
  jobs_scored: z.number().optional(),
  resumes_tailored: z.number().optional(),
  applications_sent: z.number().optional(),
  emails_drafted: z.number().optional(),
  emails_sent: z.number().optional(),
});

/**
 * POST /api/autopilot/run -- Create a new run
 */
export async function POST(request: Request) {
  const authError = validateApiAuth(request);
  if (authError) return authError;

  try {
    const { data: config, error: configError } = await supabaseAdmin
      .from("autopilot_config")
      .select("*")
      .single();

    if (configError) throw configError;

    const { data: run, error: runError } = await supabaseAdmin
      .from("autopilot_runs")
      .insert({
        status: "running",
        stage: "scout",
        config: {
          target_roles: config.target_roles,
          target_keywords: config.target_keywords,
          min_match_score: config.min_match_score,
          max_applications_per_run: config.max_applications_per_run,
        },
      })
      .select()
      .single();

    if (runError) throw runError;
    return NextResponse.json({ success: true, run });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PATCH /api/autopilot/run -- Update a run
 */
export async function PATCH(request: Request) {
  const authError = validateApiAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = RunUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid run update", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { runId, ...fields } = parsed.data;
    const updates: Record<string, unknown> = { ...fields };

    if (fields.status === "completed" || fields.status === "failed") {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from("autopilot_runs")
      .update(updates)
      .eq("id", runId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, run: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
