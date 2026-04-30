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
  linkedin_url?: string;
  tag?: ContactTag;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from("contacts")
    .insert(contact)
    .select()
    .single();
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
