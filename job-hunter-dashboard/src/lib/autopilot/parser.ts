// ============================================
// Indeed MCP Result Parser
// Parses markdown responses from the job search MCP
// ============================================

export interface ParsedJob {
  title: string;
  jobId: string;
  company: string;
  location: string;
  postedDate: string;
  jobType: string;
  compensation: string;
  url: string;
}

/**
 * Parse the markdown response from the Indeed MCP search_jobs tool
 * into structured job objects
 */
export function parseIndeedResults(markdown: string): ParsedJob[] {
  const jobs: ParsedJob[] = [];

  // Split by job entries — each starts with **Job Title:**
  const entries = markdown.split(/\*\*Job Title:\*\*/).filter((e) => e.trim());

  for (const entry of entries) {
    try {
      const job: ParsedJob = {
        title: extractField(entry, null) || "", // title is the first line before any field
        jobId: extractField(entry, "Job Id") || "",
        company: extractField(entry, "Company") || "",
        location: extractField(entry, "Location") || "",
        postedDate: extractField(entry, "Posted on") || "",
        jobType: extractField(entry, "Job Type") || "",
        compensation: extractField(entry, "Compensation") || "N/A",
        url: extractField(entry, "View Job URL") || "",
      };

      // The title is actually the text before the first **
      const titleMatch = entry.match(/^([^\n*]+)/);
      if (titleMatch) {
        job.title = titleMatch[1].trim();
      }

      if (job.title && job.company) {
        jobs.push(job);
      }
    } catch {
      // Skip malformed entries
      continue;
    }
  }

  return jobs;
}

function extractField(text: string, fieldName: string | null): string {
  if (fieldName === null) {
    // Extract the first line as the value
    const match = text.match(/^([^\n]+)/);
    return match ? match[1].trim() : "";
  }

  const pattern = new RegExp(`\\*\\*${fieldName}:\\*\\*\\s*(.+?)(?:\\n|$)`);
  const match = text.match(pattern);
  return match ? match[1].trim() : "";
}

/**
 * Extract a clean external ID from the Indeed job ID
 * (strip the long hash suffix for deduplication)
 */
export function cleanJobId(rawId: string): string {
  // Indeed IDs look like "5-cmh1-0-1jnfjn4p5kmnu803-fcb8caa14e8ed3de---LONGHASH"
  // We want the core part before the triple dash
  const parts = rawId.split("---");
  return parts[0] || rawId;
}

/**
 * Parse a date string like "April 29, 2026" into an ISO date
 */
export function parsePostedDate(dateStr: string): string | null {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
}
