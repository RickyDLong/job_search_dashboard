# Outreach Draft — Viktor (Zeta Labs)

**Position:** Software Engineer (Remote)
**Applied:** April 30, 2026 — BLOCKED (Ashby flagged as spam)
**Source:** Indeed → Ashby ATS
**Status:** NEEDS MANUAL RESUBMIT
**URL:** https://jobs.ashbyhq.com/viktor/aa2001e4-81a6-4e9f-bfc8-49c34db43eba/application
**Note:** Form was fully filled out but Ashby's anti-bot flagged the submission. Ricky needs to resubmit manually — all fields were populated correctly.

---

## Application Answers (copy-paste ready for manual resubmit)

**Name:** Ricky Long
**Email:** rickydlong@proton.me
**Location:** West Monroe, LA, USA
**LinkedIn:** https://linkedin.com/in/rickydlong
**GitHub:** https://github.com/rickydlong
**Resume:** Ricky Long - Viktor (AI Engineer Remote).pdf
**Work Auth:** US work authorized

### Link to code/project you're most proud of:
I built a full-stack Job Search Command Center using Next.js, TypeScript, Supabase, and Tailwind CSS. It features a Kanban pipeline with drag-and-drop, a contacts CRM, company intelligence page, analytics dashboard, and an automation engine that discovers jobs via API scraping, scores them against my profile, tailors resumes per role, and drafts outreach emails. I'm most proud of the scoring engine — it weights tech stack overlap, seniority match, and location to rank opportunities. If I rebuilt it today, I'd add a proper queue system for the automation pipeline instead of sequential processing, and I'd use Server Actions instead of client-side Supabase calls for better security.

https://github.com/rickydlong/job-search-dashboard

### LLM experience:
I've been building LLM-integrated products hands-on. My job search platform uses Claude's API to power three core features: a scoring engine that evaluates job-candidate fit across multiple dimensions, a resume tailoring system that adapts content per role while preserving factual accuracy, and an outreach drafting system that generates personalized recruiter messages. I've worked through the real challenges — prompt engineering for consistent structured output, handling rate limits and token budgets, building evaluation loops that catch hallucinations before they reach production. I've also built agentic workflows that chain tool calls (web scraping, database writes, file generation) with LLM reasoning to automate multi-step processes end to end. My frontend background means I think about these systems from the user's perspective: latency, streaming responses, graceful degradation when the model returns unexpected output.

### Why Zeta Labs specifically:
Viktor solves the problem I've been building around: making AI actually do work inside the tools people already use, not in a separate chat window. Most AI startups build another interface. Viktor embeds directly in Slack and Teams and connects to the real systems — Salesforce, Stripe, QuickBooks — where the work lives. That's a fundamentally harder engineering problem (OAuth flows, schema mapping, error handling across thousands of integrations) and a fundamentally better product. I'm drawn to the agent runtime challenge specifically: turning a natural language request into a reliable sequence of real API calls with real consequences. I've been building exactly this kind of orchestration in my own projects, and I want to do it at the scale Viktor operates — 600K+ tool calls a day, with a small team that ships to production daily.

---

## Email Draft (find founder/engineer on LinkedIn)

**Subject:** Software Engineer Application — Viktor / Zeta Labs

Hi [Name],

I recently applied for the Software Engineer (Remote) position at Viktor and wanted to introduce myself.

I'm a frontend software engineer with 8+ years of experience, and I've been building LLM-integrated products that solve real problems — including a full-stack job search platform with AI-powered scoring, resume tailoring, and agentic automation pipelines. Viktor's approach to embedding AI directly in Slack and Teams, connecting to real business systems, resonates with exactly the kind of engineering I want to do at scale.

I'd love to learn more about the agent runtime architecture and how the team approaches integration reliability across thousands of tools. Would you be open to a brief conversation?

Best regards,
Ricky Long
318-237-1540
rickydlong@proton.me

---

**Action Items:**
- [ ] MANUAL: Resubmit application at URL above (copy answers from this doc)
- [ ] Search LinkedIn for Viktor/Zeta Labs founders or engineers
- [ ] Send connection request + personalized message
- [ ] Set May 7 follow-up reminder
