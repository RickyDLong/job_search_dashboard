import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { validateApiAuth } from "@/lib/api-auth";

/**
 * POST /api/autopilot/ingest
 * Accepts an array of discovered jobs and inserts them into Supabase
 * Handles deduplication via the source+external_id unique index
 */
export async function POST(request: Request) {
  try {
    const authError = validateApiAuth(request);
    if (authError) return authError;
    const body = await request.json();

    const IngestJobSchema = z.object({
      source: z.string().default("indeed"),
      external_id: z.string().nullable().optional(),
      title: z.string().min(1),
      company: z.string().min(1),
      location: z.string().default("Remote"),
      salary_range: z.string().nullable().optional(),
      url: z.string().url().nullable().optional(),
      description: z.string().nullable().optional(),
      requirements: z.array(z.string()).default([]),
      posted_date: z.string().nullable().optional(),
      match_score: z.number().min(0).max(100).default(0),
      keyword_matches: z.array(z.string()).default([]),
      missing_keywords: z.array(z.string()).default([]),
      score_reasoning: z.string().nullable().optional(),
    });

    const IngestSchema = z.object({
      runId: z.string().uuid().nullable().optional(),
      jobs: z.array(IngestJobSchema).min(1, "At least one job required"),
    });

    const parsed = IngestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const { runId, jobs } = parsed.data;

    const inserted: string[] = [];
    const skipped: string[] = [];
    const errors: string[] = [];

    for (const job of jobs) {
      try {
        // Check for existing job with same source + external_id
        if (job.external_id) {
          const { data: existing } = await supabaseAdmin
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

        const { data, error } = await supabaseAdmin
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
      await supabaseAdmin
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
