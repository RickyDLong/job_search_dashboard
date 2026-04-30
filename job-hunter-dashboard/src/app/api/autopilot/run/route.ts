import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/autopilot/run
 * Creates a new autopilot run record and returns the run ID
 */
export async function POST() {
  try {
    // Get current config
    const { data: config, error: configError } = await supabase
      .from("autopilot_config")
      .select("*")
      .single();

    if (configError) throw configError;

    // Create a new run
    const { data: run, error: runError } = await supabase
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
 * PATCH /api/autopilot/run
 * Updates a run's status and stage
 */
export async function PATCH(request: Request) {
  try {
    const { runId, status, stage, ...counters } = await request.json();

    if (!runId) {
      return NextResponse.json({ error: "runId required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (stage) updates.stage = stage;
    if (status === "completed" || status === "failed") {
      updates.completed_at = new Date().toISOString();
    }

    // Merge any counter updates
    for (const [key, value] of Object.entries(counters)) {
      if (["jobs_discovered", "jobs_scored", "resumes_tailored", "applications_sent", "emails_drafted", "emails_sent"].includes(key)) {
        updates[key] = value;
      }
    }

    const { data, error } = await supabase
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
