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

// Monroe/West Monroe, LA metro area — cities within ~1hr drive
const LOCAL_AREA_CITIES = [
  "monroe", "west monroe", "ruston", "bastrop", "shreveport",
  "bossier city", "natchitoches", "alexandria", "jonesboro",
  "winnsboro", "tallulah", "farmerville", "rayville",
];

/**
 * Check if a location is acceptable:
 * - Remote/hybrid positions always pass
 * - On-site positions only pass if within Monroe/West Monroe LA area
 */
export function isLocationAcceptable(location: string): boolean {
  const loc = (location || "").toLowerCase();
  if (loc.includes("remote") || loc.includes("hybrid") || loc.includes("anywhere")) return true;
  return LOCAL_AREA_CITIES.some((city) => loc.includes(city)) || loc.includes(", la");
}

const DEFAULT_PROFILE: ScoringProfile = {
  targetRoles: [
    // ── Frontend / Web ──
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
    "Fullstack Developer",
    "Full-Stack Engineer",
    "Application Engineer",
    "Front End Engineer",
    "Front-End Developer",
    // ── UI/UX ──
    "UI/UX Designer",
    "UX Designer",
    "UI Designer",
    "UX Engineer",
    "Product Designer",
    "Design Engineer",
    "UI/UX Engineer",
    // ── AI / ML / Prompt Engineering ──
    "AI Engineer",
    "Machine Learning Engineer",
    "Prompt Engineer",
    "AI Developer",
    "AI/ML Engineer",
    "AI Solutions Engineer",
    "Applied AI Engineer",
    // ── Business Analyst ──
    "Business Analyst",
    "Business Systems Analyst",
    "Technical Business Analyst",
    "Product Analyst",
    "Data Analyst",
    // ── Vibe Coding / AI-Assisted Dev ──
    "AI-Assisted Developer",
    "Vibe Coder",
    "Low-Code Developer",
    "No-Code Developer",
    "Automation Engineer",
  ],
  targetKeywords: [
    // Core frontend
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
    // UI/UX
    "Figma",
    "Design Systems",
    "User Research",
    "Prototyping",
    "Accessibility",
    "Responsive Design",
    // AI / ML
    "AI",
    "Machine Learning",
    "LLM",
    "Prompt Engineering",
    "Claude",
    "GPT",
    "OpenAI",
    "Anthropic",
    "Python",
    "AI Agents",
    // Business Analysis
    "Jira",
    "Requirements",
    "Stakeholder",
    "SQL",
    "Data Analysis",
    "Process Improvement",
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
    const roleTerms = [
      "frontend", "front-end", "front end", "react", "software engineer",
      "web developer", "ui engineer", "full stack", "fullstack",
      "ux", "ui/ux", "designer", "product designer", "design engineer",
      "ai engineer", "machine learning", "ml engineer", "prompt",
      "business analyst", "data analyst", "analyst",
      "automation", "low-code", "no-code", "vibe",
    ];
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

  // ── Location filter (0-15 points) ──
  // Remote positions get full points; Monroe/West Monroe area gets partial; everything else is rejected
  const locationLower = (location || "").toLowerCase();
  if (!isLocationAcceptable(locationLower)) {
    return {
      score: 0,
      keywordMatches,
      missingKeywords,
      reasoning: `Location not acceptable: ${location} (must be Remote or Monroe/West Monroe LA area)`,
    };
  }

  if (locationLower.includes("remote") || fullText.includes("remote")) {
    score += 15;
    reasons.push("Remote position (+15)");
  } else if (locationLower.includes("hybrid")) {
    score += 10;
    reasons.push("Hybrid position - local area (+10)");
  } else if (LOCAL_AREA_CITIES.some((c) => locationLower.includes(c))) {
    score += 10;
    reasons.push("Local Monroe/West Monroe area (+10)");
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
