import { supabase } from "./supabase";
import type { PipelineStage, ContactTag, ResumeType, ActivityType } from "@/types/database";

// ============================================
// JOBS
// ============================================

export async function getJobs() {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("match_score", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getJobsByStage(stage: PipelineStage) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("stage", stage)
    .order("match_score", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateJobStage(jobId: string, stage: PipelineStage) {
  const { data, error } = await supabase
    .from("jobs")
    .update({ stage, days_in_stage: 0 })
    .eq("id", jobId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createJob(job: {
  company: string;
  role: string;
  salary?: string;
  stage?: PipelineStage;
  source?: string;
  url?: string;
  match_score?: number;
  dual_contract_compatible?: boolean;
  tags?: string[];
  red_flags?: string[];
  notes?: string;
}) {
  const { data, error } = await supabase
    .from("jobs")
    .insert(job)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateJob(jobId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("jobs")
    .update(updates)
    .eq("id", jobId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteJob(jobId: string) {
  const { error } = await supabase.from("jobs").delete().eq("id", jobId);
  if (error) throw error;
}

// ============================================
// RESUMES
// ============================================

export async function getResumes() {
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .order("type", { ascending: true })
    .order("last_modified", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createResume(resume: {
  name: string;
  type?: ResumeType;
  version?: string;
  ats_score?: number;
  keywords?: string[];
  linked_job_id?: string;
  linked_job_title?: string;
}) {
  const { data, error } = await supabase
    .from("resumes")
    .insert(resume)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================
// CONTACTS
// ============================================

export async function getContacts() {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("last_contact", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createContact(contact: {
  name: string;
  role?: string;
  company?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  tag?: ContactTag;
  notes?: string;
  job_id?: string;
}) {
  const { data, error } = await supabase
    .from("contacts")
    .insert(contact)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateContact(contactId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("contacts")
    .update(updates)
    .eq("id", contactId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getContactsByJobId(jobId: string) {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("job_id", jobId)
    .order("last_contact", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getContactsByCompany(company: string) {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("company", company)
    .order("last_contact", { ascending: false });
  if (error) throw error;
  return data;
}

// ============================================
// COMPANIES
// ============================================

export async function getCompanies() {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("glassdoor_rating", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createCompany(company: {
  name: string;
  glassdoor_rating?: number;
  funding?: string;
  headcount?: string;
  remote_policy?: "fully_remote" | "hybrid" | "onsite";
  open_positions?: number;
  red_flags?: string[];
  notes?: string;
  website?: string;
}) {
  const { data, error } = await supabase
    .from("companies")
    .insert(company)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================
// ACTIVITY LOG
// ============================================

export async function getActivityLog(limit = 10) {
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function logActivity(entry: {
  type: ActivityType;
  title: string;
  description?: string;
  job_id?: string;
  contact_id?: string;
}) {
  const { data, error } = await supabase
    .from("activity_log")
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================
// ANALYTICS / AGGREGATIONS
// ============================================

export async function getDashboardStats() {
  const [jobsRes, resumesRes, contactsRes] = await Promise.all([
    supabase.from("jobs").select("*"),
    supabase.from("resumes").select("*"),
    supabase.from("contacts").select("*"),
  ]);

  const jobs = jobsRes.data || [];
  const resumes = resumesRes.data || [];
  const contacts = contactsRes.data || [];

  const totalApplications = jobs.filter((j) =>
    ["applied", "phone_screen", "technical", "final_round", "offer", "accepted"].includes(j.stage)
  ).length;

  const responsesReceived = jobs.filter((j) =>
    ["phone_screen", "technical", "final_round", "offer", "accepted"].includes(j.stage)
  ).length;

  const interviews = jobs.filter((j) =>
    ["technical", "final_round"].includes(j.stage)
  ).length;

  const offers = jobs.filter((j) => j.stage === "offer" || j.stage === "accepted").length;

  const avgMatchScore = jobs.length
    ? Math.round(jobs.reduce((sum, j) => sum + j.match_score, 0) / jobs.length)
    : 0;

  const stageDistribution = jobs.reduce((acc, job) => {
    acc[job.stage] = (acc[job.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalJobs: jobs.length,
    totalApplications,
    responseRate: totalApplications ? Math.round((responsesReceived / totalApplications) * 100) : 0,
    interviews,
    offers,
    avgMatchScore,
    stageDistribution,
    totalResumes: resumes.length,
    totalContacts: contacts.length,
    jobs,
    resumes,
    contacts,
  };
}

// ============================================
// AUTOPILOT
// ============================================

export async function getAutopilotConfig() {
  const { data, error } = await supabase
    .from("autopilot_config")
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateAutopilotConfig(updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("autopilot_config")
    .update(updates)
    .eq("id", 1)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAutopilotRuns(limit = 10) {
  const { data, error } = await supabase
    .from("autopilot_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getDiscoveredJobs(runId?: string, limit = 50) {
  let query = supabase
    .from("discovered_jobs")
    .select("*")
    .order("match_score", { ascending: false })
    .limit(limit);
  if (runId) query = query.eq("run_id", runId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getOutreachQueue(status?: string) {
  let query = supabase
    .from("outreach_queue")
    .select("*, discovered_jobs(*), recruiter_contacts(*)")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getLearningLog(limit = 20) {
  const { data, error } = await supabase
    .from("learning_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function updateDiscoveredJobStatus(
  jobId: string,
  status: string,
  skipReason?: string
) {
  const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (skipReason) updates.skip_reason = skipReason;
  const { data, error } = await supabase
    .from("discovered_jobs")
    .update(updates)
    .eq("id", jobId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function promoteToMainPipeline(discoveredJobId: string) {
  // Fetch the discovered job
  const { data: discovered, error: fetchError } = await supabase
    .from("discovered_jobs")
    .select("*")
    .eq("id", discoveredJobId)
    .single();
  if (fetchError || !discovered) throw fetchError || new Error("Job not found");

  // Create a job in the main pipeline
  const { data: pipelineJob, error: insertError } = await supabase
    .from("jobs")
    .insert({
      company: discovered.company,
      role: discovered.title,
      salary: discovered.salary_range,
      stage: "applied",
      source: `autopilot:${discovered.source}`,
      url: discovered.url,
      match_score: discovered.match_score,
      tags: discovered.keyword_matches || [],
      notes: `Auto-discovered via ${discovered.source}. Score: ${discovered.match_score}/100`,
    })
    .select()
    .single();
  if (insertError) throw insertError;

  // Link back
  await supabase
    .from("discovered_jobs")
    .update({ pipeline_job_id: pipelineJob.id, status: "applied" })
    .eq("id", discoveredJobId);

  return pipelineJob;
}

export async function getAutopilotStats() {
  const [runsRes, discoveredRes, outreachRes, learningRes] = await Promise.all([
    supabase.from("autopilot_runs").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("discovered_jobs").select("*"),
    supabase.from("outreach_queue").select("*"),
    supabase.from("learning_log").select("*").order("created_at", { ascending: false }).limit(20),
  ]);

  const runs = runsRes.data || [];
  const discovered = discoveredRes.data || [];
  const outreach = outreachRes.data || [];
  const learning = learningRes.data || [];

  return {
    totalRuns: runs.length,
    lastRun: runs[0] || null,
    totalDiscovered: discovered.length,
    totalScored: discovered.filter(d => d.status !== "discovered").length,
    totalApplied: discovered.filter(d => ["applied", "recruiter_found", "emailed", "responded"].includes(d.status)).length,
    totalEmailed: outreach.filter(o => o.status === "sent").length,
    totalResponses: outreach.filter(o => o.status === "responded").length,
    avgMatchScore: discovered.length
      ? Math.round(discovered.reduce((s, d) => s + (d.match_score || 0), 0) / discovered.length)
      : 0,
    statusBreakdown: discovered.reduce((acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    sourceBreakdown: discovered.reduce((acc, d) => {
      acc[d.source] = (acc[d.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    runs,
    discovered,
    outreach,
    learning,
  };
}
