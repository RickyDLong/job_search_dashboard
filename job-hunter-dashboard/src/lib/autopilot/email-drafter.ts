// ============================================
// Email Drafting System
// Generates recruiter outreach emails in Ricky's
// natural voice — no AI language, no em dashes
// ============================================

export interface RecruiterInfo {
  name: string;
  title?: string;
  company: string;
}

export interface JobContext {
  title: string;
  company: string;
  matchScore: number;
  keywordMatches: string[];
  salaryRange?: string;
  url?: string;
}

export interface DraftedEmail {
  subject: string;
  body: string;
}

// ── Voice Rules ──────────────────────────────
// Ricky's writing style:
// - Direct, confident, not overly formal
// - No em dashes (—), use commas or periods instead
// - No "I hope this email finds you well"
// - No "I am writing to express my interest in"
// - No "I believe I would be a great fit"
// - No "please don't hesitate to reach out"
// - No "I would love the opportunity to"
// - Short paragraphs, gets to the point
// - Mentions specific tech/experience, not vague claims
// - Signs off simply: "Thanks," or "Appreciate it,"
// ─────────────────────────────────────────────

const BANNED_PHRASES = [
  "I hope this email finds you well",
  "I hope this message finds you",
  "I am writing to express",
  "I believe I would be",
  "please don't hesitate",
  "I would love the opportunity",
  "I'm reaching out because",
  "I came across your",
  "I'm excited about the possibility",
  "I'm confident that",
  "passionate about",
  "synergy",
  "leverage my skills",
  "hit the ground running",
  "dynamic team",
  "fast-paced environment",
];

/**
 * Generate a cold outreach email to a recruiter
 */
export function draftColdOutreach(
  recruiter: RecruiterInfo,
  job: JobContext
): DraftedEmail {
  const template = pickTemplate(job);
  const subject = generateSubject(job, recruiter);
  const body = fillTemplate(template, recruiter, job);

  // Validate no banned phrases slipped in
  const cleaned = removeBannedPhrases(body);

  return { subject, body: cleaned };
}

/**
 * Generate a follow-up email
 */
export function draftFollowUp(
  recruiter: RecruiterInfo,
  job: JobContext,
  daysSinceInitial: number
): DraftedEmail {
  const subject = `Re: ${job.title} - Following up`;

  let body = `Hey ${recruiter.name.split(" ")[0]},\n\n`;

  if (daysSinceInitial <= 5) {
    body += `Just wanted to bump this in case it got buried. Still interested in the ${job.title} role`;
    if (job.company) body += ` at ${job.company}`;
    body += ".\n\n";
    body += "Happy to jump on a quick call whenever works for you.\n\n";
  } else {
    body += `Circling back on the ${job.title} position. I know things get busy, so no worries if the timing isn't right.\n\n`;
    body += `Still building with React and TypeScript daily, and the role looks like a strong fit for what I've been doing. Let me know if it makes sense to connect.\n\n`;
  }

  body += "Thanks,\nRicky";

  return { subject, body };
}

// ── Templates ────────────────────────────────

type TemplateId = "direct" | "referral" | "value_add";

interface EmailTemplate {
  id: TemplateId;
  opener: string;
  body: string;
  closer: string;
}

const TEMPLATES: EmailTemplate[] = [
  {
    id: "direct",
    opener: "Hey {{firstName}},\n\nSaw the {{jobTitle}} role{{atCompany}} and wanted to reach out.",
    body: "I've been doing frontend work for 9+ years, most recently building the digital ordering platform at Pizza Hut with React and TypeScript. {{techMatch}} The role checks a lot of boxes for what I'm looking for.",
    closer: "Would be great to chat if you think there's a fit. Here's my LinkedIn: linkedin.com/in/rickydlong\n\nThanks,\nRicky",
  },
  {
    id: "referral",
    opener: "Hey {{firstName}},\n\n{{jobTitle}}{{atCompany}} caught my eye.",
    body: "Quick background: 9 years in frontend, React/TypeScript focused. Last contract was at Pizza Hut through Dexian where I was building component libraries and working with GraphQL. {{techMatch}}",
    closer: "If the role is still open, I'd like to learn more about it. Happy to send over my resume or jump on a call.\n\nAppreciate it,\nRicky",
  },
  {
    id: "value_add",
    opener: "Hey {{firstName}},\n\nI came across the {{jobTitle}} opening{{atCompany}}.",
    body: "I've spent the last 9 years building frontend systems, from enterprise platforms (Pizza Hut's ordering app) to component libraries used across multiple teams. {{techMatch}} I also taught a full-stack bootcamp for a year, which sharpened how I communicate technical decisions.",
    closer: "Would love to hear more about what the team is working on. My LinkedIn is linkedin.com/in/rickydlong if you want to check out my background first.\n\nThanks,\nRicky",
  },
];

function pickTemplate(job: JobContext): EmailTemplate {
  // Rotate templates based on match score to add variety
  if (job.matchScore >= 65) return TEMPLATES[0]; // Direct for strong matches
  if (job.matchScore >= 50) return TEMPLATES[2]; // Value add for mid matches
  return TEMPLATES[1]; // Referral style for others
}

function generateSubject(job: JobContext, recruiter: RecruiterInfo): string {
  const subjects = [
    `${job.title} - Frontend Engineer with 9+ years React/TS`,
    `Re: ${job.title} at ${job.company}`,
    `${job.title} - Ricky Long, Frontend Engineer`,
    `Interested in the ${job.title} role`,
  ];

  // Pick based on some deterministic variation
  const index = (job.company.length + job.title.length) % subjects.length;
  return subjects[index];
}

function fillTemplate(
  template: EmailTemplate,
  recruiter: RecruiterInfo,
  job: JobContext
): string {
  const firstName = recruiter.name.split(" ")[0];
  const atCompany = job.company ? ` at ${job.company}` : "";

  // Build tech match sentence based on what keywords overlap
  let techMatch = "";
  if (job.keywordMatches.length > 0) {
    const techs = job.keywordMatches.slice(0, 4).join(", ");
    techMatch = `I work with ${techs} daily, so the stack lines up well.`;
  } else {
    techMatch = "My stack is React, TypeScript, Next.js, and GraphQL, which seems to line up with what you're looking for.";
  }

  const parts = [template.opener, template.body, template.closer];
  let email = parts.join("\n\n");

  // Replace placeholders
  email = email.replace(/\{\{firstName\}\}/g, firstName);
  email = email.replace(/\{\{jobTitle\}\}/g, job.title);
  email = email.replace(/\{\{atCompany\}\}/g, atCompany);
  email = email.replace(/\{\{techMatch\}\}/g, techMatch);
  email = email.replace(/\{\{company\}\}/g, job.company);

  return email;
}

function removeBannedPhrases(text: string): string {
  let cleaned = text;

  // Remove em dashes
  cleaned = cleaned.replace(/—/g, ",");
  cleaned = cleaned.replace(/–/g, "-");

  // Check for banned phrases (shouldn't happen with our templates, but safety net)
  for (const phrase of BANNED_PHRASES) {
    if (cleaned.toLowerCase().includes(phrase.toLowerCase())) {
      console.warn(`[Email Drafter] Banned phrase detected: "${phrase}"`);
    }
  }

  return cleaned;
}

export { BANNED_PHRASES, TEMPLATES };
