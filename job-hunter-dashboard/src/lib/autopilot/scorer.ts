// ============================================
// Job Match Scorer
// Scores discovered jobs against Ricky's profile
// ============================================

export interface ScoringProfile {
  targetRoles: string[];
  targetKeywords: string[];
  excludedCompanies: string[];
  minSalary?: number;
}

export interface ScoringResult {
  score: number; // 0-100
  keywordMatches: string[];
  missingKeywords: string[];
  reasoning: string;
}

const DEFAULT_PROFILE: ScoringProfile = {
  targetRoles: [
    "Frontend Engineer",
    "Software Engineer",
    "React Developer",
    "Frontend Developer",
    "UI Engineer",
    "Full Stack Engineer",
    "Web Developer",
    "Staff Frontend Engineer",
    "Senior Frontend Engineer",
    "Senior Software Engineer",
  ],
  targetKeywords: [
    "React",
    "TypeScript",
    "JavaScript",
    "Next.js",
    "Redux",
    "GraphQL",
    "REST API",
    "CSS",
    "HTML",
    "Tailwind",
    "Node.js",
    "Git",
    "CI/CD",
    "Jest",
    "Agile",
  ],
  excludedCompanies: [],
  minSalary: 90000,
};

export function scoreJob(
  title: string,
  company: string,
  description: string,
  salary?: string,
  location?: string,
  profile: ScoringProfile = DEFAULT_PROFILE
): ScoringResult {
  let score = 0;
  const reasons: string[] = [];
  const keywordMatches: string[] = [];
  const missingKeywords: string[] = [];

  const titleLower = title.toLowerCase();
  const descLower = (description || "").toLowerCase();
  const fullText = `${titleLower} ${descLower}`;

  // ── Excluded companies (instant reject) ──
  if (
    profile.excludedCompanies.some(
      (c) => company.toLowerCase().includes(c.toLowerCase())
    )
  ) {
    return {
      score: 0,
      keywordMatches: [],
      missingKeywords: profile.targetKeywords,
      reasoning: `Excluded company: ${company}`,
    };
  }

  // ── Role match (0-30 points) ──
  const roleMatch = profile.targetRoles.find((role) =>
    titleLower.includes(role.toLowerCase())
  );
  if (roleMatch) {
    score += 30;
    reasons.push(`Role match: "${roleMatch}"`);
  } else {
    // Partial role match
    const roleTerms = ["frontend", "front-end", "react", "software engineer", "web developer", "ui engineer", "full stack"];
    const partialMatch = roleTerms.find((t) => titleLower.includes(t));
    if (partialMatch) {
      score += 15;
      reasons.push(`Partial role match: "${partialMatch}"`);
    } else {
      reasons.push("No role match in title");
    }
  }

  // ── Keyword matching (0-40 points) ──
  for (const keyword of profile.targetKeywords) {
    const keyLower = keyword.toLowerCase();
    // Check both title and description
    if (fullText.includes(keyLower)) {
      keywordMatches.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  }
  const keywordRatio = keywordMatches.length / profile.targetKeywords.length;
  const keywordScore = Math.round(keywordRatio * 40);
  score += keywordScore;
  reasons.push(
    `${keywordMatches.length}/${profile.targetKeywords.length} keywords matched (+${keywordScore})`
  );

  // ── Remote preference (0-15 points) ──
  const locationLower = (location || "").toLowerCase();
  if (locationLower.includes("remote") || fullText.includes("remote")) {
    score += 15;
    reasons.push("Remote position (+15)");
  } else if (locationLower.includes("hybrid")) {
    score += 5;
    reasons.push("Hybrid position (+5)");
  }

  // ── Salary alignment (0-15 points) ──
  if (salary && profile.minSalary) {
    const salaryNum = parseSalary(salary);
    if (salaryNum) {
      if (salaryNum >= profile.minSalary * 1.3) {
        score += 15;
        reasons.push(`Strong salary: $${salaryNum.toLocaleString()} (+15)`);
      } else if (salaryNum >= profile.minSalary) {
        score += 10;
        reasons.push(`Good salary: $${salaryNum.toLocaleString()} (+10)`);
      } else if (salaryNum >= profile.minSalary * 0.8) {
        score += 5;
        reasons.push(`Below target salary: $${salaryNum.toLocaleString()} (+5)`);
      } else {
        reasons.push(`Low salary: $${salaryNum.toLocaleString()} (+0)`);
      }
    }
  }

  // ── Seniority bonus ──
  if (titleLower.includes("senior") || titleLower.includes("staff") || titleLower.includes("lead")) {
    // Already experienced — these are good matches
    score = Math.min(score + 5, 100);
    reasons.push("Seniority level match (+5)");
  }

  // ── Red flag penalties ──
  const redFlags = ["clearance required", "security clearance", "on-site only", "no remote"];
  for (const flag of redFlags) {
    if (fullText.includes(flag)) {
      score = Math.max(score - 10, 0);
      reasons.push(`Red flag: "${flag}" (-10)`);
    }
  }

  return {
    score: Math.min(Math.max(score, 0), 100),
    keywordMatches,
    missingKeywords,
    reasoning: reasons.join("; "),
  };
}

function parseSalary(salaryStr: string): number | null {
  if (!salaryStr || salaryStr === "N/A") return null;

  // Extract numbers from salary string
  const numbers = salaryStr.match(/[\d,]+/g);
  if (!numbers || numbers.length === 0) return null;

  const parsed = numbers.map((n) => parseInt(n.replace(/,/g, ""), 10));

  // If range, take the midpoint
  if (parsed.length >= 2) {
    return Math.round((parsed[0] + parsed[1]) / 2);
  }
  return parsed[0];
}

export { DEFAULT_PROFILE };
