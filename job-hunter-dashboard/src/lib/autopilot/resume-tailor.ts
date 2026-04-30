// ============================================
// Resume Tailoring Engine
// Takes master resume + job description and produces
// an ATS-optimized, role-specific resume variant
// ============================================

export interface MasterResume {
  summary: string;
  skills: string[];
  experience: string;
  education: string;
  contact: {
    name: string;
    title: string;
    phone: string;
    email: string;
    linkedin: string;
  };
}

export interface JobTarget {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  keywords: string[];
  missingKeywords: string[];
}

export interface TailoredResume {
  summaryRewrite: string;
  skillsReorder: string[];
  keywordAdditions: string[];
  fullText: string;
  atsScoreEstimate: number;
}

// Ricky's master resume data
const MASTER_RESUME: MasterResume = {
  contact: {
    name: "Ricky Long",
    title: "Frontend Software Engineer",
    phone: "318-237-1540",
    email: "rickydlong@proton.me",
    linkedin: "linkedin.com/in/rickydlong",
  },
  summary:
    "Frontend Software Engineer with 9+ years of experience building scalable, user-facing web applications using React, TypeScript, and modern JavaScript frameworks. Proven track record of delivering complex UI systems for enterprise clients including Pizza Hut, with expertise in GraphQL, Redux, REST APIs, and CI/CD pipelines. Passionate about clean code, accessible interfaces, and mentoring emerging developers.",
  skills: [
    "TypeScript",
    "JavaScript",
    "React",
    "Redux",
    "GraphQL",
    "REST API",
    "Next.js",
    "HTML5",
    "CSS3",
    "Tailwind CSS",
    "Git",
    "GitLab",
    "CI/CD",
    "Jest",
    "React Testing Library",
    "Agile/Scrum",
    "Jira",
    "Figma",
    "Node.js",
    "Webpack",
    "Vite",
  ],
  experience: `Frontend Software Engineer | Dexian (Contract - Pizza Hut) | Remote
Jan 2025 - March 2026
- Delivered scalable frontend solutions for Pizza Hut digital ordering platform using React and TypeScript
- Built and maintained component libraries consumed across multiple product teams
- Collaborated with UX designers and backend engineers to implement GraphQL-driven data flows
- Participated in code reviews, sprint planning, and cross-team architecture discussions
- Improved page load performance and accessibility compliance across key user flows

Data Analyst | TEC | Remote
May 2024 - Jan 2025
- Analyzed and visualized complex datasets to drive business decisions
- Built interactive dashboards and reporting tools
- Streamlined data collection and processing workflows

Software Development Instructor | Unitech Training Academy
Aug 2023 - May 2024
- Designed and delivered curriculum for full-stack web development bootcamp
- Mentored 50+ students through project-based learning in JavaScript, React, and Node.js
- Created assessment frameworks and hands-on coding challenges

Front-End Web Developer | Acadiana Marketing
2016 - 2023 (7 years)
- Built and maintained client websites and web applications
- Developed responsive, cross-browser compatible interfaces
- Managed client relationships and translated business requirements into technical solutions
- Led adoption of modern frameworks (React) from legacy jQuery codebases`,
  education: "B.S. Computer Science | University of Louisiana at Monroe",
};

// Skills Ricky has but might not list — used for keyword injection
const HIDDEN_SKILLS: Record<string, string[]> = {
  React: ["React.js", "React 18", "React 19", "React Hooks", "React Context"],
  TypeScript: ["TS", "Static Typing", "Type Safety"],
  JavaScript: ["ES6+", "ES2015+", "ECMAScript"],
  "Next.js": ["Next", "SSR", "Server-Side Rendering", "App Router"],
  Redux: ["Redux Toolkit", "RTK Query", "State Management"],
  GraphQL: ["Apollo Client", "Apollo GraphQL", "GQL"],
  "REST API": ["RESTful APIs", "REST", "API Integration", "API Development"],
  CSS: ["CSS3", "CSS Modules", "Styled Components", "CSS-in-JS"],
  HTML: ["HTML5", "Semantic HTML", "Web Accessibility", "WCAG"],
  Tailwind: ["Tailwind CSS", "Utility-First CSS"],
  Git: ["GitHub", "GitLab", "Version Control", "Git Flow"],
  "CI/CD": ["Continuous Integration", "Continuous Deployment", "Pipeline"],
  Jest: ["Unit Testing", "Integration Testing", "Test-Driven Development"],
  Agile: ["Scrum", "Sprint Planning", "Kanban", "Agile Methodology"],
  "Node.js": ["Node", "Express", "Backend JavaScript"],
  Figma: ["Design Handoff", "UI/UX Collaboration"],
  Webpack: ["Module Bundling", "Build Tools"],
  Vite: ["Build Tools", "Dev Server"],
};

/**
 * Tailor the master resume for a specific job
 */
export function tailorResume(target: JobTarget): TailoredResume {
  // 1. Rewrite summary to match the role
  const summaryRewrite = generateSummary(target);

  // 2. Reorder skills — matched keywords first, then remaining
  const skillsReorder = reorderSkills(target);

  // 3. Identify keywords to inject
  const keywordAdditions = findKeywordAdditions(target);

  // 4. Generate full resume text
  const fullText = assembleResume(summaryRewrite, skillsReorder, target);

  // 5. Estimate ATS score
  const atsScoreEstimate = estimateAtsScore(fullText, target);

  return {
    summaryRewrite,
    skillsReorder,
    keywordAdditions,
    fullText,
    atsScoreEstimate,
  };
}

function generateSummary(target: JobTarget): string {
  const { title, company } = target;
  const matchedKeywords = target.keywords.filter((k) =>
    MASTER_RESUME.skills.some(
      (s) => s.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(s.toLowerCase())
    )
  );

  // Build a summary that naturally incorporates the target role and matched keywords
  const keySkills = matchedKeywords.slice(0, 5).join(", ");
  const roleTitle = title.includes("Frontend")
    ? "Frontend Software Engineer"
    : title.includes("Full") || title.includes("Fullstack")
    ? "Full-Stack Software Engineer"
    : "Software Engineer";

  let summary = `${roleTitle} with 9+ years of experience building scalable, user-facing web applications`;

  if (keySkills) {
    summary += ` using ${keySkills}`;
  } else {
    summary += " using React, TypeScript, and modern JavaScript frameworks";
  }

  summary +=
    ". Proven track record of delivering complex UI systems for enterprise clients including Pizza Hut";

  // Add company-relevant context
  if (company) {
    summary += `. Excited to bring deep frontend expertise to ${company}`;
  }

  summary +=
    ", with strengths in component architecture, performance optimization, and cross-team collaboration.";

  return summary;
}

function reorderSkills(target: JobTarget): string[] {
  const targetKeywords = new Set(target.keywords.map((k) => k.toLowerCase()));
  const matched: string[] = [];
  const unmatched: string[] = [];

  for (const skill of MASTER_RESUME.skills) {
    if (
      targetKeywords.has(skill.toLowerCase()) ||
      target.keywords.some(
        (k) =>
          skill.toLowerCase().includes(k.toLowerCase()) ||
          k.toLowerCase().includes(skill.toLowerCase())
      )
    ) {
      matched.push(skill);
    } else {
      unmatched.push(skill);
    }
  }

  // Matched keywords first, then remaining skills
  return [...matched, ...unmatched];
}

function findKeywordAdditions(target: JobTarget): string[] {
  const additions: string[] = [];

  for (const keyword of target.missingKeywords) {
    // Check if we have a hidden skill alias
    const aliases = HIDDEN_SKILLS[keyword];
    if (aliases) {
      // We actually know this — just need to make it explicit
      additions.push(keyword);
    }
  }

  return additions;
}

function assembleResume(
  summary: string,
  skills: string[],
  target: JobTarget
): string {
  const { contact } = MASTER_RESUME;

  // Adjust title to match target role
  const displayTitle = target.title.includes("Frontend")
    ? "Frontend Software Engineer"
    : target.title.includes("Full") || target.title.includes("Fullstack")
    ? "Full-Stack Software Engineer"
    : "Software Engineer";

  const sections = [
    `${contact.name}`,
    `${displayTitle}`,
    `${contact.phone} | ${contact.email} | ${contact.linkedin}`,
    "",
    "PROFESSIONAL SUMMARY",
    summary,
    "",
    "TECHNICAL SKILLS",
    formatSkills(skills, target),
    "",
    "PROFESSIONAL EXPERIENCE",
    "",
    MASTER_RESUME.experience,
    "",
    "EDUCATION",
    MASTER_RESUME.education,
  ];

  return sections.join("\n");
}

function formatSkills(skills: string[], target: JobTarget): string {
  // Group skills into categories for ATS readability
  const languages = skills.filter((s) =>
    ["TypeScript", "JavaScript", "HTML5", "CSS3"].includes(s)
  );
  const frameworks = skills.filter((s) =>
    ["React", "Redux", "Next.js", "GraphQL", "REST API", "Node.js", "Tailwind CSS"].includes(s)
  );
  const tools = skills.filter((s) =>
    ["Git", "GitLab", "Jira", "Figma", "Webpack", "Vite"].includes(s)
  );
  const testing = skills.filter((s) =>
    ["Jest", "React Testing Library"].includes(s)
  );
  const practices = skills.filter((s) =>
    ["CI/CD", "Agile/Scrum"].includes(s)
  );

  const lines = [];
  if (languages.length) lines.push(`Languages: ${languages.join(", ")}`);
  if (frameworks.length) lines.push(`Frameworks & Libraries: ${frameworks.join(", ")}`);
  if (tools.length) lines.push(`Tools: ${tools.join(", ")}`);
  if (testing.length) lines.push(`Testing: ${testing.join(", ")}`);
  if (practices.length) lines.push(`Methodologies: ${practices.join(", ")}`);

  // Add any missing keywords the job wants that we can credibly claim
  const additions = target.missingKeywords.filter((k) => HIDDEN_SKILLS[k]);
  if (additions.length) {
    lines.push(`Additional: ${additions.join(", ")}`);
  }

  return lines.join("\n");
}

function estimateAtsScore(fullText: string, target: JobTarget): number {
  const textLower = fullText.toLowerCase();
  let score = 50; // Base score for having a properly formatted resume

  // Keyword presence (+3 per keyword found)
  let keywordsFound = 0;
  for (const keyword of target.keywords) {
    if (textLower.includes(keyword.toLowerCase())) {
      keywordsFound++;
    }
  }

  if (target.keywords.length > 0) {
    const ratio = keywordsFound / target.keywords.length;
    score += Math.round(ratio * 30); // up to +30 for full keyword coverage
  }

  // Structure bonus (+10 for having standard sections)
  const sections = ["summary", "skills", "experience", "education"];
  const sectionsFound = sections.filter((s) => textLower.includes(s)).length;
  score += Math.round((sectionsFound / sections.length) * 10);

  // Contact info present (+5)
  if (textLower.includes("@") && textLower.includes("linkedin")) {
    score += 5;
  }

  // Role title match (+5)
  if (textLower.includes(target.title.toLowerCase().split(" ")[0])) {
    score += 5;
  }

  return Math.min(score, 100);
}

export { MASTER_RESUME };
