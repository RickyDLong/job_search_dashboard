// ─── Types ───────────────────────────────────────────
export type PipelineStage =
  | "discovered"
  | "saved"
  | "applied"
  | "phone_screen"
  | "technical"
  | "final_round"
  | "offer"
  | "accepted"
  | "rejected";

export interface Job {
  id: string;
  company: string;
  role: string;
  salary: string;
  location: string;
  matchScore: number;
  stage: PipelineStage;
  appliedDate: string | null;
  daysInStage: number;
  redFlags: string[];
  tags: string[];
  source: string;
  url: string;
  contactId?: string;
  resumeId?: string;
  notes: string;
  dualContractCompatible: boolean;
}

export interface Resume {
  id: string;
  name: string;
  type: "master" | "tailored";
  linkedJobId?: string;
  linkedJobTitle?: string;
  atsScore: number;
  keywords: string[];
  lastModified: string;
  version: number;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  linkedin: string;
  tag: "warm" | "cold" | "referral" | "internal";
  lastContact: string;
  nextFollowUp: string | null;
  notes: string;
}

export interface Company {
  id: string;
  name: string;
  glassdoorRating: number;
  funding: string;
  headcount: string;
  remotePolicy: "fully_remote" | "hybrid" | "onsite";
  redFlags: string[];
  openPositions: number;
  notes: string;
}

// ─── Stage Config ────────────────────────────────────
export const STAGE_CONFIG: Record<PipelineStage, { label: string; color: string; bgColor: string }> = {
  discovered: { label: "Discovered", color: "#06b6d4", bgColor: "rgba(6, 182, 212, 0.12)" },
  saved: { label: "Saved", color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.12)" },
  applied: { label: "Applied", color: "#00d4aa", bgColor: "rgba(0, 212, 170, 0.12)" },
  phone_screen: { label: "Phone Screen", color: "#f0a500", bgColor: "rgba(240, 165, 0, 0.12)" },
  technical: { label: "Technical", color: "#6366f1", bgColor: "rgba(99, 102, 241, 0.12)" },
  final_round: { label: "Final Round", color: "#8b5cf6", bgColor: "rgba(139, 92, 246, 0.12)" },
  offer: { label: "Offer", color: "#10b981", bgColor: "rgba(16, 185, 129, 0.12)" },
  accepted: { label: "Accepted", color: "#00d4aa", bgColor: "rgba(0, 212, 170, 0.12)" },
  rejected: { label: "Rejected", color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.12)" },
};

// ─── Mock Jobs ───────────────────────────────────────
export const mockJobs: Job[] = [
  {
    id: "j1", company: "Vercel", role: "Senior Frontend Engineer", salary: "$165K–$195K",
    location: "Remote (US)", matchScore: 94, stage: "technical", appliedDate: "2026-04-15",
    daysInStage: 5, redFlags: [], tags: ["React", "Next.js", "TypeScript"],
    source: "LinkedIn", url: "#", notes: "Strong culture fit. 2nd round scheduled.",
    dualContractCompatible: false, contactId: "c1", resumeId: "r2",
  },
  {
    id: "j2", company: "Stripe", role: "Frontend Engineer, Payments", salary: "$170K–$210K",
    location: "Remote (US)", matchScore: 91, stage: "applied", appliedDate: "2026-04-22",
    daysInStage: 8, redFlags: [], tags: ["React", "TypeScript", "Design Systems"],
    source: "Careers Page", url: "#", notes: "Applied with tailored resume.",
    dualContractCompatible: false, contactId: "c2", resumeId: "r3",
  },
  {
    id: "j3", company: "Hashicorp", role: "Staff Frontend Engineer", salary: "$180K–$220K",
    location: "Remote (US)", matchScore: 88, stage: "phone_screen", appliedDate: "2026-04-18",
    daysInStage: 3, redFlags: ["Recent layoffs Q1 2026"], tags: ["React", "Vue", "Terraform UI"],
    source: "Recruiter", url: "#", notes: "Recruiter reached out. IBM acquisition concerns.",
    dualContractCompatible: false, contactId: "c3",
  },
  {
    id: "j4", company: "Linear", role: "Frontend Engineer", salary: "$150K–$180K",
    location: "Remote (Global)", matchScore: 92, stage: "discovered", appliedDate: null,
    daysInStage: 1, redFlags: [], tags: ["React", "TypeScript", "Performance"],
    source: "Job Hunter Agent", url: "#", notes: "Auto-discovered. High match.",
    dualContractCompatible: true,
  },
  {
    id: "j5", company: "Notion", role: "Senior Frontend Engineer", salary: "$160K–$190K",
    location: "Remote (US)", matchScore: 87, stage: "saved", appliedDate: null,
    daysInStage: 4, redFlags: [], tags: ["React", "TypeScript", "Collaboration"],
    source: "WeWorkRemotely", url: "#", notes: "Great product. Worth applying.",
    dualContractCompatible: true,
  },
  {
    id: "j6", company: "Webflow", role: "Frontend Engineer, Editor", salary: "$145K–$175K",
    location: "Remote (US)", matchScore: 85, stage: "applied", appliedDate: "2026-04-20",
    daysInStage: 10, redFlags: ["Slow response time"], tags: ["React", "Canvas", "CSS"],
    source: "Arc.dev", url: "#", notes: "No response yet. Follow up needed.",
    dualContractCompatible: true,
  },
  {
    id: "j7", company: "Figma", role: "Frontend Engineer, FigJam", salary: "$160K–$200K",
    location: "Remote (US)", matchScore: 90, stage: "discovered", appliedDate: null,
    daysInStage: 2, redFlags: [], tags: ["React", "TypeScript", "Canvas API"],
    source: "Job Hunter Agent", url: "#", notes: "Adobe deal fell through. Independent again.",
    dualContractCompatible: false,
  },
  {
    id: "j8", company: "Supabase", role: "Frontend Engineer, Dashboard", salary: "$140K–$170K",
    location: "Remote (Global)", matchScore: 89, stage: "offer", appliedDate: "2026-04-01",
    daysInStage: 2, redFlags: [], tags: ["React", "Next.js", "PostgreSQL"],
    source: "Referral", url: "#", notes: "Offer received! Reviewing terms.",
    dualContractCompatible: true, contactId: "c4", resumeId: "r4",
  },
  {
    id: "j9", company: "Coinbase", role: "Senior Frontend Engineer", salary: "$175K–$215K",
    location: "Remote (US)", matchScore: 78, stage: "rejected", appliedDate: "2026-03-28",
    daysInStage: 0, redFlags: ["Crypto volatility", "Recent layoffs"], tags: ["React", "Web3"],
    source: "LinkedIn", url: "#", notes: "Rejected after technical round.",
    dualContractCompatible: false,
  },
  {
    id: "j10", company: "Planetscale", role: "Frontend Engineer", salary: "$150K–$180K",
    location: "Remote (US)", matchScore: 86, stage: "discovered", appliedDate: null,
    daysInStage: 1, redFlags: [], tags: ["React", "TypeScript", "MySQL"],
    source: "Job Hunter Agent", url: "#", notes: "Auto-discovered. Good remote culture.",
    dualContractCompatible: true,
  },
];

// ─── Mock Resumes ────────────────────────────────────
export const mockResumes: Resume[] = [
  {
    id: "r1", name: "Ricky Long — Master Resume", type: "master",
    atsScore: 82, keywords: ["React", "TypeScript", "Next.js", "Vue", "Tailwind", "Accessibility", "Design Systems", "Node.js", "CI/CD", "GitLab"],
    lastModified: "2026-04-28", version: 5,
  },
  {
    id: "r2", name: "Tailored — Vercel Senior FE", type: "tailored", linkedJobId: "j1",
    linkedJobTitle: "Vercel — Senior Frontend Engineer",
    atsScore: 96, keywords: ["Next.js", "React", "Vercel", "Edge Functions", "Performance", "TypeScript"],
    lastModified: "2026-04-14", version: 2,
  },
  {
    id: "r3", name: "Tailored — Stripe FE Payments", type: "tailored", linkedJobId: "j2",
    linkedJobTitle: "Stripe — Frontend Engineer, Payments",
    atsScore: 93, keywords: ["React", "TypeScript", "Design Systems", "Payments UI", "Accessibility"],
    lastModified: "2026-04-21", version: 1,
  },
  {
    id: "r4", name: "Tailored — Supabase Dashboard", type: "tailored", linkedJobId: "j8",
    linkedJobTitle: "Supabase — Frontend Engineer, Dashboard",
    atsScore: 91, keywords: ["React", "Next.js", "PostgreSQL", "Dashboard", "Supabase"],
    lastModified: "2026-04-01", version: 1,
  },
];

// ─── Mock Contacts ───────────────────────────────────
export const mockContacts: Contact[] = [
  {
    id: "c1", name: "Sarah Chen", role: "Engineering Manager", company: "Vercel",
    email: "sarah.c@vercel.com", linkedin: "#", tag: "warm",
    lastContact: "2026-04-25", nextFollowUp: "2026-05-02",
    notes: "Met at React Conf. Referred me to the team.",
  },
  {
    id: "c2", name: "Marcus Johnson", role: "Technical Recruiter", company: "Stripe",
    email: "m.johnson@stripe.com", linkedin: "#", tag: "cold",
    lastContact: "2026-04-22", nextFollowUp: "2026-04-30",
    notes: "Initial outreach via LinkedIn. Responsive.",
  },
  {
    id: "c3", name: "Priya Patel", role: "Senior Recruiter", company: "Hashicorp",
    email: "priya@hashicorp.com", linkedin: "#", tag: "referral",
    lastContact: "2026-04-18", nextFollowUp: "2026-05-01",
    notes: "Reached out proactively. Seems genuinely interested.",
  },
  {
    id: "c4", name: "Tom Wilson", role: "VP Engineering", company: "Supabase",
    email: "tom@supabase.com", linkedin: "#", tag: "warm",
    lastContact: "2026-04-28", nextFollowUp: null,
    notes: "Extended offer. Negotiating terms.",
  },
  {
    id: "c5", name: "Jessica Lee", role: "Hiring Manager", company: "Linear",
    email: "jessica@linear.app", linkedin: "#", tag: "cold",
    lastContact: "2026-04-26", nextFollowUp: "2026-05-03",
    notes: "Found on LinkedIn. Haven't connected yet.",
  },
];

// ─── Mock Companies ──────────────────────────────────
export const mockCompanies: Company[] = [
  { id: "co1", name: "Vercel", glassdoorRating: 4.5, funding: "Series D ($250M)", headcount: "400-500", remotePolicy: "fully_remote", redFlags: [], openPositions: 3, notes: "Strong remote-first culture. Next.js creators." },
  { id: "co2", name: "Stripe", glassdoorRating: 4.2, funding: "Late Stage ($6.5B)", headcount: "8000+", remotePolicy: "fully_remote", redFlags: [], openPositions: 5, notes: "Excellent engineering culture. Competitive comp." },
  { id: "co3", name: "Hashicorp", glassdoorRating: 3.8, funding: "Acquired by IBM", headcount: "2000+", remotePolicy: "fully_remote", redFlags: ["Recent layoffs Q1 2026", "IBM acquisition uncertainty"], openPositions: 2, notes: "IBM acquisition may affect culture." },
  { id: "co4", name: "Linear", glassdoorRating: 4.7, funding: "Series B ($52M)", headcount: "60-80", remotePolicy: "fully_remote", redFlags: [], openPositions: 2, notes: "Small team, great product. Async-first." },
  { id: "co5", name: "Supabase", glassdoorRating: 4.6, funding: "Series C ($116M)", headcount: "150-200", remotePolicy: "fully_remote", redFlags: [], openPositions: 4, notes: "Open source company. Great dev community." },
  { id: "co6", name: "Figma", glassdoorRating: 4.4, funding: "Independent ($400M raised)", headcount: "1200+", remotePolicy: "fully_remote", redFlags: [], openPositions: 3, notes: "Post-Adobe independence. Strong trajectory." },
];

// ─── KPI Data ────────────────────────────────────────
export const kpiData = {
  totalApplications: 24,
  responseRate: 42,
  interviewsScheduled: 4,
  offersPending: 1,
  avgMatchScore: 88,
  avgDaysToResponse: 6.2,
};

// ─── Chart Data ──────────────────────────────────────
export const weeklyApplications = [
  { week: "Mar 3", applications: 3, responses: 1 },
  { week: "Mar 10", applications: 5, responses: 2 },
  { week: "Mar 17", applications: 4, responses: 1 },
  { week: "Mar 24", applications: 6, responses: 3 },
  { week: "Mar 31", applications: 3, responses: 1 },
  { week: "Apr 7", applications: 7, responses: 3 },
  { week: "Apr 14", applications: 5, responses: 2 },
  { week: "Apr 21", applications: 4, responses: 2 },
  { week: "Apr 28", applications: 2, responses: 1 },
];

export const pipelineFunnel = [
  { stage: "Discovered", count: 42, color: "#06b6d4" },
  { stage: "Applied", count: 24, color: "#00d4aa" },
  { stage: "Screening", count: 10, color: "#f0a500" },
  { stage: "Interview", count: 6, color: "#6366f1" },
  { stage: "Offer", count: 1, color: "#8b5cf6" },
];

export const sourceBreakdown = [
  { source: "Job Hunter Agent", count: 14, rate: 38 },
  { source: "LinkedIn", count: 8, rate: 25 },
  { source: "Referral", count: 4, rate: 75 },
  { source: "Careers Page", count: 6, rate: 33 },
  { source: "Arc.dev", count: 3, rate: 20 },
  { source: "WeWorkRemotely", count: 7, rate: 29 },
];
