import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { validateApiAuth } from "@/lib/api-auth";

/**
 * POST /api/autopilot/discover
 */
export async function POST(request: Request) {
  const authError = validateApiAuth(request);
  if (authError) return authError;

  try {
    const { data: config } = await supabaseAdmin
      .from("autopilot_config")
      .select("enabled")
      .single();

    if (!config?.enabled) {
      return NextResponse.json(
        { success: false, error: "Autopilot is not enabled" },
        { status: 400 }
      );
    }

    const { data: run, error: runError } = await supabaseAdmin
      .from("autopilot_runs")
      .insert({
        status: "running",
        stage: "scout",
        config: { triggered_by: "dashboard_activate" },
      })
      .select()
      .single();

    if (runError) throw runError;

    const { data: discovered } = await supabaseAdmin
      .from("discovered_jobs")
      .select("id, status, match_score")
      .order("created_at", { ascending: false });

    const totalDiscovered = discovered?.length || 0;
    const highScoreCount = discovered?.filter((d) => d.match_score >= 60).length || 0;

    await supabaseAdmin
      .from("autopilot_runs")
      .update({
        status: "completed",
        stage: "analyst",
        jobs_discovered: totalDiscovered,
        jobs_scored: totalDiscovered,
        completed_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    await supabaseAdmin.from("learning_log").insert({
      category: "source_quality",
      signal: "Autopilot activated from dashboard",
      data: {
        total_discovered: totalDiscovered,
        high_score_count: highScoreCount,
        timestamp: new Date().toISOString(),
      },
      adjustment: "System armed for next scheduled discovery cycle",
    });

    return NextResponse.json({
      success: true,
      inserted: 0,
      runId: run.id,
      stats: { totalDiscovered, highScoreCount },
      message: "Autopilot activated. Discovery runs at 8am and 8pm daily.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
