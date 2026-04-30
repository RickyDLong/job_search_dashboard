import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/autopilot/ingest
 * Accepts an array of discovered jobs and inserts them into Supabase
 * Handles deduplication via the source+external_id unique index
 */
export async function POST(request: Request) {
  try {
    const { runId, jobs } = await request.json();

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json({ error: "No jobs provided" }, { status: 400 });
    }

    const inserted: string[] = [];
    const skipped: string[] = [];
    const errors: string[] = [];

    for (const job of jobs) {
      try {
        // Check for existing job with same source + external_id
        if (job.external_id) {
          const { data: existing } = await supabase
            .from("discovered_jobs")
            .select("id")
            .eq("source", job.source)
            .eq("external_id", job.external_id)
            .maybeSingle();

          if (existing) {
            skipped.push(`${job.title} at ${job.company} (duplicate)`);
            continue;
          }
        }

        const { data, error } = await supabase
          .from("discovered_jobs")
          .insert({
            run_id: runId || null,
            source: job.source || "indeed",
            external_id: job.external_id || null,
            title: job.title,
            company: job.company,
            location: job.location || "Remote",
            salary_range: job.salary_range || null,
            url: job.url || null,
            description: job.description || null,
            requirements: job.requirements || [],
            posted_date: job.posted_date || null,
            match_score: job.match_score || 0,
            keyword_matches: job.keyword_matches || [],
            missing_keywords: job.missing_keywords || [],
            score_reasoning: job.score_reasoning || null,
            status: job.match_score >= 60 ? "scored" : "discovered",
          })
          .select("id")
          .single();

        if (error) throw error;
        inserted.push(data.id);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${job.title}: ${msg}`);
      }
    }

    // Update run counters if runId provided
    if (runId) {
      await supabase
        .from("autopilot_runs")
        .update({
          jobs_discovered: inserted.length,
          jobs_scored: inserted.length, // all get scored on ingest
        })
        .eq("id", runId);
    }

    return NextResponse.json({
      success: true,
      inserted: inserted.length,
      skipped: skipped.length,
      errors: errors.length,
      details: { inserted, skipped, errors },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
