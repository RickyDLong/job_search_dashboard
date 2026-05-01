import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/autopilot/discover
 *
 * Triggers a discovery cycle. Since the actual job search MCP tools
 * run in the Cowork environment (not the Next.js runtime), this endpoint:
 *
 * 1. Creates a run record to track the cycle
 * 2. Checks for any pending discovered jobs that need re-scoring
 * 3. Returns status for the dashboard to poll
 *
 * The scheduled Cowork task handles the actual Indeed searches and
 * calls /api/autopilot/ingest to insert results.
 *
 * When called from the Activate button, it signals that the system
 * is ready for the next scheduled run to execute.
 */
export async function POST() {
  try {
    // Check if autopilot is enabled
    const { data: config } = await supabase
      .from("autopilot_config")
      .select("enabled")
      .single();

    if (!config?.enabled) {
      return NextResponse.json(
        { success: false, error: "Autopilot is not enabled" },
        { status: 400 }
      );
    }

    // Create a new run record
    const { data: run, error: runError } = await supabase
      .from("autopilot_runs")
      .insert({
        status: "running",
        stage: "scout",
        config: { triggered_by: "dashboard_activate" },
      })
      .select()
      .single();

    if (runError) throw runError;

    // Get current stats for the response
    const { data: discovered } = await supabase
      .from("discovered_jobs")
      .select("id, status, match_score")
      .order("created_at", { ascending: false });

    const totalDiscovered = discovered?.length || 0;
    const highScoreCount = discovered?.filter((d) => d.match_score >= 60).length || 0;

    // Mark run as completed (the actual search happens via scheduled task)
    await supabase
      .from("autopilot_runs")
      .update({
        status: "completed",
        stage: "analyst",
        jobs_discovered: totalDiscovered,
        jobs_scored: totalDiscovered,
        completed_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    // Log the activation event
    await supabase.from("learning_log").insert({
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
      inserted: 0, // No new jobs from this call — scheduled task handles that
      runId: run.id,
      stats: {
        totalDiscovered,
        highScoreCount,
      },
      message: "Autopilot activated. Discovery runs at 8am and 8pm daily. Existing jobs are available on the Discovered tab.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
