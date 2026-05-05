import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { validateApiAuth } from "@/lib/api-auth";
import { draftColdOutreach, draftFollowUp } from "@/lib/autopilot/email-drafter";

/**
 * POST /api/autopilot/outreach
 * Draft an outreach email for a discovered job + recruiter contact
 */
export async function POST(request: Request) {
  try {
    const authError = validateApiAuth(request);
    if (authError) return authError;
    const body = await request.json();
    const OutreachSchema = z.object({
      discoveredJobId: z.string().uuid(),
      recruiterContactId: z.string().uuid().nullable().optional(),
      type: z.enum(["cold", "followup"]).default("cold"),
    });
    const parsed = OutreachSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }
    const { discoveredJobId, recruiterContactId, type } = parsed.data;

    // Fetch the discovered job
    const { data: job, error: jobError } = await supabaseAdmin
      .from("discovered_jobs")
      .select("*")
      .eq("id", discoveredJobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Fetch recruiter contact if provided
    let recruiter = { name: "Hiring Manager", title: "", company: job.company };

    if (recruiterContactId) {
      const { data: contact } = await supabaseAdmin
        .from("recruiter_contacts")
        .select("*")
        .eq("id", recruiterContactId)
        .single();

      if (contact) {
        recruiter = {
          name: contact.name,
          title: contact.title || "",
          company: job.company,
        };
      }
    }

    const jobContext = {
      title: job.title,
      company: job.company,
      matchScore: job.match_score || 0,
      keywordMatches: job.keyword_matches || [],
      salaryRange: job.salary_range,
      url: job.url,
    };

    let draft;
    if (type === "followup") {
      // Check for existing outreach to calculate days since initial
      const { data: existingOutreach } = await supabaseAdmin
        .from("outreach_queue")
        .select("created_at")
        .eq("discovered_job_id", discoveredJobId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      const daysSince = existingOutreach
        ? Math.floor(
            (Date.now() - new Date(existingOutreach.created_at).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 7;

      draft = draftFollowUp(recruiter, jobContext, daysSince);
    } else {
      draft = draftColdOutreach(recruiter, jobContext);
    }

    // Insert into outreach queue
    const { data: outreach, error: outreachError } = await supabaseAdmin
      .from("outreach_queue")
      .insert({
        discovered_job_id: discoveredJobId,
        recruiter_contact_id: recruiterContactId || null,
        subject: draft.subject,
        body: draft.body,
        status: "drafted",
        send_via: "gmail", // Default to Gmail since Proton needs Bridge
      })
      .select()
      .single();

    if (outreachError) throw outreachError;

    return NextResponse.json({
      success: true,
      outreach,
      draft,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * GET /api/autopilot/outreach
 * Fetch outreach queue with optional status filter
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabaseAdmin
      .from("outreach_queue")
      .select("*, discovered_jobs(title, company, url), recruiter_contacts(name, email)")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, outreach: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PATCH /api/autopilot/outreach
 * Update outreach status (e.g., mark as sent, responded)
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const PatchSchema = z.object({
      outreachId: z.string().uuid(),
      status: z.enum(["drafted", "approved", "sent", "responded", "bounced", "failed"]),
      subject: z.string().optional(),
      body: z.string().optional(),
      send_via: z.enum(["gmail", "proton"]).optional(),
      error_message: z.string().optional(),
    });
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }
    const { outreachId, status, ...updates } = parsed.data;

    const updateData: Record<string, unknown> = { status };
    if (status === "sent") updateData.sent_at = new Date().toISOString();
    if (status === "responded") updateData.response_received_at = new Date().toISOString();

    // Merge any additional field updates
    for (const [key, value] of Object.entries(updates)) {
      if (["subject", "body", "send_via", "error_message"].includes(key)) {
        updateData[key] = value;
      }
    }

    const { data, error } = await supabaseAdmin
      .from("outreach_queue")
      .update(updateData)
      .eq("id", outreachId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, outreach: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
