import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { validateApiAuth } from "@/lib/api-auth";
import { tailorResume } from "@/lib/autopilot/resume-tailor";

/**
 * POST /api/autopilot/tailor
 * Tailors Ricky's resume for a specific discovered job
 * Accepts: { discoveredJobId: string }
 * Returns: the tailored resume record
 */
export async function POST(request: Request) {
  try {
    const authError = validateApiAuth(request);
    if (authError) return authError;
    const body = await request.json();
    const TailorSchema = z.object({ discoveredJobId: z.string().uuid() });
    const parsed = TailorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }
    const { discoveredJobId } = parsed.data;

    // Fetch the discovered job
    const { data: job, error: jobError } = await supabaseAdmin
      .from("discovered_jobs")
      .select("*")
      .eq("id", discoveredJobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Fetch the master resume ID from config
    const { data: config } = await supabaseAdmin
      .from("autopilot_config")
      .select("master_resume_id")
      .single();

    // Tailor the resume
    const tailored = tailorResume({
      title: job.title,
      company: job.company,
      description: job.description || "",
      requirements: job.requirements || [],
      keywords: job.keyword_matches || [],
      missingKeywords: job.missing_keywords || [],
    });

    // Check if a tailored resume already exists for this job
    const { data: existing } = await supabaseAdmin
      .from("tailored_resumes")
      .select("id")
      .eq("discovered_job_id", discoveredJobId)
      .maybeSingle();

    let result;

    if (existing) {
      // Update existing
      const { data, error } = await supabaseAdmin
        .from("tailored_resumes")
        .update({
          summary_rewrite: tailored.summaryRewrite,
          skills_reorder: tailored.skillsReorder,
          keyword_additions: tailored.keywordAdditions,
          full_text: tailored.fullText,
          ats_score_estimate: tailored.atsScoreEstimate,
        })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      // Insert new
      const { data, error } = await supabaseAdmin
        .from("tailored_resumes")
        .insert({
          discovered_job_id: discoveredJobId,
          base_resume_id: config?.master_resume_id || null,
          summary_rewrite: tailored.summaryRewrite,
          skills_reorder: tailored.skillsReorder,
          keyword_additions: tailored.keywordAdditions,
          full_text: tailored.fullText,
          ats_score_estimate: tailored.atsScoreEstimate,
        })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    // Update discovered job status
    await supabaseAdmin
      .from("discovered_jobs")
      .update({ status: "resume_tailored" })
      .eq("id", discoveredJobId);

    return NextResponse.json({
      success: true,
      tailoredResume: result,
      atsScore: tailored.atsScoreEstimate,
      keywordAdditions: tailored.keywordAdditions,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/autopilot/tailor/batch
 * Tailor resumes for multiple jobs at once
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const BatchSchema = z.object({ jobIds: z.array(z.string().uuid()).min(1) });
    const parsed = BatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }
    const { jobIds } = parsed.data;

    const results = [];
    for (const id of jobIds) {
      try {
        const response = await fetch(
          new URL("/api/autopilot/tailor", request.url),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ discoveredJobId: id }),
          }
        );
        const data = await response.json();
        results.push({ id, ...data });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        results.push({ id, error: msg });
      }
    }

    return NextResponse.json({
      success: true,
      total: results.length,
      tailored: results.filter((r) => r.success).length,
      failed: results.filter((r) => r.error).length,
      results,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
