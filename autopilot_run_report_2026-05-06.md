# Autopilot Job Discovery - Run Report
**Date:** 2026-05-06
**Status:** Completed (API offline - results saved for manual ingest)

## Summary
- **Searches run:** 5
- **Total jobs found:** 50 (across all searches)
- **Unique jobs after dedup:** 20
- **Jobs scoring 40+:** 19
- **Jobs with full details fetched:** 5
- **Jobs saved for ingest:** 10

## Top 3 Matches

### 1. Front End Developer - LMI (Score: 91/100)
- **Salary:** $101,000 - $174,000/yr
- **Keywords matched:** 9/14 (react, typescript, javascript, redux, graphql, rest, css, git, ci/cd)
- **Why:** Government healthcare client. Strong React/TS/Redux/GraphQL match. Accessibility focus (WCAG). 5+ years required. Security clearance eligibility needed.
- **URL:** https://to.indeed.com/aawvdvwfqx6n

### 2. Staff Frontend Engineer - Vetcove (Score: 84/100)
- **Salary:** $170,000 - $230,000/yr
- **Keywords matched:** 6/14 (react, typescript, javascript, graphql, rest, git)
- **Why:** Y Combinator-backed veterinary SaaS. Lead frontend architecture. React + React Native, design systems. 8+ years required. Strong seniority match.
- **URL:** https://to.indeed.com/aarvd4pk4pbb

### 3. Staff Software Engineer - AI Website Builder - Luxury Presence (Score: 84/100)
- **Salary:** $200,000 - $250,000/yr
- **Keywords matched:** 6/14 (react, typescript, javascript, graphql, tailwind, node)
- **Why:** Series C proptech. React/Tailwind/GraphQL/Node. AI-focused platform. Leans backend but heavy frontend component. Top comp range.
- **URL:** https://to.indeed.com/aatprzjtkxdx

## Notable Findings
- **Mutual of Omaha (JOB_383)** closes May 8 - time-sensitive if interested, but lower keyword match (PHP-heavy)
- **Valiant Solutions (JOB_380)** - federal environmental client, React/TypeScript/Node, $115-132k. Solid fit.
- **Check (JOB_368)** - posted today, $141-155k. Generic "Software Engineer" title needs detail fetch to confirm frontend focus.

## Search Query Performance
| Query | Unique Results | Avg Score (40+) |
|-------|---------------|-----------------|
| Frontend Engineer React | 7 | 55 |
| React TypeScript Developer | 5 | 52 |
| Senior Frontend Engineer | 1 (mostly dupes) | 55 |
| Software Engineer React Next.js | 3 | 53 |
| UI Engineer TypeScript | 3 | 55 |

**Best producers:** "Frontend Engineer React" and "UI Engineer TypeScript" surfaced the most unique high-quality results.

## Pending Actions
- `autopilot_pending_ingest_2026-05-06.json` saved to workspace. Ingest when dashboard API is online.
- Consider fetching full details for JOB_368 (Check) and JOB_367 (Train With Ellie) - both have high comp and need description-level scoring.
